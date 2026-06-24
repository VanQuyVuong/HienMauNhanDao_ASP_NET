import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState(""); // Thêm ô này
  const [ketQua, setKetQua] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Đổi API sang /register
      const response = await fetch("https://localhost:7004/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          MatKhau: matKhau,
          XacNhanMatKhau: xacNhanMatKhau, // Gửi thêm trường này cho C#
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setKetQua("✅ ĐĂNG KÝ THÀNH CÔNG: " + JSON.stringify(data, null, 2));
      } else {
        setKetQua("❌ C# TỪ CHỐI: " + JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setKetQua("⚠️ LỖI MẠNG: " + error.message);
    }
  };

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h2>Test Đăng Ký: React tạo tài khoản C#</h2>

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Mật khẩu: </label>
          <input
            type="password"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Xác nhận MK: </label>
          <input
            type="password"
            value={xacNhanMatKhau}
            onChange={(e) => setXacNhanMatKhau(e.target.value)}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "green",
            color: "white",
          }}
        >
          Tạo tài khoản
        </button>
      </form>

      <div
        style={{
          marginTop: "30px",
          backgroundColor: "#f9f9f9",
          padding: "15px",
          border: "1px solid #ccc",
        }}
      >
        <p>
          <strong>Kết quả từ C# trả về:</strong>
        </p>
        <pre style={{ color: "blue" }}>{ketQua}</pre>
      </div>
    </div>
  );
}

export default App;
