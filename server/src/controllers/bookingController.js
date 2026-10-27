const crypto = require('crypto');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { notifySeatsUpdated } = require('../services/socketService');

// Helper to generate unique booking reference (e.g. IM-9842-AB12)
const generateBookingReference = () => {
  const timestampPart = Date.now().toString().slice(-4);
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `IM-${timestampPart}-${randomHex}`;
};

// Helper to generate simulated transaction reference
const generateTransactionReference = () => {
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `TXN-SIM-${randomNum}`;
};

// @route   POST /api/bookings
// @desc    Create a new booking with simulated payment processing and atomic seat verification
// @access  Private (Customer & Admin)
const createBooking = async (req, res, next) => {
  try {
    const {
      showId,
      selectedSeats, // Array of seatNumber strings, e.g. ['A1', 'A2']
      paymentMethod = 'card',
      paymentOutcome = 'success', // 'success' or 'fail' (for simulation)
    } = req.body;

    // 1. Validate input
    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid showId and at least one selected seat.',
      });
    }

    // 2. Fetch show and check existence
    const show = await Show.findById(showId)
      .populate('movie', 'title posterUrl duration language genre')
      .populate('theatre', 'name location address');

    if (!show || !show.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Show not found or is no longer active.',
      });
    }

    // 3. Verify all selected seats exist in the show layout
    const showSeatsMap = new Map();
    show.seats.forEach((s) => showSeatsMap.set(s.seatNumber, s));

    const invalidSeats = selectedSeats.filter((seatNum) => !showSeatsMap.has(seatNum));
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seat(s) requested: ${invalidSeats.join(', ')}`,
      });
    }

    // 4. Calculate total price and seat details
    let totalAmount = 0;
    const seatDetails = [];
    for (const seatNum of selectedSeats) {
      const s = showSeatsMap.get(seatNum);
      totalAmount += s.price;
      seatDetails.push({
        seatNumber: s.seatNumber,
        type: s.type,
        price: s.price,
      });
    }

    // 5. Handle Simulated Payment Failure Scenario
    if (paymentOutcome === 'fail') {
      const failedTxnRef = generateTransactionReference();
      const failedBookingRef = generateBookingReference();

      // Record a failed payment attempt log
      await Notification.create({
        user: req.user._id,
        title: 'Payment Failed',
        message: `Your simulated payment of Rs. ${totalAmount} for ${show.movie.title} failed. No seats have been booked.`,
        type: 'payment_failed',
      });

      return res.status(402).json({
        success: false,
        message: 'Payment simulation failed. Your payment was declined by the simulated bank.',
        transactionReference: failedTxnRef,
        bookingStatus: 'unbooked',
      });
    }

    // 6. ATOMIC SEAT BOOKING
    // Uses findOneAndUpdate with an atomic condition ensuring NONE of the selected seats is already booked
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        isActive: true,
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: selectedSeats },
              isBooked: true,
            },
          },
        },
      },
      {
        $set: {
          'seats.$[elem].isBooked': true,
          'seats.$[elem].bookedBy': req.user._id,
          'seats.$[elem].bookedAt': new Date(),
        },
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: selectedSeats } }],
        new: true,
      }
    );

    // If updatedShow is null, it means at least one seat was ALREADY booked concurrently!
    if (!updatedShow) {
      return res.status(409).json({
        success: false,
        message: 'Booking conflict: One or more selected seats have already been booked by another user. Please choose different seats.',
      });
    }

    // 7. Create Payment Record (Simulated)
    const bookingReference = generateBookingReference();
    const transactionReference = generateTransactionReference();

    const payment = await Payment.create({
      booking: null, // Will update with booking id below
      user: req.user._id,
      amount: totalAmount,
      method: paymentMethod,
      transactionReference,
      status: 'success',
      simulationNote: 'College demo simulated payment. No real money was charged.',
    });

    // 8. Create Confirmed Booking Record
    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      selectedSeats,
      seatDetails,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentId: payment._id,
      showDateSnapshot: show.showDate,
      startTimeSnapshot: show.startTime,
    });

    // Link payment to booking
    payment.booking = booking._id;
    await payment.save();

    // 9. Create in-app Notification
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your booking ${bookingReference} for ${show.movie.title} (${selectedSeats.join(', ')}) has been confirmed!`,
      type: 'booking_confirmed',
    });

    // 10. Broadcast real-time seat update via Socket.IO
    notifySeatsUpdated(show._id.toString(), {
      updatedSeats: updatedShow.seats.map((s) => ({
        seatNumber: s.seatNumber,
        isBooked: s.isBooked,
      })),
      bookedSeats: selectedSeats,
    });

    res.status(201).json({
      success: true,
      message: 'Booking completed successfully!',
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        movie: show.movie,
        theatre: show.theatre,
        showDate: booking.showDateSnapshot,
        startTime: booking.startTimeSnapshot,
        selectedSeats: booking.selectedSeats,
        seatDetails: booking.seatDetails,
        totalAmount: booking.totalAmount,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        payment: {
          transactionReference: payment.transactionReference,
          method: payment.method,
          amount: payment.amount,
          status: payment.status,
        },
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/bookings/my
// @desc    Get logged in user's booking history
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl duration language genre')
      .populate('theatre', 'name location address')
      .populate('paymentId', 'transactionReference method status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID (must belong to user or user is admin)
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie', 'title posterUrl duration language genre')
      .populate('theatre', 'name location address')
      .populate('paymentId', 'transactionReference method status amount simulationNote')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Permission check: customer can only see own booking
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel an eligible booking and atomically release its seats
// @access  Private (Owner or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by customer' } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('movie', 'title')
      .populate('theatre', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Permission check
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only cancel your own bookings.',
      });
    }

    // Prevent repeated cancellation
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    // Cancellation Policy Check:
    // Disallow cancellation if the show has already started/passed
    const show = await Show.findById(booking.show);
    if (show) {
      const showDate = show.showDate; // YYYY-MM-DD
      const todayDate = new Date().toISOString().split('T')[0];
      if (showDate < todayDate) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation policy: Past shows cannot be cancelled.',
        });
      }
    }

    // 1. Atomically release seats in Show
    if (show) {
      const updatedShow = await Show.findOneAndUpdate(
        { _id: booking.show },
        {
          $set: {
            'seats.$[elem].isBooked': false,
            'seats.$[elem].bookedBy': null,
            'seats.$[elem].bookedAt': null,
          },
        },
        {
          arrayFilters: [{ 'elem.seatNumber': { $in: booking.selectedSeats } }],
          new: true,
        }
      );

      // Broadcast Socket.IO update so other users immediately see seats free
      if (updatedShow) {
        notifySeatsUpdated(show._id.toString(), {
          updatedSeats: updatedShow.seats.map((s) => ({
            seatNumber: s.seatNumber,
            isBooked: s.isBooked,
          })),
          releasedSeats: booking.selectedSeats,
        });
      }
    }

    // 2. Update booking record
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded_simulated';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    await booking.save();

    // 3. Create notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingReference} for ${booking.movie?.title || 'movie'} has been cancelled. Simulated refund of Rs. ${booking.totalAmount} processed.`,
      type: 'booking_cancelled',
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/bookings (Admin only)
// @desc    Get all bookings with pagination and filters
// @access  Admin only
const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.bookingStatus = status;
    }
    if (search && search.trim()) {
      query.bookingReference = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email')
        .populate('movie', 'title posterUrl')
        .populate('theatre', 'name location')
        .populate('paymentId', 'transactionReference method status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
};
