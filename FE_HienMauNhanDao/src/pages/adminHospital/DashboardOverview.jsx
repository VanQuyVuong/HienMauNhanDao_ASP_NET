import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from "recharts";

const ROLE_COLORS = {
  "ADMIN_BV": "#e62e43",
  "BS": "#10b981",
  "NVYT": "#0ea5e9",
  "NVYT_LT": "#0ea5e9",
  "NVYT-LT": "#0ea5e9",
  "NVYT_XN": "#a855f7",
  "NVYT-XN": "#a855f7",
  "QLK": "#f59e0b",
};

const ROLE_LABELS = {
  ADMIN_BV: "Quản trị Bệnh viện",
  BS: "Bác sĩ",
  NVYT: "Nhân viên y tế",
  NVYT_LT: "Lễ tân",
  "NVYT-LT": "Lễ tân",
  NVYT_XN: "Xét nghiệm",
  "NVYT-XN": "Xét nghiệm",
  QLK: "Quản lý kho",
};

export default function DashboardOverview() {
  const [stocks, setStocks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [stockRes, staffRes] = await Promise.all([
          axios.get("https://localhost:7004/api/AdminHospital/stock", { headers }),
          axios.get("https://localhost:7004/api/AdminHospital/staff", { headers })
        ]);

        setStocks(stockRes.data);
        setStaffList(staffRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tính toán số liệu thống kê (Summary)
  const totalStock = stocks.reduce((acc, curr) => acc + curr.soLuongTon, 0);
  const totalAlerts = stocks.filter(s => s.alert).length;
  const totalStaff = staffList.length;

  // Xử lý dữ liệu cho Biểu đồ Cột (Kho Máu)
  const stockChartData = stocks.map(s => ({
    name: s.nhomMau?.replace("_positive", "+").replace("_negative", "-"),
    "Tồn Kho": s.soLuongTon,
    "Ngưỡng An Toàn": s.nguongAnToan
  }));

  // Xử lý dữ liệu cho Biểu đồ Tròn (Nhân sự)
  const staffRoleCounts = staffList.reduce((acc, curr) => {
    const role = curr.role || "UNKNOWN";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const staffChartData = Object.keys(staffRoleCounts).map(role => ({
    name: ROLE_LABELS[role] || role,
    value: staffRoleCounts[role],
    color: ROLE_COLORS[role] || "#94a3b8"
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#e62e43] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tổng hợp dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header phẳng */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-rose-50 text-[10px] font-black text-[#e62e43] uppercase tracking-widest border border-rose-100 rounded-md">Bảng Điều Khiển</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-800">Thống Kê Tổng Quan</h1>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Dữ liệu thời gian thực về kho máu và nhân sự bệnh viện.</p>
        </div>
      </div>

      {/* Thẻ Thống Kê (Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng túi máu hiện có</p>
            <p className="text-3xl font-black text-slate-800">{totalStock}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">bloodtype</span>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mức độ cảnh báo đỏ</p>
            <p className="text-3xl font-black text-red-600">{totalAlerts} <span className="text-sm font-bold text-red-400">nhóm</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng nhân sự bệnh viện</p>
            <p className="text-3xl font-black text-slate-800">{totalStaff}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>
      </div>

      {/* Khu vực Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ Cột - Chiếm 2 phần */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tình Hình Dự Trữ Kho Máu</h3>
            <Link to="/admin-bv/kho-mau" className="text-[10px] font-bold text-[#e62e43] hover:underline uppercase">Xem chi tiết</Link>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="Tồn Kho" fill="#e62e43" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Ngưỡng An Toàn" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Tròn - Chiếm 1 phần */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Cơ Cấu Nhân Sự</h3>
            <Link to="/admin-bv/nhan-su" className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Quản lý</Link>
          </div>
          <div className="flex-1 w-full h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={staffChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {staffChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Chữ ở giữa vòng tròn */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800">{totalStaff}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Người</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {staffChartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[10px] font-bold text-slate-600 truncate" title={entry.name}>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
