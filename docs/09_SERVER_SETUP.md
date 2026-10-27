# Task 09: Server Setup

## 1. Overview
The backend for **IMovies** is implemented with **Node.js** and **Express.js**, integrated with **Mongoose** for MongoDB database interactions and **Socket.IO** for live WebSocket broadcasting.

## 2. Dependencies
- `express` (v4.21.1): Core web framework.
- `mongoose` (v8.7.2): ODM for schema definition, relationships, and queries.
- `jsonwebtoken` (v9.0.2): Generating and validating stateless JWT authorization tokens.
- `bcryptjs` (v2.4.3): Hashing passwords with adaptive salt.
- `dotenv` (v16.4.5): Loading environment configuration from `.env`.
- `cors` (v2.8.5): Enabling secure cross-origin resource access.
- `express-rate-limit` (v7.4.1): Throttling excessive authentication and API calls.
- `socket.io` (v4.8.0): Bi-directional event communication.
- `morgan` (v1.10.0): HTTP request logger for local diagnostics.

## 3. Configuration Files

### `server/.env.example`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_2026_secure_token
CLIENT_URL=http://localhost:5173
ADMIN_INITIAL_NAME=System Administrator
ADMIN_INITIAL_EMAIL=admin@imovies.com
ADMIN_INITIAL_PASSWORD=Admin@123456
```

## 4. Running the Server
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run database seed script
npm run seed

# Run automated tests
npm test

# Start the server in watch mode
npm run dev
```
The API server starts on: **http://localhost:5000**
Health check endpoint: **http://localhost:5000/api/health**
