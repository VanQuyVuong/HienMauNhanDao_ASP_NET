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
  const [selected, setSelected] = useState(null);

  // Tab chính: 'pending' (Chờ duyệt & Cấp mới) | 'issued' (Lịch sử chứng nhận đã phát hành)
  const [mainTab, setMainTab] = useState('pending');

  // Tab phụ trong Lịch sử: 'ChienDich' | 'ThuongXuyen' | 'CoDinh'
  const [subTab, setSubTab] = useState('ChienDich');

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

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const pendingList = candidates.filter((c) => c.trangThaiCap === 'pending');
    const issuedList = candidates.filter((c) => c.trangThaiCap === 'issued');

    const countChienDich = issuedList.filter((c) => c.loaiHienMau === 'ChienDich').length;
    const countThuongXuyen = issuedList.filter((c) => c.loaiHienMau === 'ThuongXuyen').length;
    const countCoDinh = issuedList.filter((c) => c.loaiHienMau === 'CoDinh').length;

    return {
      pending: pendingList.length,
      issued: issuedList.length,
      total: candidates.length,
      chienDich: countChienDich,
      thuongXuyen: countThuongXuyen,
      coDinh: countCoDinh,
    };
  }, [candidates]);

  // Lọc danh sách theo Tab chính, Sub tab và Ô tìm kiếm
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();

    return candidates.filter((c) => {
      // Tìm kiếm theo tên hoặc CCCD
      const matchQ =
        !q ||
        (c.hoVaTen || '').toLowerCase().includes(q) ||
        (c.soCCCD || '').toLowerCase().includes(q) ||
        (c.maChungNhan || '').toLowerCase().includes(q) ||
        (c.tenChienDich || '').toLowerCase().includes(q);

      // Lọc theo Tab chính
      if (mainTab === 'pending') {
        return matchQ && c.trangThaiCap === 'pending';
      }

      // Tab chính 'issued' -> Lọc theo Sub Tab
      const matchIssued = c.trangThaiCap === 'issued';
      const matchSub = !subTab || (c.loaiHienMau || 'ChienDich') === subTab;

      return matchQ && matchIssued && matchSub;
    });
  }, [candidates, search, mainTab, subTab]);

  const selectCandidate = (c) => setSelected(c);

  const handleIssue = async (maDon, name) => {
    try {
      const res = await chungNhanService.issue(maDon);
      Swal.fire('Thành công', `Đã phát hành giấy chứng nhận cho ${name}`, 'success');
      await loadData();
      if (res) setSelected({ ...res, trangThaiCap: 'issued' });
    } catch (err) {
      Swal.fire('Lỗi', err?.response?.data?.message || 'Phát hành thất bại', 'error');
    }
  };

  const handleIssueAll = async () => {
    if (stats.pending === 0) {
      Swal.fire('Thông báo', 'Không có chứng nhận nào đang chờ cấp', 'info');
      return;
    }
    const result = await Swal.fire({
      title: 'Phát hành tất cả?',
      text: `Phát hành ${stats.pending} chứng nhận điện tử đang chờ duyệt?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Phát hành ngay',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      const count = await chungNhanService.issueAll();
      Swal.fire('Thành công', `Đã phát hành ${count} giấy chứng nhận`, 'success');
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-rose-300 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <h1 className="text-2xl font-black tracking-tight">Quản Lý & Cấp Giấy Chứng Nhận Hiến Máu</h1>
          </div>
          <p className="text-xs text-rose-100/80 font-medium mt-1">
            Duyệt phát hành & Lưu trữ hồ sơ giấy chứng nhận điện tử chuẩn Bộ Y tế cho Tình nguyện viên Đà Nẵng.
          </p>
        </div>

        {mainTab === 'pending' && (
          <button
            type="button"
            onClick={handleIssueAll}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-lg">done_all</span>
            Phát Hành Tất Cả ({stats.pending})
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setMainTab('pending')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            mainTab === 'pending' 
              ? 'bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-400/20' 
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            Chờ Duyệt Cấp Mới
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">Đơn chờ</span>
          </div>
        </div>

        <div 
          onClick={() => setMainTab('issued')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            mainTab === 'issued' 
              ? 'bg-emerald-50 border-emerald-300 shadow-md ring-2 ring-emerald-400/20' 
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">verified</span>
            Đã Phát Hành
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-emerald-600">{stats.issued}</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">Chứng nhận</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Theo Chiến Dịch</p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-800">{stats.chienDich}</p>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">Hồ sơ</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thường Xuyên & Cố Định</p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-rose-700">{stats.thuongXuyen + stats.coDinh}</p>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">Hồ sơ</span>
          </div>
        </div>
      </div>

      {/* SYSTEM MAIN TABS NAVIGATION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMainTab('pending')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'pending'
                ? 'bg-rose-700 text-white shadow-md shadow-rose-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">pending_actions</span>
            <span>📋 Chờ Duyệt & Cấp Mới</span>
            <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
              mainTab === 'pending' ? 'bg-white text-rose-700 font-bold' : 'bg-slate-200 text-slate-700'
            }`}>
              {stats.pending}
            </span>
          </button>

          <button
            onClick={() => setMainTab('issued')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'issued'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">history_edu</span>
            <span>📜 Lịch Sử Chứng Nhận Đã Phát Hành</span>
            <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
              mainTab === 'issued' ? 'bg-white text-emerald-700 font-bold' : 'bg-slate-200 text-slate-700'
            }`}>
              {stats.issued}
            </span>
          </button>
        </div>

        {/* Ô TÌM KIẾM DÙNG CHUNG */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, CCCD, Mã GCN..."
            className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500 bg-slate-50"
          />
        </div>
      </div>

      {/* NESTED SUB-TABS TRONG TAB LỊCH SỬ CHỨNG NHẬN */}
      {mainTab === 'issued' && (
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200/80 w-fit">
          <button
            onClick={() => setSubTab('ChienDich')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'ChienDich'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm">event_available</span>
            <span>🎪 Theo Chiến Dịch ({stats.chienDich})</span>
          </button>

          <button
            onClick={() => setSubTab('ThuongXuyen')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'ThuongXuyen'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm">autorenew</span>
            <span>🩸 Hiến Máu Thường Xuyên ({stats.thuongXuyen})</span>
          </button>

          <button
            onClick={() => setSubTab('CoDinh')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'CoDinh'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm">local_hospital</span>
            <span>🏥 Điểm Hiến Cố Định ({stats.coDinh})</span>
          </button>
        </div>
      )}

      {/* CONTENT MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* CỘT DANH SÁCH BẢNG */}
        <div className="xl:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-lg">list_alt</span>
                <span>
                  {mainTab === 'pending'
                    ? 'Danh sách chờ duyệt cấp giấy chứng nhận'
                    : `Lịch sử cấp chứng nhận: ${
                        subTab === 'ChienDich' ? 'Chiến dịch tập trung' : subTab === 'ThuongXuyen' ? 'Hiến máu thường xuyên' : 'Điểm hiến cố định'
                      }`}
                </span>
              </h2>
              <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {filteredList.length} kết quả
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200">
                    {['TNV / Hồ sơ', 'Nhóm máu', 'Thể tích', 'Xét nghiệm', 'Trạng thái', 'Hành động'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left font-extrabold text-slate-600 uppercase tracking-wider whitespace-nowrap last:text-center">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                        Đang tải danh sách chứng nhận...
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                        {mainTab === 'pending'
                          ? 'Hiện tại không có tình nguyện viên nào đang chờ cấp chứng nhận.'
                          : 'Không có dữ liệu lịch sử chứng nhận tương ứng.'}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((c) => (
                      <tr
                        key={c.maDon}
                        onClick={() => selectCandidate(c)}
                        className={`hover:bg-rose-50/60 cursor-pointer transition-all ${
                          selected?.maDon === c.maDon ? 'bg-rose-50 border-l-4 border-rose-600' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                              style={{ background: 'linear-gradient(135deg,#af101a,#d32f2f)' }}
                            >
                              {initials(c.hoVaTen)}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-xs">{c.hoVaTen}</p>
                              <p className="text-[11px] text-slate-400 font-medium">CCCD: {c.soCCCD}</p>
                              <p className="text-[10px] text-slate-500 font-bold truncate max-w-[150px]">{c.tenChienDich}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-mono font-black border border-rose-200">
                            {c.nhomMau}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-700">{c.theTich}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Âm tính</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              c.trangThaiCap === 'issued'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            }`}
                          >
                            {c.trangThaiCap === 'issued' ? 'Đã phát hành' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 mx-auto cursor-pointer ${
                              c.trangThaiCap === 'issued'
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {c.trangThaiCap === 'issued' ? 'visibility' : 'send'}
                            </span>
                            <span>{c.trangThaiCap === 'issued' ? 'Xem' : 'Cấp ngay'}</span>
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

        {/* CỘT PREVIEW THẺ CHỨNG NHẬN ĐIỆN TỬ */}
        <div className="xl:col-span-5">
          {!selected ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-10 flex flex-col items-center justify-center text-center min-h-[440px]">
              <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mb-4 border border-rose-100">
                <span className="material-symbols-outlined text-rose-600 text-3xl">workspace_premium</span>
              </div>
              <p className="font-extrabold text-slate-700 text-sm">Chọn Tình nguyện viên để xem trước</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Bấm vào một hàng trong danh sách bên trái để xem bản Giấy chứng nhận điện tử xem trước.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-rose-200 overflow-hidden shadow-xl bg-gradient-to-br from-[#fff8f7] via-[#fff2f0] to-[#ffdad6]">
              <div className="bg-gradient-to-r from-rose-900 to-red-800 px-6 py-5 text-white text-center">
                <span className="material-symbols-outlined text-3xl mb-2 text-rose-200" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bloodtype
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">BAN CHỈ ĐẠO HIẾN MÁU NHÂN ĐẠO</p>
                <h3 className="text-lg font-black uppercase tracking-tight mt-0.5">Thành phố Đà Nẵng</h3>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-black text-rose-900 uppercase tracking-wide">GIẤY CHỨNG NHẬN</h2>
                  <p className="text-xs font-bold text-slate-500">HIẾN MÁU TÌNH NGUYỆN ĐIỆN TỬ</p>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-rose-100 shadow-2xs">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#af101a,#d32f2f)' }}
                  >
                    {initials(selected.hoVaTen)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-base">{selected.hoVaTen}</p>
                    <p className="text-xs text-slate-500 font-medium">CCCD: {selected.soCCCD}</p>
                    <p className="text-xs text-slate-500 font-medium">Ngày sinh: {selected.ngaySinh}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-medium bg-white/70 p-4 rounded-2xl border border-rose-100">
                  {[
                    ['Nhóm máu', selected.nhomMau],
                    ['Thể tích hiến', selected.theTich],
                    ['Nơi hiến / Chiến dịch', selected.tenChienDich],
                    ['Ngày thực hiện', selected.ngayHien],
                    ['Mã chứng nhận', selected.maChungNhan || `GCN-DN-${selected.maDon}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-rose-100/60 last:border-0">
                      <span className="text-slate-500">{label}</span>
                      <span className={`font-bold ${label === 'Mã chứng nhận' ? 'font-mono text-rose-700' : 'text-slate-800'}`}>{val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="material-symbols-outlined text-emerald-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <div>
                    <p className="text-xs font-black text-emerald-800">Xét nghiệm vi sinh: ÂM TÍNH</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Đạt tiêu chuẩn an toàn truyền máu Bộ Y tế</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/chung-nhan/${selected.maDon}`)}
                    className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Xem PDF Chứng Nhận
                  </button>

                  {selected.trangThaiCap !== 'issued' ? (
                    <button
                      type="button"
                      onClick={() => handleIssue(selected.maDon, selected.hoVaTen)}
                      className="flex-1 h-11 bg-rose-700 hover:bg-rose-800 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-900/20"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      Phát Hành Ngay
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 h-11 bg-emerald-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 opacity-80 cursor-default"
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
