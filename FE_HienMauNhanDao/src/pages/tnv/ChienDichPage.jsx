import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "../../css/Dashboard.css"; // Gá»i file lÃ m Ä‘áº¹p vá»«a táº¡o
import { useNavigate } from "react-router-dom";

export default function ChienDichPage() {
  const navigate = useNavigate();

  // HÃ m chuyá»ƒn trang chi tiáº¿t chiáº¿n dá»‹ch
  const chuyenSangChiTiet = (maChienDich) => {
    navigate(`/campaign-detail/${maChienDich}`);
  };

  // 1. Táº¡o "cÃ¡i rá»•" (máº£ng) Ä‘á»ƒ Ä‘á»±ng danh sÃ¡ch chiáº¿n dá»‹ch láº¥y tá»« C#
  const [danhSachChienDich, setDanhSachChienDich] = useState([]);

  // 2. HÃ m cháº¡y tá»± Ä‘á»™ng ngay khi vá»«a má»Ÿ trang web lÃªn
  useEffect(() => {
    const fetchChienDich = async () => {
      try {
        // Láº¥y xe Ä‘áº©y cháº¡y qua C# cá»•ng 7004 láº¥y hÃ ng
        const response = await fetch("https://localhost:7004/api/chiendich");

        if (response.ok) {
          const data = await response.json();
          // C# tráº£ vá» thÃ nh cÃ´ng -> Äá»• máº£ng dá»¯ liá»‡u vÃ o "rá»•" cá»§a React
          setDanhSachChienDich(data.data);
        }
      } catch (error) {
        console.error("Lá»—i láº¥y dá»¯ liá»‡u tá»« C#:", error);
      }
    };

    fetchChienDich(); // Gá»i cÃ¡i hÃ m vá»«a viáº¿t
  }, []); // Ngoáº·c vuÃ´ng rá»—ng [] nghÄ©a lÃ : "Chá»‰ cháº¡y 1 láº§n duy nháº¥t lÃºc má»Ÿ web thÃ´i nhÃ©"

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      {/* 3. Láº¯p thanh Menu */}
      <Navbar />

      <div className="dashboard-container">
        <h2 className="section-title">Chiáº¿n Dá»‹ch Hiáº¿n MÃ¡u Ná»•i Báº­t</h2>

        {/* 4. DÃ¹ng lá»‡nh IF rÃºt gá»n: 
            Náº¿u rá»• trá»‘ng khÃ´ng (length == 0) thÃ¬ in ra thÃ´ng bÃ¡o trá»‘ng.
            Náº¿u cÃ³ dá»¯ liá»‡u thÃ¬ hiá»‡n nÃ³ ra */}
        {danhSachChienDich.length === 0 ? (
          <div className="empty-state">
            Tháº­t trá»‘ng tráº£i... Hiá»‡n táº¡i Database cá»§a báº¡n chÆ°a cÃ³ chiáº¿n dá»‹ch hiáº¿n
            mÃ¡u nÃ o!
          </div>
        ) : (
          <div className="campaign-grid">
            {/* Lá»‡nh 'map': NÃ³ láº·p qua tá»«ng pháº§n tá»­ trong C# vÃ  váº½ ra 1 cÃ¡i tháº» */}
            {danhSachChienDich.map((chienDich, index) => (
              <div className="campaign-card" key={index} onClick={() => chuyenSangChiTiet(chienDich.maChienDich)}>
                <span className="badge-active">Äang diá»…n ra</span>
                <h3 className="campaign-title">{chienDich.tenChienDich}</h3>

                <p className="campaign-info">
                  <strong>Dá»± kiáº¿n:</strong> {chienDich.soLuongDuKien} ngÆ°á»i
                </p>
                <p className="campaign-info">
                  {/* HÃ m Ä‘á»•i Ä‘á»‹nh dáº¡ng ngÃ y giá» cá»§a C# thÃ nh ngÃ y giá» Viá»‡t Nam */}
                  <strong>Báº¯t Ä‘áº§u:</strong>{" "}
                  {new Date(chienDich.thoiGianBD).toLocaleDateString("vi-VN")}
                </p>
                <p className="campaign-info">
                  <strong>Tráº¡ng thÃ¡i:</strong> {chienDich.trangThai}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

