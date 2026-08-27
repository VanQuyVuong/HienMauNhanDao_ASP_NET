import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, ENDPOINTS } from "../constants/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log("Error reading token from AsyncStorage", e);
  }
  return config;
});

export const authService = {
  //Hàm 1 : đăng nhập
  login: (data) => api.post(ENDPOINTS.AUTH.LOGIN, data),
  //hàm 2: gửi otp
  sendOtp: (email) => api.post(ENDPOINTS.AUTH.SEND_OTP, { email }),

  //HÀM 3 :XÁC THỰC MÃ OTP
  verifyOtp: (email, otp) =>
    api.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otpCode }),

  //hàm 4 : đăng ký tài khoản tnv
  register: (data) => api.post(ENDPOINTS.AUTH.REGISTER, data),

  //hàm 5 :quên mật khẩu, nhập lại mật khẩu mới
  resetPassword: (data) => api.post(ENDPOINTS.AUTH.RESET_PASSWORD, data),
};

export default api;
