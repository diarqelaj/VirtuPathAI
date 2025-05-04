// api.ts
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

const api = axios.create({
  baseURL: 'https://localhost:7072/api',
  httpsAgent: agent,
  withCredentials: true,
});

// ✅ Attach timezone automatically to every request
api.interceptors.request.use((config) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  config.headers['X-Timezone'] = timezone;
  return config;
});

export default api;
