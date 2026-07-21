import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { nhanVienService } from '../services/nvytService';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Đơn đăng ký',
    icon: 'description',
    path: '/nvyt/don-dang-ky',
  },
  {
    label: 'Tình nguyện viên',
    icon: 'group',
    path: '/nvyt/tinh-nguyen-vien',
  },
  {
    label: 'Khai báo y tế',
    icon: 'fact_check',
    path: '/nvyt/khai-bao-y-te',
  },
  {
    label: 'Cập nhật XN',
    icon: 'biotech',
    path: '/nvyt/cap-nhat-xet-nghiem',
  },
  {
    label: 'Thu nhận máu',
    icon: 'vaccines',
    path: '/nvyt/thu-nhan-mau',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function NVYTLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nhanVien, setNhanVien] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lấy thông tin nhân viên từ localStorage → API
  useEffect(() => {
    const role = localStorage.getItem('role');
    const userId = (localStorage.getItem('userId') || '').trim();
    const email = (localStorage.getItem('email') || '').trim();

    if (role !== 'NVYT') {
      navigate('/login', { replace: true });
      return;
    }

    const cachedMaNV = (localStorage.getItem('maNV') || '').trim();

    const loadNhanVien = async () => {
      let data = null;
      if (userId) data = await nhanVienService.getByMaTaiKhoan(userId);
      if (!data && email) data = await nhanVienService.getByMaTaiKhoan(email);

      if (data) {
        setNhanVien({
          ...data,
          maNV: (data.maNV && String(data.maNV).trim()) || cachedMaNV || undefined,
          hoVaTen: data.hoVaTen || email || 'Nhân viên y tế',
        });
      } else {
        setNhanVien({
          hoVaTen: email || 'Tài khoản NVYT',
          maNV: cachedMaNV || '---',
        });
      }
    };

    loadNhanVien();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const initials = nhanVien
    ? (nhanVien.hoVaTen || '').split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="w-full min-h-screen flex bg-[#F3F4F6] font-sans antialiased">
      {/* Sidebar mobile overlay backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-lg transition-transform duration-300 md:translate-x-0 md:relative md:shadow-sm shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-primary tracking-wider leading-tight">
              Hệ thống Hiến máu
            </p>
            <p className="text-[10px] text-slate-400 font-medium">TP. Đà Nẵng</p>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black shrink-0 shadow">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {nhanVien ? (nhanVien.hoVaTen || 'Nhân viên') : 'Đang tải...'}
              </p>
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest">
                Nhân viên y tế
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Mã NV: {nhanVien?.maNV || '---'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                ${isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-xl shrink-0"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            {/* Search */}
            <div className="relative w-48 sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhanh..."
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors relative"
              >
                <span className="material-symbols-outlined text-slate-500 text-xl">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
                  <p className="text-sm font-bold text-slate-700 mb-3">Thông báo</p>
                  <p className="text-xs text-slate-400 text-center py-4">Không có thông báo mới</p>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">
                  {initials}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {nhanVien ? (nhanVien.hoVaTen || 'BS.') : 'Đang tải...'}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-primary tracking-widest">
                    Nhân viên y tế
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    ID: {nhanVien?.maNV || '---'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-base">expand_more</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Đăng nhập với</p>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {localStorage.getItem('email') || ''}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
          <Outlet context={{ nhanVien, searchQuery }} />
        </main>
      </div>

      {/* Click outside to close menus */}
      {(notifOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotifOpen(false); setUserMenuOpen(false); }}
        />
      )}
    </div>
  );
}
