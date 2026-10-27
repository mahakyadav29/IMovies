const test = require('node:test');
const assert = require('node:assert/strict');
const { generateDefaultSeats } = require('../src/utils/seatGenerator');

test('Seat Generator - Layout Structure', () => {
  const basePrice = 200;
  const seats = generateDefaultSeats(basePrice);

  // Total seat count must be 60 (6 rows * 10 columns)
  assert.equal(seats.length, 60, 'Should generate exactly 60 seats');

  // Verify unique seat numbers
  const seatNumbers = new Set(seats.map((s) => s.seatNumber));
  assert.equal(seatNumbers.size, 60, 'All 60 seat numbers must be unique');

  // Verify rows A through F
  const validRows = ['A', 'B', 'C', 'D', 'E', 'F'];
  seats.forEach((seat) => {
    assert.ok(validRows.includes(seat.row), `Row ${seat.row} must be between A and F`);
    assert.ok(seat.col >= 1 && seat.col <= 10, `Col ${seat.col} must be between 1 and 10`);
    assert.equal(seat.isBooked, false, 'Seat must be initially unbooked');
    assert.equal(seat.bookedBy, null, 'Seat must have no initial bookedBy user');
  });
});

test('Seat Generator - Pricing and Tiers', () => {
  const basePrice = 200;
  const seats = generateDefaultSeats(basePrice);

  // Rows A and B should be Silver tier at basePrice (200)
  const silverSeats = seats.filter((s) => s.row === 'A' || s.row === 'B');
  assert.equal(silverSeats.length, 20, 'Silver seats count must be 20');
  silverSeats.forEach((s) => {
    assert.equal(s.type, 'silver');
    assert.equal(s.price, 200);
  });

  // Rows C and D should be Gold tier at 1.25x basePrice (250)
  const goldSeats = seats.filter((s) => s.row === 'C' || s.row === 'D');
  assert.equal(goldSeats.length, 20, 'Gold seats count must be 20');
  goldSeats.forEach((s) => {
    assert.equal(s.type, 'gold');
    assert.equal(s.price, 250);
  });

  // Rows E and F should be Platinum tier at 1.5x basePrice (300)
  const platinumSeats = seats.filter((s) => s.row === 'E' || s.row === 'F');
  assert.equal(platinumSeats.length, 20, 'Platinum seats count must be 20');
  platinumSeats.forEach((s) => {
    assert.equal(s.type, 'platinum');
    assert.equal(s.price, 300);
  });
});
