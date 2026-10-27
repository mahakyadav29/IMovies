const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

// @route   GET /api/theatres
// @desc    Get all theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { location } = req.query;
    const query = {};
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });
    const locations = await Theatre.distinct('location');

    res.status(200).json({
      success: true,
      count: theatres.length,
      locations: locations.sort(),
      theatres,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/theatres/:id
// @desc    Get single theatre details
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      theatre: theatre._id,
      isActive: true,
      showDate: { $gte: todayStr },
    })
      .populate('movie', 'title posterUrl duration language genre')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      theatre,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/theatres
// @desc    Create a new theatre
// @access  Admin only
const createTheatre = async (req, res, next) => {
  try {
    const { name, location, address, totalScreens, amenities } = req.body;

    if (!name || !location || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, location, and address.',
      });
    }

    const theatre = await Theatre.create({
      name: name.trim(),
      location: location.trim(),
      address: address.trim(),
      totalScreens: totalScreens ? Number(totalScreens) : 1,
      amenities: Array.isArray(amenities)
        ? amenities
        : amenities
        ? String(amenities).split(',').map((a) => a.trim())
        : ['Dolby Atmos', '4K Laser Projection', 'Parking', 'Cafeteria'],
    });

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully!',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/theatres/:id
// @desc    Update theatre
// @access  Admin only
const updateTheatre = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.amenities && !Array.isArray(updateData.amenities)) {
      updateData.amenities = String(updateData.amenities).split(',').map((a) => a.trim());
    }

    const theatre = await Theatre.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully!',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/theatres/:id
// @desc    Delete theatre
// @access  Admin only
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    const activeShows = await Show.countDocuments({ theatre: theatre._id, isActive: true });
    if (activeShows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete theatre because it has ${activeShows} active show(s). Please remove those shows first.`,
      });
    }

    await Theatre.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Theatre deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
