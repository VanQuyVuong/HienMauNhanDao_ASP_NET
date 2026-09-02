import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ketQuaXetNghiemService } from '../../services/khamLamSangService';
import Swal from 'sweetalert2';

// ─── Modal Diagnostic Panel Cập Nhật Kết Quả Xét Nghiệm (Cyber Clinical Theme) ───
function XetNghiemModal({ item, nhanVien, isReTest, onClose, onSaved }) {
  const [form, setForm] = useState({
    maTuiMau: item?.maTuiMau || '',
    nhomMau: item?.nhomMau || 'O+',
    soLanXetNghiem: isReTest ? 2 : (item?.soLanXetNghiem || 1),
    hbv: false,      // false = âm tính (đạt), true = dương tính (bệnh)
    hcv: false,
    hiv: false,
    giangMai: false,
    ketQua: item?.ketQua !== false, // true = đạt, false = không đạt
    moTa: item?.moTa || (isReTest ? 'Thực hiện xét nghiệm lại lần 2 theo yêu cầu từ Quản Lý Kho.' : 'Đã xét nghiệm vi sinh phẩm máu đầy đủ (Âm tính 4 bệnh).'),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleDisease = (key) => {
    setForm(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      const hasDisease = updated.hbv || updated.hcv || updated.hiv || updated.giangMai;
      return {
        ...updated,
        ketQua: !hasDisease
      };
    });
  };

  const handleSubmit = async (overrideKetQua = null) => {
    setLoading(true); setError('');
    const finalKetQua = overrideKetQua !== null ? overrideKetQua : form.ketQua;
    try {
      const payload = {
        maTuiMau: form.maTuiMau,
        maNhanVien: nhanVien?.maNV || localStorage.getItem('maNV') || '',
        nhomMau: form.nhomMau,
        soLanXetNghiem: parseInt(form.soLanXetNghiem) || 1,
        ketQua: finalKetQua,
        moTa: `${form.moTa} | HBV: ${form.hbv ? 'dương tính' : 'âm tính'}, HCV: ${form.hcv ? 'dương tính' : 'âm tính'}, HIV: ${form.hiv ? 'dương tính' : 'âm tính'}, Giang Mai: ${form.giangMai ? 'dương tính' : 'âm tính'}`
      };

      await ketQuaXetNghiemService.save(payload);

      await Swal.fire({
        title: finalKetQua ? '✅ ĐÃ PHÊ DUYỆT XÉT NGHIỆM!' : '❌ ĐÁNH GIÁ KHÔNG ĐẠT (HỦY)!',
        html: `<div style="text-align: center;">
                 <p style="font-size: 14px; color: #475569; margin-bottom: 8px;">Mã túi máu: <b style="font-family: monospace; color: #dc2626;">${form.maTuiMau}</b> (Nhóm: <b>${form.nhomMau}</b>)</p>
                 <p style="font-size: 13px; color: ${finalKetQua ? '#059669' : '#dc2626'}; font-weight: 900; margin-bottom: 10px;">
                   ${finalKetQua ? '✅ Đã phê duyệt ĐẠT TIÊU CHUẨN. Trạng thái chuyển thành: CHỜ NHẬP KHO' : '❌ Đã đánh giá KHÔNG ĐẠT. Trạng thái chuyển thành: ĐÃ HỦY'}
                 </p>
                 <span style="font-size: 12px; color: #64748b;">Thông tin túi máu đã rời khỏi Trang 2 và chuyển về <b>Trang Thu Nhận Máu (Tab 2: Túi máu hoàn tất xét nghiệm)</b>.</span>
               </div>`,
        icon: finalKetQua ? 'success' : 'error',
        confirmButtonColor: finalKetQua ? '#059669' : '#dc2626',
        confirmButtonText: 'Đồng Ý'
      });

      onSaved();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu kết quả xét nghiệm');
    } finally {
      setLoading(false);
    }
  };

  const PATHOGENS = [
    { key: 'hbv', label: 'HBV', desc: 'Viêm gan siêu vi B (HBsAg)' },
    { key: 'hcv', label: 'HCV', desc: 'Viêm gan siêu vi C (Anti-HCV)' },
    { key: 'hiv', label: 'HIV', desc: 'Kháng thể HIV 1/2 Ab/Ag' },
    { key: 'giangMai', label: 'Giang Mai', desc: 'Syphilis Treponema Ab' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-lg p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-[32px] shadow-2xl shadow-rose-950/50 w-full max-w-xl border border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between border-b border-white/10 ${
          isReTest ? 'bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900' : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-rose-950'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner border border-white/20 ${
              isReTest ? 'bg-purple-500/20 text-purple-200' : 'bg-rose-500/20 text-rose-300'
            }`}>
              <span className="material-symbols-outlined text-2xl">{isReTest ? 'replay' : 'biotech'}</span>
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight text-white">
                {isReTest ? '🚨 Cập Nhật Xét Nghiệm Lần 2 (Re-test Kho)' : 'Đánh Giá Vi Sinh Túi Máu'}
              </h3>
              <p className="text-xs text-slate-300 font-medium">Mã định danh: <span className="font-mono font-black text-rose-400">{item.maTuiMau}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-90">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-900/40">
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-rose-400">warning</span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
              <span className="font-bold text-slate-400 uppercase">Tình Nguyện Viên:</span>
              <span className="font-extrabold text-white text-sm">{item.tenTinhNguyenVien || 'Ẩn danh'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase">Đợt Hiến Máu:</span>
              <span className="font-extrabold text-slate-300">{item.tenChienDich || 'Hiến Thường Xuyên'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase">Nhóm Máu Xác Định:</span>
              <select
                value={form.nhomMau}
                onChange={e => setForm(p => ({ ...p, nhomMau: e.target.value }))}
                className="h-9 border border-rose-500/40 bg-rose-950/60 text-white font-black text-xs rounded-xl px-3.5 outline-none focus:border-rose-400 cursor-pointer"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                  <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive 4 Pathogen Diagnostic Switches */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
              <span className="text-xs font-black uppercase text-slate-300 tracking-wider">Bảng Kiểm Tra Sàng Lọc 4 Bệnh Máu</span>
              <span className="text-[10px] font-bold text-cyan-400">Click chọn gạt đổi Âm Tính / Dương Tính</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PATHOGENS.map(p => {
                const isPositive = form[p.key]; // true = bệnh (Dương tính), false = sạch (Âm tính)
                return (
                  <div
                    key={p.key}
                    onClick={() => handleToggleDisease(p.key)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isPositive
                        ? 'bg-rose-950/60 border-rose-500/80 text-rose-100 shadow-lg shadow-rose-950/40 scale-[1.02]'
                        : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100 hover:bg-emerald-950/60'
                    }`}
                  >
                    <div>
                      <p className="font-black text-sm">{p.label}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{p.desc}</p>
                    </div>

                    <div className="flex justify-end">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        isPositive ? 'bg-rose-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md'
                      }`}>
                        {isPositive ? 'DƯƠNG TÍNH ❌' : 'ÂM TÍNH ✅'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Auto Evaluation Panel */}
          <div className={`p-4.5 rounded-2xl border text-center transition-all ${
            form.ketQua
              ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200 shadow-lg shadow-emerald-950/30'
              : 'bg-rose-950/60 border-rose-500/70 text-rose-200 shadow-lg shadow-rose-950/30 animate-pulse'
          }`}>
            <p className="text-[11px] font-black uppercase tracking-widest opacity-80">Kết Quả Đánh Giá Tự Động</p>
            <p className="text-base font-black mt-1">
              {form.ketQua ? '✅ PHÊ DUYỆT: ĐẠT TIÊU CHUẨN KHO MÁU' : '❌ KHÔNG ĐẠT: MẪU MÁU BỊ NHIỄM BỆNH (HỦY)'}
            </p>
            <p className="text-[11px] mt-1 opacity-80 font-medium">
              {form.ketQua
                ? 'Túi máu an toàn vi sinh 100%. Khi duyệt sẽ chuyển trạng thái Yêu Cầu Nhập Kho gửi Quản Lý Kho.'
                : 'Phát hiện chỉ số vi sinh dương tính. Khi bấm xác nhận sẽ đánh dấu là Đã Hủy túi máu.'}
            </p>
          </div>

          {/* Note Area */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
            <label className="text-xs font-black uppercase text-slate-300 block mb-1.5 tracking-wider">Ghi Chú Chi Tiết Xét Nghiệm</label>
            <textarea
              rows={2}
              value={form.moTa}
              onChange={e => setForm(p => ({ ...p, moTa: e.target.value }))}
              placeholder="Nhập chi tiết xét nghiệm..."
              className="w-full border border-slate-700 rounded-xl p-3 text-xs outline-none focus:border-cyan-500 bg-slate-900/80 text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 h-11 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95">
            Đóng
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-4 h-11 bg-rose-950/80 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-600/50 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-rose-950/50"
              title="Đánh giá không đạt - Hủy túi máu"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              <span>❌ Không Đạt (Hủy)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
              title="Phê duyệt đạt tiêu chuẩn - Chuyển chờ nhập kho"
            >
              <span className="material-symbols-outlined text-base">task_alt</span>
              <span>✅ Phê Duyệt (Đạt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trang Chính Cập Nhật Xét Nghiệm (Cyber-Clinical Redesign) ──────────────────────
export default function CapNhatXetNghiem() {
  const { nhanVien } = useOutletContext() || {};

  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ tongSo: 0, datYeuCau: 0, khongDat: 0, reTestCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [modalItem, setModalItem] = useState(null); // { item, isReTest }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const resData = await ketQuaXetNghiemService.getDanhSach();
      let resStats = null;
      try {
        resStats = await ketQuaXetNghiemService.getStats();
      } catch (errStats) {
        console.warn('Stats load warning:', errStats);
      }

      const items = Array.isArray(resData) ? resData : (resData?.data || resData?.content || []);
      setList(items);

      const reTests = items.filter(i => String(i.moTa || '').toLowerCase().includes('re-test') || String(i.moTa || '').toLowerCase().includes('kiểm tra lại'));
      setStats({
        tongSo: resStats?.tongSo || items.length,
        datYeuCau: resStats?.datYeuCau || items.filter(i => i.ketQua === true).length,
        khongDat: resStats?.khongDat || items.filter(i => i.ketQua === false).length,
        reTestCount: reTests.length
      });
    } catch (e) {
      console.error('Error load xet nghiem:', e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredList = list.filter(item => {
    const kw = search.toLowerCase().trim();
    const maTui = String(item.maTuiMau || '').toLowerCase();
    const tnv = String(item.tenTinhNguyenVien || '').toLowerCase();
    const cd = String(item.tenChienDich || '').toLowerCase();
    const matchesSearch = !kw || maTui.includes(kw) || tnv.includes(kw) || cd.includes(kw);
    const matchesBlood = bloodFilter === 'ALL' || String(item.nhomMau || '').includes(bloodFilter);
    return matchesSearch && matchesBlood;
  });

  return (
    <div className="space-y-6">
      {/* Bright Crimson & Rose Medical Hero Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 md:p-8 text-white shadow-xl shadow-rose-600/15 border border-white/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black text-rose-50 border border-white/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              🔬 PHÒNG XÉT NGHIỆM VI SINH & BẢO QUẢN KHO
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Cập Nhật Kết Quả Xét Nghiệm & Quản Lý Kho
            </h1>
            <p className="text-rose-100 text-xs md:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Kiểm tra sàng lọc vi sinh phẩm túi máu (HBV, HCV, HIV, Syphilis), đánh giá chất lượng & xử lý Re-test với Quản lý kho
            </p>
          </div>
        </div>
      </div>

      {/* 4 Holographic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Tổng Ca Chờ XN</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.tongSo}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">biotech</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Đạt Tiêu Chuẩn</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.datYeuCau}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-slate-50/50 to-rose-50/30 border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Không Đạt (Hủy)</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{stats.khongDat}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">dangerous</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-white border border-purple-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase text-purple-700 tracking-wider">Re-Test Kho Máu</p>
            <p className="text-3xl font-black text-purple-900 mt-1">{stats.reTestCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl animate-pulse">replay</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search Bar & Blood Type Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã túi máu, tên tình nguyện viên, đợt hiến..."
            className="w-full h-11 bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 text-xs outline-none focus:border-rose-500 transition-colors font-medium"
          />
        </div>

        <select
          value={bloodFilter}
          onChange={e => setBloodFilter(e.target.value)}
          className="h-11 border border-slate-200/80 rounded-xl px-4 text-xs font-extrabold text-slate-700 outline-none bg-slate-50 focus:border-rose-500 cursor-pointer shadow-2xs"
        >
          <option value="ALL">Tất cả nhóm máu</option>
          <option value="A">Nhóm A</option>
          <option value="B">Nhóm B</option>
          <option value="O">Nhóm O</option>
          <option value="AB">Nhóm AB</option>
        </select>
      </div>

      {/* Testing Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200">
                {['Mã Túi Máu', 'Tình Nguyện Viên', 'Nhóm Máu', 'Số Lần XN', 'Đánh Giá XN', 'Ghi Chú / Trạng Thái Kho', 'Thao Tác'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Đang tải danh sách xét nghiệm...</td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-bold">Hiện không có túi máu nào chờ xét nghiệm ở Trang 2.</td></tr>
              ) : filteredList.map(item => {
                const isReTestReq = String(item.moTa || '').toLowerCase().includes('re-test') || String(item.moTa || '').toLowerCase().includes('kiểm tra lại');
                const isPending = item.ketQua === null;
                const isPassed = item.ketQua === true;

                return (
                  <tr key={item.maTuiMau} className="border-b border-slate-100 hover:bg-rose-50/20 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 shadow-2xs">
                        {item.maTuiMau}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-slate-800 text-sm">{item.tenTinhNguyenVien}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.tenChienDich}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs rounded-xl shadow-sm shadow-rose-200">
                        {item.nhomMau || 'Chưa rõ'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-lg border border-slate-200">
                        Lần {item.soLanXetNghiem || 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {item.isReTest || isReTestReq ? (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 font-black text-xs rounded-full border border-purple-200 flex items-center gap-1.5 w-fit animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                          🚨 Đang chờ kiểm tra lại
                        </span>
                      ) : isPending ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 font-black text-xs rounded-full border border-amber-200 flex items-center gap-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          ⏳ Chờ kết quả xét nghiệm
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-cyan-50 text-cyan-700 font-black text-xs rounded-full border border-cyan-200 font-extrabold flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-sm">inventory_2</span>
                          ⌛ Chờ nhập kho
                        </span>
                      )}

                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600 max-w-xs truncate">
                      {item.moTa || 'Đang chờ xét nghiệm vi sinh'}
                    </td>
                    <td className="px-5 py-4">
                      {(item.isReTest || isReTestReq || isPending) && (
                        <button
                          onClick={() => setModalItem({ item, isReTest: item.isReTest || isReTestReq })}
                          className={`h-9 px-4 rounded-xl text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap ${
                            item.isReTest || isReTestReq 
                              ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' 
                              : 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-rose-500/25'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {item.isReTest || isReTestReq ? 'replay' : 'biotech'}
                          </span>
                          <span>
                            {item.isReTest || isReTestReq 
                              ? `🔄 Re-test Lần ${item.soLanXetNghiem || 2}` 
                              : '🧪 Nhập Kết Quả XN'}
                          </span>
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Diagnostic Panel */}
      {modalItem && (
        <XetNghiemModal
          item={modalItem.item}
          isReTest={modalItem.isReTest}
          nhanVien={nhanVien}
          onClose={() => setModalItem(null)}
          onSaved={() => {
            setModalItem(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
