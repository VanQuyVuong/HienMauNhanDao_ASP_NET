import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login({ email, matKhau });
      const loginData = res.data?.success ? res.data.data : (res.data ?? res);

      const token = loginData.accessToken || loginData.access_token;
      const role = loginData.maVaiTro;
      const userId = loginData.userId || loginData.user_id;
      const maNV = loginData.maNhanVien || loginData.maNV;

      // Kiểm tra vai trò đăng nhập đối với Mobile App (MAUI WebView)
      const isMobileApp = localStorage.getItem('isMobileApp') === 'true';
      if (isMobileApp && role !== 'TNV') {
        setError('Tài khoản nội bộ không được phép đăng nhập trên ứng dụng di động!');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('email', loginData.email);
      localStorage.setItem('userId', userId);
      if (maNV) localStorage.setItem('maNV', maNV);
      localStorage.setItem('role', role);

      // Redirect ngay theo vai trò
      if (role === 'BS') {
        window.location.href = '/bac-si/danh-sach-cho-kham';
      } else if (role === 'NVYT') {
        window.location.href = '/nvyt/don-dang-ky';
      } else if (role === 'QLK') {
        window.location.href = '/quan-ly-kho/thong-ke';
      } else if (role === 'AD') {
        window.location.href = '/admin/nguoi-dung';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-[#F3F4F6] min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[1024px] bg-white border border-slate-200 rounded-2xl overflow-hidden flex shadow-sm">
        <div className="w-[420px] relative hidden md:flex items-end p-12 shrink-0">
          <div className="absolute inset-0 z-0">
            <img alt="Blood Donation" className="w-full h-full object-cover opacity-30 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDueaJAaTz0RjLbygBiVaKlLkFa-k5bSzh3hFB8rOEZTroPIavRCetrAXDv-_TSrjqBNwOmHaIjyqdkEZ8AjEpfikCmXmBCK0KXBQhlLR8Ol5Zw9MUnv74Jylcc41QYB6mFMcjnx4m6d8a3WnxZcdCPkxFWhxCi_4Cfxrq8U-m9ENBUTgvwqsNv_hmwBkTnL-4O8qAmZQTOYVe93SOUpTKuXqPXaQSnhULQandiA53FjSrpsyB6dqv2wxg1y4H-eCXtdDfi39hCAVvd" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
          </div>
          <div className="relative z-10 text-white w-full">
            <h1 className="text-3xl font-bold leading-tight mb-4">Hệ thống Quản lý Hiến máu Nhân đạo TP. Đà Nẵng</h1>
            <p className="text-primary-fixed-dim text-sm leading-relaxed mb-8">Hành trình của mỗi giọt máu bắt đầu từ sự tự nguyện của bạn. Tham gia cộng đồng tình nguyện viên để cứu sống hàng ngàn người bệnh.</p>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-3">
                <img alt="Avatar 1" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhekJIdPkF-QyoAl_qtcuNI3ofx8UcU-Wjx1kkojZVLuvHxNUBvL829pAsO3Z6dPOYCiY978fmgTJf81AlorlhA8ZB07UItddOy27nZFOQ78oUyq4NFdlDB-uMIf1ByiWkdXDfYCDi0D8iGLYR0N6IOJdHIavoBQjtyLGARMiL9eGObl1DnpwtWUbjNPQzG7dduIpCG19AA29I0KWGwy3UMquRndqqHs758gJbl-YBSVPrU8gmUFqkOu753j4JUxMWSqjqc5M4Um6q" />
                <img alt="Avatar 2" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYs2c1u9I4LLYj0PwXno--xuejWcbyhwRjVoAI0flhk7hVjh5RmY0WQAOIDvQH6ulkxY6OUI7xQunKQtve9939ii_AeoNMX3l3xu4pCfRZa94VU5_gk3pdF_4MtjLYVI4m4GgmQTW84FxIJz6TZ7nl1jfaXqmxC71ZEhVqhxFEA5yBgyorwzGWgUVf9KlzVWE_mFGnol9gheykM7vEQ-4Z27spZIKt23b2RydbokGE4BXPgipv6MX9Pjs_u2X_x9wiBMlfw05TwO14" />
                <img alt="Avatar 3" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACTIM9Xq4ZtI3pQefWqFM51fQYkjfY7WvbMCEzN-Cn1OEsMx3MD3DGpf27RW15Fl9hoHntk2N4MmZvM6ycrZvPRfu4mKNP8eViDJMuFeA_UHcLFu94VVrviNXzL2KC0DzrfNWHiQUpPexH8MhwdmUPDmeUvA1nIFiwhPV9WPDmTIyA1x0PlU6rkzeD_kNkafaH-OMzK-RhWQgg5erWKBJZfD0c6ajRtm7MtwD1jvAsVxahIzLxNo1EiSH0Z7wZDn5Mkk9N9Qm7K-Yu" />
              </div>
              <span className="text-xs font-medium">+5,000 tình nguyện viên</span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-on-surface mb-2 tracking-tight">Đăng nhập Hệ thống</h2>
            <p className="text-slate-500 text-sm">Vui lòng đăng nhập để sử dụng các tính năng của hệ thống.</p>
          </div>
          {error && <div className="mb-4 text-red-600 text-sm font-bold">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface-variant">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all" placeholder="example@email.com" type="email" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface-variant">Mật khẩu</label>
              <div className="relative">
                <input
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  required
                  className="w-full h-12 px-4 pr-12 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <input className="w-4 h-4 rounded-sm text-primary focus:ring-primary border-slate-300" id="remember" type="checkbox" />
                <label className="text-sm text-slate-600" htmlFor="remember">Ghi nhớ đăng nhập</label>
              </div>
              <Link to="#" className="text-sm font-bold text-primary hover:underline underline-offset-2">Quên mật khẩu?</Link>
            </div>
            <button 
              disabled={loading}
              className="w-full h-12 bg-[#e62e43] hover:bg-[#c01b30] text-white font-black rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer" 
              type="submit">
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span className="text-base">Đăng nhập</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Chưa có tài khoản?
                <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1" to="/register">Đăng ký ngay</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
