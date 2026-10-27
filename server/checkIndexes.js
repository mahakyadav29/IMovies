
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');

console.log('Loaded Booking model from:', require.resolve('./src/models/Booking'));

console.log(
  'seatDetails schema:',
  Booking.schema.path('seatDetails').toString()
);

console.log(
  'seatDetails instance:',
  Booking.schema.path('seatDetails').instance
);

console.log(
  'seatDetails caster:',
  Booking.schema.path('seatDetails').caster?.instance
);

console.log(
  'seatDetails child paths:',
  Booking.schema.path('seatDetails').schema
    ? Object.keys(Booking.schema.path('seatDetails').schema.paths)
    : 'No subdocument schema found'
);

mongoose.disconnect();