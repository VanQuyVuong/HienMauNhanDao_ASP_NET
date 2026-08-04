import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ketQuaXetNghiemService } from '../../services/khamLamSangService';
import Swal from 'sweetalert2';

// ─── Modal Cập Nhật Kết Quả Xét Nghiệm (Phân Hệ NVXN) ──────────────────
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
                 <p style="font-size: 13px; color: ${finalKetQua ? '#059669' : '#dc2626'}; font-weight: 800; margin-bottom: 10px;">
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
    { key: 'hbv', label: 'HBV', desc: 'Viêm gan siêu vi B' },
    { key: 'hcv', label: 'HCV', desc: 'Viêm gan siêu vi C' },
    { key: 'hiv', label: 'HIV', desc: 'Kháng thể HIV 1/2' },
    { key: 'giangMai', label: 'Giang Mai', desc: 'XN Syphilis Treponema' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${
          isReTest ? 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white' : 'bg-gradient-to-r from-slate-900 to-rose-950 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
              isReTest ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'
            }`}>
              <span className="material-symbols-outlined text-2xl">{isReTest ? 'replay' : 'biotech'}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {isReTest ? '🚨 Cập Nhật Xét Nghiệm Lần 2 (Re-test Kho)' : 'Cập Nhật Kết Quả Xét Nghiệm Vi Sinh'}
              </h3>
              <p className="text-xs text-slate-300 font-medium">Mã túi máu: <span className="font-mono font-black text-rose-400">{item.maTuiMau}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-400 uppercase">Tình Nguyện Viên:</span>
              <span className="font-extrabold text-slate-800 text-sm">{item.tenTinhNguyenVien || 'Ẩn danh'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase">Đợt Hiến Máu:</span>
              <span className="font-bold text-slate-600">{item.tenChienDich || 'Hiến Thường Xuyên'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400 uppercase">Nhóm Máu Đã Xác Định:</span>
              <select
                value={form.nhomMau}
                onChange={e => setForm(p => ({ ...p, nhomMau: e.target.value }))}
                className="h-8 border border-red-200 bg-red-50 text-red-700 font-black text-xs rounded-xl px-3 outline-none focus:border-red-500 cursor-pointer"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive 4 Pathogen Switches */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Kiểm Tra Sàng Lọc Vi Sinh (4 Bệnh Máu)</span>
              <span className="text-[10px] font-bold text-slate-400">Gạt sang phải nếu Âm tính (Đạt)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PATHOGENS.map(p => {
                const isPositive = form[p.key]; // true = bệnh (Dương tính), false = sạch (Âm tính)
                return (
                  <div
                    key={p.key}
                    onClick={() => handleToggleDisease(p.key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isPositive
                        ? 'bg-red-50 border-red-300 text-red-900 shadow-sm'
                        : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                    }`}
                  >
                    <div>
                      <p className="font-black text-xs">{p.label}</p>
                      <p className="text-[10px] opacity-75">{p.desc}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase ${
                      isPositive ? 'bg-red-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
                    }`}>
                      {isPositive ? 'DƯƠNG TÍNH ❌' : 'ÂM TÍNH ✅'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Auto Evaluation Banner */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            form.ketQua
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <p className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">Kết Quả Đánh Giá Tự Động</p>
            <p className="text-base font-black mt-0.5">
              {form.ketQua ? '✅ PHÊ DUYỆT: ĐẠT TIÊU CHUẨN KHO' : '❌ KHÔNG ĐẠT: MẪU MÁU BỊ NHIỄM BỆNH (HỦY)'}
            </p>
            <p className="text-[11px] mt-1 opacity-75">
              {form.ketQua
                ? 'Túi máu an toàn vi sinh. Khi phê duyệt sẽ gửi yêu cầu nhập kho sang cho Quản Lý Kho.'
                : 'Mẫu máu có chỉ số vi sinh dương tính. Khi bấm xác nhận túi máu sẽ đánh dấu là Đã Hủy.'}
            </p>
          </div>

          {/* Note input */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <label className="text-xs font-extrabold uppercase text-slate-700 block mb-1.5">Ghi Chú Chi Tiết Xét Nghiệm</label>
            <textarea
              rows={2}
              value={form.moTa}
              onChange={e => setForm(p => ({ ...p, moTa: e.target.value }))}
              placeholder="Nhập ghi chú chi tiết..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-red-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
          <button onClick={onClose} disabled={loading} className="px-4 h-11 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-4 h-11 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95"
              title="Đánh giá không đạt - Hủy túi máu"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              <span>❌ Không Đạt (Hủy)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-emerald-100 active:scale-95"
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

// ─── Trang Chính Cập Nhật Xét Nghiệm (NVXN) ─────────────────────────────────────────
export default function CapNhatXetNghiem() {
  const { nhanVien } = useOutletContext();
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
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-red-900 p-6 md:p-8 text-white shadow-xl shadow-red-950/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-rose-200 border border-white/10 mb-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              🔬 PHÒNG XÉT NGHIỆM VI SINH & BẢO QUẢN KHO
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Cập Nhật Kết Quả Xét Nghiệm & Quản Lý Kho</h1>
            <p className="text-rose-100/80 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              Kiểm tra vi sinh phẩm túi máu (HBV, HCV, HIV, Syphilis), đánh giá chất lượng & xử lý Re-test với Quản lý kho
            </p>
          </div>
        </div>
      </div>

      {/* 4 KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-blue-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-slate-400">Tổng Ca Chờ XN</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{stats.tongSo}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">biotech</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-slate-400">Đạt Tiêu Chuẩn</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.datYeuCau}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-rose-50/40 border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-slate-400">Không Đạt (Hủy)</p>
            <p className="text-3xl font-black text-rose-600 mt-1">{stats.khongDat}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">dangerous</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50/60 to-indigo-50/60 border border-purple-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase text-purple-700">Re-Test Kho Máu</p>
            <p className="text-3xl font-black text-purple-900 mt-1">{stats.reTestCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl animate-pulse">replay</span>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã túi máu, tên tình nguyện viên, đợt hiến..."
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs outline-none focus:border-red-500 transition-colors font-medium"
          />
        </div>

        <select
          value={bloodFilter}
          onChange={e => setBloodFilter(e.target.value)}
          className="h-11 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none bg-slate-50 focus:border-red-500 cursor-pointer"
        >
          <option value="ALL">Tất cả nhóm máu</option>
          <option value="A">Nhóm A</option>
          <option value="B">Nhóm B</option>
          <option value="O">Nhóm O</option>
          <option value="AB">Nhóm AB</option>
        </select>
      </div>

      {/* Testing Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200">
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
                  <tr key={item.maTuiMau} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-extrabold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 shadow-2xs">
                        {item.maTuiMau}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{item.tenTinhNguyenVien}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.tenChienDich}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 bg-red-600 text-white font-black text-xs rounded-xl shadow-sm shadow-red-200">
                        {item.nhomMau || 'Chưa rõ'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                        Lần {item.soLanXetNghiem || 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isPending ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-200 flex items-center gap-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          ⏳ Chờ XN vi sinh
                        </span>
                      ) : isPassed ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">✅ Đạt Tiêu Chuẩn</span>
                      ) : (
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 font-extrabold text-xs rounded-full border border-rose-200">❌ Không Đạt (Hủy)</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600 max-w-xs truncate">
                      {isReTestReq ? (
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-black text-xs rounded-xl border border-purple-200 flex items-center gap-1 w-fit animate-pulse">
                          <span className="material-symbols-outlined text-sm">replay</span>
                          Yêu cầu Re-test lần 2
                        </span>
                      ) : (
                        item.moTa || 'Đang chờ xét nghiệm'
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setModalItem({ item, isReTest: isReTestReq })}
                        className={`h-9 px-4 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap ${
                          isReTestReq ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{isReTestReq ? 'replay' : 'biotech'}</span>
                        <span>{isReTestReq ? 'Xét Nghiệm Lại Lần 2' : '🧪 Nhập Kết Quả XN'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cập nhật / Re-test */}
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
