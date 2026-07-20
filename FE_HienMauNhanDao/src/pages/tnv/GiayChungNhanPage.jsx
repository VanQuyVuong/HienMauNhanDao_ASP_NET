import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../css/GiayChungNhan.css";

export default function GiayChungNhanPage() {
  const { maDon } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `https://localhost:7004/api/dondangky/${maDon}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const json = await response.json();
        if (json.success) {
          setData(json.data);
        } else {
          alert("âŒ KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin Ä‘Æ¡n Ä‘Äƒng kÃ½!");
        }
      } catch (error) {
        console.error("Lá»—i láº¥y thÃ´ng tin chá»©ng nháº­n:", error);
      } finally {
        setLoading(false);
      }
    };
    if (maDon) fetchData();
  }, [maDon]);

  if (loading)
    return <div className="loading-screen">Äang táº£i dá»¯ liá»‡u chá»©ng nháº­n...</div>;
  if (!data)
    return (
      <div className="error-screen">KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u chá»©ng nháº­n!</div>
    );

  const tnv = data.tinhNguyenVien;
  const chienDich = data.chienDich;
  const chungNhan = data.chungNhan;

  return (
    <div className="cert-page-container">
      {/* Khung chá»©ng nháº­n chÃ­nh */}
      <div className="cert-frame">
        <div className="cert-logo-section">
          <div className="cert-logos">
            <span className="logo-symbol red">ðŸ¥</span>
            <span className="logo-symbol blue">ðŸŒ</span>
            <span className="logo-symbol green">ðŸ›¡ï¸</span>
          </div>
        </div>

        <div className="cert-drop-wrapper">
          <div className="cert-drop">ðŸ©¸</div>
        </div>

        <div className="cert-content">
          <h2 className="cert-title">GIáº¤Y CHá»¨NG NHáº¬N HIáº¾N MÃU TÃŒNH NGUYá»†N</h2>
          <h1 className="cert-campaign-title">
            "{chienDich?.tenChienDich || "CHIáº¾N Dá»ŠCH HIáº¾N MÃU"}"
          </h1>

          <div className="cert-details-block">
            <div className="cert-detail-row">
              <span className="detail-label">NgÆ°á»i hiáº¿n mÃ¡u:</span>
              <span className="detail-val highlight-name">
                {tnv?.hoVaTen || "N/A"}
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Sá»‘ CCCD:</span>
              <span className="detail-val">{tnv?.cccd || "N/A"}</span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">NgÃ y sinh:</span>
              <span className="detail-val">
                {tnv?.ngaySinh
                  ? new Date(tnv.ngaySinh).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Thá»ƒ tÃ­ch mÃ¡u hiáº¿n:</span>
              <span className="detail-val font-bold text-red">
                {data.theTich || "350"} ml (NhÃ³m mÃ¡u:{" "}
                {tnv?.nhomMau
                  ?.replace("_positive", "+")
                  .replace("_negative", "-") || "ChÆ°a xÃ¡c Ä‘á»‹nh"}
                )
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Äá»‹a Ä‘iá»ƒm hiáº¿n:</span>
              <span className="detail-val">
                {chienDich?.diaDiem?.tenDiaDiem || "CÆ¡ sá»Ÿ y táº¿"}
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">MÃ£ chá»©ng nháº­n:</span>
              <span className="detail-val font-mono font-bold text-red">
                {chungNhan?.maChungNhan || "Äang chá» phÃ¡t hÃ nh..."}
              </span>
            </div>
          </div>

          <div className="cert-slogan">
            "Má»™t giá»t mÃ¡u cho Ä‘i - Má»™t cuá»™c Ä‘á»i á»Ÿ láº¡i"
          </div>

          <div className="cert-footer">
            <p className="cert-contact-info">
              Má»i chi tiáº¿t xin liÃªn há»‡:{" "}
              {chienDich?.diaDiem?.tenDiaDiem || "CÆ¡ sá»Ÿ y táº¿ ÄÃ  Náºµng"}
            </p>
          </div>
        </div>
      </div>

      {/* HÃ ng nÃºt báº¥m (áº¨n Ä‘i khi in báº±ng CSS print) */}
      <div className="cert-actions-row no-print">
        <button
          onClick={() => window.print()}
          className="btn-cert btn-cert-print"
        >
          ðŸ–¨ï¸ IN GIáº¤Y CHá»¨NG NHáº¬N
        </button>
        <button onClick={() => navigate(-1)} className="btn-cert btn-cert-back">
          QUAY Láº I
        </button>
      </div>
    </div>
  );
}

