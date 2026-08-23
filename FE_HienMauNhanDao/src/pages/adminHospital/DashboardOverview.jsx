import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ENDPOINTS } from "../../constants/api";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
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
  ADMIN_BV: "Quản trị BV",
  BS: "Bác sĩ",
  NVYT: "Điều dưỡng",
  NVYT_LT: "Lễ tân",
  "NVYT-LT": "Lễ tân",
  NVYT_XN: "Xét nghiệm",
  "NVYT-XN": "Xét nghiệm",
  QLK: "Quản lý kho",
};

const LOCATION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function DashboardOverview() {
  const [stocks, setStocks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [campaignStats, setCampaignStats] = useState({ monthly: [], locations: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, staffRes, campaignRes] = await Promise.allSettled([
          api.get(ENDPOINTS.ADMIN_HOSPITAL.STOCK),
          api.get(ENDPOINTS.ADMIN_HOSPITAL.STAFF),
          api.get(ENDPOINTS.ADMIN_HOSPITAL.CAMPAIGN_STATS)
        ]);

        if (stockRes.status === "fulfilled") setStocks(stockRes.value.data);
        if (staffRes.status === "fulfilled") setStaffList(staffRes.value.data);
        if (campaignRes.status === "fulfilled") setCampaignStats(campaignRes.value.data);
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
  const totalCampaigns = campaignStats.monthly.reduce((acc, curr) => acc + curr.total, 0);

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
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-3 border-[#e62e43] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tổng hợp dữ liệu toàn diện...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header phẳng */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-rose-50 text-[10px] font-black text-[#e62e43] uppercase tracking-widest border border-rose-100 rounded-md">Tổng Quan</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Data
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-800">Thông Tin Tổng Quan</h1>
          <p className="text-slate-500 font-medium text-xs mt-0.5">Hiển thị đầy đủ số liệu công khai và nội bộ của hệ thống hiến máu.</p>
        </div>
      </div>

      {/* Thẻ Thống Kê (Summary Cards) - Mở rộng lên 4 thẻ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cảnh báo thiếu hụt</p>
            <p className="text-3xl font-black text-red-600">{totalAlerts} <span className="text-sm font-bold text-red-400">nhóm</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng nhân sự y tế</p>
            <p className="text-3xl font-black text-slate-800">{totalStaff}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">medical_information</span>
          </div>
        </div>

        {/* Card 4 (Mới) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chiến dịch năm nay</p>
            <p className="text-3xl font-black text-slate-800">{totalCampaigns}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
        </div>
      </div>

      {/* Hàng 1 (Kho Máu & Nhân Sự) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ Cột - Chiếm 2 phần */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tình Hình Dự Trữ Kho Máu</h3>
            <Link to="/admin-bv/kho-mau" className="text-[10px] font-bold text-[#e62e43] hover:underline uppercase">Xem chi tiết</Link>
          </div>
          <div className="flex-1 w-full" style={{ minHeight: '280px' }}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="Tồn Kho" fill="#e62e43" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Ngưỡng An Toàn" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Tròn Nhân Sự - Chiếm 1 phần */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Cơ Cấu Nhân Sự</h3>
            <Link to="/admin-bv/nhan-su" className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Quản lý</Link>
          </div>
          <div className="flex-1 w-full relative" style={{ minHeight: '220px' }}>
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">{totalStaff}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Người</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 max-h-20 overflow-y-auto custom-scrollbar">
            {staffChartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-[10px] font-bold text-slate-600 truncate" title={entry.name}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hàng 2 (Chiến dịch mới bổ sung) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ Đường/Vùng (Area Chart) cho Chiến dịch theo tháng */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Xu Hướng Chiến Dịch Hiến Máu</h3>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Số lượng chiến dịch công khai toàn hệ thống năm nay</p>
            </div>
            <Link to="/admin-bv/chien-dich" className="text-[10px] font-bold text-emerald-600 hover:underline uppercase">Xem chi tiết</Link>
          </div>
          <div className="flex-1 w-full" style={{ minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={campaignStats.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCampaigns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <RechartsTooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="Số lượng chiến dịch" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCampaigns)" 
                  activeDot={{ r: 6, fill: "#fff", stroke: "#10b981", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Tròn (Donut Chart) cho Địa điểm tổ chức */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Cơ Cấu Địa Điểm</h3>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Phân bổ chiến dịch theo khu vực</p>
            </div>
          </div>
          <div className="flex-1 w-full relative" style={{ minHeight: '200px' }}>
            {(!campaignStats.locations || campaignStats.locations.length === 0) ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-bold">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignStats.locations}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {campaignStats.locations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={LOCATION_COLORS[index % LOCATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {campaignStats.locations?.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-4xl text-emerald-100 drop-shadow-sm">location_on</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2">
            {campaignStats.locations.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: LOCATION_COLORS[index % LOCATION_COLORS.length] }}></span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate" title={entry.name}>{entry.name}</span>
                  <span className="text-xs font-black text-slate-800">{entry.value} chiến dịch</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
