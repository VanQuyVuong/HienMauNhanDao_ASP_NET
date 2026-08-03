import React, { useState, useEffect, useCallback } from 'react';
// ─── Issue #67: Trang Thu Nhận Túi Máu & Chuyển Xét Nghiệm (NVYT Xét Nghiệm) ───
import { useOutletContext } from 'react-router-dom';
import { thuNhanMauService, ketQuaXetNghiemService } from '../../services/khamLamSangService';
import { donDangKyNvytService } from '../../services/nvytService';
import Swal from 'sweetalert2';

// ─── Modal Thu Nhận Máu ─────────────────────────────────────────────────────
function TuiMauModal({ don, item, nhanVien, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    maDon: don?.maDon || item?.maDon || '',
    maNV: nhanVien?.maNV || item?.maNV || '',
    theTich: item?.theTich || don?.theTich || 250,
    thoiGianLayMau: item?.thoiGianLayMau ? item.thoiGianLayMau.slice(0, 16) : new Date().toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16),
    nhietDoVanChuyen: item?.nhietDoVanChuyen || 4.2
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // Tạo túi máu → nhận lại maTuiMau mới
        const res = await thuNhanMauService.create(data);
        maTuiMauCreated = res?.data?.maTuiMau || res?.data?.data?.maTuiMau || res?.maTuiMau;
        
        // Tự động tạo kết quả xét nghiệm với mã khóa ngoại đã có
        if (maTuiMauCreated && data.maNV) {
          try {
            await ketQuaXetNghiemService.create({
              maTuiMau: maTuiMauCreated,
              maNhanVien: data.maNV,
            });
          } catch (xnErr) {
            console.warn('Tạo kết quả xét nghiệm thất bại (không ảnh hưởng túi máu):', xnErr);
          }
        }
      }
      onSaved(maTuiMauCreated, don || item);
    } catch (e) {
      console.log("Lỗi từ đây : "+e.response || e.message || e);
      setError(e.response?.data?.message || e.message || 'Lỗi khi lưu thông tin túi máu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <span className="material-symbols-outlined font-bold">{isEdit ? 'edit_note' : 'vaccines'}</span>
            <h3 className="font-bold">{isEdit ? `Cập nhật túi máu ${item.maTuiMau}` : 'Thu nhận túi máu'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-red-500 text-xl font-bold">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Đơn đăng ký:</span>
              <span className="text-xs font-mono font-bold text-primary">{form.maDon}</span>
            </div>
            {isEdit && (
               <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Tình nguyện viên:</span>
                <span className="text-xs font-bold text-slate-800">{item.tenTinhNguyenVien}</span>
              </div>
            )}
            {!isEdit && (
               <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Người hiến:</span>
                <span className="text-xs font-bold text-slate-800">{don.hoTen || don.hoVaTen || don.tenTinhNguyenVien || don.tinhNguyenVien?.hoTen || don.tinhNguyenVien?.hoVaTen || 'TNV Hiến Máu'}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Nhóm máu:</span>
              <span className="text-xs font-bold text-red-600">{isEdit ? item.nhomMau : (don.nhomMau || don.tinhNguyenVien?.nhomMau || 'Chưa rõ')}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Thể tích túi máu *</label>
            <select value={form.theTich} onChange={e => setForm(p => ({ ...p, theTich: Number(e.target.value) }))}
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-red-500 bg-white">
              <option value={250}>250 ml</option>
              <option value={350}>350 ml</option>
              <option value={450}>450 ml</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Thời gian lấy máu *</label>
            <input
              type="datetime-local"
              value={form.thoiGianLayMau} onChange={e => setForm(p => ({ ...p, thoiGianLayMau: e.target.value }))}
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Nhiệt độ vận chuyển (°C)</label>
            <input
              type="number" step="0.1"
              value={form.nhietDoVanChuyen} onChange={e => setForm(p => ({ ...p, nhietDoVanChuyen: Number(e.target.value) }))}
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2">
            <button onClick={handleSubmit} disabled={loading}
              className="w-full h-12 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-100 disabled:opacity-60">
              {loading ? 'Đang xử lý...' : (isEdit ? 'Lưu thay đổi' : 'Xác nhận thu nhận máu')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThuNhanMau() {
  const { nhanVien } = useOutletContext();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'collected'

  // Pending
  const [pendingList, setPendingList] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [modalDon, setModalDon] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [barcodeModalData, setBarcodeModalData] = useState(null); // { maTuiMau, don }

  // Collected
  const [collectionList, setCollectionList] = useState([]);
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
    console.log(`Updating blood bag ${maTuiMau} to status: ${newStatus}`);
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
                 <p style="font-size: 15px; color: #475569; margin-bottom: 8px;">Mã túi máu vừa khởi tạo:</p>
                 <span style="font-family: monospace; font-size: 24px; font-weight: 900; color: #dc2626; background-color: #fef2f2; padding: 6px 16px; border-radius: 12px; border: 1px border-red-200; display: inline-block; margin-bottom: 16px;">${maTuiMauCreated}</span>
                 <p style="font-size: 13px; color: #059669; font-weight: 700;">✅ Đã tự động thay đổi trạng thái đơn và chuyển thông tin sang Trang "Cập Nhật Kết Quả Xét Nghiệm"!</p>
               </div>`,
        icon: 'success',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Hiểu rồi'
      });
    } else {
      showToast(editItem ? 'Cập nhật thành công!' : 'Tạo túi máu thành công!');
    }

    fetchPendingList();
    fetchCollectionList();
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

  const BLOOD_TYPES_LIST = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const maxInStock = Math.max(...Object.values(stats.theoNhomMau || {}), 10);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-2 transition-all
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Thu nhận máu</h1>
          <p className="text-slate-500 mt-1 text-sm">Danh sách đơn chờ lấy máu và các túi máu đã thu nhận</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <span className="material-symbols-outlined text-xl">qr_code_2</span>
          📋 Chờ tiếp nhận & Sinh mã túi máu
        </button>
        <button
          onClick={() => setActiveTab('collected')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'collected' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <span className="material-symbols-outlined text-xl">fact_check</span>
          🩸 Túi máu đã hoàn tất xét nghiệm
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_check</span>
              Tình nguyện viên đủ điều kiện lấy máu & Sinh mã túi
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              💡 Bấm dấu <b className="text-red-600">+</b> để cấp mã túi máu trước khi lấy máu
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  {['Mã đơn / Mã túi', 'Tình nguyện viên', 'Nhóm máu', 'Chiến dịch', 'Thể tích', 'Trạng thái xử lý', 'Thao tác'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">Đang tải...</td></tr>
                ) : pendingList.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">Không có đơn nào chờ thu nhận máu.</td></tr>
                ) : pendingList.map(don => (
                  <tr key={don.maDon} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-bold text-primary">{don.maDon}</p>
                      {don.maTuiMau ? (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 font-mono font-bold text-xs rounded border border-red-200 shadow-sm">
                          🏷️ {don.maTuiMau}
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-[11px] text-slate-400 italic">Chưa cấp mã</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{don.hoTen || don.hoVaTen || don.tenTinhNguyenVien || don.tinhNguyenVien?.hoTen || don.tinhNguyenVien?.hoVaTen || 'TNV Hiến Máu'}</p>
                      <p className="text-xs text-slate-400">{don.cccd || don.soCCCD || don.tinhNguyenVien?.cccd || don.tinhNguyenVien?.soCCCD || '---'}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-red-600">{don.nhomMau || don.tinhNguyenVien?.nhomMau || 'Chưa rõ'}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">{don.tenChienDich || 'Hiến máu thường xuyên'}</p>
                      <p className="font-mono text-[10px] text-slate-400">{don.maChienDich || 'CD00004'}</p>
                    </td>
                    <td className="px-5 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{don.theTich || 0} ml</span></td>
                    <td className="px-5 py-4 text-xs">
                      {don.daCapMa ? (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-100 flex items-center gap-1 w-fit">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          ⏳ Đang chờ kết quả
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full border border-amber-100">
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
                              className="flex items-center justify-center h-9 px-3 bg-slate-600 text-white hover:bg-slate-700 rounded-xl transition-all shadow-sm font-medium text-xs gap-1"
                              title="Chỉnh sửa thể tích túi máu"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                              <span>Sửa</span>
                            </button>
                            <a
                              href="/nvyt/cap-nhat-xet-nghiem"
                              className="flex items-center justify-center h-9 px-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-md font-bold text-xs gap-1"
                              title="Đi đến Trang 2 Cập nhật kết quả xét nghiệm"
                            >
                              <span className="material-symbols-outlined text-base">biotech</span>
                              <span>Sang Trang 2</span>
                            </a>
                          </>
                        ) : (
                          <button
                            onClick={() => setModalDon(don)}
                            className="flex items-center justify-center h-9 px-3.5 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-100 font-bold text-xs gap-1"
                            title="Tạo mã túi máu"
                          >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span>+ Cấp mã</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleCancelDon(don.maDon)}
                          className="flex items-center justify-center w-9 h-9 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100 group active:scale-90"
                          title="Hủy đơn đăng ký"
                        >
                          <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pendingTotalPages > 1 && (
            <div className="flex justify-between items-center px-5 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-500">Trang {pendingPage + 1} / {pendingTotalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPendingPage(p => Math.max(0, p - 1))} disabled={pendingPage === 0} className="w-8 h-8 rounded border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <button onClick={() => setPendingPage(p => Math.min(pendingTotalPages - 1, p + 1))} disabled={pendingPage === pendingTotalPages - 1} className="w-8 h-8 rounded border border-slate-200 flex justify-center items-center hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'collected' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-500">Tổng số túi máu</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{stats.tongSoTui}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-3xl text-red-500">vaccines</span></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-500">Tổng thể tích (ml)</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{Math.round(stats.tongTheTich)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-3xl text-blue-500">water_drop</span></div>
              </div>
            </div>
          </div>

          {collectedLoading ? (
            <div className="py-8 text-center text-slate-400">Đang tải dữ liệu...</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Mã túi</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tình nguyện viên</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nhóm máu</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Chiến dịch</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Thể tích</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Bác sĩ khám</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Trạng thái</th>
                      <th className="px-5 py-3 text-center text-xs font-bold text-slate-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collectionList.length > 0 ? (
                      collectionList.map((item, idx) => (
                        <tr key={item.maTuiMau} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} 
                          ${(item.trangThai === 'Nhập kho' || item.trangThai === 'Đã xuất') ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-slate-100/50'} transition-colors`}>
                          <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">{item.maTuiMau}</td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800">{item.tenTinhNguyenVien}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.maDon}</p>
                          </td>
                          <td className="px-5 py-4"><span className="font-bold text-red-700">{item.nhomMau}</span></td>
                          <td className="px-5 py-4 text-xs text-slate-600">{item.tenChienDich || '---'}</td>
                          <td className="px-5 py-4 text-slate-600 font-bold">{item.theTich} ml</td>
                          <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                            {item.tenBacSi ? (
                              <div>
                                <p>{item.tenBacSi}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{item.maBacSi}</p>
                              </div>
                            ) : '---'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(item.trangThai)}`}>
                              {item.trangThai}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className={`flex justify-center gap-2 ${(item.trangThai === 'Nhập kho' || item.trangThai === 'Đã xuất') ? 'pointer-events-none cursor-not-allowed' : ''}`}>
                              {(item.trangThai === 'Chờ xét nghiệm' || item.trangThai === 'Hủy') && (
                                <button
                                  onClick={() => setEditItem(item)}
                                  className={`p-2 rounded-lg transition-all ${item.trangThai === 'Hủy' ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-600 hover:text-white'}`}
                                  title={item.trangThai === 'Hủy' ? "Tạo lại túi máu" : "Chỉnh sửa thông tin"}
                                >
                                  <span className="material-symbols-outlined text-sm">{item.trangThai === 'Hủy' ? 'add_circle' : 'edit'}</span>
                                </button>
                              )}
                              {item.trangThai === 'Chờ xét nghiệm' && (
                                <button
                                  onClick={() => {
                                    setConfirmData({
                                      open: true,
                                      title: 'Hủy túi máu',
                                      message: `Bạn có chắc chắn muốn hủy túi máu ${item.maTuiMau}? Túi máu này sẽ được đánh dấu là Hủy.`,
                                      loading: false,
                                      onConfirm: async () => {
                                        setConfirmData(p => ({ ...p, loading: true }));
                                        try {
                                          await handleUpdateStatus(item.maTuiMau, 'Hủy');
                                          setConfirmData(p => ({ ...p, open: false }));
                                        } catch (e) {
                                          showToast('Lỗi khi hủy túi máu', 'error');
                                        } finally {
                                          setConfirmData(p => ({ ...p, loading: false }));
                                        }
                                      }
                                    });
                                  }}
                                  className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                  title="Hủy túi máu"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
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
                      <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-400">Không có dữ liệu túi máu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner">
            <span className="material-symbols-outlined text-4xl font-bold">warning</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed px-2">{message}</p>
        </div>
        <div className="flex p-4 gap-3">
          <button 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm disabled:opacity-50 active:scale-95"
          >
            Bỏ qua
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};
