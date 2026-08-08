import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Bảng điều khiển",
    icon: "dashboard",
    path: "/admin-bv/dashboard",
  },
  {
    label: "Quản lý Nhân sự",
    icon: "badge",
    path: "/admin-bv/nhan-su",
  },
  {
    label: "Quản lý Kho máu",
    icon: "bloodtype",
    path: "/admin-bv/kho-mau",
  },
  {
    label: "Tin tức & Thông báo",
    icon: "campaign",
    path: "/admin-bv/tin-tuc",
  },
  {
    label: "Chiến dịch Máu",
    icon: "event",
    path: "/admin-bv/chien-dich",
  }
];

export default function AdminHospitalLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const email = localStorage.getItem("email") || "adminbv@bvdn.vn";
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

      {/* 🪟 SIDEBAR - 100% Cố định bất động */}
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
                local_hospital
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#e62e43] to-slate-800 bg-clip-text text-transparent leading-tight">
                Hệ thống Nội bộ
              </p>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">
                QUẢN TRỊ BỆNH VIỆN
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
                    Admin Bệnh Viện
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-[#e62e43] to-rose-500 text-white shadow-lg shadow-[#e62e43]/20 border border-rose-400/30"
                      : "text-slate-600 hover:bg-rose-50/80 hover:text-[#e62e43] border border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Background hover effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] transition-transform duration-700 ease-in-out ${
                        isActive ? "group-hover:translate-x-[100%]" : ""
                      }`}
                    />

                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center transition-transform duration-300 ${
                        isActive
                          ? "scale-110 drop-shadow-md"
                          : "group-hover:scale-110"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{
                          fontVariationSettings: isActive
                            ? "'FILL' 1, 'wght' 600"
                            : "'FILL' 0, 'wght' 400",
                        }}
                      >
                        {item.icon}
                      </span>
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm tracking-wide z-10 ${
                        isActive ? "font-bold" : "font-medium"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Phần Footer Sidebar: Đăng xuất */}
        <div className="p-4 border-t border-slate-100/80 bg-slate-50/50 rounded-b-3xl shrink-0 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">
              logout
            </span>
            <span className="text-sm font-bold tracking-wide">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE HEADER (Hiển thị khi < md) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e62e43] to-rose-500 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_hospital
            </span>
          </div>
          <p className="text-sm font-black text-slate-800 uppercase tracking-wider">
            ADMIN BV
          </p>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
        >
          <span className="material-symbols-outlined">menu_open</span>
        </button>
      </div>

      {/* 🌟 NỘI DUNG CHÍNH (Main Area) */}
      <main className="flex-1 md:pl-72 w-full flex flex-col min-h-screen transition-all duration-300 overflow-hidden relative pt-16 md:pt-4 p-4 md:pr-4 pb-4">
        <div className="flex-1 w-full relative z-10 flex flex-col bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/40">
          <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-2 sm:p-6 rounded-3xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
