import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { donDangKyNvytService, tnvNvytService, khaiBaoYTeNvytService } from '../../services/nvytService';
import { phuongXaService } from '../../services/phuongXaService';
import { chienDichService } from '../../services/chienDichService';
import Swal from 'sweetalert2';

const PAGE_SIZE = 10;

const HEALTH_QUESTIONS = [
  { id: 'daTungHien', label: '1. Bạn đã từng tham gia hiến máu lần nào chưa?' },
  { id: 'xamHinh', label: '2. Trong 12 tháng qua có xăm hình, xỏ lỗ, tiêm vắc xin hay phẫu thuật không?' },
  { id: 'ruouBia', label: '3. Trong 24 giờ qua có uống rượu bia, sụt cân bất thường hay thức khuya mệt mỏi không?' },
  { id: 'manTinh', label: '4. Có tiền sử mắc các bệnh mạn tính (Tim mạch, Huyết áp, Gan, Thận, Tiểu đường...)?' },
  { id: 'coThai', label: '5. (Đối với Nữ): Có đang trong kỳ kinh nguyệt, mang thai hoặc cho con bú không?' },
];

// ─── Modal Tạo/Sửa Đơn Trực Tiếp (Walk-in) ───────────────────────────────────
function DonModal({ mode, don, nhanVien, onClose, onSaved }) {
  const [step, setStep] = useState(mode === 'create' ? 'search' : 'form');
  const [cccd, setCccd] = useState('');
  const [tnv, setTnv] = useState(mode === 'edit' ? don?.tinhNguyenVien : null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [newTnv, setNewTnv] = useState({ hoVaTen: '', ngaySinh: '', gioiTinh: 'Nam', soDienThoai: '', diaChi: '', soCCCD: '', maPhuongXa: '', nhomMau: 'O_positive' });
  const [form, setForm] = useState({
    loaiHinh: 'ChienDich', // 'ChienDich' | 'TuDo' (Thường xuyên) | 'KhanCap'
    maChienDich: don?.maChienDich || '',
    theTich: String(don?.theTich || 350),
    ghiChu: don?.ghiChu || '',
  });
  const [healthForm, setHealthForm] = useState({
    daTungHien: false,
    xamHinh: false,
    ruouBia: false,
    manTinh: false,
    coThai: false,
    moTaKhac: '',
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
      } catch (e) { console.error('Error fetching phường/xã list:', e); }
    };
    fetchPhuongXa();
  }, []);

  useEffect(() => {
    const fetchChienDich = async () => {
      try {
        const response = await chienDichService.getChienDichs();
        let list = Array.isArray(response) ? response : (response?.data || response?.content || []);
        setChienDichList(list);
      } catch (e) { console.error('Error fetching chiến dịch list:', e); }
    };
    fetchChienDich();
  }, []);

  // Lọc chiến dịch theo loại hình được chọn (Phân biệt rạch ròi Chiến dịch phong trào & Đợt khẩn cấp)
  const getFilteredChienDichs = () => {
    return chiendichList.filter(c => {
      const name = String(c.tenChienDich || '').toLowerCase();
      const isEmergency = c.mucDoUuTien === 'KhanCap' || c.mucDoUuTien === 1 || name.includes('khẩn cấp') || String(c.maChienDich).includes('KC');
      const isRoutine = c.maChienDich === 'CD00004' || c.maChienDich === 'CD00003' || name.includes('thường xuyên');

      if (form.loaiHinh === 'ChienDich') {
        // Chỉ lấy các chiến dịch đợt phong trào bình thường (Loại bỏ khẩn cấp & thường xuyên)
        return !isEmergency && !isRoutine;
      }
      if (form.loaiHinh === 'KhanCap') {
        // Chỉ lấy các đợt gọi máu khẩn cấp
        return isEmergency;
      }
      if (form.loaiHinh === 'TuDo') {
        // Lấy danh sách cơ sở hiến thường xuyên
        return isRoutine;
      }
      return true;
    });
  };

  const handleSearchCCCD = async () => {
    if (!cccd.trim()) return;
    setSearching(true); setNotFound(false); setError(''); setWarning('');
    try {
      const found = await tnvNvytService.findByCCCD(cccd.trim());
      if (found && found.data) { 
        setTnv(found.data); 
        if (found.duDieuKien === false) {
          setWarning(found.thongBao || '⚠️ Tình nguyện viên chưa đủ thời gian 3 tháng (84 ngày) kể từ lần hiến máu gần nhất!');
        }
        setStep('form'); 
      } else { 
        setNotFound(true); 
        setNewTnv(p => ({ ...p, soCCCD: cccd.trim() })); 
      }
    } catch (err) { 
      if (err.response?.status === 404 || err.message?.toLowerCase().includes('không tìm') || err.message?.toLowerCase().includes('not found')) {
        setNotFound(true); 
        setNewTnv(p => ({ ...p, soCCCD: cccd.trim() }));
      } else {
        setError(err.message || 'Lỗi khi tìm kiếm. Vui lòng thử lại.'); 
      }
    } finally { 
      setSearching(false); 
    }
  };

  const handleCreateTnv = async () => {
    if (!newTnv.hoVaTen.trim()) { setError('Vui lòng nhập họ và tên'); return; }
    if (!newTnv.ngaySinh) { setError('Vui lòng chọn ngày sinh'); return; }
    if (!newTnv.soCCCD.trim() || newTnv.soCCCD.trim().length !== 12) { setError('CCCD phải đúng 12 số'); return; }
    if (!newTnv.soDienThoai.trim()) { setError('Vui lòng nhập số điện thoại'); return; }
    if (!isValidPhone(newTnv.soDienThoai)) { setError('SĐT không hợp lệ. Định dạng: 03/05/07/08/09 + 8 số'); return; }
    if (!newTnv.maPhuongXa) { setError('Vui lòng chọn phường/xã'); return; }
    setLoading(true); setError('');
    try {
      const created = await tnvNvytService.create(newTnv);
      if (!created || !created.maTNV) {
        setError('Lỗi: Server không trả về mã tình nguyện viên.');
        return;
      }
      setTnv(created); setStep('form');
    } catch (e) { 
      setError(e.message || 'Lỗi khi tạo tình nguyện viên'); 
    } finally { 
      setLoading(false); 
    }
  };

  // Xử lý nộp đơn Walk-in trực tiếp: Tạo đơn + Hỏi sức khỏe + Chuyển Bác sĩ trong 1 bước duy nhất!
  const handleSubmit = async () => {
    if (form.loaiHinh === 'ChienDich' && !form.maChienDich.trim()) { 
      setError('Vui lòng chọn chiến dịch hiến máu'); 
      return; 
    }
    if (!tnv?.maTNV && !newTnv.soCCCD) { 
      setError('Vui lòng tìm hoặc khởi tạo tình nguyện viên trước'); 
      return; 
    }
    setLoading(true); setError('');
    try {
      const hoTenTnv = tnv?.hoTen || tnv?.hoVaTen || newTnv.hoVaTen;
      const cccdTnv = tnv?.soCCCD || tnv?.cccd || newTnv.soCCCD;

      // 1. Trường hợp Khẩn Cấp -> Fast-Track tiếp nhận khẩn cấp gửi Admin khen thưởng
      if (form.loaiHinh === 'KhanCap') {
        const payload = {
          maTNV: tnv?.maTNV,
          cccd: cccdTnv,
          hoTen: hoTenTnv,
          soDienThoai: tnv?.soDienThoai || newTnv.soDienThoai,
          nhomMau: tnv?.nhomMau || newTnv.nhomMau,
          maChienDich: form.maChienDich || null,
          theTich: parseInt(form.theTich) || 350,
          ghiChu: 'Hiến máu khẩn cấp tại chỗ - Lưu vết gửi Admin khen thưởng'
        };
        const res = await donDangKyNvytService.tiepNhanKhanCap(payload);
        await Swal.fire({
          title: '🚨 ĐÃ LƯU TIẾP NHẬN KHẨN CẤP!',
          html: `Đã ghi nhận đơn hiến máu khẩn cấp cho <b>${hoTenTnv}</b>.<br/><br/><span class="text-sm text-[#af101a] font-bold">Hồ sơ đã được gửi trực tiếp lên Admin để duyệt Khen Thưởng & Cấp Chứng Nhận!</span>`,
          icon: 'success',
          confirmButtonColor: '#af101a',
        });
        onSaved(res, 'create');
        return;
      }

      // 2. Trường hợp Hiến Thường Xuyên hoặc Hiến Theo Chiến Dịch
      const payload = {
        maTNV: tnv?.maTNV,
        maNV: nhanVien?.maNV,
        emailNhanVien: localStorage.getItem('email') || '',
        maChienDich: form.loaiHinh === 'TuDo' ? 'CD00004' : form.maChienDich,
        theTich: parseInt(form.theTich) || 350,
        ghiChu: form.ghiChu,
        maPhuongXa: tnv?.maPhuongXa || newTnv.maPhuongXa || '',
        cccd: cccdTnv
      };

      let savedDon = null;
      if (mode === 'create') {
        savedDon = await donDangKyNvytService.create(payload);
      } else {
        savedDon = await donDangKyNvytService.update(don.maDon, payload);
      }

      // 3. Tự động Tiếp nhận & Lưu Tờ khai y tế sơ lược (Không bắt bấm lại ngoài bảng)
      if (savedDon?.maDon) {
        try {
          // Lưu hồ sơ sức khỏe sơ lược
          await khaiBaoYTeNvytService.create({
            maDon: savedDon.maDon,
            dauHong: healthForm.ruouBia,
            khangSinh: healthForm.manTinh,
            truyenNhiem: healthForm.xamHinh,
            coThai: healthForm.coThai,
            moTaKhac: healthForm.moTaKhac || 'Khai báo y tế trực tiếp tại quầy tiếp nhận lễ tân'
          });
        } catch (e) { 
          console.log('Tự động tiếp nhận:', e); 
        }

        await Swal.fire({
          title: '✅ ĐÃ TIẾP NHẬN TẠI QUẦY!',
          html: `Đã tạo đơn & tiếp nhận TNV <b>${hoTenTnv}</b> (CCCD: <b>${cccdTnv}</b>).<br/><br/><span class="text-sm text-emerald-600 font-bold">Hồ sơ đã được chuyển thẳng tới Bác Sĩ Khám Lâm Sàng!</span>`,
          icon: 'success',
          confirmButtonColor: '#af101a',
        });
      }

      onSaved(savedDon, mode);
    } catch (e) { 
      console.error('Error submit:', e);
      setError(e.message || 'Lỗi khi lưu đơn đăng ký'); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredChienDichs = getFilteredChienDichs();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">post_add</span>
            <h3 className="font-bold text-slate-800">
              {mode === 'create' ? 'Tạo Đơn Tiếp Nhận Trực Tiếp (Walk-in)' : 'Cập Nhật Đơn Đăng Ký'}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">{error}</div>
          )}

          {/* Cảnh báo 3 tháng / 84 ngày */}
          {warning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>{warning}</span>
            </div>
          )}

          {/* Bước 1: Tra cứu CCCD */}
          {step === 'search' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-semibold">Tra cứu thông tin Tình nguyện viên theo số CCCD (12 số):</p>
              <div className="flex gap-2">
                <input
                  value={cccd} onChange={e => setCccd(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchCCCD()}
                  placeholder="Nhập số CCCD (12 số)..."
                  className="flex-1 h-11 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-primary font-mono"
                />
                <button
                  onClick={handleSearchCCCD} disabled={searching}
                  className="h-11 px-5 bg-primary text-white rounded-xl font-bold text-xs uppercase hover:bg-red-800 transition-colors disabled:opacity-60"
                >
                  {searching ? '...' : 'Tìm CCCD'}
                </button>
              </div>

              {notFound && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-amber-800">Chưa có hồ sơ trong hệ thống. Nhập nhanh thông tin TNV mới:</p>
                  {[
                    { label: 'Họ và tên *', key: 'hoVaTen', type: 'text' },
                    { label: 'Ngày sinh *', key: 'ngaySinh', type: 'date' },
                    { label: 'Số điện thoại *', key: 'soDienThoai', type: 'tel' },
                    { label: 'Phường/Xã *', key: 'maPhuongXa', type: 'select', options: phuongXaList },
                    { label: 'Địa chỉ cư trú', key: 'diaChi', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                      {f.type === 'select' ? (
                        <select
                          value={newTnv[f.key]}
                          onChange={e => setNewTnv(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-primary"
                        >
                          <option value="">-- Chọn phường/xã --</option>
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
                          className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-primary"
                        />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Giới tính</label>
                    <select value={newTnv.gioiTinh} onChange={e => setNewTnv(p => ({ ...p, gioiTinh: e.target.value }))}
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-primary">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreateTnv} disabled={loading}
                    className="w-full h-10 bg-primary text-white rounded-lg font-bold text-xs uppercase hover:bg-red-800 transition-colors"
                  >
                    {loading ? 'Đang tạo hồ sơ...' : 'Khởi tạo Hồ sơ TNV'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bước 2: Chọn Loại Hình Hiến, Địa điểm & Hỏi Sức Khỏe Ngay Tại Chỗ */}
          {step === 'form' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 font-semibold">Tình nguyện viên:</p>
                <p className="font-extrabold text-slate-800 text-sm">
                  {tnv?.hoTen || tnv?.hoVaTen || newTnv.hoVaTen} 
                  <span className="font-mono text-xs font-bold text-slate-500 ml-2">(CCCD: {tnv?.soCCCD || tnv?.cccd || newTnv.soCCCD})</span>
                </p>
              </div>

              {/* Chọn Loại Hình Hiến Máu */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-2">Chọn Loại Hình Hiến Máu *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'TuDo', label: '🏥 Thường Xuyên', sub: 'Tại Bệnh viện' },
                    { id: 'ChienDich', label: '📅 Chiến Dịch', sub: 'Đợt phong trào' },
                    { id: 'KhanCap', label: '🚨 Khẩn Cấp', sub: 'Cấp cứu tại chỗ' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, loaiHinh: item.id, maChienDich: '' }))}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        form.loaiHinh === item.id 
                          ? 'border-primary bg-red-50/50 text-primary font-black shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] opacity-75">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách Chiến dịch/Đợt khẩn cấp (ĐÃ ĐƯỢC LỌC TÁCH BIỆT CHUẨN 100%) */}
              {form.loaiHinh !== 'TuDo' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {form.loaiHinh === 'KhanCap' ? 'Chọn Đợt Gọi Máu Khẩn Cấp *' : 'Chọn Chiến Dịch Phong Trào *'}
                  </label>
                  <select
                    value={form.maChienDich}
                    onChange={e => setForm(p => ({ ...p, maChienDich: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-primary font-medium"
                  >
                    <option value="">
                      {form.loaiHinh === 'KhanCap' ? '-- Chọn đợt khẩn cấp cần máu --' : '-- Chọn chiến dịch phong trào --'}
                    </option>
                    {filteredChienDichs.map(c => (
                      <option key={c.maChienDich} value={c.maChienDich}>
                        {c.tenChienDich} ({c.maChienDich})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Thể tích máu */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Thể tích máu dự kiến hiến (ml)</label>
                <select
                  value={form.theTich}
                  onChange={e => setForm(p => ({ ...p, theTich: e.target.value }))}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-primary font-bold"
                >
                  <option value="250">250 ml</option>
                  <option value="350">350 ml</option>
                  <option value="450">450 ml</option>
                </select>
              </div>

              {/* Tờ khai y tế sơ lược ngay trong Walk-in (Nếu không phải Khẩn cấp) */}
              {form.loaiHinh !== 'KhanCap' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-xs font-extrabold text-slate-700">Hỏi sơ lược sức khỏe lúc tiếp nhận (Theo Bộ Y Tế):</p>
                  <div className="space-y-1.5">
                    {HEALTH_QUESTIONS.map(q => (
                      <label key={q.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer">
                        <span className="text-slate-600 font-medium pr-2">{q.label}</span>
                        <input
                          type="checkbox"
                          checked={healthForm[q.id]}
                          onChange={e => setHealthForm(p => ({ ...p, [q.id]: e.target.checked }))}
                          className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Ghi chú tiếp nhận</label>
                <input
                  type="text"
                  value={form.ghiChu}
                  onChange={e => setForm(p => ({ ...p, ghiChu: e.target.value }))}
                  placeholder="Nhập ghi chú tiếp nhận (nếu có)..."
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={loading} className="px-4 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
            Hủy
          </button>
          {step === 'form' && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-5 h-10 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                form.loaiHinh === 'KhanCap' ? 'bg-[#af101a] hover:bg-red-800' : 'bg-primary hover:bg-red-800'
              }`}
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : form.loaiHinh === 'KhanCap' ? (
                <>
                  <span className="material-symbols-outlined text-base">emergency</span>
                  <span>Lưu Khẩn Cấp & Gửi Admin Khen Thưởng</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">task_alt</span>
                  <span>Hoàn Tất Tiếp Nhận & Chuyển Bác Sĩ</span>
                </>
              )}
            </button>
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

  const isEmergency = don?.chienDich?.mucDoUuTien === 'KhanCap' || (don?.maChienDich && String(don.maChienDich).includes('KC'));

  const [form, setForm] = useState({
    daTungHien: false,
    xamHinh: false,
    ruouBia: false,
    manTinh: false,
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
      if (isEmergency) {
        // Luồng Hiến Máu Khẩn Cấp: Hoàn thành trực tiếp & gửi Admin khen thưởng
        const payload = {
          maTNV: tnv.maTNV || don.maTNV,
          cccd: cccd,
          hoTen: hoTen,
          soDienThoai: sdt,
          maChienDich: don.maChienDich,
          theTich: parseInt(form.theTich) || 350
        };
        await donDangKyNvytService.tiepNhanKhanCap(payload);
        await Swal.fire({
          title: '🚨 ĐÃ XÁC NHẬN HIẾN KHẨN CẤP!',
          html: `Đã xác nhận hiến máu khẩn cấp cho <b>${hoTen}</b>.<br/><br/><span class="text-sm text-[#af101a] font-bold">Thông tin đã được chuyển trực tiếp lên Admin để duyệt Khen Thưởng & Cấp Giấy Chứng Nhận!</span>`,
          icon: 'success',
          confirmButtonColor: '#af101a',
        });
      } else {
        // Luồng Thường Xuyên / Chiến Dịch
        const payload = {
          maTNV: tnv.maTNV || don.maTNV,
          maChienDich: don.maChienDich,
          theTich: parseInt(form.theTich) || 350,
          maNV: nhanVien?.maNV
        };
        await donDangKyNvytService.tiepNhan(payload);

        try {
          await khaiBaoYTeNvytService.create({
            maDon: don.maDon,
            dauHong: form.ruouBia,
            khangSinh: form.manTinh,
            truyenNhiem: form.xamHinh,
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
      }

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
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${isEmergency ? 'bg-gradient-to-r from-red-50 via-rose-50 to-white' : 'bg-gradient-to-r from-emerald-50 to-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEmergency ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <span className="material-symbols-outlined text-2xl">{isEmergency ? 'emergency' : 'how_to_reg'}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                {isEmergency ? '🚨 Tiếp Nhận Hiến Máu Khẩn Cấp Fast-Track' : 'Tiếp Nhận TNV & Kiểm Tra Sơ Lược'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isEmergency ? 'Xác nhận hiến khẩn cấp cứu người & gửi Admin khen thưởng' : 'Xác nhận TNV có mặt tại quầy lễ tân & chuyển Bác sĩ'}
              </p>
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
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${isEmergency ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-purple-100 text-purple-700'}`}>
                {isEmergency ? '🚨 Hiến Khẩn Cấp' : 'TNV Đăng Ký Online'}
              </span>
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
                <p className="text-xs text-slate-400 font-medium">Thể tích hiến:</p>
                <p className="font-bold text-blue-600 text-xs">{form.theTich} ml</p>
              </div>
            </div>
          </div>

          {/* Nếu không phải khẩn cấp -> Hỏi 5 câu hỏi sơ lược sức khỏe */}
          {!isEmergency ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-0.5">
                <h4 className="font-extrabold text-slate-800 text-sm">Hỏi sơ lược tình trạng sức khỏe hôm nay (Theo Bộ Y Tế):</h4>
              </div>

              <div className="space-y-2">
                {HEALTH_QUESTIONS.map(q => (
                  <label key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700 pr-2">{q.label}</span>
                    <div className="flex items-center gap-3 shrink-0">
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
                  placeholder="Vd: Sức khỏe tốt, ngủ đủ 7 tiếng, tinh thần thoải mái..."
                  className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-center">
              <span className="material-symbols-outlined text-4xl text-red-600 block">emergency_home</span>
              <p className="text-sm font-extrabold text-red-800">Trường Hợp Hiến Máu Cấp Cứu Khẩn Cấp!</p>
              <p className="text-xs text-slate-600">Bỏ qua các thủ tục khám sàng lọc rườm rà. Tiếp nhận máu ngay để cứu người. Hệ thống sẽ lập tức lưu thông tin và gửi yêu cầu lên Admin xét duyệt Khen Thưởng & Cấp Giấy Chứng Nhận.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-4 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 h-10 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md disabled:opacity-60 ${
              isEmergency ? 'bg-[#af101a] hover:bg-red-800' : 'bg-primary hover:bg-red-800'
            }`}
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : isEmergency ? (
              <>
                <span className="material-symbols-outlined text-base">card_membership</span>
                <span>🚨 XÁC NHẬN KHẨN CẤP & GỬI ADMIN KHEN THƯỞNG</span>
              </>
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
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donDangKyNvytService.getAll(page, PAGE_SIZE, keyword);
      const allContent = Array.isArray(res) ? res : (res.content || res.data || []);
      
      let filtered = allContent;
      if (keyword.trim()) {
        const kw = keyword.toLowerCase().trim();
        filtered = allContent.filter(item => {
          const maDon = String(item.maDon || '').toLowerCase();
          const hoTen = String(item.tinhNguyenVien?.hoTen || item.tinhNguyenVien?.hoVaTen || item.tinhNguyenVien?.HoTen || item.maTNV || '').toLowerCase();
          const cccd = String(item.tinhNguyenVien?.cccd || item.tinhNguyenVien?.soCCCD || item.tinhNguyenVien?.Cccd || '').toLowerCase();
          const tenCD = String(item.chienDich?.tenChienDich || item.maChienDich || '').toLowerCase();
          return maDon.includes(kw) || hoTen.includes(kw) || cccd.includes(kw) || tenCD.includes(kw);
        });
      }

      const total = Math.ceil(filtered.length / PAGE_SIZE) || 1;
      setTotalPages(total);

      const startIndex = page * PAGE_SIZE;
      const paginatedDons = filtered.slice(startIndex, startIndex + PAGE_SIZE);
      setDons(paginatedDons);
    } catch { showToast('Lỗi khi tải danh sách đơn đăng ký', 'error'); }
    finally { setLoading(false); }
  }, [page, keyword]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = () => { setKeyword(searchInput); setPage(0); };

  const handleDelete = async (don) => {
    if (!don) return;
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
      await Swal.fire({
        title: 'Đã xóa thành công!',
        html: `Đã xóa hồ sơ sức khỏe và đơn đăng ký <b>${don.maDon}</b>.`,
        icon: 'success',
        confirmButtonColor: '#af101a',
        confirmButtonText: 'OK',
      });
      loadData();
    } catch (e) {
      Swal.fire({
        title: 'Không thể xóa!',
        text: e.message || 'Lỗi khi xóa đơn đăng ký',
        icon: 'error',
        confirmButtonColor: '#af101a',
      });
    }
  };

  const handleSaved = (saved, mode) => {
    setModal(null);
    showToast('Thao tác đơn đăng ký thành công'); 
    loadData();
  };

  const isEditable = (don) => !!don.maNV;

  const renderChienDichBadge = (don) => {
    const isEmergency = don?.chienDich?.mucDoUuTien === 'KhanCap' || (don?.maChienDich && String(don.maChienDich).includes('KC'));
    const isRoutine = !don.maChienDich || don.maChienDich === 'CD00004' || don.maChienDich === 'CD00003';
    const tenChienDich = don?.chienDich?.tenChienDich || (isRoutine ? 'Hiến Thường Xuyên tại Bệnh viện' : don.maChienDich);

    if (isEmergency) {
      return (
        <span className="px-3 py-1 bg-[#fff0f3] text-[#af101a] border border-rose-200 rounded-xl text-xs font-black flex items-center gap-1.5 w-fit animate-pulse">
          <span className="material-symbols-outlined text-sm text-[#af101a]">emergency</span>
          <span>[KHẨN CẤP] {tenChienDich}</span>
        </span>
      );
    }
    if (isRoutine) {
      return (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit">
          <span className="material-symbols-outlined text-sm text-emerald-600">local_hospital</span>
          <span>[Thường Xuyên] {tenChienDich}</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit">
        <span className="material-symbols-outlined text-sm text-blue-600">event</span>
        <span>[Chiến Dịch] {tenChienDich}</span>
      </span>
    );
  };

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

      {/* Ruby Blood Life Le Tan Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-6 md:p-8 text-white shadow-xl shadow-rose-600/15 border border-white/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black text-rose-50 border border-white/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              📋 BÀN LỄ TÂN TẾP NHẬN TÌNH NGUYỆN VIÊN HIẾN MÁU
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Quản Lý Đơn Đăng Ký & Check-in Tiếp Nhận
            </h1>
            <p className="text-rose-100 text-xs md:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Tiếp nhận tình nguyện viên đến quầy, thực hiện check-in trực tiếp & đẩy hồ sơ sang phòng Khám Lâm Sàng Bác Sĩ
            </p>
          </div>

          <button
            onClick={() => setModal({ mode: 'create', don: null })}
            className="flex items-center gap-2 h-12 px-6 bg-white text-rose-700 hover:bg-rose-50 rounded-2xl font-black text-xs transition-all shadow-lg shadow-rose-950/20 active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            <span>Tạo đơn trực tiếp (Walk-in)</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Search Bar */}
      <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo mã đơn, tên TNV, CCCD, tên chiến dịch..."
            className="w-full h-11 bg-rose-50/30 border border-rose-100 rounded-xl pl-10 pr-4 text-xs font-medium outline-none focus:border-rose-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSearch}
            className="h-11 px-5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">search</span>
            <span>Tìm kiếm</span>
          </button>
          {keyword && (
            <button onClick={() => { setKeyword(''); setSearchInput(''); setPage(0); }}
              className="h-11 px-4 border border-rose-200 text-slate-600 hover:bg-rose-50 rounded-xl text-xs font-extrabold transition-all">
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400 tracking-wider w-[100px]">Mã đơn</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400 tracking-wider">Tình nguyện viên</th>
                <th className="text-left px-5 py-3 text-xs font-black uppercase text-slate-400 tracking-wider">Chiến dịch / Cơ sở tiếp nhận</th>
                <th className="text-left px-3 py-3 text-xs font-black uppercase text-slate-400 tracking-wider w-[90px]">Thể tích</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400 tracking-wider w-[120px]">Trạng thái</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400 tracking-wider w-[130px]">Nguồn</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase text-slate-400 tracking-wider w-[130px]">Thao tác tiếp nhận</th>
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
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold text-primary bg-red-50 px-2 py-1 rounded-lg">{don.maDon}</span>
                    </td>
                    <td className="px-5 py-4 min-w-[220px]">
                      <div className="flex flex-col gap-1">
                        <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                          {hoTenTnv}
                        </p>
                        <p className="text-xs font-bold text-slate-500 font-mono flex items-center gap-1 pl-5">
                          <span className="material-symbols-outlined text-slate-400 text-xs">badge</span>
                          CCCD: {cccdTnv}
                        </p>
                        {sdtTnv && (
                          <p className="text-xs font-medium text-slate-400 flex items-center gap-1 pl-5">
                            <span className="material-symbols-outlined text-slate-400 text-xs">call</span>
                            SĐT: {sdtTnv}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 min-w-[240px]">
                      {renderChienDichBadge(don)}
                    </td>

                    <td className="px-3 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{don.theTich || 350} ml</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap
                        ${don.trangThai === 'ChoDuyet' || don.trangThai === 'DaDuyet' || don.trangThai === 'DaHoanThanh' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          don.trangThai === 'DaTuChoi' ? 'bg-red-100 text-red-700 border border-red-200' :
                          don.trangThai === 'DaDangKy' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                            'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                        {don.trangThai === 'ChoDuyet' ? '⏳ Chờ khám bác sĩ' : 
                         don.trangThai === 'DaDuyet' ? '✅ Bác sĩ đã duyệt' :
                         don.trangThai === 'DaHoanThanh' ? '🩸 Đã hoàn thành' :
                         don.trangThai === 'DaTuChoi' ? '❌ Đã từ chối' : 
                         don.trangThai === 'DaDangKy' ? '⌛ Chờ tiếp nhận' : (don.trangThai || 'Chờ tiếp nhận')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {editable ? (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold whitespace-nowrap">
                          <span className="material-symbols-outlined text-sm">badge</span>
                          Lễ tân tạo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-600 font-semibold whitespace-nowrap">
                          <span className="material-symbols-outlined text-sm">devices</span>
                          Đăng ký App
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {don.trangThai === 'ChoDuyet' || don.trangThai === 'DaDuyet' || don.trangThai === 'DaHoanThanh' ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200 shadow-sm whitespace-nowrap">
                            <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                            <span>Đã tiếp nhận</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setCheckInDon(don)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 whitespace-nowrap"
                            title="Tiếp nhận TNV & Kiểm tra sức khỏe"
                          >
                            <span className="material-symbols-outlined text-base">how_to_reg</span>
                            <span>Tiếp nhận</span>
                          </button>
                        )}
                        {editable && (
                          <button
                            onClick={() => setModal({ mode: 'edit', don })}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0"
                            title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(don)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0"
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