import http from '../utils/http';

export const tinhNguyenVienService = {
  /**
   * Tạo mới hoặc cập nhật tình nguyện viên theo maTaiKhoan/email.
   * Đây là endpoint chính khi TNV điền thông tin cá nhân khi đăng ký.
   * @param {Object} data - Thông tin tình nguyện viên
   * @returns {Promise<Object>} Thông tin TNV với maTNV
   */
  createOrUpdate: async (data) => {
    try {
      const updateData = {
        hoTen: data.hoVaTen,
        cccd: data.soCCCD,
        ngaySinh: data.ngaySinh,
        soDienThoai: data.soDienThoai,
        diaChi: data.diaChi,
        gioiTinh: data.gioiTinh === "Nữ" || data.gioiTinh === "Nu" ? "Nu" : "Nam",
        nhomMau: data.nhomMau ? String(data.nhomMau) : "0",
        maPhuongXa: data.maPhuongXa ? String(data.maPhuongXa) : null
      };
      const putRes = await http.put('/tinhnguyenvien/me', updateData);
      
      let profile = putRes?.data || putRes?.tnv || putRes;

      if (!profile || (!profile.maTNV && !profile.maTnv)) {
        const profileResponse = await http.get('/tinhnguyenvien/me');
        profile = profileResponse?.data || profileResponse;
      }

      if (profile) {
        return {
          ...profile,
          maTNV: profile.maTNV || profile.maTnv || profile.MaTNV,
          hoVaTen: profile.hoTen || profile.HoTen,
          soCCCD: profile.cccd || profile.Cccd,
          phuongXa: profile.maPhuongXa || profile.MaPhuongXa
        };
      }
      return profile;
    } catch (error) {
      console.error('Error creating/updating tình nguyện viên:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Lỗi khi lưu thông tin tình nguyện viên',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },

  /**
   * Lấy thông tin TNV theo maTaiKhoan hoặc email (để pre-fill form).
   * @param {string} maTaiKhoan - maTaiKhoan hoặc email
   * @returns {Promise<Object>} Thông tin TNV hoặc null nếu chưa có
   */
  getByMaTaiKhoan: async (maTaiKhoan) => {
    try {
      const response = await http.get('/tinhnguyenvien/me');
      const profile = response?.data || response;
      if (!profile) return null;
      return {
        ...profile,
        hoVaTen: profile.hoTen,
        soCCCD: profile.cccd,
        phuongXa: profile.maPhuongXa
      };
    } catch (error) {
      console.error('Error fetching tình nguyện viên:', error);
      return null; // Không throw, chỉ trả null nếu chưa có
    }
  },

  /**
   * Tạo mới tình nguyện viên (dùng khi cần force create)
   */
  create: async (data) => {
    try {
      const response = await http.post('/tinhnguyenvien', data);
      return response?.data || response;
    } catch (error) {
      console.error('Error creating tình nguyện viên:', error);
      throw {
        message: error.response?.data?.message || 'Lỗi khi tạo tình nguyện viên',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  },
  getAll: async () => {
    try {
      const response = await http.get('/tinhnguyenvien');
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching tình nguyện viên list:', error);
      throw {
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách tình nguyện viên',
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }
};
