import api from './api';

export const searchService = {
  search: async (query, type = 'all', category = null, limit = 8) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit);
    const res = await api.get(`/search?${params.toString()}`);
    return res.data;
  }
};
