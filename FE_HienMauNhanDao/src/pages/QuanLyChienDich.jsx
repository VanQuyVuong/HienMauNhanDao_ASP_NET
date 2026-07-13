import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/QuanLyChienDich.css";

const STATUS_OPTIONS = [
  { value: 0, label: "Chưa bắt đầu" },
  { value: 1, label: "Đang diễn ra" },
  { value: 2, label: "Đã kết thúc" },
  { value: 3, label: "Đã hủy" },
];

export default function QuanLyChienDich() {
  const [campaigns, setCampaigns] = useState([]);
  const [diaDiems, setDiaDiems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null); // 'create' hoặc { type: 'edit', id: '...' }
  const [form, setForm] = useState({
    tenChienDich: "",
    maDiaDiem: "",
    thoiGianBD: "",
    thoiGianKT: "",
    soLuongDuKien: 100,
    trangThai: 0,
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load danh sách chiến dịch và địa điểm tổ chức
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const cdResponse = await fetch("https://localhost:7004/api/chiendich", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ddResponse = await fetch("https://localhost:7004/api/diadiem");

      if (cdResponse.ok && ddResponse.ok) {
        const cdData = await cdResponse.json();
        const ddData = await ddResponse.json();
        setCampaigns(cdData.data || []);
        setDiaDiems(ddData.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tính toán chỉ số KPI nhanh
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.trangThai === 1 || c.trangThai === "DangDienRa",
  ).length;
  const upcomingCampaigns = campaigns.filter(
    (c) => c.trangThai === 0 || c.trangThai === "ChuaBatDau",
  ).length;

  // Lọc tìm kiếm theo Tên chiến dịch, Địa điểm hoặc Trạng thái
  const filteredCampaigns = campaigns.filter((c) => {
    const matchSearch =
      c.tenChienDich.toLowerCase().includes(search.toLowerCase()) ||
      (c.diaDiem?.tenDiaDiem || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const cStatusVal =
      c.trangThai === "ChuaBatDau"
        ? 0
        : c.trangThai === "DangDienRa"
          ? 1
          : c.trangThai === "DaKetThuc"
            ? 2
            : c.trangThai === "DaHuy"
              ? 3
              : c.trangThai;

    const matchStatus =
      filterStatus === "" || cStatusVal.toString() === filterStatus.toString();
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setForm({
      tenChienDich: "",
      maDiaDiem: diaDiems[0]?.maDiaDiem || "",
      thoiGianBD: "",
      thoiGianKT: "",
      soLuongDuKien: 100,
      trangThai: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500", // Ảnh mẫu mặc định
    });
    setModal("create");
  };

  const openEdit = (c) => {
    const cStatusVal =
      c.trangThai === "ChuaBatDau"
        ? 0
        : c.trangThai === "DangDienRa"
          ? 1
          : c.trangThai === "DaKetThuc"
            ? 2
            : c.trangThai === "DaHuy"
              ? 3
              : c.trangThai;

    // Convert datetime sang định dạng datetime-local (yyyy-MM-ddThh:mm)
    const formatDateTime = (dtStr) => {
      if (!dtStr) return "";
      const d = new Date(dtStr);
      const tzoffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
    };

    setForm({
      tenChienDich: c.tenChienDich,
      maDiaDiem: c.maDiaDiem || "",
      thoiGianBD: formatDateTime(c.thoiGianBD),
      thoiGianKT: formatDateTime(c.thoiGianKT),
      soLuongDuKien: c.soLuongDuKien || 100,
      trangThai: cStatusVal,
      imageUrl: c.imageUrl || "",
    });
    setModal({ type: "edit", id: c.maChienDich });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const isCreate = modal === "create";
    const url = isCreate
      ? "https://localhost:7004/api/chiendich"
      : `https://localhost:7004/api/chiendich/${modal.id}`;

    const method = isCreate ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const resJson = await response.json();
      if (response.ok) {
        alert(
          isCreate
            ? "🎉 Tạo chiến dịch mới thành công!"
            : "🎉 Cập nhật chiến dịch thành công!",
        );
        setModal(null);
        loadData();
      } else {
        alert(
          "❌ Thao tác thất bại: " + (resJson.message || "Lỗi không xác định"),
        );
      }
    } catch (error) {
      console.error("Lỗi submit:", error);
      alert("❌ Có lỗi kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (maChienDich) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa chiến dịch này không?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://localhost:7004/api/chiendich/${maChienDich}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const resJson = await response.json();
      if (response.ok) {
        alert("✅ Xóa chiến dịch thành công!");
        loadData();
      } else {
        alert(
          "❌ Xóa thất bại: " +
            (resJson.message ||
              "Chiến dịch đã có người đăng ký, không thể xóa!"),
        );
      }
    } catch (error) {
      console.error("Lỗi xóa chiến dịch:", error);
      alert("❌ Lỗi kết nối đến máy chủ.");
    }
  };

  return (
    <div className="qlcd-wrapper">
      <Navbar />

      <main className="qlcd-container">
        {/* Tiêu đề & Nút Tạo */}
        <div className="qlcd-header-row">
          <div>
            <h1 className="qlcd-title">Quản Lý Chiến Dịch</h1>
            <p className="qlcd-subtitle">
              Quản lý và điều phối các chiến dịch hiến máu tình nguyện.
            </p>
          </div>
          <button onClick={openCreate} className="btn-create-cd">
            ➕ Tạo chiến dịch mới
          </button>
        </div>

        {/* Thống kê nhanh KPI */}
        <div className="qlcd-stats-row">
          <div className="stat-card">
            <div className="stat-icon blue">📅</div>
            <div>
              <p className="stat-label">TỔNG SỐ CHIẾN DỊCH</p>
              <p className="stat-value">{totalCampaigns}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">🏃</div>
            <div>
              <p className="stat-label">ĐANG DIỄN RA</p>
              <p className="stat-value">{activeCampaigns}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">⏳</div>
            <div>
              <p className="stat-label">SẮP DIỄN RA</p>
              <p className="stat-value">{upcomingCampaigns}</p>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="qlcd-filter-bar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên chiến dịch, địa điểm..."
            className="input-search-cd"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-filter-status"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bảng danh sách chiến dịch */}
        <div className="qlcd-table-card">
          <div className="table-responsive">
            <table className="qlcd-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên chiến dịch</th>
                  <th>Thời gian diễn ra</th>
                  <th>Địa điểm</th>
                  <th>Chỉ tiêu (ĐV)</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      Đang tải dữ liệu chiến dịch...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      Không tìm thấy chiến dịch nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((c) => {
                    const statusVal =
                      c.trangThai === "ChuaBatDau"
                        ? 0
                        : c.trangThai === "DangDienRa"
                          ? 1
                          : c.trangThai === "DaKetThuc"
                            ? 2
                            : c.trangThai === "DaHuy"
                              ? 3
                              : c.trangThai;

                    const statusLabel =
                      STATUS_OPTIONS.find((opt) => opt.value === statusVal)
                        ?.label || "Không rõ";
                    const statusClass =
                      statusVal === 1
                        ? "dang-dien-ra"
                        : statusVal === 0
                          ? "chua-bat-dau"
                          : statusVal === 2
                            ? "da-ket-thuc"
                            : "da-huy";

                    return (
                      <tr key={c.maChienDich}>
                        <td>
                          <img
                            src={
                              c.imageUrl ||
                              "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=100"
                            }
                            alt={c.tenChienDich}
                            className="td-cd-img"
                          />
                        </td>
                        <td>
                          <div className="td-cd-title-box">
                            <span className="td-cd-title">
                              {c.tenChienDich}
                            </span>
                            <span className="td-cd-code">{c.maChienDich}</span>
                          </div>
                        </td>
                        <td>
                          <div className="td-time-box">
                            <span>
                              Sáng:{" "}
                              {new Date(c.thoiGianBD).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                            <span className="time-arrow">↓</span>
                            <span>
                              Chiều:{" "}
                              {new Date(c.thoiGianKT).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="td-location">
                            {c.diaDiem?.tenDiaDiem || "Chưa cập nhật"}
                          </span>
                        </td>
                        <td style={{ fontWeight: "700" }}>
                          {c.soLuongDuKien || 100}
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="td-action-group">
                            <button
                              onClick={() => openEdit(c)}
                              className="btn-icon btn-edit"
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(c.maChienDich)}
                              className="btn-icon btn-delete"
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Thêm mới / Chỉnh sửa */}
      {modal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {modal === "create"
                  ? "Tạo Chiến Dịch Mới"
                  : "Chỉnh Sửa Chiến Dịch"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="btn-close-modal"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên chiến dịch *</label>
                <input
                  type="text"
                  required
                  value={form.tenChienDich}
                  onChange={(e) =>
                    setForm({ ...form, tenChienDich: e.target.value })
                  }
                  placeholder="Nhập tên chiến dịch..."
                />
              </div>

              <div className="form-group">
                <label>Địa điểm tổ chức *</label>
                <select
                  value={form.maDiaDiem}
                  onChange={(e) =>
                    setForm({ ...form, maDiaDiem: e.target.value })
                  }
                >
                  {diaDiems.map((d) => (
                    <option key={d.maDiaDiem} value={d.maDiaDiem}>
                      {d.tenDiaDiem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.thoiGianBD}
                    onChange={(e) =>
                      setForm({ ...form, thoiGianBD: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.thoiGianKT}
                    onChange={(e) =>
                      setForm({ ...form, thoiGianKT: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Chỉ tiêu túi máu (Đơn vị)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.soLuongDuKien}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        soLuongDuKien: parseInt(e.target.value) || 100,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái chiến dịch</label>
                  <select
                    value={form.trangThai}
                    onChange={(e) =>
                      setForm({ ...form, trangThai: parseInt(e.target.value) })
                    }
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Đường dẫn hình ảnh (URL)</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="Link ảnh Unsplash hoặc ảnh bất kỳ..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="btn-cancel-form"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit-form"
                >
                  {submitting ? "Đang lưu..." : "Xác nhận lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
