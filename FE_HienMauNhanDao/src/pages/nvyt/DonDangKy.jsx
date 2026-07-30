import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { donDangKyNvytService, tnvNvytService} from '../../services/nvytService';
import { phuongXaService } from '../../services/phuongXaService';
import { chienDichService } from '../../services/chienDichService';
import Swal from 'sweetalert2';

const PAGE_SIZE = 10;

// ─── Modal Tạo/Sửa đơn ───────────────────────────────────────────────────────
function DonModal({ mode, don, nhanVien, onClose, onSaved }) {
  const [step, setStep] = useState(mode === 'create' ? 'search' : 'form');
  const [cccd, setCccd] = useState('');
  const [tnv, setTnv] = useState(mode === 'edit' ? don?.tinhNguyenVien : null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [newTnv, setNewTnv] = useState({ hoVaTen: '', ngaySinh: '', gioiTinh: 'Nam', soDienThoai: '', diaChi: '', soCCCD: '', maPhuongXa: '' });
  const [form, setForm] = useState({
    loaiHinh: 'ChienDich',
    maChienDich: don?.maChienDich || '',
    theTich: String(don?.theTich || 250),
    ghiChu: don?.ghiChu || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [phuongXaList, setPhuongXaList] = useState([]);
  const [chiendichList, setChienDichList] = useState([]);

  const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(String(phone || '').trim());

  useEffect(() => {
    const fetchPhuongXa = async () => {
      try {
        const list = await phuongXaService.getAll();
        const sortedList = [...list].sort((a, b) => (a.tenPhuongXa || '').localeCompare(b.tenPhuongXa || '', 'vi', { sensitivity: 'base' }));
        setPhuongXaList(sortedList);
        console.log('Phường/xã list:', sortedList);
      } catch (e) { console.error('Error fetching phường/xã list:', e); }
    };
    fetchPhuongXa();
  }, []);

  useEffect(() => {
    const fetchChienDich = async () => {
      try {
        const response = await chienDichService.getChienDichs();
        // Xử lý cấu trúc response - có thể là { data: [...] } hoặc { content: [...] } hoặc trực tiếp array
        let list = Array.isArray(response) ? response : (response?.data || response?.content || []);
        setChienDichList(list);
        console.log('Chiến dịch list:', list);
      } catch (e) { console.error('Error fetching chiến dịch list:', e); }
    };
    fetchChienDich();
  }, []);


  const handleSearchCCCD = async () => {
    if (!cccd.trim()) return;
    setSearching(true); setNotFound(false); setError('');
    try {
      console.log('Tìm kiếm CCCD:', cccd.trim());
      const found = await tnvNvytService.findByCCCD(cccd.trim());
      console.log('Kết quả tìm kiếm:', found);
      if (found && found.data) { 
        setTnv(found.data); 
        if (found.duDieuKien === false) {
          setWarning(found.thongBao || 'Tình nguyện viên chưa đủ điều kiện thời gian hiến máu.');
        } else {
          setWarning('');
        }
        setStep('form'); 
      }
      else { setNotFound(true); setNewTnv(p => ({ ...p, soCCCD: cccd.trim() })); }
    } catch (err) { 
      console.error('Error tìm kiếm CCCD:', err);
      // Nếu không tìm thấy (404 hoặc message có chứa "không tìm" hoặc "not found")
      if (err.response?.status === 404 || err.message?.toLowerCase().includes('không tìm') || err.message?.toLowerCase().includes('not found')) {
        setNotFound(true); 
        setNewTnv(p => ({ ...p, soCCCD: cccd.trim() }));
      } else {
        setError(err.message || 'Lỗi khi tìm kiếm. Vui lòng thử lại.'); 
      }
    }
    finally { setSearching(false); }
  };

  const handleCreateTnv = async () => {
    if (!newTnv.hoVaTen.trim()) { setError('Vui lòng nhập họ và tên'); return; }
    if (!newTnv.ngaySinh) { setError('Vui lòng chọn ngày sinh'); return; }
    if (!newTnv.soCCCD.trim() || newTnv.soCCCD.trim().length !== 12) { setError('CCCD phải đúng 12 số'); return; }
    if (!newTnv.soDienThoai.trim()) { setError('Vui lòng nhập số điện thoại'); return; }
    if (!isValidPhone(newTnv.soDienThoai)) { setError('SĐT không hợp lệ. Định dạng: 03/05/07/08/09 + 8 số (vd: 0987654321)'); return; }
    if (!newTnv.maPhuongXa) { setError('Vui lòng chọn phường/xã'); return; }
    setLoading(true); setError('');
    try {
      const created = await tnvNvytService.create(newTnv);
      console.log('Tình nguyện viên vừa tạo:', created);
      if (!created || !created.maTNV) {
        setError('Lỗi: Server không trả về mã tình nguyện viên. Vui lòng thử lại.');
        return;
      }
      setTnv(created); setStep('form');
    } catch (e) { 
      console.error('Error creating TNV:', e);
      setError(e.message || 'Lỗi khi tạo tình nguyện viên'); 
    }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (form.loaiHinh === 'ChienDich' && !form.maChienDich.trim()) { setError('Vui lòng chọn mã chiến dịch'); return; }
    if (!tnv?.maTNV && !newTnv.soCCCD) { setError('Vui lòng tìm hoặc tạo tình nguyện viên trước'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        maTNV: tnv?.maTNV,
        maNV: nhanVien?.maNV,
        emailNhanVien: localStorage.getItem('email') || '',
        maChienDich: form.loaiHinh === 'TuDo' ? null : form.maChienDich,
        theTich: parseInt(form.theTich) || 250,
        ghiChu: form.ghiChu,
        maPhuongXa: tnv?.maPhuongXa || newTnv.maPhuongXa || '',
        cccd: tnv?.soCCCD || newTnv.soCCCD
      };
      console.log('Payload gửi lên:', payload);
      if (mode === 'create') {
        const saved = await donDangKyNvytService.create(payload);
        onSaved(saved, 'create');
      } else {
        const updated = await donDangKyNvytService.update(don.maDon, payload);
        onSaved(updated, 'update');
      }
    } catch (e) { 
      console.error('Error submit:', e);
      setError(e.message || 'Lỗi khi lưu đơn'); 
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            <h3 className="font-bold text-slate-800">
              {mode === 'create' ? 'Tạo đơn đăng ký mới' : 'Cập nhật đơn đăng ký'}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-500 text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>
          )}

          {/* Step 1: Tìm kiếm CCCD */}
          {step === 'search' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium">Tìm kiếm tình nguyện viên theo số CCCD:</p>
              <div className="flex gap-2">
                <input
                  value={cccd} onChange={e => setCccd(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchCCCD()}
                  placeholder="Nhập số CCCD..."
                  className="flex-1 h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  onClick={handleSearchCCCD} disabled={searching}
                  className="h-11 px-5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors disabled:opacity-60"
                >
                  {searching ? '...' : 'Tìm'}
                </button>
              </div>
              {notFound && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <p className="text-sm font-bold text-amber-800">Chưa có trong hệ thống. Thêm tình nguyện viên mới:</p>
                  {[
                    { label: 'Họ và tên *', key: 'hoVaTen', type: 'text' },
                    { label: 'Ngày sinh *', key: 'ngaySinh', type: 'date' },
                    { label: 'Số điện thoại', key: 'soDienThoai', type: 'tel' },
                    { label: 'Phường xã', key: 'maPhuongXa', type: 'select', options: phuongXaList },
                    { label: 'Địa chỉ', key: 'diaChi', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                      {f.type === 'select' ? (
                        <select
                          value={newTnv[f.key]}
                          onChange={e => setNewTnv(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                        >
                          <option value="">Chọn phường/xã</option>
                          {f.options.map((option) => (
                            <option key={option.maPhuongXa} value={option.maPhuongXa}>
                              {option.tenPhuongXa}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type} value={newTnv[f.key]}
                          onChange={e => setNewTnv(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-primary"
                        />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Giới tính</label>
                    <select value={newTnv.gioiTinh} onChange={e => setNewTnv(p => ({ ...p, gioiTinh: e.target.value }))}
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-primary">
                      <option>Nam</option><option>Nữ</option><option>Khác</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreateTnv} disabled={loading}
                    className="w-full h-10 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Đang thêm...' : 'Thêm & Tiếp tục'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Form đơn */}
          {step === 'form' && (
            <div className="space-y-4">
              {tnv && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">Tình nguyện viên</p>
                  <p className="font-bold text-green-900">{tnv.hoVaTen}</p>
                  <p className="text-xs text-green-700 mt-0.5">CCCD: {tnv.soCCCD} &nbsp;|&nbsp; {tnv.gioiTinh}</p>
                  <p className="text-xs text-green-700 mt-1">Mã Phường/xã: {tnv?.maPhuongXa || newTnv?.maPhuongXa || '---'}</p>
                  <p className="text-xs text-green-700">Địa chỉ: {tnv.diaChi || '---'}</p>
                </div>
              )}
              {warning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 items-start text-amber-800">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
                  <div className="text-sm font-medium">
                    <p className="font-bold text-amber-900 mb-0.5">Cảnh báo khoảng cách hiến máu</p>
                    <p>{warning}</p>
                    <p className="text-[11px] mt-1 text-amber-700 font-semibold italic">Y tá có thể cân nhắc và chịu trách nhiệm nếu vẫn quyết định tiếp nhận.</p>
                  </div>
                </div>
              )}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-bold text-blue-700">Nhân viên phụ trách: {nhanVien?.hoVaTen || '---'}</p>
                <p className="text-xs text-blue-600 font-mono">Mã NV: {nhanVien?.maNV || '---'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Loại hình tiếp nhận *</label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="loaiHinh" checked={form.loaiHinh === 'ChienDich'} onChange={() => setForm({ ...form, loaiHinh: 'ChienDich' })} />
                    <span className="text-sm font-medium">Theo chiến dịch</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="loaiHinh" checked={form.loaiHinh === 'TuDo'} onChange={() => setForm({ ...form, loaiHinh: 'TuDo', maChienDich: '' })} />
                    <span className="text-sm font-medium">Hiến máu tự do (Walk-in)</span>
                  </label>
                </div>
              </div>
              
              {form.loaiHinh === 'ChienDich' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Mã chiến dịch *</label>
                  <select
                    value={form.maChienDich}
                    onChange={e => setForm(p => ({ ...p, maChienDich: e.target.value }))}
                    className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white cursor-pointer"
                  >
                    <option value="">-- Chọn chiến dịch --</option>
                    {chiendichList.map((cd) => (
                      <option key={cd.maChienDich} value={cd.maChienDich}>
                        {cd.maChienDich} - {cd.tenChienDich}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Thể tích máu hiến</label>
                <select value={form.theTich} onChange={e => setForm(p => ({ ...p, theTich: e.target.value }))}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary bg-white">
                  <option value={250}>250 ml</option>
                  <option value={350}>350 ml</option>
                  <option value={450}>450 ml</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Ghi chú</label>
                <textarea
                  value={form.ghiChu} onChange={e => setForm(p => ({ ...p, ghiChu: e.target.value }))}
                  rows={3} placeholder="Ghi chú thêm (nếu có)..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                {mode === 'create' && (
                  <button onClick={() => setStep('search')}
                    className="flex-1 h-11 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                    Quay lại
                  </button>
                )}
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 h-11 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors shadow-sm disabled:opacity-60">
                  {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo đơn' : 'Cập nhật'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal Tiếp Nhận tại Quầy & Kiểm Tra Sơ Lược Sức Khỏe Lễ Tân ──────────────────
function TiepNhanModal({ don, nhanVien, onClose, onConfirmed }) {
  const tnv = don?.tinhNguyenVien || {};
  const hoTen = tnv.hoTen || tnv.hoVaTen || tnv.HoTen || ('TNV: ' + (don?.maTNV || '---'));
  const cccd = tnv.cccd || tnv.soCCCD || tnv.Cccd || 'Chưa cập nhật CCCD';
  const sdt = tnv.soDienThoai || tnv.SoDienThoai || '---';

  const [form, setForm] = useState({
    dauHong: false,
    khangSinh: false,
    truyenNhiem: false,
    coThai: false,
    theTich: don?.theTich || 350,
    moTaKhac: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Gọi API tiếp nhận tại quầy (Check-in)
      const payload = {
        maTNV: tnv.maTNV || don.maTNV,
        maChienDich: don.maChienDich,
        theTich: parseInt(form.theTich) || 350,
        maNV: nhanVien?.maNV
      };
      await donDangKyNvytService.tiepNhan(payload);

      // 2. Tạo/Cập nhật Hồ Sơ Sức Khỏe Sơ Lược lúc Check-in
      try {
        await khaiBaoYTeNvytService.create({
          maDon: don.maDon,
          dauHong: form.dauHong,
          khangSinh: form.khangSinh,
          truyenNhiem: form.truyenNhiem,
          coThai: form.coThai,
          moTaKhac: form.moTaKhac || 'NVYT đã kiểm tra sơ lược sức khỏe lúc tiếp nhận tại quầy lễ tân.'
        });
      } catch (e) {
        console.log('Hồ sơ sức khỏe có thể đã tồn tại:', e);
      }

      await Swal.fire({
        title: '✅ ĐÃ TIẾP NHẬN TẠI QUẦY!',
        html: `Đã xác nhận tiếp nhận TNV <b>${hoTen}</b> (CCCD: <b>${cccd}</b>).<br/><br/><span class="text-sm text-emerald-600 font-bold">Hồ sơ đã chuyển trực tiếp sang Bác Sĩ Khám Lâm Sàng!</span>`,
        icon: 'success',
        confirmButtonColor: '#af101a',
      });
      onConfirmed();
    } catch (err) {
      setError(err.message || 'Lỗi khi tiếp nhận tại quầy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">how_to_reg</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Tiếp Nhận TNV & Kiểm Tra Sơ Lược</h3>
              <p className="text-xs text-slate-500 font-medium">Xác nhận TNV có mặt tại quầy lễ tân & chuyển Bác sĩ</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* TNV Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã đơn: {don.maDon}</span>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">TNV Đăng Ký Online</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs text-slate-400 font-medium">Họ và tên TNV:</p>
                <p className="font-extrabold text-slate-800 text-base">{hoTen}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Số CCCD:</p>
                <p className="font-bold text-slate-700 font-mono text-sm">{cccd}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Số điện thoại:</p>
                <p className="font-bold text-slate-700 text-xs">{sdt}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Thể tích hiến đăng ký:</p>
                <p className="font-bold text-blue-600 text-xs">{form.theTich} ml</p>
              </div>
            </div>
          </div>

          {/* Sức khỏe sơ lược lúc đến */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
              <h4 className="font-extrabold text-slate-800 text-sm">Hỏi sơ lược tình trạng sức khỏe hôm nay:</h4>
            </div>
            <p className="text-xs text-slate-500 italic">NVYT hỏi nhanh TNV lúc đứng tại quầy để cập nhật phiếu trước khi gửi Bác sĩ:</p>

            <div className="space-y-2.5">
              {[
                { id: 'dauHong', label: '1. Hôm nay có đang mệt mỏi, sốt hoặc đau họng không?' },
                { id: 'khangSinh', label: '2. Có đang dùng thuốc kháng sinh điều trị bệnh không?' },
                { id: 'truyenNhiem', label: '3. Có mắc bệnh truyền nhiễm trong 6 tháng qua không?' },
                { id: 'coThai', label: '4. (Đối với Nữ): Có đang mang thai / cho con bú không?' },
              ].map(q => (
                <label key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">{q.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${form[q.id] ? 'text-red-600' : 'text-emerald-600'}`}>
                      {form[q.id] ? 'CÓ (Cảnh báo)' : 'Khỏe / Không'}
                    </span>
                    <input
                      type="checkbox"
                      checked={form[q.id]}
                      onChange={e => setForm(p => ({ ...p, [q.id]: e.target.checked }))}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Ghi chú sức khỏe của Lễ tân (nếu có):</label>
              <input
                type="text"
                value={form.moTaKhac}
                onChange={e => setForm(p => ({ ...p, moTaKhac: e.target.value }))}
                placeholder="Vd: Sức khỏe ổn định, ngủ đủ 7 tiếng, tinh thần thoải mái..."
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 h-10 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-primary/20 disabled:opacity-60"
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">task_alt</span>
                <span>Xác Nhận Tiếp Nhận & Chuyển Bác Sĩ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trang chính ──────────────────────────────────────────────────────────────
export default function DonDangKy() {
  const { nhanVien } = useOutletContext();
  const navigate = useNavigate();
  const [dons, setDons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit', don }
  const [checkInDon, setCheckInDon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donDangKyNvytService.getAll(page, PAGE_SIZE, keyword);
      const content = Array.isArray(res) ? res : (res.content || []);
      setDons(content);
      setTotalPages(res.totalPages || 1);
    } catch { showToast('Lỗi khi tải danh sách đơn đăng ký', 'error'); }
    finally { setLoading(false); }
  }, [page, keyword]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = () => { setKeyword(searchInput); setPage(0); };

  const handleDelete = async (don) => {
    if (!don) return;
    // Bước 1: Hỏi xác nhận xóa đơn
    const result = await Swal.fire({
      title: 'Bạn có muốn xóa Đơn đăng ký này không?',
      text: `Đơn ${don.maDon} sẽ bị xóa cùng hồ sơ sức khỏe liên quan (nếu có).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#af101a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'OK, xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      await donDangKyNvytService.delete(don.maDon);
      // Bước 2: Thông báo đã xóa hồ sơ sức khỏe (nếu có)
      await Swal.fire({
        title: 'Đã xóa thành công!',
        html: `Đã xóa hồ sơ sức khỏe và đơn đăng ký <b>${don.maDon}</b>.`,
        icon: 'success',
        confirmButtonColor: '#af101a',
        confirmButtonText: 'OK',
      });
      setDeleteTarget(null);
      loadData();
    } catch (e) {
      Swal.fire({
        title: 'Không thể xóa!',
        text: e.message || 'Lỗi khi xóa đơn đăng ký',
        icon: 'error',
        confirmButtonColor: '#af101a',
      });
      setDeleteTarget(null);
    }
  };

  const handleCheckIn = async (don) => {
    try {
      const payload = {
        maTNV: don.tinhNguyenVien?.maTNV || don.maTNV,
        maChienDich: don.maChienDich,
        theTich: don.theTich || 350
      };
      await donDangKyNvytService.tiepNhan(payload);
      await Swal.fire({
        title: '✅ ĐÃ TIẾP NHẬN TẠI QUẦY!',
        html: `Đã xác nhận tiếp nhận TNV <b>${don.tinhNguyenVien?.hoVaTen || don.maTNV}</b> cho đơn <b>${don.maDon}</b>.<br/><br/><span class="text-sm text-emerald-600 font-bold">Hồ sơ đã được đẩy trực tiếp sang Bác Sĩ Khám Lâm Sàng!</span>`,
        icon: 'success',
        confirmButtonColor: '#af101a',
      });
      loadData();
    } catch (err) {
      Swal.fire({
        title: 'Lỗi tiếp nhận!',
        text: err.message || 'Lỗi khi tiếp nhận tại quầy lễ tân',
        icon: 'error',
        confirmButtonColor: '#af101a',
      });
    }
  };

  const handleSaved = (saved, mode) => {
    setModal(null);
    if (mode === 'create' && saved?.maDon) {
      showToast('Tạo đơn thành công! Chuyển đến khai báo y tế...');
      localStorage.setItem('nvyt_maDon', saved.maDon);
      localStorage.setItem('nvyt_maTNV', saved.maTNV || '');
      setTimeout(() => navigate('/nvyt/khai-bao-y-te'), 1200);
    } else {
      showToast('Cập nhật đơn thành công'); loadData();
    }
  };

  // Kiểm tra đơn có do nhân viên tạo không (có maNV)
  const isEditable = (don) => !!don.maNV;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-2 transition-all
          ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-green-600'}`}>
          <span className="material-symbols-outlined text-lg">{toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Đơn đăng ký & Tiếp Nhận Lễ Tân</h1>
          <p className="text-slate-500 mt-1 text-sm">Quản lý các đơn đăng ký hiến máu và Tiếp nhận TNV tại quầy y tế</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create', don: null })}
          className="flex items-center gap-2 h-11 px-5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-all shadow-sm shadow-primary/20 active:scale-[0.98]">
          <span className="material-symbols-outlined text-xl">add</span>
          Tạo đơn trực tiếp (Walk-in)
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo mã đơn, tên TNV, mã chiến dịch..."
            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <button onClick={handleSearch}
          className="h-11 px-6 bg-primary text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors">
          Tìm kiếm
        </button>
        {keyword && (
          <button onClick={() => { setKeyword(''); setSearchInput(''); setPage(0); }}
            className="h-11 px-4 border border-slate-200 text-slate-500 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            Xóa lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Mã đơn', 'Tình nguyện viên', 'Chiến dịch / Địa điểm', 'Thể tích', 'Trạng thái', 'Nguồn đăng ký', 'Thao tác tiếp nhận'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Đang tải dữ liệu...</span>
                  </div>
                </td></tr>
              ) : dons.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-5xl block mb-2">inbox</span>
                  Không có đơn đăng ký nào
                </td></tr>
              ) : dons.map(don => {
                const editable = isEditable(don);
                const tnvObj = don.tinhNguyenVien || {};
                const hoTenTnv = tnvObj.hoTen || tnvObj.hoVaTen || tnvObj.HoTen || ('TNV: ' + (don.maTNV || '---'));
                const cccdTnv = tnvObj.cccd || tnvObj.soCCCD || tnvObj.Cccd || '---';
                const sdtTnv = tnvObj.soDienThoai || tnvObj.SoDienThoai || '';

                return (
                  <tr key={don.maDon} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-primary bg-red-50 px-2.5 py-1 rounded-lg">{don.maDon}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                          {hoTenTnv}
                        </p>
                        <p className="text-xs font-bold text-slate-500 font-mono pl-5">
                          CCCD: {cccdTnv}
                        </p>
                        {sdtTnv && (
                          <p className="text-xs font-medium text-slate-400 pl-5">
                            SĐT: {sdtTnv}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">{don.maChienDich || 'Hiến Thường Xuyên'}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{don.theTich || 350} ml</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full
                        ${don.trangThai === 'DA_KHAM' ? 'bg-green-100 text-green-700' :
                          don.trangThai === 'CHO_KHAM' || don.trangThai === 'DaHien' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'}`}>
                        {don.trangThai === 'DaHien' ? 'Đã check-in quầy' : (don.trangThai || 'Chờ tiếp nhận')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {editable ? (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <span className="material-symbols-outlined text-sm">badge</span>
                          NVYT tiếp nhận ({don.maNV})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-600 font-semibold">
                          <span className="material-symbols-outlined text-sm">devices</span>
                          TNV đăng ký Online
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {!editable && (
                          <button
                            onClick={() => setCheckInDon(don)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
                            title="Xác nhận tiếp nhận tại quầy & kiểm tra sức khỏe sơ lược"
                          >
                            <span className="material-symbols-outlined text-base">how_to_reg</span>
                            <span>Tiếp nhận</span>
                          </button>
                        )}
                        {editable && (
                          <button
                            onClick={() => setModal({ mode: 'edit', don })}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center"
                            title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => { localStorage.setItem('nvyt_maDon', don.maDon); navigate('/nvyt/khai-bao-y-te'); }}
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                          title="Khai báo y tế">
                          <span className="material-symbols-outlined text-base">fact_check</span>
                        </button>
                        <button
                          onClick={() => handleDelete(don)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                          title="Xóa đơn">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">Trang {page + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors
                    ${i === page ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tạo/Sửa */}
      {modal && (
        <DonModal
          mode={modal.mode} don={modal.don} nhanVien={nhanVien}
          onClose={() => setModal(null)} onSaved={handleSaved}
        />
      )}

      {/* Modal Tiếp Nhận Tại Quầy Lễ Tân */}
      {checkInDon && (
        <TiepNhanModal
          don={checkInDon}
          nhanVien={nhanVien}
          onClose={() => setCheckInDon(null)}
          onConfirmed={() => { setCheckInDon(null); loadData(); }}
        />
      )}

    </div>
  );
}