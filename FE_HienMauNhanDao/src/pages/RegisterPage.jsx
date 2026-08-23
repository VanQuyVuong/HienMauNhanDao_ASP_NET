import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      await authService.sendOtp(formData.email);
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
        await authService.verifyOtp({ email: formData.email, otp });
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
      await authService.register(registerPayload);
      
      // Redirect to login
      navigate('/login');
    } catch (err) {
      setError('Lỗi đăng ký: ' + (err.response?.data || 'Không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#fdf8f9] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e62e43]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
      
      <div className="w-full max-w-[1000px] bento-card bg-white shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row relative z-10 p-0 overflow-hidden border border-white">
        
        {/* Left Side - Banner */}
        <div className="w-full md:w-[45%] bg-gradient-to-br from-[#e62e43] to-[#c01b30] p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 p-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[200px]">volunteer_activism</span>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-8 border border-white/30 shadow-inner">
              <span className="material-symbols-outlined text-white text-2xl">water_drop</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4 tracking-tight">Hệ thống Quản lý Hiến máu Nhân đạo TP. Đà Nẵng</h1>
            <p className="text-white/80 font-medium text-sm leading-relaxed mb-8">Hành trình của mỗi giọt máu bắt đầu từ sự tự nguyện của bạn. Trở thành một phần của hành trình nhân ái ngay hôm nay.</p>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-black/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-[#c01b30] overflow-hidden flex items-center justify-center"><span className="material-symbols-outlined text-slate-500 text-sm">person</span></div>
              <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-[#c01b30] overflow-hidden flex items-center justify-center"><span className="material-symbols-outlined text-slate-500 text-sm">face</span></div>
              <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-[#c01b30] overflow-hidden flex items-center justify-center"><span className="material-symbols-outlined text-white text-sm">sentiment_satisfied</span></div>
            </div>
            <div>
              <p className="text-xs text-white/70 font-bold uppercase tracking-wider mb-0.5">Tham gia cùng</p>
              <p className="text-sm font-black">+5,000 Tình nguyện viên</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Đăng ký Tài khoản</h2>
            <p className="text-slate-500 text-sm font-medium">
              {step === 1 ? 'Vui lòng cung cấp email và mật khẩu để tạo tài khoản.' : `Vui lòng nhập mã OTP được gửi đến email của bạn.`}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-red-700 text-sm font-bold">{error}</p>
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email <span className="text-[#e62e43]">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                    <input 
                      name="email" value={formData.email} onChange={handleChange} required 
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-400" 
                      placeholder="example@email.com" type="email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu <span className="text-[#e62e43]">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                    <input 
                      name="matKhau" value={formData.matKhau} onChange={handleChange} required 
                      className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-400" 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu <span className="text-[#e62e43]">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock_reset</span>
                    <input 
                      name="nhapLaiMatKhau" value={formData.nhapLaiMatKhau} onChange={handleChange} required 
                      className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-400" 
                      placeholder="••••••••" 
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pt-2">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input required id="terms" type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#e62e43]/50 checked:bg-[#e62e43] checked:border-[#e62e43] transition-all cursor-pointer"/>
                  <span className="material-symbols-outlined text-white text-[14px] font-bold absolute pointer-events-none opacity-0 peer-checked:opacity-100">check</span>
                </div>
                <label className="text-sm text-slate-600 font-medium leading-relaxed cursor-pointer" htmlFor="terms">
                  Tôi đồng ý với <Link className="text-[#e62e43] font-bold hover:underline underline-offset-2" to="#">điều khoản sử dụng</Link> và chính sách bảo mật của hệ thống.
                </label>
              </div>
              
              <button 
                disabled={loading} 
                className="w-full h-14 bg-[#e62e43] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#c01b30] transition-all shadow-[0_8px_20px_rgba(230,46,67,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider mt-4" 
                type="submit"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ĐANG GỬI MÃ OTP...
                  </>
                ) : (
                  <>
                    ĐĂNG KÝ NGAY
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </>
                )}
              </button>
              
              <div className="text-center pt-6 border-t border-slate-100 mt-6">
                <p className="text-sm text-slate-500 font-medium">
                  Đã có tài khoản? 
                  <Link className="text-[#e62e43] font-black hover:underline underline-offset-4 ml-2" to="/login">ĐĂNG NHẬP</Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center mb-6">
                <span className="material-symbols-outlined text-emerald-500 text-4xl mb-2">mark_email_read</span>
                <p className="text-emerald-800 font-medium text-sm leading-relaxed">
                  Chúng tôi đã gửi một mã OTP gồm 6 chữ số đến email <br/>
                  <strong className="text-emerald-900">{formData.email}</strong>
                </p>
              </div>

              <div className="space-y-3 text-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nhập mã xác thực OTP <span className="text-[#e62e43]">*</span></label>
                <input 
                  name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required 
                  className="w-full max-w-xs mx-auto h-16 px-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-3xl tracking-[0.5em] font-black text-slate-800 focus:outline-none focus:border-[#00b894] focus:ring-4 focus:ring-[#00b894]/10 transition-all" 
                  placeholder="------" type="text" maxLength={6} 
                />
              </div>

              <button 
                disabled={loading} 
                className="w-full h-14 bg-[#00b894] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#00a884] transition-all shadow-[0_8px_20px_rgba(0,184,148,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider mt-4" 
                type="submit"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ĐANG XÁC THỰC...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">verified</span>
                    XÁC NHẬN VÀ TẠO TÀI KHOẢN
                  </>
                )}
              </button>

              <div className="text-center pt-6 space-y-4">
                <p className="text-sm text-slate-500 font-medium">
                  Chưa nhận được mã? 
                  <button type="button" onClick={handleSendOtp} disabled={loading} className="text-[#e62e43] font-black hover:underline underline-offset-4 ml-2">
                    GỬI LẠI MÃ
                  </button>
                </p>
                <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 text-sm font-medium underline underline-offset-4 flex items-center justify-center gap-1 mx-auto">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Quay lại chỉnh sửa email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
