# Task 16: Development of Frontend

## 1. Core Implementation Highlights

### A. Context Architecture (`AuthContext` & `SocketContext`)
- **`AuthContext`**: Wraps the entire application. Reads `imovies_token` and `imovies_user` from `localStorage` on initial mount, performs silent session verification with `/api/auth/me`, and provides reactive `login`, `register`, `logout`, and `updateProfile` handlers.
- **`SocketContext`**: Connects via WebSocket to the Node.js backend. Dispatches `join_show` when a user enters `/show/:showId/seats` and `leave_show` on component unmount to maintain low server resource overhead.

### B. Axios Central Interceptor (`client/src/services/api.js`)
All HTTP requests flow through a unified Axios instance:
1. **Request Interceptor**: Automatically injects `Authorization: Bearer <token>` into outgoing request headers if the user is authenticated.
2. **Response Interceptor**: Catches HTTP 401 Unauthorized responses to automatically clear stale session tokens and redirect users to log in again. Formats backend JSON error messages into human-friendly strings.

### C. Live Seat Map Interaction (`SeatSelection.jsx`)
- Renders 60 seats (Rows A-F, Columns 1-10) with an aisle space between columns 5 and 6.
- Colored by tier: Silver (Rows A-B), Gold (Rows C-D), Platinum (Rows E-F).
- Interactive state: Click toggles seat selection up to a maximum of 8 seats.
- Listens for `seats_updated` WebSocket events to immediately disable seats booked by other users in real-time.

### D. Simulated Payment Gateway (`Checkout.jsx`)
Designed specifically for college demonstrations:
- Displays a clear academic disclaimer that no real bank transactions occur.
- Lets the user choose between **Simulate Payment Success** (produces a confirmed booking, commits seat reservation, generates digital ticket) and **Simulate Payment Failure** (demonstrates that failed transactions leave seats unbooked).

### E. Defensive Image Handling (`MovieCard.jsx` & `placeholder.js`)
External movie poster URLs are protected against broken links using an `onError` fallback that renders an inline SVG cinema placeholder containing the movie title.
