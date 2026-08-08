import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ManageStock() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://localhost:7004/api/AdminHospital/stock", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStocks(res.data);
      } catch (err) {
        toast.error("Lỗi tải thông tin kho máu");
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang đồng bộ dữ liệu kho máu...</p>
      </div>
    );
  }

  // Tính tổng số lượng
  const totalStock = stocks.reduce((acc, curr) => acc + curr.soLuongTon, 0);
  const totalAlerts = stocks.filter(s => s.alert).length;

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
            Giám Sát Kho Máu Nội Bộ
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-xl">
            Theo dõi thời gian thực số lượng túi máu hiện có. Các nhóm máu dưới ngưỡng an toàn sẽ tự động kích hoạt cảnh báo đỏ.
          </p>
        </div>

        <div className="relative z-10 flex gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 min-w-[120px]">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tổng Tồn Kho</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{totalStock}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 min-w-[120px]">
            <p className="text-[10px] font-black uppercase text-red-400 tracking-wider">Cảnh Báo Thiếu</p>
            <p className="text-3xl font-black text-red-600 mt-1">{totalAlerts}</p>
          </div>
        </div>
      </div>

      {/* Grid Nhóm Máu */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stocks.map((s, idx) => {
          const isDanger = s.alert;
          const percentage = Math.min((s.soLuongTon / (s.nguongAnToan * 2)) * 100, 100);
          
          return (
            <div 
              key={idx} 
              className={`relative overflow-hidden p-6 rounded-[2rem] border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isDanger 
                  ? 'bg-gradient-to-b from-white to-red-50/50 border-red-200 hover:shadow-red-500/20 group' 
                  : 'bg-white border-slate-100 hover:shadow-slate-300/30'
              }`}
            >
              {isDanger && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 animate-pulse" />
              )}
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  isDanger 
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40 text-white' 
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 shadow-slate-300/40 text-slate-700'
                }`}>
                  <span className="material-symbols-outlined text-2xl">bloodtype</span>
                </div>
                
                {isDanger && (
                  <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider animate-pulse border border-red-200">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Thiếu hụt
                  </span>
                )}
              </div>
              
              <div className="relative z-10 flex-1">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Nhóm Máu</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black bg-clip-text text-transparent drop-shadow-sm ${
                    isDanger ? 'bg-gradient-to-br from-red-600 to-rose-500' : 'bg-gradient-to-br from-slate-700 to-slate-900'
                  }`}>
                    {s.nhomMau?.replace("_positive", "+").replace("_negative", "-")}
                  </span>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-3xl font-black text-slate-800">
                    {s.soLuongTon} <span className="text-sm font-bold text-slate-400">túi</span>
                  </p>
                  <p className="text-xs font-bold text-slate-500">Mức an toàn: {s.nguongAnToan}</p>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative">
                  {/* Safe threshold marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300 z-10" style={{ left: '50%' }}></div>
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isDanger ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Decorative background number */}
              <div className="absolute -bottom-4 -right-2 text-9xl font-black opacity-[0.03] pointer-events-none select-none">
                {s.nhomMau?.replace("_positive", "+").replace("_negative", "-")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
