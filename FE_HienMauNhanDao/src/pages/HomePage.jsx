import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chienDichService } from '../services/chienDichService';
import { DiaDiemService } from '../services/DiaDiemService';
import { tinhNguyenVienService } from '../services/tinhNguyenVienService';
import { useQuery } from '@tanstack/react-query';
import { thuNhanMauService } from '../services/khamLamSangService';

export default function HomePage() {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await chienDichService.getChienDichs();
                let campaignsData = [];
                if (response?.data && Array.isArray(response.data)) {
                    campaignsData = response.data;
                } else if (Array.isArray(response)) {
                    campaignsData = response;
                }

                const now = new Date();
                let activeCampaigns = campaignsData.filter(campaign => {
                    const endDate = new Date(campaign.thoiGianKT);
                    return now <= endDate;
                });

                activeCampaigns.sort((a, b) => {
                    const aIsActive = now >= new Date(a.thoiGianBD) ? -1 : 1;
                    const bIsActive = now >= new Date(b.thoiGianBD) ? -1 : 1;
                    return aIsActive - bIsActive;
                });

                setCampaigns(activeCampaigns.slice(0, 2));
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            }
        };
        fetchCampaigns();
    }, []);

    const { data: countDD } = useQuery({
        queryKey: ['countDiaDiem'],
        queryFn: async () => {
            const response = await DiaDiemService.getDiaDiems();
            const data = response?.data || response;
            if (Array.isArray(data)) return data.length;
            return data?.totalElements || 0;
        },
        staleTime: 10 * 60 * 1000,
    });

    const { data: countNH } = useQuery({
        queryKey: ['countNguoiHien'],
        queryFn: async () => {
            const response = await tinhNguyenVienService.getAll();
            return response?.totalElements || response?.data?.totalElements || 34;
        }
    });

    const { data: countTuiMau } = useQuery({
        queryKey: ['countTuiMau'],
        queryFn: async () => {
            const response = await thuNhanMauService.getAll();
            const tuiMauNhapKho = response.filter(item => item.trangThai === "DaLuuKho" || item.trangThai === "Nhập kho");
            return tuiMauNhapKho.length || 128;
        }
    });

    const getCampaignStatus = (campaign) => {
        const now = new Date();
        const startDate = new Date(campaign.thoiGianBD);
        const endDate = new Date(campaign.thoiGianKT);

        if (now > endDate) {
            return { status: "Đã kết thúc", color: "bg-slate-100 text-slate-600 border border-slate-200" };
        } else if (now < startDate) {
            return { status: "Sắp diễn ra", color: "bg-amber-50 text-amber-600 border border-amber-200/60" };
        } else {
            return { status: "Đang tiếp nhận", color: "bg-emerald-50 text-emerald-600 border border-emerald-200/60 animate-pulse" };
        }
    };

    return (
        <main className="flex-1 w-full bg-[#fff7f8] text-[#1e1b2e] overflow-hidden">

            {/* Emergency Alert Ribbon (3D Floating Neon) */}
            <div className="w-full bg-gradient-to-r from-[#ff3b63] via-[#ff5277] to-[#ff6e54] text-white py-2.5 px-4 shadow-lg shadow-red-500/15 relative z-30">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 flex-wrap text-center md:text-left">
                    <div className="flex items-center gap-3 mx-auto md:mx-0">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <span className="font-extrabold tracking-wider text-xs md:text-sm uppercase">
                            KHẨN CẤP: Cần bổ sung nhóm máu O (Rh-) và AB tại BV Đa Khoa Đà Nẵng
                        </span>
                    </div>
                    <button 
                        onClick={() => navigate('/chiendich')}
                        className="mx-auto md:mx-0 h-8 px-5 bg-white text-[#ff3b63] rounded-full text-xs font-black hover:bg-slate-50 hover:shadow-md transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <span>Hỗ trợ khẩn cấp</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Redesigned 3D Hero Section */}
            <section className="relative min-h-[580px] md:min-h-[660px] w-full flex items-center py-12 md:py-16 overflow-hidden">
                {/* Background Ambient Glowing Orbs */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#ff3b63]/25 to-[#ff6e54]/15 rounded-full blur-[120px] pointer-events-none animate-glow-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-gradient-to-tr from-[#00c9a7]/20 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        
                        {/* Left Column: Hero Text */}
                        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-[#ff3b63]/20 rounded-full shadow-sm">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b63] animate-ping"></span>
                                <span className="text-xs font-black tracking-widest text-[#ff3b63] uppercase">
                                    Hệ thống Hiến máu Nhân đạo TP. Đà Nẵng
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-[58px] font-black leading-[1.1] tracking-tight text-slate-900">
                                Trao Giọt Máu Hồng,<br />
                                <span className="gradient-text-ruby">Thắp Sáng Nhịp Sống 3D</span>
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Nền tảng công nghệ số kết nối trực tiếp Người hiến máu - Bệnh viện - Ngân hàng máu Đà Nẵng. Minh bạch, nhanh chóng và an toàn tuyệt đối.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                                <button
                                    onClick={() => navigate('/chiendich')}
                                    className="h-14 px-8 gradient-bg-ruby text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-[#ff3b63]/30 hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2 group shadow-md">
                                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                                    <span>Đăng Ký Hiến Máu Ngay</span>
                                </button>
                                
                                <button 
                                    onClick={() => document.getElementById('quy-trinh').scrollIntoView({ behavior: 'smooth' })}
                                    className="h-14 px-8 bg-white/80 backdrop-blur-md border-2 border-slate-200/80 text-slate-800 rounded-2xl font-extrabold text-sm hover:bg-white hover:border-[#ff3b63]/40 hover:text-[#ff3b63] transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-xl">play_circle</span>
                                    <span>Quy Trình Hiến Máu</span>
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 border-t border-slate-200/60 text-xs font-semibold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">verified</span>
                                    <span>Tiêu chuẩn Y Tế Quốc Gia</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#ff3b63] text-lg">security</span>
                                    <span>Bảo Mật QR & Chữ Ký Số</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: 3D Heart & Visual Element */}
                        <div className="lg:col-span-5 flex justify-center relative">
                            {/* Glowing Orbit Rings */}
                            <div className="w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full border border-[#ff3b63]/20 absolute animate-spin" style={{ animationDuration: '25s' }}></div>
                            <div className="w-[260px] h-[260px] sm:w-[330px] sm:h-[330px] rounded-full border border-dashed border-[#00c9a7]/30 absolute animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }}></div>

                            {/* Central 3D Card / Heart Emblem */}
                            <div className="relative z-10 w-[280px] h-[320px] sm:w-[320px] sm:h-[360px] glass-panel rounded-[36px] p-6 flex flex-col items-center justify-center text-center shadow-2xl animate-float-slow">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full gradient-bg-ruby flex items-center justify-center text-white shadow-xl shadow-[#ff3b63]/40 mb-6 animate-heartbeat">
                                    <span className="material-symbols-outlined text-5xl sm:text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-1">Mỗi Giọt Máu</h3>
                                <p className="text-xs text-[#ff3b63] font-bold uppercase tracking-wider mb-4">Một Trái Tim Mới Được Thắp Sáng</p>
                                
                                <div className="w-full bg-white/80 rounded-xl p-3 border border-slate-100 flex items-center justify-around shadow-sm text-center">
                                    <div>
                                        <p className="text-base font-black text-slate-900">100%</p>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase">An Toàn</p>
                                    </div>
                                    <div className="w-[1px] h-6 bg-slate-200"></div>
                                    <div>
                                        <p className="text-base font-black text-[#00c9a7]">24/7</p>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase">Hỗ Trợ</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Micro Badge 1 */}
                            <div className="absolute -top-4 -left-2 sm:-left-6 glass-panel py-2.5 px-4 rounded-2xl shadow-lg border border-white/80 flex items-center gap-3 z-20">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">health_and_safety</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-slate-900">Sức Khỏe</p>
                                    <p className="text-[10px] text-slate-500">Khám Sàng Lọc Kỹ</p>
                                </div>
                            </div>

                            {/* Floating Micro Badge 2 */}
                            <div className="absolute -bottom-4 -right-2 sm:-right-4 glass-panel py-2.5 px-4 rounded-2xl shadow-lg border border-white/80 flex items-center gap-3 z-20">
                                <div className="w-8 h-8 rounded-full bg-rose-100 text-[#ff3b63] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-slate-900">Chứng Nhận Số</p>
                                    <p className="text-[10px] text-slate-500">Tích Hợp QR Code</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3D Floating Stats Cards */}
            <section className="w-full max-w-[1200px] mx-auto -mt-6 sm:-mt-10 relative z-20 mb-16 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Stat Card 1 */}
                    <div className="glass-card-3d rounded-3xl p-6 sm:p-8 flex items-center gap-6 group">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-bg-ruby text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#ff3b63]/30 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest text-[#ff3b63] uppercase bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 inline-block mb-1">
                                Tình Nguyện Viên
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{countNH || 34}</h3>
                            <p className="text-xs text-slate-500 font-medium">Người đã đăng ký hiến máu</p>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="glass-card-3d rounded-3xl p-6 sm:p-8 flex items-center gap-6 group">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#00c9a7] to-[#009b82] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#00c9a7]/30 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 inline-block mb-1">
                                Ngân Hàng Máu
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{countTuiMau || 128}</h3>
                            <p className="text-xs text-slate-500 font-medium">Đơn vị máu đã tiếp nhận</p>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="glass-card-3d rounded-3xl p-6 sm:p-8 flex items-center gap-6 group">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 inline-block mb-1">
                                Mạng Lưới Y Tế
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{countDD || 8}</h3>
                            <p className="text-xs text-slate-500 font-medium">Địa điểm tổ chức tại Đà Nẵng</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Chiến Dịch Nổi Bật 3D */}
            <section id="chien-dich-noi-bat" className="w-full max-w-[1200px] mx-auto px-4 md:px-6 mb-24">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[#ff3b63] text-xs font-black uppercase tracking-widest mb-2">
                            <span className="w-2 h-2 rounded-full bg-[#ff3b63]"></span>
                            Sự Kiện Đáng Chú Ý
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Chiến Dịch Đang Mở Đăng Ký</h2>
                    </div>
                    
                    <Link className="gradient-text-ruby font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity w-fit group" to="/chiendich">
                        <span>Xem tất cả chiến dịch</span>
                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {campaigns.map((campaign) => {
                        const statusInfo = getCampaignStatus(campaign);
                        return (
                            <div key={campaign.maChienDich} className="glass-card-3d rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-center">
                                <div className="w-full sm:w-[220px] h-[180px] shrink-0 rounded-2xl overflow-hidden shadow-md relative group">
                                    <img 
                                        src={campaign.imageUrl ? `/images/${campaign.imageUrl}` : "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=600"}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        alt="Campaign" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full backdrop-blur-md ${statusInfo.color}`}>
                                        {statusInfo.status}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col justify-between w-full h-full space-y-4">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-2 leading-snug">
                                            {campaign.tenChienDich}
                                        </h3>
                                        <div className="space-y-2 text-xs text-slate-500 font-medium">
                                            <p className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[#ff3b63] text-base">calendar_month</span> 
                                                <span>Thời gian: {new Date(campaign.thoiGianBD).toLocaleDateString('vi-VN')}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[#00c9a7] text-base">location_on</span> 
                                                <span className="line-clamp-1">{campaign.diaDiem?.tenDiaDiem || "Bệnh viện Đa Khoa Đà Nẵng"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/chiendich')} 
                                        className="h-11 px-6 bg-slate-900 text-white hover:gradient-bg-ruby rounded-xl font-bold text-xs hover:shadow-lg transition-all duration-300 w-full flex items-center justify-center gap-2">
                                        <span>Đăng Ký Tham Gia</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Quy Trình Hiến Máu 4 Bước 3D */}
            <section id="quy-trinh" className="bg-gradient-to-b from-[#fff2f4] via-white to-[#fff2f4] py-20 border-y border-rose-100/60 relative">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 text-center">
                    <span className="text-[#ff3b63] text-xs font-black uppercase tracking-[0.3em] mb-2 block">
                        Đơn Giản & Tốc Độ
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-16">
                        4 Bước Đơn Giản Để Trao Đi Sự Sống
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        
                        {/* Step 1 */}
                        <div className="glass-card-3d rounded-3xl p-8 flex flex-col items-center text-center relative group">
                            <div className="w-16 h-16 rounded-2xl gradient-bg-ruby text-white flex items-center justify-center shadow-lg shadow-[#ff3b63]/30 mb-6 group-hover:rotate-6 transition-transform">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>app_registration</span>
                            </div>
                            <span className="text-xs font-black text-[#ff3b63] uppercase tracking-widest mb-1">Bước 01</span>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Đăng Ký Online</h3>
                            <p className="text-xs text-slate-500 font-normal leading-relaxed">Chọn lịch khám và điền tờ khai y tế thông minh chỉ trong 2 phút.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="glass-card-3d rounded-3xl p-8 flex flex-col items-center text-center relative group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00c9a7] to-[#009b82] text-white flex items-center justify-center shadow-lg shadow-[#00c9a7]/30 mb-6 group-hover:rotate-6 transition-transform">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>stethoscope</span>
                            </div>
                            <span className="text-xs font-black text-[#00c9a7] uppercase tracking-widest mb-1">Bước 02</span>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Khám Sàng Lọc</h3>
                            <p className="text-xs text-slate-500 font-normal leading-relaxed">Đội ngũ bác sĩ chuyên khoa kiểm tra huyết áp và xét nghiệm máu nhanh.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="glass-card-3d rounded-3xl p-8 flex flex-col items-center text-center relative group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6 group-hover:rotate-6 transition-transform">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                            </div>
                            <span className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Bước 03</span>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Hiến Máu An Toàn</h3>
                            <p className="text-xs text-slate-500 font-normal leading-relaxed">Quá trình diễn ra trong không gian y tế tiêu chuẩn từ 5 - 10 phút.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="glass-card-3d rounded-3xl p-8 flex flex-col items-center text-center relative group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6 group-hover:rotate-6 transition-transform">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            </div>
                            <span className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Bước 04</span>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Nhận Giấy Chứng Nhận</h3>
                            <p className="text-xs text-slate-500 font-normal leading-relaxed">Nghỉ ngơi, nhận quà tặng phục hồi và Giấy chứng nhận điện tử QR.</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Testimonials 3D */}
            <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff3b63]/20 rounded-full blur-[160px] pointer-events-none"></div>
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center mb-16 space-y-3">
                        <span className="text-[#ff3b63] text-xs font-black uppercase tracking-[0.3em]">Lan Tỏa Yêu Thương</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Cảm Nhận Từ Trái Tim Vàng</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-panel-dark rounded-3xl p-8 relative space-y-4 border border-white/10 hover:border-[#ff3b63]/50 transition-all">
                            <div className="flex items-center gap-4">
                                <img src="https://i.pravatar.cc/150?u=12" className="w-14 h-14 rounded-full border-2 border-[#ff3b63]" alt="User" />
                                <div>
                                    <h4 className="font-bold text-white text-base">Trần Hữu Nam</h4>
                                    <p className="text-xs text-[#ff3b63] font-extrabold uppercase">Hiến máu 25 lần</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed font-light">
                                "Ứng dụng cập nhật trạng thái đơn vị máu theo thời gian thực rất tuyệt vời. Cảm giác biết túi máu của mình vừa được dùng để cứu người thật vô giá!"
                            </p>
                        </div>

                        <div className="glass-panel-dark rounded-3xl p-8 relative space-y-4 border border-white/10 hover:border-[#00c9a7]/50 transition-all md:translate-y-4">
                            <div className="flex items-center gap-4">
                                <img src="https://i.pravatar.cc/150?u=45" className="w-14 h-14 rounded-full border-2 border-[#00c9a7]" alt="User" />
                                <div>
                                    <h4 className="font-bold text-white text-base">Nguyễn Phương Thảo</h4>
                                    <p className="text-xs text-[#00c9a7] font-extrabold uppercase">Sinh viên ĐH Đà Nẵng</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed font-light">
                                "Đăng ký online cực kỳ tiện lợi, đến nơi chỉ cần quẹt mã QR kiểm tra là vào khám ngay. Không còn cảnh xếp hàng chờ đợi như trước."
                            </p>
                        </div>

                        <div className="glass-panel-dark rounded-3xl p-8 relative space-y-4 border border-white/10 hover:border-amber-400/50 transition-all">
                            <div className="flex items-center gap-4">
                                <img src="https://i.pravatar.cc/150?u=33" className="w-14 h-14 rounded-full border-2 border-amber-400" alt="User" />
                                <div>
                                    <h4 className="font-bold text-white text-base">Lê Văn Bình</h4>
                                    <p className="text-xs text-amber-400 font-extrabold uppercase">Nhóm máu O (Rh-)</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed font-light">
                                "Là người có nhóm máu hiếm, tôi đánh giá cao tính năng thông báo khẩn cấp từ hệ thống. Cứ có ca cấp cứu là tôi nhận được thông tin ngay."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
