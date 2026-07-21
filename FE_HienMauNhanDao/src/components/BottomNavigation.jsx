import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavigation() {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: 'home' },
    { path: '/chiendich', label: 'Chiến dịch', icon: 'campaign' },
    { path: token ? '/don-dang-ky' : '/login', label: 'Đơn của tôi', icon: 'assignment' },
    { path: token ? '/ho-so' : '/login', label: 'Hồ sơ', icon: 'person' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 h-16 flex justify-around items-center shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors duration-150 relative"
          >
            <span
              className={`material-symbols-outlined text-[24px] ${
                active ? 'text-primary' : 'text-slate-400'
              }`}
              style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] mt-0.5 font-bold tracking-tight ${
                active ? 'text-primary' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
            {active && (
              <span className="absolute top-0 w-10 h-1 bg-primary rounded-b-full"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
