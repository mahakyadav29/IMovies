const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    col: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['silver', 'gold', 'platinum'],
      default: 'silver',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenName: {
      type: String,
      default: 'Screen 1',
      trim: true,
    },
    showDate: {
      type: String, // Stored as YYYY-MM-DD for straightforward date queries
      required: [true, 'Show date is required (YYYY-MM-DD)'],
      index: true,
    },
    startTime: {
      type: String, // e.g. "10:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"
      required: [true, 'Start time is required'],
      trim: true,
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Base ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
    },
    seats: {
      type: [seatSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find shows for a movie on a given date
showSchema.index({ movie: 1, showDate: 1, theatre: 1 });

module.exports = mongoose.model('Show', showSchema);
