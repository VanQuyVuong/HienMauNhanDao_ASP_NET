import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../css/Dashboard.css"; // Gọi file làm đẹp vừa tạo
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  // Hàm chuyển trang chi tiết chiến dịch
  const chuyenSangChiTiet = (maChienDich) => {
    navigate(`/campaign-detail/${maChienDich}`);
  };

  // 1. Tạo "cái rổ" (mảng) để đựng danh sách chiến dịch lấy từ C#
  const [danhSachChienDich, setDanhSachChienDich] = useState([]);

  // 2. Hàm chạy tự động ngay khi vừa mở trang web lên
  useEffect(() => {
    const fetchChienDich = async () => {
      try {
        // Lấy xe đẩy chạy qua C# cổng 7004 lấy hàng
        const response = await fetch("https://localhost:7004/api/chiendich");

        if (response.ok) {
          const data = await response.json();
          // C# trả về thành công -> Đổ mảng dữ liệu vào "rổ" của React
          setDanhSachChienDich(data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu từ C#:", error);
      }
    };

    fetchChienDich(); // Gọi cái hàm vừa viết
  }, []); // Ngoặc vuông rỗng [] nghĩa là: "Chỉ chạy 1 lần duy nhất lúc mở web thôi nhé"

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      {/* 3. Lắp thanh Menu */}
      <Navbar />

      <div className="dashboard-container">
        <h2 className="section-title">Chiến Dịch Hiến Máu Nổi Bật</h2>

        {/* 4. Dùng lệnh IF rút gọn: 
            Nếu rổ trống không (length == 0) thì in ra thông báo trống.
            Nếu có dữ liệu thì hiện nó ra */}
        {danhSachChienDich.length === 0 ? (
          <div className="empty-state">
            Thật trống trải... Hiện tại Database của bạn chưa có chiến dịch hiến
            máu nào!
          </div>
        ) : (
          <div className="campaign-grid">
            {/* Lệnh 'map': Nó lặp qua từng phần tử trong C# và vẽ ra 1 cái thẻ */}
            {danhSachChienDich.map((chienDich, index) => (
              <div className="campaign-card" key={index} onClick={() => chuyenSangChiTiet(chienDich.maChienDich)}>
                <span className="badge-active">Đang diễn ra</span>
                <h3 className="campaign-title">{chienDich.tenChienDich}</h3>

                <p className="campaign-info">
                  <strong>Dự kiến:</strong> {chienDich.soLuongDuKien} người
                </p>
                <p className="campaign-info">
                  {/* Hàm đổi định dạng ngày giờ của C# thành ngày giờ Việt Nam */}
                  <strong>Bắt đầu:</strong>{" "}
                  {new Date(chienDich.thoiGianBD).toLocaleDateString("vi-VN")}
                </p>
                <p className="campaign-info">
                  <strong>Trạng thái:</strong> {chienDich.trangThai}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
