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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 mt-2 sm:mt-8 bg-white md:border md:border-slate-200 rounded-2xl shadow-sm mb-16 self-center">
        {/* Progress Steps */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">1</div>
              <span className="text-xs font-bold text-primary">Thông tin cá nhân</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm ring-4 ring-white">2</div>
              <span className="text-xs font-bold text-slate-400">Khai báo y tế</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">ĐĂNG KÝ HIẾN MÁU</h1>
          <p className="text-slate-500 text-sm mt-1">Vui lòng cung cấp thông tin cá nhân và chọn dung tích hiến máu.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Campaign Info */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            {selectedCampaign && (
              <div className="w-full bg-white border border-slate-200 rounded-md p-6 relative overflow-hidden h-fit shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-8xl">campaign</span>
                </div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Chiến dịch đang diễn ra</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-6">{selectedCampaign.tenChienDich}</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary shrink-0">calendar_month</span>
                      <div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase">Thời gian</p>
                        <p className="text-sm font-semibold text-slate-700">{new Date(selectedCampaign.thoiGianBD).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary shrink-0">location_on</span>
                      <div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase">Địa điểm</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedCampaign.diaDiem?.tenDiaDiem}</p>
                        <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">{selectedCampaign.diaDiem?.diaChiChiTiet}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full bg-red-50 border border-red-100 rounded-md p-6 h-fit">
              <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                Lưu ý trước khi hiến
              </h4>
              <ul className="text-[13px] text-slate-700 space-y-3 leading-relaxed">
                <li className="flex gap-2"><span>•</span> <span>Ngủ đủ ít nhất 6 tiếng trước ngày hiến máu.</span></li>
                <li className="flex gap-2"><span>•</span> <span>Không uống rượu bia trong vòng 24 giờ.</span></li>
                <li className="flex gap-2"><span>•</span> <span>Ăn nhẹ, tránh các thực phẩm nhiều dầu mỡ.</span></li>
                <li className="flex gap-2"><span>•</span> <span>Mang theo CMND/CCCD hoặc thẻ hiến máu.</span></li>
              </ul>
            </div>
          </div>

          {/* Registration Form */}
          <div className="col-span-1 lg:col-span-8">
            <div className="w-full bg-white border border-slate-200 rounded-md p-6 sm:p-10 h-full shadow-sm">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-3xl">person</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Thông Tin Cá Nhân</h3>
                  <p className="text-xs text-slate-500 mt-1">Các thông tin bắt buộc phải điền chính xác theo CMND/CCCD.</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                    <input
                      name="hoVaTen"
                      value={formData.hoVaTen}
                      onChange={handleInputChange}
                      className="w-full h-11 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary outline-none placeholder-slate-400 px-3"
                      type="text"
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Số CCCD <span className="text-red-500">*</span></label>
                    <input
                      name="soCCCD"
                      value={formData.soCCCD}
                      onChange={handleInputChange}
                      className="w-full h-11 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary outline-none placeholder-slate-400 px-3"
                      type="text"
                      placeholder="Nhập số CCCD 12 số"
                      maxLength={12}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Ngày sinh <span className="text-red-500">*</span></label>
                    <input
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                      className="w-full h-11 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary outline-none px-3"
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Giới tính <span className="text-red-500">*</span></label>
                    <select
                      name="gioiTinh"
                      value={formData.gioiTinh}
                      onChange={handleInputChange}
                      className="w-full h-11 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary outline-none px-3"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleInputChange}
                      className="w-full h-11 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary outline-none placeholder-slate-400 px-3"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Phường/Xã <span className="text-red-500">*</span></label>
                    <select
                      name="phuongXa"
                      value={formData.phuongXa}
                      onChange={handleInputChange}
                      className="w-full h-11 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary outline-none px-3"
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
                  <label className="block text-sm font-bold text-slate-700">Địa chỉ cư trú <span className="text-red-500">*</span></label>
                  <input
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleInputChange}
                    className="w-full h-11 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary outline-none placeholder-slate-400 px-3"
                    type="text"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>

                {/* Donation Volume */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 py-2.5 border-l-4 border-primary pl-4 bg-slate-50 mb-4">
                    Dung tích máu dự kiến hiến <span className="text-red-500">*</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { value: '250', label: '250 ml', note: 'Phù hợp từ 42kg - 45kg' },
                      { value: '350', label: '350 ml', note: 'Phù hợp trên 45kg' },
                      { value: '450', label: '450 ml', note: 'Phù hợp trên 50kg' },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        className="relative flex flex-col p-4 border border-slate-200 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-red-50 has-[:checked]:ring-1 has-[:checked]:ring-primary"
                      >
                        <input
                          type="radio"
                          name="dungTichMau"
                          value={opt.value}
                          checked={formData.dungTichMau === opt.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="text-lg font-bold text-slate-800 mb-1">{opt.label}</span>
                        <span className="text-xs text-slate-500 font-medium">{opt.note}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* === Banner: Đã đăng ký chiến dịch này rồi === */}
                {alreadyRegistered && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-xl flex items-start gap-4">
                    <span className="material-symbols-outlined text-green-600 text-2xl shrink-0 mt-0.5">check_circle</span>
                    <div className="flex-1">
                      <p className="font-bold text-green-800 text-sm">Bạn đã đăng ký chiến dịch này rồi!</p>
                      <p className="text-green-700 text-xs mt-1">Bạn chỉ có thể đăng ký mỗi chiến dịch một lần. Vui lòng chọn chiến dịch khác.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/chiendich')}
                      className="shrink-0 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Về trang chiến dịch
                    </button>
                  </div>
                )}

                {/* === Lỗi thông thường === */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">error</span>
                    {error}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNext}
                    disabled={loading || alreadyRegistered}
                    className="w-48 h-12 bg-slate-800 text-white rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        TIẾP THEO
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
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
