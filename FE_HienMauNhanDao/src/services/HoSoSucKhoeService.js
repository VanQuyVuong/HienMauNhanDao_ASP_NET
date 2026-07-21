import http from "../utils/http";

export const hoSoSucKhoeService = {
    /**
     * Tạo hồ sơ sức khỏe mới
     * @param {Object} data - Thông tin sức khỏe
     * @param {string} data.maDon - Mã đơn đăng ký (bắt buộc)
     * @param {boolean} data.khangSinh - Có đang dùng kháng sinh?
     * @param {boolean} data.truyenNhiem - Có mắc bệnh truyền nhiễm?
     * @param {boolean} data.dauHong - Có cảm thấy đau họng, sốt?
     * @param {boolean} data.coThai - Đang mang thai hoặc cho con bú?
     * @param {string} data.moTaKhac - Mô tả khác (tùy chọn)
     * @returns {Promise<Object>} Hồ sơ sức khỏe vừa tạo
     */
    create: async (data) => {
        try {
            const response = await http.post('/hososuckhoe', data);
            // http interceptor đã unwrap, response = ApiResponse { status, message, data }
            return response?.data || response;
        } catch (error) {
            console.error('Error creating hồ sơ sức khỏe:', error);
            throw {
                message: error.response?.data?.message || 'Lỗi khi lưu hồ sơ sức khỏe',
                status: error.response?.status,
                data: error.response?.data
            };
        }
    },

    /**
     * Lấy tất cả hồ sơ sức khỏe
     * @returns {Promise<Array>} Danh sách hồ sơ sức khỏe
     */
    getAll: async () => {
        try {
            const response = await http.get('/hososuckhoe');
            return response?.data || [];
        } catch (error) {
            console.error('Error fetching hồ sơ sức khỏe:', error);
            throw error;
        }
    },

    /**
     * Lấy hồ sơ sức khỏe theo ID
     * @param {string} id - ID hồ sơ sức khỏe
     * @returns {Promise<Object>} Thông tin hồ sơ sức khỏe
     */
    getById: async (id) => {
        try {
            const response = await http.get(`/hososuckhoe/${id}`);
            return response?.data || response;
        } catch (error) {
            console.error(`Error fetching hồ sơ sức khỏe ${id}:`, error);
            throw error;
        }
    },

    /**
     * Cập nhật hồ sơ sức khỏe
     * @param {string} id - ID hồ sơ sức khỏe
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Hồ sơ sức khỏe đã cập nhật
     */
    update: async (id, data) => {
        try {
            const response = await http.put(`/hososuckhoe/${id}`, data);
            return response?.data || response;
        } catch (error) {
            console.error(`Error updating hồ sơ sức khỏe ${id}:`, error);
            throw error;
        }
    }
}