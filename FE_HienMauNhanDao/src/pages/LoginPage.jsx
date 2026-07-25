import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.login({ email, matKhau });
      const loginData = res.data ?? res;

      // Kiểm tra vai trò đăng nhập đối với Mobile App (MAUI WebView)
      const isMobileApp = localStorage.getItem('isMobileApp') === 'true';
      if (isMobileApp && loginData.maVaiTro !== 'TNV') {
        setError('Tài khoản nội bộ không được phép đăng nhập trên ứng dụng di động!');
        return;
      }

      localStorage.setItem('token', loginData.access_token || loginData.token);
      localStorage.setItem('email', loginData.email);
      navigate('/');
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#fdf8f9] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e62e43]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
      
      <div className="w-full max-w-[1000px] bento-card bg-white shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row-reverse relative z-10 p-0 overflow-hidden border border-white">
        
        {/* Right Side - Banner */}
        <div className="w-full md:w-[45%] bg-gradient-to-br from-[#e62e43] to-[#c01b30] p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 p-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[200px]">login</span>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-8 border border-white/30 shadow-inner">
              <span className="material-symbols-outlined text-white text-2xl">favorite</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4 tracking-tight">Chào mừng bạn trở lại!</h1>
            <p className="text-white/80 font-medium text-sm leading-relaxed mb-8">Đăng nhập để xem lịch sử hiến máu, đăng ký tham gia các chiến dịch mới và cập nhật thông tin cá nhân của bạn.</p>
          </div>
          
          <div className="relative z-10 p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm">
            <p className="text-xs text-white/90 italic">"Mỗi giọt máu cho đi, một cuộc đời ở lại. Cảm ơn bạn đã luôn đồng hành cùng chúng tôi."</p>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Đăng Nhập</h2>
            <p className="text-slate-500 text-sm font-medium">Vui lòng điền thông tin email và mật khẩu của bạn.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-red-700 text-sm font-bold">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email <span className="text-[#e62e43]">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                  <input 
                    type="email" required 
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-400"
                    placeholder="example@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu <span className="text-[#e62e43]">*</span></label>
                  <Link to="#" className="text-xs font-bold text-[#e62e43] hover:underline underline-offset-2">Quên mật khẩu?</Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"} required 
                    className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-400"
                    placeholder="••••••••"
                    value={matKhau} onChange={(e) => setMatKhau(e.target.value)} 
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
            </div>
            
            <button 
              type="submit" 
              className="w-full h-14 bg-[#e62e43] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#c01b30] transition-all shadow-[0_8px_20px_rgba(230,46,67,0.25)] active:scale-[0.98] uppercase tracking-wider mt-4"
            >
              ĐĂNG NHẬP
              <span className="material-symbols-outlined text-xl">login</span>
            </button>
            
            <div className="text-center pt-6 border-t border-slate-100 mt-6">
              <p className="text-sm text-slate-500 font-medium">
                Chưa có tài khoản? 
                <Link to="/register" className="text-[#e62e43] font-black hover:underline underline-offset-4 ml-2">ĐĂNG KÝ NGAY</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
