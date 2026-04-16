import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://client-website-backend.onrender.com/api');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add the JWT token automatically to protected endpoints
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
