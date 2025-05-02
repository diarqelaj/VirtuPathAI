import axios from 'axios';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false }); // ✅ Accept self-signed SSL

const api = axios.create({
  baseURL: 'https://localhost:7072/api',
  httpsAgent: agent,
  withCredentials: true,
});

export default api;
