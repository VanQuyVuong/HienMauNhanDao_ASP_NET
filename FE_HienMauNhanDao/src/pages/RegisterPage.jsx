import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_URL } from '../constants/api';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    matKhau: '',
    nhapLaiMatKhau: ''
  });
  const [otp, setOtp] = useState('');
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
      await axios.post(`${AUTH_URL}/send-otp`, { email: formData.email });
      setStep(2);
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
        setError('Vui lòng nhập mã OTP!');
        return;
    }
    setLoading(true);
    setError('');
    try {
      // Verify OTP
      try {
        await axios.post(`${AUTH_URL}/verify-otp`, { email: formData.email, otp });
      } catch (otpErr) {
        if (otpErr.response && otpErr.response.status === 400) {
            setError('Mã OTP không hợp lệ hoặc đã hết hạn!');
        } else {
            setError('Lỗi xác thực OTP: ' + (otpErr.response?.data || 'Không xác định'));
        }
        setLoading(false);
        return;
      }
      
      // OTP valid, now register
      const registerPayload = {
          email: formData.email,
          matKhau: formData.matKhau
      };
      await axios.post(`${AUTH_URL}/register`, registerPayload);
      
      // Redirect to login
      navigate('/login');
    } catch (err) {
      setError('Lỗi đăng ký: ' + (err.response?.data || 'Không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 flex items-center justify-center bg-[#F3F4F6] min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-[1024px] bg-white border border-slate-200 rounded-lg overflow-hidden flex shadow-sm">
            <div className="w-[420px] relative flex items-end p-12 shrink-0">
                <div className="absolute inset-0 z-0">
                    <img alt="Blood Donation" className="w-full h-full object-cover opacity-30 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDueaJAaTz0RjLbygBiVaKlLkFa-k5bSzh3hFB8rOEZTroPIavRCetrAXDv-_TSrjqBNwOmHaIjyqdkEZ8AjEpfikCmXmBCK0KXBQhlLR8Ol5Zw9MUnv74Jylcc41QYB6mFMcjnx4m6d8a3WnxZcdCPkxFWhxCi_4Cfxrq8U-m9ENBUTgvwqsNv_hmwBkTnL-4O8qAmZQTOYVe93SOUpTKuXqPXaQSnhULQandiA53FjSrpsyB6dqv2wxg1y4H-eCXtdDfi39hCAVvd"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
                </div>
                <div className="relative z-10 text-white w-full">
                    <h1 className="text-3xl font-bold leading-tight mb-4">Hệ thống Quản lý Hiến máu Nhân đạo TP. Đà Nẵng</h1>
                    <p className="text-primary-fixed-dim text-sm leading-relaxed mb-8">Hành trình của mỗi giọt máu bắt đầu từ sự tự nguyện của bạn. Tham gia cộng đồng tình nguyện viên để cứu sống hàng ngàn người bệnh.</p>
                    <div className="flex gap-4 items-center">
                        <div className="flex -space-x-3">
                            <img alt="Avatar 1" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhekJIdPkF-QyoAl_qtcuNI3ofx8UcU-Wjx1kkojZVLuvHxNUBvL829pAsO3Z6dPOYCiY978fmgTJf81AlorlhA8ZB07UItddOy27nZFOQ78oUyq4NFdlDB-uMIf1ByiWkdXDfYCDi0D8iGLYR0N6IOJdHIavoBQjtyLGARMiL9eGObl1DnpwtWUbjNPQzG7dduIpCG19AA29I0KWGwy3UMquRndqqHs758gJbl-YBSVPrU8gmUFqkOu753j4JUxMWSqjqc5M4Um6q"/>
                            <img alt="Avatar 2" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYs2c1u9I4LLYj0PwXno--xuejWcbyhwRjVoAI0flhk7hVjh5RmY0WQAOIDvQH6ulkxY6OUI7xQunKQtve9939ii_AeoNMX3l3xu4pCfRZa94VU5_gk3pdF_4MtjLYVI4m4GgmQTW84FxIJz6TZ7nl1jfaXqmxC71ZEhVqhxFEA5yBgyorwzGWgUVf9KlzVWE_mFGnol9gheykM7vEQ-4Z27spZIKt23b2RydbokGE4BXPgipv6MX9Pjs_u2X_x9wiBMlfw05TwO14"/>
                            <img alt="Avatar 3" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACTIM9Xq4ZtI3pQefWqFM51fQYkjfY7WvbMCEzN-Cn1OEsMx3MD3DGpf27RW15Fl9hoHntk2N4MmZvM6ycrZvPRfu4mKNP8eViDJMuFeA_UHcLFu94VVrviNXzL2KC0DzrfNWHiQUpPexH8MhwdmUPDmeUvA1nIFiwhPV9WPDmTIyA1x0PlU6rkzeD_kNkafaH-OMzK-RhWQgg5erWKBJZfD0c6ajRtm7MtwD1jvAsVxahIzLxNo1EiSH0Z7wZDn5Mkk9N9Qm7K-Yu"/>
                        </div>
                        <span className="text-xs font-medium">+5,000 tình nguyện viên</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 p-12 flex flex-col justify-center">
                <div className="mb-8">
                    <h2 className="text-2xl font-extrabold text-on-surface mb-2 tracking-tight">Đăng ký Tài khoản</h2>
                    <p className="text-slate-500 text-sm">{step === 1 ? 'Vui lòng cung cấp email và mật khẩu để tạo tài khoản.' : `Vui lòng nhập mã OTP được gửi đến ${formData.email}`}</p>
                </div>
                {error && <div className="mb-4 text-red-600 text-sm font-bold">{error}</div>}
                
                {step === 1 ? (
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
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant">Mã xác thực OTP</label>
                            <input name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center text-xl tracking-[0.5em] font-bold transition-all" placeholder="------" type="text" maxLength={6} />
                        </div>
                        <button disabled={loading} className="w-full h-12 bg-primary-container text-white font-bold rounded-md hover:bg-red-800 transition-all shadow-sm active:opacity-90 flex items-center justify-center gap-2" type="submit">
                            <span className="text-base">{loading ? 'Đang xác thực...' : 'Xác thực & Hoàn tất'}</span>
                            <span className="material-symbols-outlined text-xl">verified</span>
                        </button>
                        <div className="text-center pt-2">
                            <p className="text-sm text-slate-500">
                                Chưa nhận được mã? 
                                <button type="button" onClick={handleSendOtp} disabled={loading} className="text-primary font-bold hover:underline underline-offset-4 ml-1">
                                    Gửi lại OTP
                                </button>
                            </p>
                        </div>
                        <div className="text-center pt-2">
                            <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-700 text-sm font-medium underline underline-offset-4">
                                Quay lại chỉnh sửa thông tin
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
}
