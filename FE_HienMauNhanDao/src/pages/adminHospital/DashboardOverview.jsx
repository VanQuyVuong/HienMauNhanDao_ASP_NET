import React from "react";
import { Link } from "react-router-dom";

export default function DashboardOverview() {
  return (
    <div className="w-full h-full flex flex-col gap-6 p-2">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
            Tổng quan Hệ thống Bệnh viện
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Quản lý nhanh các hoạt động nội bộ và kho máu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin-bv/nhan-su" className="p-6 bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-shadow group">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Quản lý Nhân sự</h3>
            <p className="text-sm text-slate-500 mt-1">Xem danh sách nhân viên y tế, bác sĩ thuộc bệnh viện.</p>
        </Link>
        
        <Link to="/admin-bv/kho-mau" className="p-6 bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-shadow group">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">bloodtype</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Quản lý Kho máu</h3>
            <p className="text-sm text-slate-500 mt-1">Theo dõi tình trạng tồn kho, mức cảnh báo của các nhóm máu.</p>
        </Link>
        
        <Link to="/admin-bv/tin-tuc" className="p-6 bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-shadow group">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">campaign</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tin tức & Thông báo</h3>
            <p className="text-sm text-slate-500 mt-1">Phát đi thông báo khẩn cấp cần hiến máu cho người dân.</p>
        </Link>

        <Link to="/admin-bv/chien-dich" className="p-6 bg-white rounded-3xl border shadow-sm hover:shadow-lg transition-shadow group">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">event</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Chiến dịch Máu</h3>
            <p className="text-sm text-slate-500 mt-1">Mở đợt thu nhận máu, quản lý tình nguyện viên tham gia.</p>
        </Link>
      </div>
    </div>
  );
}
