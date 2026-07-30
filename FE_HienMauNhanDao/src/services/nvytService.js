import http from '../utils/http';

// ─── Nhân viên y tế ────────────────────────────────────────────────────────────

export const nhanVienService = {
  /**
   * Lấy thông tin nhân viên theo mã tài khoản hoặc email (backend findByAccount).
   */
  getByMaTaiKhoan: async (maTaiKhoan) => {
    try {
      const id = String(maTaiKhoan ?? '').trim();
      if (!id) return null;
      const res = await http.get(`/nhanvien/tai-khoan/${encodeURIComponent(id)}`);
      const data = res?.data || res;
      if (data && typeof data === 'object') {
        return {
          ...data,
          maNV: data.maNhanVien,
          hoVaTen: data.hoTen
        };
      }
      return null;
    } catch (error) {
      console.error('Lỗi lấy dữ liệu nhân viên:', error);
      return null;
    }
  },
};

// ─── Tình nguyện viên (dùng cho NVYT) ─────────────────────────────────────────

export const tnvNvytService = {
  /**
   * Tìm kiếm TNV theo số CCCD.
   * Backend: GET /tinhnguyenvien/cccd/{soCCCD}
   */
  findByCCCD: async (soCCCD) => {
    try {
      const res = await http.get(`/tinhnguyenvien/cccd/${encodeURIComponent(soCCCD)}`);
      if (!res?.success) return null;
      return res; // Trả về toàn bộ (data, duDieuKien, thongBao)
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * Lấy danh sách tất cả tình nguyện viên (phân trang).
   * Backend: GET /tinhnguyenvien?page=0&size=10
   */
  getAll: async (page = 0, size = 10, keyword = '') => {
    try {
      const params = new URLSearchParams({ page, size });
      if (keyword) params.append('keyword', keyword);
      const res = await http.get(`/tinhnguyenvien?${params.toString()}`);
      return res?.data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (err) {
      console.error('Error fetching TNV list:', err);
      throw err;
    }
  },

  /**
   * Tạo mới tình nguyện viên (NVYT thực hiện).
   * Backend: POST /tinhnguyenvien
   */
  create: async (data) => {
    try {
      const res = await http.post('/tinhnguyenvien', data);
      return res?.data || res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi tạo tình nguyện viên',
        status: err.response?.status,
      };
    }
  },

  /**
   * Cập nhật tình nguyện viên.
   * Backend: PUT /tinhnguyenvien/{maTNV}
   */
  update: async (maTNV, data) => {
    try {
      const res = await http.put(`/tinhnguyenvien/${maTNV}`, data);
      return res?.data || res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi cập nhật tình nguyện viên',
        status: err.response?.status,
      };
    }
  },
};

// ─── Đơn đăng ký (NVYT quản lý) ───────────────────────────────────────────────

export const donDangKyNvytService = {
  /**
   * Lấy danh sách đơn đăng ký (có thể lọc).
   * Backend: GET /dondangky?page=0&size=10&keyword=...
   */
  getAll: async (page = 0, size = 10, keyword = '') => {
    try {
      const params = new URLSearchParams({ page, size });
      if (keyword) params.append('keyword', keyword);
      const res = await http.get(`/dondangky?${params.toString()}`);
      // Nếu backend trả array thẳng
      const data = res?.data || res;
      if (Array.isArray(data)) {
        return { content: data, totalElements: data.length, totalPages: 1 };
      }
      return data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (err) {
      console.error('Error fetching đơn đăng ký:', err);
      throw err;
    }
  },

  /**
   * Lấy danh sách đơn đăng ký chờ thu nhận máu (Đã khám lâm sàng đạt)
   */
  getReadyForCollection: async (page = 0, size = 10) => {
    try {
      const params = new URLSearchParams({ page, size });
      const res = await http.get(`/dondangky/cho-thu-nhan?${params.toString()}`);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        return { content: data, totalElements: data.length, totalPages: 1 };
      }
      return data || { content: [], totalElements: 0, totalPages: 0 };
    } catch (err) {
      console.error('Error fetching danh sách chờ thu nhận:', err);
      throw err;
    }
  },


  /**
   * Tạo đơn đăng ký (NVYT tạo cho TNV).
   * Backend: POST /dondangky/tiep-nhan
   */
  create: async (data) => {
    try {
      const res = await http.post('/dondangky/tiep-nhan', data);
      if (res?.status === false) {
        throw { message: res.message || 'Lỗi khi tạo đơn', isBusinessError: true };
      }
      return res?.data || res;
    } catch (err) {
      if (err.isBusinessError) throw err;
      throw {
        message: err.response?.data?.message || err.message || 'Lỗi khi tạo đơn đăng ký',
        status: err.response?.status,
      };
    }
  },

  /**
   * Tiếp nhận tại quầy lễ tân (Check-in cho TNV tự đăng ký).
   * Backend: POST /dondangky/tiep-nhan
   */
  tiepNhan: async (data) => {
    try {
      const res = await http.post('/dondangky/tiep-nhan', data);
      return res?.data || res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || err.message || 'Lỗi khi tiếp nhận tại quầy',
        status: err.response?.status,
      };
    }
  },

  /**
   * Cập nhật đơn đăng ký (chỉ đơn do NVYT tạo).
   * Backend: PUT /dondangky/{maDon}
   */
  update: async (maDon, data) => {
    try {
      const res = await http.put(`/dondangky/${maDon}`, data);
      return res?.data || res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi cập nhật đơn đăng ký',
        status: err.response?.status,
      };
    }
  },

  /**
   * Xóa đơn đăng ký (chỉ đơn do NVYT tạo).
   * Backend: DELETE /dondangky/{maDon}
   */
  delete: async (maDon) => {
    try {
      const res = await http.delete(`/dondangky/${maDon}`);
      return res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi xóa đơn đăng ký',
        status: err.response?.status,
      };
    }
  },

  /**
   * Hủy đơn đăng ký.
   */
  cancel: async (maDon, maNV) => {
    try {
      const url = maNV ? `/dondangky/${maDon}/huy?maNV=${encodeURIComponent(maNV)}` : `/dondangky/${maDon}/huy`;
      const res = await http.put(url);
      return res?.data || res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi hủy đơn đăng ký',
        status: err.response?.status,
      };
    }
  },

  /**
   * Lấy chi tiết đơn đăng ký.
   */
  getById: async (maDon) => {
    try {
      const res = await http.get(`/dondangky/${maDon}`);
      return res?.data || res;
    } catch (err) {
      throw err;
    }
  },
};

