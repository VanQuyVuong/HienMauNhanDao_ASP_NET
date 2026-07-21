import React from 'react';

export default function AboutPage() {
    return (
        <main className="flex-1 w-full bg-[#fdf8f9] text-[#121826] overflow-hidden">

            {/* Editorial Hero Section with Real Lab Photography */}
            <section className="relative min-h-[500px] md:min-h-[580px] w-full overflow-hidden flex items-center py-16 bg-slate-900 text-white">
                <img 
                    alt="Medical Vision Hero" 
                    className="w-full h-full absolute inset-0 object-cover opacity-30" 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>

                <div className="relative w-full max-w-[1280px] mx-auto px-4 md:px-8 z-10">
                    <div className="w-full max-w-[800px] space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-black uppercase tracking-widest text-[#e62e43]">
                            <span className="w-2.5 h-2.5 bg-[#e62e43] rounded-full animate-pulse"></span>
                            <span>Hành Trình Nhân Ái • Thành Phố Đà Nẵng</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-[60px] font-black leading-[1.08] text-white tracking-tight">
                            KHÁT VỌNG VÌ MỘT<br />
                            <span className="editorial-title-ruby">CỘNG ĐỒNG KHỎE MẠNH</span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
                            Hệ thống Quản lý Hiến máu Nhân đạo Đà Nẵng là cầu nối chuyển đổi số y tế, mang lại sự minh bạch, kết nối tức thời giữa tấm lòng vàng và người bệnh cần máu khẩn cấp tại các bệnh viện khu vực.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button className="h-14 px-8 bg-[#e62e43] text-white rounded-2xl font-black text-sm hover:bg-[#c01b30] hover:shadow-xl transition-all flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-xl">volunteer_activism</span>
                                <span>Tham Gia Cùng Chúng Tôi</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Realistic Medical Story Grid (Câu Chuyện Y Tế Chân Thực) */}
            <section className="w-full max-w-[1280px] mx-auto py-20 px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Real Photography Stack */}
                    <div className="lg:col-span-6 relative">
                        <div className="grid grid-cols-2 gap-4">
                            <img 
                                alt="Phòng xét nghiệm y khoa" 
                                className="w-full h-[280px] sm:h-[360px] object-cover rounded-3xl shadow-xl border-4 border-white" 
                                src="https://images.unsplash.com/photo-1582718001386-4277b0d91d84?auto=format&fit=crop&q=80&w=800" 
                            />
                            <img 
                                alt="Đội ngũ bác sĩ" 
                                className="w-full h-[280px] sm:h-[360px] object-cover rounded-3xl shadow-xl border-4 border-white mt-8" 
                                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800" 
                            />
                        </div>
                    </div>

                    {/* Right Column: Editorial Text */}
                    <div className="lg:col-span-6 space-y-6">
                        <span className="text-xs font-black text-[#e62e43] uppercase tracking-widest block">Sứ Mệnh Y Tế</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                            Kiến Tạo Hệ Sinh Thái<br />
                            <span className="text-[#e62e43]">Hiến Máu Số Hiện Đại</span>
                        </h2>

                        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                            Khởi nguồn từ mong muốn tối ưu hóa nguồn lực máu quý giá của thành phố, chúng tôi đã xây dựng nền tảng kết nối trực tiếp, minh bạch và tức thời giữa người hiến, bệnh viện điều trị và Ngân hàng máu Đà Nẵng.
                        </p>

                        <div className="space-y-4 pt-4">
                            <div className="flex gap-4 items-start bento-card p-5">
                                <div className="w-12 h-12 rounded-xl bg-rose-100 text-[#e62e43] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900">Tiêu Chuẩn Y Tế Quốc Gia</h4>
                                    <p className="text-xs text-slate-500 font-normal leading-relaxed">Áp dụng quy trình kiểm tra nghiêm ngặt trong quản lý và sàng lọc máu.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start bento-card p-5">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#00b894] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">hub</span>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900">Mạng Lưới Y Tế 24/7</h4>
                                    <p className="text-xs text-slate-500 font-normal leading-relaxed">Hơn 50 điểm hiến máu cố định và lưu động trải dài khắp TP. Đà Nẵng.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Milestone Numbers Bento */}
            <section className="bg-slate-900 py-20 text-white">
                <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-[#e62e43] text-xs font-black uppercase tracking-widest block mb-1">Cột Mốc Phát Triển</span>
                        <h2 className="text-3xl font-black text-white">Chặng Đường Đáng Tự Hào</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <span className="text-4xl font-black text-[#e62e43] block mb-2">2024</span>
                            <h4 className="font-bold text-white text-base mb-1">Thành Lập Hệ Thống</h4>
                            <p className="text-xs text-slate-400 font-light">Số hóa toàn bộ quy trình hiến máu tại Đà Nẵng.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <span className="text-4xl font-black text-[#00b894] block mb-2">50+</span>
                            <h4 className="font-bold text-white text-base mb-1">Cơ Sở Y Tế</h4>
                            <p className="text-xs text-slate-400 font-light">Liên kết trực tiếp với các Bệnh viện lớn trong khu vực.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <span className="text-4xl font-black text-amber-400 block mb-2">5.000+</span>
                            <h4 className="font-bold text-white text-base mb-1">Tình Nguyện Viên</h4>
                            <p className="text-xs text-slate-400 font-light">Người hiến máu sẵn sàng hỗ trợ trong mọi tình huống khẩn cấp.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
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
