import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/AdminChungNhan.css";

export default function AdminChungNhan() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);

  // 1. Hàm load danh sách ứng viên (Dùng phương thức GET mặc định)
  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://localhost:7004/api/chungnhan/candidates",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách ứng viên:", err);
      alert("❌ Lỗi tải danh sách người hiến máu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = React.useMemo(() => {
    const pending = candidates.filter(
      (c) => c.trangThaiCap === "pending",
    ).length;
    const issued = candidates.filter((c) => c.trangThaiCap === "issued").length;
    return { pending, issued, total: candidates.length };
  }, [candidates]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchQ =
        !q ||
        (c.hoVaTen || "").toLowerCase().includes(q) ||
        (c.soCCCD || "").toLowerCase().includes(q);
      const matchS = !filterStatus || c.trangThaiCap === filterStatus;
      return matchQ && matchS;
    });
  }, [candidates, search, filterStatus]);

  // 2. Hàm gọi API cấp phát chứng nhận (Bắt buộc dùng POST)
  const handleIssue = async (maDon, name) => {
    if (!window.confirm(`Bạn có chắc muốn cấp chứng nhận cho ${name}?`)) return;

    const token = localStorage.getItem("token");
    try {
      // ĐÃ SỬA: Thêm method: "POST" và cấu hình đúng địa chỉ API
      const res = await fetch(
        `https://localhost:7004/api/chungnhan/issue/${maDon}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        alert(`✅ Cấp chứng nhận thành công cho ${name}!`);
        await loadData();
        if (selected && selected.maDon === maDon) {
          setSelected(data.data);
        }
      } else {
        alert(`❌ Lỗi: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi xảy ra trong quá trình phát hành!");
    }
  };

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="chungnhan-container">
        <div className="cn-header-row">
          <div>
            <h1 className="cn-page-title">📜 Cấp Giấy Chứng Nhận Hiến Máu</h1>
            <p className="cn-page-subtitle">
              Phát hành chứng nhận điện tử cho những tình nguyện viên đã hoàn
              thành hiến máu.
            </p>
          </div>
        </div>

        <div className="cn-stats-row">
          <div className="cn-stat-card border-amber">
            <span className="cn-stat-label">Đang chờ duyệt</span>
            <span className="cn-stat-val text-amber">{stats.pending}</span>
          </div>
          <div className="cn-stat-card border-emerald">
            <span className="cn-stat-label">Đã phát hành</span>
            <span className="cn-stat-val text-emerald">{stats.issued}</span>
          </div>
          <div className="cn-stat-card border-red">
            <span className="cn-stat-label">Tổng số đủ điều kiện</span>
            <span className="cn-stat-val text-red">{stats.total}</span>
          </div>
        </div>

        <div className="cn-work-area">
          <div className="cn-panel cn-list-panel">
            <div className="cn-panel-header">
              <h3>Danh sách tình nguyện viên</h3>
              <div className="cn-filters">
                <input
                  type="text"
                  placeholder="Tìm theo tên, CCCD..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="cn-input-search"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="cn-select-status"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ cấp phát</option>
                  <option value="issued">Đã cấp phát</option>
                </select>
              </div>
            </div>

            <div className="cn-table-wrapper">
              <table className="cn-table">
                <thead>
                  <tr>
                    <th>Tên Tình Nguyện Viên</th>
                    <th>Nhóm Máu</th>
                    <th>Thể Tích</th>
                    <th>Trạng Thái</th>
                    <th style={{ textAlign: "center" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="cn-table-empty">
                        Đang tải danh sách...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="cn-table-empty">
                        Không tìm thấy người hiến máu phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c.maDon}
                        onClick={() => setSelected(c)}
                        className={`cn-table-row ${selected?.maDon === c.maDon ? "active" : ""}`}
                      >
                        <td>
                          <div className="cn-avatar-info">
                            <div className="cn-avatar">
                              {initials(c.hoVaTen)}
                            </div>
                            <div>
                              <strong className="cn-name-text">
                                {c.hoVaTen}
                              </strong>
                              <div className="cn-sub-text">
                                CCCD: {c.soCCCD}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-nhommau">{c.nhomMau}</span>
                        </td>
                        <td className="cn-volume-text">{c.theTich}</td>
                        <td>
                          <span className={`badge-status ${c.trangThaiCap}`}>
                            {c.trangThaiCap === "issued" ? "Đã cấp" : "Chờ cấp"}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: "center" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {c.trangThaiCap === "issued" ? (
                            <button
                              onClick={() => navigate(`/chung-nhan/${c.maDon}`)}
                              className="btn-action btn-view"
                            >
                              👁️ Xem
                            </button>
                          ) : (
                            <button
                              onClick={() => handleIssue(c.maDon, c.hoVaTen)}
                              className="btn-action btn-issue"
                            >
                              ✍️ Cấp phát
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cn-panel cn-preview-panel">
            {!selected ? (
              <div className="cn-preview-placeholder">
                <div className="placeholder-icon">🎖️</div>
                <h4>Xem trước giấy chứng nhận</h4>
                <p>
                  Bấm vào một hàng trong danh sách để xem trước phôi chứng nhận
                  điện tử.
                </p>
              </div>
            ) : (
              <div className="cn-certificate-preview">
                <div className="preview-top">
                  <h5>GIẤY CHỨNG NHẬN ĐIỆN TỬ</h5>
                  <p>Mã số: {selected.maChungNhan || "Chưa phát hành"}</p>
                </div>
                <div className="preview-body">
                  <div className="preview-quote">
                    "Một giọt máu cho đi - Một cuộc đời ở lại"
                  </div>

                  <div className="preview-info-grid">
                    <div className="info-item">
                      <span className="info-label">Người hiến:</span>
                      <strong className="info-val text-red">
                        {selected.hoVaTen}
                      </strong>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Nhóm máu:</span>
                      <span className="info-val font-bold text-red">
                        {selected.nhomMau}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Thể tích hiến:</span>
                      <span className="info-val font-bold">
                        {selected.theTich}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Chiến dịch:</span>
                      <span className="info-val">{selected.tenChienDich}</span>
                    </div>
                  </div>
                </div>

                <div className="preview-footer">
                  <button
                    onClick={() => navigate(`/chung-nhan/${selected.maDon}`)}
                    className="btn-preview-action btn-preview-view"
                  >
                    👁️ Trang Xem & In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
