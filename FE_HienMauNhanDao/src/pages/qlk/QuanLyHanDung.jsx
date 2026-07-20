import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/QuanLyHanDung.css";

const QuanLyHanDung = () => {
  const [viewMode, setViewMode] = useState("all"); // all, expired, near, safe
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    expiredCount: 0,
    nearExpiryCount: 0,
    safeCount: 0,
    hasCritical: false,
  });
  const [bloodUnits, setBloodUnits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // HÃ m gá»i API láº¥y dá»¯ liá»‡u tá»« Backend C#
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1. Gá»i API láº¥y sá»‘ liá»‡u thá»‘ng kÃª
      const statsRes = await fetch(
        "https://localhost:7004/api/tuimau/thong-ke-han-dung",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const statsJson = await statsRes.json();

      // 2. Gá»i API láº¥y danh sÃ¡ch tÃºi mÃ¡u chi tiáº¿t
      const listRes = await fetch(
        `https://localhost:7004/api/tuimau/danh-sach-han-dung?viewMode=${viewMode}&search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const listJson = await listRes.json();

      if (statsJson) {
        setStats({
          expiredCount: statsJson.soLuongHetHan ?? 0,
          nearExpiryCount: statsJson.soLuongSapHetHan ?? 0,
          safeCount: statsJson.soLuongAnToan ?? 0,
          hasCritical: statsJson.coCanhBaoNguyCap ?? false,
        });
      } else {
        setStats({
          expiredCount: 0,
          nearExpiryCount: 0,
          safeCount: 0,
          hasCritical: false,
        });
      }

      setBloodUnits(Array.isArray(listJson) ? listJson : []);
    } catch (error) {
      console.error("Lá»—i khi láº¥y dá»¯ liá»‡u háº¡n dÃ¹ng:", error);
      setStats({
        expiredCount: 0,
        nearExpiryCount: 0,
        safeCount: 0,
        hasCritical: false,
      });
      setBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset vá» trang 1 khi lá»c
    fetchData();
  }, [viewMode, searchQuery]);

  // TÃ­nh toÃ¡n phÃ¢n trang
  const totalPages = Math.ceil(bloodUnits.length / pageSize);
  const paginatedUnits = bloodUnits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Chá»©c nÄƒng Xuáº¥t bÃ¡o cÃ¡o ra Ä‘á»‹nh dáº¡ng CSV (Má»Ÿ Ä‘Æ°á»£c báº±ng Excel, khÃ´ng lá»—i font Tiáº¿ng Viá»‡t nhá» UTF-8 BOM)
  const handleExportReport = () => {
    const headers = [
      "STT",
      "MÃ£ tÃºi mÃ¡u",
      "MÃ£ chiáº¿n dá»‹ch",
      "NhÃ³m mÃ¡u",
      "Thá»ƒ tÃ­ch",
      "NgÃ y láº¥y máº«u",
      "NgÃ y háº¿t háº¡n",
      "Tráº¡ng thÃ¡i",
      "Sá»‘ ngÃ y cÃ²n láº¡i",
    ];

    const rows = bloodUnits.map((u, i) => {
      const statusText =
        u.trangThaiHan === "SAFE"
          ? "An toÃ n"
          : u.trangThaiHan === "NEAR_EXPIRY"
            ? "Sáº¯p háº¿t háº¡n"
            : u.trangThaiHan === "WARNING_EXPIRED"
              ? "TiÃªu há»§y gáº¥p"
              : u.trangThaiHan === "ARCHIVED_EXPIRED"
                ? "LÆ°u trá»¯"
                : "QuÃ¡ háº¡n";

      return [
        i + 1,
        u.maTuiMau,
        u.maChienDich,
        u.nhomMau,
        `${u.theTich}ml`,
        new Date(u.thoiGianLayMau).toLocaleDateString("vi-VN"),
        new Date(u.ngayHetHan).toLocaleDateString("vi-VN"),
        statusText,
        u.soNgayConLai < 0
          ? `QuÃ¡ háº¡n ${Math.abs(u.soNgayConLai)} ngÃ y`
          : `${u.soNgayConLai} ngÃ y`,
      ];
    });

    // KÃ½ tá»± BOM "\uFEFF" á»Ÿ Ä‘áº§u file giÃºp Excel hiá»ƒu Ä‘Ã¢y lÃ  file mÃ£ hÃ³a UTF-8 tiáº¿ng Viá»‡t cÃ³ dáº¥u
    let csvContent = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((val) => `"${val}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `BaoCao_HanDung_${viewMode}_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chá»©c nÄƒng tiÃªu há»§y hÃ ng loáº¡t tÃºi mÃ¡u quÃ¡ háº¡n
  const handleDeleteExpired = async () => {
    if (
      window.confirm(
        `Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n TIÃŠU Há»¦Y táº¥t cáº£ ${stats.expiredCount} tÃºi mÃ¡u Ä‘Ã£ háº¿t háº¡n khÃ´ng?`,
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://localhost:7004/api/tuimau/tieu-huy-hang-loat",
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          alert("ÄÃ£ tiÃªu há»§y thÃ nh cÃ´ng!");
          fetchData();
        } else {
          alert("Lá»—i khi tiÃªu há»§y!");
        }
      } catch (error) {
        alert("Lá»—i káº¿t ná»‘i!");
      }
    }
  };

  // Chá»©c nÄƒng tiÃªu há»§y 1 tÃºi mÃ¡u cá»¥ thá»ƒ
  const handleDeleteSingle = async (id) => {
    if (window.confirm(`Báº¡n cÃ³ cháº¯c muá»‘n tiÃªu há»§y tÃºi mÃ¡u ${id}?`)) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://localhost:7004/api/tuimau/tieu-huy-don-le/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          alert("ÄÃ£ tiÃªu há»§y tÃºi mÃ¡u thÃ nh cÃ´ng!");
          fetchData();
        } else {
          alert("Lá»—i khi tiÃªu há»§y!");
        }
      } catch (error) {
        alert("Lá»—i káº¿t ná»‘i!");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="hd-container">
        {/* Header trang */}
        <div className="hd-header">
          <h1 className="hd-title">â³ Quáº£n lÃ½ Háº¡n dÃ¹ng & TiÃªu há»§y tÃºi mÃ¡u</h1>
          <p className="hd-subtitle">
            Theo dÃµi vÃ²ng Ä‘á»i vÃ  quáº£n lÃ½ loáº¡i bá» cÃ¡c Ä‘Æ¡n vá»‹ tÃºi mÃ¡u quÃ¡ háº¡n sá»­
            dá»¥ng.
          </p>
        </div>

        {/* 3 Card thá»‘ng kÃª chá»‰ sá»‘ */}
        <div className="hd-stats-grid">
          <div
            onClick={() => setViewMode("expired")}
            className={`hd-stat-card border-red ${stats.hasCritical ? "animate-alert" : ""}`}
          >
            <div className="hd-stat-icon-wrap red">ðŸš¨</div>
            <div>
              <p className="hd-stat-label">ÄÃ£ háº¿t háº¡n</p>
              <h3 className="hd-stat-val text-red">{stats.expiredCount} tÃºi</h3>
              {stats.hasCritical && (
                <p className="hd-alert-text">BÃO Äá»˜NG: Cáº¦N TIÃŠU Há»¦Y Gáº¤P!</p>
              )}
            </div>
          </div>

          <div
            onClick={() => setViewMode("near")}
            className="hd-stat-card border-orange"
          >
            <div className="hd-stat-icon-wrap orange">âš ï¸</div>
            <div>
              <p className="hd-stat-label">Sáº¯p háº¿t háº¡n (&lt; 30 ngÃ y)</p>
              <h3 className="hd-stat-val text-orange">
                {stats.nearExpiryCount} tÃºi
              </h3>
            </div>
          </div>

          <div
            onClick={() => setViewMode("safe")}
            className="hd-stat-card border-green"
          >
            <div className="hd-stat-icon-wrap green">âœ…</div>
            <div>
              <p className="hd-stat-label">An toÃ n</p>
              <h3 className="hd-stat-val text-green">{stats.safeCount} tÃºi</h3>
            </div>
          </div>
        </div>

        {/* Thanh Ä‘iá»u khiá»ƒn lá»c & tÃ¬m kiáº¿m */}
        <div className="hd-control-row">
          <div className="hd-tabs">
            {["all", "safe", "near", "expired"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`hd-tab-btn ${viewMode === mode ? "active" : ""}`}
              >
                {mode === "all"
                  ? "Tá»•ng quan"
                  : mode === "safe"
                    ? "An toÃ n"
                    : mode === "near"
                      ? "Sáº¯p háº¿t háº¡n"
                      : "ÄÃ£ háº¿t háº¡n"}
              </button>
            ))}
          </div>

          <div className="hd-actions">
            <button onClick={handleExportReport} className="btn-export">
              ðŸ“¥ Xuáº¥t BÃ¡o CÃ¡o CSV
            </button>
            {viewMode === "expired" && stats.expiredCount > 0 && (
              <button onClick={handleDeleteExpired} className="btn-delete-all">
                ðŸ—‘ï¸ TiÃªu há»§y táº¥t cáº£ quÃ¡ háº¡n
              </button>
            )}
          </div>
        </div>

        {/* Báº£ng hiá»ƒn thá»‹ dá»¯ liá»‡u */}
        <div className="hd-table-card">
          <div className="hd-table-header">
            <h3 className="hd-table-title">
              {viewMode === "all" && "Danh sÃ¡ch táº¥t cáº£ tÃºi mÃ¡u lÆ°u kho"}
              {viewMode === "expired" && "Danh sÃ¡ch tÃºi mÃ¡u ÄÃƒ Háº¾T Háº N"}
              {viewMode === "near" && "Danh sÃ¡ch tÃºi mÃ¡u Sáº®P Háº¾T Háº N"}
              {viewMode === "safe" && "Danh sÃ¡ch tÃºi mÃ¡u AN TOÃ€N"}
            </h3>
            <input
              type="text"
              placeholder="ðŸ” Nháº­p mÃ£ tÃºi mÃ¡u..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hd-search-input"
            />
          </div>

          <div className="hd-table-responsive">
            <table className="hd-table">
              <thead>
                <tr>
                  <th>MÃ£ tÃºi mÃ¡u</th>
                  <th>Chiáº¿n dá»‹ch</th>
                  <th>NhÃ³m mÃ¡u</th>
                  <th>Thá»ƒ tÃ­ch</th>
                  <th>NgÃ y láº¥y máº«u</th>
                  <th>Háº¡n sá»­ dá»¥ng</th>
                  <th>Tráº¡ng thÃ¡i háº¡n</th>
                  <th style={{ textAlign: "right" }}>Thao tÃ¡c</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="td-empty">
                      Äang táº£i dá»¯ liá»‡u kho mÃ¡u...
                    </td>
                  </tr>
                ) : bloodUnits.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="td-empty">
                      ChÆ°a cÃ³ dá»¯ liá»‡u tÃºi mÃ¡u nÃ o.
                    </td>
                  </tr>
                ) : (
                  paginatedUnits.map((unit) => (
                    <tr
                      key={unit.maTuiMau}
                      className={`row-expiry-${unit.trangThaiHan}`}
                    >
                      <td className="font-mono">
                        <strong>{unit.maTuiMau}</strong>
                      </td>
                      <td>{unit.maChienDich}</td>
                      <td>
                        <span className="badge-blood">{unit.nhomMau}</span>
                      </td>
                      <td>{unit.theTich} ml</td>
                      <td>
                        {new Date(unit.thoiGianLayMau).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>
                      <td>
                        {new Date(unit.ngayHetHan).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        {unit.trangThaiHan === "ARCHIVED_EXPIRED" && (
                          <span className="tag-status gray">LÆ°u trá»¯</span>
                        )}
                        {unit.trangThaiHan === "WARNING_EXPIRED" && (
                          <span className="tag-status red animate-pulse">
                            Há»§y Gáº¥p!
                          </span>
                        )}
                        {unit.trangThaiHan === "EXPIRED" && (
                          <span className="tag-status red">QuÃ¡ háº¡n</span>
                        )}
                        {unit.trangThaiHan === "NEAR_EXPIRY" && (
                          <span className="tag-status orange">
                            CÃ²n {unit.soNgayConLai} ngÃ y
                          </span>
                        )}
                        {unit.trangThaiHan === "SAFE" && (
                          <span className="tag-status green">An toÃ n</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteSingle(unit.maTuiMau)}
                          className="btn-delete-single"
                          title="TiÃªu há»§y"
                        >
                          ðŸ—‘ï¸
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PhÃ¢n trang */}
          {!loading && bloodUnits.length > 0 && (
            <div className="hd-pagination">
              <span>
                Hiá»ƒn thá»‹ {paginatedUnits.length} / {bloodUnits.length} tÃºi
              </span>
              <div className="hd-page-buttons">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  TrÆ°á»›c
                </button>
                <span className="hd-page-num">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuanLyHanDung;

