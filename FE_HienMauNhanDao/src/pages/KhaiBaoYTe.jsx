import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hoSoSucKhoeService } from '../services/HoSoSucKhoeService';

export default function KhaiBaoYTe() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [thongTinCaNhan, setThongTinCaNhan] = useState(null);
  const [maDon, setMaDon] = useState(null);
  const [answers, setAnswers] = useState({
    q1: 'no',
    q2: 'no',
    q3: 'no',
    q4: 'no'
  });
  const [moTaKhac, setMoTaKhac] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const campaign = localStorage.getItem('selectedCampaign');
    const thongTin = localStorage.getItem('thongTinCaNhan');
    const savedMaDon = localStorage.getItem('maDon');

    if (!campaign || !thongTin || !savedMaDon) {
      navigate('/chiendich');
      return;
    }

    setSelectedCampaign(JSON.parse(campaign));
    setThongTinCaNhan(JSON.parse(thongTin));
    setMaDon(savedMaDon);
  }, [navigate]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = async () => {
    if (!terms) {
      setError('Vui lòng xác nhận cam đoan thông tin');
      return;
    }

    if (!maDon) {
      setError('Không tìm thấy mã đơn đăng ký. Vui lòng quay lại bước trước.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Gọi API tạo hồ sơ sức khỏe với maDon
      const hoSoData = {
        maDon: maDon,
        khangSinh: answers.q2 === 'yes',
        truyenNhiem: answers.q3 === 'yes',
        dauHong: answers.q1 === 'yes',
        coThai: answers.q4 === 'yes',
        moTaKhac: moTaKhac || null
      };

      await hoSoSucKhoeService.create(hoSoData);

      localStorage.setItem('healthAnswers', JSON.stringify(answers));
      localStorage.setItem('moTaKhac', moTaKhac);

      navigate('/xac-nhan-dang-ky/' + maDon);
    } catch (err) {
      console.error('Error saving health info:', err);
      setError(err.message || 'Lỗi khi lưu thông tin y tế. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCampaign || !thongTinCaNhan) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-slate-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fdf8f9] min-h-[calc(100vh-100px)] py-12 px-4 md:px-8">
      <main className="max-w-[1280px] mx-auto">
        {/* Progress Steps */}
        {/* Progress Steps */}
        <div className="mb-12 max-w-3xl mx-auto bento-card p-6 md:p-8 bg-white/80 backdrop-blur-xl border border-white">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[50%] h-1.5 bg-gradient-to-r from-[#00b894] to-[#00b894] rounded-full -z-10 shadow-[0_0_10px_rgba(0,184,148,0.4)]"></div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00b894] to-[#00a884] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#00b894]/30 ring-4 ring-white">
                <span className="material-symbols-outlined text-2xl font-bold">check</span>
              </div>
              <span className="text-sm font-black text-[#00b894] tracking-wide">Thông tin cá nhân</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e62e43] to-[#c01b30] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#e62e43]/30 ring-4 ring-white">
                2
              </div>
              <span className="text-sm font-black text-[#e62e43] tracking-wide">Khai báo y tế</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg shadow-inner ring-4 ring-white">
                3
              </div>
              <span className="text-sm font-bold text-slate-400">Xác nhận</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Campaign Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
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

            {/* Mã đơn đăng ký */}
            {maDon && (
              <div className="w-full bento-card bg-emerald-50 border border-emerald-100 p-6 flex flex-col items-center text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Mã đơn đăng ký của bạn</p>
                <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-emerald-100 mb-2">
                  <p className="text-2xl font-black text-emerald-800 tracking-widest">{maDon}</p>
                </div>
                <p className="text-xs text-emerald-600 font-medium">Vui lòng ghi nhớ mã này để xác nhận khi đến điểm hiến máu</p>
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
                  <span>Ăn nhẹ, tránh các thực phẩm nhiều dầu mỡ.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">verified</span> 
                  <span>Mang theo CMND/CCCD hoặc thẻ hiến máu.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Health Form */}
          <div className="col-span-12 lg:col-span-8">
            <div className="w-full bento-card bg-white p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[150px]">medical_information</span>
              </div>
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                  <span className="material-symbols-outlined text-[#e62e43] text-3xl">fact_check</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Khai Báo Y Tế & Sức Khỏe</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Người hiến máu chịu trách nhiệm về tính trung thực của thông tin khai báo.</p>
                </div>
              </div>

              <form className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 cursor-not-allowed focus:outline-none"
                      readOnly
                      type="text"
                      value={thongTinCaNhan.hoVaTen}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Số CMND/CCCD</label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 cursor-not-allowed focus:outline-none"
                      readOnly
                      type="text"
                      value={thongTinCaNhan.soCCCD}
                    />
                  </div>
                </div>

                {/* Health Questions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#e62e43] uppercase tracking-wider py-2 border-l-4 border-[#e62e43] pl-4">
                    Bảng câu hỏi sàng lọc sức khỏe
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: 'q1', text: '1. Bạn có đang cảm thấy mệt mỏi, sốt hoặc đau họng không?' },
                      { id: 'q2', text: '2. Bạn có đang dùng thuốc kháng sinh hay điều trị bệnh nào không?' },
                      { id: 'q3', text: '3. Trong 6 tháng qua, bạn có mắc bệnh truyền nhiễm hay phẫu thuật không?' },
                      { id: 'q4', text: '4. Đối với nữ: Bạn có đang trong kỳ kinh nguyệt, mang thai hoặc cho con bú?' },
                    ].map((q) => (
                      <div
                        key={q.id}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 gap-4 md:gap-6 ${
                          answers[q.id] === 'yes'
                            ? 'bg-red-50/50 border-red-200 shadow-sm'
                            : answers[q.id] === 'no'
                            ? 'bg-emerald-50/30 border-emerald-100'
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        <p className="text-sm font-bold text-slate-700 flex-1">{q.text}</p>
                        <div className="flex gap-2 w-full md:w-auto shrink-0 bg-slate-100/50 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'yes')}
                            className={`flex-1 md:w-20 h-10 text-xs font-black rounded-lg transition-all ${
                              answers[q.id] === 'yes'
                                ? 'bg-[#e62e43] text-white shadow-md'
                                : 'text-slate-500 hover:bg-white hover:shadow-sm'
                            }`}
                          >
                            CÓ
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'no')}
                            className={`flex-1 md:w-20 h-10 text-xs font-black rounded-lg transition-all ${
                              answers[q.id] === 'no'
                                ? 'bg-[#00b894] text-white shadow-md'
                                : 'text-slate-500 hover:bg-white hover:shadow-sm'
                            }`}
                          >
                            KHÔNG
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms and Description */}
                <div className="p-6 md:p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="mb-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                      Ghi chú thêm (Nếu có)
                    </p>
                    <textarea
                      value={moTaKhac}
                      onChange={(e) => setMoTaKhac(e.target.value)}
                      placeholder="Mô tả các vấn đề sức khỏe khác (nếu có)..."
                      className="w-full h-24 border border-slate-200 bg-white rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00b894]/50 focus:border-[#00b894] resize-none shadow-sm transition-all"
                    ></textarea>
                  </div>
                  
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#e62e43]/50 checked:bg-[#e62e43] checked:border-[#e62e43] transition-all cursor-pointer"
                      />
                      <span className="material-symbols-outlined text-white text-[14px] font-bold absolute pointer-events-none opacity-0 peer-checked:opacity-100">check</span>
                    </div>
                    <span className="text-sm text-slate-600 leading-relaxed font-bold group-hover:text-slate-900 transition-colors">
                      Tôi xin cam đoan những thông tin khai báo trên là hoàn toàn đúng sự thật. Tôi tự nguyện hiến máu để cứu người và đã hiểu rõ các quyền lợi cũng như rủi ro có thể xảy ra.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-pulse">
                    <span className="material-symbols-outlined text-red-500">error</span>
                    <p className="text-red-700 text-sm font-bold">{error}</p>
                  </div>
                )}

                <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-8 gap-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate('/khai-bao-thong-tin-ca-nhan')}
                    className="w-full md:w-40 h-14 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    type="button"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    QUAY LẠI
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full md:w-64 h-14 bg-[#e62e43] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#c01b30] transition-all shadow-[0_8px_20px_rgba(230,46,67,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    type="button"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ĐANG LƯU...
                      </>
                    ) : (
                      <>
                        XÁC NHẬN ĐĂNG KÝ
                        <span className="material-symbols-outlined text-xl">check_circle</span>
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
