import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [ketQua, setKetQua] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn trang web bị tải lại khi bấm nút

    try {
      // GỌI API SANG C#
      // LƯU Ý: Chữ https://localhost:7142 bên dưới bạn phải ĐỔI thành cái link lúc bạn chạy dự án C# nhé!
      const response = await fetch("https://localhost:7004/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          MatKhau: matKhau,
        }),
      });

      const data = await response.json();

      // In kết quả C# trả về ra màn hình
      if (response.ok) {
        setKetQua("✅ THÀNH CÔNG: " + JSON.stringify(data, null, 2));
      } else {
        setKetQua("❌ C# BÁO LỖI: " + JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setKetQua("⚠️ KHÔNG KẾT NỐI ĐƯỢC BACKEND: " + error.message);
    }
  };

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h2>Test Đăng Nhập: React nói chuyện với C# .NET</h2>

      <form onSubmit={handleLogin}>
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
        <button
          type="submit"
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Gửi xuống .NET
        </button>
      </form>

      {/* Khung hiển thị kết quả */}
      <div
        style={{
          marginTop: "30px",
          backgroundColor: "#f9f9f9",
          padding: "15px",
          border: "1px solid #ccc",
        }}
      >
        <p>
          <strong>Kết quả từ .NET trả về:</strong>
        </p>
        <pre style={{ color: "blue" }}>{ketQua}</pre>
      </div>
    </div>
  );
}

export default App;
