# Task 10: Backend Structure

## 1. Directory Tree
```text
server/
├── .env.example              # Template environment variables
├── package.json              # Backend dependencies and test scripts
├── src/
│   ├── app.js                # Express app setup, middleware, router mount
│   ├── server.js             # HTTP server & Socket.IO initialization
│   ├── config/
│   │   └── db.js             # Mongoose connection and error diagnostics
│   ├── controllers/
│   │   ├── authController.js         # Register, login, profile operations
│   │   ├── movieController.js        # Search, filters, movie CRUD
│   │   ├── theatreController.js      # Theatre discovery, CRUD
│   │   ├── showController.js         # Show scheduling, seat map retrieval
│   │   ├── bookingController.js      # Atomic seat booking, cancellation
│   │   ├── paymentController.js      # Simulated payment lookups
│   │   ├── notificationController.js # In-app notification alerts
│   │   └── adminController.js        # Analytics and statistics
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   ├── admin.js          # Role-based administrator authorization guard
│   │   ├── rateLimiter.js    # Rate limiters for auth & standard endpoints
│   │   └── errorHandler.js   # Centralized error handler and JSON formatter
│   ├── models/
│   │   ├── User.js           # User schema (customer / admin)
│   │   ├── Movie.js          # Movie metadata and text indexing
│   │   ├── Theatre.js        # Multiplex location and screen amenities
│   │   ├── Show.js           # Screening schedule with embedded seat array
│   │   ├── Booking.js        # Confirmed / cancelled ticket orders
│   │   ├── Payment.js        # Simulated payment transaction ledger
│   │   └── Notification.js   # User alerts
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── theatreRoutes.js
│   │   ├── showRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   └── socketService.js  # Socket.IO room management & seat broadcasting
│   └── utils/
│       ├── seatGenerator.js  # Standard 60-seat layout generator
│       ├── seedData.js       # Realistic sample movies, theatres, and shows
│       └── seed.js           # Standalone database population script
└── tests/
    ├── auth.test.js          # Hashing, token claims, role guard tests
    ├── booking.test.js       # Atomic double-booking concurrency & refunds
    └── seat.test.js          # Layout validation, tiers, and pricing tests
```

## 2. Key Modules
- **`app.js` vs `server.js`**: Separating the Express `app` definition from `server.listen()` allows automated testing frameworks to mount and test `app` without keeping port listeners hanging.
- **`services/socketService.js`**: Decouples real-time WebSocket communication from HTTP controllers so updates can be invoked from any business process.
- **`utils/seatGenerator.js`**: Standardizes the 60-seat grid creation (Rows A-F, Cols 1-10) with automatic tier classification (Silver, Gold, Platinum).
