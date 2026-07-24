import React, { useState, useEffect } from 'react';
import { tinhNguyenVienService } from '../services/tinhNguyenVienService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function HoSoCaNhan() {
  const navigate = useNavigate();
  const [tnv, setTnv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const email = localStorage.getItem('email');

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await tinhNguyenVienService.getByMaTaiKhoan(email);
        if (data && data.maTNV) {
          setTnv(data);
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin hồ sơ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email, navigate]);

  const handleEdit = () => {
    setFormData({
      hoVaTen: tnv.hoVaTen || '',
      soCCCD: tnv.soCCCD || '',
      ngaySinh: tnv.ngaySinh || '',
      gioiTinh: tnv.gioiTinh || 'Nam',
      soDienThoai: tnv.soDienThoai || '',
      diaChi: tnv.diaChi || '',
      maPhuongXa: tnv.phuongXa?.maPhuongXa || tnv.maPhuongXa || null
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        maTaiKhoan: email
      };
      await tinhNguyenVienService.createOrUpdate(payload);
      
      // Update local state
      setTnv({ ...tnv, ...formData });
      setIsEditing(false);
      Swal.fire('Thành công', 'Cập nhật thông tin thành công!', 'success');
    } catch (error) {
      console.error('Error saving profile', error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi lưu thông tin.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-[#fdf8f9] min-h-[calc(100vh-100px)] py-12 px-4 md:px-8">
      <main className="max-w-[1000px] mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Hồ Sơ Cá Nhân</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">Quản lý thông tin tài khoản và thông tin tình nguyện viên của bạn.</p>
        </div>

        <div className="w-full bento-card bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden">
          {/* Header Cover */}
          <div className="h-40 bg-gradient-to-r from-[#e62e43] to-[#c01b30] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 p-8 opacity-[0.03] pointer-events-none">
              <span className="material-symbols-outlined text-[150px]">admin_panel_settings</span>
            </div>
             <div className="absolute -bottom-16 left-8 sm:left-12 w-32 h-32 rounded-3xl border-4 border-white bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-[#e62e43]/20 rotate-3 z-10">
                <div className="w-full h-full bg-red-50 flex items-center justify-center -rotate-3">
                  <span className="material-symbols-outlined text-6xl text-[#e62e43]">face</span>
                </div>
             </div>
          </div>

          <div className="pt-20 px-8 sm:px-12 pb-12 relative flex flex-col sm:block">
            {tnv && !isEditing && (
              <button 
                onClick={handleEdit}
                className="w-full sm:w-auto mt-6 sm:mt-0 sm:absolute sm:top-8 sm:right-12 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm order-last sm:order-none shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">edit_document</span> 
                CHỈNH SỬA
              </button>
            )}

            <h2 className="text-3xl font-black text-slate-900 mb-1">{tnv ? tnv.hoVaTen : 'Người dùng mới'}</h2>
            <p className="text-slate-500 font-bold mb-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              {email}
            </p>

            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-5xl mb-4">refresh</span>
                <p className="font-bold uppercase tracking-widest text-sm">Đang tải thông tin...</p>
              </div>
            ) : !tnv ? (
              <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-9xl text-red-500">assignment_late</span>
                </div>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 relative z-10">
                  <span className="material-symbols-outlined text-5xl text-[#e62e43]">assignment_late</span>
                </div>
                <p className="text-red-900 font-black text-xl mb-3 relative z-10">Bạn chưa có hồ sơ Tình Nguyện Viên!</p>
                <p className="text-red-700/80 font-medium mb-8 max-w-md mx-auto relative z-10">Hệ thống sẽ tự động tạo hồ sơ cho bạn sau khi bạn hoàn tất đăng ký tham gia hiến máu lần đầu tiên.</p>
                <button 
                  onClick={() => navigate('/chiendich')}
                  className="px-8 py-4 bg-[#e62e43] text-white font-black rounded-xl hover:bg-[#c01b30] transition-all shadow-[0_8px_20px_rgba(230,46,67,0.25)] active:scale-95 relative z-10 uppercase tracking-wider"
                >
                  ĐĂNG KÝ HIẾN MÁU NGAY
                </button>
              </div>
            ) : isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-inner">
                <div className="col-span-1 md:col-span-2 mb-2">
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#e62e43]">edit_square</span>
                    Cập nhật thông tin
                  </h3>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên <span className="text-[#e62e43]">*</span></span>
                  <input type="text" name="hoVaTen" value={formData.hoVaTen} onChange={handleChange} className="w-full h-12 border-2 border-slate-200 bg-white rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all" />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số CCCD <span className="text-[#e62e43]">*</span></span>
                  <input type="text" name="soCCCD" value={formData.soCCCD} onChange={handleChange} maxLength={12} className="w-full h-12 border-2 border-slate-200 bg-white rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all" />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày sinh <span className="text-[#e62e43]">*</span></span>
                  <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} className="w-full h-12 border-2 border-slate-200 bg-white rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all" />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giới tính <span className="text-[#e62e43]">*</span></span>
                  <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} className="w-full h-12 border-2 border-slate-200 bg-white rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại <span className="text-[#e62e43]">*</span></span>
                  <input type="tel" name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} className="w-full h-12 border-2 border-slate-200 bg-white rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all" />
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-col items-start gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ cư trú <span className="text-[#e62e43]">*</span></span>
                  <input type="text" name="diaChi" value={formData.diaChi} onChange={handleChange} className="w-full h-12 border-2 border-slate-200 bg-white rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all" />
                </div>
                
                <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t border-slate-200">
                  <button onClick={() => setIsEditing(false)} className="w-full md:w-32 h-12 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]">
                    HỦY BỎ
                  </button>
                  <button onClick={handleSave} disabled={saving} className="w-full md:w-48 h-12 bg-[#e62e43] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#c01b30] transition-all shadow-[0_8px_20px_rgba(230,46,67,0.25)] active:scale-[0.98] disabled:opacity-50 tracking-wider">
                    {saving ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                    LƯU THÔNG TIN
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[
                  { label: 'Mã TNV', value: tnv.maTNV, icon: 'badge' },
                  { label: 'Số CCCD', value: tnv.soCCCD, icon: 'credit_card' },
                  { label: 'Ngày sinh', value: new Date(tnv.ngaySinh).toLocaleDateString('vi-VN'), icon: 'cake' },
                  { label: 'Giới tính', value: tnv.gioiTinh, icon: 'wc' },
                  { label: 'Số điện thoại', value: tnv.soDienThoai, icon: 'phone' },
                  { label: 'Địa chỉ cư trú', value: tnv.diaChi, icon: 'home_pin', full: true },
                ].map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all ${item.full ? 'col-span-1 md:col-span-2' : ''} flex items-center gap-4`}>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-slate-400">{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value || <span className="text-slate-300 italic">Chưa cập nhật</span>}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
