export const API_BASE_URL = 'http://localhost:5236/api';
export const AUTH_URL = 'http://localhost:5236/api/auth';
<<<<<<< Updated upstream

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp'
  },
  TIN_TUC: {
    GET_ALL: '/TinTuc',
    GET_BY_ID: (id) => `/TinTuc/${id}`,
    CREATE: '/TinTuc',
    DELETE: (id) => `/TinTuc/${id}`
  },
  ADMIN_HOSPITAL: {
    STOCK: '/AdminHospital/stock',
    STAFF: '/AdminHospital/staff',
    CAMPAIGN_STATS: '/AdminHospital/campaign-stats',
    NOTIFICATION: '/AdminHospital/notification'
  },
  UPLOAD: {
    IMAGE: '/Upload/image'
  },
  PUBLIC: {
    HOME: '/public/trang-chu'
  }
};
=======
>>>>>>> Stashed changes
