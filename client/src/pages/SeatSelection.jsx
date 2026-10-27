import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showService } from '../services/showService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { socket, joinShow, leaveShow } = useSocket();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShowData();

    // Join real-time socket room for this show
    joinShow(showId);

    // Listen for seat updates from other users
    if (socket) {
      socket.on('seats_updated', handleRemoteSeatsUpdate);
    }

    return () => {
      leaveShow(showId);
      if (socket) {
        socket.off('seats_updated', handleRemoteSeatsUpdate);
      }
    };
  }, [showId, socket]);

  const handleRemoteSeatsUpdate = (data) => {
    if (data.showId === showId && data.updatedSeats) {
      setSeats((prevSeats) =>
        prevSeats.map((seat) => {
          const match = data.updatedSeats.find((u) => u.seatNumber === seat.seatNumber);
          return match ? { ...seat, isBooked: match.isBooked } : seat;
        })
      );

      // If user had one of the concurrently booked seats selected, remove it & notify
      if (data.bookedSeats) {
        setSelectedSeats((prevSelected) => {
          const conflicts = prevSelected.filter((s) => data.bookedSeats.includes(s));
          if (conflicts.length > 0) {
            toast.warn(`Seats (${conflicts.join(', ')}) were just booked by another user.`);
            return prevSelected.filter((s) => !data.bookedSeats.includes(s));
          }
          return prevSelected;
        });
      }
    }
  };

  const fetchShowData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await showService.getShowById(showId);
      setShow(res.show);
      setSeats(res.seats || []);
    } catch (err) {
      setError(err.message || 'Failed to load show seat map.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  // Calculate pricing summary for selected seats
  const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(s.seatNumber));
  const subtotal = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat to proceed.');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Please sign in or register to complete your booking.');
      navigate('/login', { state: { from: { pathname: `/show/${showId}/seats` } } });
      return;
    }

    // Navigate to checkout with show and selected seats payload
    navigate('/checkout', {
      state: {
        showId,
        selectedSeats,
        show,
        selectedSeatObjects,
        subtotal,
      },
    });
  };

  if (loading) return <LoadingSpinner message="Generating real-time seat layout..." />;
  if (error) return <div className="container py-4"><ErrorAlert message={error} onRetry={fetchShowData} /></div>;
  if (!show) return null;

  return (
    <div className="container py-4 flex-grow-1">
      {/* Show Header Summary */}
      <div
        className="p-3 mb-4 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div>
          <Link to={`/movie/${show.movie?._id}`} className="text-secondary small text-decoration-none">
            <i className="bi bi-chevron-left me-1"></i> Back to Movie Details
          </Link>
          <h4 className="text-white fw-bold mb-1 mt-1">{show.movie?.title}</h4>
          <div className="d-flex flex-wrap align-items-center gap-2 text-secondary small">
            <span>
              <i className="bi bi-geo-alt text-danger me-1"></i>
              {show.theatre?.name}
            </span>
            <span>•</span>
            <span>
              <i className="bi bi-calendar3 me-1"></i>
              {formatDate(show.showDate)}
            </span>
            <span>•</span>
            <span className="badge bg-danger">{show.startTime}</span>
            <span>•</span>
            <span>{show.screenName}</span>
          </div>
        </div>

        <div className="text-end d-none d-md-block">
          <span className="badge bg-dark border border-secondary text-secondary">
            <i className="bi bi-broadcast text-success me-1"></i> Live Availability
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Visual Seat Map */}
        <div className="col-12 col-lg-8">
          <SeatMap seats={seats} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />
        </div>

        {/* Right Column: Selection Summary & Checkout Trigger */}
        <div className="col-12 col-lg-4">
          <div
            className="p-4 rounded-3 position-sticky"
            style={{
              top: '80px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary pb-2">Booking Summary</h5>

            {selectedSeats.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                <i className="bi bi-hand-index-thumb fs-2 text-secondary mb-2 d-block"></i>
                <p className="small mb-0">Click on available seats on the map to begin your booking.</p>
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-secondary small">Selected Seats ({selectedSeats.length}):</span>
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0 small text-decoration-none"
                      onClick={() => setSelectedSeats([])}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeats.map((seatNum) => {
                      const s = seats.find((st) => st.seatNumber === seatNum);
                      return (
                        <span key={seatNum} className="badge bg-danger px-2 py-1">
                          {seatNum} ({s ? formatCurrency(s.price) : ''})
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="border-top border-secondary pt-3 mb-4">
                  <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Ticket Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Convenience Fee (Simulated)</span>
                    <span className="text-success">FREE</span>
                  </div>
                  <div className="d-flex justify-content-between text-white fw-bold fs-5 border-top border-secondary pt-2">
                    <span>Total Amount</span>
                    <span className="text-danger">{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="btn btn-imovies-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-credit-card-2-front"></i>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
