/**
 * Generates an array of seats for a standard theatre hall layout
 * 6 rows (A to F), 10 columns (1 to 10) = 60 seats
 * Rows A-B: Silver
 * Rows C-D: Gold
 * Rows E-F: Platinum
 */
const generateDefaultSeats = (basePrice = 200) => {
  const rows = [
    { row: 'A', type: 'silver', priceMultiplier: 1.0 },
    { row: 'B', type: 'silver', priceMultiplier: 1.0 },
    { row: 'C', type: 'gold', priceMultiplier: 1.25 },
    { row: 'D', type: 'gold', priceMultiplier: 1.25 },
    { row: 'E', type: 'platinum', priceMultiplier: 1.5 },
    { row: 'F', type: 'platinum', priceMultiplier: 1.5 },
  ];

  const seats = [];

  rows.forEach((r) => {
    for (let col = 1; col <= 10; col++) {
      const seatNumber = `${r.row}${col}`;
      seats.push({
        seatNumber,
        row: r.row,
        col,
        type: r.type,
        price: Math.round(basePrice * r.priceMultiplier),
        isBooked: false,
        bookedBy: null,
        bookedAt: null,
      });
    }
  });

  return seats;
};

module.exports = { generateDefaultSeats };
