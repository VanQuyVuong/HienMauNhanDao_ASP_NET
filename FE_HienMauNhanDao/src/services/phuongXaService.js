import http from '../utils/http';

const API_BASE_URL = 'http://localhost:8080/api/phuongxa';

export const phuongXaService = {
  /**
   * Lấy danh sách tất cả phường/xã
   * @returns {Promise} Danh sách phường/xã
   */
  getAll: async () => {
    try {
      const response = await http.get('/phuongxa');
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching phường/xã list:', error);
      throw error;
    }
  },

  /**
   * Lấy phường/xã theo mã
   * @param {string} maPhuongXa - Mã phường/xã
   * @returns {Promise} Thông tin phường/xã
   */
  getById: async (maPhuongXa) => {
    try {
      const response = await http.get(`/phuongxa/${maPhuongXa}`);
      return response?.data;
    } catch (error) {
      console.error(`Error fetching phường/xã ${maPhuongXa}:`, error);
      throw error;
    }
  }
};
