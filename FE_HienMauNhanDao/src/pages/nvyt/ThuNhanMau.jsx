import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { thuNhanMauService, ketQuaXetNghiemService } from '../../services/khamLamSangService';
import { donDangKyNvytService } from '../../services/nvytService';
import Swal from 'sweetalert2';

// ─── Modal Thu Nhận & Sinh Mã Barcode Túi Máu ──────────────────────────
function TuiMauModal({ don, item, nhanVien, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    maDon: don?.maDon || item?.maDon || '',
    maNV: nhanVien?.maNV || item?.maNV || '',
    theTich: item?.theTich || don?.theTich || 350,
    thoiGianLayMau: item?.thoiGianLayMau ? item.thoiGianLayMau.slice(0, 16) : new Date().toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16),
    nhietDoVanChuyen: item?.nhietDoVanChuyen || 4.0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mã barcode xem trước ngẫu nhiên hoặc mã hiện có
  const sampleBarcodeStr = item?.maTuiMau || `TM${DateTimeNowStr()}`;

  function DateTimeNowStr() {
    const d = new Date();
    return `${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}${String(d.getMilliseconds()).padStart(3, '0')}`;
  }

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const data = {
        ...form,
        thoiGianLayMau: form.thoiGianLayMau.length === 16 ? form.thoiGianLayMau + ':00' : form.thoiGianLayMau
      };
      
      let maTuiMauCreated = null;
      if (isEdit) {
        await thuNhanMauService.update(item.maTuiMau, data);
        maTuiMauCreated = item.maTuiMau;
      } else {
        const res = await thuNhanMauService.create(data);
        maTuiMauCreated = res?.data?.maTuiMau || res?.data?.data?.maTuiMau || res?.maTuiMau;
        
        if (maTuiMauCreated && data.maNV) {
          try {
            await ketQuaXetNghiemService.create({
              maTuiMau: maTuiMauCreated,
              maNhanVien: data.maNV,
            });
          } catch (xnErr) {
            console.warn('Tạo bản ghi xét nghiệm sơ bộ:', xnErr);
          }
        }
      }
      onSaved(maTuiMauCreated, don || item);
    } catch (e) {
      console.log("Lỗi khởi tạo túi máu:", e.response || e.message || e);
      setError(e.response?.data?.message || e.message || 'Lỗi khi lưu thông tin túi máu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-2xl">{isEdit ? 'edit_note' : 'qr_code_scanner'}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">{isEdit ? `Cập Nhật Thể Tích ${item.maTuiMau}` : 'Khởi Tạo Mã Túi Máu (Barcode)'}</h3>
              <p className="text-xs text-red-100 font-medium">Tiếp nhận tình nguyện viên & dán mã định danh túi máu</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Barcode Simulator Preview */}
          <div className="bg-white border-2 border-dashed border-red-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Mô Phỏng Mã Barcode Dán Túi Máu</p>
            
            {/* Fake SVG Barcode lines */}
            <div className="flex items-center justify-center gap-1 h-12 my-1 px-4 py-1 bg-slate-900/5 rounded-lg w-full max-w-xs">
              {[3,1,2,4,1,3,2,1,4,2,1,3,2,4,1,2,3,1,4,2,1,3].map((w, i) => (
                <div key={i} className="bg-slate-900 h-full rounded-sm" style={{ width: `${w * 2}px` }}></div>
              ))}
            </div>

            <span className="font-mono text-base font-black text-red-700 tracking-widest mt-1">
              {sampleBarcodeStr}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Dán nhãn định danh lên túi trước khi rút máu</span>
          </div>

          {/* Patient Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-400 uppercase">Mã Đơn Đăng Ký:</span>
              <span className="font-mono font-extrabold text-primary bg-red-50 px-2 py-0.5 rounded-lg">{form.maDon}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase">Người Hiến Máu:</span>
              <span className="font-extrabold text-slate-800 text-sm">
                {isEdit ? item.tenTinhNguyenVien : (don?.hoTen || don?.hoVaTen || don?.tenTinhNguyenVien || don?.tinhNguyenVien?.hoTen || 'TNV Hiến Máu')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase">Nhóm Máu TNV:</span>
              <span className="font-black text-white bg-red-600 px-2.5 py-0.5 rounded-lg shadow-sm">
                {isEdit ? item.nhomMau : (don?.nhomMau || don?.tinhNguyenVien?.nhomMau || 'Chưa rõ')}
              </span>
            </div>
          </div>

          {/* Form inputs */}
          <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5 uppercase">Thể Tích Túi Máu *</label>
              <div className="grid grid-cols-3 gap-2">
                {[250, 350, 450].map(vol => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, theTich: vol }))}
                    className={`h-11 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1 ${
                      form.theTich === vol
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200 scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">water_drop</span>
                    <span>{vol} ml</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5 uppercase">Thời Gian Lấy Máu *</label>
              <input
                type="datetime-local"
                value={form.thoiGianLayMau} onChange={e => setForm(p => ({ ...p, thoiGianLayMau: e.target.value }))}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none focus:border-red-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5 uppercase">Nhiệt Độ Vận Chuyển (°C)</label>
              <input
                type="number" step="0.1"
                value={form.nhietDoVanChuyen} onChange={e => setForm(p => ({ ...p, nhietDoVanChuyen: Number(e.target.value) }))}
                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none focus:border-red-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={loading} className="px-5 h-11 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Hủy Bỏ
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 h-11 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-extrabold text-xs hover:from-red-700 hover:to-rose-700 transition-all shadow-md shadow-red-200 disabled:opacity-60 flex items-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang Xử Lý...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">{isEdit ? 'save' : 'verified'}</span>
                <span>{isEdit ? 'Lưu Thay Đổi' : 'Xác Nhận & Sinh Mã Barcode'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component Chính Trang Thu Nhận Máu ───────────────────────────────
export default function ThuNhanMau() {
  const { nhanVien } = useOutletContext();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'collected'

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');

  // Pending State
  const [pendingList, setPendingList] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [modalDon, setModalDon] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // Collected State
  const [collectionList, setCollectionList] = useState([]);
  const [collectedPage, setCollectedPage] = useState(0);
  const collectedPageSize = 10;
  const totalCollectedPages = Math.ceil(collectionList.length / collectedPageSize) || 1;
  const paginatedCollectedList = collectionList.slice(collectedPage * collectedPageSize, (collectedPage + 1) * collectedPageSize);

  const [stats, setStats] = useState({
    tongSoTui: 0, tongTheTich: 0, theoNhomMau: {}, theoTheTich: {}
  });
  const [collectedLoading, setCollectedLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState({
    open: false, title: '', message: '', onConfirm: null, loading: false
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPendingList = useCallback(async () => {
    try {
      setPendingLoading(true);
      const res = await donDangKyNvytService.getReadyForCollection(pendingPage, 10);
      const content = Array.isArray(res) ? res : (res.content || []);
      setPendingList(content);
      setPendingTotalPages(res.totalPages || 1);
    } catch (error) {
      showToast('Lỗi khi tải danh sách chờ thu nhận', 'error');
    } finally {
      setPendingLoading(false);
    }
  }, [pendingPage]);

  const fetchCollectionList = useCallback(async () => {
    try {
      setCollectedLoading(true);
      const [dataRes, statsRes] = await Promise.all([
        thuNhanMauService.getAll(),
        thuNhanMauService.getStats(),
      ]);
      setCollectionList(Array.isArray(dataRes) ? dataRes : (dataRes.data || []));
      setStats(statsRes.data || statsRes || {
        tongSoTui: 0, tongTheTich: 0, theoNhomMau: {}, theoTheTich: {},
      });
    } catch (error) {
      showToast('Lỗi khi tải danh sách đã thu nhận', 'error');
    } finally {
      setCollectedLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (maTuiMau, newStatus) => {
    try {
      await thuNhanMauService.updateStatus(maTuiMau, newStatus);
      showToast('Cập nhật trạng thái thành công!');
      fetchCollectionList();
    } catch (error) {
      console.error('Update status error:', error);
      showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') fetchPendingList();
    else fetchCollectionList();
  }, [activeTab, fetchPendingList, fetchCollectionList]);

  const handleSaved = (maTuiMauCreated) => {
    setModalDon(null);
    setEditItem(null);

    if (maTuiMauCreated && !editItem) {
      Swal.fire({
        title: '✅ ĐÃ TẠO MÃ TÚI MÁU THÀNH CÔNG!',
        html: `<div style="text-align: center;">
                 <p style="font-size: 14px; color: #475569; margin-bottom: 8px;">Mã túi máu định danh vừa sinh:</p>
                 <span style="font-family: monospace; font-size: 24px; font-weight: 900; color: #dc2626; background-color: #fef2f2; padding: 8px 20px; border-radius: 14px; border: 1px border-red-200; display: inline-block; margin-bottom: 14px;">${maTuiMauCreated}</span>
                 <p style="font-size: 13px; color: #059669; font-weight: 700;">✅ Nút icon + đã biến mất. Thông tin túi máu đã chuyển sang Trang 2 (Cập nhật kết quả xét nghiệm)!</p>
               </div>`,
        icon: 'success',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Đồng Ý'
      });
    } else {
      showToast('Cập nhật thông tin túi máu thành công!');
    }

    if (activeTab === 'pending') fetchPendingList();
    else fetchCollectionList();
  };

  const handleCancelDon = (maDon) => {
    setConfirmData({
      open: true,
      title: 'Hủy đơn đăng ký',
      message: `Bạn có chắc chắn muốn hủy đơn đăng ký ${maDon}? Thao tác này không thể hoàn tác.`,
      loading: false,
      onConfirm: async () => {
        setConfirmData(p => ({ ...p, loading: true }));
        try {
          await donDangKyNvytService.cancel(maDon, nhanVien?.maNV);
          showToast('Hủy đơn đăng ký thành công!');
          fetchPendingList();
          setConfirmData(p => ({ ...p, open: false }));
        } catch (error) {
          showToast(error.message || 'Lỗi khi hủy đơn đăng ký', 'error');
        } finally {
          setConfirmData(p => ({ ...p, loading: false }));
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xét nghiệm': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Yêu cầu nhập kho': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Nhập kho': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Đã xuất': return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'Hủy':
      case 'Đã hủy': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Filtered lists for Search
  const filteredPending = pendingList.filter(don => {
    const kw = search.toLowerCase().trim();
    const matchesSearch = !kw || String(don.maDon || '').toLowerCase().includes(kw) ||
      String(don.hoTen || don.hoVaTen || don.tenTinhNguyenVien || '').toLowerCase().includes(kw) ||
      String(don.maTuiMau || '').toLowerCase().includes(kw);
    const matchesBlood = bloodFilter === 'ALL' || (don.nhomMau || don.tinhNguyenVien?.nhomMau || '').includes(bloodFilter);
    return matchesSearch && matchesBlood;
  });

  const filteredCollected = paginatedCollectedList.filter(item => {
    const kw = search.toLowerCase().trim();
    const matchesSearch = !kw || String(item.maTuiMau || '').toLowerCase().includes(kw) ||
      String(item.tenTinhNguyenVien || '').toLowerCase().includes(kw);
    const matchesBlood = bloodFilter === 'ALL' || (item.nhomMau || '').includes(bloodFilter);
    return matchesSearch && matchesBlood;
  });

  const daCapMaCount = pendingList.filter(d => d.daCapMa).length;
  const choCapMaCount = pendingList.length - daCapMaCount;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-xl text-white text-xs font-extrabold flex items-center gap-2.5 transition-all animate-bounce
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'error' ? 'error' : 'task_alt'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-red-900 p-6 md:p-8 text-white shadow-xl shadow-red-950/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-red-200 border border-white/10 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              🔬 PHÂN HỆ KHÁM & THU NHẬN TÚI MÁU (NVXN)
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Thu Nhận & Sinh Mã Barcode Túi Máu</h1>
            <p className="text-red-100/80 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              Sinh mã định danh túi máu dán túi trước khi thu nhận & chuyển thông tin sang phòng Xét nghiệm vi sinh
            </p>
          </div>

          {/* Live Quick Stats Pills */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 text-center">
              <p className="text-[10px] uppercase font-bold text-red-200">Chờ Cấp Mã</p>
              <p className="text-xl font-black text-yellow-300 mt-0.5">{choCapMaCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 text-center">
              <p className="text-[10px] uppercase font-bold text-red-200">Đã Sinh Mã</p>
              <p className="text-xl font-black text-blue-300 mt-0.5">{daCapMaCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 text-center">
              <p className="text-[10px] uppercase font-bold text-red-200">Tổng Thu (ml)</p>
              <p className="text-xl font-black text-emerald-300 mt-0.5">{Math.round(stats.tongTheTich || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Control Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-white text-red-700 shadow-md shadow-slate-200 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">qr_code_2</span>
            <span>📋 Chờ Tiếp Nhận & Sinh Mã Túi</span>
            {pendingList.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-full">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('collected')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'collected'
                ? 'bg-white text-red-700 shadow-md shadow-slate-200 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            <span>🩸 Túi Máu Đã Hoàn Tất Xét Nghiệm</span>
            {collectionList.length > 0 && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">
                {collectionList.length}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar: Search & Blood Type Quick Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn, mã túi, TNV..."
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 text-xs outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <select
            value={bloodFilter}
            onChange={e => setBloodFilter(e.target.value)}
            className="h-10 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-700 outline-none bg-slate-50 focus:border-red-500 cursor-pointer"
          >
            <option value="ALL">Tất cả nhóm máu</option>
            <option value="A">Nhóm A</option>
            <option value="B">Nhóm B</option>
            <option value="O">Nhóm O</option>
            <option value="AB">Nhóm AB</option>
          </select>
        </div>
      </div>

      {/* Tab 1: Danh sách đơn chờ thu nhận & sinh mã */}
      {activeTab === 'pending' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-lg">person_check</span>
              Tình nguyện viên đã khám đạt & Chờ sinh mã túi máu
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
              💡 Bấm icon <b className="text-red-600">+ Cấp mã</b> để sinh mã định danh túi máu dán túi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200">
                  {['Mã Đơn / Mã Túi', 'Tình Nguyện Viên', 'Nhóm Máu', 'Chiến Dịch', 'Thể Tích', 'Trạng Thái Xử Lý', 'Thao Tác'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingLoading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Đang tải danh sách chờ thu nhận...</td></tr>
                ) : filteredPending.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Không có đơn nào chờ thu nhận máu.</td></tr>
                ) : filteredPending.map(don => (
                  <tr key={don.maDon} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        {don.maDon}
                      </span>
                      {don.maTuiMau ? (
                        <div className="mt-1.5">
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 font-mono font-extrabold text-xs rounded-lg border border-red-200 shadow-2xs flex items-center gap-1 w-fit">
                            <span className="material-symbols-outlined text-sm text-red-600">qr_code</span>
                            {don.maTuiMau}
                          </span>
                        </div>
                      ) : (
                        <span className="block mt-1 text-[11px] text-slate-400 italic">Chưa cấp mã</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{don.hoTen || don.hoVaTen || don.tenTinhNguyenVien || don.tinhNguyenVien?.hoTen || 'TNV Hiến Máu'}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">badge</span>
                        CCCD: {don.cccd || don.soCCCD || don.tinhNguyenVien?.cccd || '---'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 bg-red-600 text-white font-black text-xs rounded-xl shadow-sm shadow-red-200">
                        {don.nhomMau || don.tinhNguyenVien?.nhomMau || 'Chưa rõ'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <p className="font-bold text-slate-700 max-w-xs truncate">{don.tenChienDich || 'Hiến máu thường xuyên'}</p>
                      <p className="font-mono text-[10px] text-slate-400">{don.maChienDich || 'CD00004'}</p>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-700">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                        {don.theTich || 350} ml
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {don.daCapMa ? (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-full border border-blue-100 flex items-center gap-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          ⏳ Đang chờ kết quả
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-100">
                          ⏳ Đang chờ tạo túi máu
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {don.daCapMa ? (
                          <>
                            <button
                              onClick={() => setModalDon(don)}
                              className="h-9 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95"
                              title="Chỉnh sửa thể tích túi máu"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                              <span>Sửa</span>
                            </button>
                            <a
                              href="/nvyt/cap-nhat-xet-nghiem"
                              className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1 transition-all shadow-md shadow-indigo-100 active:scale-95"
                              title="Đi đến Trang 2 Cập nhật kết quả xét nghiệm"
                            >
                              <span className="material-symbols-outlined text-base">biotech</span>
                              <span>Sang Trang 2</span>
                            </a>
                          </>
                        ) : (
                          <button
                            onClick={() => setModalDon(don)}
                            className="h-9 px-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1 transition-all shadow-md shadow-red-200 active:scale-95"
                            title="Tạo mã túi máu"
                          >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span>+ Cấp mã</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleCancelDon(don.maDon)}
                          className="w-9 h-9 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-red-100 active:scale-90"
                          title="Hủy đơn đăng ký"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pendingTotalPages > 1 && (
            <div className="flex justify-between items-center px-5 py-3 border-t border-slate-100 bg-slate-50/80">
              <span className="text-xs font-bold text-slate-500">Trang {pendingPage + 1} / {pendingTotalPages} ({pendingList.length} đơn)</span>
              <div className="flex gap-2">
                <button onClick={() => setPendingPage(p => Math.max(0, p - 1))} disabled={pendingPage === 0} className="w-8 h-8 rounded-xl border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-40 font-bold"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <button onClick={() => setPendingPage(p => Math.min(pendingTotalPages - 1, p + 1))} disabled={pendingPage === pendingTotalPages - 1} className="w-8 h-8 rounded-xl border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-40 font-bold"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Túi máu đã hoàn tất xét nghiệm */}
      {activeTab === 'collected' && (
        <div className="space-y-6">
          {/* Top Metric Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-white to-red-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase text-slate-400">Tổng Số Túi Máu Đã Thu</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{stats.tongSoTui || collectionList.length}</p>
              </div>
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-3xl">vaccines</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase text-slate-400">Tổng Thể Tích Thu Nhận (ml)</p>
                <p className="text-3xl font-black text-blue-600 mt-1">{Math.round(stats.tongTheTich || 0)} ml</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-3xl">water_drop</span>
              </div>
            </div>
          </div>

          {collectedLoading ? (
            <div className="py-12 text-center text-slate-400 font-bold">Đang tải dữ liệu túi máu...</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200">
                    <tr>
                      {['Mã Túi Máu', 'Tình Nguyện Viên', 'Nhóm Máu', 'Chiến Dịch', 'Thể Tích', 'Bác Sĩ Khám', 'Trạng Thái Y Tế', 'Thao Tác'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCollected.length > 0 ? (
                      filteredCollected.map((item, idx) => (
                        <tr key={item.maTuiMau} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} 
                          ${(item.trangThai === 'Nhập kho' || item.trangThai === 'Đã xuất') ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-slate-100/50'} transition-colors`}>
                          <td className="px-5 py-4 font-mono text-xs font-extrabold text-red-700 bg-red-50/50 rounded-lg">
                            {item.maTuiMau}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800 text-sm">{item.tenTinhNguyenVien}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Mã đơn: {item.maDon}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-3 py-1 bg-red-600 text-white font-black text-xs rounded-xl shadow-sm shadow-red-200">
                              {item.nhomMau}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-600 font-semibold">{item.tenChienDich || '---'}</td>
                          <td className="px-5 py-4 text-slate-800 font-extrabold">{item.theTich} ml</td>
                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {item.tenBacSi ? (
                              <div>
                                <p>{item.tenBacSi}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{item.maBacSi}</p>
                              </div>
                            ) : '---'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${getStatusColor(item.trangThai)}`}>
                              {item.trangThai}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className={`flex justify-center gap-2 ${(item.trangThai === 'Nhập kho' || item.trangThai === 'Đã xuất') ? 'pointer-events-none cursor-not-allowed' : ''}`}>
                              {(item.trangThai === 'Chờ xét nghiệm' || item.trangThai === 'Hủy') && (
                                <button
                                  onClick={() => setEditItem(item)}
                                  className={`p-2 rounded-xl transition-all ${item.trangThai === 'Hủy' ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white'}`}
                                  title={item.trangThai === 'Hủy' ? "Tạo lại túi máu" : "Chỉnh sửa thông tin"}
                                >
                                  <span className="material-symbols-outlined text-base">{item.trangThai === 'Hủy' ? 'add_circle' : 'edit'}</span>
                                </button>
                              )}
                              {(item.trangThai === 'Nhập kho' || item.trangThai === 'Đã xuất') && (
                                <div className="flex items-center gap-1 text-slate-400 opacity-70 justify-center">
                                  <span className="material-symbols-outlined text-[14px]">lock</span>
                                  <span className="text-[10px] font-bold italic">Không thể sửa</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-400 font-bold">Không có dữ liệu túi máu đã hoàn tất xét nghiệm</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalCollectedPages > 1 && (
                <div className="flex justify-between items-center px-5 py-3 border-t border-slate-100 bg-slate-50/80">
                  <span className="text-xs font-bold text-slate-500">Trang {collectedPage + 1} / {totalCollectedPages} ({collectionList.length} túi máu)</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCollectedPage(p => Math.max(0, p - 1))} disabled={collectedPage === 0} className="w-8 h-8 rounded-xl border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-40 font-bold"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                    <button onClick={() => setCollectedPage(p => Math.min(totalCollectedPages - 1, p + 1))} disabled={collectedPage === totalCollectedPages - 1} className="w-8 h-8 rounded-xl border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-40 font-bold"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modalDon && (
        <TuiMauModal
          don={modalDon}
          nhanVien={nhanVien}
          onClose={() => setModalDon(null)}
          onSaved={handleSaved}
        />
      )}

      {editItem && (
        <TuiMauModal
          item={editItem}
          nhanVien={nhanVien}
          onClose={() => setEditItem(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog 
        {...confirmData} 
        onCancel={() => setConfirmData(prev => ({ ...prev, open: false }))} 
      />
    </div>
  );
}

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/20">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span className="material-symbols-outlined text-3xl font-bold">warning</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-xs leading-relaxed px-2 font-medium">{message}</p>
        </div>
        <div className="flex p-4 gap-2.5 bg-slate-50">
          <button 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-11 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-xs active:scale-95"
          >
            Bỏ Qua
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-xl font-extrabold bg-red-600 text-white hover:bg-red-700 transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-red-200 active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Xác Nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};
