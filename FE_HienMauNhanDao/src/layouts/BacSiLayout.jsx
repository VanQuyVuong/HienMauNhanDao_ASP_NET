import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { nhanVienService } from '../services/nvytService';
import { ketQuaXetNghiemService } from '../services/khamLamSangService';

const NAV_ITEMS = [
  {
    label: 'Danh sách chờ khám',
    icon: 'groups',
    path: '/bac-si/danh-sach-cho-kham',
  },
  {
    label: 'Khám lâm sàng',
    icon: 'clinical_notes',
    path: '/bac-si/kham-lam-sang',
  },
];

export default function BacSiLayout() {
  const navigate = useNavigate();
  const [nhanVien, setNhanVien] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchPendingCount = async () => {
    try {
      const res = await ketQuaXetNghiemService.getAll();
      const data = Array.isArray(res) ? res : (res?.data || []);
      const count = data.filter(xn => xn.ketQua === null || xn.ketQua === undefined).length;
      setPendingCount(count);
    } catch (err) {
      console.error('Lỗi khi lấy số lượng chờ xét nghiệm:', err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'BS') {
      navigate('/login', { replace: true });
      return;
    }
    const email = (localStorage.getItem('email') || '').trim();
    const userId = (localStorage.getItem('userId') || '').trim();
    const cachedMaNV = (localStorage.getItem('maNV') || '').trim();

    const load = async () => {
      let data = null;
      if (email) data = await nhanVienService.getByMaTaiKhoan(email);
      if (!data && userId) data = await nhanVienService.getByMaTaiKhoan(userId);
      if (data) {
        setNhanVien({
          ...data,
          maNV: (data.maNV && String(data.maNV).trim()) || cachedMaNV || undefined,
          hoVaTen: data.hoVaTen || email || 'Bác sĩ chuyên khoa',
        });
      } else {
        setNhanVien({ hoVaTen: 'Bác sĩ chuyên khoa', maNV: cachedMaNV || '---' });
      }
    };
    load();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const initials = nhanVien
    ? (nhanVien.hoVaTen || '').split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase()
    : 'BS';

  return (
    <div className="w-full min-h-screen flex bg-slate-50 font-sans antialiased">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Cyber Clinical Sidebar for Doctor */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white border-r border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 md:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-teal-500/30">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              stethoscope
            </span>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-teal-400 tracking-wider leading-tight">
              Phân Hệ Bác Sĩ
            </p>
            <h2 className="text-sm font-extrabold text-white tracking-tight">
              Khám Lâm Sàng
            </h2>
          </div>
        </div>

        {/* Doctor Profile Card */}
        <div className="px-4 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-inner">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate">
                {nhanVien ? (nhanVien.hoVaTen || 'Bác sĩ') : 'Đang tải...'}
              </p>
              <p className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                🩺 BS. Chuyên Khoa
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Mã BS: {nhanVien?.maNV || '---'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
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

                  {item.path === '/bac-si/danh-sach-cho-kham' && pendingCount > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-3.5 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-2xl text-xs font-extrabold text-slate-400 hover:bg-rose-950/60 hover:text-rose-300 transition-all border border-transparent hover:border-rose-800/40 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Mobile Navbar Toggle */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Trạm Khám Lâm Sàng Y Tế</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800">{nhanVien?.hoVaTen || 'Bác sĩ chuyên khoa'}</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 font-black text-xs flex items-center justify-center">
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
