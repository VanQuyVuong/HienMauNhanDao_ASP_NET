import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/XacNhanDangKy.css";

export default function XacNhanDangKy() {
  const navigate = useNavigate();
  const { maDon } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`https://localhost:7004/api/dondangky/${maDon}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const resJson = await response.json();
          setData(resJson.data);
        } else {
          alert("âŒ KhÃ´ng thá»ƒ láº¥y thÃ´ng tin chi tiáº¿t Ä‘Æ¡n Ä‘Äƒng kÃ½!");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Lá»—i fetch chi tiáº¿t Ä‘Æ¡n:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (maDon) {
      fetchData();
    } else {
      navigate("/dashboard");
    }
  }, [maDon, navigate]);

  const handleCancel = async () => {
    if (!window.confirm("Báº¡n cÃ³ thá»±c sá»± muá»‘n há»§y Ä‘Æ¡n Ä‘Äƒng kÃ½ hiáº¿n mÃ¡u nÃ y khÃ´ng?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://localhost:7004/api/dondangky/${data.maDon}/huy`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("âœ… ÄÃ£ há»§y Ä‘Æ¡n Ä‘Äƒng kÃ½ thÃ nh cÃ´ng.");
        setData((prev) => ({ ...prev, trangThai: 4 })); // 4 tÆ°Æ¡ng á»©ng vá»›i TrangThaiDonDangKy.DaHuy trong Enum má»›i
      } else {
        const resJson = await response.json();
        alert("âŒ Há»§y Ä‘Æ¡n tháº¥t báº¡i: " + (resJson.message || "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh"));
      }
    } catch (error) {
      console.error("Lá»—i há»§y Ä‘Æ¡n:", error);
      alert("âŒ ÄÃ£ xáº£y ra lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Äang táº£i chi tiáº¿t phiáº¿u Ä‘Äƒng kÃ½...</div>
      </div>
    );
  }

  if (!data) return null;

  const tnv = data.tinhNguyenVien;
  const chienDich = data.chienDich;
  // TrangThaiDonDangKy: ChoDuyet = 0, DaDuyet = 1, DaTuChoi = 2, DaHoanThanh = 3, DaHuy = 4
  const isCancelled = data.trangThai === 4 || data.trangThai === "DaHuy";
  const isPendingOrApproved = data.trangThai === 0 || data.trangThai === 1 || data.trangThai === "ChoDuyet" || data.trangThai === "DaDuyet";

  return (
    <div className="xn-page-wrapper">
      <Navbar />

      <main className="xn-main-container">
        <div className="xn-card">
          {/* Header tráº¡ng thÃ¡i */}
          <div className={`xn-header ${isCancelled ? "cancelled" : "success"}`}>
            <div className="xn-header-icon-circle">
              {isCancelled ? "âŒ" : "âœ“"}
            </div>
            <h3 className="xn-header-title">
              {isCancelled ? "ÄÆ N ÄÃƒ Há»¦Y" : "ÄÆ N ÄÄ‚NG KÃ"}
            </h3>
            <p className="xn-header-subtitle">Chi tiáº¿t phiáº¿u Ä‘Äƒng kÃ½ hiáº¿n mÃ¡u</p>
          </div>

          <div className="xn-body">
            {/* MÃ£ Ä‘Äƒng kÃ½ */}
            <div className="xn-code-section">
              <p className="xn-code-label">MÃ£ Ä‘Äƒng kÃ½ cá»§a báº¡n</p>
              <p className={`xn-code-value ${isCancelled ? "line-through" : ""}`}>
                {data.maDon}
              </p>
            </div>

            {/* Há»™p cáº£nh bÃ¡o tips */}
            {!isCancelled && (
              <div className="xn-tip-box print-hidden">
                <span className="xn-tip-icon">ðŸ’¡</span>
                <p className="xn-tip-text">
                  Vui lÃ²ng chá»¥p mÃ n hÃ¬nh hoáº·c in phiáº¿u nÃ y mang tá»›i quáº§y tiáº¿p Ä‘Ã³n táº¡i Ä‘iá»ƒm hiáº¿n mÃ¡u Ä‘á»ƒ lÃ m thá»§ tá»¥c nhanh nháº¥t.
                </p>
              </div>
            )}

            {/* ThÃ´ng tin chi tiáº¿t */}
            <div className="xn-info-card">
              <h4 className="xn-info-title">
                ðŸ“‹ ThÃ´ng Tin Phiáº¿u ÄÄƒng KÃ½
              </h4>

              <div className="xn-grid">
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Há» vÃ  tÃªn</span>
                  <span className="xn-grid-value font-bold">{tnv?.hoTen || "N/A"}</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Sá»‘ CCCD</span>
                  <span className="xn-grid-value">{tnv?.cccd || "N/A"}</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">NgÃ y sinh</span>
                  <span className="xn-grid-value">
                    {tnv?.ngaySinh ? new Date(tnv.ngaySinh).toLocaleDateString("vi-VN") : "N/A"}
                  </span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Giá»›i tÃ­nh</span>
                  <span className="xn-grid-value">{tnv?.gioiTinh || "Nam"}</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Sá»‘ Ä‘iá»‡n thoáº¡i</span>
                  <span className="xn-grid-value">{tnv?.soDienThoai || "N/A"}</span>
                </div>
                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Äá»‹a chá»‰ cÆ° trÃº</span>
                  <span className="xn-grid-value">{tnv?.diaChi || "ChÆ°a cáº­p nháº­t"}</span>
                </div>

                <div className="xn-divider"></div>

                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Chiáº¿n dá»‹ch hiáº¿n mÃ¡u</span>
                  <span className="xn-grid-value font-bold text-red">
                    {chienDich?.tenChienDich || "N/A"}
                  </span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Dung tÃ­ch hiáº¿n dá»± kiáº¿n</span>
                  <span className="xn-grid-value badge-volume">{data.theTich || 250} ml</span>
                </div>
                <div className="xn-grid-item">
                  <span className="xn-grid-label">Thá»i gian báº¯t Ä‘áº§u</span>
                  <span className="xn-grid-value">
                    {chienDich?.thoiGianBD ? new Date(chienDich.thoiGianBD).toLocaleString("vi-VN") : "N/A"}
                  </span>
                </div>
                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Äá»‹a Ä‘iá»ƒm hiáº¿n mÃ¡u</span>
                  <span className="xn-grid-value">
                    {chienDich?.diaDiem ? chienDich.diaDiem.tenDiaDiem : "ChÆ°a cáº­p nháº­t"}
                  </span>
                </div>
                <div className="xn-grid-item xn-grid-full">
                  <span className="xn-grid-label">Äá»‹a chá»‰ chi tiáº¿t</span>
                  <span className="xn-grid-value">
                    {chienDich?.diaDiem ? chienDich.diaDiem.diaChiChiTiet : "ChÆ°a cáº­p nháº­t"}
                  </span>
                </div>
              </div>
            </div>

            {/* CÃ¡c nÃºt báº¥m thao tÃ¡c */}
            <div className="xn-btn-group print-hidden">
              {!isCancelled && (
                <button onClick={() => window.print()} className="xn-btn btn-print">
                  ðŸ–¨ In Phiáº¿u
                </button>
              )}

              {isPendingOrApproved && (
                <button onClick={handleCancel} className="xn-btn btn-cancel">
                  ðŸ›‘ Há»§y ÄÆ¡n
                </button>
              )}

              <button onClick={() => navigate("/dashboard")} className="xn-btn btn-home">
                ðŸ  Vá» Trang Chá»§
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

