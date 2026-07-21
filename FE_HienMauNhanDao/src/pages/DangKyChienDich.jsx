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
    <div className="flex-1 p-8 flex items-center justify-center bg-[#F3F4F6] min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[1200px]">
        {/* Progress Steps */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-primary -z-10"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">
                1
              </div>
              <span className="text-xs font-bold text-primary">Chọn chiến dịch</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">
                2
              </div>
              <span className="text-xs font-bold text-slate-500">Khai báo y tế</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-white">
                3
              </div>
              <span className="text-xs font-bold text-slate-500">Xác nhận</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">CHỌN CHIẾN DỊCH HIẾN MÁU</h1>
          <p className="text-slate-500 text-sm mt-1">Vui lòng chọn chiến dịch mà bạn muốn tham gia</p>
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
            <div className="col-span-8">
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="w-full bg-white border border-slate-200 rounded-lg p-8 text-center">
                    <p className="text-slate-500">Hiện không có chiến dịch nào</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div
                      key={campaign.maChienDich}
                      onClick={() => handleSelectCampaign(campaign)}
                      className={`w-full bg-white border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedCampaign?.maChienDich === campaign.maChienDich
                          ? 'border-primary shadow-lg'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-800">{campaign.tenChienDich}</h3>
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                              Đang mở
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm mb-4">{campaign.moTa}</p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
                              <div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase">Thời gian</p>
                                <p className="text-sm font-semibold text-slate-700">
                                  {new Date(campaign.thoiGianBD).toLocaleString('vi-VN')} - {new Date(campaign.thoiGianKT).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                              <div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase">Địa điểm</p>
                                <p className="text-sm font-semibold text-slate-700">
                                  {campaign.diaDiem?.tenDiaDiem}
                                </p>
                                <p className="text-xs text-slate-400 italic">{campaign.diaDiem?.diaChiChiTiet}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedCampaign?.maChienDich === campaign.maChienDich
                              ? 'border-primary bg-primary'
                              : 'border-slate-300'
                          }`}>
                            {selectedCampaign?.maChienDich === campaign.maChienDich && (
                              <span className="material-symbols-outlined text-white text-sm">check</span>
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
            <div className="col-span-4">
              {selectedCampaign ? (
                <div className="w-full bg-white border border-slate-200 rounded-lg p-6 h-fit shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Chiến dịch đã chọn</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold uppercase mb-1">Tên chiến dịch</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedCampaign.tenChienDich}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold uppercase mb-1">Địa điểm</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedCampaign.diaDiem?.tenDiaDiem}</p>
                      <p className="text-xs text-slate-400 italic mt-1">{selectedCampaign.diaDiem?.diaChiChiTiet}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold uppercase mb-1">Thời gian bắt đầu</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(selectedCampaign.thoiGianBD).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-bold uppercase mb-1">Thời gian kết thúc</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(selectedCampaign.thoiGianKT).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-red-800 transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                  >
                    <span>Tiếp tục</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              ) : (
                <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 h-fit sticky top-24">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 flex justify-center mb-4">
                      assignment
                    </span>
                    <p className="text-slate-500 font-semibold mb-4">Bạn chưa chọn chiến dịch</p>
                    <p className="text-xs text-slate-400 mb-6">Vui lòng chọn một chiến dịch từ danh sách bên trái để tiếp tục</p>
                    <button
                      onClick={() => {
                        const firstCampaign = campaigns[0];
                        if (firstCampaign) {
                          handleSelectCampaign(firstCampaign);
                        }
                      }}
                      className="w-full h-10 border border-primary text-primary font-bold rounded-lg hover:bg-red-50 transition-all text-sm"
                    >
                      Chọn chiến dịch
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={() => navigate('/')}
            className="px-6 h-12 bg-white text-slate-600 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
