import React, { useState } from "react";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom ";

export default function Register() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [thongBao, setThongBao] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setThongBao({ type: "", text: "" });

    //kiem tra 2 o mat khau co giong nhau hay khong
    if (matKhau !== xacNhanMatKhau) {
      setThongBao({
        type: "error",
        text: "Mật khẩu và xác nhận mật khẩu không khớp",
      });
      return; //dung lai, khong goi api nua
    }
    try {
      //goij sang PI/Register
      const response = await fetch(
        "https://localhost:7004/api/Users/Register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Emal: email,
            MatKhau: matKhau,
            XacNhanMatKhau: xacNhanMatKhau,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setThongBao({
          type: "success",
          text: "Đăng ký thành công! Vui lòng đăng nhập.",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setThongBao({
          type: "error",
          text: data.message || "Loi tao tai khoan",
        });
      }
    } catch (error) {
      setThongBao({ type: "error", text: "Khong the ket noi den may chu." });
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
          <div className="{thongBao.type === 'error' ?'error-message':'success-message'}">
            {thongBao.text}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Email dang nhap</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
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
            Xac nhan dang ky
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
