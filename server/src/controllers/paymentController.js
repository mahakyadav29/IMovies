const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @route   GET /api/payments/booking/:bookingId
// @desc    Get payment information for a specific booking
// @access  Private (Owner or Admin)
const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this booking.',
      });
    }

    if (req.user.role !== 'admin' && payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot view this payment record.',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentByBooking,
};
