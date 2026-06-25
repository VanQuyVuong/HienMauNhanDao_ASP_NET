import React, { useState } from "react";
import "../css/Login.css";

export default function Login() {
  //Khai báo các biến để lưu dữ liệu
  const [email, setEmail] = useState("");
  const [matkhau, setMatKhau] = useState("");
  const [ketQuaLoi, setKetQuaLoi] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setKetQuaLoi("");

    try {
      //Goi Api C#
      const response = await fetch("https://localhost:7004/api/Users/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, matkhau }),
      });
      const data = await response.json();

      if (response.ok) {
        alert("Đăng nhập thành công");
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

          <button typye="submit" classname="btn-login">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
