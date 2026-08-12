import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://ai-powered-prompt-generation-and.onrender.com';

export const api = {
  processPrompt: async (prompt) => {
    const response = await axios.post(`${API_URL}/prompts/process`, { prompt });
    return response.data;
  },
  getHistory: async () => {
    const response = await axios.get(`${API_URL}/history`);
    return response.data;
  },
  getHistoryItem: async (id) => {
    const response = await axios.get(`${API_URL}/history/${id}`);
    return response.data;
  },
  deleteHistoryItem: async (id) => {
    const response = await axios.delete(`${API_URL}/history/${id}`);
    return response.data;
  }
};
