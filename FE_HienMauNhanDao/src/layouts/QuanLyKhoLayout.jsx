import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import http from '../utils/http';

export default function QuanLyKhoLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [pendingImportCount, setPendingImportCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchPendingImportCount = async () => {
    try {
      const res = await http.get('/tuimau');
      const data = Array.isArray(res) ? res : (res?.data || []);
      const count = data.filter(tm => tm.trangThai === 'Yêu cầu nhập kho').length;
      setPendingImportCount(count);
    } catch (err) {
      console.error('Lỗi khi lấy số lượng yêu cầu nhập kho:', err);
    }
  };

  useEffect(() => {
    fetchPendingImportCount();
    const interval = setInterval(fetchPendingImportCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Xóa toàn bộ token và role
    navigate('/login');
  };

  // Lấy thông tin đăng nhập từ localStorage
  const email = localStorage.getItem('email') || "User";
  const nameDisplay = email.split('@')[0]; // Lấy phần trước @ làm tên hiển thị
  const roleCode = localStorage.getItem('role') || "QLK";
  const roleDisplay = roleCode === 'QLK' ? 'Quản Lý Kho' : 'Nhân Viên';

  const session = {
    name: nameDisplay,
    role: roleDisplay
  };
  const initials = session.name.substring(0, 2).toUpperCase();

  const menu = [
    { page: '/quan-ly-kho/benh-vien', icon: 'local_hospital', label: 'Kho Bệnh Viện & Quét Mã' },
    { page: '/quan-ly-kho/thong-ke', icon: 'pie_chart', label: 'Thống kê tồn kho' },
    { page: '/quan-ly-kho/nhap-kho', icon: 'add_box', label: 'Quản lý nhập kho' },
    { page: '/quan-ly-kho/quan-ly-han-dung', icon: 'timer_off', label: 'Quản lý hạn dùng' },
  ];

  return (
    <div className="w-full min-h-screen flex bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      {/* Sidebar mobile overlay backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-lg transition-transform duration-300 md:translate-x-0 md:relative md:shadow-sm shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>bloodtype</span>
          </div>
          <div>
            <h1 className="font-black text-red-700 text-sm leading-tight">Hệ thống Hiến máu</h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">TP. Đà Nẵng</p>
          </div>
        </div>
        
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                 style={{ background: 'linear-gradient(135deg,#af101a,#d32f2f)' }}>{initials}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{session.name}</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">{session.role}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menu.map((item, index) => {
            const active = currentPath === item.page;
            const isNhapKho = item.page === '/quan-ly-kho/nhap-kho';
            return (
              <Link key={index} to={item.page}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${active ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-red-700'}`}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {isNhapKho && pendingImportCount > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse ${
                    active ? 'bg-red-700 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {pendingImportCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 transition-all">
            <span className="material-symbols-outlined text-xl text-slate-400">logout</span>Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input type="text" placeholder="Tìm kiếm nhanh..."
                     className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm
                            focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"/>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-slate-500 text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">{session.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tight">{session.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                   style={{ background: 'linear-gradient(135deg,#af101a,#d32f2f)' }}>{initials}</div>
            </div>
            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors" title="Đăng xuất">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
