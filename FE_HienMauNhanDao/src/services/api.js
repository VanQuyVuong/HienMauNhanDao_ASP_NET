import axios from 'axios';
import { API_BASE_URL, AUTH_URL } from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => axios.post(`${AUTH_URL}/login`, data),
  register: (data) => axios.post(`${AUTH_URL}/register`, data),
  sendOtp: (email) => axios.post(`${AUTH_URL}/send-otp`, { email }),
  verifyOtp: (data) => axios.post(`${AUTH_URL}/verify-otp`, data),
};

export const homeService = {
  getHomeData: () => api.get('/public/trang-chu'),
};

export default api;
