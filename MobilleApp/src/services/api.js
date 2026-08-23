import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants/api';
// Optionally, you might use AsyncStorage for React Native tokens
// import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  // const token = await AsyncStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export const authService = {
  login: (data) => api.post(ENDPOINTS.AUTH.LOGIN, data),
};

export default api;
