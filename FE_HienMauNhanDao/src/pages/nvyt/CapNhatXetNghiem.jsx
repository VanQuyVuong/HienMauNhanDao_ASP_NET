import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function CapNhatXetNghiem() {
  const { nhanVien } = useOutletContext();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cập nhật xét nghiệm</h1>
        <p className="text-slate-500 mt-1 text-sm">Cập nhật kết quả xét nghiệm cho tình nguyện viên</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">biotech</span>
        <p className="text-slate-500 font-medium">Tính năng đang được phát triển</p>
        <p className="text-xs text-slate-400 mt-1">Cập nhật kết quả xét nghiệm sẽ có trong phiên bản tới</p>
      </div>
    </div>
  );
}
