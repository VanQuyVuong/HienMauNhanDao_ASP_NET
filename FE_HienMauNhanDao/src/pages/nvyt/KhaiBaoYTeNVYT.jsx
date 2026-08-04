import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { khaiBaoYTeNvytService } from '../../services/nvytService';
import Swal from 'sweetalert2';

const QUESTIONS = [
  { id: 'dauHong',     text: '1. Bạn có đang cảm thấy mệt mỏi, sốt hoặc đau họng không?' },
  { id: 'khangSinh',  text: '2. Bạn có đang dùng thuốc kháng sinh hay điều trị bệnh nào không?' },
  { id: 'truyenNhiem',text: '3. Trong 6 tháng qua, bạn có mắc bệnh truyền nhiễm hay phẫu thuật không?' },
  { id: 'coThai',     text: '4. Đối với nữ: Bạn có đang trong kỳ kinh nguyệt, mang thai hoặc cho con bú?' },
];

const LABEL_MAP = {
  dauHong: 'Sốt/Đau họng',
  khangSinh: 'Đang dùng kháng sinh',
  truyenNhiem: 'Bệnh truyền nhiễm',
  coThai: 'Mang thai/Cho con bú',
};

// ─── Modal Sửa Hồ Sơ ─────────────────────────────────────────────────────────
function EditHoSoModal({ hoSo, onClose, onSaved }) {
  const [answers, setAnswers] = useState({
    dauHong: hoSo.dauHong || false,
    khangSinh: hoSo.khangSinh || false,
    truyenNhiem: hoSo.truyenNhiem || false,
    coThai: hoSo.coThai || false,
  });
  const [moTaKhac, setMoTaKhac] = useState(hoSo.moTaKhac || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await khaiBaoYTeNvytService.update(hoSo.maHoSo, {
        maDon: hoSo.maDon,
        ...answers,
        moTaKhac: moTaKhac || null,
      });
      onSaved();
    } catch (e) {
      setError(e.message || 'Lỗi khi cập nhật hồ sơ sức khỏe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            <h3 className="font-bold text-slate-800">Sửa khai báo y tế</h3>
          </div>
          <p className="text-xs text-slate-400 font-mono">{hoSo.maHoSo} · Đơn: {hoSo.maDon}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-500 text-xl">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>}
          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <p className="text-sm text-slate-700 pr-4 leading-relaxed">{q.text}</p>
                <div className="flex gap-5 shrink-0">
                  {[{ val: true, label: 'Có' }, { val: false, label: 'Không' }].map(opt => (
                    <label key={String(opt.val)} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio" name={`edit_${q.id}`}
                        checked={answers[q.id] === opt.val}
                        onChange={() => setAnswers(p => ({ ...p, [q.id]: opt.val }))}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-semibold text-slate-600">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Mô tả khác</label>
            <textarea
              value={moTaKhac} onChange={e => setMoTaKhac(e.target.value)}
              rows={3} placeholder="Ghi chú thêm về tình trạng sức khỏe..."
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="flex-1 h-11 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-white transition-colors">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-red-800 transition-colors disabled:opacity-60">
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Danh Sách Khai Báo Y Tế ─────────────────────────────────────────────
function DanhSachKhaiBao({ nhanVien }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editHoSo, setEditHoSo] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await khaiBaoYTeNvytService.getAll();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching hồ sơ sức khỏe:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleDelete = async (hoSo) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa hồ sơ?',
      text: `Xóa hồ sơ ${hoSo.maHoSo} của đơn ${hoSo.maDon}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#af101a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      await khaiBaoYTeNvytService.delete(hoSo.maHoSo);
      Swal.fire({ title: 'Đã xóa!', text: 'Hồ sơ sức khỏe đã được xóa.', icon: 'success', confirmButtonColor: '#af101a', timer: 1800, showConfirmButton: false });
      fetchList();
    } catch (e) {
      Swal.fire({ title: 'Lỗi!', text: e.message || 'Không thể xóa hồ sơ sức khỏe.', icon: 'error', confirmButtonColor: '#af101a' });
    }
  };

  const YN = (val) => val
    ? <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">Có</span>
    : <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">Không</span>;

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">fact_check</span>
          <p className="text-slate-500 font-medium">Chưa có hồ sơ khai báo y tế nào</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Mã hồ sơ', 'Mã đơn', 'Sốt/Đau họng', 'Kháng sinh', 'Truyền nhiễm', 'Thai sản', 'Mô tả', 'Thao tác'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((hs) => (
                  <tr key={hs.maHoSo} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-primary bg-red-50 px-2 py-1 rounded-lg">{hs.maHoSo}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{hs.maDon}</td>
                    <td className="px-4 py-3">{YN(hs.dauHong)}</td>
                    <td className="px-4 py-3">{YN(hs.khangSinh)}</td>
                    <td className="px-4 py-3">{YN(hs.truyenNhiem)}</td>
                    <td className="px-4 py-3">{YN(hs.coThai)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[160px] truncate">{hs.moTaKhac || '---'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditHoSo(hs)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center" title="Sửa">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDelete(hs)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center" title="Xóa">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editHoSo && (
        <EditHoSoModal
          hoSo={editHoSo}
          onClose={() => setEditHoSo(null)}
          onSaved={() => { setEditHoSo(null); fetchList(); Swal.fire({ title: 'Đã cập nhật!', icon: 'success', confirmButtonColor: '#af101a', timer: 1500, showConfirmButton: false }); }}
        />
      )}
    </div>
  );
}

// ─── Trang chính ─────────────────────────────────────────────────────────────
export default function KhaiBaoYTeNVYT() {
  const { nhanVien } = useOutletContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('khai-bao'); // 'khai-bao' | 'danh-sach'

  const [maDon, setMaDon] = useState('');
  const [inputMaDon, setInputMaDon] = useState('');
  const [answers, setAnswers] = useState({ dauHong: false, khangSinh: false, truyenNhiem: false, coThai: false });
  const [moTaKhac, setMoTaKhac] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lấy maDon từ localStorage nếu có (sau khi tạo đơn)
  useEffect(() => {
    const saved = localStorage.getItem('nvyt_maDon');
    if (saved) { setMaDon(saved); setInputMaDon(saved); checkExisting(saved); }
  }, []);

  const checkExisting = async (id) => {
    if (!id) return;
    setChecking(true);
    try {
      const rec = await khaiBaoYTeNvytService.getByMaDon(id);
      if (rec) {
        setExistingRecord(rec);
        setAnswers({
          dauHong: rec.dauHong || false,
          khangSinh: rec.khangSinh || false,
          truyenNhiem: rec.truyenNhiem || false,
          coThai: rec.coThai || false,
        });
        setMoTaKhac(rec.moTaKhac || '');
      } else {
        setExistingRecord(null);
      }
    } catch { setExistingRecord(null); }
    finally { setChecking(false); }
  };

  const handleLoadDon = () => {
    if (!inputMaDon.trim()) return;
    setMaDon(inputMaDon.trim());
    localStorage.setItem('nvyt_maDon', inputMaDon.trim());
    setError(''); setSuccess('');
    checkExisting(inputMaDon.trim());
  };

  const handleSubmit = async () => {
    if (!terms) { setError('Vui lòng xác nhận cam đoan thông tin'); return; }
    if (!maDon) { setError('Vui lòng nhập mã đơn đăng ký'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = { maDon, ...answers, moTaKhac: moTaKhac || null };
      await khaiBaoYTeNvytService.create(payload);
      setSuccess('Đã lưu khai báo y tế thành công!');
      localStorage.removeItem('nvyt_maDon');
      localStorage.removeItem('nvyt_maTNV');
      setTimeout(() => navigate('/nvyt/don-dang-ky'), 2000);
    } catch (e) { setError(e.message || 'Lỗi khi lưu khai báo y tế'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Ruby Blood Life Medical Declaration Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-6 md:p-8 text-white shadow-xl shadow-rose-600/15 border border-white/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black text-rose-50 border border-white/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              📋 TỜ KHAI Y TẾ & TIỀN SỬ SỨC KHỎE TNV
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Hồ Sơ Khai Báo Y Tế & Tiền Sử Sức Khỏe
            </h1>
            <p className="text-rose-100 text-xs md:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Lập tờ khai 5 câu hỏi y tế Bộ Y Tế, rà soát tiền sử sức khỏe & quản lý danh sách hồ sơ khai báo y tế tình nguyện viên
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-rose-100 bg-white p-2 rounded-2xl border shadow-2xs">
        <button
          onClick={() => setActiveTab('khai-bao')}
          className={`px-5 py-2.5 font-black text-xs transition-all rounded-xl flex items-center gap-2 ${
            activeTab === 'khai-bao'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          <span className="material-symbols-outlined text-lg">fact_check</span>
          Khai Báo Y Tế Mới
        </button>
        <button
          onClick={() => setActiveTab('danh-sach')}
          className={`px-5 py-2.5 font-black text-xs transition-all rounded-xl flex items-center gap-2 ${
            activeTab === 'danh-sach'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          <span className="material-symbols-outlined text-lg">list_alt</span>
          Danh Sách Hồ Sơ Đã Khai Báo
        </button>
      </div>

      {/* Tab: Khai báo y tế */}
      {activeTab === 'khai-bao' && (
        <>
          {/* Mã đơn */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
              Nhập mã đơn đăng ký
            </h3>
            <div className="flex gap-3">
              <input
                value={inputMaDon} onChange={e => setInputMaDon(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLoadDon()}
                placeholder="VD: DON-2024-001"
                className="flex-1 h-11 border border-slate-200 rounded-xl px-4 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button onClick={handleLoadDon} disabled={checking}
                className="h-11 px-6 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors disabled:opacity-60">
                {checking ? 'Đang tải...' : 'Xác nhận'}
              </button>
            </div>
            {maDon && (
              <div className={`mt-3 p-3 rounded-xl border text-sm font-medium flex items-center gap-2
                ${existingRecord ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                <span className="material-symbols-outlined text-base">{existingRecord ? 'info' : 'check_circle'}</span>
                {existingRecord ? 'Đã có khai báo y tế cho đơn này. Bạn có thể xem lại.' : `Đơn ${maDon} hợp lệ. Sẵn sàng khai báo.`}
              </div>
            )}
          </div>

          {/* Form khai báo */}
          {maDon && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Phiếu Khai Báo Y Tế & Sức Khỏe</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mã đơn: <span className="font-mono font-bold text-primary">{maDon}</span>
                    {nhanVien && <> &nbsp;|&nbsp; NV phụ trách: <span className="font-bold">{nhanVien.hoVaTen}</span></>}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Câu hỏi */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 py-2.5 border-l-4 border-primary pl-4 bg-slate-50 mb-3 rounded-r-lg">
                    Tình trạng sức khỏe hiện tại
                  </h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                    {QUESTIONS.map((q) => (
                      <div key={q.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <p className="text-sm text-slate-700 pr-4 leading-relaxed">{q.text}</p>
                        <div className="flex gap-5 shrink-0">
                          {[{ val: true, label: 'Có' }, { val: false, label: 'Không' }].map(opt => (
                            <label key={String(opt.val)} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio" name={q.id}
                                checked={answers[q.id] === opt.val}
                                onChange={() => setAnswers(p => ({ ...p, [q.id]: opt.val }))}
                                className="text-primary focus:ring-primary"
                              />
                              <span className="text-xs font-semibold text-slate-600">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mô tả khác */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary border-slate-300" />
                    <span className="text-sm text-slate-600 leading-relaxed">
                      Tôi cam đoan những thông tin trên là hoàn toàn đúng sự thật. Tình nguyện viên tự nguyện hiến máu và đã hiểu rõ các quyền lợi cũng như rủi ro có thể xảy ra.
                    </span>
                  </label>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mô tả khác</p>
                    <textarea
                      value={moTaKhac} onChange={e => setMoTaKhac(e.target.value)}
                      placeholder="Ghi chú thêm về tình trạng sức khỏe..."
                      rows={3}
                      className="w-full border border-slate-200 bg-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* Lỗi / Thành công */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>{error}
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>{success}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => navigate('/nvyt/don-dang-ky')}
                    className="flex-1 h-12 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    Quay lại
                  </button>
                  <button onClick={handleSubmit} disabled={loading || !!success}
                    className="flex-1 h-12 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang lưu...</>
                    ) : (
                      <><span className="material-symbols-outlined text-xl">save</span> Lưu khai báo y tế</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Danh sách khai báo y tế */}
      {activeTab === 'danh-sach' && <DanhSachKhaiBao nhanVien={nhanVien} />}
    </div>
  );
}
