import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ROLE_STYLES = {
  ADMIN_BV: "bg-gradient-to-r from-red-500/15 to-rose-500/10 text-[#e62e43] border-rose-200",
  BS: "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-700 border-emerald-200",
  NVYT: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border-cyan-200",
  NVYT_LT: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border-cyan-200",
  "NVYT-LT": "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border-cyan-200",
  NVYT_XN: "bg-gradient-to-r from-purple-500/15 to-fuchsia-500/10 text-purple-700 border-purple-200",
  "NVYT-XN": "bg-gradient-to-r from-purple-500/15 to-fuchsia-500/10 text-purple-700 border-purple-200",
  QLK: "bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-700 border-amber-200",
};

const ROLE_LABELS = {
  ADMIN_BV: "Quản trị Bệnh viện",
  BS: "Bác sĩ lâm sàng",
  NVYT: "Nhân viên y tế",
  NVYT_LT: "Lễ tân & Điều phối",
  "NVYT-LT": "Lễ tân & Điều phối",
  NVYT_XN: "Điều dưỡng & Xét nghiệm",
  "NVYT-XN": "Điều dưỡng & Xét nghiệm",
  QLK: "Quản lý kho máu",
};

const TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "ADMIN_BV", label: "Ban Quản trị" },
  { id: "BS", label: "Bác sĩ" },
  { id: "NVYT", label: "Điều dưỡng & Lễ tân" },
  { id: "QLK", label: "Kho máu" },
];

export default function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://localhost:7004/api/AdminHospital/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách nhân sự");
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      // Filter by search query
      if (search && !staff.hoTen?.toLowerCase().includes(search.toLowerCase()) && !staff.email?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Filter by tab
      if (activeTab === "ALL") return true;
      if (activeTab === "NVYT" && (staff.role?.includes("NVYT"))) return true;
      if (activeTab === staff.role) return true;
      
      return false;
    });
  }, [staffList, activeTab, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang đồng bộ hồ sơ nhân sự...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
            Danh Sách Nhân Sự Nội Bộ
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Quản lý và điều phối nguồn nhân lực tại bệnh viện.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-rose-500 transition-colors">search</span>
            </div>
            <input
              type="text"
              placeholder="Tìm tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-400"
            />
          </div>
          
          {/* Action Button */}
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e62e43] to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide pb-2 gap-2 px-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-slate-800 text-white shadow-md shadow-slate-900/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">group_off</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Không tìm thấy nhân sự</h3>
          <p className="text-slate-500 text-sm">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStaff.map((staff, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedStaff(staff)}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 hover:border-rose-100 transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Decorative gradient orb */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />

              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-inner mb-4 relative z-10 border border-slate-200/60 group-hover:border-rose-200 transition-colors">
                <span className="text-2xl font-black bg-gradient-to-br from-[#e62e43] to-rose-400 bg-clip-text text-transparent">
                  {staff.hoTen?.substring(0, 2).toUpperCase() || "NV"}
                </span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              
              <h3 className="font-black text-slate-800 text-lg mb-1 group-hover:text-[#e62e43] transition-colors line-clamp-1">{staff.hoTen}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{staff.maNhanVien}</p>
              
              <span className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl border ${ROLE_STYLES[staff.role] || ROLE_STYLES.TNV}`}>
                {ROLE_LABELS[staff.role] || staff.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal Profile Chi Tiết */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedStaff(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden transform transition-all">
            {/* Modal Header Cover */}
            <div className="h-32 bg-gradient-to-br from-[#e62e43] to-rose-600 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <button 
                onClick={() => setSelectedStaff(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            {/* Avatar overlaps header */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-[1.5rem] bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-[1.2rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <span className="text-3xl font-black text-slate-700">
                    {selectedStaff.hoTen?.substring(0, 2).toUpperCase() || "NV"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="pt-16 pb-8 px-8 flex flex-col items-center">
              <h3 className="text-2xl font-black text-slate-800 mb-1">{selectedStaff.hoTen}</h3>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border mb-6 ${ROLE_STYLES[selectedStaff.role] || ROLE_STYLES.TNV}`}>
                {ROLE_LABELS[selectedStaff.role] || selectedStaff.role}
              </span>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{selectedStaff.email || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</p>
                    <p className="text-sm font-bold text-slate-700">{selectedStaff.soDienThoai || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">badge</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số CCCD</p>
                    <p className="text-sm font-bold text-slate-700">{selectedStaff.cccd || "Chưa cập nhật"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
