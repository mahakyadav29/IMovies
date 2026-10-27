const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      maxlength: [120, 'Theatre name cannot exceed 120 characters'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Theatre location or area is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    totalScreens: {
      type: Number,
      default: 1,
      min: 1,
    },
    amenities: {
      type: [String],
      default: ['Dolby Atmos', '4K Laser Projection', 'Parking', 'Cafeteria'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Theatre', theatreSchema);
