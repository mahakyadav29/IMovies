import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
        limit: 50,
      };

      const res = await bookingService.getAllBookings(params);
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="container py-4 flex-grow-1">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary gap-3">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none">
            <i className="bi bi-chevron-left me-1"></i> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0 mt-1">All System Bookings & Transactions</h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-3 mb-4 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter('all')}
          >
            All Bookings
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'confirmed' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'cancelled' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '350px' }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search Booking Reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-imovies-primary px-3">
            Search
          </button>
        </form>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchBookings} />}

      {loading ? (
        <LoadingSpinner message="Retrieving booking records..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="bi-ticket-detailed"
          title="No bookings match criteria"
          message="No customer booking records found matching your current filter or search."
        />
      ) : (
        <div className="imovies-card p-3 p-md-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small text-uppercase" style={{ fontSize: '0.75rem' }}>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Movie & Theatre</th>
                  <th>Show Details</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Payment Status</th>
                  <th>Booking Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderColor: 'var(--border-color)' }}>
                    <td className="font-monospace text-danger fw-semibold small">{b.bookingReference}</td>
                    <td>
                      <div className="text-white small fw-medium">{b.user?.name || 'Customer'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        {b.user?.email}
                      </div>
                    </td>
                    <td>
                      <div className="text-white small fw-medium">{b.movie?.title}</div>
                      <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>
                        {b.theatre?.name}
                      </div>
                    </td>
                    <td className="text-secondary small">
                      {formatDate(b.showDateSnapshot || b.show?.showDate)} • {b.startTimeSnapshot || b.show?.startTime}
                    </td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-secondary">
                        {b.selectedSeats?.join(', ')}
                      </span>
                    </td>
                    <td className="text-white small fw-bold">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-secondary small">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'confirmed' ? 'badge-confirmed' : 'badge-cancelled'
                        } small`}
                      >
                        {b.bookingStatus?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
