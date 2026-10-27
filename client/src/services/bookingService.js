import api from './api';

export const bookingService = {
  async createBooking(bookingPayload) {
    const res = await api.post('/bookings', bookingPayload);
    return res.data;
  },

  async getMyBookings() {
    const res = await api.get('/bookings/my');
    return res.data;
  },

  async getBookingById(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id, reason) {
    const res = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  async getAllBookings(params = {}) {
    const res = await api.get('/bookings', { params });
    return res.data;
  },
};
