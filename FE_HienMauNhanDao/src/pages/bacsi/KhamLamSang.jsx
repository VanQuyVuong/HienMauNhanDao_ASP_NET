import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { khamLamSangService, ketQuaXetNghiemService, thuNhanMauService } from '../../services/khamLamSangService';
import Swal from 'sweetalert2';

export default function KhamLamSang() {
  const { nhanVien } = useOutletContext();
  const location = useLocation();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const [pulsing, setPulsing] = useState(false);
  const [form, setForm] = useState({ huyetAp: '', nhipTim: '', canNang: '', nhietDo: '37.0', ketQua: '', lyDoTuChoi: '' });
  const [volumeSelect, setVolumeSelect] = useState('250');
  const [maTuiMau] = useState(`BB-DN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(6, '0')}`);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [screeningList, setScreeningList] = useState([]);
  const [stats, setStats] = useState({ tongSo: 0, datYeuCau: 0, khongDat: 0 });
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    huyetAp: '',
    nhipTim: '',
    canNang: '',
    nhietDo: '',
    ketQua: true,
    lyDoTuChoi: '',
  });
  const [editSaving, setEditSaving] = useState(false);



  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openEditModal = (item) => {
    setEditTarget(item);
    const laDat = item.ketQua !== false;
    setEditForm({
      huyetAp: item.huyetAp ?? '',
      nhipTim: item.nhipTim != null ? String(item.nhipTim) : '',
      canNang: item.canNang != null ? String(item.canNang) : '',
      nhietDo: item.nhietDo != null ? String(item.nhietDo) : '',
      ketQua: laDat,
      lyDoTuChoi: laDat ? '' : (item.lyDoTuChoi ?? ''),
    });
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditSaving(false);
  };

  const handleDeleteScreening = async (item) => {
    const result = await Swal.fire({
      title: 'Xóa kết quả khám?',
      text: `Xóa kết quả khám lâm sàng ${item.maKQ} - ${item.tenTinhNguyenVien || ''}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#af101a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      await khamLamSangService.delete(item.maKQ);
      setScreeningList(prev => prev.filter(s => s.maKQ !== item.maKQ));
      Swal.fire({ title: 'Đã xóa!', icon: 'success', confirmButtonColor: '#af101a', timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ title: 'Không thể xóa!', text: e.message || 'Lỗi khi xóa kết quả khám', icon: 'error', confirmButtonColor: '#af101a' });
    }
  };

  const handleEditSave = async () => {
    if (!editTarget?.maKQ) return;
    const nhipTim = parseInt(editForm.nhipTim, 10);
    const canNang = parseFloat(editForm.canNang);
    const nhietDo = parseFloat(editForm.nhietDo);
    if (Number.isNaN(nhipTim) || Number.isNaN(canNang) || Number.isNaN(nhietDo)) {
      showToast('Vui lòng nhập đủ nhịp tim, cân nặng, nhiệt độ (số hợp lệ)', 'error');
      return;
    }
    if (canNang < 40) {
      showToast('Cân nặng phải từ 40 kg trở lên (theo CSDL)', 'error');
      return;
    }
    if (!editForm.ketQua && !String(editForm.lyDoTuChoi || '').trim()) {
      showToast('Vui lòng nhập lý do khi chọn Không đạt', 'error');
      return;
    }
    setEditSaving(true);
    try {
      await khamLamSangService.update(editTarget.maKQ, {
        maNhanVien: nhanVien?.maNV || 'NV00001',
        huyetAp: editForm.huyetAp,
        nhipTim,
        canNang,
        nhietDo,
        ketQua: editForm.ketQua,
        lyDoTuChoi: editForm.ketQua ? '' : String(editForm.lyDoTuChoi || '').trim(),
      });
      showToast('Đã cập nhật kết quả khám');
      closeEditModal();
      fetchScreeningList();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Lỗi khi cập nhật';
      showToast(msg, 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const fetchScreeningList = async () => {
    try {
      setLoading(true);
      const [dataRes, statsRes] = await Promise.all([
        khamLamSangService.getAll(),
        khamLamSangService.getStats(),
      ]);
      setScreeningList(Array.isArray(dataRes) ? dataRes : (dataRes.data || []));
      setStats(statsRes.data || statsRes || { tongSo: 0, datYeuCau: 0, khongDat: 0 });
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showList) {
      fetchScreeningList();
    }
  }, [showList]);

  useEffect(() => {
    const ma = location.state?.maDon;
    if (ma && typeof ma === 'string') {
      setQrInput(ma.trim());
    }
  }, [location.state?.maDon]);

  const handleScanQR = async () => {
    if (!qrInput.trim()) { showToast('Vui lòng nhập mã QR / mã đơn', 'error'); return; }
    setPulsing(true);
    try {
      const res = await khamLamSangService.getWaiting();
      const list = Array.isArray(res) ? res : (res.data || []);
      const found = list.find(d => d.maDon === qrInput.trim());

      if (found) {
        setIsCheckedIn(true);
        setDonorInfo({
          hoVaTen: found.tenTinhNguyenVien,
          ngaySinh: found.ngaySinh || '---',
          gioiTinh: found.gioiTinh || '---',
          nhomMau: found.nhomMau || '---',
          soLanHienMau: 0,
          maDon: found.maDon,
        });
        showToast(`Check-in thành công: ${found.tenTinhNguyenVien}`, 'success');
      } else {
        showToast('Không tìm thấy đơn đăng ký hoặc người này chưa sẵn sàng khám', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi kết nối server', 'error');
    } finally {
      setPulsing(false);
    }
  };

  const getVolumeAllowed = (weight) => {
    const w = parseFloat(weight);
    if (!w || w < 42) return { allowed: [250], max: 0 };
    if (w < 45) return { allowed: [250], max: 250 };
    return { allowed: [250, 350, 450], max: 450 };
  };

  const handleWeightChange = (val) => {
    setForm(p => ({ ...p, canNang: val }));
    const w = parseFloat(val);
    if (!isNaN(w)) {
      if (w < 42) {
        setForm(p => ({ ...p, canNang: val, ketQua: 'khong_dat' }));
        showToast('Cảnh báo: Cân nặng dưới 42kg không đủ điều kiện hiến máu.', 'error');
      } else {
        setForm(p => ({ ...p, canNang: val, ketQua: 'dat' }));
        if (w < 45) {
          setVolumeSelect('250');
          showToast('Lưu ý: Tình nguyện viên dưới 45kg chỉ được hiến tối đa 250ml.', 'warning');
        }
      }
    }
  };

  const handleBPChange = (val) => {
    setForm(p => ({ ...p, huyetAp: val }));
    const systolic = parseInt(val.split('/')[0]);
    if (!isNaN(systolic) && (systolic > 160 || systolic < 90)) {
      showToast('Cảnh báo: Chỉ số huyết áp bất thường. Cần kiểm tra kỹ.', 'error');
    }
  };

  const handleSave = async () => {
    if (!isCheckedIn) { showToast('Vui lòng quét mã QR để check-in trước.', 'error'); return; }
    if (!form.ketQua) { showToast('Vui lòng chọn kết quả sàng lọc.', 'error'); return; }
    if (form.ketQua === 'khong_dat' && !String(form.lyDoTuChoi || '').trim()) {
      showToast('Vui lòng nhập lý do từ chối khi chọn Không đạt', 'error');
      return;
    }
    const cn = parseFloat(form.canNang);
    if (Number.isNaN(cn) || cn < 40) {
      showToast('Cân nặng phải từ 40 kg trở lên (theo CSDL)', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        maDon: donorInfo.maDon,
        maNhanVien: nhanVien?.maNV || 'NV00001',
        huyetAp: form.huyetAp,
        nhipTim: parseInt(form.nhipTim),
        canNang: parseFloat(form.canNang),
        nhietDo: parseFloat(form.nhietDo) || 37.0,
        ketQua: form.ketQua === 'dat',
        lyDoTuChoi: form.ketQua === 'dat' ? '' : String(form.lyDoTuChoi || '').trim(),
        theTichHien: parseInt(volumeSelect)
      };

      await khamLamSangService.save(payload);
      showToast('Hoàn tất! Đã lưu dữ liệu và ghi nhận túi máu vào hệ thống.', 'success');

      setIsCheckedIn(false);
      setDonorInfo(null);
      setForm({ huyetAp: '120/80', nhipTim: '75', canNang: '65', nhietDo: '37.0', ketQua: '', lyDoTuChoi: '' });
      setQrInput('');

      if (showList) fetchScreeningList();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi lưu dữ liệu lên server', 'error');
    } finally {
      setSaving(false);
    }
  };

  const volInfo = getVolumeAllowed(form.canNang);

  const BLOOD_TYPES = [
    { label: 'A+', fill: '75%' }, { label: 'A-', fill: '25%' },
    { label: 'B+', fill: '50%' }, { label: 'B-', fill: '66%' },
    { label: 'O+', fill: '100%' }, { label: 'O-', fill: '20%' },
    { label: 'AB+', fill: '33%' }, { label: 'AB-', fill: '5%' },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-2 transition-all
          ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'warning' ? 'bg-amber-500' : toast.type === 'info' ? 'bg-blue-600' : 'bg-green-600'}`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : toast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Khám sàng lọc & Thu nhận máu</h1>
          <p className="text-slate-500 mt-1 text-sm">Cập nhật chỉ số y tế và mã túi máu cho tình nguyện viên</p>
        </div>
        <div className="text-right text-sm text-slate-400 font-mono">
          {donorInfo?.maDon ? `ID PHIÊN: ${donorInfo.maDon}` : 'ID PHIÊN: ---'}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setShowList(false)}
          className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${!showList
              ? 'text-primary border-b-primary'
              : 'text-slate-600 border-b-transparent hover:text-slate-800'
            }`}
        >
          <span className="material-symbols-outlined mr-1 inline" style={{ fontSize: '18px' }}>
            clinical_notes
          </span>
          Nhập dữ liệu
        </button>
        <button
          onClick={() => setShowList(true)}
          className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${showList
              ? 'text-primary border-b-primary'
              : 'text-slate-600 border-b-transparent hover:text-slate-800'
            }`}
        >
          <span className="material-symbols-outlined mr-1 inline" style={{ fontSize: '18px' }}>
            list_alt
          </span>
          Danh sách ({stats.tongSo})
        </button>
      </div>

      {showList ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-500">Tổng số</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{stats.tongSo}</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-500">Đạt yêu cầu</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.datYeuCau}</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-green-300">check_circle</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-500">Không đạt</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.khongDat}</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-red-300">cancel</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-slate-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Mã khám</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tên TNV</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Chiến dịch</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Huyết áp</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nhịp tim</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Cân nặng</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nhiệt độ</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Kết quả</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Bác sĩ</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Ghi chú</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screeningList.length > 0 ? (
                      screeningList.map((item, idx) => (
                        <tr key={item.maKQ} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}>
                          <td className="px-6 py-4 font-semibold text-slate-700">{item.maKQ}</td>
                          <td className="px-6 py-4 text-slate-700">{item.tenTinhNguyenVien}</td>
                          <td className="px-6 py-4 text-slate-600">{item.tenChienDich}</td>
                          <td className="px-6 py-4 text-slate-600">{item.huyetAp}</td>
                          <td className="px-6 py-4 text-slate-600">{item.nhipTim} bpm</td>
                          <td className="px-6 py-4 text-slate-600">{item.canNang} kg</td>
                          <td className="px-6 py-4 text-slate-600">{item.nhietDo}°C</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.ketQua ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.ketQua ? 'Đạt' : 'Không đạt'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-700">{item.tenBacSi || '---'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.maBacSi || ''}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{item.lyDoTuChoi || '---'}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                title="Sửa"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteScreening(item)}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
                          Không có dữ liệu khám lâm sàng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {editTarget && (
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={closeEditModal}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-800">Sửa kết quả khám lâm sàng</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {editTarget.maKQ}
                      {editTarget.maDon ? ` · ${editTarget.maDon}` : ''}
                      {editTarget.tenTinhNguyenVien ? ` · ${editTarget.tenTinhNguyenVien}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="w-9 h-9 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Huyết áp</label>
                      <input
                        value={editForm.huyetAp}
                        onChange={(e) => setEditForm((p) => ({ ...p, huyetAp: e.target.value }))}
                        className="mt-1 w-full h-10 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:border-primary"
                        placeholder="120/80"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Nhịp tim (bpm)</label>
                      <input
                        type="number"
                        value={editForm.nhipTim}
                        onChange={(e) => setEditForm((p) => ({ ...p, nhipTim: e.target.value }))}
                        className="mt-1 w-full h-10 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Cân nặng (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.canNang}
                        onChange={(e) => setEditForm((p) => ({ ...p, canNang: e.target.value }))}
                        className="mt-1 w-full h-10 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600">Nhiệt độ (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.nhietDo}
                        onChange={(e) => setEditForm((p) => ({ ...p, nhietDo: e.target.value }))}
                        className="mt-1 w-full h-10 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Kết quả</label>
                    <div className="mt-2 flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="editKetQua"
                          checked={editForm.ketQua === true}
                          onChange={() => setEditForm((p) => ({ ...p, ketQua: true, lyDoTuChoi: '' }))}
                          className="text-primary"
                        />
                        <span className="text-sm text-slate-700">Đạt</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="editKetQua"
                          checked={editForm.ketQua === false}
                          onChange={() => setEditForm((p) => ({ ...p, ketQua: false }))}
                          className="text-primary"
                        />
                        <span className="text-sm text-slate-700">Không đạt</span>
                      </label>
                    </div>
                  </div>
                  {!editForm.ketQua && (
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Lý do từ chối / không đạt</label>
                      <textarea
                        value={editForm.lyDoTuChoi}
                        onChange={(e) => setEditForm((p) => ({ ...p, lyDoTuChoi: e.target.value }))}
                        rows={3}
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                        placeholder="Bắt buộc khi chọn Không đạt..."
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 h-11 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={editSaving}
                    onClick={handleEditSave}
                    className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-red-800 transition-colors disabled:opacity-50"
                  >
                    {editSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 bg-white border border-slate-200 rounded-2xl p-6 h-[320px] flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 text-primary relative">
              {pulsing && <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping" />}
              <span className="material-symbols-outlined text-4xl relative z-10">qr_code_scanner</span>
            </div>
            <h4 className="font-bold text-slate-800 mb-2">Quét mã QR / Mã đơn</h4>
            <p className="text-sm text-slate-500 px-4 mb-4">Nhập mã đơn đăng ký hoặc quét QR để check-in và bắt đầu quy trình khám</p>
            <div className="w-full space-y-2">
              <input value={qrInput} onChange={e => setQrInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScanQR()}
                placeholder="Nhập mã đơn..."
                className={`w-full h-10 border rounded-xl px-4 text-sm text-center font-mono outline-none focus:ring-2 transition-all
                ${isCheckedIn ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-200 focus:border-primary focus:ring-primary/10'}`}
              />
              <button onClick={handleScanQR}
                className={`w-full h-12 border-2 border-dashed rounded-xl flex items-center justify-center font-bold text-sm transition-all
                ${isCheckedIn
                    ? 'border-green-300 bg-green-50 text-green-600'
                    : 'border-red-200 bg-red-50 hover:bg-red-100 text-primary'
                  }`}>
                <span className="material-symbols-outlined mr-2">barcode_scanner</span>
                {isCheckedIn ? 'CHECK-IN THÀNH CÔNG' : 'BẮT ĐẦU QUÉT MÃ QR'}
              </button>
            </div>
          </div>

          <div className="col-span-8 bg-white border border-slate-200 rounded-2xl p-6 h-[320px] flex flex-col shadow-sm">
            <div className="w-full border-b border-slate-100 pb-4 mb-6 flex justify-between items-center shrink-0">
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Thông tin đối tượng</span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${isCheckedIn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {isCheckedIn ? 'Đã check-in' : 'Sẵn sàng'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-8 flex-1">
              <div className="space-y-6">
                <div className="h-12 flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Họ và tên</label>
                  <p className="text-slate-700 font-medium">{donorInfo?.hoVaTen || '---'}</p>
                </div>
                <div className="h-12 flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Ngày sinh / Giới tính</label>
                  <p className="text-slate-700 font-medium">{donorInfo ? `${donorInfo.ngaySinh} / ${donorInfo.gioiTinh}` : '---'}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-12 flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Nhóm máu dự kiến</label>
                  <p className={`font-medium ${donorInfo ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                    {donorInfo?.nhomMau || 'Chờ quét mã...'}
                  </p>
                </div>
                <div className="h-12 flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Số lần hiến máu</label>
                  <p className="text-slate-700 font-medium">{donorInfo?.soLanHienMau ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-7 bg-white border border-slate-200 rounded-2xl p-8 min-h-[440px] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">clinical_notes</span>
                <h4 className="font-bold text-slate-800">Thông số sàng lọc</h4>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Bác sĩ:</span>
                <span className="text-[11px] font-mono font-bold text-primary">{nhanVien?.maNV || '---'}</span>
              </div>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: 'Huyết áp (mmHg)', key: 'huyetAp', placeholder: '120/80', type: 'text', onChange: handleBPChange },
                  { label: 'Nhịp tim (bpm)', key: 'nhipTim', placeholder: '75', type: 'number', onChange: v => setForm(p => ({ ...p, nhipTim: v })) },
                  { label: 'Cân nặng (kg)', key: 'canNang', placeholder: '65', type: 'number', onChange: handleWeightChange },
                  { label: 'Nhiệt độ (°C)', key: 'nhietDo', placeholder: '37.0', type: 'number', onChange: v => setForm(p => ({ ...p, nhietDo: v })) },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-600">{f.label}</label>
                    <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                      onChange={e => f.onChange(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 transition-shadow px-4 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <label className="text-sm font-semibold text-slate-600">Kết quả sàng lọc</label>
                <div className="flex gap-4 h-16">
                  {[
                    { val: 'dat', label: 'Đạt yêu cầu', icon: 'check_circle', color: 'text-green-600' },
                    { val: 'khong_dat', label: 'Không đạt', icon: 'cancel', color: 'text-red-600' },
                  ].map(opt => (
                    <label key={opt.val}
                      className="w-full flex items-center px-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                      <input type="radio" name="ketQua" value={opt.val}
                        checked={form.ketQua === opt.val}
                        onChange={() => setForm(p => ({
                          ...p,
                          ketQua: opt.val,
                          lyDoTuChoi: opt.val === 'dat' ? '' : p.lyDoTuChoi,
                        }))}
                        className="w-5 h-5 text-primary focus:ring-primary/20 border-slate-300"
                      />
                      <span className="ml-3 text-slate-700 font-medium">{opt.label}</span>
                      <span className={`material-symbols-outlined ml-auto opacity-0 group-hover:opacity-100 ${opt.color}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                    </label>
                  ))}
                </div>
                {form.ketQua === 'khong_dat' && (
                  <div className="mt-2">
                    <label className="text-sm font-semibold text-slate-600">Lý do từ chối / không đạt</label>
                    <textarea
                      value={form.lyDoTuChoi}
                      onChange={(e) => setForm((p) => ({ ...p, lyDoTuChoi: e.target.value }))}
                      rows={3}
                      placeholder="Nhập lý do cụ thể..."
                      className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-5 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-primary">vaccines</span>
              <h4 className="font-bold text-slate-800">Thu nhận máu</h4>
            </div>
            <div className="space-y-8 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-600">Thể tích hiến máu</label>
                <select value={volumeSelect} onChange={e => setVolumeSelect(e.target.value)}
                  className="w-full h-11 bg-white border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 px-4 outline-none">
                  <option value="250" disabled={!volInfo.allowed.includes(250)}>250 ml</option>
                  <option value="350" disabled={!volInfo.allowed.includes(350)}>350 ml</option>
                  <option value="450" disabled={!volInfo.allowed.includes(450)}>450 ml</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-600">Mã vạch túi máu</label>
                <div className="relative w-full h-11">
                  <input readOnly value={maTuiMau}
                    className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 cursor-not-allowed px-4 pr-12 outline-none text-sm"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">barcode</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">Mã túi máu được hệ thống tự động khởi tạo</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 shrink-0">
              <button onClick={handleSave} disabled={saving}
                className="w-full h-14 bg-primary hover:bg-red-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
                <span className="material-symbols-outlined">save</span>
                LƯU DỮ LIỆU
              </button>
              <button onClick={() => { if (confirm('Bạn có chắc muốn xóa các dữ liệu đang nhập?')) { setIsCheckedIn(false); setDonorInfo(null); setForm({ huyetAp: '', nhipTim: '', canNang: '', nhietDo: '37.0', ketQua: '', lyDoTuChoi: '' }); setQrInput(''); } }}
                className="w-full h-11 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                LÀM MỚI BIỂU MẪU
              </button>
            </div>
          </div>

          <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-6 h-[180px] flex flex-col shadow-sm">
            <div className="w-full flex justify-between items-center mb-6">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Tình trạng lưu trữ tại điểm hiến máu</h4>
              <span className="text-xs text-primary font-bold">28 túi thu nhận hôm nay</span>
            </div>
            <div className="w-full grid grid-cols-8 gap-4 flex-1">
              {BLOOD_TYPES.map(bt => (
                <div key={bt.label} className="flex flex-col gap-2">
                  <div className="w-full h-16 bg-slate-100 rounded-lg relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full bg-primary opacity-80" style={{ height: bt.fill }} />
                  </div>
                  <p className={`text-center text-xs font-bold ${bt.fill === '5%' ? 'text-slate-400' : 'text-slate-600'}`}>{bt.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
