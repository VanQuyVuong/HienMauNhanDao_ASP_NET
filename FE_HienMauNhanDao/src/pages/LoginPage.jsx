import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
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
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-black text-center text-slate-900 mb-6">Đăng Nhập</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input 
            type="email" required 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={email} onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
          <input 
            type="password" required 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={matKhau} onChange={(e) => setMatKhau(e.target.value)} 
          />
        </div>
        <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-bold mt-2 hover:bg-red-800">
          Đăng nhập
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Chưa có tài khoản? <Link to="/register" className="text-primary font-bold">Đăng ký ngay</Link>
      </p>
    </div>
  );
}
