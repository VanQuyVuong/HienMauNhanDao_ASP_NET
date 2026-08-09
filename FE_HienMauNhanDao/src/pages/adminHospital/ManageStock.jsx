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

  const totalStock = stocks.reduce((acc, curr) => acc + curr.soLuongTon, 0);
  const totalAlerts = stocks.filter(s => s.alert).length;

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header gọn gàng */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/85 backdrop-blur-2xl p-6 rounded-3xl border border-white/80 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800">Thống Kê Kho Máu</h2>
          <p className="text-slate-500 font-medium text-xs mt-1">Giám sát lượng túi máu tồn kho hiện tại.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end border-r border-slate-200 pr-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tổng tồn kho</span>
            <span className="text-lg font-black text-slate-800">{totalStock} <span className="text-[10px] font-bold text-slate-500">túi</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400">Thiếu hụt</span>
            <span className="text-lg font-black text-red-600">{totalAlerts} <span className="text-[10px] font-bold text-red-400">nhóm</span></span>
          </div>
        </div>
      </div>

      {/* Cyber Glass Data Table */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900/5 border-b border-slate-200/70">
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-left w-24">Nhóm Máu</th>
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-left">Số Lượng Tồn</th>
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-left">Mức An Toàn</th>
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-left w-1/3">Tiến Độ Tồn Kho</th>
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="w-8 h-8 border-3 border-[#e62e43] border-t-transparent rounded-full animate-spin mx-auto mb-2 shadow-lg shadow-[#e62e43]/20" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Đang tải dữ liệu kho máu...</p>
                  </td>
                </tr>
              ) : (
                stocks.map((s, idx) => {
                  const isDanger = s.alert;
                  const percentage = Math.min((s.soLuongTon / (s.nguongAnToan * 2)) * 100, 100);
                  const bloodName = s.nhomMau?.replace("_positive", "+").replace("_negative", "-");
                  
                  return (
                    <tr key={idx} className={`transition-all duration-200 group ${isDanger ? 'bg-red-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-5 py-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${
                          isDanger ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {bloodName}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-black ${isDanger ? 'text-red-600' : 'text-slate-800'}`}>
                          {s.soLuongTon}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-slate-500">
                          {s.nguongAnToan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative">
                          <div className="absolute top-0 bottom-0 w-[1px] bg-slate-300 z-10" style={{ left: '50%' }}></div>
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isDanger ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isDanger
                            ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                        }`}>
                          {isDanger ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Cảnh báo thiếu
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              An toàn
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
