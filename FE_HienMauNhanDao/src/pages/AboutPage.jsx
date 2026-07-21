import React from 'react';

export default function AboutPage() {
    return (
        <main className="flex-1 w-full bg-[#fff7f8] text-[#1e1b2e] overflow-hidden">

            {/* 3D Glassmorphism Hero Section */}
            <section className="relative min-h-[520px] md:min-h-[620px] w-full overflow-hidden flex items-center py-16 bg-slate-950">
                <img 
                    alt="Medical Vision Hero" 
                    className="w-full h-full absolute inset-0 object-cover opacity-25 scale-105 hover:scale-100 transition-transform duration-1000" 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>

                {/* Ambient Glowing Orbs */}
                <div className="absolute top-[-20%] right-[10%] w-[450px] h-[450px] bg-[#ff3b63]/25 rounded-full blur-[140px] pointer-events-none"></div>

                <div className="relative w-full max-w-[1200px] mx-auto px-4 md:px-6 z-10">
                    <div className="w-full max-w-[800px] space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 glass-panel-dark rounded-full text-xs font-black uppercase tracking-widest text-[#ff3b63]">
                            <span className="w-2.5 h-2.5 bg-[#ff3b63] rounded-full animate-ping"></span>
                            <span>Hành Trình Nhân Ái • TP. Đà Nẵng</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl md:text-[68px] font-black leading-[1.08] text-white tracking-tight">
                            Khát Vọng Vì Một<br />
                            <span className="gradient-text-ruby">Cộng Đồng Khỏe Mạnh 3D</span>
                        </h1>

                        <p className="text-base sm:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
                            Hệ thống Quản lý Hiến máu Nhân đạo Đà Nẵng là cầu nối chuyển đổi số y tế, mang lại sự minh bạch, kết nối tức thời giữa tấm lòng vàng và người bệnh cần máu khẩn cấp.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button className="h-14 px-8 gradient-bg-ruby text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-[#ff3b63]/30 hover:scale-105 transition-all flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                                <span>Tham Gia Cùng Chúng Tôi</span>
                            </button>
                            <button className="h-14 px-8 glass-panel-dark text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
                                <span>Xem Báo Cáo Tác Động</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission - 3D Cards */}
            <section className="w-full max-w-[1200px] mx-auto py-20 px-4 md:px-6">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-[#ff3b63] text-xs font-black uppercase tracking-widest">Giá Trị Cốt Lõi</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Sứ Mệnh & Tầm Nhìn Chiến Lược</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Card 1 */}
                    <div className="glass-card-3d rounded-3xl p-8 space-y-4">
                        <div className="w-16 h-16 rounded-2xl gradient-bg-ruby text-white flex items-center justify-center shadow-lg shadow-[#ff3b63]/30 mb-6">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">100% Nhân Văn</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            Tôn vinh giá trị của từng đơn vị máu hiến tặng, mang tới niềm tin và hy vọng sống cho hàng ngàn bệnh nhân cấp cứu mỗi năm.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="glass-card-3d rounded-3xl p-8 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00c9a7] to-[#009b82] text-white flex items-center justify-center shadow-lg shadow-[#00c9a7]/30 mb-6">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Chuẩn Y Tế Quốc Tế</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            Tuân thủ nghiêm ngặt quy trình kiểm tra y tế, xét nghiệm sàng lọc máu hiện đại bảo đảm an toàn tuyệt đối cho người nhận.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="glass-card-3d rounded-3xl p-8 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Minh Bạch Số 4.0</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            Ứng dụng mã QR theo dõi hành trình đơn vị máu từ điểm tiếp nhận đến kho lưu trữ bệnh viện một cách tự động và chính xác.
                        </p>
                    </div>

                </div>
            </section>

            {/* Milestones / Development Journey 3D Timeline */}
            <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 text-white relative">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <span className="text-[#ff3b63] text-xs font-black uppercase tracking-widest">Hành Trình Đã Qua</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Những Cột Mốc Đáng Tự Hào</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-panel-dark rounded-3xl p-6 text-center space-y-2 border border-white/10 hover:border-[#ff3b63]/50 transition-all">
                            <span className="text-3xl font-black text-[#ff3b63]">2024</span>
                            <h4 className="font-bold text-white text-base">Khởi Tạo Nền Tảng</h4>
                            <p className="text-xs text-slate-400">Xây dựng hệ thống quản lý máu số hóa đầu tiên tại Đà Nẵng.</p>
                        </div>

                        <div className="glass-panel-dark rounded-3xl p-6 text-center space-y-2 border border-white/10 hover:border-[#00c9a7]/50 transition-all">
                            <span className="text-3xl font-black text-[#00c9a7]">50+</span>
                            <h4 className="font-bold text-white text-base">Điểm Hiến Máu</h4>
                            <p className="text-xs text-slate-400">Kết nối các bệnh viện và trung tâm y tế lớn trong khu vực.</p>
                        </div>

                        <div className="glass-panel-dark rounded-3xl p-6 text-center space-y-2 border border-white/10 hover:border-amber-400/50 transition-all">
                            <span className="text-3xl font-black text-amber-400">5.000+</span>
                            <h4 className="font-bold text-white text-base">Tình Nguyên Viên</h4>
                            <p className="text-xs text-slate-400">Cộng đồng người hiến máu thường xuyên sẵn sàng hỗ trợ khẩn cấp.</p>
                        </div>

                        <div className="glass-panel-dark rounded-3xl p-6 text-center space-y-2 border border-white/10 hover:border-purple-400/50 transition-all">
                            <span className="text-3xl font-black text-purple-400">100%</span>
                            <h4 className="font-bold text-white text-base">Số Hóa Chứng Nhận</h4>
                            <p className="text-xs text-slate-400">Giấy chứng nhận hiến máu điện tử tích hợp QR Code tiện lợi.</p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
