import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [paymentFailedNotice, setPaymentFailedNotice] = useState(null);

  // If page was directly accessed without state, redirect to movies
  if (!state || !state.showId || !state.selectedSeats) {
    return (
      <div className="container py-5 text-center flex-grow-1">
        <h4 className="text-white mb-3">No Active Booking Session</h4>
        <p className="text-secondary mb-4">Please select a movie and seats to proceed to checkout.</p>
        <Link to="/" className="btn btn-imovies-primary">
          Browse Movies
        </Link>
      </div>
    );
  }

  const { showId, selectedSeats, show, selectedSeatObjects, subtotal } = state;

  const handleProcessPayment = async (outcome = 'success') => {
    setLoading(true);
    setPaymentFailedNotice(null);

    try {
      const res = await bookingService.createBooking({
        showId,
        selectedSeats,
        paymentMethod,
        paymentOutcome: outcome,
      });

      if (res.success && res.booking) {
        toast.success('Payment simulated successfully! Booking confirmed.');
        navigate(`/booking-confirmation/${res.booking._id}`, {
          state: { booking: res.booking },
        });
      }
    } catch (err) {
      console.error('[Checkout Error]', err);
      if (outcome === 'fail') {
        setPaymentFailedNotice(
          'Simulated Payment Declined: As requested by the test flow, this payment simulation failed. No seats have been booked, and no charge was processed.'
        );
        toast.error('Payment simulation failed (Simulated bank decline).');
      } else {
        toast.error(err.message || 'Booking submission failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 flex-grow-1">
      {/* College Project Disclaimer Banner */}
      <div
        className="alert alert-warning d-flex align-items-center mb-4 p-3 rounded-3"
        style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          color: '#fcd34d',
        }}
      >
        <i className="bi bi-shield-check fs-4 me-3 text-warning"></i>
        <div className="small">
          <strong>College Project Demonstration Notice:</strong> This payment step is completely simulated. No real
          financial transactions take place, and no real card numbers or banking data are required or charged.
        </div>
      </div>

      {paymentFailedNotice && (
        <div
          className="alert alert-danger d-flex align-items-center mb-4 p-3 rounded-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
          }}
        >
          <i className="bi bi-x-octagon-fill fs-4 me-3 text-danger"></i>
          <div>
            <strong>Simulated Payment Failed</strong>
            <div className="small mt-1">{paymentFailedNotice}</div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Payment Options */}
        <div className="col-12 col-lg-7">
          <div
            className="p-4 rounded-3 h-100"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <h5 className="text-white fw-bold mb-3">Choose Simulated Payment Method</h5>

            {/* Payment Method Tabs */}
            <div className="row g-2 mb-4">
              {[
                { id: 'card', label: 'Credit / Debit Card', icon: 'bi-credit-card' },
                { id: 'upi', label: 'UPI / QR', icon: 'bi-qr-code' },
                { id: 'netbanking', label: 'Net Banking', icon: 'bi-bank' },
                { id: 'wallet', label: 'Digital Wallet', icon: 'bi-wallet2' },
              ].map((m) => (
                <div key={m.id} className="col-6 col-sm-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`btn w-100 p-2 text-center rounded-3 d-flex flex-column align-items-center justify-content-center gap-1 ${
                      paymentMethod === m.id
                        ? 'btn-danger text-white'
                        : 'btn-dark text-secondary border border-secondary'
                    }`}
                    style={{ height: '80px' }}
                  >
                    <i className={`bi ${m.icon} fs-5`}></i>
                    <span style={{ fontSize: '0.72rem' }}>{m.label}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Simulated Payment Form Inputs */}
            {paymentMethod === 'card' && (
              <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <h6 className="text-white small fw-bold mb-3">Demo Card Information</h6>
                <div className="mb-3">
                  <label className="form-label small text-secondary">Card Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    defaultValue="4532 •••• •••• 8890"
                    disabled
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small text-secondary">Expiry</label>
                    <input type="text" className="form-control form-control-sm" defaultValue="12/28" disabled />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-secondary">CVV</label>
                    <input type="password" className="form-control form-control-sm" defaultValue="•••" disabled />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="p-3 rounded-3 mb-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <h6 className="text-white small fw-bold mb-2">Simulated UPI ID</h6>
                <p className="text-secondary small mb-3">demo-student@upi</p>
                <div className="p-3 d-inline-block bg-white rounded-3 mb-2">
                  <i className="bi bi-qr-code fs-1 text-dark"></i>
                </div>
                <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
                  Simulated QR Code for College Demonstration
                </p>
              </div>
            )}

            {/* Demonstration Action Buttons */}
            <div className="border-top border-secondary pt-4">
              <h6 className="text-white small fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Test Payment Outcomes
              </h6>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleProcessPayment('success')}
                  className="btn btn-success flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-check-circle-fill"></i>
                  )}
                  Simulate Payment Success
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleProcessPayment('fail')}
                  className="btn btn-outline-danger flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-x-circle-fill"></i>
                  Simulate Payment Failure
                </button>
              </div>
              <p className="text-secondary small mt-2 mb-0" style={{ fontSize: '0.72rem' }}>
                Clicking either button will demonstrate backend response handling, transactional integrity, and atomic seat reservation logic.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-12 col-lg-5">
          <div
            className="p-4 rounded-3"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary pb-2">Order Breakdown</h5>

            <div className="d-flex gap-3 mb-3">
              <img
                src={show?.movie?.posterUrl}
                alt={show?.movie?.title}
                className="rounded-2 object-fit-cover"
                style={{ width: '60px', height: '90px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h6 className="text-white fw-bold mb-1">{show?.movie?.title}</h6>
                <p className="text-secondary small mb-1">
                  <i className="bi bi-geo-alt text-danger me-1"></i> {show?.theatre?.name}
                </p>
                <p className="text-secondary small mb-0">
                  <i className="bi bi-calendar3 me-1"></i> {formatDate(show?.showDate)} • {show?.startTime}
                </p>
              </div>
            </div>

            <div className="border-top border-secondary pt-3 mb-3">
              <span className="text-secondary small d-block mb-1">Selected Seats:</span>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {selectedSeatObjects?.map((s) => (
                  <span key={s.seatNumber} className="badge bg-danger">
                    {s.seatNumber} ({s.type?.toUpperCase()} - {formatCurrency(s.price)})
                  </span>
                ))}
              </div>

              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>Tickets ({selectedSeats.length})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between small text-secondary mb-2">
                <span>Integrated Taxes & Charges</span>
                <span className="text-success">₹0.00</span>
              </div>
              <div className="d-flex justify-content-between text-white fw-bold fs-5 border-top border-secondary pt-2">
                <span>Payable Amount</span>
                <span className="text-danger">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
