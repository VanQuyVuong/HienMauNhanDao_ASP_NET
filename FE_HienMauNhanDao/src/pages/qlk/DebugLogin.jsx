import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DebugLogin() {
  const navigate = useNavigate();

  const handleBypass = () => {
    // Thiết lập các thông tin giả lập để vượt qua Guard
    localStorage.setItem('token', 'debug-bypass-token-2026');
    localStorage.setItem('email', 'tranminhhung.kho@bvdn.vn');
    localStorage.setItem('role', 'QLK');
    localStorage.setItem('maNV', 'NV00012');
    localStorage.setItem('userId', 'TK00012');

    // Chuyển hướng ngay lập tức
    navigate('/quan-ly-kho/thong-ke', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-primary">terminal</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Debug Login Mode</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Đã khôi phục lối đi tắt! Bạn có thể vào thẳng hệ thống <b>Quản lý kho</b> bằng nút bên dưới.
        </p>
        <button 
          onClick={handleBypass}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Vào trang Kho ngay</span>
          <span className="material-symbols-outlined">rocket_launch</span>
        </button>
      </div>
    </div>
  );
}
