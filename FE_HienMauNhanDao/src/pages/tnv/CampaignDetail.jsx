import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/CampaignDetail.css";

export default function CampaignDetail() {
  const { id } = useParams(); // Láº¥y cÃ¡i ID tá»« trÃªn Ä‘Æ°á»ng link URL xuá»‘ng
  const navigate = useNavigate();
  const [chienDich, setChienDich] = useState(null);

  useEffect(() => {
    // Gá»i cÃ¡i API GetById mÃ  báº¡n vá»«a viáº¿t bÃªn C# lÃºc nÃ£y
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
        console.error("Lá»—i:", error);
      }
    };
    fetchChiTiet();
  }, [id]);

  // Náº¿u dá»¯ liá»‡u chÆ°a táº£i ká»‹p thÃ¬ hiá»‡n chá»¯ Load
  if (!chienDich)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Ä ang táº£i dá»¯ liá»‡u...
      </div>
    );
  // Hàm xử lý khi người dùng bấm nút đăng ký
  const handleDangKy = () => {
    // Hỏi xác nhận
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn đăng ký hiến máu cho chiến dịch này?"
      )
    ) {
      return;
    }

    // 1. Lưu thông tin chiến dịch vào localStorage để trang sau lấy ra dùng
    localStorage.setItem("selectedCampaign", JSON.stringify(chienDich));

    // 2. Chuyển hướng sang trang điền thông tin cá nhân & thể tích hiến máu
    navigate("/khai-bao-thong-tin-ca-nhan");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />

      <div className="detail-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          â¬… Quay láº¡i
        </button>

        <div className="detail-card">
          <div
            className="detail-image"
            style={{ backgroundImage: `url(${chienDich.imageUrl})` }}
          ></div>

          <div className="detail-content">
            <span className="badge-active">
              {chienDich.trangThai === "DangDienRa"
                ? "Äang diá»…n ra"
                : chienDich.trangThai}
            </span>
            <h1 className="detail-title">{chienDich.tenChienDich}</h1>

            <div className="detail-info-group">
              {/* Chá»— nÃ y nhá» ma thuáº­t JOIN cá»§a EF Core mÃ  ta láº¥y Ä‘Æ°á»£c tÃªn Bá»‡nh viá»‡n luÃ´n! */}
              <p>
                <strong>ðŸ¥ Äá»‹a Ä‘iá»ƒm:</strong>{" "}
                {chienDich.diaDiem
                  ? chienDich.diaDiem.tenDiaDiem
                  : "ChÆ°a cáº­p nháº­t"}
              </p>
              <p>
                <strong>ðŸ“ Äá»‹a chá»‰:</strong>{" "}
                {chienDich.diaDiem
                  ? chienDich.diaDiem.diaChiChiTiet
                  : "ChÆ°a cáº­p nháº­t"}
              </p>
              <p>
                <strong>ðŸ“… Báº¯t Ä‘áº§u:</strong>{" "}
                {new Date(chienDich.thoiGianBD).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>â³ Káº¿t thÃºc:</strong>{" "}
                {new Date(chienDich.thoiGianKT).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>ðŸŽ¯ Má»¥c tiÃªu:</strong> {chienDich.soLuongDuKien} Ä‘Æ¡n vá»‹
                mÃ¡u
              </p>
            </div>

            <button className="btn-donate" onClick={handleDangKy}>
              ÄÄƒng kÃ½ hiáº¿n mÃ¡u ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

