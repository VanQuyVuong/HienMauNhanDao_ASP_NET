export const API_BASE_URL = 'https://localhost:7004/api'; // Or use your local IP address for physical device, e.g., 'http://192.168.1.xxx:5000/api'

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp'
  },
  // Add more endpoints as needed for MobileApp
};
