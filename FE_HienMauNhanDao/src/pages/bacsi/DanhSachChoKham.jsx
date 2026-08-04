import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { donDangKyNvytService } from '../../services/nvytService';
import { khamLamSangService } from '../../services/khamLamSangService';

const PAGE_SIZE = 10;
const FETCH_CHUNK = 1000;

export default function DanhSachChoKham() {
  const navigate = useNavigate();
  const [filteredAll, setFilteredAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let list = [];
      try {
        const res = await khamLamSangService.getWaiting();
        list = Array.isArray(res) ? res : (res?.data || []);
      } catch (err) {
        console.warn('Gửi API cho-kham lỗi, thử fallback getAll:', err);
        const fallbackRes = await donDangKyNvytService.getAll(0, FETCH_CHUNK, keyword);
        const raw = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes?.content || []);
        list = raw.map(d => ({
          maDon: d.maDon,
          maTNV: d.maTNV,
          tenTinhNguyenVien: d.tinhNguyenVien?.hoTen || d.tinhNguyenVien?.hoVaTen || 'TNV Hiến Máu',
          ngaySinh: d.tinhNguyenVien?.ngaySinh ? String(d.tinhNguyenVien.ngaySinh) : '---',
          gioiTinh: d.tinhNguyenVien?.gioiTinh || '---',
          nhomMau: d.tinhNguyenVien?.nhomMau || 'Chưa rõ',
          soDienThoai: d.tinhNguyenVien?.soDienThoai || '---',
          cccd: d.tinhNguyenVien?.soCCCD || d.tinhNguyenVien?.cccd || '---',
          tenChienDich: d.maChienDich || 'Hiến máu thường xuyên',
          theTich: d.theTich || 350,
          maNhanVien: d.maNhanVien || d.maNV || null
        }));
      }

      if (keyword) {
        const kw = keyword.toLowerCase().trim();
        list = list.filter(d => 
          (d.maDon && d.maDon.toLowerCase().includes(kw)) ||
          (d.tenTinhNguyenVien && d.tenTinhNguyenVien.toLowerCase().includes(kw)) ||
          (d.cccd && d.cccd.includes(kw)) ||
          (d.soDienThoai && d.soDienThoai.includes(kw)) ||
          (d.tenChienDich && d.tenChienDich.toLowerCase().includes(kw))
        );
      }

      setFilteredAll(list);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải danh sách đơn chờ khám', 'error');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedList = useMemo(() => {
    return filteredAll.filter(item => {
      const matchesBlood = bloodFilter === 'ALL' || String(item.nhomMau || '').includes(bloodFilter);
      return matchesBlood;
    });
  }, [filteredAll, bloodFilter]);

  const totalPages = Math.max(1, Math.ceil(displayedList.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const dons = useMemo(
    () => displayedList.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [displayedList, page]
  );

  const handleSearch = () => {
    setKeyword(searchInput.trim());
    setPage(0);
  };

  const handleGoKham = (don) => {
    navigate('/bac-si/kham-lam-sang', { state: { maDon: don.maDon, donData: don } });
  };

  const registeredByLeTanCount = filteredAll.filter(d => d.maNhanVien || d.maNV).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl text-white text-xs font-black flex items-center gap-2.5 transition-all animate-bounce
          ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'error' ? 'error' : 'task_alt'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Ruby Blood Life Doctor Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-6 md:p-8 text-white shadow-xl shadow-rose-600/15 border border-white/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black text-rose-50 border border-white/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              🩸 DÒNG MÁU NHÂN ĐẠO - KHÁM LÂM SÀNG BÁC SĨ
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Danh Sách Tình Nguyện Viên Chờ Khám Lâm Sàng
            </h1>
            <p className="text-rose-100 text-xs md:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Tiếp nhận tình nguyện viên đã check-in qua bàn Lễ tân, tiến hành đo 4 chỉ số sinh hiệu (Huyết áp, nhịp tim, cân nặng, nhiệt độ) và quyết định cấp phép hiến máu
            </p>
          </div>

          {/* Quick Doctor Live KPI Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3.5 px-4 text-center shadow-sm">
              <p className="text-[10px] font-black uppercase text-rose-100 tracking-wider">Chờ Khám Ngay</p>
              <p className="text-2xl font-black text-white mt-1">{filteredAll.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3.5 px-4 text-center shadow-sm">
              <p className="text-[10px] font-black uppercase text-rose-100 tracking-wider">Lễ Tân Đã Duyệt</p>
              <p className="text-2xl font-black text-white mt-1">{registeredByLeTanCount}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3.5 px-4 text-center shadow-sm">
              <p className="text-[10px] font-black uppercase text-rose-100 tracking-wider">Tự Đăng Ký</p>
              <p className="text-2xl font-black text-white mt-1">{filteredAll.length - registeredByLeTanCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search Bar & Filters */}
      <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm theo mã đơn, họ tên TNV, CCCD, SĐT..."
              className="w-full h-11 bg-rose-50/30 border border-rose-100 rounded-xl pl-10 pr-4 text-xs outline-none focus:border-rose-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <button
            onClick={handleSearch}
            className="h-11 px-5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span>Tìm Kiếm</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={bloodFilter}
            onChange={e => setBloodFilter(e.target.value)}
            className="h-11 border border-rose-100 rounded-xl px-4 text-xs font-extrabold text-slate-700 outline-none bg-rose-50/30 focus:border-rose-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Tất cả nhóm máu</option>
            <option value="A">Nhóm A</option>
            <option value="B">Nhóm B</option>
            <option value="O">Nhóm O</option>
            <option value="AB">Nhóm AB</option>
          </select>

          <button
            onClick={loadData}
            disabled={loading}
            className="h-11 w-11 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center transition-all border border-rose-200 active:scale-95"
            title="Làm mới danh sách"
          >
            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>
      </div>

      {/* Main Waiting Table */}
      <div className="bg-white border border-rose-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-lg">queue</span>
            Danh Sách Tình Nguyện Viên Đang Chờ Tại Phòng Khám
          </h3>
          <span className="text-[11px] font-bold text-rose-700 bg-rose-100/70 px-3 py-1 rounded-xl border border-rose-200 shadow-2xs">
            💡 Bấm nút <b className="text-rose-700 font-black">🩺 Gọi Khám Lâm Sàng</b> để đo 4 chỉ số sinh hiệu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-rose-50/30 border-b border-rose-100">
                {['Mã Đơn Đăng Ký', 'Tình Nguyện Viên', 'Căn Cước / SĐT', 'Nhóm Máu', 'Nguồn Tiếp Nhận', 'Chiến Dịch', 'Thao Tác'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Đang tải danh sách chờ khám...</td></tr>
              ) : dons.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Hiện không có tình nguyện viên nào chờ khám.</td></tr>
              ) : dons.map(don => {
                const isFromLeTan = !!(don.maNhanVien || don.maNV);
                return (
                  <tr key={don.maDon} className="border-b border-slate-100 hover:bg-rose-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-black text-rose-800 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200/80 shadow-2xs">
                        {don.maDon}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-slate-800 text-sm">{don.tenTinhNguyenVien || '---'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Giới tính: {don.gioiTinh || '---'} | Ngày sinh: {don.ngaySinh || '---'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-slate-700">{don.cccd || '---'}</p>
                      <p className="text-[10px] font-mono text-slate-400">{don.soDienThoai || '---'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs rounded-xl shadow-sm shadow-rose-200">
                        {don.nhomMau || 'Chưa rõ'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isFromLeTan ? (
                        <span className="px-3 py-1 bg-cyan-50 text-cyan-800 font-black text-xs rounded-full border border-cyan-200 flex items-center gap-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                          📋 Lễ tân quầy ({don.maNhanVien || don.maNV})
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-purple-50 text-purple-800 font-black text-xs rounded-full border border-purple-200 flex items-center gap-1.5 w-fit">
                          📱 TNV tự đăng ký
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-extrabold text-slate-700 max-w-xs truncate">
                      {don.tenChienDich || 'Hiến máu thường xuyên'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleGoKham(don)}
                        className="h-10 px-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">clinical_notes</span>
                        <span>🩺 Gọi Khám Lâm Sàng</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-3.5 border-t border-rose-100 bg-rose-50/40">
            <span className="text-xs font-bold text-slate-500">Trang {page + 1} / {totalPages} ({displayedList.length} ca chờ)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-8 h-8 rounded-xl border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-40 font-bold"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="w-8 h-8 rounded-xl border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-40 font-bold"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
