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
  getAll: () => http.get('/ketqualamsang'),
  getWaiting: () => http.get('/ketqualamsang/waiting'),
  getStats: () => http.get('/ketqualamsang/stats'),
  save: (data) => http.post('/ketqualamsang', data),
  update: (maKQ, data) =>
    http.post(`/ketqualamsang/${encodeURIComponent(String(maKQ).trim())}/cap-nhat`, data),
  delete: (id) => http.delete(`/ketqualamsang/${id}`),
};

export const ketQuaXetNghiemService = {
  // Lấy tất cả kết quả xét nghiệm
  getAll: () => http.get('/ketquaxetnghiem'),
  // Tạo kết quả xét nghiệm mới khi có túi máu (mã KQ tự sinh)
  create: (data) => http.post('/ketquaxetnghiem', data),
  // Lấy kết quả xét nghiệm theo mã túi máu
  getByMaTuiMau: (maTuiMau) => http.get(`/ketquaxetnghiem/tui-mau/${encodeURIComponent(maTuiMau)}`),
  // Bác sĩ cập nhật kết quả: nhóm máu, số lần xét nghiệm, mô tả
  update: (maKQ, data) => http.put(`/ketquaxetnghiem/${encodeURIComponent(maKQ)}`, data),
  // Xóa kết quả xét nghiệm
  delete: (maKQ) => http.delete(`/ketquaxetnghiem/${encodeURIComponent(maKQ)}`),
};

