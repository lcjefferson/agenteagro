import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  
  // Se não houver env var definida
  if (!url) {
    // Se estivermos rodando localmente, usa localhost
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:8000/api/v1';
    }
    // Se estivermos em produção (Render), tenta usar a URL do backend padrão
    return 'https://agenteagro-backend.onrender.com/api/v1';
  }
  
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return `${url}/api/v1`;
}

const api = axios.create({
  baseURL: getBaseUrl(),
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
// Force update Sun Jan 11 19:42:01 -03 2026
// Force update Sun Jan 11 19:42:06 -03 2026
