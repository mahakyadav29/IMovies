# Task 11: Development of Backend

## 1. Implemented REST API Endpoints

### A. Authentication & User Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer account with bcrypt hash |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JWT |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |
| `PUT` | `/api/auth/profile` | Private | Update user display name and phone |

### B. Movies Management (`/api/movies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Public | List movies with search, genre, language, status filters |
| `GET` | `/api/movies/:id` | Public | Retrieve single movie details and upcoming screenings |
| `POST` | `/api/movies` | Admin | Create a new movie with metadata |
| `PUT` | `/api/movies/:id` | Admin | Update movie details |
| `DELETE` | `/api/movies/:id` | Admin | Delete movie (guarded against active shows) |

### C. Multiplex Theatres (`/api/theatres`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/theatres` | Public | List all partner theatres with optional location filter |
| `GET` | `/api/theatres/:id` | Public | Retrieve single theatre and its scheduled shows |
| `POST` | `/api/theatres` | Admin | Create a new theatre |
| `PUT` | `/api/theatres/:id` | Admin | Update theatre information |
| `DELETE` | `/api/theatres/:id` | Admin | Delete theatre |

### D. Shows & Live Seat Maps (`/api/shows`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shows` | Public | Filter shows by movie, theatre, and date |
| `GET` | `/api/shows/:id` | Public | Retrieve show details and sanitized 60-seat layout |
| `POST` | `/api/shows` | Admin | Schedule a show (auto-generates standard 60 seats) |
| `PUT` | `/api/shows/:id` | Admin | Update show timing or base ticket price |
| `DELETE` | `/api/shows/:id` | Admin | Delete show (guarded against active bookings) |

### E. Bookings & Transactions (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Private | **Atomic booking**: validates seats, simulates payment outcome |
| `GET` | `/api/bookings/my` | Private | Customer view of personal booking history |
| `GET` | `/api/bookings/:id` | Private | View digital ticket confirmation details |
| `POST` | `/api/bookings/:id/cancel` | Private | Cancel future booking and atomically release seats |
| `GET` | `/api/bookings` | Admin | Administrator view of all bookings across all users |

### F. Analytics & Notifications
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | System dashboard counts and total simulated revenue |
| `GET` | `/api/notifications` | Private | Fetch user in-app alerts |
| `PUT` | `/api/notifications/:id/read`| Private | Mark individual alert as read |
| `PUT` | `/api/notifications/read-all`| Private | Mark all alerts as read |

## 2. Concurrency Safety Implementation
To guarantee that two users attempting to book the same seat cannot both succeed, the booking controller uses an atomic query-and-update pattern:
```javascript
const updatedShow = await Show.findOneAndUpdate(
  {
    _id: showId,
    isActive: true,
    seats: {
      $not: {
        $elemMatch: {
          seatNumber: { $in: selectedSeats },
          isBooked: true,
        },
      },
    },
  },
  {
    $set: {
      'seats.$[elem].isBooked': true,
      'seats.$[elem].bookedBy': req.user._id,
      'seats.$[elem].bookedAt': new Date(),
    },
  },
  {
    arrayFilters: [{ 'elem.seatNumber': { $in: selectedSeats } }],
    new: true,
  }
);

if (!updatedShow) {
  return res.status(409).json({
    success: false,
    message: 'Booking conflict: One or more selected seats have already been booked by another user.',
  });
}
```
If any seat in `selectedSeats` was already booked, MongoDB finds zero matching documents and returns `null`, cleanly throwing an HTTP 409 Conflict.
