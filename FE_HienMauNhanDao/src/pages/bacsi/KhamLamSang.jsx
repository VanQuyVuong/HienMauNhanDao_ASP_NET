import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { khamLamSangService } from '../../services/khamLamSangService';
import { donDangKyNvytService } from '../../services/nvytService';
import Swal from 'sweetalert2';

export default function KhamLamSang() {
  const { nhanVien } = useOutletContext();
  const location = useLocation();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const [pulsing, setPulsing] = useState(false);
  
  // 4 Vitals State
  const [form, setForm] = useState({ 
    huyetAp: '120/80', 
    nhipTim: '75', 
    canNang: '60', 
    nhietDo: '36.8', 
    ketQua: '', 
    lyDoTuChoi: '' 
  });

  const [volumeSelect, setVolumeSelect] = useState('350');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Screening History List Tab
  const [screeningList, setScreeningList] = useState([]);
  const [stats, setStats] = useState({ tongSo: 0, datYeuCau: 0, khongDat: 0 });
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  // Edit Modal State
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

  useEffect(() => {
    const stateData = location.state?.donData;
    const ma = location.state?.maDon;
    if (stateData) {
      setIsCheckedIn(true);
      setDonorInfo({
        hoVaTen: stateData.tenTinhNguyenVien || stateData.hoTen || 'TNV Hiến Máu',
        ngaySinh: stateData.ngaySinh || '---',
        gioiTinh: stateData.gioiTinh || '---',
        nhomMau: stateData.nhomMau || 'Chưa rõ',
        soLanHienMau: 0,
        maDon: stateData.maDon,
        tenChienDich: stateData.tenChienDich || 'Hiến máu thường xuyên',
        cccd: stateData.cccd || '---'
      });
      setQrInput(stateData.maDon);
    } else if (ma && typeof ma === 'string') {
      setQrInput(ma.trim());
    }
  }, [location.state]);

  const handleScanQR = async () => {
    if (!qrInput.trim()) { showToast('Vui lòng nhập mã QR / mã đơn', 'error'); return; }
    setPulsing(true);
    try {
      const code = qrInput.trim();
      const res = await khamLamSangService.getWaiting();
      const list = Array.isArray(res) ? res : (res?.data || []);
      let found = list.find(d => d.maDon && d.maDon.toLowerCase() === code.toLowerCase());

      if (!found) {
        try {
          const detailRes = await donDangKyNvytService.getAll(0, 100, code);
          const contentList = detailRes?.content || [];
          const matched = contentList.find(d => d.maDon && d.maDon.toLowerCase() === code.toLowerCase());
          if (matched) {
            found = {
              maDon: matched.maDon,
              tenTinhNguyenVien: matched.tinhNguyenVien?.hoTen || matched.tinhNguyenVien?.hoVaTen || 'Tình nguyện viên',
              ngaySinh: matched.tinhNguyenVien?.ngaySinh ? String(matched.tinhNguyenVien.ngaySinh) : '---',
              gioiTinh: matched.tinhNguyenVien?.gioiTinh || '---',
              nhomMau: matched.tinhNguyenVien?.nhomMau || 'Chưa rõ',
              cccd: matched.tinhNguyenVien?.soCCCD || matched.tinhNguyenVien?.cccd || '---'
            };
          }
        } catch (e) {
          console.log('Fallback query detail failed:', e);
        }
      }

      if (found) {
        setIsCheckedIn(true);
        setDonorInfo({
          hoVaTen: found.tenTinhNguyenVien,
          ngaySinh: found.ngaySinh || '---',
          gioiTinh: found.gioiTinh || '---',
          nhomMau: found.nhomMau || 'Chưa rõ',
          soLanHienMau: 0,
          maDon: found.maDon,
          cccd: found.cccd || '---'
        });
        showToast(`Check-in thành công: ${found.tenTinhNguyenVien}`, 'success');
      } else {
        showToast('Không tìm thấy đơn đăng ký này!', 'warning');
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

  const handleSave = async (overrideKetQua = null) => {
    if (!isCheckedIn) { showToast('Vui lòng nhập/quét mã đơn để gọi TNV trước.', 'error'); return; }
    
    const finalKetQuaStr = overrideKetQua !== null ? (overrideKetQua ? 'dat' : 'khong_dat') : form.ketQua;
    if (!finalKetQuaStr) { showToast('Vui lòng chọn kết quả sàng lọc.', 'error'); return; }
    
    if (finalKetQuaStr === 'khong_dat' && !String(form.lyDoTuChoi || '').trim()) {
      showToast('Vui lòng nhập lý do từ chối khi đánh giá Không Đạt', 'error');
      return;
    }
    
    const cn = parseFloat(form.canNang);
    if (Number.isNaN(cn) || cn < 40) {
      showToast('Cân nặng phải từ 40 kg trở lên (theo CSDL)', 'error');
      return;
    }

    setSaving(true);
    try {
      const isApproved = finalKetQuaStr === 'dat';
      const payload = {
        maDon: donorInfo.maDon,
        maNhanVien: nhanVien?.maNV || 'NV00001',
        huyetAp: form.huyetAp,
        nhipTim: parseInt(form.nhipTim) || 75,
        canNang: parseFloat(form.canNang) || 60,
        nhietDo: parseFloat(form.nhietDo) || 36.8,
        ketQua: isApproved,
        lyDoTuChoi: isApproved ? '' : String(form.lyDoTuChoi || '').trim(),
        theTichHien: parseInt(volumeSelect) || 350
      };

      await khamLamSangService.save(payload);

      await Swal.fire({
        title: isApproved ? '✅ ĐÃ PHÊ DUYỆT ĐỦ ĐIỀU KIỆN HIẾN MÁU!' : '❌ ĐÃ TỪ CHỐI HIẾN MÁU!',
        html: `<div style="text-align: center;">
                 <p style="font-size: 14px; color: #475569; margin-bottom: 8px;">Tình nguyện viên: <b>${donorInfo.hoVaTen}</b> (Mã đơn: <b style="font-family: monospace; color: #0d9488;">${donorInfo.maDon}</b>)</p>
                 <p style="font-size: 13px; color: ${isApproved ? '#059669' : '#dc2626'}; font-weight: 900; margin-bottom: 10px;">
                   ${isApproved ? '✅ Đủ điều kiện sức khỏe. Đã chuyển thông tin sang Trang 1 Thu Nhận & Sinh Mã Barcode Túi Máu!' : '❌ Từ chối hiến máu do không đủ tiêu chuẩn sức khỏe.'}
                 </p>
               </div>`,
        icon: isApproved ? 'success' : 'warning',
        confirmButtonColor: isApproved ? '#0d9488' : '#dc2626',
        confirmButtonText: 'Đồng Ý'
      });

      setIsCheckedIn(false);
      setDonorInfo(null);
      setForm({ huyetAp: '120/80', nhipTim: '75', canNang: '60', nhietDo: '36.8', ketQua: '', lyDoTuChoi: '' });
      setQrInput('');

      if (showList) fetchScreeningList();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi lưu dữ liệu khám lên server', 'error');
    } finally {
      setSaving(false);
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
    if (showList) fetchScreeningList();
  }, [showList]);

  // Vitals Auto Validator Check
  const isVitalsNormal = form.huyetAp && form.nhipTim && form.canNang && form.nhietDo &&
    parseFloat(form.canNang) >= 45 &&
    parseInt(form.nhipTim) >= 60 && parseInt(form.nhipTim) <= 100 &&
    parseFloat(form.nhietDo) >= 36.0 && parseFloat(form.nhietDo) <= 37.5;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl text-white text-xs font-black flex items-center gap-2.5 transition-all animate-bounce
          ${toast.type === 'error' ? 'bg-rose-600' : toast.type === 'warning' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'task_alt'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Hero Doctor Workstation Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 p-6 md:p-8 text-white shadow-2xl shadow-teal-950/40 border border-slate-800">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-lg rounded-full text-[11px] font-extrabold text-teal-300 border border-white/15 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              🩺 BÁC SĨ CHUYÊN KHOA KHÁM LÂM SÀNG
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
              Trạm Đo Sinh Hiệu & Phê Duyệt Sức Khỏe Hiến Máu
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Nhập 4 chỉ số sinh hiệu y tế, đánh giá điều kiện thể trạng TNV & chuyển đơn đủ điều kiện sang phòng thu nhận túi máu
            </p>
          </div>

          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setShowList(false)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                !showList
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">medical_services</span>
              <span>🩺 Nhập Sinh Hiệu Mới</span>
            </button>

            <button
              onClick={() => setShowList(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                showList
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">history</span>
              <span>📋 Lịch Sử Khám Lần Trước</span>
            </button>
          </div>
        </div>
      </div>

      {!showList ? (
        /* Workstation 2-Column Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Donor Scan & Info Card - 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Call Donor Scanner */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                🔍 Gọi Hồ Sơ Tình Nguyện Viên (Mã Đơn / QR Code)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">qr_code_scanner</span>
                  <input
                    value={qrInput}
                    onChange={e => setQrInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleScanQR()}
                    placeholder="Nhập mã đơn (VD: DK00001)..."
                    className="w-full h-11 bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-3 text-xs outline-none focus:border-teal-500 font-mono font-bold"
                  />
                </div>
                <button
                  onClick={handleScanQR}
                  disabled={pulsing}
                  className="h-11 px-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-teal-500/20 active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-lg">{pulsing ? 'sync' : 'search'}</span>
                  <span>{pulsing ? 'Đang Gọi...' : 'Gọi Đơn'}</span>
                </button>
              </div>
            </div>

            {/* Donor Dossier Detail Card */}
            {isCheckedIn && donorInfo ? (
              <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
                <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
                      {donorInfo.hoVaTen.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white">{donorInfo.hoVaTen}</h3>
                      <p className="text-xs text-teal-400 font-mono font-bold">Mã đơn: {donorInfo.maDon}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs rounded-xl shadow-sm">
                    {donorInfo.nhomMau}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Căn Cước CD:</span>
                    <span className="font-extrabold text-white">{donorInfo.cccd || '---'}</span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Giới Tính / Ngày Sinh:</span>
                    <span className="font-extrabold text-white">{donorInfo.gioiTinh} | {donorInfo.ngaySinh}</span>
                  </div>
                </div>

                {/* Volume Selector */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <label className="text-xs font-black uppercase text-slate-300 block tracking-wider">
                    Dự Kiến Thể Tích Lấy Máu (ml)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[250, 350, 450].map(vol => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setVolumeSelect(String(vol))}
                        className={`h-10 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1 ${
                          volumeSelect === String(vol)
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-500 shadow-md shadow-teal-500/30 scale-[1.02]'
                            : 'bg-slate-900/60 text-slate-400 border-slate-700/80 hover:bg-slate-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">water_drop</span>
                        <span>{vol} ml</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400 font-bold space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-300">person_search</span>
                <p className="text-xs">Vui lòng nhập mã đơn hoặc chọn TNV từ danh sách chờ ở Trang 1 để tiến hành khám.</p>
              </div>
            )}
          </div>

          {/* Right Column (4 Vitals Measurement & Approval Panel - 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-lg">ecg</span>
                  Đo 4 Chỉ Số Sinh Hiệu Y Tế Thực Tế
                </h3>
                <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Chuẩn Bộ Y Tế
                </span>
              </div>

              {/* 4 Vitals Measurement Card Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Vital 1: Huyết áp */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 hover:border-teal-500/50 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-rose-600 text-base">blood_pressure</span>
                      1. Huyết Áp (mmHg) *
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Chuẩn: 90 - 140</span>
                  </div>
                  <input
                    value={form.huyetAp}
                    onChange={e => handleBPChange(e.target.value)}
                    placeholder="VD: 120/80"
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-black text-slate-900 outline-none focus:border-teal-500"
                  />
                </div>

                {/* Vital 2: Nhịp tim */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 hover:border-teal-500/50 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-red-600 text-base animate-pulse">favorite</span>
                      2. Nhịp Tim (lần/phút) *
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Chuẩn: 60 - 100</span>
                  </div>
                  <input
                    type="number"
                    value={form.nhipTim}
                    onChange={e => setForm(p => ({ ...p, nhipTim: e.target.value }))}
                    placeholder="VD: 75"
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-black text-slate-900 outline-none focus:border-teal-500"
                  />
                </div>

                {/* Vital 3: Cân nặng */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 hover:border-teal-500/50 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-base">monitor_weight</span>
                      3. Cân Nặng (kg) *
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Chuẩn: &gt;= 45 kg</span>
                  </div>
                  <input
                    type="number" step="0.5"
                    value={form.canNang}
                    onChange={e => handleWeightChange(e.target.value)}
                    placeholder="VD: 60"
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-black text-slate-900 outline-none focus:border-teal-500"
                  />
                </div>

                {/* Vital 4: Nhiệt độ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 hover:border-teal-500/50 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-orange-600 text-base">thermostat</span>
                      4. Nhiệt Độ (°C) *
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Chuẩn: 36.5 - 37.5</span>
                  </div>
                  <input
                    type="number" step="0.1"
                    value={form.nhietDo}
                    onChange={e => setForm(p => ({ ...p, nhietDo: e.target.value }))}
                    placeholder="VD: 36.8"
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-black text-slate-900 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Automated Vitals Realtime Assessment Panel */}
              <div className={`p-4 rounded-2xl border text-center transition-all ${
                isVitalsNormal
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}>
                <p className="text-[11px] font-black uppercase tracking-wider opacity-80">Đánh Giá Sinh Hiệu Tự Động</p>
                <p className="text-sm font-black mt-0.5">
                  {isVitalsNormal ? '✅ CÁC CHỈ SỐ SINH HIỆU BÌNH THƯỜNG - ĐỦ ĐIỀU KIỆN SỨC KHỎE' : '⚠️ CẦN BÁC SĨ KIỂM TRA LẠI CHỈ SỐ SINH HIỆU'}
                </p>
              </div>

              {/* Refusal Reason Input (Only shown if refusal) */}
              {form.ketQua === 'khong_dat' && (
                <div className="space-y-1.5 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                  <label className="text-xs font-black text-rose-800 block uppercase">Lý Do Từ Chối Hiến Máu *</label>
                  <textarea
                    rows={2}
                    value={form.lyDoTuChoi}
                    onChange={e => setForm(p => ({ ...p, lyDoTuChoi: e.target.value }))}
                    placeholder="Nhập lý do chi tiết..."
                    className="w-full border border-rose-300 rounded-xl p-3 text-xs outline-none focus:border-rose-500 bg-white"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(p => ({ ...p, ketQua: 'khong_dat' }));
                    handleSave(false);
                  }}
                  disabled={saving || !isCheckedIn}
                  className="h-12 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">cancel</span>
                  <span>❌ Từ Chối Hiến Máu</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm(p => ({ ...p, ketQua: 'dat' }));
                    handleSave(true);
                  }}
                  disabled={saving || !isCheckedIn}
                  className="h-12 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 active:scale-95"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">task_alt</span>
                      <span>✅ Đủ Điều Kiện Hiến Máu</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Lịch Sử Kết Quả Khám Đã Thực Hiện */
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-lg">history</span>
              Lịch Sử Đánh Giá Sức Khỏe Lâm Sàng Đã Thực Hiện
            </h3>
            <span className="text-xs font-bold text-slate-500">Tổng số: {stats.tongSo || screeningList.length} ca</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200">
                  {['Mã KQ / Mã Đơn', 'Tình Nguyện Viên', 'Huyết Áp', 'Nhịp Tim', 'Cân Nặng', 'Nhiệt Độ', 'Kết Quả Khám'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Đang tải lịch sử khám...</td></tr>
                ) : screeningList.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Chưa có lịch sử khám lâm sàng nào.</td></tr>
                ) : screeningList.map(item => (
                  <tr key={item.maKQ} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200">
                        {item.maKQ}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.maDon}</p>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-800">{item.tenTinhNguyenVien || '---'}</td>
                    <td className="px-5 py-4 font-black text-slate-800">{item.huyetAp || '---'}</td>
                    <td className="px-5 py-4 font-black text-slate-800">{item.nhipTim || '---'} bpm</td>
                    <td className="px-5 py-4 font-black text-slate-800">{item.canNang || '---'} kg</td>
                    <td className="px-5 py-4 font-black text-slate-800">{item.nhietDo || '---'} °C</td>
                    <td className="px-5 py-4">
                      {item.ketQua !== false ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-black text-xs rounded-full border border-emerald-200">✅ Đủ Điều Kiện</span>
                      ) : (
                        <span className="px-3 py-1 bg-rose-50 text-rose-800 font-black text-xs rounded-full border border-rose-200">❌ Từ Chối</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
