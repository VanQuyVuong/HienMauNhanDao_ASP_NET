import http from '../utils/http';

export const thuNhanMauService = {
  getAll: () => http.get('/tuimau'),
  getStats: () => http.get('/tuimau/stats'),
  create: (data) => http.post('/tuimau', data),
  updateStatus: (id, status) => http.put(`/tuimau/${id}/status?status=${encodeURIComponent(status)}`),
  update: (id, data) => http.put(`/tuimau/${id}`, data),
  delete: (id) => http.delete(`/tuimau/${id}`),
};

export const khamLamSangService = {
  getAll: () => http.get('/khamlamsang/lich-su'),
  getWaiting: async () => {
    const res = await http.get('/khamlamsang/cho-kham');
    return res?.data || res;
  },
  getStats: () => http.get('/khamlamsang/stats'),
  save: (data) => http.post('/khamlamsang/kham', data),
  update: (maKQ, data) =>
    http.post(`/khamlamsang/${encodeURIComponent(String(maKQ).trim())}/cap-nhat`, data),
  delete: (id) => http.delete(`/khamlamsang/${id}`),
};

export const ketQuaXetNghiemService = {
  // Lấy tất cả kết quả xét nghiệm (hỗ trợ cả getDanhSach lẫn getAll)
  getAll: () => http.get('/ketquaxetnghiem/danh-sach'),
  getDanhSach: () => http.get('/ketquaxetnghiem/danh-sach'),
  getStats: () => http.get('/ketquaxetnghiem/thong-ke'),
  create: (data) => http.post('/ketquaxetnghiem/luu', data),
  save: (data) => http.post('/ketquaxetnghiem/luu', data),
  getByMaTuiMau: (maTuiMau) => http.get(`/ketquaxetnghiem/tui-mau/${encodeURIComponent(maTuiMau)}`),
  update: (maKQ, data) => http.put(`/ketquaxetnghiem/${encodeURIComponent(maKQ)}`, data),
  delete: (maKQ) => http.delete(`/ketquaxetnghiem/${encodeURIComponent(maKQ)}`),
};

