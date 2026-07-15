import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../css/AdminKhaiBaoYTe.css";

export default function AdminKhaiBaoYTe() {
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://localhost:7004/api/hososuckhoe/tat-ca", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setDanhSach(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hàm hiển thị giá trị Có/Không từ boolean
  const YN = (val) =>
    val ? (
      <span className="badge-yn badge-yn-yes">Có</span>
    ) : (
      <span className="badge-yn badge-yn-no">Không</span>
    );

  const filtered = danhSach.filter((hs) => {
    const keyword = search.toLowerCase();
    return (
      hs.maHoSo?.toLowerCase().includes(keyword) ||
      hs.maDon?.toLowerCase().includes(keyword) ||
      hs.donDangKy?.tinhNguyenVien?.hoTen?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="kbt-container">
        <div className="kbt-header">
          <div>
            <h1 className="kbt-title">📋 Danh sách Hồ Sơ Khai Báo Y Tế</h1>
            <p className="kbt-subtitle">
              Theo dõi toàn bộ phiếu sức khỏe do Tình nguyện viên khai báo
            </p>
          </div>
          <div className="kbt-stats">
            <div className="kbt-stat-card">
              <div className="kbt-stat-number">{danhSach.length}</div>
              <div className="kbt-stat-label">Tổng hồ sơ</div>
            </div>
            <div className="kbt-stat-card kbt-stat-risk">
              <div className="kbt-stat-number">
                {
                  danhSach.filter(
                    (h) =>
                      h.dauHong || h.khangSinh || h.truyenNhiem || h.coThai,
                  ).length
                }
              </div>
              <div className="kbt-stat-label">Cần chú ý</div>
            </div>
          </div>
        </div>

        <div className="kbt-search-row">
          <input
            type="text"
            placeholder="🔍 Tìm theo Mã hồ sơ, Mã đơn, Tên TNV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="kbt-search-input"
          />
          <button onClick={loadData} className="btn-reload">
            🔄 Tải lại
          </button>
        </div>

        {loading ? (
          <div className="kbt-loading">Đang tải dữ liệu...</div>
        ) : (
          <div className="kbt-table-wrapper">
            <table className="kbt-table">
              <thead>
                <tr>
                  <th>Mã Hồ Sơ</th>
                  <th>Mã Đơn</th>
                  <th>Tình nguyện viên</th>
                  <th>Sốt/Đau họng</th>
                  <th>Kháng sinh</th>
                  <th>Truyền nhiễm</th>
                  <th>Thai sản</th>
                  <th>Mô tả khác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#94a3b8",
                      }}
                    >
                      Không có dữ liệu nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((hs) => (
                    <tr
                      key={hs.maHoSo}
                      className={
                        hs.dauHong ||
                        hs.khangSinh ||
                        hs.truyenNhiem ||
                        hs.coThai
                          ? "row-risk"
                          : ""
                      }
                    >
                      <td>
                        <strong className="text-primary">{hs.maHoSo}</strong>
                      </td>
                      <td className="font-mono">{hs.maDon}</td>
                      <td>{hs.donDangKy?.tinhNguyenVien?.hoTen || "N/A"}</td>
                      <td>{YN(hs.dauHong)}</td>
                      <td>{YN(hs.khangSinh)}</td>
                      <td>{YN(hs.truyenNhiem)}</td>
                      <td>{YN(hs.coThai)}</td>
                      <td className="col-motakhac">{hs.moTaKhac || "---"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
