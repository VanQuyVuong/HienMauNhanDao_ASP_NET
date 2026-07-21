import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ketQuaXetNghiemService } from '../../services/khamLamSangService';
import Swal from 'sweetalert2';

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5 ${type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
      <span className="material-symbols-outlined">{type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'warning'}</span>
      <p className="font-semibold text-sm">{msg}</p>
      <button onClick={onClose} className="ml-4 hover:opacity-75"><span className="material-symbols-outlined text-sm">close</span></button>
    </div>
  );
};

export default function KetQuaXetNghiem() {
  const { nhanVien } = useOutletContext();
  const [toastInfo, setToastInfo] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editXN, setEditXN] = useState(null);
  const [xnForm, setXnForm] = useState({ nhomMau: '', soLanXetNghiem: '', moTa: '', ketQua: '' });
  const [xnSaving, setXnSaving] = useState(false);

  // Danh sách các yêu cầu xét nghiệm lại (số lần > 1 và chưa có kết quả)
  const reTestRequests = list.filter(xn => xn.soLanXetNghiem > 1 && (xn.ketQua === null || xn.ketQua === undefined));

  const showToast = (msg, type = 'success') => setToastInfo({ msg, type });

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await ketQuaXetNghiemService.getAll();
      const data = Array.isArray(res) ? res : (res?.data || []);
      setList(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách xét nghiệm:', err);
      showToast('Lỗi khi tải dữ liệu xét nghiệm', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleEditSave = async () => {
    // if (!xnForm.nhomMau) { showToast('Vui lòng chọn nhóm máu', 'error'); return; }
    // if (!xnForm.soLanXetNghiem) { showToast('Vui lòng nhập số lần xét nghiệm', 'error'); return; }
    setXnSaving(true);
    try {
      await ketQuaXetNghiemService.update(editXN.maKQ, {
        maNhanVien: nhanVien.maNV,
        nhomMau: xnForm.nhomMau,
        soLanXetNghiem: xnForm.soLanXetNghiem ? parseInt(xnForm.soLanXetNghiem) : null,
        moTa: xnForm.moTa,
        ketQua: xnForm.ketQua === 'true' ? true : xnForm.ketQua === 'false' ? false : null,
      });
      showToast('Đã cập nhật kết quả xét nghiệm!');
      setEditXN(null);
      fetchList();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Lỗi khi cập nhật', 'error');
    } finally {
      setXnSaving(false);
    }
  };

  const handleDeleteXetNghiem = async (xn) => {
    const result = await Swal.fire({
      title: 'Xóa kết quả xét nghiệm?',
      text: `Xóa kết quả xét nghiệm ${xn.maKQ} - Túi máu ${xn.maTuiMau}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#af101a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      await ketQuaXetNghiemService.delete(xn.maKQ);
      setList(prev => prev.filter(item => item.maKQ !== xn.maKQ));
      Swal.fire({ title: 'Đã xóa!', icon: 'success', confirmButtonColor: '#af101a', timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ title: 'Không thể xóa!', text: e.message || 'Lỗi khi xóa kết quả xét nghiệm', icon: 'error', confirmButtonColor: '#af101a' });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {toastInfo && <Toast msg={toastInfo.msg} type={toastInfo.type} onClose={() => setToastInfo(null)} />}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Kết quả xét nghiệm máu</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý và cập nhật kết quả xét nghiệm của các túi máu</p>
      </div>

      {/* BANNER CẢNH BÁO XÉT NGHIỆM LẠI CHO BÁC SĨ (Rich Aesthetics) */}
      {reTestRequests.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-400/40 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 animate-bounce">
              <span className="material-symbols-outlined text-2xl font-bold">notifications_active</span>
            </div>
            <div>
              <h4 className="font-extrabold text-amber-800 text-sm flex items-center gap-2">
                🚨 YÊU CẦU XÉT NGHIỆM LẠI KHẨN CẤP
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-ping absolute ml-2 opacity-75"></span>
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full relative">Mới</span>
              </h4>
              <p className="text-xs text-amber-700/90 mt-0.5 font-medium">
                Kho máu đang gửi yêu cầu kiểm tra lại chất lượng cho <strong>{reTestRequests.length} túi máu</strong> ({reTestRequests.map(x => x.maTuiMau).join(', ')}). Vui lòng ưu tiên tiến hành xét nghiệm lại!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">refresh</span>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">science</span>
            <p>Chưa có dữ liệu xét nghiệm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-2 px-4">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Mã XN</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Túi máu</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Mã bác sĩ</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Nhóm máu</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Số lần</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Kết quả</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase">Mô tả</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-600 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((xn, idx) => {
                  const isPending = xn.ketQua === null || xn.ketQua === undefined;
                  const isReTest = xn.soLanXetNghiem > 1 && isPending;
                  
                  let rowBg = '';
                  let borderStyle = '';
                  if (isReTest) {
                    rowBg = 'bg-amber-50/90 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/40';
                    borderStyle = 'border-l-[6px] border-l-amber-600';
                  } else if (isPending) {
                    rowBg = 'bg-yellow-50/50 border border-yellow-300/80 shadow-[0_0_12px_rgba(234,179,8,0.18)] ring-2 ring-yellow-300/30';
                    borderStyle = 'border-l-[6px] border-l-yellow-500';
                  } else {
                    rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
                    borderStyle = 'border-l-[6px] border-l-transparent';
                  }
                  
                  return (
                    <tr key={xn.maKQ} className={`rounded-xl overflow-hidden ${rowBg} ${borderStyle} transition-all duration-200`}>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700 rounded-l-xl">{xn.maKQ}</td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">{xn.maTuiMau}</td>
                      <td className="px-5 py-4 text-slate-700">{xn.maNhanVien || '---'}</td>
                      <td className="px-5 py-4">
                        {xn.nhomMau ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">{xn.nhomMau}</span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa có</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {xn.soLanXetNghiem ?? 1}
                        {isReTest ? (
                          <span className="ml-2 text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                            Yêu cầu check lại
                          </span>
                        ) : isPending ? (
                          <span className="ml-2 text-[10px] font-black text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-full">
                            Lần đầu
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        {isReTest ? (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full flex items-center gap-1 w-fit shadow-sm animate-bounce">
                            <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                            Xét nghiệm lại
                          </span>
                        ) : isPending ? (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-black rounded-full flex items-center gap-1 w-fit shadow-sm">
                            <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                            Chờ xét nghiệm
                          </span>
                        ) : xn.ketQua ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Đạt</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Không đạt</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-[200px] truncate">
                        {isReTest ? (
                          <span className="text-amber-800 font-semibold">{xn.moTa}</span>
                        ) : (
                          xn.moTa || <span className="text-xs text-slate-400 italic">---</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditXN(xn);
                              setXnForm({
                                nhomMau: xn.nhomMau || '',
                                soLanXetNghiem: xn.soLanXetNghiem != null ? String(xn.soLanXetNghiem) : '',
                                moTa: xn.moTa || '',
                                ketQua: xn.ketQua === true ? 'true' : xn.ketQua === false ? 'false' : '',
                              });
                            }}
                            className={`p-2 rounded-xl transition-colors ${
                              isReTest 
                                ? 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30' 
                                : 'hover:bg-slate-200 text-slate-500 hover:text-primary'
                            }`}
                            title="Cập nhật kết quả"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteXetNghiem(xn)}
                            className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Xóa kết quả xét nghiệm"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editXN && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditXN(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">biotech</span>
                  <h3 className="font-bold text-slate-800">Cập nhật xét nghiệm</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">{editXN.maKQ} · Túi máu {editXN.maTuiMau}</p>
              </div>
              <button onClick={() => setEditXN(null)} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Kết quả xét nghiệm</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="kq" value="true" checked={xnForm.ketQua === 'true'} onChange={e => setXnForm(p => ({ ...p, ketQua: e.target.value }))} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Đạt</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="kq" value="false" checked={xnForm.ketQua === 'false'} onChange={e => setXnForm(p => ({ ...p, ketQua: e.target.value }))} className="text-red-600" />
                    <span className="text-sm font-semibold text-red-700">Không đạt</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Nhóm máu</label>
                <select value={xnForm.nhomMau} onChange={e => setXnForm(p => ({ ...p, nhomMau: e.target.value }))} className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary">
                  <option value="">-- Chọn nhóm máu --</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(nm => (
                    <option key={nm} value={nm}>{nm}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Số lần xét nghiệm</label>
                <input type="number" min="1" value={xnForm.soLanXetNghiem} onChange={e => setXnForm(p => ({ ...p, soLanXetNghiem: e.target.value }))} className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary" placeholder="1" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Mô tả</label>
                <textarea value={xnForm.moTa} onChange={e => setXnForm(p => ({ ...p, moTa: e.target.value }))} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary resize-none" placeholder="Nhập mô tả..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setEditXN(null)} className="flex-1 h-11 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors">Hủy</button>
              <button disabled={xnSaving} onClick={handleEditSave} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-red-800 transition-colors disabled:opacity-50">
                {xnSaving ? 'Đang lưu...' : 'Lưu kết quả'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
