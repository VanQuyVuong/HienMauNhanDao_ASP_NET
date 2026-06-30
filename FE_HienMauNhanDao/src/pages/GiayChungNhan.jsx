import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/GiayChungNhan.css";

export default function GiayChungNhan() {
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
          alert("❌ Không tìm thấy thông tin đơn đăng ký!");
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin chứng nhận:", error);
      } finally {
        setLoading(false);
      }
    };
    if (maDon) fetchData();
  }, [maDon]);

  if (loading)
    return <div className="loading-screen">Đang tải dữ liệu chứng nhận...</div>;
  if (!data)
    return (
      <div className="error-screen">Không tìm thấy dữ liệu chứng nhận!</div>
    );

  const tnv = data.tinhNguyenVien;
  const chienDich = data.chienDich;
  const chungNhan = data.chungNhan;

  return (
    <div className="cert-page-container">
      {/* Khung chứng nhận chính */}
      <div className="cert-frame">
        <div className="cert-logo-section">
          <div className="cert-logos">
            <span className="logo-symbol red">🏥</span>
            <span className="logo-symbol blue">🌐</span>
            <span className="logo-symbol green">🛡️</span>
          </div>
        </div>

        <div className="cert-drop-wrapper">
          <div className="cert-drop">🩸</div>
        </div>

        <div className="cert-content">
          <h2 className="cert-title">GIẤY CHỨNG NHẬN HIẾN MÁU TÌNH NGUYỆN</h2>
          <h1 className="cert-campaign-title">
            "{chienDich?.tenChienDich || "CHIẾN DỊCH HIẾN MÁU"}"
          </h1>

          <div className="cert-details-block">
            <div className="cert-detail-row">
              <span className="detail-label">Người hiến máu:</span>
              <span className="detail-val highlight-name">
                {tnv?.hoVaTen || "N/A"}
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Số CCCD:</span>
              <span className="detail-val">{tnv?.cccd || "N/A"}</span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Ngày sinh:</span>
              <span className="detail-val">
                {/* LỖI CỐ TÌNH: Gọi hàm .format() không tồn tại trên đối tượng Date trong Vanilla JS */}
                {tnv?.ngaySinh
                  ? new Date(tnv.ngaySinh).format("dd/MM/yyyy")
                  : "N/A"}
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Thể tích máu hiến:</span>
              <span className="detail-val font-bold text-red">
                {data.theTich || "350"} ml (Nhóm máu:{" "}
                {tnv?.nhomMau
                  ?.replace("_positive", "+")
                  .replace("_negative", "-") || "Chưa xác định"}
                )
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Địa điểm hiến:</span>
              <span className="detail-val">
                {chienDich?.diaDiem?.tenDiaDiem || "Cơ sở y tế"}
              </span>
            </div>
            <div className="cert-detail-row">
              <span className="detail-label">Mã chứng nhận:</span>
              <span className="detail-val font-mono font-bold text-red">
                {chungNhan?.maChungNhan || "Đang chờ phát hành..."}
              </span>
            </div>
          </div>

          <div className="cert-slogan">
            "Một giọt máu cho đi - Một cuộc đời ở lại"
          </div>

          <div className="cert-footer">
            <p className="cert-contact-info">
              Mọi chi tiết xin liên hệ:{" "}
              {chienDich?.diaDiem?.tenDiaDiem || "Cơ sở y tế Đà Nẵng"}
            </p>
          </div>
        </div>
      </div>

      {/* Hàng nút bấm (Ẩn đi khi in bằng CSS print) */}
      <div className="cert-actions-row no-print">
        <button
          onClick={() => window.print()}
          className="btn-cert btn-cert-print"
        >
          🖨️ IN GIẤY CHỨNG NHẬN
        </button>
        <button onClick={() => navigate(-1)} className="btn-cert btn-cert-back">
          QUAY LẠI
        </button>
      </div>
    </div>
  );
}
