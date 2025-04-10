// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7072/api/', 
});

export default api;
