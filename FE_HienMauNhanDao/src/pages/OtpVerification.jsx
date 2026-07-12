import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/OtpVerification.css";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [thongBao, setThongBao] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận thông tin formData từ trang Register chuyển sang qua route state
  const formData = location.state?.formData;

  // Nếu không có thông tin đăng ký (truy cập lậu), quay lại trang đăng ký ngay
  if (!formData) {
    setTimeout(() => {
      navigate("/register");
    }, 0);
    return null;
  }

  // Hàm xử lý gửi lại mã OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setThongBao({ type: "", text: "" });
    try {
      const response = await fetch("https://localhost:7004/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setThongBao({
          type: "success",
          text: "Mã OTP mới đã được gửi lại vào email của bạn!",
        });
      } else {
        setThongBao({
          type: "error",
          text: data.message || "Gửi lại OTP thất bại.",
        });
      }
    } catch (error) {
      setThongBao({ type: "error", text: "Không thể kết nối đến máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  // Hàm xác thực OTP và hoàn tất đăng ký tài khoản
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setThongBao({ type: "error", text: "Vui lòng nhập mã OTP!" });
      return;
    }

    setLoading(true);
    setThongBao({ type: "", text: "" });

    try {
      // 1. Gọi API xác thực OTP
      // Chú ý: DTO VerifyOtpRequest ở Backend C# viết nhầm trường 'Email' thành 'Emai'
      // Nên ở đây chúng ta truyền key là 'Emai' để khớp chính xác với C# Backend.
      const verifyResponse = await fetch("https://localhost:7004/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Emai: formData.email, 
          Otp: otp,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setThongBao({
          type: "error",
          text: verifyData.message || "Mã OTP không hợp lệ hoặc đã hết hạn!",
        });
        setLoading(false);
        return;
      }

      // 2. Nếu OTP hợp lệ, tiến hành gọi API Register để tạo tài khoản
      const registerResponse = await fetch("https://localhost:7004/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: formData.email,
          MatKhau: formData.matKhau,
          XacNhanMatKhau: formData.matKhau,
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        setThongBao({
          type: "success",
          text: "Xác thực thành công và đã tạo tài khoản! Đang chuyển về trang Đăng nhập...",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setThongBao({
          type: "error",
          text: registerData.message || "Đăng ký tài khoản thất bại.",
        });
      }
    } catch (error) {
      setThongBao({ type: "error", text: "Đã xảy ra lỗi kết nối đến máy chủ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-header-h2">Xác Thực OTP</h2>
          <p className="login-header-p">Mã xác thực đã được gửi đến email:</p>
          <strong style={{ color: "#e63946", fontSize: "14px" }}>{formData.email}</strong>
        </div>

        {thongBao.text && (
          <div className={thongBao.type === "error" ? "error-message" : "success-message"}>
            {thongBao.text}
          </div>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div className="input-group">
            <label style={{ textAlign: "center", display: "block" }}>Nhập mã OTP (6 chữ số)</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              placeholder="------"
            />
          </div>

          <button type="submit" className="btn_login" disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác Thực & Hoàn Tất"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <span style={{ fontSize: "13px", color: "#666" }}>Không nhận được mã?</span>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "#e63946",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "5px",
              textDecoration: "underline",
            }}
          >
            Gửi lại OTP
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link
            to="/register"
            style={{
              fontSize: "13px",
              color: "#666",
              textDecoration: "none",
            }}
          >
            Quay lại chỉnh sửa email
          </Link>
        </div>
      </div>
    </div>
  );
}
