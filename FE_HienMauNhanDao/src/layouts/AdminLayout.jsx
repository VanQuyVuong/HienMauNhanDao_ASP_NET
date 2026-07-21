import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Quản lý người dùng', icon: 'manage_accounts', path: '/admin/nguoi-dung' },
  { label: 'Quản lý chiến dịch', icon: 'campaign', path: '/admin/chien-dich' },
  { label: 'Cấp chứng nhận', icon: 'workspace_premium', path: '/admin/chung-nhan' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const email = localStorage.getItem('email') || 'Admin';
  const nameDisplay = email.split('@')[0];
  const initials = nameDisplay.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen flex bg-[#F3F4F6] font-sans antialiased">
      {/* Sidebar mobile overlay backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-lg transition-transform duration-300 md:translate-x-0 md:relative md:shadow-sm shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
            <p className="text-[10px] text-slate-400 font-medium">TP. Đà Nẵng · Quản trị</p>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black shrink-0 shadow">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{nameDisplay}</p>
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest">
                Quản trị viên
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
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
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
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

          <div className="flex items-center gap-3">
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

            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">
                  {initials}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{nameDisplay}</p>
                  <p className="text-[10px] font-bold uppercase text-primary tracking-widest">
                    Quản trị viên
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-base">expand_more</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Đăng nhập với</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{email}</p>
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

        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {(notifOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotifOpen(false); setUserMenuOpen(false); }}
        />
      )}
    </div>
  );
}
