import axios from 'axios';

// Main API for /api/*
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g. https://virtupathapi-54vt.onrender.com/api
  withCredentials: true,
});

// Attach timezone header
api.interceptors.request.use((config) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  config.headers['X-Timezone'] = timezone;
  return config;
});

// ✅ Separate instance for /chathub (root-level path)
export const chathubApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, ''), // removes `/api`
  withCredentials: true,
});

export default api;
