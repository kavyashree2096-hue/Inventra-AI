import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('inventra_token', res.data.token);
      localStorage.setItem('inventra_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  signup: async (userData) => {
    const res = await api.post('/auth/signup', userData);
    if (res.data.token) {
      localStorage.setItem('inventra_token', res.data.token);
      localStorage.setItem('inventra_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  logout: () => {
    localStorage.removeItem('inventra_token');
    localStorage.removeItem('inventra_user');
  },

  getStoredUser: () => {
    try {
      const u = localStorage.getItem('inventra_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (email, new_password) => {
    const res = await api.post('/auth/reset-password', { email, new_password });
    return res.data;
  }
};