// ─── Khai báo y tế (NVYT) ─────────────────────────────────────────────────────

export const khaiBaoYTeNvytService = {
  /**
   * Tạo hồ sơ sức khỏe cho đơn đăng ký.
   * Backend: POST /hososuckhoe
   */
  create: async (data) => {
    try {
      const res = await http.post('/hososuckhoe', data);
      return res?.data || res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi lưu khai báo y tế',
        status: err.response?.status,
      };
    }
  },

  /**
   * Lấy hồ sơ sức khỏe theo maDon.
   * Backend: GET /hososuckhoe/don/{maDon}
   */
  getByMaDon: async (maDon) => {
    try {
      const res = await http.get(`/hososuckhoe/don/${maDon}`);
      return res?.data || null;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * Lấy tất cả hồ sơ sức khỏe.
   * Backend: GET /hososuckhoe
   */
  getAll: async () => {
    try {
      const res = await http.get('/hososuckhoe');
      return res?.data || [];
    } catch (err) {
      console.error('Error fetching all hồ sơ sức khỏe:', err);
      throw err;
    }
  },

  /**
   * Cập nhật hồ sơ sức khỏe.
   * Backend: PUT /hososuckhoe/{maHoSo}
   */
  update: async (maHoSo, data) => {
    try {
      const res = await http.put(`/hososuckhoe/${maHoSo}`, data);
      return res?.data || res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ sức khỏe',
        status: err.response?.status,
      };
    }
  },

  /**
   * Xóa hồ sơ sức khỏe.
   * Backend: DELETE /hososuckhoe/{maHoSo}
   */
  delete: async (maHoSo) => {
    try {
      const res = await http.delete(`/hososuckhoe/${maHoSo}`);
      return res;
    } catch (err) {
      throw {
        message: err.response?.data?.message || 'Lỗi khi xóa hồ sơ sức khỏe',
        status: err.response?.status,
      };
    }
  },
};
