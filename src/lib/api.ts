import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7072/api',
  withCredentials: true, // ✅ includes session cookie in every request
});

export default api;
