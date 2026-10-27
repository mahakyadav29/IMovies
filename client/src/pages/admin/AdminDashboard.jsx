import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data.stats);
      setRecentBookings(data.recentBookings || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading administrator analytics..." />;
  if (error) return <div className="container py-4"><ErrorAlert message={error} onRetry={fetchStats} /></div>;

  return (
    <div className="container py-4 flex-grow-1">
      {/* Admin Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning text-dark fw-bold">ADMIN CONSOLE</span>
            <span className="text-secondary small">IMovies Management Suite</span>
          </div>
          <h2 className="text-white fw-bold mb-0">System Overview & Statistics</h2>
        </div>

        {/* Quick Management Navigation Buttons */}
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/movies" className="btn btn-sm btn-imovies-outline">
            <i className="bi bi-film me-1"></i> Manage Movies
          </Link>
          <Link to="/admin/theatres" className="btn btn-sm btn-imovies-outline">
            <i className="bi bi-geo-alt me-1"></i> Manage Theatres
          </Link>
          <Link to="/admin/shows" className="btn btn-sm btn-imovies-outline">
            <i className="bi bi-calendar-event me-1"></i> Manage Shows
          </Link>
          <Link to="/admin/bookings" className="btn btn-sm btn-imovies-outline">
            <i className="bi bi-ticket-detailed me-1"></i> All Bookings
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="imovies-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">SIMULATED REVENUE</span>
              <i className="bi bi-cash-stack text-success fs-5"></i>
            </div>
            <h3 className="text-white fw-bold mb-1">{formatCurrency(stats?.totalRevenue || 0)}</h3>
            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
              From confirmed paid bookings
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="imovies-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">TOTAL BOOKINGS</span>
              <i className="bi bi-ticket-perforated-fill text-danger fs-5"></i>
            </div>
            <h3 className="text-white fw-bold mb-1">{stats?.totalBookings || 0}</h3>
            <span className="text-success small" style={{ fontSize: '0.72rem' }}>
              {stats?.confirmedBookingsCount || 0} Confirmed • {stats?.cancelledBookingsCount || 0} Cancelled
            </span>
          </div>
        </div>

        {/* Active Movies */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="imovies-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">CATALOG MOVIES</span>
              <i className="bi bi-film text-info fs-5"></i>
            </div>
            <h3 className="text-white fw-bold mb-1">{stats?.totalMovies || 0}</h3>
            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
              {stats?.nowShowingCount || 0} Now Showing • {stats?.comingSoonCount || 0} Coming Soon
            </span>
          </div>
        </div>

        {/* Active Shows & Theatres */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="imovies-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold">SHOWS & SCREENS</span>
              <i className="bi bi-projector text-warning fs-5"></i>
            </div>
            <h3 className="text-white fw-bold mb-1">{stats?.totalShows || 0}</h3>
            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
              Across {stats?.totalTheatres || 0} multiplex locations
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="imovies-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
          <h5 className="text-white fw-bold mb-0">Recent Customer Bookings</h5>
          <Link to="/admin/bookings" className="text-danger small text-decoration-none fw-semibold">
            View All Bookings <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-secondary small text-center my-4">No recent bookings recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr className="text-secondary small text-uppercase" style={{ fontSize: '0.75rem' }}>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id} style={{ borderColor: 'var(--border-color)' }}>
                    <td className="font-monospace text-danger fw-semibold">{b.bookingReference}</td>
                    <td>
                      <div className="fw-medium text-white small">{b.user?.name || 'Customer'}</div>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        {b.user?.email}
                      </div>
                    </td>
                    <td className="text-white small fw-medium">{b.movie?.title}</td>
                    <td className="text-secondary small">{b.theatre?.name}</td>
                    <td>
                      <span className="badge bg-dark border border-secondary text-secondary">
                        {b.selectedSeats?.join(', ')}
                      </span>
                    </td>
                    <td className="fw-semibold text-white small">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'confirmed' ? 'badge-confirmed' : 'badge-cancelled'
                        } small`}
                      >
                        {b.bookingStatus?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-secondary small">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
