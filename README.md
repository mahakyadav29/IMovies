# IMovies — Movie Ticket Booking Made Simple

A full-stack **MERN (MongoDB, Express.js, React, Node.js)** web application engineered for college project demonstrations, academic evaluations, and technical viva presentations. **IMovies** provides an end-to-end cinema ticket booking experience featuring real-time seat availability, multi-tier multiplex pricing, atomic concurrency control against double-booking, simulated payments, digital ticket generation, and a protected administrator management console.

---

## 1. Technology Stack

### Frontend
- **Framework**: React 18 with Vite.
- **Languages**: JavaScript (ES6+), JSX, HTML5, CSS3.
- **Styling**: Bootstrap 5.3 with Bootstrap Icons and custom cinematic dark-charcoal theme.
- **Routing**: React Router DOM v6.
- **Networking**: Axios with request/response interceptors for automatic JWT injection.
- **Real-Time Client**: Socket.IO Client.
- **Notifications**: React Toastify.
- **State Management**: React Context API (`AuthContext`, `SocketContext`).

### Backend
- **Runtime**: Node.js (v18 / v20 LTS).
- **Framework**: Express.js v4.21.
- **Database**: MongoDB with Mongoose ODM v8.
- **Authentication**: Stateless JSON Web Tokens (JWT) & bcryptjs password hashing.
- **Security**: express-rate-limit, CORS, defensive input sanitization.
- **Real-Time Server**: Socket.IO for WebSocket seat state broadcasting.
- **Testing**: Built-in Node.js Test Runner (`node --test`).

---

## 2. Key Features

### Customer Experience
- **Authentication**: Secure registration, login, and profile editing.
- **Movie Catalog**: Full-text search and multi-criteria filtering by Genre, Language, and Release Status.
- **Multiplex Theatres**: View partner theatres, locations, screens, and amenities (Dolby Atmos, IMAX).
- **Interactive Seat Map**: 60-seat visual layout organized into Silver, Gold, and Platinum tiers.
- **Real-Time Sync**: Instant seat updates when concurrent users make bookings.
- **Simulated Payment Gateway**: Safe demonstration testing with instant **Payment Success** and **Payment Failure** simulation modes.
- **Digital Tickets**: Unique booking references (`IM-XXXX-XXXX`), barcode graphic, and print/save to PDF functionality.
- **Booking History & Cancellation**: View active and past bookings; cancel future screenings with automatic seat release and simulated refund recording.

### Administrator Console (`/admin`)
- **Dashboard Analytics**: Total Simulated Revenue, Total Bookings, Active Movies, Theatres, and Shows count.
- **Movie Catalog Management**: Full CRUD operations for movies with posters, trailer links, and certificates.
- **Theatre Management**: Manage multiplex partner locations, screen counts, and amenities.
- **Show Scheduling**: Schedule screenings by linking movies and theatres; automatically generates standard 60-seat layouts.
- **Global Bookings Ledger**: Audit all customer bookings across the system with status filters.

---

## 3. Project Directory Layout

```text
IMovies/
├── client/                     # Frontend React (Vite) application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, SeatMap...)
│   │   ├── context/            # Global state (AuthContext, SocketContext)
│   │   ├── pages/              # Customer & Admin pages
│   │   ├── services/           # Axios API services
│   │   ├── utils/              # Formatting & SVG placeholder helpers
│   │   ├── App.jsx             # React Router routing table
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Cinematic dark theme styling
│   ├── .env.example            # Client environment variables
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Node.js & Express REST API
│   ├── src/
│   │   ├── config/             # Database connection and diagnostics
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Auth, Admin guard, Rate-limiter, Error-handler
│   │   ├── models/             # Mongoose schemas (User, Movie, Theatre, Show...)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Socket.IO broadcasting service
│   │   ├── utils/              # Seat generator and database seed scripts
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server startup and Socket.IO initialization
│   ├── tests/                  # Automated unit and integration tests
│   ├── .env.example            # Server environment variables
│   └── package.json
│
├── docs/                       # Comprehensive documentation for 19 Kanban tasks
│   ├── README.md               # 19 tasks index table
│   ├── 01_TECHNICAL_ARCHITECTURE.md
│   ├── 02_ER_DIAGRAM.md
│   ├── 05_USER_FLOW.md
│   ├── DEMO_SCRIPT.md          # 3-5 minute viva demonstration script
│   └── screenshots/            # UI screenshot guidelines and assets
│
├── .gitignore
├── package.json                # Root convenience scripts
└── README.md
```

