import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/AdminKhoMau.css";

export default function AdminKhoMau() {
  const [danhSachKho, setDanhSachKho] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKhoMau = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("https://localhost:7004/api/khomau", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success) {
          setDanhSachKho(data.data);
        }
      } catch (error) {
        console.error("Lá»—i táº£i kho mÃ¡u:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKhoMau();
  }, []);

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Äang táº£i dá»¯ liá»‡u kho mÃ¡u...
      </div>
    );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="khomau-container">
        <h2 className="khomau-title">ðŸ¥ Há»‡ Thá»‘ng GiÃ¡m SÃ¡t Kho MÃ¡u</h2>

        <div className="khomau-grid">
          {danhSachKho.map((kho, index) => (
            // BÃ­ thuáº­t á»Ÿ Ä‘Ã¢y: Náº¿u tÃ¬nh tráº¡ng lÃ  CanKiet, nhÃ©t thÃªm class "alert" vÃ o tháº»
            <div
              key={index}
              className={`kho-card ${kho.tinhTrang === "CanKiet" ? "alert" : ""}`}
            >
              <div className="kho-icon">ðŸ©¸</div>
              <div className="kho-name">
                {kho.tenKho} (NhÃ³m {kho.nhomMauString})
              </div>

              <div className="kho-volume">
                Tá»“n kho: <strong>{kho.soLuongTon}</strong> ml
              </div>

              <div style={{ fontSize: "13px", color: "#8d99ae" }}>
                NgÆ°á»¡ng an toÃ n: {kho.nguongAnToan} ml
              </div>

              {/* Hiá»‡n dÃ²ng chá»¯ cáº£nh bÃ¡o náº¿u bá»‹ gÃ¡n cá» */}
              {kho.tinhTrang === "CanKiet" && (
                <div className="alert-text">âš ï¸ Cáº¢NH BÃO Cáº N KIá»†T</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

