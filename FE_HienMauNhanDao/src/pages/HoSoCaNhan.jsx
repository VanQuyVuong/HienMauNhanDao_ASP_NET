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
    <div className="flex-1 p-4 sm:p-8 bg-[#F3F4F6] min-h-[calc(100vh-100px)] flex justify-center">
      <div className="w-full max-w-[800px]">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hồ Sơ Cá Nhân</h1>
          <p className="text-slate-500 text-sm mt-2">Quản lý thông tin tài khoản và cá nhân của bạn</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header Cover */}
          <div className="h-32 bg-gradient-to-r from-red-600 to-red-800 relative">
             <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-md">
                <span className="material-symbols-outlined text-5xl text-slate-400">person</span>
             </div>
          </div>

          <div className="pt-16 px-4 sm:px-8 pb-8 relative flex flex-col sm:block">
            {tnv && !isEditing && (
              <button 
                onClick={handleEdit}
                className="w-full sm:w-auto mt-2 sm:mt-0 sm:absolute sm:top-6 sm:right-8 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm order-last sm:order-none shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span> Sửa thông tin
              </button>
            )}

            <h2 className="text-2xl font-bold text-slate-800">{tnv ? tnv.hoVaTen : 'Người dùng mới'}</h2>
            <p className="text-slate-500 font-medium mb-8">{email}</p>

            {loading ? (
              <div className="py-10 text-center text-slate-500">
                <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
                <p>Đang tải thông tin...</p>
              </div>
            ) : !tnv ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-red-300 mb-2">assignment_late</span>
                <p className="text-red-800 font-semibold mb-2">Bạn chưa có thông tin hồ sơ tình nguyện viên!</p>
                <p className="text-red-600 text-sm mb-6">Thông tin của bạn sẽ được tự động cập nhật khi bạn tham gia đăng ký hiến máu lần đầu tiên.</p>
                <button 
                  onClick={() => navigate('/chiendich')}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-red-800 transition-colors"
                >
                  Đăng ký hiến máu ngay
                </button>
              </div>
            ) : isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Họ và tên</span>
                  <input type="text" name="hoVaTen" value={formData.hoVaTen} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Số CCCD</span>
                  <input type="text" name="soCCCD" value={formData.soCCCD} onChange={handleChange} maxLength={12} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Ngày sinh</span>
                  <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Giới tính</span>
                  <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-primary">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</span>
                  <input type="tel" name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="col-span-2 flex flex-col items-start gap-1 mt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Địa chỉ cư trú</span>
                  <input type="text" name="diaChi" value={formData.diaChi} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
                  <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    Hủy
                  </button>
                  <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {saving ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
                    Lưu thông tin
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-100">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Mã TNV</span>
                  <p className="text-sm font-bold text-slate-800">{tnv.maTNV}</p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Số CCCD</span>
                  <p className="text-sm font-bold text-slate-800">{tnv.soCCCD}</p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Ngày sinh</span>
                  <p className="text-sm font-bold text-slate-800">{tnv.ngaySinh}</p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Giới tính</span>
                  <p className="text-sm font-bold text-slate-800">{tnv.gioiTinh}</p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase">Số điện thoại</span>
                  <p className="text-sm font-bold text-slate-800">{tnv.soDienThoai}</p>
                </div>
                <div className="col-span-2 flex flex-col items-start gap-1 mt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Địa chỉ cư trú</span>
                  <p className="text-sm font-bold text-slate-800">{tnv.diaChi}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
