import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chienDichService } from '../services/chienDichService';

export default function DangKyChienDich() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await chienDichService.getChienDichs();
        if (response?.data && Array.isArray(response.data)) {
          setCampaigns(response.data);
        }
        setError(null);
      } catch (err) {
        setError('Lỗi tải danh sách chiến dịch');
        console.error('Error fetching campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleNext = () => {
    if (!selectedCampaign) {
      alert('Vui lòng chọn một chiến dịch');
      return;
    }
    // Store selected campaign in localStorage
    localStorage.setItem('selectedCampaign', JSON.stringify(selectedCampaign));
    navigate('/khai-bao-y-te');
  };

  return (
    <div className="w-full bg-[#fdf8f9] min-h-[calc(100vh-100px)] py-12 px-4 md:px-8">
      <div className="max-w-[1280px] mx-auto">
        {/* Progress Steps */}
        <div className="mb-12 max-w-3xl mx-auto bento-card p-6 md:p-8 bg-white/80 backdrop-blur-xl border border-white">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[15%] h-1.5 bg-gradient-to-r from-[#e62e43] to-[#ff4757] rounded-full -z-10 shadow-[0_0_10px_rgba(230,46,67,0.4)]"></div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e62e43] to-[#c01b30] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#e62e43]/30 ring-4 ring-white">
                1
              </div>
              <span className="text-sm font-black text-[#e62e43] tracking-wide">Chọn chiến dịch</span>
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Chọn Chiến Dịch Hiến Máu</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">Vui lòng chọn một sự kiện hiến máu đang diễn ra phù hợp với khu vực của bạn để tiếp tục quá trình đăng ký.</p>
        </div>

        {loading ? (
          <div className="w-full flex justify-center items-center py-20">
            <div className="text-slate-500">Đang tải danh sách chiến dịch...</div>
          </div>
        ) : error ? (
          <div className="w-full flex justify-center items-center py-20">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Campaign List */}
            <div className="col-span-12 lg:col-span-8">
              <div className="space-y-5">
                {campaigns.length === 0 ? (
                  <div className="w-full bento-card p-12 text-center bg-white/50 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">event_busy</span>
                    <p className="text-slate-500 text-lg font-medium">Hiện không có chiến dịch nào đang mở đăng ký.</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div
                      key={campaign.maChienDich}
                      onClick={() => handleSelectCampaign(campaign)}
                      className={`w-full bento-card p-5 md:p-7 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                        selectedCampaign?.maChienDich === campaign.maChienDich
                          ? 'border-[#e62e43] ring-4 ring-[#e62e43]/10 shadow-[0_8px_30px_rgb(230,46,67,0.15)] bg-white'
                          : 'border-slate-100 hover:shadow-xl hover:border-[#e62e43]/30 bg-white/80'
                      }`}
                    >
                      <div className="flex items-start gap-4 md:gap-6">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-slate-900">{campaign.tenChienDich}</h3>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200">
                              Đang Mở Đăng Ký
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm mb-5 leading-relaxed line-clamp-2">{campaign.moTa}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-[#00b894]">
                                <span className="material-symbols-outlined">calendar_month</span>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Thời gian diễn ra</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">
                                  {new Date(campaign.thoiGianBD).toLocaleDateString('vi-VN')} - {new Date(campaign.thoiGianKT).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-[#e62e43]">
                                <span className="material-symbols-outlined">location_on</span>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Địa điểm tổ chức</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5 line-clamp-1">
                                  {campaign.diaDiem?.tenDiaDiem}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 mt-1 md:mt-2">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedCampaign?.maChienDich === campaign.maChienDich
                              ? 'border-[#e62e43] bg-[#e62e43] shadow-[0_0_15px_rgba(230,46,67,0.4)]'
                              : 'border-slate-300 bg-slate-50'
                          }`}>
                            {selectedCampaign?.maChienDich === campaign.maChienDich && (
                              <span className="material-symbols-outlined text-white text-lg font-bold">check</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selected Campaign Info */}
            <div className="col-span-12 lg:col-span-4">
              {selectedCampaign ? (
                <div className="w-full bento-card p-0 h-fit sticky top-24 overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border-0">
                  <div className="bg-slate-900 p-6 md:p-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e62e43]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                        <span className="material-symbols-outlined text-2xl">receipt_long</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Xác nhận</p>
                        <h3 className="text-xl font-black text-white">Chiến Dịch Đã Chọn</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Tên chiến dịch</p>
                        <p className="text-base font-bold text-white leading-snug">{selectedCampaign.tenChienDich}</p>
                      </div>
                      
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Địa điểm tổ chức</p>
                        <p className="text-sm font-bold text-white">{selectedCampaign.diaDiem?.tenDiaDiem}</p>
                        <p className="text-xs text-slate-400 mt-1.5">{selectedCampaign.diaDiem?.diaChiChiTiet}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Bắt đầu</p>
                          <p className="text-xs font-bold text-white">
                            {new Date(selectedCampaign.thoiGianBD).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Kết thúc</p>
                          <p className="text-xs font-bold text-white">
                            {new Date(selectedCampaign.thoiGianKT).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white">
                    <button
                      onClick={handleNext}
                      className="w-full h-14 bg-[#e62e43] text-white font-black uppercase tracking-wider text-sm rounded-xl hover:bg-[#c01b30] transition-colors flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(230,46,67,0.25)] active:scale-[0.98]"
                    >
                      <span>Tiếp tục Khai Báo</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full bento-card border-2 border-dashed border-slate-200 bg-white/50 p-10 h-fit sticky top-24 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-300">
                      ads_click
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa chọn chiến dịch</h3>
                  <p className="text-sm text-slate-500 mb-8 max-w-[250px]">Vui lòng nhấp chọn một sự kiện từ danh sách bên trái để tiếp tục bước khai báo y tế.</p>
                  
                  <button
                    onClick={() => {
                      const firstCampaign = campaigns[0];
                      if (firstCampaign) {
                        handleSelectCampaign(firstCampaign);
                      }
                    }}
                    className="w-full h-12 border-2 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <span>Chọn tự động</span>
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200/60">
          <button
            onClick={() => navigate('/chiendich')}
            className="px-6 h-12 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 hover:shadow-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại Danh sách
          </button>
        </div>
      </div>
    </div>
  );
}
