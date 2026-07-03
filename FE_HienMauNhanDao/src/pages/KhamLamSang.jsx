import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/KhamLamSang.css";

export default function KhamLamSang() {
  const [showList, setShowList] = useState(false); // false: Nhập liệu, true: Lịch sử danh sách
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);
  const [qrInput, setQrInput] = useState("");
  
  const [form, setForm] = useState({
    huyetAp: "120/80",
    nhipTim: "75",
    canNang: "60",
    nhietDo: "37.0",
    ketQua: "", // "dat" hoặc "khong_dat"
    lyDoTuChoi: ""
  });
  const [volumeSelect, setVolumeSelect] = useState("350");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [screeningList, setScreeningList] = useState([]);
  const [stats, setStats] = useState({ tongSo: 0, datYeuCau: 0, khongDat: 0 });

  // 1. Gọi API lấy danh sách ca khám & số liệu thống kê từ Backend C#
  const fetchScreeningList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const listRes = await fetch("https://localhost:7004/api/khamlamsang/danh-sach", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listData = await listRes.json();

      const statsRes = await fetch("https://localhost:7004/api/khamlamsang/thong-ke", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      setScreeningList(Array.isArray(listData) ? listData : []);
      setStats(statsData || { tongSo: 0, datYeuCau: 0, khongDat: 0 });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khám:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showList) fetchScreeningList();
  }, [showList]);

  // 2. Chức năng Check-in mã đơn (Tìm kiếm trong hàng chờ khám)
  const handleCheckIn = async () => {
    if (!qrInput.trim()) return alert("Vui lòng nhập mã đơn đăng ký!");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7004/api/khamlamsang/cho-kham", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      const found = list.find(d => d.maDon.toLowerCase() === qrInput.trim().toLowerCase());

      if (found) {
        setIsCheckedIn(true);
        setDonorInfo(found);
        alert(`Check-in thành công: ${found.tenTinhNguyenVien}`);
      } else {
        alert("Không tìm thấy đơn đăng ký này trong hàng chờ khám lâm sàng!");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  // 3. Chức năng lưu kết quả khám lâm sàng & tự động tạo túi máu
  const handleSave = async () => {
    if (!isCheckedIn) return alert("Vui lòng Check-in mã đơn trước khi khám!");
    if (!form.ketQua) return alert("Vui lòng lựa chọn kết quả sàng lọc (Đạt/Không đạt)!");
    if (form.ketQua === "khong_dat" && !form.lyDoTuChoi.trim()) {
      return alert("Vui lòng điền lý do không đạt yêu cầu sức khỏe!");
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const maNV = localStorage.getItem("email"); // Lấy email hoặc tài khoản bác sĩ phụ trách

      const payload = {
        maDon: donorInfo.maDon,
        maNhanVien: maNV || "NV00001",
        huyetAp: form.huyetAp,
        nhipTim: parseInt(form.nhipTim),
        canNang: parseFloat(form.canNang),
        nhietDo: parseFloat(form.nhietDo),
        ketQua: form.ketQua === "dat",
        lyDoTuChoi: form.ketQua === "dat" ? "" : form.lyDoTuChoi,
        theTichHien: parseInt(volumeSelect)
      };

      const res = await fetch("https://localhost:7004/api/khamlamsang/luu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (resData.success) {
        alert("Lưu kết quả khám và thu nhận túi máu thành công!");
        setIsCheckedIn(false);
        setDonorInfo(null);
        setQrInput("");
        setForm({ huyetAp: "120/80", nhipTim: "75", canNang: "60", nhietDo: "37.0", ketQua: "", lyDoTuChoi: "" });
      } else {
        alert(resData.message);
      }
    } catch (error) {
      alert("Lỗi khi gửi kết quả lên hệ thống!");
    } finally {
      setSaving(false);
    }
  };

  // 4. Xóa kết quả khám cũ (để khám lại)
  const handleDelete = async (maKQ) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa kết quả khám này? Túi máu liên quan (nếu có) cũng sẽ bị xóa.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://localhost:7004/api/khamlamsang/xoa/${maKQ}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Đã xóa kết quả khám thành công.");
        fetchScreeningList();
      }
    } catch (error) {
      alert("Lỗi khi kết nối!");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="kls-container">
        
        {/* Tiêu đề trang */}
        <div className="kls-header">
          <h1 className="kls-title">🩺 Khám sàng lọc & Thu nhận máu</h1>
          <p className="kls-subtitle">Nhập các chỉ số sức khỏe sinh tồn và xử lý thu hoạch túi máu.</p>
        </div>

        {/* Chuyển đổi Tab Nhập liệu / Xem lịch sử */}
        <div className="kls-tab-bar">
          <button onClick={() => setShowList(false)} className={`kls-tab-btn ${!showList ? 'active' : ''}`}>
            📝 Nhập dữ liệu sàng lọc
          </button>
          <button onClick={() => setShowList(true)} className={`kls-tab-btn ${showList ? 'active' : ''}`}>
            📋 Lịch sử khám lâm sàng
          </button>
        </div>

        {!showList ? (
          /* ================= KHỐI NHẬP LIỆU ================= */
          <div className="kls-layout-grid">
            
            {/* Cột 1: Quét đơn & thông tin người hiến */}
            <div className="kls-card kls-card-left">
              <h2 className="kls-card-title">🔍 Check-in Đơn đăng ký</h2>
              
              <div className="checkin-search-box">
                <input 
                  type="text" 
                  placeholder="Nhập mã đơn hiến máu (VD: DON00001)..." 
                  value={qrInput}
                  onChange={e => setQrInput(e.target.value)}
                  className="checkin-input"
                />
                <button onClick={handleCheckIn} className="btn-checkin">Check-in</button>
              </div>

              {isCheckedIn && donorInfo ? (
                <div className="donor-info-details animate-fadein">
                  <h3 className="donor-info-title">👤 Thông tin người hiến máu</h3>
                  <div className="info-row"><span>Họ & Tên:</span> <strong>{donorInfo.tenTinhNguyenVien}</strong></div>
                  <div className="info-row"><span>Ngày sinh:</span> <strong>{donorInfo.ngaySinh}</strong></div>
                  <div className="info-row"><span>Giới tính:</span> <strong>{donorInfo.gioiTinh}</strong></div>
                  <div className="info-row"><span>Nhóm máu:</span> <strong className="blood-badge-text">{donorInfo.nhomMau}</strong></div>
                  <div className="info-row"><span>Mã đơn:</span> <strong className="font-mono">{donorInfo.maDon}</strong></div>
                </div>
              ) : (
                <div className="checkin-placeholder">Vui lòng nhập mã đơn và bấm Check-in để bắt đầu khám sàng lọc</div>
              )}
            </div>

            {/* Cột 2: Form khám lâm sàng */}
            <div className="kls-card kls-card-right">
              <h2 className="kls-card-title">📋 Chỉ số y tế lâm sàng</h2>
              
              <div className="kls-form-grid">
                <div className="form-group">
                  <label>Huyết áp (mmHg)</label>
                  <input 
                    type="text" 
                    value={form.huyetAp} 
                    onChange={e => setForm(p => ({ ...p, huyetAp: e.target.value }))}
                    placeholder="VD: 120/80" 
                  />
                  {form.huyetAp && form.huyetAp.includes("/") && (
                    (() => {
                      const sys = parseInt(form.huyetAp.split("/")[0]);
                      if (!isNaN(sys) && (sys > 140 || sys < 90)) {
                        return <span className="warning-note-text">⚠️ Huyết áp bất thường (90-140)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>

                <div className="form-group">
                  <label>Nhịp tim (bpm)</label>
                  <input 
                    type="number" 
                    value={form.nhipTim} 
                    onChange={e => setForm(p => ({ ...p, nhipTim: e.target.value }))}
                  />
                  {form.nhipTim && (
                    (() => {
                      const hr = parseInt(form.nhipTim);
                      if (!isNaN(hr) && (hr > 100 || hr < 60)) {
                        return <span className="warning-note-text">⚠️ Nhịp tim bất thường (60-100)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>

                <div className="form-group">
                  <label>Cân nặng (kg)</label>
                  <input 
                    type="number" 
                    value={form.canNang} 
                    onChange={e => setForm(p => ({ ...p, canNang: e.target.value }))}
                  />
                  {form.canNang && (
                    (() => {
                      const w = parseFloat(form.canNang);
                      if (!isNaN(w) && w < 45) {
                        return <span className="warning-note-text">⚠️ Cân nặng &lt; 45kg (Chỉ hiến 250ml)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>

                <div className="form-group">
                  <label>Nhiệt độ (°C)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={form.nhietDo} 
                    onChange={e => setForm(p => ({ ...p, nhietDo: e.target.value }))}
                  />
                  {form.nhietDo && (
                    (() => {
                      const t = parseFloat(form.nhietDo);
                      if (!isNaN(t) && (t > 37.8 || t < 36.0)) {
                        return <span className="warning-note-text">⚠️ Thân nhiệt bất thường (36-37.8)</span>;
                      }
                      return null;
                    })()
                  )}
                </div>
              </div>

              {/* Lựa chọn thể tích hiến */}
              <div className="form-group select-volume-group">
                <label>Thể tích máu thu nhận (ml)</label>
                <select value={volumeSelect} onChange={e => setVolumeSelect(e.target.value)}>
                  <option value="250">250 ml (Cân nặng &ge; 45kg)</option>
                  <option value="350">350 ml (Cân nặng &ge; 50kg)</option>
                  <option value="450">450 ml (Thể trạng tốt)</option>
                </select>
              </div>

              {/* Lựa chọn kết quả */}
              <div className="form-group result-radio-group">
                <label>Kết quả khám sàng lọc</label>
                <div className="radio-row">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="ketQua" 
                      checked={form.ketQua === "dat"} 
                      onChange={() => setForm(p => ({ ...p, ketQua: "dat", lyDoTuChoi: "" }))} 
                    />
                    Đạt yêu cầu hiến máu
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="ketQua" 
                      checked={form.ketQua === "khong_dat"} 
                      onChange={() => setForm(p => ({ ...p, ketQua: "khong_dat" }))} 
                    />
                    Không đạt yêu cầu
                  </label>
                </div>
              </div>

              {form.ketQua === "khong_dat" ? (
                <div className="form-group animate-fadein">
                  <label style={{ color: "#dc2626" }}>Lý do từ chối (Bắt buộc)</label>
                  <textarea 
                    placeholder="Mô tả lý do không đủ sức khỏe..." 
                    value={form.lyDoTuChoi}
                    onChange={e => setForm(p => ({ ...p, lyDoTuChoi: e.target.value }))}
                    rows="3"
                  />
                </div>
              ) : null}

              <button onClick={handleSave} disabled={saving} className="btn-submit-kls">
                {saving ? "Đang lưu..." : "💾 LƯU KẾT QUẢ & SINH TÚI MÁU"}
              </button>
            </div>

          </div>
        ) : (
          /* ================= KHỐI LỊCH SỬ DANH SÁCH ================= */
          <div className="kls-history-layout">
            {/* Hàng 3 Card thống kê số liệu khám sàng lọc */}
            <div className="kls-stats-row">
              <div className="stat-box-kls gray">
                <span>Tổng số ca khám</span>
                <strong>{stats.tongSo} ca</strong>
              </div>
              <div className="stat-box-kls green">
                <span>Đạt yêu cầu</span>
                <strong>{stats.datYeuCau} ca</strong>
              </div>
              <div className="stat-box-kls red">
                <span>Bị từ chối</span>
                <strong>{stats.khongDat} ca</strong>
              </div>
            </div>

            {/* Bảng danh sách ca khám */}
            <div className="kls-table-card">
              <div className="kls-table-wrapper">
                <table className="kls-table">
                  <thead>
                    <tr>
                      <th>Mã khám</th>
                      <th>Mã đơn</th>
                      <th>Tình nguyện viên</th>
                      <th>Chiến dịch</th>
                      <th>Huyết áp</th>
                      <th>Nhịp tim</th>
                      <th>Cân nặng</th>
                      <th>Kết quả</th>
                      <th>Mô tả / Lý do từ chối</th>
                      <th style={{ textAlign: "right" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>Đang tải danh sách...</td></tr>
                    ) : screeningList.length === 0 ? (
                      <tr><td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>Không có dữ liệu ca khám sàng lọc nào</td></tr>
                    ) : (
                      screeningList.map((item) => (
                        <tr key={item.maKQ} className={!item.ketQua ? "row-failed" : ""}>
                          <td><strong className="font-mono text-primary">{item.maKQ}</strong></td>
                          <td className="font-mono">{item.maDon}</td>
                          <td>{item.tenTinhNguyenVien}</td>
                          <td className="col-campaign">{item.tenChienDich}</td>
                          <td>{item.huyetAp} mmHg</td>
                          <td>{item.nhipTim} bpm</td>
                          <td>{item.canNang} kg</td>
                          <td>
                            {item.ketQua ? (
                              <span className="badge-kls badge-success">Đạt</span>
                            ) : (
                              <span className="badge-kls badge-danger">Không đạt</span>
                            )}
                          </td>
                          <td className="col-desc">{item.lyDoTuChoi || "---"}</td>
                          <td style={{ textAlign: "right" }}>
                            <button onClick={() => handleDelete(item.maKQ)} className="btn-delete-kls" title="Xóa bỏ">
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
