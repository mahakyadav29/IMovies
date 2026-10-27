const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Authenticated customer/admin routes
router.post('/', verifyToken, createBooking);
router.get('/my', verifyToken, getMyBookings);
router.get('/:id', verifyToken, getBookingById);
router.post('/:id/cancel', verifyToken, cancelBooking);

// Admin-only route to list all bookings
router.get('/', verifyToken, requireAdmin, getAllBookings);

module.exports = router;
