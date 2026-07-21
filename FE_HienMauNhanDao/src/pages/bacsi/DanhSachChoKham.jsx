import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { donDangKyNvytService } from '../../services/nvytService';
import { khamLamSangService } from '../../services/khamLamSangService';

const PAGE_SIZE = 10;
/** Lấy một lần rồi lọc + phân trang client (API chưa hỗ trợ lọc theo trạng thái) */
const FETCH_CHUNK = 1000;

/** Ẩn đơn đã hiến xong — chỉ hiện đơn chờ / chưa hiến */
function laTrangThaiDaHien(t) {
  const s = String(t ?? '').trim();
  return s === 'Đã hiến' || s === 'Đã hiến máu' || s === 'DA_HIEN' || s === 'DA_HIEN_MAU';
}

function trangThaiBadgeClass(don) {
  const t = don.trangThai;
  if (t === 'DA_KHAM' || t === 'Đã khám') return 'bg-green-100 text-green-700';
  if (t === 'CHO_KHAM' || t === 'Chờ khám') return 'bg-amber-100 text-amber-700';
  if (t === 'DA_DANG_KY' || t === 'Đã đăng ký') return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-600';
}

export default function DanhSachChoKham() {
  const navigate = useNavigate();
  const [filteredAll, setFilteredAll] = useState([]);
  const [maDonDaKham, setMaDonDaKham] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, khamRes] = await Promise.all([
        donDangKyNvytService.getAll(0, FETCH_CHUNK, keyword),
        khamLamSangService.getAll()
      ]);
      const raw = Array.isArray(res) ? res : (res.content || []);
      const khamData = Array.isArray(khamRes) ? khamRes : (khamRes?.data || []);
      
      const khamMaDonSet = new Set(khamData.map(k => k.maDon));
      setMaDonDaKham(Array.from(khamMaDonSet));
      
      // Lọc bỏ những đơn đã có kết quả khám sàng lọc
      setFilteredAll(raw.filter((don) => !laTrangThaiDaHien(don.trangThai) && !khamMaDonSet.has(don.maDon)));
    } catch {
      showToast('Lỗi khi tải danh sách đơn đăng ký', 'error');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const dons = useMemo(
    () => filteredAll.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredAll, page]
  );

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(0);
  };

  const isEditable = (don) => !!don.maNV;

  const goKham = (maDon) => {
    navigate('/bac-si/kham-lam-sang', { state: { maDon } });
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-2 transition-all
          ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-green-600'}`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Danh sách chờ khám</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Cùng nguồn đơn như NVYT; chỉ hiển thị đơn có trạng thái khác <span className="font-semibold text-slate-600">Đã hiến</span> /{' '}
          <span className="font-semibold text-slate-600">Đã hiến máu</span>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            search
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo mã đơn, tên TNV, mã chiến dịch..."
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="h-11 px-6 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors"
        >
          Tìm kiếm
        </button>
        {keyword && (
          <button
            type="button"
            onClick={() => {
              setKeyword('');
              setSearchInput('');
              setPage(0);
            }}
            className="h-11 px-4 border border-slate-200 text-slate-500 rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Mã đơn', 'Tình nguyện viên', 'Chiến dịch', 'Thể tích', 'Trạng thái', 'Nhân viên tạo', 'Thao tác'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400 tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : dons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-5xl block mb-2">inbox</span>
                    Không có đơn nào (hoặc toàn bộ đều đã ở trạng thái Đã hiến / Đã hiến máu)
                  </td>
                </tr>
              ) : (
                dons.map((don) => {
                  const editable = isEditable(don);
                  return (
                    <tr key={don.maDon} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-primary bg-red-50 px-2 py-1 rounded-lg">
                          {don.maDon}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{don.tinhNguyenVien?.hoVaTen || don.maTNV || '---'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{don.tinhNguyenVien?.soCCCD || ''}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600">{don.maChienDich || '---'}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                          {don.theTich || '---'} ml
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${trangThaiBadgeClass(don)}`}>
                          {don.trangThai || 'Chờ xử lý'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {editable ? (
                          <span className="flex items-center gap-1 text-blue-600 font-semibold">
                            <span className="material-symbols-outlined text-sm">badge</span>
                            {don.maNV}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400 italic">
                            <span className="material-symbols-outlined text-sm">person</span>
                            TNV tự đăng ký
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {maDonDaKham.includes(don.maDon) ? (
                          <span className="h-9 px-3 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold inline-flex items-center gap-1 cursor-not-allowed">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            Đã khám
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => goKham(don.maDon)}
                            className="h-9 px-3 rounded-lg bg-primary text-white text-xs font-bold hover:bg-red-800 transition-colors inline-flex items-center gap-1"
                            title="Khám lâm sàng"
                          >
                            <span className="material-symbols-outlined text-base">clinical_notes</span>
                            Khám
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors
                    ${i === page ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
