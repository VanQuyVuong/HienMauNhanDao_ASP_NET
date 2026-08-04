import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { nhanVienService, donDangKyNvytService } from '../services/nvytService';
import { ketQuaXetNghiemService } from '../services/khamLamSangService';

// ─── Sidebar nav items cho Lễ Tân (3 trang) ─────────────────────────
const LE_TAN_NAV_ITEMS = [
  {
    label: 'Đơn đăng ký & Tiếp nhận',
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
];

// ─── Sidebar nav items cho Xét Nghiệm & Lấy Máu ───────────────────────
const XET_NGHIEM_NAV_ITEMS = [
  {
    label: 'Thu nhận & Sinh mã barcode túi máu',
    icon: 'vaccines',
    path: '/nvyt/thu-nhan-mau',
  },
  {
    label: 'Cập nhật XN & Re-test Kho',
    icon: 'biotech',
    path: '/nvyt/cap-nhat-xet-nghiem',
  },
];

export default function NVYTLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nhanVien, setNhanVien] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Live Notification Badge Counters
  const [pendingDonCount, setPendingDonCount] = useState(0);
  const [pendingBarcodeCount, setPendingBarcodeCount] = useState(0);
  const [pendingTestCount, setPendingTestCount] = useState(0);

  const fetchBadgeCounts = async () => {
    try {
      // 1. Un-checked-in donor registrations count for Le Tan
      try {
        const resDon = await donDangKyNvytService.getAll(0, 1000);
        const dons = Array.isArray(resDon) ? resDon : (resDon?.content || resDon?.data || []);
        const pendingDons = dons.filter(d => 
          !d.maNhanVien && !d.maNV && (d.trangThai === 'DA_DANG_KY' || d.trangThai === 'Đã đăng ký' || d.trangThai === 'Pending' || d.trangThai === 'CHO_DUYET')
        ).length;
        setPendingDonCount(pendingDons);
      } catch (e) { console.warn('Lỗi lấy đếm đơn tiếp nhận:', e); }

      // 2. Un-barcoded blood bag registrations count for NVXN
      try {
        const resColl = await donDangKyNvytService.getReadyForCollection();
        const colls = Array.isArray(resColl) ? resColl : (resColl?.data || []);
        const pendingBarcodes = colls.filter(d => !d.daCapMa).length;
        setPendingBarcodeCount(pendingBarcodes);
      } catch (e) { console.warn('Lỗi lấy đếm sinh mã barcode:', e); }

      // 3. Pending lab microbiology tests count for NVXN
      try {
        const resXn = await ketQuaXetNghiemService.getAll();
        const xns = Array.isArray(resXn) ? resXn : (resXn?.data || []);
        const pendingTests = xns.filter(xn => xn.ketQua === null || xn.ketQua === undefined).length;
        setPendingTestCount(pendingTests);
      } catch (e) { console.warn('Lỗi lấy đếm chờ xét nghiệm:', e); }

    } catch (err) {
      console.error('Lỗi khi fetch badge counts:', err);
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auth & Personnel Info Fetch
  useEffect(() => {
    const role = localStorage.getItem('role');
    const userId = (localStorage.getItem('userId') || '').trim();
    const email = (localStorage.getItem('email') || '').trim();

    const isNvytRole = ['NVYT', 'NVYT_LT', 'NVYT-LT', 'NVYT_XN', 'NVYT-XN'].includes(role);
    if (!isNvytRole) {
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
    : 'NV';

  const role = (localStorage.getItem('role') || '').trim();
  const isXn = role === 'NVYT_XN' || role === 'NVYT-XN';

  return (
    <div className="w-full min-h-screen flex bg-rose-50/40 font-sans antialiased">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Ruby Blood Life Sidebar for NVYT */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white text-slate-800 border-r border-rose-100 flex flex-col shadow-sm transition-transform duration-300 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-rose-100 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-sm border border-white/20">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              water_drop
            </span>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-rose-100 tracking-wider leading-tight">
              Hiến Máu Nhân Đạo
            </p>
            <h2 className="text-sm font-black text-white tracking-tight">
              {isXn ? '🔬 NVYT Xét Nghiệm' : '📋 NVYT Lễ Tân'}
            </h2>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-rose-100/60 bg-rose-50/30">
          <div className="flex items-center gap-3 p-3 bg-white border border-rose-100 rounded-2xl shadow-2xs">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-800 truncate">
                {nhanVien ? (nhanVien.hoVaTen || 'Nhân viên') : 'Đang tải...'}
              </p>
              <p className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                {isXn ? '🔬 Cán bộ Xét Nghiệm' : '📋 Cán bộ Lễ Tân'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Mã NV: {nhanVien?.maNV || '---'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Items with Live Badge Counter Pills */}
        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {(() => {
            const navItems = isXn ? XET_NGHIEM_NAV_ITEMS : LE_TAN_NAV_ITEMS;
            return navItems.map((item) => {
              let count = 0;
              if (item.path === '/nvyt/don-dang-ky') count = pendingDonCount;
              else if (item.path === '/nvyt/thu-nhan-mau') count = pendingBarcodeCount;
              else if (item.path === '/nvyt/cap-nhat-xet-nghiem') count = pendingTestCount;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-black transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                        : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
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
                      <span className="truncate flex-1">{item.label}</span>

                      {count > 0 && (
                        <span className={`px-2.5 py-0.5 text-xs font-black rounded-full shadow-sm border transition-all ${
                          isActive
                            ? 'bg-white text-rose-700 shadow-rose-900/20 border-white scale-105'
                            : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-rose-500/30 border-rose-400'
                        }`}>
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            });
          })()}
        </nav>

        {/* Logout Button */}
        <div className="px-3.5 py-4 border-t border-rose-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-2xl text-xs font-extrabold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Mobile Navbar Toggle */}
        <header className="h-16 bg-white border-b border-rose-100 px-4 md:px-8 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-rose-50 rounded-xl md:hidden"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {isXn ? 'Khoa Xét Nghiệm & Quản Lý Túi Máu' : 'Bàn Lễ Tân Tiếp Nhận Tình Nguyện Viên'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800">{nhanVien?.hoVaTen || 'Cán bộ NVYT'}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-black text-xs flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content Render */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet context={{ nhanVien }} />
        </main>
      </div>
    </div>
  );
}
