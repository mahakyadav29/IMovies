const express = require('express');
const router = express.Router();
const { getPaymentByBooking } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

router.get('/booking/:bookingId', verifyToken, getPaymentByBooking);

module.exports = router;
