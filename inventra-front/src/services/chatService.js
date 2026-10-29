import api from './api';

export const chatService = {
  sendMessage: async (message, sessionId = null) => {
    const res = await api.post('/chat', { message, session_id: sessionId });
    return res.data;
  },

  getHistory: async (sessionId = null) => {
    const res = await api.get('/chat/history', { params: { session_id: sessionId } });
    return res.data;
  },

  clearHistory: async (sessionId = null) => {
    const res = await api.delete('/chat/history', { params: { session_id: sessionId } });
    return res.data;
  }
};
