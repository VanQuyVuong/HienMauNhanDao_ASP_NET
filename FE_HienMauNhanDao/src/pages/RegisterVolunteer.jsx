import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_URL } from '../constants/api';

export default function RegisterVolunteer() {
  const [formData, setFormData] = useState({
    email: '',
    matKhau: '',
    nhapLaiMatKhau: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (formData.matKhau !== formData.nhapLaiMatKhau) {
      setError('Mật khẩu không khớp!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${AUTH_URL}/send-otp`, { Email: formData.email });
      // Chuyển sang trang OTP và truyền dữ liệu đăng ký qua state
      navigate('/otp', { state: { formData } });
    } catch (err) {
      if (err.response && err.response.data) {
          setError(typeof err.response.data === 'string' ? err.response.data : 'Lỗi kết nối. Vui lòng thử lại.');
      } else {
          setError('Lỗi kết nối server. Vui lòng kiểm tra backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-[#fdf8f9] min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[960px] glass-panel border border-rose-100 rounded-3xl overflow-hidden flex shadow-2xl">
        <div className="w-[400px] relative hidden md:flex flex-col justify-between p-10 bg-slate-900 text-white shrink-0">
          <div className="relative z-10 space-y-4">
            <span className="px-3 py-1 bg-[#e62e43] text-white text-[10px] font-black uppercase tracking-widest rounded-full">Đăng Ký Tình Nguyện</span>
            <h2 className="text-3xl font-black leading-tight text-white">Trở Thành Một Phần Của Hành Trình Nhân Ái</h2>
            <p className="text-slate-300 text-xs font-light leading-relaxed">Đăng ký tài khoản tình nguyện viên ngay hôm nay để nhận thông báo chiến dịch hiến máu mới nhất tại Đà Nẵng.</p>
          </div>
          <div className="relative z-10 pt-6 border-t border-white/10 text-xs font-semibold text-slate-400">
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e62e43] text-base">verified</span>
              <span>Bảo mật dữ liệu chuẩn Y Tế Quốc Gia</span>
            </p>
          </div>
        </div>
            <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center">
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-on-surface mb-2 tracking-tight">Đăng ký Tài khoản</h2>
                    <p className="text-slate-500 text-sm">Vui lòng cung cấp email và mật khẩu để tạo tài khoản.</p>
                </div>
                {error && <div className="mb-4 text-red-600 text-sm font-bold">{error}</div>}
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant">Email</label>
                            <input name="email" value={formData.email} onChange={handleChange} required className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all" placeholder="example@email.com" type="email"/>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant">Mật khẩu</label>
                            <div className="relative">
                                <input name="matKhau" value={formData.matKhau} onChange={handleChange} required className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all" placeholder="••••••••" type="password"/>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer text-xl">visibility</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <input name="nhapLaiMatKhau" value={formData.nhapLaiMatKhau} onChange={handleChange} required className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all" placeholder="••••••••" type="password"/>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer text-xl">visibility</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 pt-2">
                        <input required className="mt-1 w-4 h-4 rounded-sm text-primary focus:ring-primary border-slate-300" id="terms" type="checkbox"/>
                        <label className="text-xs text-slate-600 leading-relaxed" htmlFor="terms">
                            Tôi đồng ý với <Link className="text-primary font-medium underline underline-offset-2" to="#">điều khoản sử dụng</Link> và chính sách bảo mật của hệ thống.
                        </label>
                    </div>
                    <button disabled={loading} className="w-full h-12 bg-primary-container text-white font-bold rounded-md hover:bg-red-800 transition-all shadow-sm active:opacity-90 flex items-center justify-center gap-2" type="submit">
                        <span className="text-base">{loading ? 'Đang gửi OTP...' : 'Đăng ký'}</span>
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-500">
                            Đã có tài khoản? 
                            <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1" to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}
