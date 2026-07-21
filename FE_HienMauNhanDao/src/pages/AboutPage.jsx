import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <main className="flex-1 w-full bg-[#fdf8f9] text-[#121826] overflow-hidden">

            {/* Editorial Hero Section with Real Lab Photography */}
            <section className="relative min-h-[560px] md:min-h-[640px] w-full overflow-hidden flex items-center py-16 lg:py-24 bg-slate-950 text-white">
                <img 
                    alt="Medical Vision Hero" 
                    className="w-full h-full absolute inset-0 object-cover opacity-25 scale-105 hover:scale-100 transition-transform duration-1000" 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>

                <div className="relative w-full max-w-[1280px] mx-auto px-4 md:px-8 z-10">
                    <div className="w-full max-w-[840px] space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-black uppercase tracking-widest text-[#ff6b7e]">
                            <span className="w-2.5 h-2.5 bg-[#e62e43] rounded-full animate-pulse"></span>
                            <span>HÀNH TRÌNH NHÂN ÁI • TỰ HÀO ĐÀ NẴNG</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-[64px] font-black leading-[1.06] text-white tracking-tight">
                            KẾT NỐI TẤM LÒNG VÀNG,<br />
                            <span className="editorial-title-ruby">BẢO VỆ NGUỒN SỐNG Y TẾ</span>
                        </h1>

                        <p className="text-base sm:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
                            Hệ thống Quản lý Hiến máu Nhân đạo TP. Đà Nẵng là nền tảng công nghệ số hiện đại kết nối trực tiếp Người hiến máu tình nguyện, Bệnh viện điều trị và Ngân hàng máu thành phố.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button 
                                onClick={() => navigate('/chiendich')}
                                className="h-14 px-8 bg-[#e62e43] text-white rounded-2xl font-black text-sm hover:bg-[#c01b30] hover:shadow-xl hover:shadow-[#e62e43]/30 transition-all flex items-center justify-center gap-3 group">
                                <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">volunteer_activism</span>
                                <span>ĐĂNG KÝ HIẾN MÁU NGAY</span>
                            </button>

                            <button 
                                onClick={() => document.getElementById('su-menh').scrollIntoView({ behavior: 'smooth' })}
                                className="h-14 px-8 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-xl">info</span>
                                <span>Tìm hiểu sứ mệnh</span>
                            </button>
                        </div>

                        {/* Credential Counters */}
                        <div className="pt-8 border-t border-white/15 grid grid-cols-3 gap-6 max-w-lg">
                            <div>
                                <p className="text-2xl sm:text-3xl font-black text-white">5.000+</p>
                                <p className="text-xs text-slate-400 font-medium">Tình nguyện viên</p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-black text-[#00b894]">50+</p>
                                <p className="text-xs text-slate-400 font-medium">Điểm tiếp nhận</p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-black text-[#e62e43]">100%</p>
                                <p className="text-xs text-slate-400 font-medium">Chuẩn Y Khoa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Story Section - Photorealistic Medical Photography */}
            <section id="su-menh" className="w-full max-w-[1280px] mx-auto py-20 px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column: Real Photography Stack */}
                    <div className="lg:col-span-6 relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[280px] sm:h-[360px]">
                                <img 
                                    alt="Phòng xét nghiệm y khoa" 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                                    src="https://images.unsplash.com/photo-1582718001386-4277b0d91d84?auto=format&fit=crop&q=80&w=800" 
                                />
                            </div>
                            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[280px] sm:h-[360px] mt-8">
                                <img 
                                    alt="Đội ngũ bác sĩ" 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800" 
                                />
                            </div>
                        </div>

                        {/* Floating Clinical Badge */}
                        <div className="absolute bottom-4 left-4 sm:left-8 clinical-glass p-5 rounded-2xl shadow-xl border border-white max-w-[280px] hidden sm:block">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-[#e62e43] text-2xl">workspace_premium</span>
                                <span className="text-xs font-black text-slate-900 uppercase">Tiêu Chuẩn Quốc Gia</span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">Cam kết quy trình sàng lọc và bảo quản máu vô trùng tuyệt đối.</p>
                        </div>
                    </div>

                    {/* Right Column: Editorial Mission Text */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#e62e43] text-xs font-black uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-[#e62e43]"></span>
                            Sứ Mệnh Y Tế
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                            Số Hóa Quy Trình Hiến Máu,<br />
                            <span className="text-[#e62e43]">Minh Bạch & An Toàn</span>
                        </h2>

                        <p className="text-base text-slate-600 font-normal leading-relaxed">
                            Khởi nguồn từ mong muốn tối ưu hóa nguồn lực máu quý giá của thành phố, chúng tôi đã xây dựng nền tảng kết nối trực tiếp, minh bạch và tức thời giữa người hiến, bệnh viện điều trị và Ngân hàng máu Đà Nẵng.
                        </p>

                        <div className="space-y-4 pt-2">
                            <div className="bento-card p-6 flex gap-5 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#e62e43] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900 mb-1">Kiểm Sàng Lọc Kỹ Càng</h4>
                                    <p className="text-xs text-slate-500 font-normal leading-relaxed">Mọi đơn vị máu đều trải qua quy trình xét nghiệm 5 chỉ số an toàn nghiêm ngặt trước khi lưu kho.</p>
                                </div>
                            </div>

                            <div className="bento-card p-6 flex gap-5 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#00b894] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900 mb-1">Ứng Dụng Mã QR & Chữ Ký Số</h4>
                                    <p className="text-xs text-slate-500 font-normal leading-relaxed">Tích hợp giấy chứng nhận điện tử và truy xuất nguồn gốc đơn vị máu chính xác 100%.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Core Pillars - Bento Grid Layout */}
            <section className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-12 mb-16">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                    <span className="text-xs font-black text-[#e62e43] uppercase tracking-widest">Trụ Cột Hoạt Động</span>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900">3 Nguyên Tắc Hoạt Động Cốt Lõi</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Pillar 1 */}
                    <div className="bento-card p-8 flex flex-col justify-between space-y-6 bg-white">
                        <div className="w-16 h-16 rounded-2xl bg-[#e62e43] text-white flex items-center justify-center shadow-lg shadow-[#e62e43]/20">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900">100% Tự Nguyện & Nhân Văn</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                Tôn vinh cử chỉ cao đẹp của từng tình nguyện viên, mang lại nguồn sinh khí mới cho những bệnh nhân cần máu cấp cứu khẩn cấp.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bento-card p-8 flex flex-col justify-between space-y-6 bg-white">
                        <div className="w-16 h-16 rounded-2xl bg-[#00b894] text-white flex items-center justify-center shadow-lg shadow-[#00b894]/20">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900">An Toàn Tuyệt Đối</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                Sử dụng trang thiết bị vô trùng dùng 1 lần, đội ngũ bác sĩ chuyên khoa huyết học giám sát trực tiếp suốt quá trình hiến máu.
                            </p>
                        </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bento-card p-8 flex flex-col justify-between space-y-6 bg-white">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900">Điều Phối Nhanh Chóng</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                Thu thập và thông báo nhu cầu máu khẩn cấp theo thời gian thực tới toàn bộ cộng đồng tình nguyện viên tại Đà Nẵng.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Milestones / Development Journey 3D Bento */}
            <section className="bg-slate-900 py-20 text-white relative">
                <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                        <span className="text-[#e62e43] text-xs font-black uppercase tracking-widest">Cột Mốc Phát Triển</span>
                        <h2 className="text-3xl font-black text-white">Chặng Đường Đáng Tự Hào</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#e62e43] transition-all">
                            <span className="text-4xl font-black text-[#e62e43] block mb-2">2024</span>
                            <h4 className="font-bold text-white text-base mb-1">Thành Lập Hệ Thống</h4>
                            <p className="text-xs text-slate-400 font-light">Số hóa toàn bộ quy trình hiến máu tại TP. Đà Nẵng.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-[#00b894] transition-all">
                            <span className="text-4xl font-black text-[#00b894] block mb-2">50+</span>
                            <h4 className="font-bold text-white text-base mb-1">Cơ Sở Y Tế</h4>
                            <p className="text-xs text-slate-400 font-light">Liên kết trực tiếp với các Bệnh viện lớn trong khu vực.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-amber-400 transition-all">
                            <span className="text-4xl font-black text-amber-400 block mb-2">5.000+</span>
                            <h4 className="font-bold text-white text-base mb-1">Tình Nguyên Viên</h4>
                            <p className="text-xs text-slate-400 font-light">Người hiến máu sẵn sàng hỗ trợ trong mọi tình huống khẩn cấp.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-purple-400 transition-all">
                            <span className="text-4xl font-black text-purple-400 block mb-2">100%</span>
                            <h4 className="font-bold text-white text-base mb-1">Mã QR Bảo Mật</h4>
                            <p className="text-xs text-slate-400 font-light">Cấp Chứng nhận điện tử ngay sau khi hiến máu thành công.</p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
