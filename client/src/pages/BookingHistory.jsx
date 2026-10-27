import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;

    setCancelLoading(true);
    try {
      const res = await bookingService.cancelBooking(cancellingBooking._id, 'Cancelled via web portal');
      if (res.success) {
        toast.success(`Booking ${cancellingBooking.bookingReference} cancelled successfully. Seats released!`);
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === cancellingBooking._id
              ? { ...b, bookingStatus: 'cancelled', paymentStatus: 'refunded_simulated' }
              : b
          )
        );
        setCancellingBooking(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const isEligibleForCancellation = (booking) => {
    if (booking.bookingStatus === 'cancelled') return false;
    const showDate = booking.showDateSnapshot || booking.show?.showDate;
    if (!showDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return showDate >= today;
  };

  if (loading) return <LoadingSpinner message="Fetching your bookings..." />;
  if (error) return <div className="container py-4"><ErrorAlert message={error} onRetry={fetchBookings} /></div>;

  return (
    <div className="container py-4 flex-grow-1">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
        <div>
          <h2 className="text-white fw-bold mb-1">My Booking History</h2>
          <p className="text-secondary small mb-0">View your active tickets, completed shows, and simulated receipts</p>
        </div>
        <Link to="/" className="btn btn-sm btn-imovies-primary">
          <i className="bi bi-plus-circle me-1"></i> Book New Movie
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon="bi-ticket-perforated"
          title="No bookings found"
          message="You haven't made any movie bookings yet. Explore our latest releases and book your first tickets today!"
          actionText="Browse Movies"
          actionLink="/"
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((b) => {
            const isCancelled = b.bookingStatus === 'cancelled';
            const eligible = isEligibleForCancellation(b);

            return (
              <div
                key={b._id}
                className="imovies-card p-3 p-md-4"
                style={{
                  borderLeft: isCancelled ? '4px solid #ef4444' : '4px solid #22c55e',
                }}
              >
                <div className="row align-items-center gy-3">
                  {/* Poster Thumbnail */}
                  <div className="col-4 col-sm-3 col-md-2 text-center text-sm-start">
                    <img
                      src={b.movie?.posterUrl}
                      alt={b.movie?.title}
                      className="rounded-2 object-fit-cover w-100 shadow-sm"
                      style={{ aspectRatio: '2/3', maxHeight: '140px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="col-8 col-sm-9 col-md-7">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="text-danger fw-bold font-monospace small">{b.bookingReference}</span>
                      <span className={`badge ${isCancelled ? 'badge-cancelled' : 'badge-confirmed'} small`}>
                        {isCancelled ? 'CANCELLED' : 'CONFIRMED'}
                      </span>
                    </div>

                    <h5 className="text-white fw-bold mb-1">{b.movie?.title}</h5>
                    <p className="text-secondary small mb-2">
                      <i className="bi bi-geo-alt text-danger me-1"></i>
                      {b.theatre?.name} ({b.theatre?.location})
                    </p>

                    <div className="d-flex flex-wrap gap-3 small text-secondary">
                      <div>
                        <strong className="text-white d-block">Show Date:</strong>
                        <span>{formatDate(b.showDateSnapshot || b.show?.showDate)}</span>
                      </div>
                      <div>
                        <strong className="text-white d-block">Time:</strong>
                        <span>{b.startTimeSnapshot || b.show?.startTime}</span>
                      </div>
                      <div>
                        <strong className="text-white d-block">Seats:</strong>
                        <span className="text-danger fw-bold">{b.selectedSeats?.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="col-12 col-md-3 text-md-end border-top border-secondary pt-3 pt-md-0 border-md-top-0">
                    <div className="mb-2">
                      <span className="text-secondary small d-block">Total Paid</span>
                      <span className="fs-5 fw-bold text-white">{formatCurrency(b.totalAmount)}</span>
                      <span className="d-block small text-muted" style={{ fontSize: '0.7rem' }}>
                        {isCancelled ? 'Simulated Refund Processed' : 'Simulated Payment'}
                      </span>
                    </div>

                    <div className="d-flex flex-md-column gap-2 justify-content-end">
                      <Link
                        to={`/booking-confirmation/${b._id}`}
                        className="btn btn-sm btn-imovies-outline flex-grow-1"
                      >
                        <i className="bi bi-ticket-perforated me-1"></i> View Ticket
                      </Link>

                      {eligible && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger flex-grow-1"
                          onClick={() => setCancellingBooking(b)}
                        >
                          <i className="bi bi-x-circle me-1"></i> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">Confirm Booking Cancellation</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCancellingBooking(null)}
                ></button>
              </div>

              <div className="modal-body">
                <p className="mb-2">
                  Are you sure you want to cancel booking{' '}
                  <strong className="text-danger">{cancellingBooking.bookingReference}</strong> for{' '}
                  <strong>{cancellingBooking.movie?.title}</strong>?
                </p>

                <div className="p-3 rounded-2 small text-secondary mb-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <div>
                    <strong>Seats to be released:</strong> {cancellingBooking.selectedSeats?.join(', ')}
                  </div>
                  <div>
                    <strong>Simulated Refund Amount:</strong> {formatCurrency(cancellingBooking.totalAmount)}
                  </div>
                </div>

                <div className="small text-muted">
                  <i className="bi bi-info-circle me-1 text-warning"></i>
                  Cancellation Policy: Seats are released immediately back into the pool for other customers. Simulated
                  refund is recorded in the system.
                </div>
              </div>

              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCancellingBooking(null)}
                  disabled={cancelLoading}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
