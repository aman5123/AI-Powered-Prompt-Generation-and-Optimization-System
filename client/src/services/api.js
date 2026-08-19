import axios from 'axios';

// Use relative path — Vite proxy forwards /api/* → http://localhost:5000/api/*
// Falls back to absolute URL for production deployments
const API_URL = import.meta.env.VITE_API_URL || '/api';


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