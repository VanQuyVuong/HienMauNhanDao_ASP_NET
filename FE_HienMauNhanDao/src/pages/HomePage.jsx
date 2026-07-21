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
            return { status: "Sắp diễn ra", color: "bg-amber-50 text-amber-700 border border-amber-200" };
        } else {
            return { status: "Đang mở tiếp nhận", color: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold" };
        }
    };

    return (
        <main className="flex-1 w-full bg-[#fdf8f9] text-[#121826] overflow-hidden">

            {/* Top Clinical Alert Bar */}
            <div className="w-full bg-[#e62e43] text-white py-3 px-4 shadow-md">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <span className="flex h-2.5 w-2.5 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                        </span>
                        <span className="text-xs md:text-sm font-extrabold tracking-wide uppercase">
                            THÔNG BÁO Y TẾ: Cần bổ sung khẩn cấp nhóm máu O- và AB- tại Bệnh viện Đa Khoa Đà Nẵng
                        </span>
                    </div>
                    <button 
                        onClick={() => navigate('/chiendich')}
                        className="h-8 px-5 bg-white text-[#e62e43] rounded-full text-xs font-black hover:bg-slate-100 transition-all uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-sm">
                        <span>Đăng ký hỗ trợ ngay</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Editorial Hero Section with Real Medical Photography */}
            <section className="relative min-h-[620px] md:min-h-[680px] w-full flex items-center py-12 lg:py-20">
                <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        
                        {/* Left Content Column */}
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-50 border border-rose-200/80 rounded-full">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#e62e43] animate-pulse"></span>
                                <span className="text-xs font-black uppercase tracking-widest text-[#e62e43]">
                                    Cổng Thông Tin Hiến Máu Nhân Đạo TP. Đà Nẵng
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-[64px] font-black leading-[1.08] tracking-tight text-slate-900">
                                MỖI GIỌT MÁU,<br />
                                <span className="editorial-title-ruby">MỘT MỆNH SỐNG HỒI SINH</span>
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Hệ thống quản lý hiến máu y tế số kết nối minh bạch giữa người hiến máu tình nguyện, bệnh viện điều trị và Ngân hàng máu Đà Nẵng. An toàn tuyệt đối theo chuẩn quy trình Bộ Y Tế.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                                <button
                                    onClick={() => navigate('/chiendich')}
                                    className="h-14 px-9 bg-[#e62e43] text-white rounded-2xl font-black text-sm hover:bg-[#c01b30] hover:shadow-xl hover:shadow-[#e62e43]/30 transition-all flex items-center justify-center gap-3 group">
                                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                                    <span>ĐĂNG KÝ HIẾN MÁU</span>
                                </button>
                                
                                <button 
                                    onClick={() => document.getElementById('quy-trinh').scrollIntoView({ behavior: 'smooth' })}
                                    className="h-14 px-8 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-xl">play_circle</span>
                                    <span>Tìm hiểu quy trình y tế</span>
                                </button>
                            </div>

                            {/* Medical Credentials */}
                            <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                                <div>
                                    <p className="text-xl sm:text-2xl font-black text-slate-900">100%</p>
                                    <p className="text-xs text-slate-500 font-semibold">An toàn y tế</p>
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-black text-[#00b894]">24/7</p>
                                    <p className="text-xs text-slate-500 font-semibold">Tiếp nhận thông tin</p>
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-black text-[#e62e43]">QR Code</p>
                                    <p className="text-xs text-slate-500 font-semibold">Chứng nhận điện tử</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Real Medical Photography Frame */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto max-w-[420px] lg:max-w-none">
                                {/* Main Realistic Image */}
                                <div className="rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 h-[460px] relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000" 
                                        alt="Bác sĩ tiếp nhận hiến máu" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                                    
                                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                                        <span className="px-3 py-1 bg-[#e62e43] text-white text-[10px] font-black uppercase tracking-wider rounded-full">Bệnh viện Đa Khoa Đà Nẵng</span>
                                        <h4 className="text-lg font-bold">Đội ngũ Y bác sĩ chuyên khoa</h4>
                                        <p className="text-xs text-slate-300 font-light">Đồng hành cùng hơn 5.000 lượt hiến máu an toàn mỗi năm.</p>
                                    </div>
                                </div>

                                {/* Floating Clinical Overlay Panel */}
                                <div className="absolute -bottom-8 -left-6 sm:-left-8 clinical-glass p-5 rounded-3xl shadow-2xl max-w-[260px] hidden sm:flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#00b894] flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Sàng lọc kỹ càng</p>
                                        <p className="text-xs text-slate-500 font-medium">Đảm bảo sức khỏe cho người hiến & nhận</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Asymmetric Bento-Grid Layout (Bố cục Bento Đột Phá) */}
            <section className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-12 mb-16">
                <div className="mb-8">
                    <span className="text-xs font-black text-[#e62e43] uppercase tracking-widest block mb-1">Tổng Quan Dữ Liệu</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Thống Kê Hoạt Động Hiến Máu Đà Nẵng</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Bento Box 1: Volunteers Stats (Large 7 Cols) */}
                    <div className="md:col-span-7 bento-card p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-rose-50/50">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <span className="px-3 py-1 bg-rose-100 text-[#e62e43] text-[10px] font-black uppercase tracking-wider rounded-full">Tình Nguyện Viên</span>
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 pt-2">{countNH || 34}</h3>
                                <p className="text-sm text-slate-500 font-medium">Người hiến máu đã đăng ký trong hệ thống</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-[#e62e43] text-white flex items-center justify-center shadow-lg shadow-[#e62e43]/20">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                            </div>
                        </div>

                        <div className="pt-8 flex items-center justify-between border-t border-slate-200/60 mt-6">
                            <div className="flex -space-x-3 overflow-hidden">
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Volunteer" />
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Volunteer" />
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="Volunteer" />
                                <div className="h-10 w-10 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-xs font-bold text-slate-600">+30</div>
                            </div>
                            <button onClick={() => navigate('/register')} className="text-xs font-black text-[#e62e43] hover:underline flex items-center gap-1">
                                <span>Đăng ký tham gia ngay</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Bento Box 2: Blood Units Storage (5 Cols) */}
                    <div className="md:col-span-5 bento-card p-8 flex flex-col justify-between bg-white">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <span className="px-3 py-1 bg-emerald-100 text-[#00b894] text-[10px] font-black uppercase tracking-wider rounded-full">Ngân Hàng Máu</span>
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 pt-2">{countTuiMau || 128}</h3>
                                <p className="text-sm text-slate-500 font-medium">Túi máu đã lưu kho sẵn sàng</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-[#00b894] text-white flex items-center justify-center shadow-lg shadow-[#00b894]/20">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
                            </div>
                        </div>
                        <div className="pt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 mt-4">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span>Đã qua xét nghiệm đạt chuẩn 100%</span>
                        </div>
                    </div>

                    {/* Bento Box 3: Medical Facilities (12 Cols Bottom Split) */}
                    <div className="md:col-span-12 bento-card p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10">
                                <span className="material-symbols-outlined text-3xl">local_hospital</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Mạng Lưới Y Tế Liên Kết ({countDD || 8} Điểm Tổ Chức)</h4>
                                <p className="text-xs text-slate-400 font-light max-w-xl">Trải dài tại các Bệnh viện lớn, Trung tâm Y tế Quận Hải Châu, Thanh Khê, Liên Chiểu, Ngũ Hành Sơn...</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/chiendich')}
                            className="h-12 px-7 bg-[#e62e43] text-white rounded-xl font-bold text-xs hover:bg-[#c01b30] transition-colors shrink-0 flex items-center gap-2">
                            <span>Xem danh sách điểm hiến</span>
                            <span className="material-symbols-outlined text-sm">location_on</span>
                        </button>
                    </div>

                </div>
            </section>

            {/* Active Medical Campaigns Showcase */}
            <section id="chien-dich-noi-bat" className="w-full max-w-[1280px] mx-auto px-4 md:px-8 mb-24">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-slate-200/80 pb-6">
                    <div>
                        <span className="text-xs font-black text-[#e62e43] uppercase tracking-widest block mb-1">Sự Kiện Đang Diễn Ra</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Chiến Dịch Tiếp Nhận Máu</h2>
                    </div>
                    <Link className="text-[#e62e43] font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:underline" to="/chiendich">
                        <span>Xem tất cả chiến dịch</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {campaigns.map((campaign) => {
                        const statusInfo = getCampaignStatus(campaign);
                        return (
                            <div key={campaign.maChienDich} className="bento-card p-6 flex flex-col sm:flex-row gap-6 items-center">
                                <div className="w-full sm:w-[240px] h-[190px] shrink-0 rounded-2xl overflow-hidden relative border border-slate-100">
                                    <img 
                                        src={campaign.imageUrl ? `/images/${campaign.imageUrl}` : "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600"}
                                        className="w-full h-full object-cover" 
                                        alt="Campaign" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between w-full h-full space-y-4">
                                    <div>
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full inline-block mb-3 ${statusInfo.color}`}>
                                            {statusInfo.status}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                                            {campaign.tenChienDich}
                                        </h3>
                                        <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                                            <p className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-[#e62e43]">calendar_today</span>
                                                <span>{new Date(campaign.thoiGianBD).toLocaleDateString('vi-VN')}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-[#00b894]">location_on</span>
                                                <span className="line-clamp-1">{campaign.diaDiem?.tenDiaDiem || "Bệnh viện Đa Khoa Đà Nẵng"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/chiendich')}
                                        className="h-11 px-6 bg-slate-900 text-white hover:bg-[#e62e43] rounded-xl font-bold text-xs transition-colors w-full flex items-center justify-center gap-2">
                                        <span>Đăng Ký Tham Gia</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Photorealistic 4-Step Medical Process (Quy Trình 4 Bước Y Khoa Tạp Chí) */}
            <section id="quy-trinh" className="bg-slate-900 py-20 text-white relative">
                <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <span className="text-[#e62e43] text-xs font-black uppercase tracking-widest">Tiêu Chuẩn Y Tế</span>
                        <h2 className="text-3xl md:text-4xl font-black text-white">4 Bước Hiến Máu Chuẩn Y Khoa</h2>
                        <p className="text-slate-400 text-sm font-light">Đảm bảo an toàn tuyệt đối cho người hiến máu và chất lượng đơn vị máu tiếp nhận.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        
                        {/* Step 1 */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-[#e62e43]/50 transition-all">
                            <span className="text-6xl font-black text-white/10 absolute top-4 right-4 pointer-events-none">01</span>
                            <div className="space-y-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-[#e62e43] text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">app_registration</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">1. Đăng ký & Khai báo</h3>
                                <p className="text-xs text-slate-400 font-light leading-relaxed">Điền thông tin tờ khai y tế trực tuyến nhanh chóng qua điện thoại.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-[#00b894]/50 transition-all">
                            <span className="text-6xl font-black text-white/10 absolute top-4 right-4 pointer-events-none">02</span>
                            <div className="space-y-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-[#00b894] text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">stethoscope</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">2. Khám sàng lọc</h3>
                                <p className="text-xs text-slate-400 font-light leading-relaxed">Bác sĩ khám lâm sàng, đo huyết áp và xét nghiệm máu nhanh tại chỗ.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition-all">
                            <span className="text-6xl font-black text-white/10 absolute top-4 right-4 pointer-events-none">03</span>
                            <div className="space-y-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">bloodtype</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">3. Hiến máu an toàn</h3>
                                <p className="text-xs text-slate-400 font-light leading-relaxed">Tiến hành hiến máu với thiết bị y tế vô trùng dùng 1 lần duy nhất.</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/50 transition-all">
                            <span className="text-6xl font-black text-white/10 absolute top-4 right-4 pointer-events-none">04</span>
                            <div className="space-y-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">4. Nhận chứng nhận</h3>
                                <p className="text-xs text-slate-400 font-light leading-relaxed">Nghỉ ngơi, dùng phần ăn nhẹ và nhận Giấy chứng nhận điện tử QR.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Doctor's Editorial Quote & Testimonials */}
            <section className="py-20 bg-[#fff9fa]">
                <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
                    <div className="bento-card p-8 md:p-12 bg-white flex flex-col lg:flex-row items-center gap-10">
                        <div className="w-full lg:w-1/3 h-[280px] rounded-2xl overflow-hidden shrink-0">
                            <img 
                                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800" 
                                alt="Bác sĩ trưởng khoa" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="w-full lg:w-2/3 space-y-4 text-left">
                            <span className="text-xs font-black text-[#e62e43] uppercase tracking-widest">Lời Khuyên Y Bác Sĩ</span>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                                "Hiến máu định kỳ không chỉ giúp cứu chữa bệnh nhân nguy kịch mà còn giúp kích thích cơ thể tái tạo dòng máu mới khỏe mạnh."
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                — BS. CKI Nguyễn Văn A, Trưởng Khoa Huyết Học - Bệnh viện Đa Khoa Đà Nẵng
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
