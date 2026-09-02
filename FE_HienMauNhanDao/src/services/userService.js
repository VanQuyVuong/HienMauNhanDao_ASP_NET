import http from '../utils/http';
import { unwrapList, unwrapData } from '../utils/apiHelper';

const userService = {
  getAll: async () => unwrapList(await http.get('/TaiKhoan')),
  create: async (data) => unwrapData(await http.post('/TaiKhoan', data)),
  update: async (id, data) => unwrapData(await http.put(`/TaiKhoan/${id}`, data)),
  setTrangThai: async (id, trangThai) => unwrapData(await http.patch(`/TaiKhoan/${id}/trang-thai`, { trangThai })),
  delete: async (id) => http.delete(`/TaiKhoan/${id}`),
  getVaiTroList: async () => unwrapList(await http.get('/TaiKhoan/vaitro')),
  getKhoaList: async () => unwrapList(await http.get('/TaiKhoan/khoa-cong-tac')),

};

export default userService;
