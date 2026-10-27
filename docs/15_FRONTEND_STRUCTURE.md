# Task 15: Frontend Structure

## 1. Directory Tree
```text
client/
├── index.html                # Single-page HTML entry point
├── package.json              # Frontend dependencies and Vite scripts
├── vite.config.js            # Vite build configuration and API reverse proxy
├── .env.example              # Frontend environment variables
└── src/
    ├── main.jsx              # React DOM render, Router & Providers wrapper
    ├── App.jsx               # Client routes configuration
    ├── index.css             # Cinematic charcoal & red custom CSS styles
    ├── components/
    │   ├── Navbar.jsx        # Navigation bar with notification bell & user menu
    │   ├── Footer.jsx        # Cinematic footer with attribution and links
    │   ├── MovieCard.jsx     # Card component with poster, rating, and actions
    │   ├── SeatMap.jsx       # Interactive seat layout with tiers & curved screen
    │   ├── LoadingSpinner.jsx# Branded loading spinner
    │   ├── ErrorAlert.jsx    # Clean dismissible error alert with retry
    │   ├── EmptyState.jsx    # Reusable empty data placeholder
    │   ├── ProtectedRoute.jsx# Auth route guard for logged-in users
    │   └── AdminRoute.jsx    # Role-based route guard for administrators
    ├── context/
    │   ├── AuthContext.jsx   # Authentication state, login, register, logout
    │   └── SocketContext.jsx # Socket.IO room subscriptions & listeners
    ├── pages/
    │   ├── Home.jsx          # Movie listing with search and multi-filtering
    │   ├── MovieDetails.jsx  # Movie details, backdrop banner, and showtimes
    │   ├── Theatres.jsx      # Partner multiplex locations and screen amenities
    │   ├── SeatSelection.jsx # Live seat map selection and subtotal calculation
    │   ├── Checkout.jsx      # Simulated payment screen (success/fail testing)
    │   ├── BookingConfirmation.jsx # Digital printable ticket confirmation
    │   ├── BookingHistory.jsx# Customer booking history & cancellation
    │   ├── Profile.jsx       # User profile and account details
    │   ├── Login.jsx         # Login screen with 1-click Demo credentials
    │   ├── Register.jsx      # New customer registration
    │   ├── NotFound.jsx      # 404 page
    │   └── admin/
    │       ├── AdminDashboard.jsx  # System statistics and recent activity
    │       ├── AdminMovies.jsx     # Movie catalog management (CRUD)
    │       ├── AdminTheatres.jsx   # Multiplex theatre management (CRUD)
    │       ├── AdminShows.jsx      # Show scheduling and seat generation
    │       └── AdminBookings.jsx   # Global customer bookings ledger
    ├── services/
    │   ├── api.js            # Axios client with interceptors
    │   ├── authService.js    # Auth HTTP endpoints
    │   ├── movieService.js   # Movies HTTP endpoints
    │   ├── theatreService.js # Theatres HTTP endpoints
    │   ├── showService.js    # Shows and seat layout HTTP endpoints
    │   ├── bookingService.js # Bookings and cancellation HTTP endpoints
    │   ├── adminService.js   # Analytics statistics endpoint
    │   └── notificationService.js # User alerts HTTP endpoints
    └── utils/
        ├── formatters.js     # Currency (INR), date, and duration formatters
        └── placeholder.js    # Inline SVG placeholder generator for broken images
```

## 2. Reusable Component Design
- **`SeatMap.jsx`**: Decouples the physical seat layout and tiered rendering logic from page-level state.
- **`MovieCard.jsx`**: Handles poster image fallback errors via `placeholder.js` so broken external image links never destroy the layout.
- **`ProtectedRoute` & `AdminRoute`**: Protect user journeys and administrative controls before any API calls are dispatched.
