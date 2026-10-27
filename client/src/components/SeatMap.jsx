import React from 'react';
import { formatCurrency } from '../utils/formatters';

const SeatMap = ({ seats = [], selectedSeats = [], onSeatClick, maxSeats = 8 }) => {
  // Group seats by row
  const rowsMap = new Map();
  seats.forEach((seat) => {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, []);
    }
    rowsMap.get(seat.row).push(seat);
  });

  const sortedRows = Array.from(rowsMap.keys()).sort();

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    const isAlreadySelected = selectedSeats.includes(seat.seatNumber);
    if (!isAlreadySelected && selectedSeats.length >= maxSeats) {
      alert(`You can select a maximum of ${maxSeats} seats per booking.`);
      return;
    }

    onSeatClick(seat.seatNumber);
  };

  return (
    <div className="seat-map-wrapper p-3 p-md-4 rounded-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      {/* Cinema Screen Projection */}
      <div className="text-center mb-4">
        <div className="screen-label">Cinema Screen This Way</div>
        <div className="screen-curve"></div>
      </div>

      {/* Seat Layout Rows */}
      <div className="d-flex flex-column align-items-center gap-2 overflow-x-auto py-2">
        {sortedRows.map((rowName) => {
          const rowSeats = rowsMap.get(rowName).sort((a, b) => a.col - b.col);
          const rowType = rowSeats[0]?.type || 'silver';

          return (
            <div key={rowName} className="d-flex align-items-center gap-2 w-100 justify-content-center">
              {/* Row Label (Left) */}
              <span
                className="text-secondary fw-bold text-center"
                style={{ width: '24px', fontSize: '0.8rem' }}
              >
                {rowName}
              </span>

              {/* Seats in Row */}
              <div className="d-flex align-items-center gap-1 gap-md-2">
                {rowSeats.map((seat, idx) => {
                  const isSelected = selectedSeats.includes(seat.seatNumber);
                  const isBooked = seat.isBooked;

                  return (
                    <React.Fragment key={seat.seatNumber}>
                      {/* Add aisle gap between column 5 and 6 */}
                      {idx === 5 && <div style={{ width: '18px' }}></div>}

                      <button
                        type="button"
                        onClick={() => handleSeatClick(seat)}
                        disabled={isBooked}
                        className={`seat-button ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        title={`${seat.seatNumber} (${seat.type.toUpperCase()}) - ${formatCurrency(seat.price)} ${isBooked ? '[Booked]' : ''}`}
                      >
                        {seat.col}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Row Label (Right) */}
              <span
                className="text-secondary fw-bold text-center"
                style={{ width: '24px', fontSize: '0.8rem' }}
              >
                {rowName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend and Tiers */}
      <div className="mt-4 pt-3 border-top border-secondary d-flex flex-wrap align-items-center justify-content-center gap-3 gap-md-4 text-secondary small">
        <div className="d-flex align-items-center gap-2">
          <span className="seat-button" style={{ width: '22px', height: '22px' }}></span>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-button selected" style={{ width: '22px', height: '22px' }}></span>
          <span className="text-white fw-medium">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="seat-button booked" style={{ width: '22px', height: '22px' }}></span>
          <span>Booked</span>
        </div>

        <div className="d-none d-md-flex align-items-center gap-2 border-start border-secondary ps-3">
          <span className="badge tier-tag-silver">Silver (A-B)</span>
          <span className="badge tier-tag-gold">Gold (C-D)</span>
          <span className="badge tier-tag-platinum">Platinum (E-F)</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
