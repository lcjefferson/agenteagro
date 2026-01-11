import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api/v1` 
    : 'http://localhost:8000/api/v1',
});

export const dashboardService = {
  getStats: async () => {
    // We might need to aggregate this from other endpoints or create a specific dashboard endpoint
    // For now, let's fetch conversations and calculate some stats client-side or use available endpoints
    const [conversations, professionals] = await Promise.all([
      api.get('/conversations/', { params: { limit: 1000 } }), // Get more for stats
      api.get('/professionals/')
    ]);
    return {
      conversations: conversations.data.items || conversations.data, // Handle new structure
      professionals: professionals.data
    };
  },
  getAnalytics: async () => {
    const response = await api.get('/analytics/problems');
    return response.data;
  }
};

export const chatService = {
  getConversations: (params) => api.get('/conversations/', { params }),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
};

export const professionalsService = {
  getAll: (params) => api.get('/professionals/', { params }),
  create: (data) => api.post('/professionals/', data),
  delete: (id) => api.delete(`/professionals/${id}`),
};

export const analyticsService = {
  getStates: () => api.get('/analytics/states'),
  getProblemsByRegion: () => api.get('/analytics/problems-by-region'),
};

export default api;
