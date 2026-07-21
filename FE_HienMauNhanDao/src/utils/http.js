import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: trả body JSON; báo lỗi khi ApiResponse.status === false
http.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && data.success === false) {
      return Promise.reject({
        response: { data, status: response.status },
        message: data.message,
      });
    }
    return data;
  },
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      const role = localStorage.getItem('role');
      if (role === 'AD' && !window.location.pathname.includes('/login')) {
        console.warn('Admin API auth failed:', error.response?.status);
      }
    }
    return Promise.reject(error);
  }
);

export default http;
