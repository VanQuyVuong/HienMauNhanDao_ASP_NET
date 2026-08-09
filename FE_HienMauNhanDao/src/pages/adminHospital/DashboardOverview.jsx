import React from "react";
import { Link } from "react-router-dom";

export default function DashboardOverview() {
  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header section phẳng */}
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-0.5 bg-rose-50 text-[10px] font-black text-[#e62e43] uppercase tracking-widest border border-rose-100 rounded-md">
            Cổng nội bộ
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Trực tuyến
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-1">
          Tổng quan Bệnh viện
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Kiểm soát nhân sự, giám sát tồn kho máu và quản lý chiến dịch.
        </p>
      </div>

      {/* Grid gọn gàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Nhân Sự */}
        <Link to="/admin-bv/nhan-su" className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-[#e62e43] group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">badge</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Quản lý Nhân sự</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Y bác sĩ, điều dưỡng, kỹ thuật viên</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#e62e43]">chevron_right</span>
        </Link>
        
        {/* Card 2: Kho máu */}
        <Link to="/admin-bv/kho-mau" className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-[#e62e43] group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">bloodtype</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Kho máu & Tồn kho</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Giám sát lượng máu và cảnh báo</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#e62e43]">chevron_right</span>
        </Link>

        {/* Card 3: Chiến dịch */}
        <Link to="/admin-bv/chien-dich" className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-[#e62e43] group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Chiến dịch Hiến máu</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Tổ chức và tiếp nhận tình nguyện viên</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#e62e43]">chevron_right</span>
        </Link>
        
        {/* Card 4: Tin tức & Thông báo */}
        <Link to="/admin-bv/tin-tuc" className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-[#e62e43] group-hover:text-white transition-colors">
            <span className="material-symbols-outlined">campaign</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Cổng Truyền thông</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Tin tức nội bộ và thông báo khẩn cấp</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#e62e43]">chevron_right</span>
        </Link>
      </div>
    </div>
  );
}
