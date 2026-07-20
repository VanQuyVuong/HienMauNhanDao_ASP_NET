import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tongNguoiDung: 0,
    tongTuiMau: 0,
    tongTheTichMau: 0,
    theoNhomMau: [],
    theoThang: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://localhost:7004/api/thongke/tong-quan",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();
        if (data.success) {
          setStats({
            tongNguoiDung: data.data.tongNguoiDung,
            tongTuiMau: data.data.tongTuiMau,
            tongTheTichMau: data.data.tongTheTichMau,
            theoNhomMau: data.data.theoNhomMau || [],
            theoThang: data.data.theoThang || [],
          });
        }
      } catch (error) {
        console.error("Lá»—i táº£i thá»‘ng kÃª:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="loading-screen">Äang táº£i dá»¯ liá»‡u bÃ¡o cÃ¡o...</div>;

  // 1. TÃ­nh toÃ¡n cho BIá»‚U Äá»’ Cá»˜T SVG (LÆ°á»£ng mÃ¡u thu hoáº¡ch theo thÃ¡ng)
  const chartWidth = 550;
  const chartHeight = 220;
  const padding = 40;

  // TÃ¬m thÃ¡ng cÃ³ thá»ƒ tÃ­ch mÃ¡u thu hoáº¡ch lá»›n nháº¥t Ä‘á»ƒ lÃ m má»‘c tá»· lá»‡ chiá»u cao (100% height)
  const maxVolume =
    stats.theoThang.length > 0
      ? Math.max(...stats.theoThang.map((t) => t.tongTheTich))
      : 1000;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="db-container">
        <h1 className="db-main-title">ðŸ“Š BÃ¡o CÃ¡o & PhÃ¢n TÃ­ch Há»‡ Thá»‘ng</h1>

        {/* 1. CÃ¡c tháº» sá»‘ liá»‡u tá»•ng quan (Stat Cards) */}
        <div className="db-stats-row">
          <div className="db-card-stat">
            <span className="db-card-icon">ðŸ‘¥</span>
            <div>
              <h3>Tá»•ng TÃ¬nh Nguyá»‡n ViÃªn</h3>
              <p className="db-number-bold">
                {stats.tongNguoiDung.toLocaleString()} ngÆ°á»i
              </p>
            </div>
          </div>

          <div className="db-card-stat">
            <span className="db-card-icon red">ðŸ©¸</span>
            <div>
              <h3>Tá»•ng TÃºi MÃ¡u Tá»“n Kho</h3>
              <p className="db-number-bold text-red">
                {stats.tongTuiMau.toLocaleString()} tÃºi
              </p>
            </div>
          </div>

          <div className="db-card-stat">
            <span className="db-card-icon blue">ðŸ¥</span>
            <div>
              <h3>Thá»ƒ TÃ­ch MÃ¡u Äang LÆ°u</h3>
              <p className="db-number-bold text-blue">
                {stats.tongTheTichMau.toLocaleString()} ml
              </p>
            </div>
          </div>
        </div>

        {/* 2. Pháº§n Biá»ƒu Ä‘á»“ phÃ¢n tÃ­ch */}
        <div className="db-charts-grid">
          {/* Biá»ƒu Ä‘á»“ cá»™t SVG: Thu hoáº¡ch theo thÃ¡ng */}
          <div className="db-chart-card">
            <h3 className="db-chart-title">
              ðŸ“ˆ Thá»ƒ tÃ­ch thu nháº­n theo thÃ¡ng (ml)
            </h3>
            {stats.theoThang.length === 0 ? (
              <div className="no-data-text">
                ChÆ°a cÃ³ dá»¯ liá»‡u hiáº¿n mÃ¡u 6 thÃ¡ng qua
              </div>
            ) : (
              <div className="svg-wrapper">
                <svg
                  width="100%"
                  height={chartHeight + padding}
                  viewBox={`0 0 ${chartWidth} ${chartHeight + padding}`}
                >
                  {/* ÄÆ°á»ng káº» ngang lÃ m má»‘c lÆ°á»›i ná»n (Grid lines) */}
                  <line
                    x1={padding}
                    y1={chartHeight / 2}
                    x2={chartWidth - 20}
                    y2={chartHeight / 2}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <line
                    x1={padding}
                    y1={chartHeight}
                    x2={chartWidth - 20}
                    y2={chartHeight}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />

                  {/* VÃ²ng láº·p váº½ cÃ¡c cá»™t dá»¯ liá»‡u */}
                  {stats.theoThang.map((t, index) => {
                    // Khoáº£ng cÃ¡ch x cá»§a má»—i cá»™t
                    const barWidth = 35;
                    const spacing =
                      (chartWidth - padding - 40) / stats.theoThang.length;
                    const x =
                      padding + index * spacing + (spacing - barWidth) / 2;

                    // TÃ­nh chiá»u cao cá»™t dá»±a trÃªn tá»· lá»‡ thá»ƒ tÃ­ch thÃ¡ng Ä‘Ã³ vá»›i thÃ¡ng lá»›n nháº¥t
                    const percentHeight = t.tongTheTich / maxVolume;
                    const barHeight = percentHeight * (chartHeight - 30);
                    const y = chartHeight - barHeight;

                    return (
                      <g key={index} className="svg-bar-group">
                        {/* Tooltip áº©n hiá»‡n sá»‘ liá»‡u khi rÃª chuá»™t vÃ o cá»™t */}
                        <title>{`ThÃ¡ng ${t.thang}/${t.nam}: ${t.tongTheTich.toLocaleString()} ml`}</title>

                        {/* Cá»™t chá»¯ nháº­t Ä‘áº¡i diá»‡n dá»¯ liá»‡u */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="4"
                          fill="url(#barGradient)"
                          className="svg-bar-rect"
                        />

                        {/* Sá»‘ hiá»ƒn thá»‹ thá»ƒ tÃ­ch trÃªn Ä‘áº§u cá»™t */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          textAnchor="middle"
                          className="svg-bar-val"
                        >
                          {t.tongTheTich}
                        </text>

                        {/* Chá»¯ hiá»ƒn thá»‹ tÃªn ThÃ¡ng dÆ°á»›i chÃ¢n cá»™t */}
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight + 20}
                          textAnchor="middle"
                          className="svg-bar-label"
                        >
                          T{t.thang}
                        </text>
                      </g>
                    );
                  })}

                  {/* Äá»‹nh nghÄ©a Gradient chuyá»ƒn mÃ u cho cá»™t cá»™t váº½ Ä‘áº¹p máº¯t */}
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Biá»ƒu Ä‘á»“ thanh tiáº¿n trÃ¬nh so sÃ¡nh tá»“n kho theo nhÃ³m mÃ¡u */}
          <div className="db-chart-card">
            <h3 className="db-chart-title">
              ðŸ§ª Tráº¡ng thÃ¡i trá»¯ lÆ°á»£ng theo nhÃ³m mÃ¡u (TÃºi)
            </h3>
            <div className="db-blood-group-list">
              {stats.theoNhomMau.length === 0 ? (
                <div className="no-data-text">
                  KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u trong kho
                </div>
              ) : (
                stats.theoNhomMau.map((item, idx) => {
                  // Giáº£ láº­p ngÆ°á»¡ng an toÃ n cá»§a bá»‡nh viá»‡n lÃ  20 tÃºi cho má»—i nhÃ³m mÃ¡u
                  const nguongAnToan = 20;
                  const percent = Math.min(
                    (item.soLuongTon / nguongAnToan) * 100,
                    100,
                  );

                  // Äá»•i tÃªn nhÃ£n hiá»ƒn thá»‹ cho Ä‘áº¹p
                  const formatNhomMau = item.nhomMau
                    .replace("_positive", " (+)")
                    .replace("_negative", " (-)");

                  return (
                    <div key={idx} className="blood-progress-item">
                      <div className="blood-progress-info">
                        <span className="blood-name-badge">
                          {formatNhomMau}
                        </span>
                        <span className="blood-qty-text">
                          <strong>{item.soLuongTon}</strong> / {nguongAnToan}{" "}
                          tÃºi (NgÆ°á»¡ng an toÃ n)
                        </span>
                      </div>

                      {/* Thanh tiáº¿n trÃ¬nh biá»ƒu thá»‹ lÆ°á»£ng mÃ¡u hiá»‡n táº¡i */}
                      <div className="blood-progress-bar-bg">
                        <div
                          className={`blood-progress-bar-fill ${percent < 30 ? "danger" : percent < 70 ? "warning" : "success"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

