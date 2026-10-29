import api from './api';

export const salesService = {
  getSales: async (params = {}) => {
    const res = await api.get('/sales', { params });
    return res.data;
  },

  getAnalytics: async (period = 'monthly') => {
    const res = await api.get('/sales/analytics', { params: { period } });
    return res.data;
  },

  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/sales/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
