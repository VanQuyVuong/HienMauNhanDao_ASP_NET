export const API_BASE_URL = 'http://localhost:5236/api'; // Hoặc IP local khi chạy trên thiết bị di động thực

// Hàm lấy URL ảnh thực tế từ Backend
export const getImageUrl = (imageName) => {
  if (!imageName) return null;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}/images/${imageName}`;
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  CHIEN_DICH: {
    GET_ALL: '/ChienDich',
  },
  TIN_TUC: {
    GET_ALL: '/TinTuc',
  },
  TNV: {
    ME: '/TinhNguyenVien/me',
  },
  DON_DANG_KY: {
    GET_ALL: '/DonDangKy',
  },
  HOSO_SUCKHOE: {
    CREATE: '/HoSoSucKhoe',
  },
  PHUONG_XA: {
    GET_ALL: '/PhuongXa',
  }
};
