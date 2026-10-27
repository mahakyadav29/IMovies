import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { formatCurrency, formatDate } from '../utils/formatters';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking && id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getBookingById(id);
      setBooking(res.booking);
    } catch (err) {
      setError(err.message || 'Failed to fetch confirmed booking details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving your digital ticket..." />;
  if (error) return <div className="container py-4"><ErrorAlert message={error} onRetry={fetchBooking} /></div>;
  if (!booking) return null;

  return (
    <div className="container py-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {/* Success Banner */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '2px solid #22c55e',
              }}
            >
              <i className="bi bi-check-lg fs-1 text-success"></i>
            </div>
            <h3 className="text-white fw-bold mb-1">Booking Confirmed!</h3>
            <p className="text-secondary small mb-0">Your tickets have been confirmed and sent to your email.</p>
          </div>

          {/* Cinematic Digital Ticket Card */}
          <div className="ticket-container p-4 p-md-5 mb-4 shadow-lg">
            {/* Top Header of Ticket */}
            <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-3">
              <div>
                <span className="text-secondary small text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Booking Reference
                </span>
                <h5 className="text-danger fw-bold mb-0">{booking.bookingReference}</h5>
              </div>
              <span className="badge badge-confirmed px-3 py-2 fw-semibold">CONFIRMED</span>
            </div>

            {/* Movie and Theatre Info */}
            <div className="mb-4">
              <h4 className="text-white fw-bold mb-2">{booking.movie?.title}</h4>
              <p className="text-secondary small mb-1">
                <i className="bi bi-geo-alt text-danger me-1"></i>
                {booking.theatre?.name} ({booking.theatre?.location || 'Main Auditorium'})
              </p>
              <div className="d-flex flex-wrap gap-3 small text-secondary mt-2">
                <div>
                  <strong className="text-white d-block">Show Date:</strong>
                  <span>{formatDate(booking.showDateSnapshot || booking.show?.showDate)}</span>
                </div>
                <div>
                  <strong className="text-white d-block">Time:</strong>
                  <span>{booking.startTimeSnapshot || booking.show?.startTime}</span>
                </div>
                <div>
                  <strong className="text-white d-block">Seats ({booking.selectedSeats?.length}):</strong>
                  <span className="text-danger fw-bold">{booking.selectedSeats?.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Simulated Payment Receipt Info */}
            <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>Transaction Ref:</span>
                <span className="text-white font-monospace">
                  {booking.paymentId?.transactionReference || booking.payment?.transactionReference || 'TXN-SIM-VERIFIED'}
                </span>
              </div>
              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>Payment Status:</span>
                <span className="text-success fw-medium">Paid (Simulated)</span>
              </div>
              <div className="d-flex justify-content-between text-white fw-bold border-top border-secondary pt-2 mt-2">
                <span>Total Amount Paid:</span>
                <span className="text-danger fs-6">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>

            {/* Simulated Barcode / QR Section */}
            <div className="text-center pt-2">
              <div
                className="d-inline-flex flex-column align-items-center justify-content-center p-2 rounded-2 bg-white"
                style={{ width: '120px', height: '120px' }}
              >
                <i className="bi bi-qr-code fs-1 text-dark"></i>
                <span className="small text-dark font-monospace" style={{ fontSize: '0.6rem' }}>
                  SCAN AT GATE
                </span>
              </div>
              <p className="text-muted small mt-2 mb-0" style={{ fontSize: '0.72rem' }}>
                Present this simulated digital ticket at the theatre entrance.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-imovies-outline flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-printer"></i>
              Print / Save Ticket
            </button>
            <Link
              to="/bookings"
              className="btn btn-imovies-primary flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-ticket-detailed"></i>
              View in Booking History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
