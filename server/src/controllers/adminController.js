const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics for administrator
// @access  Admin only
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalMovies,
      nowShowingCount,
      totalTheatres,
      totalShows,
      totalBookings,
      confirmedBookingsCount,
      cancelledBookingsCount,
      totalUsers,
      recentBookings,
    ] = await Promise.all([
      Movie.countDocuments(),
      Movie.countDocuments({ status: 'now_showing' }),
      Theatre.countDocuments(),
      Show.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'confirmed' }),
      Booking.countDocuments({ bookingStatus: 'cancelled' }),
      User.countDocuments({ role: 'customer' }),
      Booking.find()
        .populate('user', 'name email')
        .populate('movie', 'title')
        .populate('theatre', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Calculate total simulated revenue from confirmed bookings
    const revenueAggregate = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        nowShowingCount,
        comingSoonCount: totalMovies - nowShowingCount,
        totalTheatres,
        totalShows,
        totalBookings,
        confirmedBookingsCount,
        cancelledBookingsCount,
        totalUsers,
        totalRevenue,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
