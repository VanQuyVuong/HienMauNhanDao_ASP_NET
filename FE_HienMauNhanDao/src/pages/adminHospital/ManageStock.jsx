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

  if (loading) return <div className="text-center p-10 text-slate-500">Đang tải...</div>;

  return (
    <div className="space-y-4 p-2">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Tình trạng Kho máu</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stocks.map((s, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-1 items-center text-center ${s.alert ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <span className="text-4xl font-black bg-gradient-to-br from-rose-500 to-rose-700 bg-clip-text text-transparent drop-shadow-sm">
              {s.nhomMau?.replace("_positive", "+").replace("_negative", "-")}
            </span>
            <p className="text-2xl font-bold text-slate-800 mt-2">{s.soLuongTon} <span className="text-sm font-normal text-slate-500">túi</span></p>
            <p className="text-xs text-slate-500 font-medium">Ngưỡng: {s.nguongAnToan}</p>
            {s.alert && (
              <span className="mt-2 text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse">
                Cảnh báo Thiếu
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
