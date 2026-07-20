import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/QuanLyChienDich.css";

const STATUS_OPTIONS = [
  { value: 0, label: "ChÆ°a báº¯t Ä‘áº§u" },
  { value: 1, label: "Äang diá»…n ra" },
  { value: 2, label: "ÄÃ£ káº¿t thÃºc" },
  { value: 3, label: "ÄÃ£ há»§y" },
];

export default function QuanLyChienDich() {
  const [campaigns, setCampaigns] = useState([]);
  const [diaDiems, setDiaDiems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null); // 'create' hoáº·c { type: 'edit', id: '...' }
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

  // Load danh sÃ¡ch chiáº¿n dá»‹ch vÃ  Ä‘á»‹a Ä‘iá»ƒm tá»• chá»©c
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
      console.error("Lá»—i táº£i dá»¯ liá»‡u:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // TÃ­nh toÃ¡n chá»‰ sá»‘ KPI nhanh
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.trangThai === 1 || c.trangThai === "DangDienRa",
  ).length;
  const upcomingCampaigns = campaigns.filter(
    (c) => c.trangThai === 0 || c.trangThai === "ChuaBatDau",
  ).length;

  // Lá»c tÃ¬m kiáº¿m theo TÃªn chiáº¿n dá»‹ch, Äá»‹a Ä‘iá»ƒm hoáº·c Tráº¡ng thÃ¡i
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
        "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500", // áº¢nh máº«u máº·c Ä‘á»‹nh
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

    // Convert datetime sang Ä‘á»‹nh dáº¡ng datetime-local (yyyy-MM-ddThh:mm)
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
            ? "ðŸŽ‰ Táº¡o chiáº¿n dá»‹ch má»›i thÃ nh cÃ´ng!"
            : "ðŸŽ‰ Cáº­p nháº­t chiáº¿n dá»‹ch thÃ nh cÃ´ng!",
        );
        setModal(null);
        loadData();
      } else {
        alert(
          "âŒ Thao tÃ¡c tháº¥t báº¡i: " + (resJson.message || "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh"),
        );
      }
    } catch (error) {
      console.error("Lá»—i submit:", error);
      alert("âŒ CÃ³ lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (maChienDich) => {
    if (!window.confirm("âš ï¸ Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a chiáº¿n dá»‹ch nÃ y khÃ´ng?")) {
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
        alert("âœ… XÃ³a chiáº¿n dá»‹ch thÃ nh cÃ´ng!");
        loadData();
      } else {
        alert(
          "âŒ XÃ³a tháº¥t báº¡i: " +
            (resJson.message ||
              "Chiáº¿n dá»‹ch Ä‘Ã£ cÃ³ ngÆ°á»i Ä‘Äƒng kÃ½, khÃ´ng thá»ƒ xÃ³a!"),
        );
      }
    } catch (error) {
      console.error("Lá»—i xÃ³a chiáº¿n dá»‹ch:", error);
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
    }
  };

  return (
    <div className="qlcd-wrapper">
      <Navbar />

      <main className="qlcd-container">
        {/* TiÃªu Ä‘á» & NÃºt Táº¡o */}
        <div className="qlcd-header-row">
          <div>
            <h1 className="qlcd-title">Quáº£n LÃ½ Chiáº¿n Dá»‹ch</h1>
            <p className="qlcd-subtitle">
              Quáº£n lÃ½ vÃ  Ä‘iá»u phá»‘i cÃ¡c chiáº¿n dá»‹ch hiáº¿n mÃ¡u tÃ¬nh nguyá»‡n.
            </p>
          </div>
          <button onClick={openCreate} className="btn-create-cd">
            âž• Táº¡o chiáº¿n dá»‹ch má»›i
          </button>
        </div>

        {/* Thá»‘ng kÃª nhanh KPI */}
        <div className="qlcd-stats-row">
          <div className="stat-card">
            <div className="stat-icon blue">ðŸ“…</div>
            <div>
              <p className="stat-label">Tá»”NG Sá» CHIáº¾N Dá»ŠCH</p>
              <p className="stat-value">{totalCampaigns}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">ðŸƒ</div>
            <div>
              <p className="stat-label">ÄANG DIá»„N RA</p>
              <p className="stat-value">{activeCampaigns}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">â³</div>
            <div>
              <p className="stat-label">Sáº®P DIá»„N RA</p>
              <p className="stat-value">{upcomingCampaigns}</p>
            </div>
          </div>
        </div>

        {/* Thanh tÃ¬m kiáº¿m & bá»™ lá»c */}
        <div className="qlcd-filter-bar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="TÃ¬m kiáº¿m theo tÃªn chiáº¿n dá»‹ch, Ä‘á»‹a Ä‘iá»ƒm..."
            className="input-search-cd"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-filter-status"
          >
            <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Báº£ng danh sÃ¡ch chiáº¿n dá»‹ch */}
        <div className="qlcd-table-card">
          <div className="table-responsive">
            <table className="qlcd-table">
              <thead>
                <tr>
                  <th>HÃ¬nh áº£nh</th>
                  <th>TÃªn chiáº¿n dá»‹ch</th>
                  <th>Thá»i gian diá»…n ra</th>
                  <th>Äá»‹a Ä‘iá»ƒm</th>
                  <th>Chá»‰ tiÃªu (ÄV)</th>
                  <th>Tráº¡ng thÃ¡i</th>
                  <th style={{ textAlign: "right" }}>Thao tÃ¡c</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      Äang táº£i dá»¯ liá»‡u chiáº¿n dá»‹ch...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "40px" }}
                    >
                      KhÃ´ng tÃ¬m tháº¥y chiáº¿n dá»‹ch nÃ o phÃ¹ há»£p.
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
                        ?.label || "KhÃ´ng rÃµ";
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
                              SÃ¡ng:{" "}
                              {new Date(c.thoiGianBD).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                            <span className="time-arrow">â†“</span>
                            <span>
                              Chiá»u:{" "}
                              {new Date(c.thoiGianKT).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="td-location">
                            {c.diaDiem?.tenDiaDiem || "ChÆ°a cáº­p nháº­t"}
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
                              title="Chá»‰nh sá»­a"
                            >
                              âœï¸
                            </button>
                            <button
                              onClick={() => handleDelete(c.maChienDich)}
                              className="btn-icon btn-delete"
                              title="XÃ³a"
                            >
                              ðŸ—‘ï¸
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

      {/* Modal ThÃªm má»›i / Chá»‰nh sá»­a */}
      {modal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {modal === "create"
                  ? "Táº¡o Chiáº¿n Dá»‹ch Má»›i"
                  : "Chá»‰nh Sá»­a Chiáº¿n Dá»‹ch"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="btn-close-modal"
              >
                âœ–
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>TÃªn chiáº¿n dá»‹ch *</label>
                <input
                  type="text"
                  required
                  value={form.tenChienDich}
                  onChange={(e) =>
                    setForm({ ...form, tenChienDich: e.target.value })
                  }
                  placeholder="Nháº­p tÃªn chiáº¿n dá»‹ch..."
                />
              </div>

              <div className="form-group">
                <label>Äá»‹a Ä‘iá»ƒm tá»• chá»©c *</label>
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
                  <label>Thá»i gian báº¯t Ä‘áº§u *</label>
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
                  <label>Thá»i gian káº¿t thÃºc *</label>
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
                  <label>Chá»‰ tiÃªu tÃºi mÃ¡u (ÄÆ¡n vá»‹)</label>
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
                  <label>Tráº¡ng thÃ¡i chiáº¿n dá»‹ch</label>
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
                <label>ÄÆ°á»ng dáº«n hÃ¬nh áº£nh (URL)</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="Link áº£nh Unsplash hoáº·c áº£nh báº¥t ká»³..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="btn-cancel-form"
                >
                  Há»§y bá»
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit-form"
                >
                  {submitting ? "Äang lÆ°u..." : "XÃ¡c nháº­n lÆ°u"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

