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
        <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-[#F3F4F6] min-h-[calc(100vh-100px)]">
            <div className="w-full max-w-[1024px] bg-white border border-slate-200 rounded-2xl overflow-hidden flex shadow-sm">
                <div className="w-[420px] relative hidden md:flex items-end p-12 shrink-0">
                    <div className="absolute inset-0 z-0">
                        <img alt="Blood Donation" className="w-full h-full object-cover opacity-30 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDueaJAaTz0RjLbygBiVaKlLkFa-k5bSzh3hFB8rOEZTroPIavRCetrAXDv-_TSrjqBNwOmHaIjyqdkEZ8AjEpfikCmXmBCK0KXBQhlLR8Ol5Zw9MUnv74Jylcc41QYB6mFMcjnx4m6d8a3WnxZcdCPkxFWhxCi_4Cfxrq8U-m9ENBUTgvwqsNv_hmwBkTnL-4O8qAmZQTOYVe93SOUpTKuXqPXaQSnhULQandiA53FjSrpsyB6dqv2wxg1y4H-eCXtdDfi39hCAVvd" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
                    </div>
                    <div className="relative z-10 text-white w-full">
                        <h1 className="text-3xl font-bold leading-tight mb-4">Hệ thống Quản lý Hiến máu Nhân đạo TP. Đà Nẵng</h1>
                        <p className="text-primary-fixed-dim text-sm leading-relaxed mb-8">Hành trình của mỗi giọt máu bắt đầu từ sự tự nguyện của bạn. Tham gia cộng đồng tình nguyện viên để cứu sống hàng ngàn người bệnh.</p>
                        <div className="flex gap-4 items-center">
                            <div className="flex -space-x-3">
                                <img alt="Avatar 1" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhekJIdPkF-QyoAl_qtcuNI3ofx8UcU-Wjx1kkojZVLuvHxNUBvL829pAsO3Z6dPOYCiY978fmgTJf81AlorlhA8ZB07UItddOy27nZFOQ78oUyq4NFdlDB-uMIf1ByiWkdXDfYCDi0D8iGLYR0N6IOJdHIavoBQjtyLGARMiL9eGObl1DnpwtWUbjNPQzG7dduIpCG19AA29I0KWGwy3UMquRndqqHs758gJbl-YBSVPrU8gmUFqkOu753j4JUxMWSqjqc5M4Um6q" />
                                <img alt="Avatar 2" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYs2c1u9I4LLYj0PwXno--xuejWcbyhwRjVoAI0flhk7hVjh5RmY0WQAOIDvQH6ulkxY6OUI7xQunKQtve9939ii_AeoNMX3l3xu4pCfRZa94VU5_gk3pdF_4MtjLYVI4m4GgmQTW84FxIJz6TZ7nl1jfaXqmxC71ZEhVqhxFEA5yBgyorwzGWgUVf9KlzVWE_mFGnol9gheykM7vEQ-4Z27spZIKt23b2RydbokGE4BXPgipv6MX9Pjs_u2X_x9wiBMlfw05TwO14" />
                                <img alt="Avatar 3" className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACTIM9Xq4ZtI3pQefWqFM51fQYkjfY7WvbMCEzN-Cn1OEsMx3MD3DGpf27RW15Fl9hoHntk2N4MmZvM6ycrZvPRfu4mKNP8eViDJMuFeA_UHcLFu94VVrviNXzL2KC0DzrfNWHiQUpPexH8MhwdmUPDmeUvA1nIFiwhPV9WPDmTIyA1x0PlU6rkzeD_kNkafaH-OMzK-RhWQgg5erWKBJZfD0c6ajRtm7MtwD1jvAsVxahIzLxNo1EiSH0Z7wZDn5Mkk9N9Qm7K-Yu" />
                            </div>
                            <span className="text-xs font-medium">+5,000 tình nguyện viên</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-on-surface mb-2 tracking-tight">Xác thực Email</h2>
                        <p className="text-slate-500 text-sm">Vui lòng nhập mã OTP được gửi đến {formData.email}</p>
                    </div>
                    {error && <div className={`mb-4 text-sm font-bold ${error.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{error}</div>}
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-on-surface-variant">Mã xác thực OTP</label>
                            <input name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center text-xl tracking-[0.5em] font-bold transition-all" placeholder="------" type="text" maxLength={6} />
                        </div>
                        <button disabled={loading} className="w-full h-12 bg-primary-container text-white font-bold rounded-md hover:bg-red-800 transition-all shadow-sm active:opacity-90 flex items-center justify-center gap-2" type="submit">
                            <span className="text-base">{loading ? 'Đang xác thực...' : 'Xác thực & Hoàn tất'}</span>
                            <span className="material-symbols-outlined text-xl">verified</span>
                        </button>
                        <div className="text-center pt-2">
                            <p className="text-sm text-slate-500">
                                Chưa nhận được mã?
                                <button type="button" onClick={handleSendOtp} disabled={loading} className="text-primary font-bold hover:underline underline-offset-4 ml-1">
                                    Gửi lại OTP
                                </button>
                            </p>
                        </div>
                        <div className="text-center pt-2">
                            <button type="button" onClick={() => navigate('/register')} className="text-slate-500 hover:text-slate-700 text-sm font-medium underline underline-offset-4">
                                Quay lại chỉnh sửa thông tin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
