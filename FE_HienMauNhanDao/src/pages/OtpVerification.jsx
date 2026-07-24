import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AUTH_URL } from '../constants/api';

export default function OtpVerification() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const formData = location.state?.formData;

    if (!formData) {
        navigate('/register');
        return null;
    }

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');
        try {
            await axios.post(`${AUTH_URL}/send-otp`, { Email: formData.email });
            setError('Mã OTP đã được gửi lại thành công!');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(typeof err.response.data === 'string' ? err.response.data : 'Lỗi kết nối. Vui lòng thử lại.');
            } else {
                setError('Lỗi kết nối server. Vui lòng kiểm tra backend.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            setError('Vui lòng nhập mã OTP!');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Verify OTP
            await axios.post(`${AUTH_URL}/verify-otp`, { Email: formData.email, Otp: otp });

            // Register user
            const registerPayload = {
                Email: formData.email,
                MatKhau: formData.matKhau,
                XacNhanMatKhau: formData.matKhau
            };
            await axios.post(`${AUTH_URL}/register`, registerPayload);


            // Redirect to login
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError('Mã OTP không hợp lệ hoặc đã hết hạn!');
            } else if (err.response && err.response.data) {
                setError(typeof err.response.data === 'string' ? err.response.data : 'Xác thực thất bại!');
            } else {
                setError('Lỗi kết nối. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-[#fdf8f9] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <style>
                {`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                @keyframes float-delayed {
                    0% { transform: translateY(0px) rotate(0deg) scale(1); }
                    50% { transform: translateY(-20px) rotate(-3deg) scale(1.05); }
                    100% { transform: translateY(0px) rotate(0deg) scale(1); }
                }
                .animate-float-delayed {
                    animation: float-delayed 5s ease-in-out infinite;
                    animation-delay: 1s;
                }
                `}
            </style>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b894]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e62e43]/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
            
            <div className="w-full max-w-[1000px] bento-card bg-white shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row relative z-10 p-0 overflow-hidden border border-white">
                
                {/* Left Side - Banner */}
                <div className="w-full md:w-[45%] bg-gradient-to-br from-[#00b894] to-[#00a884] p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 p-8 opacity-[0.03] pointer-events-none">
                        <span className="material-symbols-outlined text-[200px]">mark_email_read</span>
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-10 border border-white/30 shadow-xl animate-float-delayed relative">
                            <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">security</span>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#e62e43] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <span className="material-symbols-outlined text-white text-[12px]">check</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4 tracking-tight drop-shadow-sm">Bảo Mật<br/>Tuyệt Đối</h1>
                        <p className="text-white/90 font-medium text-sm leading-relaxed mb-8 drop-shadow-sm">Nhập mã xác thực gồm 6 chữ số vừa được gửi đến email của bạn để hoàn tất quá trình đăng ký.</p>
                    </div>

                    <div className="relative z-10 p-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg animate-float">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-2xl">lock_person</span>
                            </div>
                            <div>
                                <p className="text-xs text-white/80 font-bold uppercase tracking-wider mb-1">Mã hóa đầu cuối</p>
                                <p className="text-sm font-black text-white">An toàn dữ liệu 100%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
                            <span className="material-symbols-outlined text-emerald-500 text-3xl">mark_email_unread</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Xác Thực Email</h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Chúng tôi đã gửi mã OTP đến <br/>
                            <strong className="text-slate-800">{formData.email}</strong>
                        </p>
                    </div>
                    
                    {error && (
                        <div className={`mb-8 p-4 border rounded-xl flex items-center gap-3 animate-pulse ${error.includes('thành công') ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <span className={`material-symbols-outlined ${error.includes('thành công') ? 'text-emerald-500' : 'text-red-500'}`}>
                                {error.includes('thành công') ? 'check_circle' : 'error'}
                            </span>
                            <p className={`text-sm font-bold ${error.includes('thành công') ? 'text-emerald-700' : 'text-red-700'}`}>{error}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleVerifyOtp} className="space-y-8" autoComplete="off">
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nhập mã xác thực OTP <span className="text-[#00b894]">*</span></label>
                            <input 
                                name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required 
                                autoComplete="off"
                                className="w-full max-w-xs mx-auto h-16 px-4 block bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-3xl tracking-[0.5em] font-black text-slate-800 focus:outline-none focus:border-[#00b894] focus:ring-4 focus:ring-[#00b894]/20 transition-all" 
                                placeholder="------" type="text" maxLength={6} 
                            />
                        </div>
                        
                        <button 
                            disabled={loading} 
                            className="w-full h-14 bg-[#00b894] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#00a884] transition-all shadow-[0_8px_20px_rgba(0,184,148,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider" 
                            type="submit"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ĐANG XÁC THỰC...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">verified_user</span>
                                    XÁC NHẬN VÀ HOÀN TẤT
                                </>
                            )}
                        </button>
                        
                        <div className="text-center pt-8 border-t border-slate-100 space-y-4">
                            <p className="text-sm text-slate-500 font-medium">
                                Chưa nhận được mã?
                                <button type="button" onClick={handleSendOtp} disabled={loading} className="text-[#00b894] font-black hover:underline underline-offset-4 ml-2 disabled:opacity-50">
                                    GỬI LẠI MÃ
                                </button>
                            </p>
                            <button type="button" onClick={() => navigate('/register')} className="text-slate-400 hover:text-slate-600 text-sm font-medium underline underline-offset-4 flex items-center justify-center gap-1 mx-auto transition-colors">
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                Quay lại chỉnh sửa email
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
