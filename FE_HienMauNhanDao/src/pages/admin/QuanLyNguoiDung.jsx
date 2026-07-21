import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';
import userService from '../../services/userService';
import { getApiError } from '../../utils/apiHelper';

const PRIMARY_COLOR = '#af101a';

const ROLE_COLORS = {
  AD: 'bg-red-100 text-red-700',
  BS: 'bg-emerald-100 text-emerald-700',
  NVYT: 'bg-cyan-100 text-cyan-700',
  QLK: 'bg-amber-100 text-amber-700',
  TNV: 'bg-slate-100 text-slate-700',
};

const ROLE_LABELS = {
  AD: 'Quản trị viên',
  BS: 'Bác sĩ',
  NVYT: 'Nhân viên Y tế',
  QLK: 'Quản lý kho',
  TNV: 'Tình nguyện viên',
};

const emptyForm = { email: '', matKhau: '', maVaiTro: '' };

export default function QuanLyNguoiDung() {
  const { searchQuery: headerSearch = '' } = useOutletContext() || {};
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = localStorage.getItem('userId');

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
      Swal.fire('Lỗi', getApiError(err, 'Không thể tải danh sách người dùng'), 'error');
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
        (u.email || '').toLowerCase().includes(q) ||
        (u.maTaiKhoan || '').toLowerCase().includes(q) ||
        (u.tenVaiTro || '').toLowerCase().includes(q);
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
      Swal.fire('Thiếu thông tin', 'Vui lòng điền đầy đủ email, mật khẩu và vai trò', 'warning');
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
      Swal.fire('Thành công', 'Đã thêm người dùng mới', 'success');
      setShowModal(false);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      Swal.fire('Lỗi', err?.response?.data?.message || err.message || 'Không thể tạo tài khoản', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isActive = user.trangThai !== false;
    const action = isActive ? 'vô hiệu hóa' : 'kích hoạt';
    const result = await Swal.fire({
      title: `${isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản?`,
      html: `Bạn có chắc muốn ${action} tài khoản <b>${user.email}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isActive ? '#dc2626' : PRIMARY_COLOR,
      cancelButtonColor: '#94a3b8',
      confirmButtonText: isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;

    try {
      await userService.setTrangThai(user.maTaiKhoan, !isActive);
      Swal.fire('Thành công', `Đã ${action} tài khoản`, 'success');
      loadData();
    } catch (err) {
      Swal.fire('Lỗi', err?.response?.data?.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleDelete = async (user) => {
    if (user.maTaiKhoan === currentUserId) {
      Swal.fire('Không được phép', 'Bạn không thể xóa tài khoản đang đăng nhập', 'warning');
      return;
    }
    const result = await Swal.fire({
      title: 'Xóa tài khoản?',
      html: `Hành động này không thể hoàn tác.<br/>Xóa tài khoản <b>${user.email}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;

    try {
      await userService.delete(user.maTaiKhoan);
      Swal.fire('Đã xóa', 'Tài khoản đã được xóa khỏi hệ thống', 'success');
      loadData();
    } catch (err) {
      Swal.fire('Lỗi', err?.response?.data?.message || 'Không thể xóa tài khoản', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý người dùng</h1>
          <p className="text-slate-500 mt-1 text-sm">Thêm, vô hiệu hóa và xóa tài khoản trong hệ thống</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 h-11 px-6 bg-primary text-white font-bold rounded-xl hover:bg-red-800 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Thêm người dùng
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Tổng tài khoản</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Đang hoạt động</p>
          <p className="text-3xl font-black text-primary">{stats.active}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Đã vô hiệu hóa</p>
          <p className="text-3xl font-black text-red-600">{stats.inactive}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email, mã tài khoản..."
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          <option value="">Tất cả vai trò</option>
          {roles.map((r) => (
            <option key={r.maVaiTro} value={r.maVaiTro}>
              {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Mã TK', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-5xl block mb-2">group_off</span>
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.trangThai !== false;
                  return (
                    <tr key={user.maTaiKhoan} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-primary bg-red-50 px-2 py-1 rounded-lg">
                          {user.maTaiKhoan}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[user.maVaiTro] || 'bg-slate-100 text-slate-600'}`}>
                          {ROLE_LABELS[user.maVaiTro] || user.tenVaiTro || user.maVaiTro}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {isActive ? 'Hoạt động' : 'Vô hiệu'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {isActive ? 'block' : 'check_circle'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={user.maTaiKhoan === currentUserId}
                            title="Xóa tài khoản"
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-red-900 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person_add
                </span>
                <h3 className="font-black text-white text-lg">Thêm người dùng</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@email.com"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Mật khẩu *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.matKhau}
                  onChange={(e) => setForm({ ...form, matKhau: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Vai trò *</label>
                <select
                  required
                  value={form.maVaiTro}
                  onChange={(e) => setForm({ ...form, maVaiTro: e.target.value })}
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map((r) => (
                    <option key={r.maVaiTro} value={r.maVaiTro}>
                      {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-primary hover:bg-red-800 text-white font-bold rounded-xl disabled:opacity-60 transition-colors"
                >
                  {submitting ? 'Đang lưu...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
