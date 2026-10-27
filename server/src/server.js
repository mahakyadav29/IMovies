require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO for real-time seat availability
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true); // Allow client connection
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket events
initSocket(io);

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Server Startup Warning] Database connection deferred. Server will continue running.');
  }

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  IMovies API Server running on port ${PORT}`);
    console.log(`  Health Check : http://localhost:${PORT}/api/health`);
    console.log(`  Client Origin: ${CLIENT_URL}`);
    console.log(`  Environment  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
