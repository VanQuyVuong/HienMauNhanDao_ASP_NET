import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ketQuaXetNghiemService } from '../../services/khamLamSangService';
import Swal from 'sweetalert2';

// ─── Issue #67: Trang Cập Nhật Kết Quả Xét Nghiệm & Re-test Kho Máu (NVYT Xét Nghiệm) ───
// ─── Modal Cập Nhật Kết Quả Xét Nghiệm (Lần 1 & Re-test Lần 2) ──────────────────
function XetNghiemModal({ item, nhanVien, isReTest, onClose, onSaved }) {
  const [form, setForm] = useState({
    maTuiMau: item?.maTuiMau || '',
    nhomMau: item?.nhomMau || 'O+',
    soLanXetNghiem: isReTest ? 2 : (item?.soLanXetNghiem || 1),
    hbv: false, // false = âm tính (đạt), true = dương tính (bệnh)
    hcv: false,
    hiv: false,
    giangMai: false,
    ketQua: item?.ketQua !== false, // true = đạt, false = không đạt
    moTa: item?.moTa || (isReTest ? 'Thực hiện xét nghiệm lại lần 2 theo yêu cầu từ Quản Lý Kho.' : 'Đã xét nghiệm vi sinh phẩm máu đầy đủ.'),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleDisease = (key) => {
    setForm(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // Nếu có bất kỳ bệnh nào dương tính -> Tự động đánh giá Không Đạt
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
        title: finalKetQua ? '✅ ĐÃ PHÊ DUYỆT XÉT NGHIỆM!' : '❌ ĐÃ ĐÁNH GIÁ KHÔNG ĐẠT (HỦY)!',
        html: `<div style="text-align: center;">
                 <p style="font-size: 14px; color: #475569; margin-bottom: 8px;">Mã túi máu: <b style="font-family: monospace; color: #dc2626;">${form.maTuiMau}</b> (Nhóm: <b>${form.nhomMau}</b>)</p>
                 <p style="font-size: 13px; color: ${finalKetQua ? '#059669' : '#dc2626'}; font-weight: 700; margin-bottom: 10px;">
                   ${finalKetQua ? '✅ Đã phê duyệt ĐẠT TIÊU CHUẨN. Trạng thái chuyển thành: CHỜ NHẬP KHO' : '❌ Đã đánh giá KHÔNG ĐẠT. Trạng thái chuyển thành: ĐÃ HỦY'}
                 </p>
                 <span style="font-size: 12px; color: #64748b;">Thông tin túi máu đã biến mất khỏi Trang 2 và chuyển về <b>Trang Thu Nhận Máu (Tab 2: Túi máu hoàn tất xét nghiệm)</b>.</span>
               </div>`,
        icon: finalKetQua ? 'success' : 'error',
        confirmButtonColor: finalKetQua ? '#059669' : '#dc2626',
        confirmButtonText: 'Đồng ý'
      });

      onSaved();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu kết quả xét nghiệm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${isReTest ? 'bg-gradient-to-r from-purple-50 to-white' : 'bg-gradient-to-r from-rose-50 to-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isReTest ? 'bg-purple-100 text-purple-600' : 'bg-primary/10 text-primary'}`}>
              <span className="material-symbols-outlined text-2xl">{isReTest ? 'replay' : 'biotech'}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                {isReTest ? '🚨 Cập Nhật Xét Nghiệm Lần 2 (Re-test Kho)' : 'Cập Nhật Kết Quả Xét Nghiệm'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Mã túi máu: <span className="font-mono font-bold text-primary">{item.maTuiMau}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">{error}</div>
          )}

          {/* Thông tin túi máu & người hiến */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Tình nguyện viên:</span>
              <span className="text-xs font-extrabold text-slate-800">{item.tenTinhNguyenVien || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Đợt hiến / Cơ sở:</span>
              <span className="text-xs font-bold text-slate-600">{item.tenChienDich || 'Hiến Thường Xuyên'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Số lần xét nghiệm:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-black rounded-md">Lần {form.soLanXetNghiem}</span>
            </div>
          </div>

          {/* Chọn Nhóm máu chính thức */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Xác Nhận Nhóm Máu ABO / Rh *</label>
            <select
              value={form.nhomMau}
              onChange={e => setForm(p => ({ ...p, nhomMau: e.target.value }))}
              className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-bold text-primary outline-none focus:border-primary"
            >
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                <option key={type} value={type}>Nhóm máu {type}</option>
              ))}
            </select>
          </div>

          {/* Kiểm tra 4 chỉ số bệnh truyền nhiễm */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-extrabold text-slate-700 block">Xét Nghiệm Vi Sinh Phẩm Máu (Bộ Y Tế):</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'hbv', name: 'HBV (Viêm gan B)' },
                { key: 'hcv', name: 'HCV (Viêm gan C)' },
                { key: 'hiv', name: 'HIV 1/2' },
                { key: 'giangMai', name: 'Giang Mai (Syphilis)' },
              ].map(dis => (
                <button
                  key={dis.key}
                  type="button"
                  onClick={() => handleToggleDisease(dis.key)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    form[dis.key] ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-slate-200 bg-white text-slate-700 font-medium hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs">{dis.name}</span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${form[dis.key] ? 'bg-red-200 text-red-800' : 'bg-emerald-100 text-emerald-700'}`}>
                    {form[dis.key] ? 'Dương (+)' : 'Âm (-)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Đánh giá kết quả */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Đánh Giá Chất Lượng Túi Máu *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, ketQua: true }))}
                className={`h-11 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border ${
                  form.ketQua ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ✅ ĐẠT TIÊU CHUẨN
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, ketQua: false }))}
                className={`h-11 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border ${
                  !form.ketQua ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ❌ KHÔNG ĐẠT (HỦY)
              </button>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Ghi chú xét nghiệm / Re-test</label>
            <textarea
              rows={2}
              value={form.moTa}
              onChange={e => setForm(p => ({ ...p, moTa: e.target.value }))}
              placeholder="Nhập chi tiết xét nghiệm..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <button onClick={onClose} disabled={loading} className="px-4 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
            Đóng
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-4 h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all"
              title="Đánh giá không đạt - Hủy túi máu"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              <span>❌ Không Đạt (Hủy)</span>
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 transition-all shadow-md shadow-emerald-100"
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

// ─── Trang Chính Cập Nhật Xét Nghiệm ─────────────────────────────────────────
export default function CapNhatXetNghiem() {
  const { nhanVien } = useOutletContext();
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ tongSo: 0, datYeuCau: 0, khongDat: 0, reTestCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState(null); // { item, isReTest }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, resStats] = await Promise.all([
        ketQuaXetNghiemService.getDanhSach(),
        ketQuaXetNghiemService.getStats()
      ]);

      const items = Array.isArray(resData) ? resData : (resData?.data || []);
      setList(items);

      // Thống kê số ca Re-test từ kho
      const reTests = items.filter(i => String(i.moTa || '').toLowerCase().includes('re-test') || String(i.moTa || '').toLowerCase().includes('kiểm tra lại'));
      setStats({
        tongSo: resStats?.tongSo || items.length,
        datYeuCau: resStats?.datYeuCau || items.filter(i => i.ketQua === true).length,
        khongDat: resStats?.khongDat || items.filter(i => i.ketQua === false).length,
        reTestCount: reTests.length
      });
    } catch (e) {
      console.error('Error load xet nghiem:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredList = list.filter(item => {
    if (!search.trim()) return true;
    const kw = search.toLowerCase().trim();
    const maTui = String(item.maTuiMau || '').toLowerCase();
    const tnv = String(item.tenTinhNguyenVien || '').toLowerCase();
    const cd = String(item.tenChienDich || '').toLowerCase();
    return maTui.includes(kw) || tnv.includes(kw) || cd.includes(kw);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cập Nhật Kết Quả Xét Nghiệm & Quản Lý Kho</h1>
          <p className="text-slate-500 mt-1 text-sm">Xét nghiệm vi sinh phẩm túi máu, đánh giá chất lượng & xử lý Re-test với Quản lý kho</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">biotech</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Tổng Ca XN</p>
            <p className="text-xl font-extrabold text-slate-800">{stats.tongSo}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Đạt Tiêu Chuẩn</p>
            <p className="text-xl font-extrabold text-emerald-600">{stats.datYeuCau}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">cancel</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Không Đạt (Hủy)</p>
            <p className="text-xl font-extrabold text-red-600">{stats.khongDat}</p>
          </div>
        </div>

        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 bg-purple-50/40">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">replay</span>
          </div>
          <div>
            <p className="text-xs font-bold text-purple-600 uppercase">Re-test Kho Máu</p>
            <p className="text-xl font-extrabold text-purple-800">{stats.reTestCount}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã túi máu, tên TNV, đợt hiến..."
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400">Mã Túi Máu</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400">Tình Nguyện Viên</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400">Nhóm Máu</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400">Số Lần XN</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400">Đánh Giá XN</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400">Ghi Chú / Trạng Thái Kho</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">Đang tải danh sách xét nghiệm...</td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">Chưa có dữ liệu xét nghiệm nào</td></tr>
              ) : filteredList.map(item => {
                const isReTestReq = String(item.moTa || '').toLowerCase().includes('re-test') || String(item.moTa || '').toLowerCase().includes('kiểm tra lại');
                const isPending = item.ketQua === null;
                const isPassed = item.ketQua === true;

                return (
                  <tr key={item.maTuiMau} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-extrabold text-primary bg-red-50 px-2.5 py-1 rounded-lg">
                        {item.maTuiMau}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {item.tenTinhNguyenVien}
                      <span className="block text-xs font-normal text-slate-400 mt-0.5">{item.tenChienDich}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 font-black text-xs rounded-lg">
                        {item.nhomMau || 'Chưa rõ'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                        Lần {item.soLanXetNghiem || 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {isPending ? (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Chờ XN lần đầu</span>
                      ) : isPassed ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">✅ Đạt Tiêu Chuẩn</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">❌ Không Đạt (Hủy)</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {isReTestReq ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 font-extrabold rounded-lg flex items-center gap-1 w-fit animate-pulse">
                          <span className="material-symbols-outlined text-sm">replay</span>
                          Yêu cầu Re-test lần 2
                        </span>
                      ) : (
                        item.moTa || 'Đã xét nghiệm'
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalItem({ item, isReTest: isReTestReq })}
                          className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 whitespace-nowrap ${
                            isReTestReq ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-red-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">{isReTestReq ? 'replay' : 'biotech'}</span>
                          <span>{isReTestReq ? 'Xét Nghiệm Lại Lần 2' : 'Cập Nhật XN'}</span>
                        </button>
                      </div>
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
          onSaved={() => { setModalItem(null); loadData(); }}
        />
      )}
    </div>
  );
}
