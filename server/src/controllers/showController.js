const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { generateDefaultSeats } = require('../utils/seatGenerator');

// @route   GET /api/shows
// @desc    Get shows with optional filters (movie, theatre, date)
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movie, theatre, date } = req.query;
    const query = { isActive: true };

    if (movie) query.movie = movie;
    if (theatre) query.theatre = theatre;
    if (date) query.showDate = date;

    const shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration language genre certificate')
      .populate('theatre', 'name location address')
      .select('-seats.bookedBy') // Do not expose bookedBy user IDs on list endpoint
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/shows/:id
// @desc    Get single show with full seat layout and availability counts
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title posterUrl duration language genre rating certificate bannerUrl')
      .populate('theatre', 'name location address amenities');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    // Calculate seat summary stats
    const totalSeats = show.seats.length;
    const bookedSeatsCount = show.seats.filter((s) => s.isBooked).length;
    const availableSeatsCount = totalSeats - bookedSeatsCount;

    // Sanitize seat layout: hide bookedBy user info from general public
    const sanitizedSeats = show.seats.map((s) => ({
      _id: s._id,
      seatNumber: s.seatNumber,
      row: s.row,
      col: s.col,
      type: s.type,
      price: s.price,
      isBooked: s.isBooked,
    }));

    res.status(200).json({
      success: true,
      show: {
        _id: show._id,
        movie: show.movie,
        theatre: show.theatre,
        screenName: show.screenName,
        showDate: show.showDate,
        startTime: show.startTime,
        ticketPrice: show.ticketPrice,
        isActive: show.isActive,
        createdAt: show.createdAt,
      },
      stats: {
        totalSeats,
        bookedSeatsCount,
        availableSeatsCount,
      },
      seats: sanitizedSeats,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/shows
// @desc    Create a new show (populates standard seats automatically)
// @access  Admin only
const createShow = async (req, res, next) => {
  try {
    const { movie, theatre, screenName, showDate, startTime, ticketPrice } = req.body;

    if (!movie || !theatre || !showDate || !startTime || ticketPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, theatre, showDate, startTime, and ticketPrice.',
      });
    }

    // Generate full seat map for this show
    const seats = generateDefaultSeats(Number(ticketPrice));

    const show = await Show.create({
      movie,
      theatre,
      screenName: screenName || 'Screen 1',
      showDate: showDate.trim(),
      startTime: startTime.trim(),
      ticketPrice: Number(ticketPrice),
      seats,
      isActive: true,
    });

    const populatedShow = await Show.findById(show._id)
      .populate('movie', 'title')
      .populate('theatre', 'name');

    res.status(201).json({
      success: true,
      message: 'Show created successfully with 60 seats generated!',
      show: populatedShow,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/shows/:id
// @desc    Update show information (time, price, status)
// @access  Admin only
const updateShow = async (req, res, next) => {
  try {
    const { screenName, showDate, startTime, ticketPrice, isActive } = req.body;

    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    if (screenName) show.screenName = screenName;
    if (showDate) show.showDate = showDate;
    if (startTime) show.startTime = startTime;
    if (isActive !== undefined) show.isActive = isActive;
    if (ticketPrice !== undefined) {
      show.ticketPrice = Number(ticketPrice);
      // Update unbooked seat prices according to new base ticketPrice
      const rows = { A: 1.0, B: 1.0, C: 1.25, D: 1.25, E: 1.5, F: 1.5 };
      show.seats.forEach((seat) => {
        if (!seat.isBooked) {
          const mult = rows[seat.row] || 1.0;
          seat.price = Math.round(Number(ticketPrice) * mult);
        }
      });
    }

    await show.save();

    res.status(200).json({
      success: true,
      message: 'Show updated successfully!',
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/shows/:id
// @desc    Delete show (prevented if bookings exist)
// @access  Admin only
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    // Safety check: prevent deleting a show if there are confirmed bookings
    const confirmedBookings = await Booking.countDocuments({
      show: show._id,
      bookingStatus: 'confirmed',
    });

    if (confirmedBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete show because there are ${confirmedBookings} active confirmed booking(s). You may mark the show as inactive instead.`,
      });
    }

    await Show.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
};
