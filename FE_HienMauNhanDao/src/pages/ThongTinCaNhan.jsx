import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { phuongXaService } from '../services/phuongXaService';
import { tinhNguyenVienService } from '../services/tinhNguyenVienService';
import { donDangKyService } from '../services/donDangKy';

export default function ThongTinCaNhan() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [phuongXaList, setPhuongXaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [formData, setFormData] = useState({
    hoVaTen: '',
    soCCCD: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    soDienThoai: '',
    diaChi: '',
    phuongXa: '',
    dungTichMau: '350'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const campaign = localStorage.getItem('selectedCampaign');
    if (!campaign) {
      navigate('/chiendich');
      return;
    }
    const parsedCampaign = JSON.parse(campaign);
    setSelectedCampaign(parsedCampaign);

    // Tải danh sách phường/xã
    phuongXaService.getAll()
      .then(data => setPhuongXaList(data))
      .catch(err => {
        console.error('Error fetching phường/xã:', err);
        setError('Không thể lấy danh sách phường/xã. Vui lòng tải lại trang.');
      });

    // Pre-fill form từ dữ liệu TNV đã có trong DB
    const email = localStorage.getItem('email') || localStorage.getItem('userEmail');
    if (email) {
      tinhNguyenVienService.getByMaTaiKhoan(email).then(tnvData => {
        if (tnvData) {
          setFormData(prev => ({
            ...prev,
            hoVaTen: tnvData.hoVaTen || '',
            soCCCD: tnvData.soCCCD || '',
            ngaySinh: tnvData.ngaySinh || '',
            gioiTinh: tnvData.gioiTinh || 'Nam',
            soDienThoai: tnvData.soDienThoai || '',
            diaChi: tnvData.diaChi || '',
            phuongXa: tnvData.maPhuongXa || '',
          }));
        }
      });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.hoVaTen.trim()) { setError('Vui lòng nhập họ và tên'); return false; }
    if (!formData.soCCCD.trim()) { setError('Vui lòng nhập số CCCD'); return false; }
    if (formData.soCCCD.trim().length !== 12) { setError('CCCD phải đúng 12 số'); return false; }
    if (!formData.ngaySinh) { setError('Vui lòng chọn ngày sinh'); return false; }
    if (!formData.soDienThoai.trim()) { setError('Vui lòng nhập số điện thoại'); return false; }
    if (!formData.diaChi.trim()) { setError('Vui lòng nhập địa chỉ cư trú'); return false; }
    if (!formData.phuongXa) { setError('Vui lòng chọn phường/xã'); return false; }
    setError('');
    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    const email = localStorage.getItem('email') || localStorage.getItem('userEmail');
    if (!email) {
      setError('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // BƯỚC 1: Lưu/Cập nhật thông tin TNV
      const tinhNguyenVienData = {
        hoVaTen: formData.hoVaTen,
        soCCCD: formData.soCCCD,
        ngaySinh: formData.ngaySinh,
        gioiTinh: formData.gioiTinh,
        soDienThoai: formData.soDienThoai,
        diaChi: formData.diaChi,
        maPhuongXa: formData.phuongXa,
        maTaiKhoan: email  // Backend sẽ resolve theo email
      };

      const tnvResponse = await tinhNguyenVienService.createOrUpdate(tinhNguyenVienData);
      const maTNV = tnvResponse?.maTNV;

      if (!maTNV) {
        throw new Error('Không lấy được mã tình nguyện viên từ server.');
      }

      // BƯỚC 2: Tạo đơn đăng ký (với thể tích máu đã chọn)
      const donDangKyData = {
        maTNV: maTNV,
        maChienDich: selectedCampaign.maChienDich,
        theTich: parseInt(formData.dungTichMau, 10)
      };

      const donResponse = await donDangKyService.create(donDangKyData);
      const maDon = donResponse?.maDon;

      if (!maDon) {
        throw new Error('Không lấy được mã đơn đăng ký từ server.');
      }

      // Lưu vào localStorage để các bước sau dùng
      localStorage.setItem('thongTinCaNhan', JSON.stringify(formData));
      localStorage.setItem('tinhNguyenVienId', maTNV);
      localStorage.setItem('maDon', maDon);

      navigate('/khai-bao-y-te');
    } catch (err) {
      console.error('Error in handleNext:', err);
      // Phân biệt lỗi nghiệp vụ "đã đăng ký" với các lỗi kỹ thuật khác
      if (err.message?.includes('đã đăng ký chiến dịch này rồi')) {
        setAlreadyRegistered(true);
        setError('');
      } else {
        setError(err.message || 'Lỗi khi lưu thông tin. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCampaign) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-slate-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fdf8f9] min-h-[calc(100vh-100px)] py-12 px-4 md:px-8">
      <main className="max-w-[1280px] mx-auto">
        {/* Progress Steps */}
        <div className="mb-12 max-w-3xl mx-auto bento-card p-6 md:p-8 bg-white/80 backdrop-blur-xl border border-white">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[15%] h-1.5 bg-gradient-to-r from-[#e62e43] to-[#ff4757] rounded-full -z-10 shadow-[0_0_10px_rgba(230,46,67,0.4)]"></div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e62e43] to-[#c01b30] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#e62e43]/30 ring-4 ring-white">
                1
              </div>
              <span className="text-sm font-black text-[#e62e43] tracking-wide">Thông tin cá nhân</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg shadow-inner ring-4 ring-white">
                2
              </div>
              <span className="text-sm font-bold text-slate-400">Khai báo y tế</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg shadow-inner ring-4 ring-white">
                3
              </div>
              <span className="text-sm font-bold text-slate-400">Xác nhận</span>
            </div>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Đăng Ký Hiến Máu</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">Vui lòng kiểm tra thông tin cá nhân và chọn dung tích hiến máu phù hợp với thể trạng của bạn.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Campaign Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {selectedCampaign && (
              <div className="w-full bento-card bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden h-fit shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#e62e43]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 p-4 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-9xl">campaign</span>
                </div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1.5 bg-[#e62e43]/20 text-[#ff4757] text-[10px] font-black rounded-full uppercase tracking-wider border border-[#e62e43]/30">Chiến dịch đang đăng ký</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-6 leading-snug">{selectedCampaign.tenChienDich}</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-start gap-4">
                      <span className="material-symbols-outlined text-[#00b894] shrink-0">calendar_month</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Thời gian</p>
                        <p className="text-sm font-bold text-white">{new Date(selectedCampaign.thoiGianBD).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-start gap-4">
                      <span className="material-symbols-outlined text-[#e62e43] shrink-0">location_on</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Địa điểm</p>
                        <p className="text-sm font-bold text-white line-clamp-1">{selectedCampaign.diaDiem?.tenDiaDiem}</p>
                        <p className="text-xs text-slate-400 mt-1 italic line-clamp-2">{selectedCampaign.diaDiem?.diaChiChiTiet}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full bento-card bg-amber-50 border border-amber-100 p-6">
              <h4 className="font-black text-amber-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-xl">info</span>
                Lưu ý trước khi hiến
              </h4>
              <ul className="text-sm text-amber-900/80 space-y-3 font-medium">
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">verified</span> 
                  <span>Ngủ đủ ít nhất 6 tiếng trước ngày hiến máu.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">verified</span> 
                  <span>Không uống rượu bia trong vòng 24 giờ.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">verified</span> 
                  <span>Ăn nhẹ, tránh thực phẩm nhiều dầu mỡ.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">verified</span> 
                  <span>Mang theo CMND/CCCD hoặc thẻ hiến máu.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Registration Form */}
          <div className="col-span-12 lg:col-span-8">
            <div className="w-full bento-card bg-white p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[150px]">person_check</span>
              </div>
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <span className="material-symbols-outlined text-blue-500 text-3xl">badge</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Thông Tin Cá Nhân</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Các thông tin bắt buộc phải điền chính xác theo CMND/CCCD.</p>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-pulse relative z-10">
                  <span className="material-symbols-outlined text-red-500">error</span>
                  <p className="text-red-700 text-sm font-bold">{error}</p>
                </div>
              )}

              <form className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên <span className="text-[#e62e43]">*</span></label>
                    <input
                      name="hoVaTen"
                      value={formData.hoVaTen}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-300"
                      type="text"
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số CCCD <span className="text-[#e62e43]">*</span></label>
                    <input
                      name="soCCCD"
                      value={formData.soCCCD}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-300"
                      type="text"
                      placeholder="Nhập số CCCD 12 số"
                      maxLength={12}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày sinh <span className="text-[#e62e43]">*</span></label>
                    <input
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Giới tính <span className="text-[#e62e43]">*</span></label>
                    <select
                      name="gioiTinh"
                      value={formData.gioiTinh}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại <span className="text-[#e62e43]">*</span></label>
                    <input
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-300"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phường/Xã <span className="text-[#e62e43]">*</span></label>
                    <select
                      name="phuongXa"
                      value={formData.phuongXa}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {phuongXaList.map(px => (
                        <option key={px.maPhuongXa} value={px.maPhuongXa}>
                          {px.tenPhuongXa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ cư trú cụ thể <span className="text-[#e62e43]">*</span></label>
                  <input
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all placeholder-slate-300"
                    type="text"
                    placeholder="Số nhà, đường, xóm..."
                  />
                </div>

                {/* Donation Volume */}
                <div className="pt-8 mt-8 border-t border-slate-100">
                  <h4 className="text-sm font-black text-[#e62e43] uppercase tracking-wider py-2 border-l-4 border-[#e62e43] pl-4 mb-6">
                    Dung tích máu dự kiến hiến <span className="text-[#e62e43]">*</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: '250', label: '250 ml', note: 'Phù hợp từ 42kg - 45kg', icon: 'water_drop' },
                      { value: '350', label: '350 ml', note: 'Phù hợp trên 45kg', icon: 'bloodtype' },
                      { value: '450', label: '450 ml', note: 'Phù hợp trên 50kg', icon: 'volunteer_activism' },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        className="relative flex flex-col p-5 border-2 border-slate-200 cursor-pointer rounded-2xl bg-white hover:border-[#e62e43]/30 hover:shadow-md transition-all has-[:checked]:border-[#e62e43] has-[:checked]:bg-red-50/50 has-[:checked]:ring-4 has-[:checked]:ring-[#e62e43]/10 group overflow-hidden"
                      >
                        <input
                          type="radio"
                          name="dungTichMau"
                          value={opt.value}
                          checked={formData.dungTichMau === opt.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined text-4xl mb-3 text-slate-300 group-has-[:checked]:text-[#e62e43] transition-colors">{opt.icon}</span>
                        <span className="text-xl font-black text-slate-800 mb-1 group-has-[:checked]:text-[#e62e43]">{opt.label}</span>
                        <span className="text-xs text-slate-500 font-medium">{opt.note}</span>
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-slate-300 group-has-[:checked]:border-[#e62e43] group-has-[:checked]:bg-[#e62e43] flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[14px] text-white opacity-0 group-has-[:checked]:opacity-100 font-bold">check</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* === Banner: Đã đăng ký chiến dịch này rồi === */}
                {alreadyRegistered && (
                  <div className="mt-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                      <span className="material-symbols-outlined text-emerald-500 text-2xl font-bold">check_circle</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-emerald-800 text-base mb-1">Bạn đã đăng ký chiến dịch này rồi!</p>
                      <p className="text-emerald-700/80 text-xs font-medium leading-relaxed">Mỗi tình nguyện viên chỉ có thể tham gia đăng ký một lần cho cùng một chiến dịch. Vui lòng chọn một sự kiện khác.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/chiendich')}
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 uppercase tracking-wider"
                    >
                      Quay Lại Chọn Khác
                    </button>
                  </div>
                )}

                <div className="flex justify-end pt-8 mt-8 border-t border-slate-100">
                  <button
                    onClick={handleNext}
                    disabled={loading || alreadyRegistered}
                    className="w-full md:w-64 h-14 bg-[#e62e43] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#c01b30] transition-all shadow-[0_8px_20px_rgba(230,46,67,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none uppercase tracking-wider"
                    type="button"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ĐANG XỬ LÝ...
                      </>
                    ) : (
                      <>
                        TIẾP THEO
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
