import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chienDichService } from '../services/chienDichService';
import { DiaDiemService } from '../services/DiaDiemService';
import { tinhNguyenVienService } from '../services/tinhNguyenVienService';
import { donDangKyService } from '../services/donDangKy';
import { useQuery } from '@tanstack/react-query';
import { thuNhanMauService } from '../services/khamLamSangService';
import Swal from 'sweetalert2';

export default function HomePage() {
    const navigate = useNavigate();
    const [allCampaignsList, setAllCampaignsList] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [emergencyCampaigns, setEmergencyCampaigns] = useState([]);
    const [activeEmergIndex, setActiveEmergIndex] = useState(0);
    const [startIndex, setStartIndex] = useState(0); // Vị trí thẻ đầu tiên đang hiển thị
    const [fastTrackCampaign, setFastTrackCampaign] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [registeredCampaignIds, setRegisteredCampaignIds] = useState([]);
    const [submittingFastTrack, setSubmittingFastTrack] = useState(false);
    
    // State cho Tin Tức (Slider Trang chủ)
    const [newsList, setNewsList] = useState([]);
    const [activeNewsIndex, setActiveNewsIndex] = useState(0);

    // Kéo thả chuột / Chạm vuốt tay
    const [dragStartX, setDragStartX] = useState(null);
    const isDragging = useRef(false);

    // Tải thông tin người dùng đang đăng nhập & danh sách chiến dịch đã đăng ký
    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            tinhNguyenVienService.getByMaTaiKhoan(userEmail)
                .then(async (tnv) => {
                    setUserProfile(tnv);
                    if (tnv?.maTNV) {
                        try {
                            const regs = await donDangKyService.getByMaTNV(tnv.maTNV);
                            const list = Array.isArray(regs) ? regs : regs?.content || [];
                            const activeIds = list
                                .filter(r => r.trangThai !== "DaHuy" && r.trangThai !== "DaTuChoi")
                                .map(r => r.maChienDich);
                            setRegisteredCampaignIds(activeIds);
                        } catch (e) {}
                    }
                })
                .catch(() => {});
        }
    }, []);

    // Tải danh sách chiến dịch và lọc đợt khẩn cấp
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

                setAllCampaignsList(campaignsData);

                const now = new Date();
                
                // Lọc các chiến dịch khẩn cấp đang hoạt động
                const activeEmergencies = campaignsData.filter(c => {
                    const isKhanCap = c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1;
                    const endDate = new Date(c.thoiGianKT);
                    return isKhanCap && now <= endDate && c.trangThai !== "DaKetThuc" && c.trangThai !== "DaHuy";
                });
                setEmergencyCampaigns(activeEmergencies);

                // Ưu tiên Sắp xếp: Chiến dịch Khẩn cấp ĐANG DIỄN RA lên vị trí ĐẦU TIÊN
                let sortedCampaigns = [...campaignsData].filter(c => now <= new Date(c.thoiGianKT));
                sortedCampaigns.sort((a, b) => {
                    const aIsEmergActive = (a.mucDoUuTien === "KhanCap" || a.mucDoUuTien === 1) && (a.trangThai === "DangDienRa" || now >= new Date(a.thoiGianBD)) ? 1 : 0;
                    const bIsEmergActive = (b.mucDoUuTien === "KhanCap" || b.mucDoUuTien === 1) && (b.trangThai === "DangDienRa" || now >= new Date(b.thoiGianBD)) ? 1 : 0;
                    if (aIsEmergActive !== bIsEmergActive) return bIsEmergActive - aIsEmergActive;

                    const aIsEmerg = (a.mucDoUuTien === "KhanCap" || a.mucDoUuTien === 1) ? 1 : 0;
                    const bIsEmerg = (b.mucDoUuTien === "KhanCap" || b.mucDoUuTien === 1) ? 1 : 0;
                    if (aIsEmerg !== bIsEmerg) return bIsEmerg - aIsEmerg;

                    return new Date(b.thoiGianBD) - new Date(a.thoiGianBD);
                });

                setCampaigns(sortedCampaigns);
            } catch (error) {
                console.error("Lỗi khi tải chiến dịch:", error);
            }
        };
        fetchCampaigns();
    }, []);

    // ⏱️ Tự động xoay vòng Banner Khẩn cấp cứ mỗi 10 GIÂY
    useEffect(() => {
        if (emergencyCampaigns.length <= 1) return;
        const interval = setInterval(() => {
            setActiveEmergIndex(prev => (prev + 1) % emergencyCampaigns.length);
        }, 10000); // 10 giây
        return () => clearInterval(interval);
    }, [emergencyCampaigns]);

    // Lấy danh sách Tin tức để làm Slider Hero
    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch public API (sử dụng axios, hoặc fetch)
                const res = await fetch("https://localhost:7004/api/TinTuc");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNewsList(data);
                }
            } catch (err) {
                console.error("Lỗi khi tải tin tức", err);
            }
        };
        fetchNews();
    }, []);

    // ⏱️ Tự động xoay vòng Slider Tin Tức mỗi 5 GIÂY
    useEffect(() => {
        if (newsList.length <= 1) return;
        const interval = setInterval(() => {
            setActiveNewsIndex(prev => (prev + 1) % newsList.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [newsList]);

    // ⏱️ Tự động nhích 1 sự kiện liên tục mỗi 10 GIÂY
    useEffect(() => {
        if (campaigns.length <= 1) return;
        const interval = setInterval(() => {
            setStartIndex(prev => (prev + 1) % campaigns.length);
        }, 10000); // 10 giây
        return () => clearInterval(interval);
    }, [campaigns]);

    // Xử lý vuốt tay / Kéo chuột (Nhích 1 sự kiện)
    const handleDragStart = (clientX) => {
        setDragStartX(clientX);
        isDragging.current = true;
    };

    const handleDragEnd = (clientX) => {
        if (!isDragging.current || dragStartX === null) return;
        const diff = clientX - dragStartX;
        if (Math.abs(diff) > 40) {
            if (diff < 0) {
                // Vuốt trái -> Nhích tiến 1 sự kiện
                setStartIndex(prev => (prev + 1) % campaigns.length);
            } else {
                // Vuốt phải -> Nhích lùi 1 sự kiện
                setStartIndex(prev => (prev - 1 + campaigns.length) % campaigns.length);
            }
        }
        setDragStartX(null);
        isDragging.current = false;
    };

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
        const isKhanCap = campaign.mucDoUuTien === "KhanCap" || campaign.mucDoUuTien === 1;
        if (isKhanCap) {
            return { status: "🚨 KHẨN CẤP (12H)", color: "bg-red-600 text-white font-black animate-pulse shadow-md shadow-red-500/30" };
        }
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

    // Đăng ký Nhanh Fast-Track 1-Click cho Chiến dịch Khẩn cấp
    const handleFastTrackRegister = async (campaign) => {
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập tài khoản Tình nguyện viên để tham gia đợt hiến máu khẩn cấp!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e62e43',
                confirmButtonText: 'Đăng nhập ngay',
                cancelButtonText: 'Hủy'
            }).then(res => {
                if (res.isConfirmed) navigate('/login');
            });
            return;
        }

        let currentProfile = userProfile;
        if (!currentProfile?.maTNV) {
            try {
                const profile = await tinhNguyenVienService.getByMaTaiKhoan(localStorage.getItem('email'));
                if (profile?.maTNV) {
                    currentProfile = profile;
                    setUserProfile(profile);
                }
            } catch (e) {}
        }

        if (!currentProfile?.maTNV) {
            Swal.fire({
                title: 'Chưa cập nhật hồ sơ',
                text: 'Vui lòng bổ sung thông tin cá nhân (Họ tên, SĐT, Nhóm máu) để tham gia đợt khẩn cấp!',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#e62e43',
                confirmButtonText: 'Bổ sung hồ sơ ngay',
                cancelButtonText: 'Đóng'
            }).then(res => {
                if (res.isConfirmed) navigate('/thongtincanhan');
            });
            return;
        }

        setFastTrackCampaign(campaign);
    };

    const confirmFastTrack = async () => {
        if (!fastTrackCampaign || !userProfile?.maTNV) return;
        setSubmittingFastTrack(true);
        try {
            const payload = {
                maTNV: userProfile.maTNV,
                maChienDich: fastTrackCampaign.maChienDich,
                trangThai: "DaDangKy",
                theTich: 350
            };
            await donDangKyService.create(payload);
            setFastTrackCampaign(null);
            setRegisteredCampaignIds(prev => [...prev, fastTrackCampaign.maChienDich]);
            Swal.fire({
                icon: 'success',
                title: '🎉 XÁC NHẬN THÀNH CÔNG!',
                html: `Cảm ơn bạn <b>${userProfile.hoTen}</b> đã sẵn sàng hỗ trợ ca hiến máu khẩn cấp <b>${fastTrackCampaign.tenChienDich}</b>!`,
                confirmButtonColor: '#e62e43'
            });
        } catch (err) {
            const errorMsg = err?.message || err?.data?.message || err?.response?.data?.message;
            Swal.fire('Thông báo', errorMsg || 'Bạn đã đăng ký tham gia chiến dịch này rồi! Hãy kiểm tra danh sách đơn của bạn.', 'info');
        } finally {
            setSubmittingFastTrack(false);
        }
    };

    const currentEmergency = emergencyCampaigns.length > 0 ? emergencyCampaigns[activeEmergIndex] : null;

    // Lấy 4 thẻ bài tính từ vị trí startIndex (tự động nhích 1 thẻ bài liên tục)
    const visibleCards = [];
    if (campaigns.length > 0) {
        const count = Math.min(4, campaigns.length);
        for (let i = 0; i < count; i++) {
            const idx = (startIndex + i) % campaigns.length;
            visibleCards.push(campaigns[idx]);
        }
    }

    return (
        <main className="flex-1 w-full bg-[#fdf8f9] text-[#121826] overflow-hidden select-none">

            {/* 🔴 Top Dynamic Emergency Alert Bar (Tự động luân phiên mỗi 10s + Nút điều khiển tay) */}
            <div className="w-full bg-gradient-to-r from-red-700 via-[#e62e43] to-rose-700 text-white py-2.5 px-4 shadow-lg border-b border-red-800 transition-all">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <span className="flex h-3 w-3 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-90"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                        </span>
                        {currentEmergency ? (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-amber-400 text-red-950 font-black text-[10px] uppercase tracking-wider">
                                    🚨 BÁO ĐỘNG KHẨN CẤP
                                </span>
                                <span className="text-xs md:text-sm font-black tracking-wide uppercase">
                                    {currentEmergency.tenChienDich}
                                </span>
                                {currentEmergency.nhomMauCanKhapCap && (
                                    <span className="bg-white text-red-600 px-2 py-0.5 rounded font-black text-xs">
                                        CẦN GẤP MÁU: {currentEmergency.nhomMauCanKhapCap.replace('_positive','+').replace('_negative','-')}
                                    </span>
                                )}
                                {emergencyCampaigns.length > 1 && (
                                    <span className="text-[10px] text-red-200 font-mono bg-black/20 px-2 py-0.5 rounded-full">
                                        ({activeEmergIndex + 1}/{emergencyCampaigns.length} - ⏱️ 10s)
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs md:text-sm font-extrabold tracking-wide uppercase">
                                THÔNG BÁO Y TẾ: Cần bổ sung khẩn cấp các nhóm máu hiếm O- và AB- tại Ngân hàng máu Đà Nẵng
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {emergencyCampaigns.length > 1 && (
                            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/20">
                                <button
                                    onClick={() => setActiveEmergIndex(prev => (prev - 1 + emergencyCampaigns.length) % emergencyCampaigns.length)}
                                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center text-white text-xs"
                                    title="Tin khẩn trước"
                                >
                                    ◀
                                </button>
                                <button
                                    onClick={() => setActiveEmergIndex(prev => (prev + 1) % emergencyCampaigns.length)}
                                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center text-white text-xs"
                                    title="Tin khẩn tiếp"
                                >
                                    ▶
                                </button>
                            </div>
                        )}

                        {currentEmergency && registeredCampaignIds.includes(currentEmergency.maChienDich) ? (
                            <button 
                                disabled
                                className="h-8 px-5 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed opacity-90 border border-white/30">
                                <span className="material-symbols-outlined text-sm text-amber-300">check_circle</span>
                                <span>✓ ĐÃ ĐĂNG KÝ HỖ TRỢ</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    if (currentEmergency) handleFastTrackRegister(currentEmergency);
                                    else navigate('/chiendich');
                                }}
                                className="h-8 px-5 bg-white text-red-600 hover:bg-amber-[#e62e43] hover:text-white rounded-full text-xs font-black transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95">
                                <span>{currentEmergency ? "🚨 ĐĂNG KÝ HỖ TRỢ NGAY" : "Đăng ký hỗ trợ"}</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Editorial Hero Section (Dynamic News Slider) */}
            <section className="relative min-h-[540px] md:min-h-[580px] w-full flex items-center py-10 lg:py-14">
                <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
                    {newsList.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center animate-fade-in transition-all duration-500" key={activeNewsIndex}>
                            {/* Left Content Column (Dynamic News) */}
                            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-50 border border-rose-200/80 rounded-full">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#e62e43] animate-pulse"></span>
                                    <span className="text-xs font-black uppercase tracking-widest text-[#e62e43]">
                                        {newsList[activeNewsIndex].loaiTin === "ChienDich" && "TIN TỨC CHIẾN DỊCH HIẾN MÁU"}
                                        {newsList[activeNewsIndex].loaiTin === "LoiKhuyen" && "LỜI KHUYÊN SỨC KHỎE"}
                                        {newsList[activeNewsIndex].loaiTin === "NoiBo" && "BẢN TIN HOẠT ĐỘNG"}
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-[54px] font-black leading-[1.1] tracking-tight text-slate-900 line-clamp-3">
                                    {newsList[activeNewsIndex].tieuDe}
                                </h1>

                                <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 line-clamp-3">
                                    {newsList[activeNewsIndex].noiDung}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                                    {newsList[activeNewsIndex].loaiTin === "ChienDich" ? (
                                        <button
                                            onClick={() => navigate('/chiendich')}
                                            className="h-14 px-9 bg-[#e62e43] text-white rounded-2xl font-black text-sm hover:bg-[#c01b30] hover:shadow-xl hover:shadow-[#e62e43]/30 transition-all flex items-center justify-center gap-3 group">
                                            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                                            <span>ĐĂNG KÝ HIẾN MÁU</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/tin-tuc/${newsList[activeNewsIndex].maTinTuc}`)}
                                            className="h-14 px-9 bg-[#e62e43] text-white rounded-2xl font-black text-sm hover:bg-[#c01b30] hover:shadow-xl hover:shadow-[#e62e43]/30 transition-all flex items-center justify-center gap-3 group">
                                            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>article</span>
                                            <span>XEM CHI TIẾT</span>
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => document.getElementById('quy-trinh').scrollIntoView({ behavior: 'smooth' })}
                                        className="h-14 px-8 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm">
                                        <span className="material-symbols-outlined text-xl">play_circle</span>
                                        <span>Tìm hiểu quy trình</span>
                                    </button>
                                </div>
                                
                                {/* News Slider Pagination Dots */}
                                <div className="pt-8 border-t border-slate-200/80 flex justify-center lg:justify-start gap-2">
                                    {newsList.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setActiveNewsIndex(idx)}
                                            className={`h-2 rounded-full transition-all ${idx === activeNewsIndex ? 'w-8 bg-[#e62e43]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Dynamic Image */}
                            <div className="lg:col-span-5 relative">
                                <div className="relative mx-auto max-w-[420px] lg:max-w-none">
                                    <div className="rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 h-[440px] relative group">
                                        <img 
                                            src={newsList[activeNewsIndex].hinhAnh ? `/images/${newsList[activeNewsIndex].hinhAnh}` : "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000"} 
                                            alt={newsList[activeNewsIndex].tieuDe}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                                            <span className="px-3 py-1 bg-[#e62e43] text-white text-[10px] font-black uppercase tracking-wider rounded-full">Bản tin Cập nhật</span>
                                            <p className="text-xs text-slate-300 font-light mt-2">{new Date(newsList[activeNewsIndex].ngayDang).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Fallback Static Hero (Khi chưa có tin tức nào) */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
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

                            <div className="lg:col-span-5 relative">
                                <div className="relative mx-auto max-w-[420px] lg:max-w-none">
                                    <div className="rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 h-[440px] relative">
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
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 📖 🎴 SECTION TẠP CHÍ & BẢNG TIN KHẨN CẤP: ĐẬP ĐI XÂY LẠI MÀU SẮC HÀI HÒA & NHÍCH 1 SỰ KIỆN TRÂN TRÚC */}
            <section className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 mb-12">
                <div className="bg-gradient-to-br from-[#fff6f7] via-white to-[#fff0f3] rounded-[36px] p-6 sm:p-8 shadow-xl border-2 border-rose-100 relative overflow-hidden">
                    
                    {/* Soft Ruby Ambient Glow */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Header Bảng Tin Hài Hòa Màu Tồng Thể */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-rose-200/60 pb-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-[#e62e43] text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-sm">
                                    📖 TẠP CHÍ & BẢNG TIN KHẨN CẤP
                                </span>
                                {emergencyCampaigns.length > 0 && (
                                    <span className="px-2.5 py-1 bg-amber-400 text-red-950 font-black text-[10px] uppercase tracking-wider rounded-full animate-pulse">
                                        🚨 ƯU TIÊN SỐ 1
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                                Sự Kiện & Đợt Hiến Máu Khẩn Cấp
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-mono font-medium hidden sm:inline">
                                ⏱️ Tự nhích 1 sự kiện sau 10s
                            </span>
                            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-rose-200 shadow-sm">
                                <button
                                    onClick={() => setStartIndex(prev => (prev - 1 + campaigns.length) % campaigns.length)}
                                    className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-[#e62e43] hover:text-white flex items-center justify-center text-slate-700 text-xs transition-all active:scale-95"
                                    title="Sự kiện trước"
                                >
                                    ◀
                                </button>
                                <span className="text-xs font-mono font-black px-2 text-[#e62e43]">
                                    {startIndex + 1}/{campaigns.length}
                                </span>
                                <button
                                    onClick={() => setStartIndex(prev => (prev + 1) % campaigns.length)}
                                    className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-[#e62e43] hover:text-white flex items-center justify-center text-slate-700 text-xs transition-all active:scale-95"
                                    title="Sự kiện tiếp theo"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Khung chứa các thẻ bài nằm ngang song song + Nhích 1 sự kiện liên tục */}
                    <div 
                        onMouseDown={(e) => handleDragStart(e.clientX)}
                        onMouseUp={(e) => handleDragEnd(e.clientX)}
                        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                        onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
                        className="relative w-full my-2 select-none z-10"
                    >
                        {/* ⬅️ Nút Mũi Tên Trái (Nổi bên trái) */}
                        {campaigns.length > 4 && (
                            <button
                                onClick={() => setStartIndex(prev => (prev - 1 + campaigns.length) % campaigns.length)}
                                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white hover:bg-[#e62e43] hover:text-white border-2 border-rose-200 text-slate-700 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
                                title="Sự kiện trước"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform">arrow_back_ios_new</span>
                            </button>
                        )}

                        {/* ➡️ Nút Mũi Tên Phải (Nổi bên phải) */}
                        {campaigns.length > 4 && (
                            <button
                                onClick={() => setStartIndex(prev => (prev + 1) % campaigns.length)}
                                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white hover:bg-[#e62e43] hover:text-white border-2 border-rose-200 text-slate-700 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
                                title="Sự kiện tiếp theo"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform">arrow_forward_ios</span>
                            </button>
                        )}

                        {/* Bố cục 4 Thẻ Bài Song Song - Nhích 1 sự kiện liên tục */}
                        {campaigns.length === 0 ? (
                            <div className="text-slate-400 text-sm font-medium py-12 text-center">Đang tải sự kiện...</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 transition-all duration-500">
                                {visibleCards.map((c) => {
                                    const isKhanCap = c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1;
                                    const isRegistered = registeredCampaignIds.includes(c.maChienDich);

                                    return (
                                        <div
                                            key={c.maChienDich}
                                            className={`bg-white text-slate-900 rounded-3xl p-4 shadow-md border-2 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                                                isKhanCap
                                                    ? "border-red-500 ring-4 ring-red-500/20 bg-gradient-to-b from-white via-red-50/40 to-white"
                                                    : "border-slate-200/80"
                                            }`}
                                        >
                                            {/* Phần Ảnh Thẻ Dọc */}
                                            <div className="w-full h-36 rounded-2xl overflow-hidden relative shrink-0 border border-slate-100 shadow-sm">
                                                <img
                                                    src={c.imageUrl ? `/images/${c.imageUrl}` : "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600"}
                                                    alt="Campaign Banner"
                                                    className="w-full h-full object-cover"
                                                    draggable="false"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                                                {isKhanCap && (
                                                    <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full animate-bounce shadow-md">
                                                        🚨 KHẨN CẤP (12H)
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold flex items-center justify-between">
                                                    <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded">
                                                        {new Date(c.thoiGianBD).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded">
                                                        Chỉ tiêu: {c.soLuongDuKien || 50} đv
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Thông tin Chi Tiết Thẻ */}
                                            <div className="flex-1 py-3 flex flex-col justify-between text-left space-y-2">
                                                <div>
                                                    {isKhanCap ? (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm inline-block mb-1">
                                                            🆘 CẦN GẤP MÁU: {c.nhomMauCanKhapCap ? c.nhomMauCanKhapCap.replace('_positive','+').replace('_negative','-') : "O+"}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#e62e43] font-black text-[10px] uppercase tracking-wider inline-block mb-1">
                                                            📅 CHIẾN DỊCH CHÍNH THỨC
                                                        </span>
                                                    )}
                                                    
                                                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug line-clamp-2">
                                                        {c.tenChienDich}
                                                    </h3>
                                                </div>

                                                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs text-red-600">location_on</span>
                                                    <span className="truncate">{c.diaDiem?.tenDiaDiem || "Bệnh viện Đa Khoa Đà Nẵng"}</span>
                                                </p>

                                                {/* Action Button: Đã đăng ký -> Nút mờ disabled */}
                                                {isRegistered ? (
                                                    <button
                                                        disabled
                                                        className="h-9 px-3 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 w-full border border-slate-200"
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-emerald-600 font-extrabold">check_circle</span>
                                                        <span>✓ ĐÃ ĐĂNG KÝ HỖ TRỢ</span>
                                                    </button>
                                                ) : isKhanCap ? (
                                                    <button
                                                        onClick={() => handleFastTrackRegister(c)}
                                                        className="h-9 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-1 transition-all active:scale-95 w-full"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">bolt</span>
                                                        <span>🚨 ĐĂNG KÝ HỖ TRỢ (1-CLICK)</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate('/chiendich')}
                                                        className="h-9 px-3 bg-slate-900 hover:bg-[#e62e43] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 w-full"
                                                    >
                                                        <span>Xem chi tiết</span>
                                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Chấm chỉ số Trang (Pagination Dots theo từng sự kiện) */}
                    {campaigns.length > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mt-5 relative z-20 overflow-x-auto py-1">
                            {campaigns.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setStartIndex(i)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        startIndex === i
                                            ? "w-7 bg-[#e62e43] shadow-md shadow-red-500/30"
                                            : "w-2.5 bg-rose-200 hover:bg-rose-300"
                                    }`}
                                    title={`Chuyển tới sự kiện ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </section>

            {/* Asymmetric Bento-Grid Layout */}
            <section className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 mb-16">
                <div className="mb-8">
                    <span className="text-xs font-black text-[#e62e43] uppercase tracking-widest block mb-1">Tổng Quan Dữ Liệu</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Thống Kê Hoạt Động Hiến Máu Đà Nẵng</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
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

                    <div className="md:col-span-12 bento-card p-0 bg-slate-900 text-white flex flex-col md:flex-row items-stretch justify-between gap-0 overflow-hidden min-h-[220px]">
                        <div className="p-8 flex-1 flex flex-col justify-center relative z-10 bg-slate-900/90 backdrop-blur-md">
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10 mt-1">
                                    <span className="material-symbols-outlined text-3xl">map</span>
                                </div>
                                <div>
                                    <h4 className="text-xl md:text-2xl font-bold text-white mb-2">Mạng Lưới Y Tế Liên Kết ({countDD || 8} Điểm Tổ Chức)</h4>
                                    <p className="text-sm text-slate-400 font-light max-w-xl mb-6 leading-relaxed">Trải dài khắp thành phố tại các Bệnh viện đa khoa lớn và hệ thống Trung tâm Y tế Quận/Huyện.</p>
                                    <button 
                                        onClick={() => navigate('/chiendich')}
                                        className="h-11 px-7 bg-[#e62e43] text-white rounded-xl font-bold text-xs hover:bg-[#c01b30] transition-colors w-fit flex items-center gap-2">
                                        <span>Xem Bản Đồ Điểm Hiến</span>
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-[45%] lg:w-[50%] h-[200px] md:h-auto relative shrink-0 bg-slate-800 overflow-hidden">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122691.80287711463!2d108.13524584742456!3d16.059632832560373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0x1df0cb4b86727e06!2zxJDDoCBO4bq1bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" 
                                width="100%" 
                                height="100%" 
                                style={{border:0, minHeight: "280px"}} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500"
                            ></iframe>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/100 via-slate-900/60 to-transparent md:bg-gradient-to-r md:from-slate-900 md:via-slate-900/40 md:to-transparent pointer-events-none"></div>
                        </div>
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
                    {campaigns.slice(0, 4).map((campaign) => {
                        const statusInfo = getCampaignStatus(campaign);
                        const isKhanCap = campaign.mucDoUuTien === "KhanCap" || campaign.mucDoUuTien === 1;
                        const isRegistered = registeredCampaignIds.includes(campaign.maChienDich);

                        return (
                            <div 
                                key={campaign.maChienDich} 
                                className={`bento-card p-6 flex flex-col sm:flex-row gap-6 items-center border-2 ${
                                    isKhanCap ? "border-red-500 bg-red-50/20 shadow-xl shadow-red-500/10 animate-pulse" : "border-slate-100"
                                }`}
                            >
                                <div className="w-full sm:w-[240px] h-[190px] shrink-0 rounded-2xl overflow-hidden relative border border-slate-100">
                                    <img 
                                        src={campaign.imageUrl ? `/images/${campaign.imageUrl}` : "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600"}
                                        className="w-full h-full object-cover" 
                                        alt="Campaign" 
                                        draggable="false"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                                    {isKhanCap && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full animate-bounce">
                                            🚨 KHẨN CẤP
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between w-full h-full space-y-4">
                                    <div>
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full inline-block mb-3 ${statusInfo.color}`}>
                                            {statusInfo.status}
                                        </span>
                                        <h3 className="text-xl font-bold text-[#121826] mb-2 line-clamp-2">
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

                                    {isRegistered ? (
                                        <button 
                                            disabled
                                            className="h-11 px-6 bg-slate-200 text-slate-500 rounded-xl font-bold text-xs cursor-not-allowed w-full flex items-center justify-center gap-2 border border-slate-300">
                                            <span className="material-symbols-outlined text-sm text-emerald-600 font-extrabold">check_circle</span>
                                            <span>✓ BẠN ĐÃ ĐĂNG KÝ THAM GIA</span>
                                        </button>
                                    ) : isKhanCap ? (
                                        <button 
                                            onClick={() => handleFastTrackRegister(campaign)}
                                            className="h-11 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-red-500/20 w-full flex items-center justify-center gap-2">
                                            <span>🚨 ĐĂNG KÝ HỖ TRỢ NGAY (1-CLICK)</span>
                                            <span className="material-symbols-outlined text-sm">bolt</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => navigate('/chiendich')}
                                            className="h-11 px-6 bg-slate-900 text-white hover:bg-[#e62e43] rounded-xl font-bold text-xs transition-colors w-full flex items-center justify-center gap-2">
                                            <span>Đăng Ký Tham Gia</span>
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Quy trình 4 bước */}
            <section id="quy-trinh" className="bg-slate-900 py-20 text-white relative">
                <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <span className="text-[#e62e43] text-xs font-black uppercase tracking-widest">Tiêu Chuẩn Y Tế</span>
                        <h2 className="text-3xl md:text-4xl font-black text-white">4 Bước Hiến Máu Chuẩn Y Khoa</h2>
                        <p className="text-slate-400 text-sm font-light">Đảm bảo an toàn tuyệt đối cho người hiến máu và chất lượng đơn vị máu tiếp nhận.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

            {/* FAST-TRACK POPUP MODAL FOR TNV (1-CLICK CONFIRM) */}
            {fastTrackCampaign && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-500 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white text-center relative">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 text-3xl mx-auto mb-3 shadow-inner animate-pulse">
                                <span className="material-symbols-outlined">bolt</span>
                            </div>
                            <span className="px-3 py-1 bg-amber-400 text-red-950 font-black text-[10px] uppercase tracking-wider rounded-full">
                                ⚡ XÁC NHẬN HỖ TRỢ KHẨN CẤP
                            </span>
                            <h3 className="text-lg font-black mt-2 leading-snug">
                                {fastTrackCampaign.tenChienDich}
                            </h3>
                            {fastTrackCampaign.nhomMauCanKhapCap && (
                                <p className="text-xs font-bold text-amber-200 mt-1">
                                    🔴 Nhóm máu cần gấp: {fastTrackCampaign.nhomMauCanKhapCap.replace('_positive','+').replace('_negative','-')}
                                </p>
                            )}
                        </div>

                        <div className="p-6 space-y-4 text-left">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                                <p className="text-slate-500">Tình nguyện viên đăng ký:</p>
                                <p className="text-sm font-black text-slate-900">{userProfile?.hoTen || "Tình nguyện viên"}</p>
                                <p className="text-slate-600">SĐT: <b>{userProfile?.soDienThoai || "Đã đăng ký"}</b> | Nhóm máu: <b className="text-red-600">{userProfile?.nhomMau?.replace('_positive','+') || "Khớp hồ sơ"}</b></p>
                                <p className="text-slate-600">Địa điểm: <b>{fastTrackCampaign.diaDiem?.tenDiaDiem || "Bệnh viện Đa Khoa Đà Nẵng"}</b></p>
                            </div>

                            <p className="text-[11px] text-slate-500 italic text-center">
                                * Bằng việc bấm Xác nhận, thông tin của bạn sẽ được chuyển ngay tới Ban điều phối Y tế.
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFastTrackCampaign(null)}
                                    className="flex-1 h-12 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all">
                                    Hủy bỏ
                                </button>
                                <button
                                    type="button"
                                    disabled={submittingFastTrack}
                                    onClick={confirmFastTrack}
                                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60">
                                    <span className="material-symbols-outlined text-base">
                                        {submittingFastTrack ? "progress_activity" : "volunteer_activism"}
                                    </span>
                                    <span>{submittingFastTrack ? "ĐANG XỬ LÝ..." : "XÁC NHẬN HỖ TRỢ"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
