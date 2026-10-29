import api from './api';

export const adminService = {
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data.users;
  },

  updateUserRole: async (userId, role, status) => {
    const res = await api.put(`/admin/users/${userId}/role`, { role, status });
    return res.data;
  },

  getAuditLogs: async (limit = 100) => {
    const res = await api.get('/admin/audit-logs', { params: { limit } });
    return res.data.logs;
  },

  getSettings: async () => {
    const res = await api.get('/admin/settings');
    return res.data.settings;
  },

  saveSettings: async (settings) => {
    const res = await api.post('/admin/settings', settings);
    return res.data;
  },

  resetSeedData: async () => {
    const res = await api.post('/admin/seed-reset');
    return res.data;
  }
};
