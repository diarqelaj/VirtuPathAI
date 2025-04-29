// lib/api.ts
import axios from 'axios';
import https from 'https';

const api = axios.create({
  baseURL: 'https://localhost:7072/api',
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, 
  }),
});

export default api;
