import axios from 'axios';

// Dynamic API URL:
// 1. Uses VITE_API_URL env var if set
// 2. Uses relative /api for local dev (Vite proxy)
// 3. Fallback to live Render backend for production deployments
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  return 'https://ai-powered-prompt-generation-and.onrender.com/api';
};

const API_URL = getApiUrl();



export const api = {
  // ── Prompt Processing ────────────────────────────────────────────────────
  processPrompt: async (prompt, provider = null, model = null) => {
    const response = await axios.post(`${API_URL}/prompts/process`, {
      prompt,
      ...(provider && { provider }),
      ...(model && { model }),
    });
    return response.data;
  },

  // ── History ───────────────────────────────────────────────────────────────
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
  },

  // ── Provider Management ───────────────────────────────────────────────────
  getProviderStatus: async () => {
    const response = await axios.get(`${API_URL}/providers/status`);
    return response.data;
  },

  getProviderModels: async () => {
    const response = await axios.get(`${API_URL}/providers/models`);
    return response.data;
  },

  testConnection: async () => {
    const response = await axios.get(`${API_URL}/test-gemini`);
    return response.data;
  },
};