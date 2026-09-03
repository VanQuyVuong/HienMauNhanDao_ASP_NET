import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chienDichService } from '../services/chienDichService';
import { DiaDiemService } from '../services/DiaDiemService';
import Swal from 'sweetalert2';

export default function DangKyChienDich() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chienDich'); // 'chienDich' | 'thuongXuyen'
  const [campaigns, setCampaigns] = useState([]);
  const [fixedFacilities, setFixedFacilities] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // State riêng cho Đăng ký Thường xuyên
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Ca Sáng (07:30 - 11:30)');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Tải chiến dịch
        const cdRes = await chienDichService.getChienDichs();
        let cdList = Array.isArray(cdRes) ? cdRes : (cdRes?.data || []);
        setCampaigns(cdList);

        // Tải danh sách địa điểm y tế cố định
        const ddRes = await DiaDiemService.getDiaDiems();
        let ddList = Array.isArray(ddRes) ? ddRes : (ddRes?.data || []);
        // Lọc địa điểm cố định / bệnh viện
        const fixedList = ddList.filter(d => d.hinhThuc === 'CoDinh' || d.loaiDiaDiem === 'BenhVien' || d.loaiDiaDiem === 'CoQuan');
        setFixedFacilities(fixedList.length > 0 ? fixedList : ddList);
        if (fixedList.length > 0) setSelectedFacility(fixedList[0]);

        setError(null);
      } catch (err) {
        setError('Lỗi tải dữ liệu. Vui lòng thử lại.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleNextChienDich = () => {
    if (!selectedCampaign) {
      Swal.fire('Thông báo', 'Vui lòng chọn một chiến dịch để tiếp tục!', 'warning');
      return;
    }
    localStorage.setItem('selectedCampaign', JSON.stringify(selectedCampaign));
    navigate('/khai-bao-thong-tin-ca-nhan');
  };

  const handleNextThuongXuyen = () => {
    if (!selectedFacility) {
      Swal.fire('Thông báo', 'Vui lòng chọn một địa điểm y tế cố định!', 'warning');
      return;
    }
    
    // Đóng gói thông tin Đăng ký Thường xuyên
    const thuongXuyenCampaign = {
      maChienDich: 'CD00004', // Mã chiến dịch đại diện cho hiến máu thường xuyên
      tenChienDich: `Hiến máu Thường xuyên tại ${selectedFacility.tenDiaDiem}`,
      isThuongXuyen: true,
      maDiaDiem: selectedFacility.maDiaDiem,
      diaDiem: selectedFacility,
      ngayHen: selectedDate,
      caHen: selectedTimeSlot,
      thoiGianBD: `${selectedDate}T07:30:00`,
      thoiGianKT: `${selectedDate}T16:30:00`
    };

    localStorage.setItem('selectedCampaign', JSON.stringify(thuongXuyenCampaign));
    navigate('/khai-bao-thong-tin-ca-nhan');
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
              <span className="text-sm font-black text-[#e62e43] tracking-wide">Chọn hình thức</span>
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

        {/* Tab Selection Header */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Đăng Ký Tham Gia Hiến Máu</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">Vui lòng chọn hình thức hiến máu theo chiến dịch sự kiện hoặc đăng ký hiến máu thường xuyên tại Bệnh viện.</p>
          
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl gap-2 shadow-inner border border-slate-300/60 max-w-xl w-full">
            <button
              onClick={() => setActiveTab('chienDich')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'chienDich'
                  ? 'bg-[#e62e43] text-white shadow-lg shadow-red-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">event</span>
              <span>📅 Chiến dịch & Khẩn cấp</span>
            </button>
            <button
              onClick={() => setActiveTab('thuongXuyen')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'thuongXuyen'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">local_hospital</span>
              <span>🏥 Hiến Máu Thường Xuyên</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="w-full flex justify-center items-center py-20">
            <div className="text-slate-500 font-bold">Đang tải danh sách địa điểm & chiến dịch...</div>
          </div>
        ) : error ? (
          <div className="w-full flex justify-center items-center py-20">
            <div className="text-red-500 font-bold">{error}</div>
          </div>
        ) : activeTab === 'chienDich' ? (
          /* ---------------- TAB 1: CHIẾN DỊCH & ĐỢT KHẨN CẤP ---------------- */
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
              <div className="space-y-5">
                {campaigns.length === 0 ? (
                  <div className="w-full bento-card p-12 text-center bg-white/50 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">event_busy</span>
                    <p className="text-slate-500 text-lg font-medium">Hiện không có chiến dịch nào đang mở đăng ký.</p>
                  </div>
                ) : (
                  campaigns.map((campaign) => {
                    const isKhanCap = campaign.mucDoUuTien === "KhanCap" || campaign.mucDoUuTien === 1;
                    return (
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
                              {isKhanCap ? (
                                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-md animate-pulse">
                                  🚨 Khẩn Cấp (12H)
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200">
                                  Đang Mở Đăng Ký
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm mb-5 leading-relaxed line-clamp-2">{campaign.moTa || "Chiến dịch tiếp nhận máu tình nguyện tại khu vực Đà Nẵng."}</p>
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
                                    {campaign.diaDiem?.tenDiaDiem || "Bệnh viện Đa Khoa Đà Nẵng"}
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
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Campaign Sidebar Confirmation */}
            <div className="col-span-12 lg:col-span-4">
              {selectedCampaign ? (
                <div className="w-full bento-card p-0 sticky top-24 overflow-hidden shadow-2xl border-0">
                  <div className="bg-slate-900 p-6 md:p-8 relative">
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                        <span className="material-symbols-outlined text-2xl">receipt_long</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Xác nhận chọn</p>
                        <h3 className="text-xl font-black text-white">Chiến Dịch Sự Kiện</h3>
                      </div>
                    </div>
                    <div className="space-y-4 text-left">
                      <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tên chiến dịch</p>
                        <p className="text-base font-bold text-white leading-snug">{selectedCampaign.tenChienDich}</p>
                      </div>
                      <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Địa điểm tổ chức</p>
                        <p className="text-sm font-bold text-white">{selectedCampaign.diaDiem?.tenDiaDiem}</p>
                        <p className="text-xs text-slate-400 mt-1">{selectedCampaign.diaDiem?.diaChiChiTiet}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <button
                      onClick={handleNextChienDich}
                      className="w-full h-14 bg-[#e62e43] text-white font-black uppercase tracking-wider text-sm rounded-xl hover:bg-[#c01b30] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                      <span>Tiếp tục Khai Báo Y Tế</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full bento-card border-2 border-dashed border-slate-200 bg-white/50 p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-3">ads_click</span>
                  <h3 className="text-base font-bold text-slate-700 mb-1">Chưa chọn chiến dịch</h3>
                  <p className="text-xs text-slate-500 mb-4">Vui lòng nhấp chọn 1 sự kiện từ danh sách bên trái.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ---------------- TAB 2: HIẾN MÁU THƯỜNG XUYÊN TẠI BỆNH VIỆN ---------------- */
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-100 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <span className="material-symbols-outlined text-2xl">local_hospital</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">1. Chọn Địa Điểm Tiếp Nhận Máu Cố Định</h3>
                    <p className="text-xs text-slate-500 font-medium">Tiếp nhận định kỳ hàng ngày tại các Bệnh viện & Trung tâm Y tế lớn ở Đà Nẵng</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fixedFacilities.map((fac) => (
                    <div
                      key={fac.maDiaDiem}
                      onClick={() => setSelectedFacility(fac)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                        selectedFacility?.maDiaDiem === fac.maDiaDiem
                          ? 'border-emerald-600 bg-emerald-50/50 ring-4 ring-emerald-500/10 shadow-md'
                          : 'border-slate-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedFacility?.maDiaDiem === fac.maDiaDiem
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-slate-100'
                      }`}>
                        {selectedFacility?.maDiaDiem === fac.maDiaDiem && (
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{fac.tenDiaDiem}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-emerald-600">location_on</span>
                          <span>{fac.diaChiChiTiet}</span>
                        </p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase rounded-full">
                          Mở cửa hàng ngày
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chọn Ngày & Khung Giờ Hẹn */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-100 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                    <span className="material-symbols-outlined text-2xl">schedule</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">2. Chọn Ngày & Khung Giờ Dự Định Đến</h3>
                    <p className="text-xs text-slate-500 font-medium">Đặt lịch giúp y bác sĩ chuẩn bị tiếp đón chu đáo và không phải chờ đợi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Ngày dự định hiến</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-600 transition-all bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Khung giờ hẹn tiếp nhận</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-600 transition-all bg-slate-50 cursor-pointer"
                    >
                      <option value="Ca Sáng (07:30 - 11:30)">🌅 Ca Sáng (07:30 - 11:30)</option>
                      <option value="Ca Chiều (13:30 - 16:30)">☀️ Ca Chiều (13:30 - 16:30)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Xác nhận Lịch hẹn Thường Xuyên */}
            <div className="col-span-12 lg:col-span-4">
              <div className="w-full bento-card p-0 sticky top-24 overflow-hidden shadow-2xl border-0">
                <div className="bg-emerald-950 p-6 md:p-8 text-white relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/20">
                      <span className="material-symbols-outlined text-2xl">event_available</span>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Phiếu Đặt Lịch</p>
                      <h3 className="text-xl font-black text-white">Hiến Máu Thường Xuyên</h3>
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="bg-emerald-900/60 p-4 rounded-2xl border border-emerald-800/50">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Địa điểm bệnh viện</p>
                      <p className="text-base font-bold text-white leading-snug">{selectedFacility?.tenDiaDiem || "Chưa chọn"}</p>
                      <p className="text-xs text-emerald-200 mt-1">{selectedFacility?.diaChiChiTiet}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Ngày hẹn</p>
                        <p className="text-xs font-bold text-white">{new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Khung giờ</p>
                        <p className="text-xs font-bold text-white truncate">{selectedTimeSlot.split(' ')[0]} {selectedTimeSlot.split(' ')[1]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white">
                  <button
                    onClick={handleNextThuongXuyen}
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <span>Tiếp tục Khai Báo Y Tế</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
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
