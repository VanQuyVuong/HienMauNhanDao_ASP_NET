import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { tnvNvytService } from '../../services/nvytService';

const PAGE_SIZE = 10;

export default function TinhNguyenVien() {
  const { searchQuery } = useOutletContext();
  const [tnvList, setTnvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tnvNvytService.getAll(page, PAGE_SIZE, keyword);
      const content = Array.isArray(res) ? res : (res.content || []);
      setTnvList(content);
      setTotalPages(res.totalPages || 1);
    } catch { showToast('Lỗi khi tải danh sách', 'error'); }
    finally { setLoading(false); }
  }, [page, keyword]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = () => { setKeyword(searchInput); setPage(0); };

  const handleUpdate = async (maTNV, data) => {
    try {
      await tnvNvytService.update(maTNV, data);
      showToast('Cập nhật tình nguyện viên thành công');
      setEditModal(null); loadData();
    } catch (e) { showToast(e.message || 'Lỗi khi cập nhật', 'error'); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-2
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          <span className="material-symbols-outlined text-lg">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tình nguyện viên</h1>
          <p className="text-slate-500 mt-1 text-sm">Danh sách tình nguyện viên đã đăng ký trong hệ thống</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo tên, CCCD, số điện thoại..."
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <button onClick={handleSearch}
          className="h-11 px-6 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors">
          Tìm kiếm
        </button>
        {keyword && (
          <button onClick={() => { setKeyword(''); setSearchInput(''); setPage(0); }}
            className="h-11 px-4 border border-slate-200 text-slate-500 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            Xóa lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Mã TNV', 'Họ và tên', 'Số CCCD', 'Ngày sinh', 'Giới tính', 'Số điện thoại', 'Số lần hiến', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-sm">Đang tải...</span>
                </td></tr>
              ) : tnvList.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-5xl block mb-2">group</span>
                  Không có tình nguyện viên nào
                </td></tr>
              ) : tnvList.map(tnv => (
                <tr key={tnv.maTNV} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-primary bg-red-50 px-2 py-1 rounded-lg">{tnv.maTNV}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0">
                        {(tnv.hoVaTen || '?').split(' ').slice(-1)[0]?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{tnv.hoVaTen}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{tnv.soCCCD || '---'}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {tnv.ngaySinh ? new Date(tnv.ngaySinh).toLocaleDateString('vi-VN') : '---'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full
                      ${tnv.gioiTinh === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {tnv.gioiTinh || '---'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{tnv.soDienThoai || '---'}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-red-50 text-primary text-xs font-bold rounded-full">{tnv.soLanHienMau ?? 0} lần</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setEditModal(tnv)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center"
                      title="Xem & sửa">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">Trang {page + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors
                    ${i === page ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && <EditTnvModal tnv={editModal} onClose={() => setEditModal(null)} onSave={handleUpdate} />}
    </div>
  );
}

function EditTnvModal({ tnv, onClose, onSave }) {
  const [form, setForm] = useState({
    hoVaTen: tnv.hoVaTen || '',
    ngaySinh: tnv.ngaySinh ? tnv.ngaySinh.substring(0, 10) : '',
    gioiTinh: tnv.gioiTinh || 'Nam',
    soDienThoai: tnv.soDienThoai || '',
    diaChi: tnv.diaChi || '',
    nhomMau: tnv.nhomMau || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave(tnv.maTNV, form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_edit</span>
            <h3 className="font-bold text-slate-800">Cập nhật tình nguyện viên</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-500 text-xl">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Mã TNV: <span className="font-mono font-bold text-primary">{tnv.maTNV}</span></p>
            <p className="text-xs text-slate-500 mt-0.5">CCCD: <span className="font-mono font-bold text-slate-700">{tnv.soCCCD}</span></p>
          </div>
          {[
            { label: 'Họ và tên', key: 'hoVaTen', type: 'text' },
            { label: 'Ngày sinh', key: 'ngaySinh', type: 'date' },
            { label: 'Số điện thoại', key: 'soDienThoai', type: 'tel' },
            { label: 'Địa chỉ', key: 'diaChi', type: 'text' },
            { label: 'Nhóm máu', key: 'nhomMau', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-semibold text-slate-700 block mb-1">{f.label}</label>
              <input type={f.type} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Giới tính</label>
            <select value={form.gioiTinh} onChange={e => setForm(p => ({ ...p, gioiTinh: e.target.value }))}
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary bg-white">
              <option>Nam</option><option>Nữ</option><option>Khác</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 h-11 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-red-800 transition-colors shadow-sm disabled:opacity-60">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
