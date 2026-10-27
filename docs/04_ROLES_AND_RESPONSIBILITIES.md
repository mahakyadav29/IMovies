# Task 04: Roles and Responsibilities

## 1. User Roles Matrix

| Permission / Action | Customer | Administrator | Unauthenticated Visitor |
| :--- | :---: | :---: | :---: |
| Browse Movies & Details | Yes | Yes | Yes |
| Search & Filter Movies | Yes | Yes | Yes |
| View Theatres & Amenities | Yes | Yes | Yes |
| View Seat Maps (Live Availability) | Yes | Yes | Yes |
| Book Seats & Checkout | Yes | Yes | Redirected to Login |
| View Personal Booking History | Yes | Yes | No |
| Cancel Eligible Bookings | Yes | Yes | No |
| Access Admin Console (`/admin`) | Blocked (403) | Yes | Redirected to Login |
| Add / Edit / Delete Movies | Blocked (403) | Yes | Blocked (401) |
| Add / Edit / Delete Theatres | Blocked (403) | Yes | Blocked (401) |
| Schedule Shows & Generate Seats | Blocked (403) | Yes | Blocked (401) |
| View Global Bookings Across All Users | Blocked (403) | Yes | Blocked (401) |
| View System Analytics & Revenue Stats | Blocked (403) | Yes | Blocked (401) |

## 2. Technical Component Responsibilities

### A. Frontend (React SPA)
- Collects user selections (dates, times, seats, payment simulation mode).
- Manages client-side token persistence (`imovies_token`) and user state.
- Guards client routes using React Router components (`ProtectedRoute`, `AdminRoute`).
- Establishes WebSocket client subscriptions to receive real-time seat changes.
- Formats dates, times, currency, and renders responsive layouts.

### B. Backend (Node.js & Express)
- Authenticates credentials against bcrypt password hashes.
- Signs and verifies stateless JWT tokens with expiry checks.
- Enforces role-based authorization guards on administrative routes.
- **Atomic Concurrency Controller**: Ensures two users cannot book the same seat simultaneously by validating seat availability at the exact moment of booking creation.
- Emits real-time room notifications via Socket.IO.
- Applies API rate limiting to protect authentication routes against brute-force attacks.

### C. Database (MongoDB)
- Stores structured document models for Users, Movies, Theatres, Shows, Bookings, Payments, and Notifications.
- Enforces unique constraints (e.g., `email`, `bookingReference`, `transactionReference`).
- Indexes common query pathways (e.g., `movie + showDate + theatre`).
- Executes atomic `$set` and `$elemMatch` updates on embedded seat arrays.
