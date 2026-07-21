/** Trích xuất message lỗi từ axios / ApiResponse */
export function getApiError(err, fallback = 'Có lỗi xảy ra') {
  const msg = err?.response?.data?.message;
  if (msg) return msg;
  if (err?.message && err.message !== 'Network Error') return err.message;
  if (err?.response?.status === 403) return 'Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.';
  if (err?.response?.status === 401) return 'Chưa đăng nhập hoặc token không hợp lệ.';
  return fallback;
}

/** Chuẩn hóa ApiResponse { success, data } hoặc mảng trực tiếp */
export function unwrapList(res) {
  if (Array.isArray(res)) return res;
  if (res && res.success === false) {
    throw new Error(res.message || 'Yêu cầu thất bại');
  }
  return res?.data ?? [];
}

export function unwrapData(res) {
  if (res && res.success === false) {
    throw new Error(res.message || 'Yêu cầu thất bại');
  }
  if (res && typeof res === 'object' && 'data' in res) return res.data;
  return res;
}
