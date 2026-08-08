import React from "react";
import { Link } from "react-router-dom";

export default function DashboardOverview() {
  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-900/20">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-black text-rose-300 uppercase tracking-widest border border-white/10">
              Cổng nội bộ
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Đang hoạt động
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            Tổng quan Bệnh viện
          </h1>
          <p className="text-slate-400 font-medium max-w-xl">
            Trung tâm kiểm soát, điều phối nhân sự y tế, quản lý kho máu an toàn và tổ chức các chiến dịch thiện nguyện.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Nhân Sự (Chiếm 2 cột trên md) */}
        <Link to="/admin-bv/nhan-su" className="md:col-span-2 lg:col-span-1 group relative p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 transition-all overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-rose-100 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-[#e62e43] to-rose-400 rounded-2xl flex items-center justify-center text-white mb-auto shadow-lg shadow-rose-500/30 group-hover:-translate-y-1 transition-transform">
                    <span className="material-symbols-outlined text-2xl">badge</span>
                </div>
                <div className="mt-8">
                    <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-[#e62e43] transition-colors">Quản lý Nhân sự</h3>
                    <p className="text-sm font-medium text-slate-500">Kiểm soát danh sách y bác sĩ, điều phối nhân viên xét nghiệm và lễ tân.</p>
                </div>
            </div>
        </Link>
        
        {/* Card 2: Kho máu */}
        <Link to="/admin-bv/kho-mau" className="group relative p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-bl from-red-100 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mb-auto shadow-lg shadow-red-500/30 group-hover:-translate-y-1 transition-transform">
                    <span className="material-symbols-outlined text-2xl">bloodtype</span>
                </div>
                <div className="mt-8">
                    <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-red-500 transition-colors">Quản lý Kho máu</h3>
                    <p className="text-sm font-medium text-slate-500">Giám sát lượng máu dự trữ theo nhóm, nhận cảnh báo khi thiếu hụt.</p>
                </div>
            </div>
        </Link>

        {/* Card 3: Chiến dịch */}
        <Link to="/admin-bv/chien-dich" className="md:col-span-2 group relative p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all overflow-hidden">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-blue-50 to-transparent rounded-full group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 h-full">
                <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <span className="material-symbols-outlined text-3xl">event_available</span>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-500 transition-colors">Tổ chức Chiến dịch Máu</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm">Tạo đợt tiếp nhận máu mới, quản lý số lượng người đăng ký và theo dõi tiến độ thực hiện một cách chuyên nghiệp.</p>
                </div>
                <div className="hidden md:flex ml-auto w-12 h-12 rounded-full border border-slate-200 items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                    <span className="material-symbols-outlined">arrow_forward</span>
                </div>
            </div>
        </Link>
        
        {/* Card 4: Tin tức & Thông báo */}
        <Link to="/admin-bv/tin-tuc" className="group relative p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all overflow-hidden">
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-gradient-to-tr from-purple-100 to-transparent rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full items-end text-right">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white mb-auto shadow-lg shadow-purple-500/30 group-hover:-translate-y-1 transition-transform self-end">
                    <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <div className="mt-8">
                    <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-purple-500 transition-colors">Tin tức & Cảnh báo</h3>
                    <p className="text-sm font-medium text-slate-500">Gửi Push notification gọi máu khẩn cấp đến TNV.</p>
                </div>
            </div>
        </Link>

      </div>
    </div>
  );
}
