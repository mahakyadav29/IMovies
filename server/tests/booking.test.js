const test = require('node:test');
const assert = require('node:assert/strict');
const { generateDefaultSeats } = require('../src/utils/seatGenerator');

test('Booking Logic - Atomic Concurrency Simulation', () => {
  // Simulate show seats state in memory to test double-booking protection algorithm
  const seats = generateDefaultSeats(250);

  // Function simulating atomic booking update matching MongoDB's $not + $elemMatch logic
  const attemptAtomicBooking = (requestedSeats, userId) => {
    // Check if ANY requested seat is already booked
    const conflict = seats.some((s) => requestedSeats.includes(s.seatNumber) && s.isBooked);
    if (conflict) {
      return { success: false, conflict: true };
    }

    // Atomically mark seats as booked
    seats.forEach((s) => {
      if (requestedSeats.includes(s.seatNumber)) {
        s.isBooked = true;
        s.bookedBy = userId;
        s.bookedAt = new Date();
      }
    });

    return { success: true, conflict: false };
  };

  // User 1 attempts to book seats ['B5', 'B6']
  const user1Result = attemptAtomicBooking(['B5', 'B6'], 'user1_id');
  assert.equal(user1Result.success, true, 'User 1 booking should succeed');
  assert.equal(user1Result.conflict, false);

  // User 2 simultaneously attempts to book seats ['B6', 'B7'] (overlapping on 'B6')
  const user2Result = attemptAtomicBooking(['B6', 'B7'], 'user2_id');
  assert.equal(user2Result.success, false, 'User 2 booking must fail due to seat B6 conflict');
  assert.equal(user2Result.conflict, true);

  // Verify seat 'B7' was NOT marked as booked because the whole transaction failed
  const seatB7 = seats.find((s) => s.seatNumber === 'B7');
  assert.equal(seatB7.isBooked, false, 'Seat B7 must remain available after failed atomic attempt');
});

test('Booking Logic - Simulated Payment Outcome Handling', () => {
  const seats = generateDefaultSeats(200);

  const processSimulatedBooking = (paymentOutcome, requestedSeats) => {
    if (paymentOutcome === 'fail') {
      return {
        bookingCreated: false,
        paymentStatus: 'failed',
        seatsBooked: false,
      };
    }

    // Success outcome
    requestedSeats.forEach((seatNum) => {
      const s = seats.find((seat) => seat.seatNumber === seatNum);
      if (s) s.isBooked = true;
    });

    return {
      bookingCreated: true,
      paymentStatus: 'paid',
      seatsBooked: true,
    };
  };

  // 1. Failed payment simulation
  const failedResult = processSimulatedBooking('fail', ['C1', 'C2']);
  assert.equal(failedResult.bookingCreated, false, 'Failed payment must not produce confirmed booking');
  assert.equal(failedResult.paymentStatus, 'failed');
  assert.equal(seats.find((s) => s.seatNumber === 'C1').isBooked, false, 'Seat C1 must not be booked on failure');

  // 2. Successful payment simulation
  const successResult = processSimulatedBooking('success', ['C1', 'C2']);
  assert.equal(successResult.bookingCreated, true, 'Successful payment must create confirmed booking');
  assert.equal(successResult.paymentStatus, 'paid');
  assert.equal(seats.find((s) => s.seatNumber === 'C1').isBooked, true, 'Seat C1 must be marked as booked');
});

test('Booking Logic - Cancellation Eligibility and Seat Release', () => {
  const seats = generateDefaultSeats(200);
  // Pre-book seats D1 and D2
  seats.find((s) => s.seatNumber === 'D1').isBooked = true;
  seats.find((s) => s.seatNumber === 'D2').isBooked = true;

  const cancelBookingPolicy = (booking, currentDateStr) => {
    if (booking.status === 'cancelled') {
      return { allowed: false, message: 'Already cancelled' };
    }
    if (booking.showDate < currentDateStr) {
      return { allowed: false, message: 'Past show cannot be cancelled' };
    }

    // Release seats
    booking.seats.forEach((seatNum) => {
      const s = seats.find((seat) => seat.seatNumber === seatNum);
      if (s) {
        s.isBooked = false;
        s.bookedBy = null;
      }
    });

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded_simulated';
    return { allowed: true, booking };
  };

  const activeBooking = {
    id: 'booking_1',
    showDate: '2026-10-28',
    status: 'confirmed',
    paymentStatus: 'paid',
    seats: ['D1', 'D2'],
  };

  // Cancel future booking on 2026-10-26
  const cancelResult = cancelBookingPolicy(activeBooking, '2026-10-26');
  assert.equal(cancelResult.allowed, true, 'Cancellation of future show should be allowed');
  assert.equal(cancelResult.booking.status, 'cancelled');
  assert.equal(cancelResult.booking.paymentStatus, 'refunded_simulated');

  // Verify seats were released
  assert.equal(seats.find((s) => s.seatNumber === 'D1').isBooked, false, 'Seat D1 must be released');
  assert.equal(seats.find((s) => s.seatNumber === 'D2').isBooked, false, 'Seat D2 must be released');

  // Attempt repeat cancellation
  const repeatCancel = cancelBookingPolicy(activeBooking, '2026-10-26');
  assert.equal(repeatCancel.allowed, false, 'Repeat cancellation must be rejected');
});