---

## 4. Prerequisites
- **Node.js**: v18.x or v20.x LTS installed.
- **MongoDB**: Either local MongoDB (running on default port `27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster.

---

## 5. Quick Setup & Installation (Windows Friendly)

### 1. Clone or Open the Repository
```powershell
cd c:\Users\atuln\Documents\IMovies
```

### 2. Configure Environment Variables
Copy the `.env.example` template files into active `.env` files:

```powershell
# In server directory
copy server\.env.example server\.env

# In client directory
copy client\.env.example client\.env
```

*Note: If using MongoDB Atlas, open `server/.env` and replace `MONGO_URI` with your Atlas connection string.*

### 3. Install Dependencies
```powershell
# Install backend packages
cd server
npm install

# Install frontend packages
cd ..\client
npm install
cd ..
```

---

## 6. Seeding the Database
To populate realistic sample movies, multiplex theatres, upcoming shows, and default demo accounts:
```powershell
npm run seed
```

### Seeded Demonstration Credentials
| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@imovies.com` | `Admin@123456` | Full administrative control, analytics, CRUD |
| **Customer** | `user@imovies.com` | `User@123456` | Book tickets, view history, cancel bookings |

*(On the Login screen, use the 1-click **College Demo Quick-Fill** buttons to fill these credentials automatically).*

---

## 7. Running the Application

Open two separate terminal windows:

### Terminal 1: Backend Server
```powershell
cd server
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### Terminal 2: Frontend Client
```powershell
cd client
npm run dev
```
- **Web Application URL**: **`http://localhost:5173`**

---

## 8. Running Automated Tests
Run the backend automated test suite verifying password hashing, token validation, admin guards, atomic seat locking, and cancellation policies:
```powershell
npm test
```
All tests run with zero external test dependencies using Node's built-in test runner.

---

## 9. API Overview

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in profile |
| `GET` | `/api/movies` | Public | List movies (search, filter, pagination) |
| `GET` | `/api/movies/:id` | Public | Movie details and upcoming showtimes |
| `POST` | `/api/movies` | Admin | Create new movie in catalog |
| `GET` | `/api/theatres` | Public | List partner multiplex theatres |
| `GET` | `/api/shows/:id` | Public | Retrieve show details and live seat layout |
| `POST` | `/api/shows` | Admin | Schedule new show (generates 60 seats) |
| `POST` | `/api/bookings` | Private | **Atomic booking** with simulated payment |
| `GET` | `/api/bookings/my` | Private | View personal booking history |
| `POST` | `/api/bookings/:id/cancel`| Private | Cancel booking and release seats |
| `GET` | `/api/admin/stats` | Admin | Dashboard statistics and revenue analytics |

---

## 10. College Evaluation & Demo Instructions
Refer to [`docs/DEMO_SCRIPT.md`](./docs/DEMO_SCRIPT.md) for a complete 3–5 minute step-by-step viva presentation script with screen sequences and speaker narration points.

---

## 11. Known Limitations & Design Notes
1. **Simulated Payments**: As required for academic project demonstrations, payment processing is purely simulated; no real card credentials or money transfers occur.
2. **Cancellation Policy**: Cancellations are permitted only for shows whose date is on or after the current date. Past shows cannot be cancelled.
3. **Seat Concurrency**: Race-condition protection is enforced atomically on the database layer using Mongoose's `$not: { $elemMatch: { ... } }` construct, guaranteeing that two concurrent users cannot book the same seat.
