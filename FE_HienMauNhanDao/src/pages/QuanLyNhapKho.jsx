import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/QuanLyNhapKho.css";

export default function QuanLyNhapKho() {
  const [khoList, setKhoList] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingKho, setLoadingKho] = useState(false);

  const [selectedKho, setSelectedKho] = useState(null);
  const [selectedTuiMau, setSelectedTuiMau] = useState(null);

  // Tải danh sách các ngăn kho lưu trữ
  const fetchKhoMau = async () => {
    try {
      setLoadingKho(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/khomau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (resData.success && Array.isArray(resData.data)) {
        setKhoList(resData.data);
        if (resData.data.length > 0 && !selectedKho) {
          setSelectedKho(resData.data[0]); // Chọn ngăn kho đầu tiên mặc định
        }
      }
    } catch (err) {
      console.error("Lỗi tải danh sách kho:", err);
    } finally {
      setLoadingKho(false);
    }
  };

  // Tải danh sách tất cả các túi máu
  const fetchBloodUnits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/tuimau", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBloodUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu túi máu:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    await fetchKhoMau();
    await fetchBloodUnits();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Gọi API C# duyệt nhập kho và sinh phiếu nhập
  const handleChapNhan = async (e, tm) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      let emailNV = localStorage.getItem("email") || "NV00001";

      const payload = {
        maNhanVien: emailNV,
        maTuiMauList: [tm.maTuiMau],
      };

      const res = await fetch(
        "https://localhost:7004/api/phieunhapxuat/import",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        alert(`Đã duyệt nhập kho thành công túi máu ${tm.maTuiMau}`);
        fetchData(); // Tải lại số liệu tồn kho
        setSelectedTuiMau(null);
      } else {
        alert("Lỗi khi nhập kho!");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  // Gọi API C# trả túi máu về phòng xét nghiệm
  const handleTuChoi = async (e, tm) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Bạn có chắc muốn trả túi máu ${tm.maTuiMau} về phòng xét nghiệm không?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://localhost:7004/api/tuimau/${tm.maTuiMau}/status?status=Chờ xét nghiệm`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert(`Đã trả túi máu ${tm.maTuiMau} về để xét nghiệm lại.`);
        fetchBloodUnits();
        setSelectedTuiMau(null);
      } else {
        alert("Lỗi kết nối máy chủ!");
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi trả túi túi máu.");
    }
  };

  // Đếm số lượng túi đang chờ duyệt của ngăn kho đó để hiển thị chấm tròn báo động
  const countYeuCau = (nhomMau) => {
    return bloodUnits.filter(
      (tm) => tm.nhomMau === nhomMau && tm.trangThai === "Yêu cầu nhập kho",
    ).length;
  };

  // Lọc dữ liệu theo ngăn kho đang được Thủ kho chọn
  const yeuCauList = bloodUnits.filter(
    (tm) =>
      tm.nhomMau === selectedKho?.nhomMauString &&
      tm.trangThai === "Yêu cầu nhập kho",
  );
  const daNhapList = bloodUnits.filter(
    (tm) =>
      tm.nhomMau === selectedKho?.nhomMauString && tm.trangThai === "Nhập kho",
  );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="nk-container animate-fadein">
        <div className="nk-header">
          <h1 className="nk-title">📥 Quản lý Nhập kho máu</h1>
          <p className="nk-subtitle">
            Thủ kho phê duyệt các túi máu đạt chuẩn và đưa vào các tủ bảo quản
            lạnh.
          </p>
        </div>

        {/* DANH SÁCH CÁC NGĂN TỦ LƯU TRỮ */}
        <div className="nk-warehouse-section">
          <div className="nk-section-title">
            <span>⚙️ DANH SÁCH CÁC NGĂN LƯU TRỮ TRONG KHO</span>
            <small>Chọn nhóm máu để xem các yêu cầu nhập kho chi tiết</small>
          </div>

          {loadingKho ? (
            <div className="nk-loading-small">
              Đang tải danh sách ngăn kho...
            </div>
          ) : (
            <div className="nk-warehouse-grid">
              {khoList.map((kho) => {
                const isActive = selectedKho?.maKho === kho.maKho;
                const yeuCauCount = countYeuCau(kho.nhomMauString);
                return (
                  <button
                    key={kho.maKho}
                    onClick={() => setSelectedKho(kho)}
                    className={`nk-warehouse-card ${isActive ? "active" : ""}`}
                  >
                    {yeuCauCount > 0 && (
                      <span className="nk-badge-count animate-bounce">
                        {yeuCauCount}
                      </span>
                    )}
                    <div className="nk-card-blood-type">
                      {kho.nhomMauString}
                    </div>
                    <div className="nk-card-name">Ngăn {kho.tenKho}</div>
                    <div className="nk-card-stats">
                      <span>Tồn kho:</span>
                      <strong>{kho.soLuongTon} túi</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedKho && (
          <div className="nk-layout-split">
            {/* Cột Trái: Hàng chờ duyệt nhập kho */}
            <div className="nk-panel-left">
              <div className="nk-panel-header">
                <h3>📥 Yêu cầu nhập (Ngăn nhóm {selectedKho.nhomMauString})</h3>
                <span className="nk-badge-status">
                  Chờ duyệt ({yeuCauList.length})
                </span>
              </div>

              <div className="nk-list-wrapper">
                {loading ? (
                  <div className="nk-loading-small">Đang tải dữ liệu...</div>
                ) : yeuCauList.length === 0 ? (
                  <div className="nk-empty-box">
                    Không có yêu cầu nhập kho nào cho nhóm máu này.
                  </div>
                ) : (
                  yeuCauList.map((tm) => {
                    const isExpanded = selectedTuiMau?.maTuiMau === tm.maTuiMau;
                    return (
                      <div
                        key={tm.maTuiMau}
                        className={`nk-blood-item ${isExpanded ? "expanded" : ""}`}
                        onClick={() =>
                          setSelectedTuiMau(isExpanded ? null : tm)
                        }
                      >
                        <div className="nk-item-top">
                          <div className="nk-item-info">
                            <div className="nk-avatar-blood">{tm.nhomMau}</div>
                            <div>
                              <div className="nk-item-id">{tm.maTuiMau}</div>
                              <div className="nk-item-sub">
                                Người hiến: {tm.tenTinhNguyenVien} •{" "}
                                {tm.theTich}ml
                              </div>
                              <div className="nk-item-time">
                                Thời gian lấy:{" "}
                                {new Date(tm.thoiGianLayMau).toLocaleString(
                                  "vi-VN",
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="nk-arrow-icon">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>

                        {isExpanded && (
                          <div
                            className="nk-item-options"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleTuChoi(e, tm)}
                              className="nk-btn-reject"
                            >
                              ⚠️ Trả về xét nghiệm lại
                            </button>
                            <button
                              onClick={(e) => handleChapNhan(e, tm)}
                              className="nk-btn-accept"
                            >
                              ✅ Phê duyệt nhập kho
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cột Phải: Lịch sử đã nhập kho của nhóm máu này */}
            <div className="nk-panel-right">
              <div className="nk-panel-header blue">
                <h3>
                  📦 Túi máu đã lưu (Ngăn nhóm {selectedKho.nhomMauString})
                </h3>
                <span className="nk-badge-status blue">
                  Đang lưu kho ({daNhapList.length})
                </span>
              </div>

              <div className="nk-list-wrapper max-height">
                {daNhapList.length === 0 ? (
                  <div className="nk-empty-box">
                    Ngăn kho này hiện chưa có túi máu nào được lưu trữ.
                  </div>
                ) : (
                  daNhapList.map((tm) => (
                    <div key={tm.maTuiMau} className="nk-stored-item">
                      <div className="nk-stored-left">
                        <div className="nk-avatar-stored">{tm.nhomMau}</div>
                        <div>
                          <div className="nk-stored-id">{tm.maTuiMau}</div>
                          <div className="nk-stored-sub">
                            {tm.tenTinhNguyenVien} • {tm.theTich}ml
                          </div>
                        </div>
                      </div>
                      <div className="nk-stored-right">
                        <span className="nk-tag-stored">Đã lưu trữ</span>
                        <span className="nk-stored-time">
                          {new Date(tm.thoiGianLayMau).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
