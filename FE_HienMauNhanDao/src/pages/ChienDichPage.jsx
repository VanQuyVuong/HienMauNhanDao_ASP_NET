import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chienDichService } from "../services/chienDichService";
import { donDangKyService } from "../services/donDangKy";
import { tinhNguyenVienService } from "../services/tinhNguyenVienService";
import Swal from 'sweetalert2';

export default function ChienDichPage() {
    const navigate = useNavigate();
    const [allCampaigns, setAllCampaigns] = useState([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [districtFilter, setDistrictFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [daDangKyMap, setDaDangKyMap] = useState({}); // { maChienDich: maDon }
    const [maTNV, setMaTNV] = useState(null);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const itemsPerPage = 6;
    const STATUS_PRIORITY = {
        "Đang diễn ra": 1,
        "Đã phê duyệt": 3,
        "Sắp diễn ra": 2,
        "Đã kết thúc": 4
    };
    const uniqueLocations = [...new Set(allCampaigns.map(item => item.diaDiem.tenDiaDiem))];

    // Load maTNV từ tài khoản đang đăng nhập
    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        if (!userEmail) return;
        tinhNguyenVienService.getByMaTaiKhoan(userEmail).then(tnv => {
            if (tnv?.maTNV) setMaTNV(tnv.maTNV);
        }).catch(() => { });
    }, []);


    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await chienDichService.getChienDichs();
                if (response?.data && Array.isArray(response.data)) {
                    setAllCampaigns(response.data);
                    setFilteredCampaigns(response.data);
                }
                setError(null);
            } catch (error) {
                setError("Lỗi tải danh sách chiến dịch");
                console.error("Error fetching campaigns:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCampaigns();
    }, []);

    // Sau khi có maTNV và danh sách chiến dịch, check từng chiến dịch
    useEffect(() => {
        if (!maTNV || allCampaigns.length === 0) return;
        const checkAll = async () => {
            const map = {};
            await Promise.all(allCampaigns.map(async (c) => {
                const result = await donDangKyService.checkDaDangKy(maTNV, c.maChienDich);
                if (result) map[c.maChienDich] = result.maDon || true;
            }));
            setDaDangKyMap(map);
        };
        checkAll();
    }, [maTNV, allCampaigns]);

    // Filter campaigns when search or filters change
    useEffect(() => {
        let filtered = [...allCampaigns];

        // Search filter
        if (searchInput.trim()) {
            const filter = searchInput.toLowerCase();
            filtered = filtered.filter(campaign => {
                const title = campaign.tenChienDich?.toLowerCase() || "";
                const location = `${campaign.diaDiem?.tenDiaDiem || ""} ${campaign.diaDiem?.diaChiChiTiet || ""}`.toLowerCase();
                return title.includes(filter) || location.includes(filter);
            });
        }

        // District filter
        if (districtFilter !== "all") {
            filtered = filtered.filter(campaign => {
                const district = campaign.diaDiem?.tenDiaDiem?.toLowerCase() || "";
                return district.includes(districtFilter.toLowerCase());
            });
        }

        // Date range filter
        if (fromDate) {
            filtered = filtered.filter(campaign => {
                const campaignDate = new Date(campaign.thoiGianBD);
                const from = new Date(fromDate);
                //Do chỉ lấy ngày nên set giờ
                campaignDate.setHours(0, 0, 0, 0);
                from.setHours(0, 0, 0, 0);
                return campaignDate >= from;
            });
        }
        if (toDate) {
            filtered = filtered.filter(campaign => {
                const campaignDate = new Date(campaign.thoiGianKT);
                const to = new Date(toDate);
                campaignDate.setHours(0, 0, 0, 0);
                to.setHours(0, 0, 0, 0);
                return campaignDate <= to;
            });
        }

        filtered.sort((a, b) => {
            const aIsKhanCap = (a.mucDoUuTien === "KhanCap" || a.mucDoUuTien === 1) ? 1 : 0;
            const bIsKhanCap = (b.mucDoUuTien === "KhanCap" || b.mucDoUuTien === 1) ? 1 : 0;
            if (aIsKhanCap !== bIsKhanCap) return bIsKhanCap - aIsKhanCap;

            const weightA = STATUS_PRIORITY[a.trangThai] || 99;
            const weightB = STATUS_PRIORITY[b.trangThai] || 99;
            return weightA - weightB;
        });

        setFilteredCampaigns(filtered);
        setCurrentPage(1);
    }, [searchInput, districtFilter, fromDate, toDate, allCampaigns]);

    const handleFilter = () => {
        // Trigger filtering animation
        const grid = document.getElementById('campaignGrid');
        if (grid) {
            grid.classList.add('opacity-30', 'pointer-events-none');
            setTimeout(() => {
                grid.classList.remove('opacity-30', 'pointer-events-none');
            }, 300);
        }
    };

    // Get campaign status badge
    const getCampaignStatus = (campaign) => {
        const now = new Date();
        const startDate = new Date(campaign.thoiGianBD);
        const endDate = new Date(campaign.thoiGianKT);

        if (now > endDate) {
            return { status: "Đã kết thúc", color: "gray" };
        } else if (now < startDate) {
            return { status: "Sắp diễn ra", color: "amber" };
        } else {
            return { status: "Đang mở", color: "green" };
        }
    };

    const getProgressPercentage = (campaign) => {
        if (campaign.soLuongDuKien === 0)
            return 0;
        const percent = (campaign.luongMauDaThu / campaign.soLuongDuKien) * 100;
        if (Number.isInteger(percent))
            return percent;
        return Number(percent.toFixed(1));
    };

    // Pagination
    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedCampaigns = filteredCampaigns.slice(startIdx, startIdx + itemsPerPage);

    const getPaginationPages = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    if (loading) {
        return (
        <div className="flex-1 w-full bg-[#fdf8f9] min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1280px] mx-auto">Đang tải chiến dịch...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <main className="w-full bg-[#fdf8f9] min-h-[calc(100vh-100px)] pb-20">
            {/* Header Section */}
            <div className="w-full bg-slate-900 py-16 px-4 md:px-8 relative overflow-hidden mb-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#e62e43]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00b894]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                <div className="max-w-[1280px] mx-auto relative z-10 text-center">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-3">Tra Cứu & Đăng Ký</span>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Mạng Lưới Chiến Dịch</h1>
                    <p className="text-sm text-slate-400 max-w-xl mx-auto">Cập nhật và theo dõi các lịch tổ chức hiến máu nhân đạo mới nhất trên toàn địa bàn TP. Đà Nẵng.</p>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 md:px-8">

                {/* Banner Đặt Lịch Hiến Máu Thường Xuyên Tại Bệnh Viện */}
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 mb-10 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                                🏥 TIẾP NHẬN HÀNG NGÀY
                            </span>
                            <span className="text-xs text-emerald-300 font-bold">Bệnh viện & Trung tâm Y tế</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white">Hiến Máu Thường Xuyên Tại Bệnh Viện</h2>
                        <p className="text-xs md:text-sm text-slate-300 max-w-xl font-light">
                            Bạn có thể chọn đặt lịch trực tuyến trước khi đến hoặc đăng ký trực tiếp tại quầy tiếp nhận lễ tân Bệnh viện.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            const defaultRoutineCampaign = {
                                maChienDich: 'CD00004',
                                tenChienDich: 'Hiến máu Thường xuyên tại Bệnh viện Đà Nẵng',
                                isThuongXuyen: true,
                                thoiGianBD: new Date().toISOString(),
                                thoiGianKT: new Date(Date.now() + 30 * 86400000).toISOString()
                            };
                            localStorage.setItem('selectedCampaign', JSON.stringify(defaultRoutineCampaign));
                            navigate('/khai-bao-thong-tin-ca-nhan');
                        }}
                        className="h-12 px-7 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs md:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/30 transition-all shrink-0 active:scale-95 flex items-center gap-2"
                    >
                        <span>🏥 ĐẶT LỊCH HIẾN THƯỜNG XUYÊN</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </div>

            {/* Filter Bar */}
            <div className="w-full bento-card p-5 sm:p-7 mb-10">
                <div className="flex gap-3 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên chiến dịch</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                id="searchInput"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                type="text"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="md:hidden h-[42px] px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-lg">tune</span>
                        Bộ lọc {districtFilter !== 'all' || fromDate || toDate ? '•' : ''}
                    </button>
                </div>

                <div className={`${showMobileFilter ? 'block' : 'hidden'} md:flex md:flex-row md:items-end gap-4 mt-4 md:mt-6 pt-4 md:pt-0 border-t border-slate-100 md:border-none space-y-4 md:space-y-0`}>
                    <div className="w-full md:w-[200px] flex-1 min-w-[150px]">
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Địa điểm</label>
                        <div className="relative">
                            <select
                                value={districtFilter}
                                onChange={(e) => setDistrictFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-md text-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                            >
                                <option value="all">Tất cả địa điểm</option>
                                {uniqueLocations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    <div className="w-full md:w-[300px] flex gap-2">
                        <div className="w-1/2">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Từ ngày</label>
                            <input
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                type="date"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Đến ngày</label>
                            <input
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                type="date"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            handleFilter();
                            setShowMobileFilter(false);
                        }}
                        className="w-full md:w-[160px] h-[42px] bg-[#e62e43] text-white rounded-xl font-bold text-sm hover:bg-[#c01b30] flex items-center justify-center gap-2 shadow-lg shadow-[#e62e43]/20 active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        Lọc kết quả
                    </button>
                </div>
            </div>

            {/* Campaign Grid */}
            <div id="campaignGrid" className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300">
                {paginatedCampaigns.map((campaign) => {
                    const status = getCampaignStatus(campaign);
                    const percentage = getProgressPercentage(campaign);
                    const isUpcoming = status.status === "Sắp diễn ra";
                    const daDangKy = !!daDangKyMap[campaign.maChienDich];

                    return (
                        <div key={campaign.maChienDich} className="bento-card overflow-hidden flex flex-col group p-2">
                            {/* Image */}
                            <div className="w-full h-[220px] relative bg-slate-100 overflow-hidden rounded-[20px]">
                                <img
                                    alt={campaign.tenChienDich}
                                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isUpcoming ? 'opacity-80' : ''}`}
                                    src={campaign.imageUrl ? `/images/${campaign.imageUrl}` : "https://via.placeholder.com/400x300"}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {(status.status === "Đang mở" || status.status === "Đã phê duyệt") && (
                                        <span className="bg-[#00b894] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md bg-opacity-90">Đang mở</span>
                                    )}
                                    {status.status === "Sắp diễn ra" && (
                                        <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md bg-opacity-90">Sắp diễn ra</span>
                                    )}
                                    {status.status === "Đã kết thúc" && (
                                        <span className="bg-slate-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md bg-opacity-90">Đã kết thúc</span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900 mb-5 line-clamp-2 leading-snug">
                                    {campaign.tenChienDich}
                                </h3>

                                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    {/* Location */}
                                    <div className="flex items-start gap-3 text-sm text-slate-700">
                                        <span className="material-symbols-outlined text-[#e62e43] text-xl shrink-0">location_on</span>
                                        <span className="line-clamp-2 leading-relaxed font-medium">
                                            {campaign.diaDiem?.tenDiaDiem}, {campaign.diaDiem?.diaChiChiTiet}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="material-symbols-outlined text-[#00b894] text-xl shrink-0">calendar_month</span>
                                        <span className="font-medium">{campaign.thoiGianBD} - {campaign.thoiGianKT}</span>
                                    </div>

                                    {/* Target */}
                                    <div className="flex items-center gap-3 text-sm text-slate-700">
                                        <span className="material-symbols-outlined text-blue-500 text-xl shrink-0">target</span>
                                        <span className="font-bold">Chỉ tiêu: {campaign.soLuongDuKien} đơn vị</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mt-auto px-1">
                                    <div className="flex justify-between text-xs mb-2 font-bold text-slate-500 uppercase tracking-wide">
                                        <span>Tiến độ</span>
                                        <span className={percentage >= 100 ? "text-[#00b894]" : "text-[#e62e43]"}>
                                            {campaign.luongMauDaThu} / {campaign.soLuongDuKien} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6 shadow-inner">
                                        <div
                                            className={`h-full transition-all duration-1000 ${isUpcoming ? 'bg-slate-300' : percentage >= 100 ? 'bg-[#00b894]' : 'bg-[#e62e43]'}`}
                                            style={{ width: `${isUpcoming ? 0 : Math.min(100, percentage)}%` }}
                                        ></div>
                                    </div>

                                    {/* Button */}
                                    {isUpcoming ? (
                                        <button
                                            disabled
                                            className="w-full h-12 bg-slate-100 text-slate-400 rounded-xl font-bold uppercase tracking-wider text-xs cursor-not-allowed"
                                        >
                                            Chưa mở đăng ký
                                        </button>
                                    ) : daDangKy ? (
                                        <button
                                            disabled
                                            className="w-full h-12 bg-emerald-50 text-[#00b894] border border-emerald-200 rounded-xl font-bold uppercase tracking-wider text-xs cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                            Đã Đăng Ký
                                        </button>
                                    ) : (
                                        <button
                                            disabled={status.status === "Đã kết thúc"}
                                            onClick={() => {
                                                const userEmail = localStorage.getItem('email');
                                                if (!userEmail) {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: 'Chưa đăng nhập',
                                                        text: 'Vui lòng đăng nhập để tham gia chiến dịch!',
                                                        confirmButtonText: 'Đăng nhập ngay',
                                                        confirmButtonColor: '#e62e43'
                                                    }).then(() => {
                                                        navigate('/login');
                                                    });
                                                    return;
                                                }
                                                localStorage.setItem('selectedCampaign', JSON.stringify(campaign));
                                                navigate('/khai-bao-thong-tin-ca-nhan');
                                            }}
                                            className="w-full h-12 bg-[#e62e43] text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#c01b30] transition-colors shadow-lg shadow-[#e62e43]/20 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                                        >
                                            {status.status === "Đã kết thúc" ? "Đã kết thúc" : "Đăng Ký Tham Gia"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredCampaigns.length === 0 && (
                <div className="w-full text-center py-12">
                    <p className="text-slate-500">Không tìm thấy chiến dịch phù hợp.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-white transition-colors bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    {getPaginationPages().map((page, idx) => (
                        page === '...' ? (
                            <span key={`dots-${idx}`} className="w-10 text-center text-slate-400 font-bold tracking-widest">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 flex items-center justify-center rounded-md font-bold shadow-sm transition-colors ${currentPage === page
                                        ? 'border-2 border-red-700 bg-red-50 text-red-700'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    ))}

                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-white transition-colors bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            )}
            </div>
        </main>
    );
}
