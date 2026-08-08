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
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40">
        <h2 className="text-2xl font-black bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
          Cổng Truyền Thông & Cảnh Báo
        </h2>
        <p className="text-slate-500 font-medium text-sm mt-1 max-w-xl">
          Đăng tải tin tức nội bộ bệnh viện hoặc phát đi thông báo khẩn cấp (Push Notification) huy động tình nguyện viên hiến máu ngay lập tức.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Form Đăng Tin Tức */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">newspaper</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Đăng Tin Tức Mới</h2>
              <p className="text-sm font-medium text-slate-500">Bản tin bệnh viện & hoạt động</p>
            </div>
          </div>

          <form onSubmit={handleNewsSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Tiêu đề bản tin</label>
              <input
                required
                type="text"
                placeholder="Nhập tiêu đề..."
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-400"
                value={newsForm.TieuDe}
                onChange={(e) => setNewsForm({ ...newsForm, TieuDe: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Nội dung chi tiết</label>
              <textarea
                required
                rows={5}
                placeholder="Viết nội dung bản tin tại đây..."
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-400 custom-scrollbar resize-none"
                value={newsForm.NoiDung}
                onChange={(e) => setNewsForm({ ...newsForm, NoiDung: e.target.value })}
              />
            </div>
            
            <button
              disabled={loadingNews}
              className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loadingNews ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Đăng Bài Ngay
                </>
              )}
            </button>
          </form>
        </div>

        {/* Form Gửi Thông Báo Khẩn */}
        <div className="bg-gradient-to-b from-red-50 to-white p-8 rounded-[2rem] border border-red-100 shadow-xl shadow-red-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-red-500 text-white shadow-lg shadow-red-500/30 rounded-2xl flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-2xl">campaign</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-red-600">Phát Lệnh Khẩn Cấp</h2>
              <p className="text-sm font-medium text-red-400">Gửi thông báo tức thì đến TNV</p>
            </div>
          </div>

          <form onSubmit={handleNotiSubmit} className="space-y-6 relative z-10">
            <div className="relative">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Nhóm Máu Đang Thiếu</label>
              <div className="relative">
                <select
                  className="w-full px-5 py-4 bg-white border border-red-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all appearance-none cursor-pointer"
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
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Thông điệp khẩn cấp</label>
              <textarea
                required
                rows={4}
                placeholder="VD: Kho máu O+ của Bệnh viện C đang thiếu hụt trầm trọng do cấp cứu tai nạn. Xin mời các bạn đến hỗ trợ gấp!"
                className="w-full px-5 py-4 bg-white border border-red-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-400 custom-scrollbar resize-none"
                value={notiForm.NoiDung}
                onChange={(e) => setNotiForm({ ...notiForm, NoiDung: e.target.value })}
              />
            </div>
            
            <button
              disabled={loadingNoti}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loadingNoti ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">emergency_share</span>
                  Phát Đi Cảnh Báo
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
