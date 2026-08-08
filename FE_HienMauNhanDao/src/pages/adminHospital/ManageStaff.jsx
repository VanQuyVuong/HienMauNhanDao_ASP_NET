import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center p-10 text-slate-500">Đang tải...</div>;

  return (
    <div className="space-y-4 p-2">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Danh sách Nhân sự Nội bộ</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staffList.map((staff, idx) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 relative overflow-hidden group hover:border-rose-200 transition-colors">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/5 rounded-full group-hover:scale-150 transition-transform" />
            <h3 className="font-bold text-slate-800 text-lg">{staff.hoTen}</h3>
            <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg w-max">
              {staff.role}
            </span>
            <div className="text-sm text-slate-600 mt-2 space-y-1">
              <p>Email: {staff.email}</p>
              <p>SĐT: {staff.soDienThoai}</p>
              <p>CCCD: {staff.cccd}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
