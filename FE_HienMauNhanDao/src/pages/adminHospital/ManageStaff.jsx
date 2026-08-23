import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { ENDPOINTS } from "../../constants/api";
import { toast } from "react-toastify";

const ROLE_STYLES = {
  ADMIN_BV: "bg-gradient-to-r from-red-500/15 to-rose-500/10 text-[#e62e43] border border-[#e62e43]/30 shadow-sm shadow-red-500/10",
  BS: "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-700 border border-emerald-500/30 shadow-sm shadow-emerald-500/10",
  NVYT: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
  NVYT_LT: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
  "NVYT-LT": "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
  NVYT_XN: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
  "NVYT-XN": "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
  QLK: "bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-700 border border-amber-500/30 shadow-sm shadow-amber-500/10",
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
      const res = await api.get(ENDPOINTS.ADMIN_HOSPITAL.STAFF);
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
      if (search && !staff.hoTen?.toLowerCase().includes(search.toLowerCase()) && !staff.email?.toLowerCase().includes(search.toLowerCase()) && !staff.maNhanVien?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Filter by tab
      if (activeTab === "ALL") return true;
      if (activeTab === "NVYT" && (staff.role?.includes("NVYT"))) return true;
      if (activeTab === staff.role) return true;
      
      return false;
    });
  }, [staffList, activeTab, search]);

  return (
    <div className="w-full flex flex-col gap-6 p-2">
      {/* Header & Controls (Giống QuanLyNguoiDung) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-[#e62e43] shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã, tên, email..."
              className="w-full h-9 bg-slate-100 hover:bg-slate-50 border border-transparent rounded-xl pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43]/40 focus:ring-2 focus:ring-[#e62e43]/10 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Cyber Glass Data Table */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900/5 border-b border-slate-200/70">
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-left">Mã Định Danh</th>
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-left">Nhân Sự</th>
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-left">Chức Vụ</th>
                <th className="px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="w-8 h-8 border-3 border-[#e62e43] border-t-transparent rounded-full animate-spin mx-auto mb-2 shadow-lg shadow-[#e62e43]/20" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Đang tải danh sách nhân sự...</p>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-300">
                      <span className="material-symbols-outlined text-3xl">person_search</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">Không tìm thấy nhân sự</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Thử thay đổi từ khóa tìm kiếm hoặc thẻ lọc</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff, idx) => {
                  const roleCode = staff.role;
                  return (
                    <tr key={idx} className="hover:bg-rose-50/30 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-200 group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-extrabold text-[#e62e43] bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-xl shadow-sm">
                          {staff.maNhanVien}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-xs shrink-0 group-hover:bg-[#e62e43] group-hover:text-white transition-colors">
                            {staff.hoTen?.substring(0, 2).toUpperCase() || "NV"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{staff.hoTen}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{staff.email || "Chưa có email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wide ${ROLE_STYLES[roleCode] || "bg-slate-100 text-slate-600"}`}>
                          <span className="material-symbols-outlined text-sm">verified_user</span>
                          {ROLE_LABELS[roleCode] || roleCode}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedStaff(staff)}
                          title="Xem chi tiết"
                          className="h-9 px-3 inline-flex items-center justify-end gap-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/20 transition-all duration-200"
                        >
                          <span className="material-symbols-outlined text-base">person_book</span>
                          <span className="hidden md:inline">Hồ sơ chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Profile Chi Tiết (Thiết kế phẳng hơn) */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedStaff(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden scale-100 transition-all">
            <div className="bg-gradient-to-r from-[#e62e43] to-rose-600 px-6 py-5 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  <span className="text-lg font-black text-white">{selectedStaff.hoTen?.substring(0, 2).toUpperCase() || "NV"}</span>
                </div>
                <div>
                  <h3 className="text-white font-black tracking-wide">{selectedStaff.hoTen}</h3>
                  <p className="text-rose-100 text-[10px] uppercase font-bold tracking-widest">{selectedStaff.maNhanVien}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStaff(null)}
                className="relative z-10 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-xl backdrop-blur-md transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wide ${ROLE_STYLES[selectedStaff.role] || "bg-slate-100 text-slate-600"}`}>
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  {ROLE_LABELS[selectedStaff.role] || selectedStaff.role}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{selectedStaff.email || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">call</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại</p>
                    <p className="text-xs font-bold text-slate-700">{selectedStaff.soDienThoai || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">badge</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số CCCD</p>
                    <p className="text-xs font-bold text-slate-700">{selectedStaff.cccd || "Chưa cập nhật"}</p>
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
