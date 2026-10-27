require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const mongoose = require('mongoose');

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const { generateDefaultSeats } = require('./seatGenerator');
const { sampleTheatres, sampleMovies } = require('./seedData');

const seedDatabase = async () => {
  const uri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    // Connect to MongoDB
    console.log('[Seed] Connecting to MongoDB at:', uri);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('[Seed] MongoDB Connected successfully.');

    // 1. Clear existing collections
    console.log('[Seed] Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 2. Create Administrator Account
    const adminEmail = (
      process.env.ADMIN_INITIAL_EMAIL || 'admin@imovies.com'
    )
      .toLowerCase()
      .trim();

    const adminPassword =
      process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123456';

    const adminName =
      process.env.ADMIN_INITIAL_NAME || 'System Administrator';

    const adminHash = await User.hashPassword(adminPassword);

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash: adminHash,
      role: 'admin',
      phone: '+91 9876543210',
    });

    console.log(
      `[Seed] Admin user created: ${admin.email} (Role: admin)`
    );

    // 3. Create Demo Customer Account
    const customerHash = await User.hashPassword('User@123456');

    const demoCustomer = await User.create({
      name: 'Rahul Sharma',
      email: 'user@imovies.com',
      passwordHash: customerHash,
      role: 'customer',
      phone: '+91 9123456789',
    });

    console.log(
      `[Seed] Demo customer created: ${demoCustomer.email} (Password: User@123456)`
    );

    // 4. Insert Theatres
    const theatres = await Theatre.insertMany(sampleTheatres);

    console.log(`[Seed] Inserted ${theatres.length} theatres.`);

    // 5. Insert Movies
    const movies = await Movie.insertMany(sampleMovies);

    console.log(`[Seed] Inserted ${movies.length} movies.`);

    // 6. Generate Shows for the Next 3 Days
    const nowShowingMovies = movies.filter(
      (movie) => movie.status === 'now_showing'
    );

    const createdShows = [];
    const baseDate = new Date();

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const currentDate = new Date(baseDate);

      currentDate.setDate(baseDate.getDate() + dayOffset);

      const dateStr = currentDate.toISOString().split('T')[0];

      for (
        let movieIndex = 0;
        movieIndex < nowShowingMovies.length;
        movieIndex++
      ) {
        const movie = nowShowingMovies[movieIndex];

        const theatre1 = theatres[movieIndex % theatres.length];

        const theatre2 =
          theatres[(movieIndex + 1) % theatres.length];

        const basePrice = 200 + (movieIndex % 3) * 50;

        const times =
          dayOffset % 2 === 0
            ? ['10:00 AM', '05:00 PM']
            : ['01:30 PM', '08:30 PM'];

        for (const time of times) {
          const seats1 = generateDefaultSeats(basePrice);
          const seats2 = generateDefaultSeats(basePrice);

          // Simulate some already-booked seats in the first show.
          if (
            dayOffset === 0 &&
            movieIndex === 0 &&
            time === '10:00 AM'
          ) {
            ['C4', 'C5', 'D6', 'D7', 'E1', 'E2'].forEach(
              (seatNumber) => {
                const seat = seats1.find(
                  (item) => item.seatNumber === seatNumber
                );

                if (seat) {
                  seat.isBooked = true;
                  seat.bookedBy = demoCustomer._id;
                  seat.bookedAt = new Date();
                }
              }
            );
          }

          createdShows.push({
            movie: movie._id,
            theatre: theatre1._id,
            screenName: 'Screen 1 (Dolby Atmos)',
            showDate: dateStr,
            startTime: time,
            ticketPrice: basePrice,
            seats: seats1,
            isActive: true,
          });

          createdShows.push({
            movie: movie._id,
            theatre: theatre2._id,
            screenName: 'Screen 2 (IMAX 4K)',
            showDate: dateStr,
            startTime: time,
            ticketPrice: basePrice + 50,
            seats: seats2,
            isActive: true,
          });
        }
      }
    }

    const insertedShows = await Show.insertMany(createdShows);

    console.log(
      `[Seed] Created ${insertedShows.length} shows across 3 days.`
    );

    // 7. Prepare the Sample Booking
    if (insertedShows.length === 0) {
      throw new Error(
        'No shows were created. Cannot create the sample booking.'
      );
    }

    const sampleShow = insertedShows[0];

    const sampleSeats = ['C4', 'C5'];

    const selectedSeatDetails = sampleShow.seats.filter((seat) =>
      sampleSeats.includes(seat.seatNumber)
    );

    if (selectedSeatDetails.length !== sampleSeats.length) {
      throw new Error(
        'The sample booking seats C4 and C5 could not be found.'
      );
    }

    const sampleTotal = selectedSeatDetails.reduce(
      (total, seat) => total + seat.price,
      0
    );

    const bookingRef = 'IM-2026-DEMO1';
    const txnRef = 'TXN-SIM-78901234';

    // Create an unsaved Payment document first.
    // This gives it an _id without validating/saving it yet.
    const samplePayment = new Payment({
      user: demoCustomer._id,
      amount: sampleTotal,
      method: 'card',
      transactionReference: txnRef,
      status: 'success',
      simulationNote: 'College demo initial seed booking',
    });

    // Mark the sample seats as booked.
    for (const seat of sampleShow.seats) {
      if (sampleSeats.includes(seat.seatNumber)) {
        seat.isBooked = true;
        seat.bookedBy = demoCustomer._id;
        seat.bookedAt = new Date();
      }
    }

    await sampleShow.save();

    // Create the booking using the Payment document's preassigned _id.
    
const sampleBooking = new Booking({
  bookingReference: bookingRef,
  user: demoCustomer._id,
  show: sampleShow._id,
  movie: sampleShow.movie,
  theatre: sampleShow.theatre,

  selectedSeats: sampleSeats,

  seatDetails: sampleSeats.map((seatNumber) => {
    const seat = sampleShow.seats.find(
      (item) => item.seatNumber === seatNumber
    );

    return {
      seatNumber: seat.seatNumber,
      type: seat.type,
      price: seat.price,
    };
  }),

  totalAmount: sampleTotal,
  bookingStatus: 'confirmed',
  paymentStatus: 'paid',
  paymentId: samplePayment._id,
  showDateSnapshot: sampleShow.showDate,
  startTimeSnapshot: sampleShow.startTime,
});

await sampleBooking.save();

    // Now the Payment has a valid Booking reference.
    samplePayment.booking = sampleBooking._id;

    await samplePayment.save();

    console.log(
      '[Seed] Sample confirmed booking created for demo customer.'
    );

    // 8. Create Welcome Notification
    await Notification.create({
      user: demoCustomer._id,
      title: 'Welcome to IMovies!',
      message: `Your sample booking ${bookingRef} is ready in your booking history for demonstration.`,
      type: 'booking_confirmed',
    });

    console.log('[Seed] Welcome notification created.');

    // 9. Display Summary
    console.log('');
    console.log('====================================================');
    console.log('  DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log(`  Admin Login   : ${adminEmail} / ${adminPassword}`);
    console.log(
      '  Customer Login: user@imovies.com / User@123456'
    );
    console.log(`  Total Theatres: ${theatres.length}`);
    console.log(`  Total Movies  : ${movies.length}`);
    console.log(`  Total Shows   : ${insertedShows.length}`);
    console.log('====================================================');

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

seedDatabase();