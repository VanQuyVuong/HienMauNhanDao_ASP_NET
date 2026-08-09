import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ManageNews() {
  const [activeTab, setActiveTab] = useState("news"); // 'news' | 'noti'
  
  // State cho form Tin Tức
  const [newsForm, setNewsForm] = useState({ 
    TieuDe: "", 
    LoaiTin: "ChienDich",
    ChuKyLap: "None",
    HinhAnh: "",
    NoiDung: "" 
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // State cho form Thông báo
  const [notiForm, setNotiForm] = useState({ NhomMau: "O_positive", NoiDung: "" });
  
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingNoti, setLoadingNoti] = useState(false);

  // Mock dữ liệu lịch sử tin tức để UI không trống
  const [newsHistory] = useState([
    { id: 1, title: "Lợi ích tuyệt vời của việc hiến máu", type: "LoiKhuyen", repeat: "Monthly", status: "Active", date: "2026-02-01" },
    { id: 2, title: "Kêu gọi hiến máu Lễ hội Xuân Hồng", type: "ChienDich", repeat: "None", status: "Inactive", date: "2026-02-10" },
    { id: 3, title: "Những lưu ý trước khi đi hiến máu", type: "LoiKhuyen", repeat: "Weekly", status: "Active", date: "2026-03-05" },
    { id: 4, title: "Bệnh viện C tiếp nhận thiết bị mới", type: "NoiBo", repeat: "None", status: "Active", date: "2026-04-12" },
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setLoadingNews(true);
    try {
      const token = localStorage.getItem("token");
      let uploadedImageUrl = "";

      // 1. Nếu có file ảnh, upload trước
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("type", "tintuc");
        formData.append("category", newsForm.LoaiTin);
        formData.append("title", newsForm.TieuDe);

        const uploadRes = await axios.post("https://localhost:7004/api/Upload/image", formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          }
        });
        uploadedImageUrl = uploadRes.data.data; // Trả về dạng tintuc/xxx.jpg
      }

      // 2. Gửi request tạo Tin Tức (Mock request, cần backend API thật)
      await axios.post("https://localhost:7004/api/AdminHospital/news", {
        TieuDe: newsForm.TieuDe,
        NoiDung: newsForm.NoiDung,
        HinhAnh: uploadedImageUrl,
        LoaiTin: newsForm.LoaiTin,
        ChuKyLap: newsForm.ChuKyLap
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Đăng bài viết và lưu ảnh thành công!");
      setNewsForm({ TieuDe: "", LoaiTin: "ChienDich", ChuKyLap: "None", HinhAnh: "", NoiDung: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error("Lỗi khi tải ảnh hoặc đăng tin");
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
      
      {/* Header & Tabs phẳng */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-black text-slate-800">Cổng Truyền Thông Nội Bộ</h1>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Quản trị các chiến dịch truyền thông và phát thông báo khẩn cấp.</p>
        </div>
        
        <div className="flex items-center gap-2 border-b border-slate-100 pb-0">
          <button
            onClick={() => setActiveTab("news")}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
              activeTab === "news" 
                ? "border-slate-800 text-slate-800" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Quản Lý Tin Tức
          </button>
          <button
            onClick={() => setActiveTab("noti")}
            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "noti" 
                ? "border-red-500 text-red-600" 
                : "border-transparent text-slate-400 hover:text-red-400"
            }`}
          >
            Thông Báo Khẩn <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* NỘI DUNG CÁC TAB */}
      
      {/* TAB 1: TIN TỨC */}
      {activeTab === "news" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Cột Trái: Form Soạn Thảo (Chiếm 5 phần) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-slate-600 text-xl">edit_document</span>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">Soạn Bài Đăng Mới</h2>
            </div>

            <form onSubmit={handleNewsSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tiêu đề bài viết</label>
                <input
                  required
                  type="text"
                  placeholder="Nhập tiêu đề thu hút..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                  value={newsForm.TieuDe}
                  onChange={(e) => setNewsForm({ ...newsForm, TieuDe: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phân loại</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all cursor-pointer"
                    value={newsForm.LoaiTin}
                    onChange={(e) => setNewsForm({ ...newsForm, LoaiTin: e.target.value })}
                  >
                    <option value="ChienDich">Chiến dịch hiến máu</option>
                    <option value="LoiKhuyen">Lời khuyên sức khỏe</option>
                    <option value="NoiBo">Bản tin nội bộ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Chu kỳ lặp lại</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all cursor-pointer"
                    value={newsForm.ChuKyLap}
                    onChange={(e) => setNewsForm({ ...newsForm, ChuKyLap: e.target.value })}
                  >
                    <option value="None">Không lặp lại</option>
                    <option value="Daily">Mỗi ngày</option>
                    <option value="Weekly">Mỗi tuần</option>
                    <option value="Monthly">Mỗi tháng</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ảnh minh họa (Tùy chọn)</label>
                <div className="relative w-full h-32 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-2xl">flip_camera_ios</span>
                        <span className="text-[10px] font-bold text-white mt-1">Đổi ảnh khác</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-500">
                      <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
                      <span className="text-[10px] font-bold">Kéo thả hoặc Nhấp để tải ảnh lên</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nội dung chi tiết</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Viết nội dung truyền cảm hứng tại đây..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400 custom-scrollbar resize-none"
                  value={newsForm.NoiDung}
                  onChange={(e) => setNewsForm({ ...newsForm, NoiDung: e.target.value })}
                />
              </div>
              
              <button
                disabled={loadingNews}
                className="w-full py-3.5 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors disabled:opacity-50 mt-2 shadow-sm shadow-slate-200"
              >
                {loadingNews ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Đăng Bài Ngay</>
                )}
              </button>
            </form>
          </div>

          {/* Cột Phải: Bảng Lịch Sử (Chiếm 7 phần) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">history</span>
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">Lịch Sử & Giám Sát Đăng Bài</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">{newsHistory.length} Tin tức</span>
            </div>

            <div className="flex-1 w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-2/5">Tiêu đề bài viết</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lặp lại</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {newsHistory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-slate-700 truncate max-w-[220px]" title={item.title}>{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.date}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-slate-600">
                          {item.type === "ChienDich" && "Chiến dịch"}
                          {item.type === "LoiKhuyen" && "Lời khuyên"}
                          {item.type === "NoiBo" && "Nội bộ"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.repeat !== "None" ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                            <span className="material-symbols-outlined text-[12px]">cycle</span>
                            <span className="text-[10px] font-bold uppercase">{item.repeat}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === "Active" ? (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                        ) : (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 hover:text-slate-800 transition-colors">
                          <span className="material-symbols-outlined text-lg">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <p>Hiển thị 4 tin bài gần nhất</p>
              <button className="text-slate-800 font-bold hover:underline">Xem tất cả</button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THÔNG BÁO KHẨN */}
      {activeTab === "noti" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm shadow-red-100/50 relative overflow-hidden">
            {/* Red accent top border */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />
            
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-red-500 text-[28px] animate-pulse">campaign</span>
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">Thông Báo Khẩn Cấp</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Phát tín hiệu trực tiếp đến các Tình Nguyện Viên</p>
              </div>
            </div>

            <form onSubmit={handleNotiSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nhóm máu đang cạn kiệt</label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-red-50/50 border border-red-100 rounded-xl text-sm font-bold text-red-700 focus:outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all appearance-none cursor-pointer"
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
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-red-400">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nội dung báo động</label>
                <textarea
                  required
                  rows={4}
                  placeholder="VD: Kho máu Bệnh viện C đang thiếu O+ trầm trọng do cấp cứu tai nạn giao thông, mong Tình nguyện viên đến hỗ trợ khẩn cấp..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-slate-400 custom-scrollbar resize-none leading-relaxed"
                  value={notiForm.NoiDung}
                  onChange={(e) => setNotiForm({ ...notiForm, NoiDung: e.target.value })}
                />
              </div>
              
              <button
                disabled={loadingNoti}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-rose-700 transition-colors shadow-md shadow-red-500/30 disabled:opacity-50"
              >
                {loadingNoti ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">emergency_share</span>
                    Phát Tín Hiệu Khẩn
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="hidden md:flex flex-col justify-center px-8 border-l border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">notifications_active</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Thông báo sẽ đi về đâu?</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Ngay sau khi bạn nhấn Phát Tín Hiệu, một thông báo Push Notification sẽ được gửi thẳng đến điện thoại di động của toàn bộ Tình Nguyện Viên có nhóm máu tương ứng đang cư trú tại khu vực Đà Nẵng.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
