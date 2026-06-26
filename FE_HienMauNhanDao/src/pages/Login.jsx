import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate vào đây
import "../css/Login.css";

export default function Login() {
  //Khai báo các biến để lưu dữ liệu
  const [email, setEmail] = useState("");
  const [matkhau, setMatKhau] = useState("");
  const [ketQuaLoi, setKetQuaLoi] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setKetQuaLoi("");

    try {
      //Goi Api C#
      const response = await fetch("https://localhost:7004/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email, MatKhau: matkhau }),
      });
      const data = await response.json();

      if (response.ok) {
        // 1. Lấy dữ liệu từ C# và cất vào kho của trình duyệt (localStorage)
        localStorage.setItem("token", data.data.access_token);
        localStorage.setItem("email", data.data.email);
        localStorage.setItem("role", data.data.maVaiTro);

        // 2. Tự động chuyển hướng sang trang chủ
        navigate("/dashboard");
      } else {
        setKetQuaLoi(data.message || "Đăng nhập thất bại"); //Lấy đúng mesage lỗi từ API
      }
    } catch (error) {
      setKetQuaLoi("Đăng nhập thất bại. Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="login-ccontainer">
      <div className="login-card">
        <div className="login-header">
          <h2>Hiến máu nhân đạo</h2>
          <p>Đăng nhập để tiếp tục hành trình chia sẻ yêu thương</p>
        </div>
        {/*Khung chỉ hiện khi báo lỗi */}
        {ketQuaLoi && <div className="error-message">{ketQuaLoi}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email của bạn</label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="********"
              value={matkhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Đăng nhập
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span style={{ fontSize: "13px", color: "#666" }}>
            Chưa có tài khoản?{" "}
          </span>
          {/* Nhớ kéo lên đầu file thêm: import { Link } from 'react-router-dom'; */}
          <Link
            to="/register"
            style={{
              fontSize: "13px",
              color: "#e63946",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
