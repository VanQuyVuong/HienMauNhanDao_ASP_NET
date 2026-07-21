import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import chungNhanService from '../../services/chungNhanService';
import { getApiError } from '../../utils/apiHelper';

export default function CapGiayChungNhan() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await chungNhanService.getCandidates();
      setCandidates(Array.isArray(list) ? list : []);
    } catch (err) {
      Swal.fire('Lỗi', getApiError(err, 'Không tải được danh sách'), 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const pending = candidates.filter((c) => c.trangThaiCap === 'pending').length;
    const issued = candidates.filter((c) => c.trangThaiCap === 'issued').length;
    const campaign = candidates[0]?.tenChienDich || '—';
    return { pending, issued, total: candidates.length, campaign };
  }, [candidates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchQ =
        !q ||
        (c.hoVaTen || '').toLowerCase().includes(q) ||
        (c.soCCCD || '').toLowerCase().includes(q);
      const matchS = !filterStatus || c.trangThaiCap === filterStatus;
      return matchQ && matchS;
    });
  }, [candidates, search, filterStatus]);

  const selectCandidate = (c) => setSelected(c);

  const handleIssue = async (maDon, name) => {
    try {
      const res = await chungNhanService.issue(maDon);
      Swal.fire('Thành công', `Đã phát hành chứng nhận cho ${name}`, 'success');
      await loadData();
      if (res) setSelected({ ...res, trangThaiCap: 'issued' });
    } catch (err) {
      Swal.fire('Lỗi', err?.response?.data?.message || 'Phát hành thất bại', 'error');
    }
  };

  const handleIssueAll = async () => {
    if (stats.pending === 0) {
      Swal.fire('Thông báo', 'Không có chứng nhận nào đang chờ', 'info');
      return;
    }
    const result = await Swal.fire({
      title: 'Phát hành tất cả?',
      text: `Phát hành ${stats.pending} chứng nhận đang chờ duyệt?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Phát hành',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      const count = await chungNhanService.issueAll();
      Swal.fire('Thành công', `Đã phát hành ${count} chứng nhận`, 'success');
      loadData();
      setSelected(null);
    } catch (err) {
      Swal.fire('Lỗi', err?.response?.data?.message || 'Thao tác thất bại', 'error');
    }
  };

  const initials = (name) =>
    (name || '?').split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cấp Giấy Chứng nhận Hiến máu</h1>
          <p className="text-sm text-slate-500 mt-1">Duyệt và phát hành giấy chứng nhận điện tử cho tình nguyện viên đủ điều kiện.</p>
        </div>
        <button
          type="button"
          onClick={handleIssueAll}
          className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
          Phát hành tất cả
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Chờ duyệt</p>
          <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Đã phát hành</p>
          <p className="text-3xl font-black text-emerald-600">{stats.issued}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tổng đủ điều kiện</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 col-span-2 lg:col-span-1">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Chiến dịch gần nhất</p>
          <p className="text-lg font-black text-red-700 truncate">{stats.campaign}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-3">
              <h2 className="font-bold text-slate-800">Danh sách đủ điều kiện cấp chứng nhận</h2>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên..."
                  className="h-9 w-44 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-9 px-3 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="issued">Đã phát hành</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {['TNV', 'Nhóm máu', 'Thể tích', 'XN', 'Trạng thái', 'Hành động'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap last:text-center">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">Đang tải...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        Chưa có tình nguyện viên đủ điều kiện (cần hiến máu và xét nghiệm âm tính)
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c.maDon}
                        onClick={() => selectCandidate(c)}
                        className={`hover:bg-red-50 cursor-pointer transition-colors ${selected?.maDon === c.maDon ? 'bg-red-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                              style={{ background: 'linear-gradient(135deg,#af101a,#d32f2f)' }}
                            >
                              {initials(c.hoVaTen)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{c.hoVaTen}</p>
                              <p className="text-[11px] text-slate-400">{c.soCCCD}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">{c.nhomMau}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{c.theTich}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-emerald-600">✓ Âm tính</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                              c.trangThaiCap === 'issued' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {c.trangThaiCap === 'issued' ? 'Đã phát hành' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (c.trangThaiCap === 'issued') {
                                navigate(`/chung-nhan/${c.maDon}`);
                              } else {
                                handleIssue(c.maDon, c.hoVaTen);
                              }
                            }}
                            className={`h-7 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 mx-auto ${
                              c.trangThaiCap === 'issued'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-red-700 hover:bg-red-800 text-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {c.trangThaiCap === 'issued' ? 'visibility' : 'send'}
                            </span>
                            {c.trangThaiCap === 'issued' ? 'Xem' : 'Phát hành'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center text-center min-h-[420px]">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-slate-400 text-3xl">workspace_premium</span>
              </div>
              <p className="font-bold text-slate-600">Chọn TNV để xem chứng nhận</p>
              <p className="text-xs text-slate-400 mt-1">Bấm vào hàng để xem trước giấy chứng nhận</p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-red-200 overflow-hidden shadow-lg bg-gradient-to-br from-[#fff8f7] via-[#fff2f0] to-[#ffdad6]">
              <div className="bg-gradient-to-r from-red-700 to-red-900 px-6 py-5 text-white text-center">
                <span className="material-symbols-outlined text-3xl mb-2" style={{ fontVariationSettings: "'FILL' 1,'wght' 700" }}>bloodtype</span>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">TRUNG TÂM HUYẾT HỌC - TRUYỀN MÁU</p>
                <h3 className="text-lg font-black uppercase tracking-tight mt-1">Thành phố Đà Nẵng</h3>
              </div>
              <div className="px-6 py-5">
                <h2 className="text-center text-xl font-black text-red-800 uppercase tracking-wide mb-1">Giấy Chứng nhận</h2>
                <p className="text-center text-sm text-slate-500 mb-5">Hiến máu tình nguyện</p>

                <div className="flex items-center gap-4 mb-5 p-4 bg-white rounded-xl border border-red-100">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0"
                    style={{ background: 'linear-gradient(135deg,#af101a,#d32f2f)' }}
                  >
                    {initials(selected.hoVaTen)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-base">{selected.hoVaTen}</p>
                    <p className="text-xs text-slate-500">CCCD: {selected.soCCCD}</p>
                    <p className="text-xs text-slate-500">Ngày sinh: {selected.ngaySinh}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-5">
                  {[
                    ['Nhóm máu', selected.nhomMau],
                    ['Thể tích hiến', selected.theTich],
                    ['Chiến dịch', selected.tenChienDich],
                    ['Ngày hiến', selected.ngayHien],
                    ['Mã chứng nhận', selected.maChungNhan || `GCN-DN-${selected.maDon}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-red-100">
                      <span className="text-slate-500">{label}</span>
                      <span className={`font-bold ${label === 'Mã chứng nhận' ? 'font-mono text-red-700' : ''}`}>{val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-5">
                  <span className="material-symbols-outlined text-emerald-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-700">Kết quả xét nghiệm: ÂM TÍNH</p>
                    <p className="text-[10px] text-emerald-600">HIV · Viêm gan B · Viêm gan C · Giang mai</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/chung-nhan/${selected.maDon}`)}
                    className="flex-1 h-10 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                    Xem chứng nhận
                  </button>
                  {selected.trangThaiCap !== 'issued' ? (
                    <button
                      type="button"
                      onClick={() => handleIssue(selected.maDon, selected.hoVaTen)}
                      className="flex-1 h-10 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      Phát hành chính thức
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 h-10 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 opacity-70 cursor-default"
                    >
                      ✓ Đã phát hành
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
