import React, { useState } from "react";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterVolunteer() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [thongBao, setThongBao] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setThongBao({ type: "", text: "" });

    // kiem tra 2 o mat khau co giong nhau hay khong
    if (matKhau !== xacNhanMatKhau) {
      setThongBao({
        type: "error",
        text: "Mật khẩu và xác nhận mật khẩu không khớp",
      });
      return; // dung lai, khong goi api nua
    }
    try {
      // Goi API gui OTP thay vi goi truc tiep API dang ky
      const response = await fetch(
        "https://localhost:7004/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Email: email,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setThongBao({
          type: "success",
          text: "Mã OTP đã được gửi về email của bạn! Đang chuyển hướng...",
        });

        // Chuyen huong sang trang OTP kem theo thong tin dang ky trong route state
        setTimeout(() => {
          navigate("/otp", { state: { formData: { email, matKhau } } });
        }, 1500);
      } else {
        setThongBao({
          type: "error",
          text: data.message || "Không thể gửi OTP. Vui lòng kiểm tra lại email.",
        });
      }
    } catch (error) {
      setThongBao({ type: "error", text: "Không thể kết nối đến máy chủ." });
    }
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <he>Tao tai khoan</he>
          <p>Tham gia vao cong dong hien mau ngay hom nay </p>
        </div>
        {thongBao.text && (
          <div className={thongBao.type === 'error' ? 'error-message' : 'success-message'}>
            {thongBao.text}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Email đăng nhập</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* CHÍNH LÀ ĐOẠN NÀY BỊ BẠN XÓA MẤT NÈ 👇 */}
          <div className="input-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
            />
          </div>
          {/* ======================================= */}

          <div className="input-group">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Xác Nhận Đăng Ký
          </button>
        </form>

        {/*nut quay lai trang dang nhap */}
        <div style={{ textAlign: "centre", marginTop: "38px" }}>
          <span style={{ fontSize: "13px", color: "#666" }}>
            Da co tai khoan?
          </span>
          <Link
            to="/login"
            style={{
              fontSize: "13px",
              color: "#e63946",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            {" "}
            Dang nhap tai day
          </Link>
        </div>
      </div>
    </div>
  );
}
