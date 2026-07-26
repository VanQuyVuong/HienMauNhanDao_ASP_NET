import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Quản lý người dùng",
    icon: "manage_accounts",
    path: "/admin/nguoi-dung",
    badge: "Mới",
  },
  {
    label: "Quản lý chiến dịch",
    icon: "campaign",
    path: "/admin/chien-dich",
    badge: "Hot",
  },
  {
    label: "Cấp chứng nhận",
    icon: "workspace_premium",
    path: "/admin/chung-nhan",
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const email = localStorage.getItem("email") || "admin@bvdn.vn";
  const nameDisplay = email.split("@")[0];
  const initials = nameDisplay.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="relative w-full min-h-screen flex bg-gradient-to-br from-slate-50 via-rose-50/20 to-slate-100 font-sans antialiased overflow-x-hidden selection:bg-[#e62e43] selection:text-white">
      {/* 🔮 Background Ambient Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🪟 SIDEBAR - 100% Cố định bất động (Fixed Monolith, độc lập với nội dung trang) */}
      <aside
        className={`fixed inset-y-4 left-4 z-50 w-64 h-[calc(100vh-2rem)] bg-white/90 backdrop-blur-2xl border border-white/80 rounded-3xl flex flex-col justify-between shadow-2xl shadow-slate-900/5 transition-all duration-300 shrink-0 ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-[120%] md:translate-x-0"
        }`}
      >
        {/* Phần trên: Logo + User Card + Navigation List */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100/80 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e62e43] to-[#c01b30] flex items-center justify-center shrink-0 shadow-lg shadow-[#e62e43]/30 transform group-hover:rotate-6 transition-transform">
              <span
                className="material-symbols-outlined text-white text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#e62e43] to-slate-800 bg-clip-text text-transparent leading-tight">
                Hệ thống Hiến máu
              </p>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">
                ADMIN PORTAL · ĐÀ NẴNG
              </p>
            </div>
          </div>

          {/* User Card */}
          <div className="px-4 py-3 border-b border-slate-100/80 shrink-0">
            <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-rose-50/60 to-slate-50/80 rounded-2xl border border-rose-100/50">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e62e43] to-rose-400 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md shadow-[#e62e43]/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {nameDisplay}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">
                    Quản trị viên
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu (Cuộn riêng bên trong nếu menu dài) */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
              MENU NGHIỆP VỤ
            </p>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#e62e43] to-[#c01b30] text-white shadow-lg shadow-[#e62e43]/25 scale-[1.02] translate-x-1"
                      : "text-slate-600 hover:bg-rose-50/60 hover:text-[#e62e43] hover:translate-x-1.5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`material-symbols-outlined text-xl shrink-0 transition-transform duration-300 ${!isActive && "group-hover:scale-110"}`}
                        style={{
                          fontVariationSettings: isActive
                            ? "'FILL' 1"
                            : "'FILL' 0",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-rose-100 text-[#e62e43]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Phần dưới đáy: Widget y tế + Nút Đăng xuất luôn ghim cố định ở đáy */}
        <div className="shrink-0 pt-2 bg-white/50 border-t border-slate-100/80">
          {/* 🩺 System Status Widget thu nhỏ */}
          <div className="mx-4 mb-2 p-3 bg-slate-900 rounded-2xl text-white shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                An toàn y tế 24/7
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[9px] text-slate-400 leading-tight relative z-10">
              Hệ thống chuẩn hoá quy trình Bộ Y Tế.
            </p>
          </div>

          {/* Logout Button Neo Đáy */}
          <div className="p-3 pt-0">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-2xl text-xs font-black uppercase tracking-wider bg-rose-50/80 text-[#e62e43] hover:bg-[#e62e43] hover:text-white hover:shadow-lg hover:shadow-[#e62e43]/20 transition-all duration-300 group"
            >
              <span className="material-symbols-outlined text-lg shrink-0 group-hover:-translate-x-0.5 transition-transform">
                logout
              </span>
              <span>Đăng xuất hệ thống</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT AREA (Đã chừa lề md:pl-[21.5rem] để khoảng cách với Sidebar tự nhiên, thoáng đãng) */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:py-6 md:pr-6 md:pl-[21.5rem]">
        {/* Floating Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl px-6 md:px-8 flex items-center justify-between shrink-0 shadow-lg shadow-slate-900/5 z-30 mb-4 transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 text-slate-500 hover:bg-rose-50 hover:text-[#e62e43] rounded-xl md:hidden transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-52 sm:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm chiến dịch, người dùng..."
                className="w-full h-11 bg-slate-100/70 hover:bg-slate-100 border border-transparent rounded-2xl pl-11 pr-4 text-sm font-medium text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43]/30 focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setUserMenuOpen(false);
                }}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-100/70 hover:bg-rose-50 hover:text-[#e62e43] text-slate-600 transition-all relative"
                title="Thông báo"
              >
                <span className="material-symbols-outlined text-xl">
                  notifications
                </span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#e62e43] rounded-full ring-2 ring-white animate-pulse" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-14 w-80 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl shadow-2xl z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <p className="text-sm font-black text-slate-800">
                      Thông báo hệ thống
                    </p>
                    <span className="text-[10px] font-bold bg-rose-100 text-[#e62e43] px-2 py-0.5 rounded-full">
                      0 mới
                    </span>
                  </div>
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">
                      notifications_off
                    </span>
                    <p className="text-xs text-slate-400 font-medium">
                      Hiện không có thông báo nào
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-100/70 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200/60 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e62e43] to-rose-400 flex items-center justify-center text-white text-xs font-black shadow-sm">
                  {initials}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {nameDisplay}
                  </p>
                  <p className="text-[9px] font-black uppercase text-[#e62e43] tracking-widest">
                    Admin
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-base">
                  expand_more
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-3.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Đang đăng nhập:
                    </p>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                      {email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs text-red-600 hover:bg-rose-50 transition-colors font-bold"
                    >
                      <span className="material-symbols-outlined text-lg">
                        logout
                      </span>
                      Đăng xuất hệ thống
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {(notifOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotifOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
