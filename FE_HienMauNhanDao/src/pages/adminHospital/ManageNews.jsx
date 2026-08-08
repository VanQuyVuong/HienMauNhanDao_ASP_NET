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
    <div className="space-y-8 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* News Section */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Đăng Tin Tức Mới</h2>
          <form onSubmit={handleNewsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề</label>
              <input
                required
                type="text"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring focus:ring-rose-200 outline-none transition"
                value={newsForm.TieuDe}
                onChange={(e) => setNewsForm({ ...newsForm, TieuDe: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung</label>
              <textarea
                required
                rows={5}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring focus:ring-rose-200 outline-none transition"
                value={newsForm.NoiDung}
                onChange={(e) => setNewsForm({ ...newsForm, NoiDung: e.target.value })}
              />
            </div>
            <button
              disabled={loadingNews}
              className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition disabled:opacity-50"
            >
              {loadingNews ? "Đang xử lý..." : "Đăng bài ngay"}
            </button>
          </form>
        </div>

        {/* Notification Section */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Gửi Thông Báo Khẩn</h2>
          <p className="text-sm text-slate-500 mb-4">Hệ thống sẽ tự động tìm các TNV có nhóm máu yêu cầu và gửi tin nhắn đẩy.</p>
          <form onSubmit={handleNotiSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Chọn Nhóm Máu</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
                value={notiForm.NhomMau}
                onChange={(e) => setNotiForm({ ...notiForm, NhomMau: e.target.value })}
              >
                <option value="A_positive">A+</option>
                <option value="A_negative">A-</option>
                <option value="B_positive">B+</option>
                <option value="B_negative">B-</option>
                <option value="O_positive">O+</option>
                <option value="O_negative">O-</option>
                <option value="AB_positive">AB+</option>
                <option value="AB_negative">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung thông báo</label>
              <textarea
                required
                rows={4}
                placeholder="VD: Kho máu O+ của BV C đang thiếu hụt trầm trọng. Xin mời các bạn đến hỗ trợ..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
                value={notiForm.NoiDung}
                onChange={(e) => setNotiForm({ ...notiForm, NoiDung: e.target.value })}
              />
            </div>
            <button
              disabled={loadingNoti}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50"
            >
              {loadingNoti ? "Đang gửi..." : "Phát đi thông báo"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
