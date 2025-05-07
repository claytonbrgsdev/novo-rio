import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export default api;

export const ollamaApi = axios.create({
  baseURL: import.meta.env.VITE_OLLAMA_URL || 'http://127.0.0.1:11434',
})
