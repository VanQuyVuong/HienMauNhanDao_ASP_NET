// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ENDPOINTS } from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm JWT Bearer Token vào Header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Lỗi lấy token từ AsyncStorage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Hết hạn phiên đăng nhập (401)');
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth Service Helpers (Hỗ trợ linh hoạt cả truyền Object {email, matKhau} hoặc truyền rời (email, matKhau))
export const authService = {
  login: async (emailOrData, matKhau) => {
    const payload = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, matKhau };
    const res = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
    return res;
  },
  sendOtp: async (emailOrData) => {
    const payload = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData };
    const res = await api.post(ENDPOINTS.AUTH.SEND_OTP, payload);
    return res;
  },
  verifyOtp: async (emailOrData, otp) => {
    const payload = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, otp };
    const res = await api.post(ENDPOINTS.AUTH.VERIFY_OTP, payload);
    return res;
  },
  register: async (emailOrData, matKhau, otp) => {
    const payload = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, matKhau, otp };
    const res = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
    return res;
  },
};

export default api;
