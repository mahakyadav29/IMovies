# Task 14: Create Schemas

## 1. Overview
All data entities are defined as Mongoose schemas inside `server/src/models/`. Mongoose enforces validation rules, data types, default values, references, and indexes.

## 2. Schema Definitions

### A. User Schema (`server/src/models/User.js`)
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
  phone: { type: String, trim: true, default: '' },
}, { timestamps: true });
```
- **Virtuals & Methods**:
  - `userSchema.methods.comparePassword(candidatePassword)`: Compares candidate password against bcrypt hash.
  - `userSchema.methods.toJSON()`: Automatically removes `passwordHash` before serialization.

### B. Movie Schema (`server/src/models/Movie.js`)
```javascript
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true, trim: true },
  genre: { type: [String], required: true, index: true },
  language: { type: [String], required: true, index: true },
  duration: { type: Number, required: true, min: 1 },
  releaseDate: { type: Date, required: true },
  posterUrl: { type: String, required: true, trim: true },
  bannerUrl: { type: String, trim: true, default: '' },
  trailerUrl: { type: String, trim: true, default: '' },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  cast: { type: [String], default: [] },
  director: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['now_showing', 'coming_soon'], default: 'now_showing', index: true },
  certificate: { type: String, enum: ['U', 'UA', 'A', 'R', 'PG-13'], default: 'UA' },
}, { timestamps: true });

movieSchema.index({ title: 'text', description: 'text' });
```

### C. Theatre Schema (`server/src/models/Theatre.js`)
```javascript
const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  location: { type: String, required: true, trim: true, index: true },
  address: { type: String, required: true, trim: true },
  totalScreens: { type: Number, default: 1, min: 1 },
  amenities: { type: [String], default: ['Dolby Atmos', '4K Laser Projection', 'Parking', 'Cafeteria'] },
}, { timestamps: true });
```

### D. Show Schema & Embedded Seat Schema (`server/src/models/Show.js`)
```javascript
const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true, trim: true },
  row: { type: String, required: true, trim: true },
  col: { type: Number, required: true },
  type: { type: String, enum: ['silver', 'gold', 'platinum'], default: 'silver' },
  price: { type: Number, required: true, min: 0 },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookedAt: { type: Date, default: null },
}, { _id: true });

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
  screenName: { type: String, default: 'Screen 1', trim: true },
  showDate: { type: String, required: true, index: true }, // Stored as YYYY-MM-DD
  startTime: { type: String, required: true, trim: true },
  ticketPrice: { type: Number, required: true, min: 0 },
  seats: { type: [seatSchema], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

showSchema.index({ movie: 1, showDate: 1, theatre: 1 });
```

### E. Booking Schema (`server/src/models/Booking.js`)
```javascript
const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true, uppercase: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  selectedSeats: { type: [String], required: true },
  seatDetails: [{ seatNumber: String, type: String, price: Number }],
  totalAmount: { type: Number, required: true, min: 0 },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'confirmed', index: true },
  paymentStatus: { type: String, enum: ['paid', 'failed', 'refunded_simulated'], default: 'paid' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  showDateSnapshot: { type: String },
  startTimeSnapshot: { type: String },
  cancelledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: '' },
}, { timestamps: true });
```

### F. Payment Schema (`server/src/models/Payment.js`)
```javascript
const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
  transactionReference: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['success', 'failed'], required: true, index: true },
  simulationNote: { type: String, default: 'Simulated payment for college demonstration' },
}, { timestamps: true });
```

### G. Notification Schema (`server/src/models/Notification.js`)
```javascript
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'IMovies Notification' },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking_confirmed', 'booking_cancelled', 'payment_failed', 'system'], default: 'booking_confirmed' },
  read: { type: Boolean, default: false },
}, { timestamps: true });
```
