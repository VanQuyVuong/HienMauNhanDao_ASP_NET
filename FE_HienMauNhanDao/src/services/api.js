import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants/api';

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
  login: (data) => api.post(ENDPOINTS.AUTH.LOGIN, data),
  register: (data) => api.post(ENDPOINTS.AUTH.REGISTER, data),
  sendOtp: (email) => api.post(ENDPOINTS.AUTH.SEND_OTP, { email }),
  verifyOtp: (data) => api.post(ENDPOINTS.AUTH.VERIFY_OTP, data),
};

export const homeService = {
  getHomeData: () => api.get(ENDPOINTS.PUBLIC.HOME),
};

export default api;
