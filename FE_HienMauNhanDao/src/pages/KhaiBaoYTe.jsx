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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 mt-2 sm:mt-8 bg-white md:border md:border-slate-200 rounded-2xl shadow-sm mb-16 self-center">
        {/* Progress Steps */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-primary -z-10"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <span className="text-xs font-bold text-primary">Thông tin cá nhân</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">2</div>
              <span className="text-xs font-bold text-primary">Khai báo y tế</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Campaign Info */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
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

            {/* Mã đơn đăng ký */}
            {maDon && (
              <div className="w-full bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-xs font-bold text-green-700 uppercase mb-1">Mã đơn đăng ký</p>
                <p className="text-xl font-black text-green-800 tracking-widest">{maDon}</p>
                <p className="text-xs text-green-600 mt-1">Vui lòng ghi nhớ mã này</p>
              </div>
            )}

            <div className="w-full bg-red-50 border border-red-100 rounded-md p-6 h-fit">
              <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                Lưu ý trước khi hiến
              </h4>
              <ul className="text-[13px] text-slate-700 space-y-3 leading-relaxed">
                <li className="flex gap-2"><span>⬢</span> <span>Ngủ đủ ít nhất 6 tiếng trước ngày hiến máu.</span></li>
                <li className="flex gap-2"><span>⬢</span> <span>Không uống rượu bia trong vòng 24 giờ.</span></li>
                <li className="flex gap-2"><span>⬢</span> <span>Ăn nhẹ, tránh các thực phẩm nhiều dầu mỡ.</span></li>
                <li className="flex gap-2"><span>⬢</span> <span>Mang theo CMND/CCCD hoặc thẻ hiến máu.</span></li>
              </ul>
            </div>
          </div>

          {/* Health Form */}
          <div className="col-span-1 lg:col-span-8">
            <div className="w-full bg-white border border-slate-200 rounded-md p-6 sm:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">fact_check</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Phiếu Khai Báo Y Tế & Sức Khỏe</h3>
                    <p className="text-xs text-slate-500 mt-1">Người hiến máu chịu trách nhiệm về tính trung thực của các thông tin khai báo.</p>
                  </div>
                </div>
              </div>

              <form className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Họ và tên</label>
                    <input
                      className="w-full h-11 border border-slate-200 rounded-md text-sm bg-slate-50 focus:ring-0 focus:border-slate-200 cursor-not-allowed text-slate-500 font-semibold px-3"
                      readOnly
                      type="text"
                      value={thongTinCaNhan.hoVaTen}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Số CCCD</label>
                    <input
                      className="w-full h-11 border border-slate-200 rounded-md text-sm bg-slate-50 focus:ring-0 focus:border-slate-200 cursor-not-allowed text-slate-500 font-semibold px-3"
                      readOnly
                      type="text"
                      value={thongTinCaNhan.soCCCD}
                    />
                  </div>
                </div>

                {/* Health Questions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 py-2.5 border-l-4 border-primary pl-4 bg-slate-50">
                    Tình trạng sức khỏe hiện tại
                  </h4>
                  <div className="space-y-1 border border-slate-100 rounded-lg overflow-hidden">
                    {[
                      { id: 'q1', text: '1. Bạn có đang cảm thấy mệt mỏi, sốt hoặc đau họng không?' },
                      { id: 'q2', text: '2. Bạn có đang dùng thuốc kháng sinh hay điều trị bệnh nào không?' },
                      { id: 'q3', text: '3. Trong 6 tháng qua, bạn có mắc bệnh truyền nhiễm hay phẫu thuật không?' },
                      { id: 'q4', text: '4. Đối với nữ: Bạn có đang trong kỳ kinh nguyệt, mang thai hoặc cho con bú?' },
                    ].map((q, idx) => (
                      <div
                        key={q.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4 sm:gap-0 ${idx < 3 ? 'border-b border-slate-50' : ''}`}
                      >
                        <p className="text-sm text-slate-700 pr-4">{q.text}</p>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'yes')}
                            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                              answers[q.id] === 'yes'
                                ? 'bg-red-50 text-primary border-primary ring-1 ring-primary'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Có
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'no')}
                            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                              answers[q.id] === 'no'
                                ? 'bg-red-50 text-primary border-primary ring-1 ring-primary'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Không
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms and Description */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="flex items-start gap-4 cursor-pointer mb-6">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary border-slate-300"
                    />
                    <span className="text-sm text-slate-600 leading-relaxed font-medium">
                      Tôi cam đoan những thông tin trên là hoàn toàn đúng sự thật. Tôi tự nguyện hiến máu để cứu người và đã hiểu rõ các quyền lợi cũng như rủi ro có thể xảy ra.
                    </span>
                  </label>

                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Mô tả khác
                    </p>
                    <textarea
                      value={moTaKhac}
                      onChange={(e) => setMoTaKhac(e.target.value)}
                      placeholder="Mô tả khác..."
                      className="w-full h-24 border border-slate-200 bg-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    ></textarea>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => navigate('/khai-bao-thong-tin-ca-nhan')}
                    className="w-32 h-12 bg-white text-slate-600 border border-slate-200 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    QUAY LẠI
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="w-64 h-12 bg-red-700 text-white rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                        XÁC NHẬN ĐĂNG KÝ
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
