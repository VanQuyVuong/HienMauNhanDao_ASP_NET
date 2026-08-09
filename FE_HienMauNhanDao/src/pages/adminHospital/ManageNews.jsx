import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ManageNews() {
  const [newsForm, setNewsForm] = useState({ TieuDe: "", NoiDung: "", HinhAnh: "news_default.jpg" });
  const [notiForm, setNotiForm] = useState({ NhomMau: "O_positive", NoiDung: "" });
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingNoti, setLoadingNoti] = useState(false);

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setLoadingNews(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://localhost:7004/api/AdminHospital/news", newsForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Đăng tin tức thành công!");
      setNewsForm({ TieuDe: "", NoiDung: "", HinhAnh: "news_default.jpg" });
    } catch (err) {
      toast.error("Lỗi khi đăng tin");
    } finally {
      setLoadingNews(false);
    }
  };

  const handleNotiSubmit = async (e) => {
    e.preventDefault();
    setLoadingNoti(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("https://localhost:7004/api/AdminHospital/notification", notiForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || "Gửi thông báo thành công!");
      setNotiForm({ ...notiForm, NoiDung: "" });
    } catch (err) {
      toast.error(err.response?.data || "Lỗi khi gửi thông báo");
    } finally {
      setLoadingNoti(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header section */}
      <div className="bg-white/85 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-sm">
        <h2 className="text-xl font-black text-slate-800">
          Cổng Truyền Thông & Cảnh Báo
        </h2>
        <p className="text-slate-500 font-medium text-xs mt-1">
          Gửi thông báo khẩn cấp hoặc đăng tải các bản tin nội bộ bệnh viện.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Form Đăng Tin Tức */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <span className="material-symbols-outlined text-slate-600 text-xl">newspaper</span>
            <h2 className="text-base font-bold text-slate-800">Đăng Bản Tin Nội Bộ</h2>
          </div>

          <form onSubmit={handleNewsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiêu đề bản tin</label>
              <input
                required
                type="text"
                placeholder="Nhập tiêu đề..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#e62e43]/40 focus:ring-2 focus:ring-[#e62e43]/10 transition-all placeholder:text-slate-400"
                value={newsForm.TieuDe}
                onChange={(e) => setNewsForm({ ...newsForm, TieuDe: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nội dung chi tiết</label>
              <textarea
                required
                rows={5}
                placeholder="Viết nội dung bản tin tại đây..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-[#e62e43]/40 focus:ring-2 focus:ring-[#e62e43]/10 transition-all placeholder:text-slate-400 custom-scrollbar resize-none"
                value={newsForm.NoiDung}
                onChange={(e) => setNewsForm({ ...newsForm, NoiDung: e.target.value })}
              />
            </div>
            
            <button
              disabled={loadingNews}
              className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              {loadingNews ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Đăng Bài Ngay
                </>
              )}
            </button>
          </form>
        </div>

        {/* Form Gửi Thông Báo Khẩn */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Subtle red indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
          
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <span className="material-symbols-outlined text-red-500 text-xl animate-pulse">campaign</span>
            <h2 className="text-base font-bold text-slate-800">Thông Báo Khẩn Cấp</h2>
          </div>

          <form onSubmit={handleNotiSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nhóm máu đang thiếu</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all appearance-none cursor-pointer"
                  value={notiForm.NhomMau}
                  onChange={(e) => setNotiForm({ ...notiForm, NhomMau: e.target.value })}
                >
                  <option value="A_positive">Nhóm máu A (+)</option>
                  <option value="A_negative">Nhóm máu A (-)</option>
                  <option value="B_positive">Nhóm máu B (+)</option>
                  <option value="B_negative">Nhóm máu B (-)</option>
                  <option value="O_positive">Nhóm máu O (+)</option>
                  <option value="O_negative">Nhóm máu O (-)</option>
                  <option value="AB_positive">Nhóm máu AB (+)</option>
                  <option value="AB_negative">Nhóm máu AB (-)</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nội dung báo động</label>
              <textarea
                required
                rows={4}
                placeholder="VD: Kho máu Bệnh viện C đang thiếu O+ trầm trọng do tai nạn..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-400 custom-scrollbar resize-none"
                value={notiForm.NoiDung}
                onChange={(e) => setNotiForm({ ...notiForm, NoiDung: e.target.value })}
              />
            </div>
            
            <button
              disabled={loadingNoti}
              className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loadingNoti ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">emergency_share</span>
                  Gửi Thông Báo Tức Thì
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
