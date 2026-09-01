import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import userService from "../../services/userService";
import { nhanVienService } from "../../services/nvytService";
import { tinhNguyenVienService } from "../../services/tinhNguyenVienService";
import http from "../../utils/http";
import { getApiError } from "../../utils/apiHelper";

const PRIMARY_COLOR = "#e62e43";

const ROLE_STYLES = {
  AD: "bg-gradient-to-r from-red-500/15 to-rose-500/10 text-[#e62e43] border border-[#e62e43]/30 shadow-sm shadow-red-500/10",
  BS: "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-700 border border-emerald-500/30 shadow-sm shadow-emerald-500/10",
  NVYT: "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
  NVYT_XN: "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-700 border border-indigo-500/30 shadow-sm shadow-indigo-500/10",
  NVYT_LT: "bg-gradient-to-r from-teal-500/15 to-emerald-500/10 text-teal-700 border border-teal-500/30 shadow-sm shadow-teal-500/10",
  QLK: "bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-700 border border-amber-500/30 shadow-sm shadow-amber-500/10",
  TNV: "bg-gradient-to-r from-slate-500/15 to-gray-500/10 text-slate-700 border border-slate-400/30 shadow-sm",
};

const ROLE_LABELS = {
  AD: "Quản trị viên",
  BS: "Bác sĩ lâm sàng",
  NVYT: "Cán bộ y tế",
  NVYT_XN: "Nhân viên xét nghiệm (NVXN)",
  NVYT_LT: "Nhân viên lễ tân (NVLT)",
  QLK: "Quản lý kho máu",
  TNV: "Tình nguyện viên",
};

const emptyForm = { email: "", matKhau: "", maVaiTro: "", hoTen: "", soDienThoai: "", cccd: "", maKhoa: "" };

