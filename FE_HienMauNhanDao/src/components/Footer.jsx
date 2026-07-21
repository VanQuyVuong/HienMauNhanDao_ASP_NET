import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
            </div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">HỆ THỐNG HIẾN MÁU<br /><span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">TP. Đà Nẵng</span></h1>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">Chung tay vì cộng đồng, mang đến hy vọng sống cho mọi người.</p>
        </div>
        <div className="col-span-1">
          <h4 className="text-white font-bold mb-4">Liên Hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><span className="material-symbols-outlined text-lg">location_on</span> 123 Lê Lợi, Hải Châu, ĐN</li>
            <li className="flex gap-2"><span className="material-symbols-outlined text-lg">call</span> 1900 1234</li>
            <li className="flex gap-2"><span className="material-symbols-outlined text-lg">mail</span> hotro@hienmaudn.vn</li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="text-white font-bold mb-4">Liên Kết Nhanh</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="#" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Hướng dẫn hiến máu</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Tin tức & Sự kiện</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">Hỏi đáp (FAQ)</Link></li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="text-white font-bold mb-4">Đăng Ký Nhận Tin</h4>
          <p className="text-sm mb-4">Nhận thông báo về các chiến dịch hiến máu khẩn cấp.</p>
          <div className="flex">
            <input type="email" placeholder="Email của bạn"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg outline-none focus:border-primary text-sm" />
            <button className="px-4 bg-primary text-white font-bold rounded-r-lg hover:bg-red-800 transition-colors">Gửi</button>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center text-xs text-center">
        <p>© 2024 Danang Blood Donation. All Rights Reserved.</p>
        <div className="flex gap-6">
          <Link to="#" className="hover:text-white">Điều khoản sử dụng</Link>
          <Link to="#" className="hover:text-white">Chính sách bảo mật</Link>
        </div>
      </div>
    </footer>
  );
}
