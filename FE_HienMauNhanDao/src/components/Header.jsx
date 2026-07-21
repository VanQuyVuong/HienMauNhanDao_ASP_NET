import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { donDangKyService } from '../services/donDangKy';
import { tinhNguyenVienService } from '../services/tinhNguyenVienService';

// Các trạng thái cần lọc ra - chỉ hiện thông báo khi KHÔNG phải những trạng thái này
const TRANG_THAI_AN = ['Đã đăng ký', 'Chưa hiến', 'Hủy'];

// Hàm lấy màu & icon dựa trên trạng thái
function getStatusStyle(trangThai) {
  const tt = (trangThai || '').toLowerCase();
  if (tt.includes('hiến') || tt.includes('hoàn thành')) {
    return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: 'favorite', dot: 'bg-green-500' };
  }
  if (tt.includes('từ chối') || tt.includes('không đủ')) {
    return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: 'cancel', dot: 'bg-red-500' };
  }
  if (tt.includes('khám') || tt.includes('chờ')) {
    return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: 'medical_services', dot: 'bg-blue-500' };
  }
  return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'info', dot: 'bg-amber-500' };
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  const [hasCampaign, setHasCampaign] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const wrapper = document.getElementById('notif-bell-wrapper');
      if (wrapper && !wrapper.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  // Set chứa maDon đã đọc, lưu vào localStorage
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('readNotifIds');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch { return new Set(); }
  });

  useEffect(() => {
    const campaign = localStorage.getItem('selectedCampaign');
    setHasCampaign(!!campaign);
  }, [location]);

  // Fetch thông báo khi đăng nhập
  useEffect(() => {
    if (!token || !userEmail) return;
    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        const tnv = await tinhNguyenVienService.getByMaTaiKhoan(userEmail);
        if (!tnv?.maTNV) return;
        const data = await donDangKyService.getByMaTNV(tnv.maTNV, 0, 20);
        const list = Array.isArray(data) ? data : (data?.content || []);
        // Chỉ giữ đơn có trạng thái đáng thông báo
        const filtered = list.filter(d => !TRANG_THAI_AN.includes(d.trangThai));
        setNotifications(filtered);
      } catch (err) {
        console.error('Lỗi lấy thông báo:', err);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifications();
  }, [token, userEmail]);

  // Đánh dấu tất cả thông báo hiện tại là đã đọc
  const markAllAsRead = useCallback(() => {
    if (notifications.length === 0) return;
    setReadIds(prev => {
      const next = new Set(prev);
      notifications.forEach(n => next.add(String(n.maDon)));
      localStorage.setItem('readNotifIds', JSON.stringify([...next]));
      return next;
    });
  }, [notifications]);

  // Đánh dấu một thông báo đã đọc khi click
  const markOneAsRead = useCallback((maDon) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(String(maDon));
      localStorage.setItem('readNotifIds', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const unreadCount = notifications.filter(n => !readIds.has(String(n.maDon))).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  // Helper để xác định class cho link đang active
  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "px-4 py-2 text-primary font-bold border-b-2 border-primary transition-colors uppercase text-sm"
      : "px-4 py-2 text-slate-700 hover:text-primary font-bold border-b-2 border-transparent hover:border-primary transition-colors uppercase text-sm";
  };

  return (
    <>
      <div className="w-full bg-slate-800 text-white text-[11px] font-medium py-1.5 px-8 hidden md:flex justify-between items-center">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">location_on</span>Địa chỉ: 123 Lê Lợi, Hải Châu, Đà Nẵng</span>
          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">call</span>Đường dây nóng: 1900 1234</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <a href="#" className="hover:text-primary transition-colors">Facebook</a>
            <a href="#" className="hover:text-primary transition-colors">Zalo</a>
          </div>
          <div className="h-3 w-[1px] bg-slate-600"></div>
          <a href="#" className="hover:text-primary transition-colors">Hỗ trợ</a>
        </div>
      </div>

      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto h-20 md:h-24 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 sm:gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-red-700 leading-tight">HỆ THỐNG HIẾN MÁU</h1>
              <p className="text-[9px] sm:text-[11px] uppercase tracking-widest text-slate-500 font-bold">TP. Đà Nẵng</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Link className={navLinkClass('/')} to="/">Trang chủ</Link>
            <Link className={navLinkClass('/about')} to="/about">Giới thiệu</Link>
            <Link className={navLinkClass('/chiendich')} to="/chiendich">Chiến dịch</Link>
            {/* {token && <Link className={navLinkClass('/don-dang-ky')} to="/don-dang-ky">Đơn đăng ký</Link>} */}
          </nav>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                {/* === CHUÔNG THÔNG BÁO - HOVER === */}
                <div
                  className="relative"
                  id="notif-bell-wrapper"
                >
                  {/* Nút chuông */}
                  <button
                    id="notif-bell-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotifOpen(!isNotifOpen);
                      if (!isNotifOpen) {
                        setTimeout(markAllAsRead, 1000);
                      }
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-full relative transition-colors duration-200 ${
                      isNotifOpen ? 'bg-red-50 text-primary' : 'text-slate-600 hover:bg-red-50 hover:text-primary'
                    }`}
                    aria-label="Thông báo"
                    type="button"
                  >
                    <span
                      className={`material-symbols-outlined transition-all duration-200 ${
                        isNotifOpen ? "[font-variation-settings:'FILL'_1]" : ""
                      }`}
                    >notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-600 rounded-full ring-2 ring-white animate-pulse flex items-center justify-center">
                        <span className="text-white text-[9px] font-black leading-none px-0.5">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Dropdown - hiện khi click */}
                  <div
                    id="notif-dropdown"
                    className={`absolute right-[-60px] sm:right-0 top-full pt-2 w-[300px] sm:w-[360px] z-[100]
                               transition-all duration-200 ease-out
                               ${isNotifOpen
                                 ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                                 : 'opacity-0 invisible translate-y-2 pointer-events-none'
                               }`}
                  >
                    {/* Outer box */}
                    <div
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
                    >
                      {/* Header gradient đỏ */}
                      <div className="px-5 py-4 bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-white text-[20px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >notifications_active</span>
                          <span className="text-white font-bold text-sm tracking-wide">THÔNG BÁO CỦA BẠN</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-white text-red-600 text-xs font-black px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Nội dung */}
                      <div className="p-3 max-h-[400px] overflow-y-auto space-y-2">
                        {notifLoading ? (
                          <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                            <span className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-sm font-medium">Đang tải thông báo...</span>
                          </div>
                        ) : notifications.length === 0 ? (
                          /* Chưa có thông báo */
                          <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                              <span
                                className="material-symbols-outlined text-slate-300 text-3xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >notifications_off</span>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-700 font-bold text-sm">Chưa có thông báo nào</p>
                              <p className="text-slate-400 text-xs mt-1">Thông báo sẽ xuất hiện khi có cập nhật về đơn đăng ký hiến máu của bạn.</p>
                            </div>
                          </div>
                        ) : (
                          /* Danh sách thông báo - box lồng box */
                          notifications.map((don) => {
                            const style = getStatusStyle(don.trangThai);
                            const isRead = readIds.has(String(don.maDon));
                            return (
                              <button
                                key={don.maDon}
                                onClick={() => {
                                  markOneAsRead(don.maDon);
                                  const tt = (don.trangThai || '').toLowerCase();
                                  if (tt.includes('hiến') && !tt.includes('chưa')) {
                                    navigate(`/chung-nhan/${don.maDon}`);
                                  } else if (tt.includes('chứng nhận') || tt.includes('hoàn thành')) {
                                    navigate(`/chung-nhan/${don.maDon}`);
                                  } else {
                                    navigate(`/xac-nhan-dang-ky/${don.maDon}`);
                                  }
                                }}
                                className={`w-full text-left rounded-xl border p-3 transition-all duration-150 active:scale-[0.98] ${
                                  isRead
                                    ? 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 opacity-60'
                                    : `${style.border} ${style.bg} hover:brightness-95`
                                }`}
                              >
                                {/* Inner box bên trong */}
                                <div className={`rounded-lg border shadow-sm p-3 flex items-start gap-3 ${
                                  isRead ? 'bg-white/70 border-slate-100' : 'bg-white border-slate-100'
                                }`}>
                                  {/* Chấm chưa đọc */}
                                  {!isRead && (
                                    <span className={`absolute mt-1 ml-1 w-2 h-2 rounded-full ${style.dot} shrink-0 self-start`} style={{ position: 'relative', top: '2px', flexShrink: 0 }}></span>
                                  )}
                                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
                                    isRead ? 'bg-slate-100 border-slate-200' : `${style.bg} ${style.border}`
                                  }`}>
                                    <span
                                      className={`material-symbols-outlined text-[18px] ${
                                        isRead ? 'text-slate-400' : style.color
                                      }`}
                                      style={{ fontVariationSettings: "'FILL' 1" }}
                                    >{style.icon}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className={`text-xs uppercase tracking-wider ${
                                        isRead ? 'font-medium text-slate-400' : 'font-black text-slate-500'
                                      }`}>{don.maDon}</span>
                                      <div className="flex items-center gap-1.5">
                                        {!isRead && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0"></span>
                                        )}
                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                          isRead
                                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                                            : `${style.bg} ${style.color} ${style.border}`
                                        }`}>
                                          {don.trangThai}
                                        </span>
                                      </div>
                                    </div>
                                    <p className={`text-[13px] leading-snug ${
                                      isRead ? 'font-normal text-slate-400' : 'font-semibold text-slate-800'
                                    }`}>
                                      Đơn đăng ký hiến máu của bạn đã được cập nhật trạng thái.
                                    </p>
                                    <p className={`text-[11px] mt-1 flex items-center gap-1 ${
                                      isRead ? 'text-slate-300' : 'text-slate-400'
                                    }`}>
                                      <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                                      {isRead ? 'Đã xem' : 'Nhấn để xem chi tiết'}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                          <Link
                            to="/don-dang-ky"
                            className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1"
                          >
                            Xem tất cả đơn đăng ký
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer relative group py-2">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-900 leading-none mb-1">{userEmail}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Tình nguyện viên</p>
                  </div>
                  <img alt="User portrait" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container/20 shrink-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZrkDisk3_j22F4lcXb3jllF-99BYq3_SrntgHddIgx0onK2l25zj9yhgH0CmKsiDKHkcKkj4fUkJYPLzjVjDwaqQGvaw9tMIBFeFdSruc8nrljijQYlXObDS9Cl8vGxmXo6QmITg4G4hMQYoZ8uopbYnk178pDHgbWOMuPbFk0gIfxKgLIZPEvBzsxP0L8DjAy2sjgVh-OfYdDzSpRdcdxYlZ4c9LNMFhhzsp2kBlmP-sFmYmsUQVv-D164nUzgWv_CxOokcTNjOZ" />
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link to="/don-dang-ky" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">assignment</span>Đơn đăng ký
                      </Link>
                      <Link to="/ho-so" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person</span>Hồ sơ cá nhân
                      </Link>
                      <div className="h-[1px] bg-slate-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">logout</span>Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="px-5 py-2 text-[#e62e43] font-black border-2 border-[#e62e43] rounded-xl hover:bg-rose-50 transition-all shadow-sm">Đăng nhập</Link>
                <Link to="/register" className="px-5 py-2 bg-[#e62e43] text-white font-black rounded-xl hover:bg-[#c01b30] transition-all shadow-sm">Đăng ký</Link>
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden"
            >
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <nav className="md:hidden flex flex-col bg-white border-b border-slate-200 px-6 py-4 space-y-3 shadow z-40 relative">
          <Link className="text-slate-700 hover:text-primary font-bold py-1.5 uppercase text-sm block" to="/" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link>
          <Link className="text-slate-700 hover:text-primary font-bold py-1.5 uppercase text-sm block" to="/about" onClick={() => setIsMenuOpen(false)}>Giới thiệu</Link>
          <Link className="text-slate-700 hover:text-primary font-bold py-1.5 uppercase text-sm block" to="/chiendich" onClick={() => setIsMenuOpen(false)}>Chiến dịch</Link>
          {token && (
            <>
              <div className="h-[1px] bg-slate-100 my-2"></div>
              <Link className="text-slate-700 hover:text-primary font-bold py-1.5 uppercase text-sm block" to="/don-dang-ky" onClick={() => setIsMenuOpen(false)}>Đơn đăng ký</Link>
              <Link className="text-slate-700 hover:text-primary font-bold py-1.5 uppercase text-sm block" to="/ho-so" onClick={() => setIsMenuOpen(false)}>Hồ sơ cá nhân</Link>
            </>
          )}
        </nav>
      )}
    </>
  );
}
