import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ENDPOINTS } from "../../constants/api";
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
  
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingNoti, setLoadingNoti] = useState(false);

  const [newsHistory, setNewsHistory] = useState([]);

  // Fetch lịch sử tin tức từ backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get(ENDPOINTS.TIN_TUC.GET_ALL);
        setNewsHistory(res.data);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử tin tức", err);
      }
    };
    fetchNews();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

        const uploadRes = await api.post(ENDPOINTS.UPLOAD.IMAGE, formData, {
          headers: { 
            "Content-Type": "multipart/form-data"
          }
        });
        uploadedImageUrl = uploadRes.data.data; // Trả về dạng tintuc/xxx.jpg
      }

      // 2. Gửi request tạo Tin Tức
      await api.post(ENDPOINTS.TIN_TUC.CREATE, {
        TieuDe: newsForm.TieuDe,
        NoiDung: newsForm.NoiDung,
        HinhAnh: uploadedImageUrl,
        LoaiTin: newsForm.LoaiTin,
        ChuKyLap: newsForm.ChuKyLap
      });
      
      toast.success("Đăng bài viết và lưu ảnh thành công!");
      setNewsForm({ TieuDe: "", LoaiTin: "ChienDich", ChuKyLap: "None", HinhAnh: "", NoiDung: "" });
      setImageFile(null);
      setImagePreview(null);
      
      // Refresh lại list
      const res = await api.get(ENDPOINTS.TIN_TUC.GET_ALL);
      setNewsHistory(res.data);
    } catch (err) {
      console.error(err);
      let errMsg = "Lỗi khi tải ảnh hoặc đăng tin";
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errMsg = err.response.data;
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleNotiSubmit = async (e) => {
    e.preventDefault();
    setLoadingNoti(true);
    try {
      const res = await api.post(ENDPOINTS.ADMIN_HOSPITAL.NOTIFICATION, notiForm);
      toast.success(res.data.message || "Gửi thông báo thành công!");
      setNotiForm({ ...notiForm, NoiDung: "" });
    } catch (err) {
      toast.error(err.response?.data || "Lỗi khi gửi thông báo");
    } finally {
      setLoadingNoti(false);
    }
  };

  const handleDeleteNews = async (maTinTuc) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    
    try {
      await api.delete(ENDPOINTS.TIN_TUC.DELETE(maTinTuc));
      toast.success("Đã xóa bài viết thành công!");
      
      // Cập nhật lại danh sách
      setNewsHistory(prev => prev.filter(item => item.maTinTuc !== maTinTuc));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Lỗi xóa tin tức", err);
      toast.error("Không thể xóa bài viết. " + (err.response?.data?.message || ""));
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
                    <tr key={item.maTinTuc} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-slate-700 truncate max-w-[220px]" title={item.tieuDe}>{item.tieuDe}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(item.ngayDang).toLocaleDateString("vi-VN")}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-slate-600">
                          {item.loaiTin === "ChienDich" && "Chiến dịch"}
                          {item.loaiTin === "LoiKhuyen" && "Lời khuyên"}
                          {item.loaiTin === "NoiBo" && "Nội bộ"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.chuKyLap !== "None" ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                            <span className="material-symbols-outlined text-[12px]">cycle</span>
                            <span className="text-[10px] font-bold uppercase">{item.chuKyLap}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                      </td>
                      <td className="py-3 px-4 text-right relative action-menu">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.maTinTuc ? null : item.maTinTuc);
                          }}
                          className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-md hover:bg-slate-100"
                        >
                          <span className="material-symbols-outlined text-lg">more_horiz</span>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.maTinTuc && (
                          <div className="absolute right-8 top-10 bg-white rounded-xl shadow-lg border border-slate-100 w-36 py-2 z-50 animate-in fade-in zoom-in duration-200">
                            <button 
                              className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                              onClick={() => {
                                toast.info("Tính năng sửa đang phát triển");
                                setActiveMenuId(null);
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span> Sửa bài
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                              onClick={() => handleDeleteNews(item.maTinTuc)}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span> Xóa bài
                            </button>
                          </div>
                        )}
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
