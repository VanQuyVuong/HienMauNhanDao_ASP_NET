import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donDangKyService } from '../services/donDangKy';
import { tinhNguyenVienService } from '../services/tinhNguyenVienService';
import Swal from 'sweetalert2';

export default function DanhSachDonDangKy() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [maTNV, setMaTNV] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem('email');
        if (!email) {
          setError('Vui lòng đăng nhập');
          navigate('/login');
          return;
        }

        // Get user's TNV info
        const userInfo = await tinhNguyenVienService.getByMaTaiKhoan(email);
        if (!userInfo || !userInfo.maTNV) {
          setError('Danh sách rỗng!');
          return;
        }

        setMaTNV(userInfo.maTNV);

        // Fetch registrations
        const response = await donDangKyService.getByMaTNV(userInfo.maTNV, page, 10);
        if (response?.content) {
          setRegistrations(response.content);
          setHasMore(!response.last);
        }
        setError(null);
      } catch (err) {
        setError('Lỗi tải danh sách đơn đăng ký');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [page, navigate]);

  const handleViewDetail = (maDon) => {
    navigate(`/don-dang-ky-detail/${maDon}`);
  };

  const handleCancel = (maDon) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn có thực sự muốn hủy đơn đăng ký này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#af101a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Có, hủy ngay!',
      cancelButtonText: 'Không'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await donDangKyService.cancel(maDon);
          setRegistrations(prev => prev.map(reg => reg.maDon === maDon ? { ...reg, trangThai: 'DA_HUY' } : reg));
          Swal.fire({ title: 'Đã hủy!', text: 'Đơn đăng ký đã được hủy.', icon: 'success', confirmButtonColor: '#af101a', timer: 1800, showConfirmButton: false });
        } catch (error) {
          console.error('Error canceling registration:', error);
          Swal.fire('Lỗi!', 'Có lỗi xảy ra khi hủy đơn đăng ký.', 'error');
        }
      }
    });
  };

  const handleReRegister = async (maDon, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Đăng ký lại?',
      text: 'Bạn muốn đăng ký lại đơn hiến máu này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#af101a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đăng ký lại',
      cancelButtonText: 'Không',
    });
    if (!result.isConfirmed) return;
    try {
      await donDangKyService.reRegister(maDon);
      setRegistrations(prev => prev.map(reg => reg.maDon === maDon ? { ...reg, trangThai: 'DA_DANG_KY' } : reg));
      Swal.fire({ title: 'Đăng ký lại thành công!', text: 'Đơn đăng ký đã được khôi phục.', icon: 'success', confirmButtonColor: '#af101a', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Không thể đăng ký lại!', error.message || 'Chiến dịch đã kết thúc hoặc có lỗi xảy ra.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : '';
    // Handle both enum keys and Vietnamese strings
    if (s.includes('ĐÃ ĐĂNG KÝ') || s === 'DA_DANG_KY') return { label: 'Đã đăng ký', color: 'bg-blue-100 text-blue-700' };
    if (s.includes('CHỨNG NHẬN') || s === 'DA_NHAN_CHUNG_NHAN') return { label: 'Đã nhận chứng nhận', color: 'bg-green-100 text-green-700' };
    if (s.includes('ĐÃ HIẾN') || s === 'DA_HIEN' || s === 'DA_HIEN_MAU') return { label: 'Đã hiến máu', color: 'bg-green-100 text-green-700' };
    if (s.includes('CHƯA HIẾN') || s === 'CHUA_HIEN') return { label: 'Chưa hiến', color: 'bg-yellow-100 text-yellow-700' };
    if (s.includes('HỦY') || s === 'DA_HUY' || s === 'HUY') return { label: 'Đã hủy', color: 'bg-gray-200 text-gray-500' };
    
    return { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-[#F3F4F6] min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Danh Sách Đơn Đăng Ký</h1>
          <p className="text-slate-500 text-sm mt-2">Xem tất cả các đơn đăng ký hiến máu của bạn</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-slate-500 text-center">
              <div className="mb-4">
                <span className="material-symbols-outlined text-6xl text-slate-300 animate-spin inline-block" style={{ animation: 'spin 1s linear infinite' }}>
                  sync
                </span>
              </div>
              <p>Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-6xl text-red-300 flex justify-center mb-4">
              error
            </span>
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 flex justify-center mb-4">
              assignment
            </span>
            <p className="text-slate-600 font-semibold mb-4">Bạn chưa có đơn đăng ký nào</p>
            <p className="text-slate-500 text-sm mb-6">Hãy đăng ký tham gia một chiến dịch hiến máu để bắt đầu</p>
            <button
              onClick={() => navigate('/chiendich')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-800 transition-colors font-bold"
            >
              Xem Chiến Dịch
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => {
              const statusBadge = getStatusBadge(registration.trangThai);
              const s = registration.trangThai ? registration.trangThai.toUpperCase() : '';
              const isHuy = s.includes('HỦY') || s === 'DA_HUY' || s === 'HUY';
              const isDaDangKy = s.includes('ĐÃ ĐĂNG KÝ') || s === 'DA_DANG_KY';
              const isDaHien = s.includes('ĐÃ HIẾN') || s.includes('CHỨNG NHẬN') || ['DA_HIEN', 'DA_HIEN_MAU', 'DA_NHAN_CHUNG_NHAN'].includes(s);

              return (
                <div
                  key={registration.maDon}
                  onClick={() => handleViewDetail(registration.maDon)}
                  className={`border rounded-2xl p-4 sm:p-6 transition-all cursor-pointer
                    ${isHuy
                      ? 'bg-gray-50 border-gray-200 opacity-70 hover:opacity-90 hover:shadow-md'
                      : 'bg-white border-slate-200 hover:shadow-lg hover:border-primary'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                        <h3 className={`text-base sm:text-lg font-bold ${isHuy ? 'text-gray-500' : 'text-slate-800'}`}>{registration.maDon}</h3>
                        <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-full ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {isDaDangKy && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(registration.maDon); }}
                            className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-200 text-center flex justify-center items-center"
                          >
                            Hủy đăng ký
                          </button>
                        )}
                        {isHuy && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReRegister(registration.maDon, e); }}
                            className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px]">refresh</span>
                            Đăng ký lại
                          </button>
                        )}
                        {isDaHien && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/chung-nhan/${registration.maDon}`); }}
                            className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors border border-green-200 flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">card_membership</span>
                            Giấy chứng nhận
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Chiến Dịch</p>
                          <p className={`text-sm font-semibold ${isHuy ? 'text-gray-400' : 'text-slate-700'}`}>
                            {registration.chienDich?.tenChienDich || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Thời Gian Đăng Ký</p>
                          <p className={`text-sm font-semibold ${isHuy ? 'text-gray-400' : 'text-slate-700'}`}>
                            {new Date(registration.thoiGianDangKy).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${isHuy ? 'text-gray-400' : 'text-primary'}`}>location_on</span>
                        <p className={`text-sm ${isHuy ? 'text-gray-400' : 'text-slate-600'}`}>
                          {registration.chienDich?.diaDiem?.tenDiaDiem || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-slate-50 rounded-lg">
                      <span className={`material-symbols-outlined ${isHuy ? 'text-gray-300' : 'text-slate-400'}`}>arrow_forward</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trang trước
              </button>
              <span className="px-4 py-2 text-slate-600 font-semibold">Trang {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
