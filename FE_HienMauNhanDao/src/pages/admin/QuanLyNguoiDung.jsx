import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import userService from "../../services/userService";
import { getApiError } from "../../utils/apiHelper";

const PRIMARY_COLOR = "#e62e43";

const ROLE_STYLES = {
  AD: "bg-gradient-to-r from-red-500/15 to-rose-500/10 text-[#e62e43] border border-[#e62e43]/30 shadow-sm shadow-red-500/10",
  BS: "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-700 border border-emerald-500/30 shadow-sm shadow-emerald-500/10",
  NVYT: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
  QLK: "bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-700 border border-amber-500/30 shadow-sm shadow-amber-500/10",
  TNV: "bg-gradient-to-r from-slate-500/15 to-gray-500/10 text-slate-700 border border-slate-400/30 shadow-sm",
};

const ROLE_LABELS = {
  AD: "Quản trị viên",
  BS: "Bác sĩ lâm sàng",
  NVYT: "Nhân viên y tế",
  QLK: "Quản lý kho máu",
  TNV: "Tình nguyện viên",
};

const emptyForm = { email: "", matKhau: "", maVaiTro: "" };

export default function QuanLyNguoiDung() {
  const { searchQuery: headerSearch = "" } = useOutletContext() || {};
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = localStorage.getItem("userId");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userList, roleList] = await Promise.all([
        userService.getAll(),
        userService.getVaiTroList(),
      ]);
      setUsers(Array.isArray(userList) ? userList : []);
      setRoles(Array.isArray(roleList) ? roleList : []);
    } catch (err) {
      Swal.fire(
        "Lỗi hệ thống",
        getApiError(err, "Không thể tải danh sách người dùng"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const q = (search || headerSearch).trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.maTaiKhoan || "").toLowerCase().includes(q) ||
        (u.tenVaiTro || "").toLowerCase().includes(q);
      const matchRole = !filterRole || u.maVaiTro === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole, headerSearch]);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.trangThai !== false).length;
    return { total: users.length, active, inactive: users.length - active };
  }, [users]);

  const handleOpenModal = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email || !form.matKhau || !form.maVaiTro) {
      Swal.fire(
        "Thiếu dữ liệu",
        "Vui lòng điền đầy đủ email, mật khẩu và chọn vai trò",
        "warning",
      );
      return;
    }
    setSubmitting(true);
    try {
      await userService.create({
        email: form.email.trim(),
        matKhau: form.matKhau,
        maVaiTro: form.maVaiTro,
        trangThai: true,
      });
      Swal.fire({
        icon: "success",
        title: "Cấp quyền thành công!",
        text: `Đã tạo tài khoản cho ${form.email}`,
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      Swal.fire(
        "Không thể cấp quyền",
        err?.response?.data?.message || err.message || "Lỗi tạo tài khoản",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isActive = user.trangThai !== false;
    const action = isActive ? "vô hiệu hóa" : "kích hoạt";
    const result = await Swal.fire({
      title: `${isActive ? "Vô hiệu hóa" : "Kích hoạt"} quyền truy cập?`,
      html: `Bạn có chắc muốn ${action} tài khoản <b>${user.email}</b>?<br/><span style="font-size: 12px; color: #64748b;">Người dùng sẽ ${isActive ? "mất" : "được khôi phục"} quyền đăng nhập vào hệ thống y tế.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActive ? "#e62e43" : "#10b981",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: isActive ? "Vô hiệu hóa ngay" : "Kích hoạt lại",
      cancelButtonText: "Hủy bỏ",
    });
    if (!result.isConfirmed) return;

    try {
      await userService.setTrangThai(user.maTaiKhoan, !isActive);
      Swal.fire("Cập nhật thành công", `Đã ${action} tài khoản`, "success");
      loadData();
    } catch (err) {
      Swal.fire(
        "Lỗi",
        err?.response?.data?.message || "Thao tác thất bại",
        "error",
      );
    }
  };

  const handleDelete = async (user) => {
    if (user.maTaiKhoan === currentUserId) {
      Swal.fire(
        "Thao tác từ chối",
        "Bạn không thể tự xóa tài khoản quản trị đang đăng nhập của chính mình!",
        "warning",
      );
      return;
    }
    const result = await Swal.fire({
      title: "Xóa vĩnh viễn tài khoản?",
      html: `Cảnh báo: Thao tác này không thể khôi phục.<br/>Toàn bộ quyền hạn của <b>${user.email}</b> sẽ bị xóa sạch khỏi hệ thống.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#e62e43",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;

    try {
      await userService.delete(user.maTaiKhoan);
      Swal.fire("Đã xóa", "Tài khoản đã bị bãi bỏ khỏi CSDL", "success");
      loadData();
    } catch (err) {
      Swal.fire(
        "Lỗi xóa dữ liệu",
        err?.response?.data?.message || "Không thể xóa tài khoản này",
        "error",
      );
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* 🚀 Page Header & Action */}
      <div className="flex items-end justify-between flex-wrap gap-6 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/80 shadow-xl shadow-slate-900/5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-[#e62e43] text-xs font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#e62e43] animate-pulse" />
            <span>Phân quyền & Bảo mật y tế</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Kiểm soát truy cập, cấp quyền tài khoản cho Bác sĩ, Nhân viên y tế
            và Tình nguyện viên.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2.5 h-12 px-7 bg-gradient-to-r from-[#e62e43] via-red-600 to-[#c01b30] text-white font-black text-sm rounded-2xl hover:shadow-xl hover:shadow-[#e62e43]/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 group shrink-0"
        >
          <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">
            person_add
          </span>
          <span>Cấp tài khoản mới</span>
        </button>
      </div>

      {/* 🍱 Bento Stats Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1 - Dark Cyber */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[#e62e43]/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Tổng tài khoản hệ thống
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400 border border-white/10">
              <span className="material-symbols-outlined text-xl">
                manage_accounts
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-black text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs font-bold text-slate-400">tài khoản</span>
          </div>
        </div>

        {/* Card 2 - Medical Emerald */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white/90 border border-emerald-500/20 rounded-3xl p-6 shadow-xl shadow-emerald-500/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              Đang hoạt động (Active)
            </span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-600 tracking-tight">
              {stats.active}
            </span>
            <span className="text-xs font-bold text-slate-500">
              truy cập hợp lệ
            </span>
          </div>
        </div>

        {/* Card 3 - Ruby Warning */}
        <div className="bg-gradient-to-br from-rose-500/10 via-white to-white/90 border border-rose-500/20 rounded-3xl p-6 shadow-xl shadow-rose-500/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-rose-800">
              Đã tạm khóa (Vô hiệu)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-[#e62e43]">
              <span className="material-symbols-outlined text-base">
                person_off
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#e62e43] tracking-tight">
              {stats.inactive}
            </span>
            <span className="text-xs font-bold text-slate-500">
              bị cấm truy cập
            </span>
          </div>
        </div>
      </div>

      {/* 🔍 Glass Filter & Control Bar */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-xl shadow-slate-900/5 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email, mã tài khoản y tế, quyền hạn..."
            className="w-full h-12 bg-slate-100/80 hover:bg-slate-100 border border-transparent rounded-2xl pl-12 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43]/30 focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">
            Lọc vai trò:
          </span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-12 px-5 border border-slate-200/80 rounded-2xl text-sm font-bold bg-white text-slate-700 outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 shadow-sm transition-all w-full sm:w-auto cursor-pointer hover:border-slate-300"
          >
            <option value="">✨ Tất cả quyền hạn</option>
            {roles.map((r) => (
              <option key={r.maVaiTro} value={r.maVaiTro}>
                👑 {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📋 Cyber Glass Data Table */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/5 border-b border-slate-200/70">
                {[
                  "Mã Định Danh",
                  "Tài Khoản (Email)",
                  "Quyền Hạn Hệ Thống",
                  "Trang Thái Truy Cập",
                  "Thao Tác Bảo Mật",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider whitespace-nowrap ${i === 4 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="w-10 h-10 border-4 border-[#e62e43] border-t-transparent rounded-full animate-spin mx-auto mb-3 shadow-lg shadow-[#e62e43]/20" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Đang đồng bộ dữ liệu y tế...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <span className="material-symbols-outlined text-4xl">
                        person_search
                      </span>
                    </div>
                    <p className="text-base font-bold text-slate-700">
                      Không tìm thấy tài khoản nào
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.trangThai !== false;
                  return (
                    <tr
                      key={user.maTaiKhoan}
                      className="hover:bg-rose-50/30 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-200 group"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs font-extrabold text-[#e62e43] bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-xl shadow-sm">
                          {user.maTaiKhoan}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-xs shrink-0 group-hover:bg-[#e62e43] group-hover:text-white transition-colors">
                            {user.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {user.email}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              Xác thực: Mật khẩu mã hóa
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide ${ROLE_STYLES[user.maVaiTro] || "bg-slate-100 text-slate-600"}`}
                        >
                          <span className="material-symbols-outlined text-base">
                            verified_user
                          </span>
                          {ROLE_LABELS[user.maVaiTro] ||
                            user.tenVaiTro ||
                            user.maVaiTro}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50/80 text-emerald-700 border border-emerald-200/80 shadow-sm shadow-emerald-500/5"
                              : "bg-rose-50/80 text-[#e62e43] border border-rose-200/80 shadow-sm shadow-red-500/5"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-[#e62e43]"}`}
                          />
                          {isActive ? "Hợp lệ" : "Tạm khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={
                              isActive
                                ? "Khóa tài khoản này"
                                : "Mở khóa tài khoản"
                            }
                            className={`h-10 px-3.5 flex items-center gap-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              isActive
                                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:shadow-md hover:shadow-amber-500/10"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/10"
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">
                              {isActive ? "lock" : "lock_open"}
                            </span>
                            <span>{isActive ? "Khóa" : "Mở"}</span>
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            disabled={user.maTaiKhoan === currentUserId}
                            title="Xóa vĩnh viễn"
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-red-600 hover:border hover:border-rose-200 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:text-slate-400"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete_forever
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 Medical Cyber Modal (Add User) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-md rounded-3xl shadow-2xl border border-white/80 overflow-hidden scale-100 transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#e62e43] via-red-600 to-slate-900 px-7 py-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  <span
                    className="material-symbols-outlined text-white text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shield_person
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">
                    Cấp Quyền Tài Khoản
                  </h3>
                  <p className="text-[11px] text-rose-200 font-medium">
                    Hệ thống Y tế Nhân đạo Đà Nẵng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/25 text-white transition-colors relative z-10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreate} className="p-7 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  Email cán bộ / Bác sĩ{" "}
                  <span className="text-[#e62e43]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ví dụ: bacsi.nguyen@bvdn.vn"
                  className="w-full h-12 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  Mật khẩu khởi tạo <span className="text-[#e62e43]">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.matKhau}
                  onChange={(e) =>
                    setForm({ ...form, matKhau: e.target.value })
                  }
                  placeholder="Tối thiểu 6 ký tự bảo mật"
                  className="w-full h-12 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  Phân quyền chức danh <span className="text-[#e62e43]">*</span>
                </label>
                <select
                  required
                  value={form.maVaiTro}
                  onChange={(e) =>
                    setForm({ ...form, maVaiTro: e.target.value })
                  }
                  className="w-full h-12 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all cursor-pointer"
                >
                  <option value="">-- Chọn quyền hạn y tế --</option>
                  {roles.map((r) => (
                    <option key={r.maVaiTro} value={r.maVaiTro}>
                      👑 {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#e62e43]">
                    info
                  </span>
                  Cán bộ được cấp tài khoản sẽ nhận quyền ngay lập tức.
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-12 border border-slate-200 text-slate-600 font-extrabold text-sm rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-gradient-to-r from-[#e62e43] via-red-600 to-[#c01b30] hover:shadow-lg hover:shadow-[#e62e43]/30 text-white font-black text-sm rounded-2xl disabled:opacity-60 transition-all scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang cấp quyền...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">
                        check_circle
                      </span>
                      <span>Xác nhận cấp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
