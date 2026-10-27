import api from './api';

export const adminService = {
  async getDashboardStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },
};
