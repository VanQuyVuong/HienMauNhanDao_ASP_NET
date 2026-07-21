import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donDangKyService } from '../services/donDangKy';

export default function GiayChungNhanPage() {
  const { maDon } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await donDangKyService.getById(maDon);
        setData(response.data || response);
      } catch (error) {
        console.error("Lỗi lấy thông tin chứng nhận:", error);
      } finally {
        setLoading(false);
      }
    };
    if (maDon) fetchData();
  }, [maDon]);

  if (loading || !data) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  const tnv = data.tinhNguyenVien;
  const chienDich = data.chienDich;

  return (
    <div className="min-h-screen bg-orange-50/50 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Background decorations matching the image */}
        <div className="absolute top-10 right-10 opacity-60 transform rotate-45 hidden sm:block">
            <div className="flex gap-2">
                {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-16 bg-red-600 rounded-full"></div>)}
            </div>
        </div>
        <div className="absolute bottom-10 right-10 opacity-60 transform -rotate-45 hidden sm:block">
            <div className="flex gap-2">
                {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-16 bg-red-600 rounded-full"></div>)}
            </div>
        </div>
        <div className="absolute top-10 left-10 opacity-60 transform -rotate-45 hidden sm:block">
            <div className="flex gap-2">
                {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-16 bg-orange-200 rounded-full"></div>)}
            </div>
        </div>
        <div className="absolute bottom-10 left-10 opacity-60 transform rotate-45 hidden sm:block">
            <div className="flex gap-2">
                {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-16 bg-orange-200 rounded-full"></div>)}
            </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-white w-full max-w-[900px] rounded-[30px] shadow-2xl p-6 sm:p-12 relative z-10 border-[6px] sm:border-[10px] border-white bg-clip-padding" style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.1)' }}>
            
            {/* Header Logos Placeholder */}
            <div className="flex justify-center gap-6 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-red-100">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-red-600" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-blue-800" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-sky-500" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                </div>
            </div>

            {/* Top Red Drop */}
            <div className="flex justify-center mb-6 sm:mb-8 relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(220,38,38,0.4)]">
                    <span className="material-symbols-outlined text-white text-4xl sm:text-5xl opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                </div>
            </div>

            <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-sm sm:text-xl font-bold text-red-800 uppercase tracking-widest font-sans">
                    GIẤY CHỨNG NHẬN HIẾN MÁU TÌNH NGUYỆN
                </h2>

                <h1 className="text-xl sm:text-3xl leading-tight font-black text-red-600 uppercase tracking-tight font-sans mt-2 mb-4 sm:mb-8 px-2 max-w-[800px] mx-auto break-words">
                    "{chienDich?.tenChienDich || 'CHỦ NHẬT ĐỎ'}"
                </h1>

                <div className="w-[90%] sm:w-[80%] mx-auto mt-6 sm:mt-10 space-y-3 sm:space-y-4 text-left text-sm sm:text-[17px] leading-relaxed">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-6">
                        <span className="font-bold text-slate-800 w-full sm:w-36">Người hiến:</span>
                        <span className="text-red-700 uppercase font-black text-lg sm:text-xl">{tnv?.hoVaTen}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-6">
                        <span className="font-bold text-slate-800 w-full sm:w-36">Lượng máu:</span>
                        <span className="text-slate-700 font-bold">{data.theTich ? data.theTich.toString().replace('ML_', '') : '350'} ml</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-6">
                        <span className="font-bold text-slate-800 w-full sm:w-36">Thời gian:</span>
                        <span className="text-slate-700">{new Date(chienDich?.thoiGianBD).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-6">
                        <span className="font-bold text-slate-800 w-full sm:w-36">Địa điểm:</span>
                        <span className="text-slate-700">{chienDich?.diaDiem?.tenDiaDiem || 'Điểm hiến máu'}</span>
                    </div>
                </div>

                <div className="mt-8 sm:mt-14 mb-4 sm:mb-8">
                    <p className="text-lg sm:text-[22px] font-serif italic text-red-800/90 font-medium tracking-wide">
                        "Một giọt máu cho đi - Một cuộc đời ở lại"
                    </p>
                </div>

                {/* Footer details */}
                <div className="text-center mt-8 sm:mt-12 pt-4 sm:pt-8 flex flex-col items-center">
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">Mọi thông tin chi tiết, vui lòng liên hệ</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">Cơ sở y tế: {chienDich?.diaDiem?.tenDiaDiem} (SĐT: 1900 1234)</span>
                </div>
            </div>

            {/* Bottom Right Decoration */}
            <div className="absolute bottom-6 right-6 sm:bottom-12 sm:right-16 opacity-95 print:right-12 print:bottom-12">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-tr-full rounded-br-full rounded-bl-full rounded-tl-[4px] rotate-45 shadow-[0_10px_25px_rgba(220,38,38,0.5)] flex items-center justify-center relative border border-red-500/30">
                    <div className="-rotate-45 absolute top-[55%] left-[55%] -translate-x-1/2 -translate-y-1/2 text-sky-200 text-3xl sm:text-5xl font-black drop-shadow-md">
                        +
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons (Not printed) */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden relative z-20 w-full max-w-[900px] px-4 justify-center">
            <button onClick={() => window.print()} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">print</span> IN GIẤY CHỨNG NHẬN
            </button>
            <button onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors border border-slate-200 flex justify-center">
                QUAY LẠI
            </button>
        </div>

        {/* CSS for print */}
        <style dangerouslySetInnerHTML={{__html: `
            @media print {
                body, html { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; width: 100%; height: 100%; }
                .min-h-screen { min-height: 100vh !important; background: white !important; padding: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; }
                .shadow-2xl { box-shadow: none !important; }
                /* Scale the card slightly to ensure it fits perfectly within A4 landscape */
                .bg-clip-padding { transform: scale(0.9); transform-origin: center center; }
                * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
                @page { size: A4 landscape; margin: 0; }
            }
        `}} />
    </div>
  );
}
