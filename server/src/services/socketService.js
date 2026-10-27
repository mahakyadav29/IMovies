let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific show's seat map
    socket.on('join_show', (showId) => {
      if (showId) {
        socket.join(`show_${showId}`);
        // console.log(`[Socket.IO] Socket ${socket.id} joined show room show_${showId}`);
      }
    });

    // Leave room
    socket.on('leave_show', (showId) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

const notifySeatsUpdated = (showId, updatedSeatsData) => {
  if (ioInstance) {
    ioInstance.to(`show_${showId}`).emit('seats_updated', {
      showId,
      ...updatedSeatsData,
    });
  }
};

module.exports = { initSocket, notifySeatsUpdated };
