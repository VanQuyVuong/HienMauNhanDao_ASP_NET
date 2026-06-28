import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/CampaignDetail.css";

export default function CampaignDetail() {
  const { id } = useParams(); // Lấy cái ID từ trên đường link URL xuống
  const navigate = useNavigate();
  const [chienDich, setChienDich] = useState(null);

  useEffect(() => {
    // Gọi cái API GetById mà bạn vừa viết bên C# lúc nãy
    const fetchChiTiet = async () => {
      try {
        const response = await fetch(
          `https://localhost:7004/api/chiendich/${id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setChienDich(data.data);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchChiTiet();
  }, [id]);

  // Nếu dữ liệu chưa tải kịp thì hiện chữ Load
  if (!chienDich)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Đang tải dữ liệu...
      </div>
    );
  //Hàm xử lýkhi người dùng bấm nút đăng ký
  const handleDangKy = async () => {
    //Hỏi xác nhận
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn đăng ký hiến máu cho chiến dịch này ?",
      )
    ) {
      return;
    }

        try {
      // 1. Lấy thẻ Token đang cất trong kho của trình duyệt ra
      const token = localStorage.getItem("token");

      const response = await fetch("https://localhost:7004/api/dondangky", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 2. Kẹp thẻ vào phong bì gửi đi!
        },
        body: JSON.stringify({
          maChienDich: chienDich.maChienDich
        })
      });

      const data = await response.json();
      
      if (response.ok) { // Kiểm tra response.ok thay vì data.success cho chắc ăn
        alert("🎉 Chúc mừng! " + data.message);
      } else {
        alert("❌ Lỗi: " + (data.message || "Bạn chưa đăng nhập hoặc thẻ đã hết hạn!"));
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Có lỗi xảy ra khi kết nối đến máy chủ.");
    }


  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />

      <div className="detail-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ⬅ Quay lại
        </button>

        <div className="detail-card">
          <div
            className="detail-image"
            style={{ backgroundImage: `url(${chienDich.imageUrl})` }}
          ></div>

          <div className="detail-content">
            <span className="badge-active">
              {chienDich.trangThai === "DangDienRa"
                ? "Đang diễn ra"
                : chienDich.trangThai}
            </span>
            <h1 className="detail-title">{chienDich.tenChienDich}</h1>

            <div className="detail-info-group">
              {/* Chỗ này nhờ ma thuật JOIN của EF Core mà ta lấy được tên Bệnh viện luôn! */}
              <p>
                <strong>🏥 Địa điểm:</strong>{" "}
                {chienDich.diaDiem
                  ? chienDich.diaDiem.tenDiaDiem
                  : "Chưa cập nhật"}
              </p>
              <p>
                <strong>📍 Địa chỉ:</strong>{" "}
                {chienDich.diaDiem
                  ? chienDich.diaDiem.diaChiChiTiet
                  : "Chưa cập nhật"}
              </p>
              <p>
                <strong>📅 Bắt đầu:</strong>{" "}
                {new Date(chienDich.thoiGianBD).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>⏳ Kết thúc:</strong>{" "}
                {new Date(chienDich.thoiGianKT).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>🎯 Mục tiêu:</strong> {chienDich.soLuongDuKien} đơn vị
                máu
              </p>
            </div>

            <button className="btn-donate" onClick={handleDangKy}>
              Đăng ký hiến máu ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