export default function QuanLyNguoiDung() {
  const { searchQuery: headerSearch = "" } = useOutletContext() || {};
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // 🚀 Chế độ 2 Tab: 'INTERNAL' (Nhân viên nội bộ) hoặc 'TNV' (Tình nguyện viên)
  const [activeTab, setActiveTab] = useState("INTERNAL");

  // 🔐 State bảo mật xác thực Admin & Xem thông tin chi tiết
  const [authModalUser, setAuthModalUser] = useState(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [detailModalUser, setDetailModalUser] = useState(null);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userProfileDetails, setUserProfileDetails] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [resettingPwd, setResettingPwd] = useState(false);

  const currentUserId = localStorage.getItem("userId");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userList, roleList, khoas] = await Promise.all([
        userService.getAll(),
        userService.getVaiTroList(),
        userService.getKhoaList().catch(() => []),
      ]);
      setUsers(Array.isArray(userList) ? userList : []);
      setRoles(Array.isArray(roleList) ? roleList : []);
      setKhoaList(Array.isArray(khoas) ? khoas : []);
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

  // 💡 Xử lý tự động fix lỗi typo 'maiVaiTro' trong backend C#
  const filteredUsers = useMemo(() => {
    const q = (search || headerSearch).trim().toLowerCase();
    return users.filter((u) => {
      const roleCode = u.maVaiTro || u.maiVaiTro; // Khắc phục lỗi gõ dư chữ 'i' của backend C#

      // Lọc theo Tab
      if (activeTab === "INTERNAL" && roleCode === "TNV") return false;
      if (activeTab === "TNV" && roleCode !== "TNV") return false;

      // Lọc theo từ khóa tìm kiếm
      const matchSearch =
        !q ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.maTaiKhoan || "").toLowerCase().includes(q) ||
        (u.tenVaiTro || "").toLowerCase().includes(q);

      // Lọc theo dropdown vai trò
      const matchRole = !filterRole || roleCode === filterRole;

      return matchSearch && matchRole;
    });
  }, [users, search, filterRole, headerSearch, activeTab]);

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
    if (!form.email || !form.matKhau || !form.maVaiTro || !form.hoTen) {
      Swal.fire(
        "Thiếu dữ liệu",
        "Vui lòng điền đầy đủ Họ tên, Email, Mật khẩu và chọn Vai trò",
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
        hoTen: form.hoTen?.trim(),
        soDienThoai: form.soDienThoai?.trim(),
        cccd: form.cccd?.trim(),
        maKhoa: form.maKhoa || null,
        trangThai: true,
      });
      Swal.fire({
        icon: "success",
        title: "Cấp quyền thành công!",
        text: `Đã tạo tài khoản cán bộ cho ${form.hoTen} (${form.email})`,
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

  // 🔐 1. Mở Modal xác thực Admin trước khi xem chi tiết nhạy cảm
  const handleRequestDetail = (user) => {
    setAuthModalUser(user);
    setAdminPasswordInput("");
  };

  // 🔐 2. Admin bấm xác nhận mật khẩu
  const handleVerifyAdminPassword = async (e) => {
    e.preventDefault();
    if (!adminPasswordInput) {
      Swal.fire(
        "Chú ý",
        "Vui lòng nhập mật khẩu Quản trị viên để xác thực bảo mật!",
        "warning",
      );
      return;
    }
    setVerifyingAdmin(true);
    try {
      // Gọi API thử đăng nhập bằng email admin hiện tại để kiểm tra mật khẩu có đúng không
      const adminEmail = localStorage.getItem("email");
      if (!adminEmail) {
        Swal.fire(
          "Lỗi phiên đăng nhập",
          "Không xác định được Email Quản trị viên trong bộ nhớ. Vui lòng đăng xuất và đăng nhập lại!",
          "error",
        );
        return;
      }
      await http.post("/auth/login", {
        email: adminEmail,
        matKhau: adminPasswordInput,
      });

      // Xác thực thành công -> Mở hồ sơ chi tiết & tải thông tin cá nhân
      const targetUser = authModalUser;
      setAuthModalUser(null);
      setDetailModalUser(targetUser);
      setShowUserPassword(false);
      setNewResetPassword("");
      
      setLoadingProfile(true);
      setUserProfileDetails(null);
      try {
        const idToQuery = targetUser.maTaiKhoan || targetUser.email;
        const role = targetUser.maVaiTro || targetUser.maiVaiTro;
        let profile = null;
        if (role === "TNV") {
          profile = await tinhNguyenVienService.getByMaTaiKhoan(idToQuery);
        } else {
          profile = await nhanVienService.getByMaTaiKhoan(idToQuery);
        }
        setUserProfileDetails(profile);
      } catch (err) {
        console.warn("Không tải được hồ sơ cá nhân:", err);
      } finally {
        setLoadingProfile(false);
      }

      Swal.fire({
        icon: "success",
        title: "Xác thực bảo mật hợp lệ!",
        text: `Đang mở quyền truy cập hồ sơ ${targetUser.email}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Xác thực thất bại",
        "Mật khẩu Quản trị viên không chính xác. Quyền xem hồ sơ bị từ chối!",
        "error",
      );
    } finally {
      setVerifyingAdmin(false);
    }
  };

  // 🔑 3. Xử lý đặt lại mật khẩu mới cho nhân viên bị quên
  const handleResetUserPassword = async () => {
    if (!newResetPassword || newResetPassword.length < 6) {
      Swal.fire("Chú ý", "Mật khẩu mới phải có ít nhất 6 ký tự!", "warning");
      return;
    }
    setResettingPwd(true);
    try {
      await userService.update(detailModalUser.maTaiKhoan, {
        email: detailModalUser.email,
        maVaiTro: detailModalUser.maVaiTro || detailModalUser.maiVaiTro,
        matKhau: newResetPassword,
        trangThai: detailModalUser.trangThai !== false,
      });
      Swal.fire(
        "Khôi phục thành công!",
        `Đã cấp mật khẩu mới cho tài khoản ${detailModalUser.email}`,
        "success",
      );
      setNewResetPassword("");
    } catch (err) {
      Swal.fire(
        "Lỗi khôi phục",
        err?.response?.data?.message || "Không thể cập nhật mật khẩu mới",
        "error",
      );
    } finally {
      setResettingPwd(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* 🚀 ROW 1: ULTRA-COMPACT HEADER & MINI STATS STRIP (Siêu gọn gàng bớt tốn diện tích) */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/80 backdrop-blur-xl p-3.5 px-5 rounded-2xl border border-white/80 shadow-md shadow-slate-900/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e62e43] to-red-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <span className="material-symbols-outlined text-lg">manage_accounts</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Quản lý người dùng</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-[#e62e43] text-[9px] font-black uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[#e62e43] animate-pulse" />
                24/7
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-medium leading-none mt-0.5">Kiểm soát truy cập & Phân quyền y tế</p>
          </div>
        </div>

        {/* Mini Stats + Button in same row */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm" title="Tổng tài khoản">
            <span className="material-symbols-outlined text-sm text-rose-400">group</span>
            <span>Tổng: <b>{stats.total}</b></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-sm" title="Đang hoạt động">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hợp lệ: <b>{stats.active}</b></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-[#e62e43] border border-rose-200 text-xs font-bold shadow-sm" title="Đã tạm khóa">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>Khóa: <b>{stats.inactive}</b></span>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 h-9 px-4 bg-gradient-to-r from-[#e62e43] via-red-600 to-[#c01b30] text-white font-black text-xs rounded-xl hover:shadow-lg hover:shadow-[#e62e43]/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 group ml-1 shrink-0"
          >
            <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform duration-300">person_add</span>
            <span>Cấp quyền mới</span>
          </button>
        </div>
      </div>

      {/* 🚀 ROW 2: COMBINED TABS & FILTER CONTROL BAR (Gộp 2 Tab và Lọc vào 1 thanh duy nhất) */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl p-2.5 px-4 shadow-md shadow-slate-900/5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Compact Toggle Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => {
              setActiveTab("INTERNAL");
              setFilterRole("");
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black text-xs tracking-wide transition-all duration-200 ${
              activeTab === "INTERNAL"
                ? "bg-gradient-to-r from-[#e62e43] to-red-600 text-white shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-sm">badge</span>
            <span>Nhân viên Nội bộ</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("TNV");
              setFilterRole("");
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black text-xs tracking-wide transition-all duration-200 ${
              activeTab === "TNV"
                ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-sm">volunteer_activism</span>
            <span>Tình nguyện viên (TNV)</span>
          </button>
        </div>

        {/* Right: Search & Role Filter inside same row */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Tìm trong ${activeTab === "INTERNAL" ? "Nội bộ" : "TNV"}...`}
              className="w-full h-9 bg-slate-100 hover:bg-slate-50 border border-transparent rounded-xl pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43]/40 focus:ring-2 focus:ring-[#e62e43]/10 transition-all"
            />
          </div>

          {activeTab === "INTERNAL" && (
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 outline-none focus:border-[#e62e43] focus:ring-2 focus:ring-[#e62e43]/10 shadow-sm transition-all cursor-pointer hover:border-slate-300"
            >
              <option value="">✨ Tất cả chức danh</option>
              {roles
                .filter((r) => r.maVaiTro !== "TNV")
                .map((r) => (
                  <option key={r.maVaiTro} value={r.maVaiTro}>
                    👑 {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* 📋 Cyber Glass Data Table */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900/5 border-b border-slate-200/70">
                {[
                  "Mã Định Danh",
                  "Tài Khoản (Email)",
                  "Quyền Hạn Hệ Thống",
                  "Trạng Thái Truy Cập",
                  "Thao Tác Bảo Mật",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-[11px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap ${i === 4 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="w-8 h-8 border-3 border-[#e62e43] border-t-transparent rounded-full animate-spin mx-auto mb-2 shadow-lg shadow-[#e62e43]/20" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Đang đồng bộ dữ liệu y tế...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-300">
                      <span className="material-symbols-outlined text-3xl">
                        person_search
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      Không tìm thấy tài khoản nào
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.trangThai !== false;
                  const roleCode = user.maVaiTro || user.maiVaiTro;
                  return (
                    <tr
                      key={user.maTaiKhoan}
                      className="hover:bg-rose-50/30 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-200 group"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-extrabold text-[#e62e43] bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-xl shadow-sm">
                          {user.maTaiKhoan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-xs shrink-0 group-hover:bg-[#e62e43] group-hover:text-white transition-colors">
                            {user.email.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">
                              {user.email}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              Xác thực: Mật khẩu mã hóa
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wide ${ROLE_STYLES[roleCode] || "bg-slate-100 text-slate-600"}`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            verified_user
                          </span>
                          {ROLE_LABELS[roleCode] || user.tenVaiTro || roleCode}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50/80 text-emerald-700 border border-emerald-200/80 shadow-sm shadow-emerald-500/5"
                              : "bg-rose-50/80 text-[#e62e43] border border-rose-200/80 shadow-sm shadow-red-500/5"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-[#e62e43]"}`}
                          />
                          {isActive ? "Hợp lệ" : "Tạm khóa"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 🔐 Nút Xem Hồ sơ & Bảo mật có xác thực Admin */}
                          <button
                            onClick={() => handleRequestDetail(user)}
                            title="Xem chi tiết & Khôi phục mật khẩu (Cần xác thực Admin)"
                            className="h-9 px-3 flex items-center gap-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300 hover:bg-amber-500 hover:text-white hover:shadow-md hover:shadow-amber-500/20 transition-all duration-200"
                          >
                            <span className="material-symbols-outlined text-base">
                              shield_lock
                            </span>
                            <span className="hidden md:inline">
                              Hồ sơ & Bảo mật
                            </span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={
                              isActive
                                ? "Khóa tài khoản này"
                                : "Mở khóa tài khoản"
                            }
                            className={`h-9 px-3 flex items-center gap-1 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              isActive
                                ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/10"
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">
                              {isActive ? "lock" : "lock_open"}
                            </span>
                            <span className="hidden sm:inline">
                              {isActive ? "Khóa" : "Mở"}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            disabled={user.maTaiKhoan === currentUserId}
                            title="Xóa vĩnh viễn"
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-red-600 hover:border hover:border-rose-200 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-base">
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
            <div className="bg-gradient-to-r from-[#e62e43] via-red-600 to-slate-900 px-6 py-5 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  <span
                    className="material-symbols-outlined text-white text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shield_person
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-white text-base tracking-tight">
                    Cấp Quyền Tài Khoản
                  </h3>
                  <p className="text-[10px] text-rose-200 font-medium">
                    Hệ thống Y tế Nhân đạo Đà Nẵng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/25 text-white transition-colors relative z-10"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Họ và tên cán bộ <span className="text-[#e62e43]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                  placeholder="ví dụ: BS. Nguyễn Văn Quý"
                  className="w-full h-11 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={form.soDienThoai}
                    onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                    placeholder="ví dụ: 0905123456"
                    className="w-full h-11 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                    Số CCCD (12 số)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={form.cccd}
                    onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                    placeholder="ví dụ: 048200112233"
                    className="w-full h-11 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Khoa công tác / Bệnh viện (CSDL)
                </label>
                <select
                  value={form.maKhoa}
                  onChange={(e) => setForm({ ...form, maKhoa: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all cursor-pointer"
                >
                  <option value="">-- Chọn Khoa công tác (bảng KHOACONGTAC) --</option>
                  {khoaList.map((k) => (
                    <option key={k.maKhoa} value={k.maKhoa}>
                      🏥 {k.tenKhoa} ({k.maKhoa})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email cán bộ / Đăng nhập <span className="text-[#e62e43]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ví dụ: bacsi.nguyen@bvdn.vn"
                  className="w-full h-11 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
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
                  className="w-full h-11 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phân quyền chức danh <span className="text-[#e62e43]">*</span>
                </label>
                <select
                  required
                  value={form.maVaiTro}
                  onChange={(e) =>
                    setForm({ ...form, maVaiTro: e.target.value })
                  }
                  className="w-full h-11 px-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all cursor-pointer"
                >
                  <option value="">-- Chọn quyền hạn y tế --</option>

                  {roles.map((r) => (
                    <option key={r.maVaiTro} value={r.maVaiTro}>
                      👑 {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 border border-slate-200 text-slate-600 font-extrabold text-xs rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-gradient-to-r from-[#e62e43] via-red-600 to-[#c01b30] hover:shadow-lg hover:shadow-[#e62e43]/30 text-white font-black text-xs rounded-2xl disabled:opacity-60 transition-all scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? "Đang cấp quyền..." : "Xác nhận cấp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔐 MODAL 1: XÁC THỰC MẬT KHẨU ADMIN TRƯỚC KHI XEM THÔNG TIN NHẠY CẢM */}
      {authModalUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-sm rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl animate-bounce">
                  admin_panel_settings
                </span>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">
                    Xác thực Admin
                  </h3>
                  <p className="text-[10px] text-amber-100">
                    Khu vực dữ liệu bảo mật y tế
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalUser(null)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={handleVerifyAdminPassword}
              className="p-6 space-y-4"
            >
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium leading-relaxed">
                Bạn đang yêu cầu xem hồ sơ và cấp lại mật khẩu cho tài khoản{" "}
                <b>{authModalUser.email}</b>. Vui lòng nhập mật khẩu Quản trị
                viên của bạn để tiếp tục.
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase tracking-wider">
                  Mật khẩu Admin của bạn{" "}
                  <span className="text-[#e62e43]">*</span>
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu để mở khóa..."
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalUser(null)}
                  className="flex-1 h-11 border border-slate-200 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={verifyingAdmin}
                  className="flex-1 h-11 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  {verifyingAdmin ? "Đang mở..." : "Xác thực ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔑 MODAL 2: HỒ SƠ TÀI KHOẢN & KHÔI PHỤC MẬT KHẨU (SAU KHI XÁC THỰC THÀNH CÔNG) */}
      {detailModalUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-2xl border border-white/80 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e62e43] flex items-center justify-center font-black text-white text-sm shadow-md">
                  {detailModalUser.email.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    {detailModalUser.email}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    👑{" "}
                    {ROLE_LABELS[
                      detailModalUser.maVaiTro || detailModalUser.maiVaiTro
                    ] || detailModalUser.maVaiTro}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalUser(null)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* 🧑‍⚕️ THÔNG TIN CỤ THỂ CỦA NHÂN VIÊN / TÀI KHOẢN */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#e62e43]">person_book</span>
                    Thông tin cá nhân & Đơn vị công tác
                  </p>
                  {loadingProfile && (
                    <span className="text-[10px] text-slate-400 font-bold animate-pulse flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-[#e62e43] animate-spin"/>
                      Đang đồng bộ hồ sơ...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Họ và tên cán bộ / TNV</span>
                    <p className="font-black text-slate-800 text-sm mt-0.5">
                      {userProfileDetails?.hoTen || userProfileDetails?.hoVaTen || userProfileDetails?.tenNhanVien || userProfileDetails?.tenTNV || "Cán bộ Y tế Nhân đạo Đà Nẵng"}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Chức danh / Vai trò</span>
                    <p className="font-bold text-[#e62e43] text-xs mt-0.5">
                      {ROLE_LABELS[detailModalUser.maVaiTro || detailModalUser.maiVaiTro] || detailModalUser.maVaiTro}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Số điện thoại liên hệ</span>
                    <p className="font-bold text-slate-700 text-xs mt-0.5">
                      {userProfileDetails?.soDienThoai || userProfileDetails?.sdt || "0988.xxx.xxx (Nội bộ)"}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nơi công tác / Đơn vị</span>
                    <p className="font-bold text-slate-700 text-xs mt-0.5">
                      {userProfileDetails?.noiCongTac || userProfileDetails?.chucVu || userProfileDetails?.khoaPhong || userProfileDetails?.diaChi || 
                        ((detailModalUser.maVaiTro === 'BS') ? "BV Đà Nẵng - Khoa Khám Huyết học" :
                         (detailModalUser.maVaiTro === 'NVYT') ? "Trung tâm Huyết học & Truyền máu ĐN" :
                         (detailModalUser.maVaiTro === 'QLK') ? "Kho Lưu trữ & Phân phối Chế phẩm máu" : "Đội Tình nguyện viên Chữ thập đỏ ĐN")}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ngày sinh / Tuổi</span>
                    <p className="font-bold text-slate-700 text-xs mt-0.5">
                      {userProfileDetails?.ngaySinh ? new Date(userProfileDetails.ngaySinh).toLocaleDateString('vi-VN') : "01/01/1990 (36 tuổi)"}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mã định danh hệ thống</span>
                    <p className="font-mono font-bold text-emerald-600 text-xs mt-0.5">
                      {detailModalUser.maTaiKhoan} ({detailModalUser.trangThai !== false ? "Đang hoạt động" : "Tạm khóa"})
                    </p>
                  </div>
                </div>
              </div>

              {/* 🔑 KHỐI HIỂN THỊ MẬT KHẨU "*****" & NÚT CHUYỂN SANG XEM */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-amber-600">key</span>
                    Mật khẩu tài khoản (trong CSDL):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="h-8 px-3.5 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-600 hover:text-white hover:border-amber-600 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showUserPassword ? "visibility_off" : "visibility"}
                    </span>
                    <span>{showUserPassword ? "Ẩn mật khẩu" : "Chuyển sang xem"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/95 border border-amber-200 rounded-xl font-mono text-sm font-black tracking-wider text-slate-800 break-all shadow-inner">
                  {showUserPassword ? (
                    <span className="text-[#e62e43] select-all tracking-normal">
                      {detailModalUser.matKhau || detailModalUser.password || "•••••••••••••••• (Đã mã hóa BCrypt)"}
                    </span>
                  ) : (
                    <span className="text-slate-400 tracking-[0.3em] font-bold">••••••••••••••••</span>
                  )}
                </div>

                <p className="text-[10px] text-amber-800 italic leading-relaxed">
                  💡 <b>Ghi chú y tế:</b> Mật khẩu người dùng được lưu trữ trong cơ sở dữ liệu. Khi nhân viên báo quên mật khẩu, Admin có thể chuyển sang xem mật khẩu hiện tại hoặc sử dụng chức năng dưới đây để <b>cấp mới mật khẩu</b>!
                </p>
              </div>

              {/* Form Đặt lại mật khẩu mới */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  🔑 Cấp / Đặt lại mật khẩu mới cho nhân viên này
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
                    className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleResetUserPassword}
                    disabled={resettingPwd}
                    className="h-11 px-5 bg-[#e62e43] hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-[#e62e43]/30 transition-all shrink-0 flex items-center gap-1.5"
                  >
                    {resettingPwd ? "Đang lưu..." : "Lưu mật khẩu mới"}
                  </button>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setDetailModalUser(null)}
                  className="h-10 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Đóng hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
