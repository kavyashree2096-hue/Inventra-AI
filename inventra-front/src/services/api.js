import axios from 'axios';

let rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
if (rawBase && rawBase !== '/api' && !rawBase.endsWith('/api') && !rawBase.endsWith('/api/')) {
  rawBase = rawBase.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: rawBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inventra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('inventra_token');
      // localStorage.removeItem('inventra_user');
    }
    return Promise.reject(error);
  }
);

export default api;
