import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <main className="flex-1 w-full bg-[#fffcfb]">
            {/* Premium Hero Section */}
            <section className="relative min-h-[500px] sm:min-h-[700px] w-full overflow-hidden flex items-center">
                <img alt="Premium Hero" className="w-full h-full absolute inset-0 object-cover scale-105 hover:scale-100 transition-transform duration-1000" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="relative w-full max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20 z-10">
                    <div className="w-full max-w-[800px] space-y-6 md:space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-white animate-fade-in">
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                            Kiến tạo giá trị nhân văn từ 2024
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-[72px] font-black leading-[1.05] text-white drop-shadow-2xl">
                            Khát Vọng<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-red-400">Vì Một Việt Nam Khỏe Mạnh</span>
                        </h2>
                        <p className="text-lg md:text-2xl text-white/70 font-light leading-relaxed max-w-2xl">
                            Hệ thống Quản lý Hiến máu Đà Nẵng không chỉ là một công cụ công nghệ, mà là cầu nối của lòng nhân ái, mang lại hy vọng cho hàng ngàn bệnh nhân mỗi ngày.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button className="h-16 px-6 md:px-12 bg-primary text-white rounded-2xl font-black text-sm hover:bg-red-800 hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 group">
                                <span className="material-symbols-outlined group-hover:scale-125 transition-transform">volunteer_activism</span>
                                Đăng ký hiến máu ngay
                            </button>
                            <button className="h-16 px-6 md:px-12 bg-white/5 backdrop-blur-2xl border border-white/20 text-white rounded-2xl font-black text-sm hover:bg-white/15 transition-all">
                                Xem báo cáo tác động
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story / Vision */}
            <section id="overview" className="w-full max-w-[1200px] mx-auto py-16 md:py-32 px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
                    <div className="col-span-1 lg:col-span-6 relative">
                        <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <img alt="Modern Lab" className="w-full h-[250px] sm:h-[400px] object-cover rounded-[32px] shadow-2xl" src="https://honghunghospital.com.vn/wp-content/uploads/2020/08/6.-L%C3%AA-Nguy%C3%AAn-Kha-scaled.jpg" />
                            <img alt="Medical Team" className="w-full h-[250px] sm:h-[400px] object-cover rounded-[32px] shadow-2xl mt-12" src="https://honghunghospital.com.vn/wp-content/uploads/2022/01/80.-L%C3%AA-Th%E1%BB%8B-Ph%C6%B0%E1%BB%A3ng-Ngoan-scaled.jpg" />
                        </div>
                        <div className="absolute -bottom-16 -right-4 sm:-bottom-24 sm:-right-10 bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-2xl border border-slate-50 max-w-[200px] sm:max-w-[280px] z-20">
                            <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-4 text-primary">
                                <span className="material-symbols-outlined text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed italic">"Chúng tôi cam kết mang lại quy trình an toàn và chuyên nghiệp nhất cho mọi người hiến."</p>
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-slate-400 mt-2 sm:mt-4">— TS. Nguyễn Văn A</p>
                        </div>
                    </div>
                    <div className="col-span-1 lg:col-span-6 space-y-8 mt-12 lg:mt-0">
                        <div className="inline-flex items-center gap-3 text-primary">
                            <div className="w-12 h-[2px] bg-primary"></div>
                            <span className="text-xs font-black uppercase tracking-[0.3em]">Hành trình của chúng tôi</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                            Kiến tạo hệ sinh thái<br />
                            <span className="text-primary">y tế số hiện đại</span>
                        </h3>
                        <p className="text-base md:text-lg text-slate-500 font-light leading-relaxed">
                            Khởi nguồn từ mong muốn tối ưu hóa nguồn lực máu quý giá của thành phố, chúng tôi đã xây dựng một nền tảng kết nối trực tiếp, minh bạch và tức thời giữa người hiến, bệnh viện và các tổ chức điều phối.
                        </p>
                        <div className="space-y-6 pt-4">
                            <div className="flex gap-6 items-start group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Tiêu chuẩn Quốc tế</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Áp dụng quy trình ISO 9001:2015 trong quản lý và sàng lọc máu.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                                    <span className="material-symbols-outlined text-2xl">hub</span>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Mạng lưới 24/7</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Hơn 50 điểm hiến máu cố định và lưu động trải dài khắp TP. Đà Nẵng.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Journey / Timeline Section */}
            <section className="bg-slate-900 py-16 md:py-32 relative overflow-hidden">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-4">
                        <span className="text-primary text-[11px] font-black uppercase tracking-[0.4em]">Milestones</span>
                        <h3 className="text-3xl md:text-5xl font-black text-white">Chặng Đường Phát Triển</h3>
                        <p className="text-slate-400 text-base md:text-lg font-light">Những dấu mốc quan trọng trong sự nghiệp bảo vệ sự sống cộng đồng.</p>
                    </div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute top-0 left-6 md:left-1/2 w-[1px] h-full bg-white/10 md:-translate-x-1/2"></div>

                        <div className="space-y-12">
                            {/* Step 1 */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full group gap-4 md:gap-0 relative pl-16 md:pl-0">
                                <div className="w-full md:w-[45%] text-left md:text-right pr-0 md:pr-12">
                                    <h5 className="text-primary font-black text-2xl mb-2">2024.01</h5>
                                    <h6 className="text-white font-bold text-xl mb-3">Khởi động dự án</h6>
                                    <p className="text-slate-400 text-sm leading-relaxed">Thành lập Ban Chỉ Đạo và xây dựng hệ thống phần mềm cốt lõi.</p>
                                </div>
                                <div className="absolute left-0 md:relative md:left-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black border-8 border-slate-900 z-20 shrink-0 md:mx-auto">1</div>
                                <div className="hidden md:block w-[45%]"></div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full group gap-4 md:gap-0 relative pl-16 md:pl-0">
                                <div className="hidden md:block w-[45%]"></div>
                                <div className="absolute left-0 md:relative md:left-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black border-8 border-slate-900 z-20 shrink-0 md:mx-auto">2</div>
                                <div className="w-full md:w-[45%] pl-0 md:pl-12 text-left">
                                    <h5 className="text-primary font-black text-2xl mb-2">2024.06</h5>
                                    <h6 className="text-white font-bold text-xl mb-3">Kết nối Bệnh viện</h6>
                                    <p className="text-slate-400 text-sm leading-relaxed">Hoàn thành kết nối dữ liệu với 10 bệnh viện lớn nhất TP. Đà Nẵng.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full group gap-4 md:gap-0 relative pl-16 md:pl-0">
                                <div className="w-full md:w-[45%] text-left md:text-right pr-0 md:pr-12">
                                    <h5 className="text-primary font-black text-2xl mb-2">2024.09</h5>
                                    <h6 className="text-white font-bold text-xl mb-3">Hệ sinh thái Số</h6>
                                    <p className="text-slate-400 text-sm leading-relaxed">Ra mắt ứng dụng di động dành cho Tình nguyện viên.</p>
                                </div>
                                <div className="absolute left-0 md:relative md:left-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black border-8 border-slate-900 z-20 shrink-0 md:mx-auto">3</div>
                                <div className="hidden md:block w-[45%]"></div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full group gap-4 md:gap-0 relative pl-16 md:pl-0">
                                <div className="hidden md:block w-[45%]"></div>
                                <div className="absolute left-0 md:relative md:left-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black border-8 border-slate-900 z-20 shrink-0 md:mx-auto">4</div>
                                <div className="w-full md:w-[45%] pl-0 md:pl-12 text-left">
                                    <h5 className="text-primary font-black text-2xl mb-2">2025.01</h5>
                                    <h6 className="text-white font-bold text-xl mb-3">Vươn xa hơn</h6>
                                    <p className="text-slate-400 text-sm leading-relaxed">Mở rộng mô hình ra các tỉnh thành lân cận miền Trung.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Team Section */}
            <section className="py-16 md:py-32 bg-white">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-20">
                        <div className="space-y-4">
                            <span className="text-primary text-[11px] font-black uppercase tracking-[0.4em]">Leadership</span>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900">Đội Ngũ Chuyên Gia</h3>
                            <p className="text-slate-500 text-base md:text-lg font-light">Những bác sĩ và chuyên gia công nghệ hàng đầu đứng sau hệ thống.</p>
                        </div>
                        <button className="h-14 px-10 bg-slate-50 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-200 w-fit">Gia nhập đội ngũ</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Member 1 */}
                        <div className="group">
                            <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-[32px] overflow-hidden mb-6">
                                <img alt="Team Member" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://honghunghospital.com.vn/wp-content/uploads/2022/02/85.-L%C3%AA-Ph%E1%BA%A1m-Qu%E1%BB%B3nh-Trang-scaled.jpg" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <div className="flex gap-4">
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">share</span></Link>
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">mail</span></Link>
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">BS. Lê Phạm Quỳnh Trang</h4>
                            <p className="text-sm text-slate-400 uppercase tracking-widest font-black">Giám đốc Y khoa</p>
                        </div>
                        {/* Member 2 */}
                        <div className="group">
                            <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-[32px] overflow-hidden mb-6">
                                <img alt="Team Member" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://honghunghospital.com.vn/wp-content/uploads/2023/08/BS-Tr%C3%A2n.jpg" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <div className="flex gap-4">
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">share</span></Link>
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">mail</span></Link>
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">BS. Trân</h4>
                            <p className="text-sm text-slate-400 uppercase tracking-widest font-black">Trưởng Khoa Huyết Học</p>
                        </div>
                        {/* Member 3 */}
                        <div className="group">
                            <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-[32px] overflow-hidden mb-6">
                                <img alt="Team Member" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://honghunghospital.com.vn/wp-content/uploads/2023/10/BS-Tr%E1%BA%A7n-Ph%C3%BA-Th%E1%BB%8Bnh-Khoa-C%E1%BA%A5p-c%E1%BB%A9u.jpg" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <div className="flex gap-4">
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">share</span></Link>
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">mail</span></Link>
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">BS. Trần Phú Thịnh</h4>
                            <p className="text-sm text-slate-400 uppercase tracking-widest font-black">Giám đốc Công nghệ</p>
                        </div>
                        {/* Member 4 */}
                        <div className="group">
                            <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-[32px] overflow-hidden mb-6">
                                <img alt="Team Member" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://honghunghospital.com.vn/wp-content/uploads/2024/03/BS-Nguy%E1%BB%85n-Th%C3%A0nh-T%C3%A0i.jpg" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <div className="flex gap-4">
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">share</span></Link>
                                        <Link to="#" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all"><span className="material-symbols-outlined text-xl">mail</span></Link>
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">BS. Nguyễn Thành Tài</h4>
                            <p className="text-sm text-slate-400 uppercase tracking-widest font-black">Chuyên gia Vận động</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section (Glassmorphism) */}
            <section className="bg-[#fdf2f2] py-16 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        <div className="space-y-6 lg:space-y-10">
                            <div className="inline-block px-3 py-1 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded shadow-sm">Triết lý vận hành</div>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">Tại sao chọn<br />chúng tôi?</h3>
                            <p className="text-slate-500 font-light leading-relaxed">Sự tin tưởng của bạn là tài sản lớn nhất. Chúng tôi không ngừng hoàn thiện để xứng đáng với sự tin tưởng đó.</p>
                            <div className="pt-4">
                                <img alt="Certification" className="h-16 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ISO_9001_Logo.svg/1200px-ISO_9001_Logo.svg.png" />
                            </div>
                        </div>
                        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500 sm:translate-y-8">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6">shield_with_heart</span>
                                <h4 className="text-2xl font-black text-slate-900 mb-4">An Toàn Tuyệt Đối</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Mọi quy trình từ lấy máu đến lưu trữ đều tuân thủ nghiêm ngặt các tiêu chuẩn y tế quốc tế, đảm bảo sức khỏe tối đa cho người hiến.</p>
                            </div>
                            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6">database</span>
                                <h4 className="text-2xl font-black text-slate-900 mb-4">Minh Bạch Dữ Liệu</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Bạn có thể theo dõi hành trình đơn vị máu của mình thông qua mã QR cá nhân, biết được giọt máu quý giá đã được trao đến đâu.</p>
                            </div>
                            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500 sm:translate-y-8">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6">auto_awesome</span>
                                <h4 className="text-2xl font-black text-slate-900 mb-4">Trải Nghiệm Số</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Đặt lịch, xem kết quả xét nghiệm, nhận chứng nhận điện tử và quà tặng tri ân chỉ trong một ứng dụng duy nhất.</p>
                            </div>
                            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-xl hover:shadow-2xl transition-all duration-500">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6">group_work</span>
                                <h4 className="text-2xl font-black text-slate-900 mb-4">Cộng Đồng Gắn Kết</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Chúng tôi tổ chức các buổi gặp gỡ, hội thảo và vinh danh những "Người hùng thầm lặng" hàng quý để lan tỏa lòng nhân ái.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact & Volunteer Section */}
            <section className="w-full max-w-[1200px] mx-auto py-16 md:py-32 px-4 md:px-6">
                <div className="bg-slate-900 rounded-[24px] sm:rounded-[64px] overflow-hidden flex flex-col lg:flex-row items-center shadow-3xl shadow-slate-200">
                    <div className="w-full lg:w-1/2 p-6 sm:p-12 md:p-24 space-y-6 md:space-y-10">
                        <div className="space-y-4">
                            <span className="text-primary text-[11px] font-black uppercase tracking-[0.4em]">Call to Action</span>
                            <h3 className="text-3xl md:text-5xl font-black text-white leading-[1.1]">Trở Thành Một Phần Của Điều Kỳ Diệu</h3>
                            <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
                                Mỗi giọt máu bạn trao đi không chỉ là sự giúp đỡ y tế, mà là niềm tin vào một cộng đồng gắn kết và yêu thương. Đừng chần chừ, hãy bắt đầu hành trình của bạn ngay hôm nay.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <button className="h-16 px-12 bg-primary text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-2xl shadow-primary/40">Tham gia ngay</button>
                            <div className="flex items-center gap-4 text-white/40 border-l border-white/10 pl-6">
                                <div className="flex -space-x-4">
                                    <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?u=1" alt="" />
                                    <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?u=2" alt="" />
                                    <img className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/100?u=3" alt="" />
                                </div>
                                <p className="text-xs font-bold tracking-tight">15k+ đã tham gia</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 h-[300px] lg:h-[650px]">
                        <img alt="Inspirational Volunteer" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1000" />
                    </div>
                </div>
            </section>

            {/* FAQ & Support */}
            <section className="bg-white py-16 md:py-32 border-t border-slate-50">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                        <div className="w-full lg:w-2/5 space-y-6 lg:space-y-10">
                            <div className="space-y-4">
                                <span className="text-primary text-[11px] font-black uppercase tracking-[0.4em]">Help Center</span>
                                <h3 className="text-3xl md:text-5xl font-black text-slate-900">Giải Đáp Thắc Mắc</h3>
                                <p className="text-slate-500 text-base md:text-lg font-light leading-relaxed">Chúng tôi hiểu rằng bạn có thể có những băn khoăn. Dưới đây là những câu hỏi thường gặp nhất từ cộng đồng.</p>
                            </div>
                            <div className="p-6 sm:p-10 bg-slate-50 rounded-[32px] sm:rounded-[40px] border border-slate-100 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-primary">headset_mic</span></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Hỗ trợ trực tiếp</p>
                                        <p className="text-xs text-slate-400">Hoạt động 24/7 cho các ca khẩn cấp</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-slate-900">1900 1234</p>
                                <button className="w-full h-14 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm hover:bg-primary hover:text-white hover:border-primary transition-all">Gửi tin nhắn ngay</button>
                            </div>
                        </div>
                        <div className="w-full lg:w-3/5 space-y-6">
                            <details className="group border border-slate-100 rounded-[32px] p-6 sm:p-8 hover:border-primary/30 transition-all duration-300">
                                <summary className="list-none flex justify-between items-center cursor-pointer">
                                    <span className="text-lg sm:text-xl font-bold text-slate-900 group-open:text-primary transition-colors">Tôi có được biết đơn vị máu của mình đi đâu không?</span>
                                    <span className="material-symbols-outlined text-2xl group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="mt-6 text-slate-500 font-light leading-relaxed pt-6 border-t border-slate-50 text-[14px] sm:text-[15px]">
                                    Có, hệ thống của chúng tôi cung cấp tính năng "Hành trình đơn vị máu". Bạn sẽ nhận được thông báo khi đơn vị máu của mình đã vượt qua các bài kiểm tra sàng lọc và khi nó được vận chuyển đến một bệnh viện cụ thể để cứu người.
                                </div>
                            </details>
                            <details className="group border border-slate-100 rounded-[32px] p-6 sm:p-8 hover:border-primary/30 transition-all duration-300">
                                <summary className="list-none flex justify-between items-center cursor-pointer">
                                    <span className="text-lg sm:text-xl font-bold text-slate-900 group-open:text-primary transition-colors">Hiến máu có ảnh hưởng đến sức khỏe lâu dài không?</span>
                                    <span className="material-symbols-outlined text-2xl group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="mt-6 text-slate-500 font-light leading-relaxed pt-6 border-t border-slate-50 text-[14px] sm:text-[15px]">
                                    Ngược lại, hiến máu định kỳ còn mang lại nhiều lợi ích: giúp tái tạo lượng máu mới trong cơ thể, giảm nguy cơ mắc các bệnh về tim mạch và đột quỵ, đồng thời là cơ hội để bạn được kiểm tra sức khỏe tổng quát miễn phí.
                                </div>
                            </details>
                            <details className="group border border-slate-100 rounded-[32px] p-6 sm:p-8 hover:border-primary/30 transition-all duration-300">
                                <summary className="list-none flex justify-between items-center cursor-pointer">
                                    <span className="text-lg sm:text-xl font-bold text-slate-900 group-open:text-primary transition-colors">Nếu tôi đang uống thuốc thì có hiến máu được không?</span>
                                    <span className="material-symbols-outlined text-2xl group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="mt-6 text-slate-500 font-light leading-relaxed pt-6 border-t border-slate-50 text-[14px] sm:text-[15px]">
                                    Tùy thuộc vào loại thuốc bạn đang sử dụng. Thông thường, nếu là các loại thuốc kháng sinh, bạn cần đợi ít nhất 7-14 ngày sau khi ngừng thuốc. Tốt nhất, hãy khai báo chi tiết trong đơn đăng ký để bác sĩ của chúng tôi tư vấn chính xác.
                                </div>
                            </details>
                            <details className="group border border-slate-100 rounded-[32px] p-6 sm:p-8 hover:border-primary/30 transition-all duration-300">
                                <summary className="list-none flex justify-between items-center cursor-pointer">
                                    <span className="text-lg sm:text-xl font-bold text-slate-900 group-open:text-primary transition-colors">Làm thế nào để nhận Giấy chứng nhận điện tử?</span>
                                    <span className="material-symbols-outlined text-2xl group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="mt-6 text-slate-500 font-light leading-relaxed pt-6 border-t border-slate-50 text-[14px] sm:text-[15px]">
                                    Ngay sau khi đơn vị máu của bạn được xác nhận hợp lệ (thường sau 24-48h), giấy chứng nhận điện tử sẽ tự động xuất hiện trong phần "Hồ sơ của tôi" trên ứng dụng và website. Bạn có thể tải về hoặc in ra bất cứ lúc nào.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-16 md:py-24 bg-slate-50/50">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 text-center space-y-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Đối tác chiến lược</p>
                    <div className="flex flex-wrap justify-center gap-8 md:justify-between items-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000 px-4 md:px-10">
                        <div className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter">DA NANG HOSPITAL</div>
                        <div className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter">RED CROSS VN</div>
                        <div className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter">MINISTRY OF HEALTH</div>
                        <div className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter">TECH PARTNER X</div>
                        <div className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter">NGO GLOBAL</div>
                    </div>
                </div>
            </section>
        </main>
    );
}
