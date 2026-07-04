import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../css/KetQuaXetNghiem.css";

export default function KetQuaXetNghiem() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý việc hiển thị và nhập liệu trong ô sửa đổi kết quả
  const [editXN, setEditXN] = useState(null);
  const [xnForm, setXnForm] = useState({
    nhomMau: "",
    soLanXetNghiem: "1",
    moTa: "",
    ketQua: "",
  });
  const [xnSaving, setXnSaving] = useState(false);

  // Lọc ra các ca đang chờ xét nghiệm (chưa có kết quả) để báo động
  const reTestRequests = list.filter(
    (xn) => xn.ketQua === null || xn.ketQua === undefined,
  );

  // Hàm gọi API lấy danh sách xét nghiệm từ Backend C#
  const fetchList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://localhost:7004/api/ketquaxetnghiem/danh-sach",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách xét nghiệm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Hàm gửi kết quả cập nhật lên C# API
  const handleEditSave = async () => {
    if (!xnForm.ketQua)
      return alert("Vui lòng chọn kết quả Đạt hoặc Không đạt!");
    if (!xnForm.nhomMau) return alert("Vui lòng chọn nhóm máu xác nhận!");

    setXnSaving(true);
    try {
      const token = localStorage.getItem("token");
      const maNV = localStorage.getItem("email") || "NV00001"; // Lấy email nhân viên đăng nhập làm mã NV tạm thời

      const payload = {
        maTuiMau: editXN.maTuiMau,
        nhomMau: xnForm.nhomMau,
        soLanXetNghiem: parseInt(xnForm.soLanXetNghiem),
        moTa: xnForm.moTa,
        ketQua: xnForm.ketQua === "true",
        maNhanVien: maNV,
      };

      const res = await fetch(
        "https://localhost:7004/api/ketquaxetnghiem/luu",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const resData = await res.json();
      if (res.ok) {
        alert("Đã cập nhật kết quả xét nghiệm túi máu thành công!");
        setEditXN(null);
        fetchList(); // Tải lại danh sách mới
      } else {
        alert(resData.message || "Lỗi khi lưu!");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setXnSaving(false);
    }
  };

  // Hàm xóa kết quả xét nghiệm để thực hiện lại từ đầu
  const handleDeleteXetNghiem = async (xn) => {
    if (xn.maKQ.startsWith("CHUA_TEST_"))
      return alert("Túi máu này chưa có kết quả xét nghiệm thực tế!");
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa kết quả xét nghiệm ${xn.maKQ}? Túi máu sẽ được chuyển về hàng chờ xét nghiệm lại.`,
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://localhost:7004/api/ketquaxetnghiem/xoa/${xn.maKQ}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        alert("Đã xóa kết quả xét nghiệm thành công.");
        fetchList();
      }
    } catch (e) {
      alert("Lỗi kết nối!");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="xn-container animate-fadein">
        <div className="xn-header">
          <h1 className="xn-title">🧪 Quản lý Kết quả Xét nghiệm máu</h1>
          <p className="xn-subtitle">
            Bác sĩ cập nhật kết quả xét nghiệm virus truyền nhiễm (HIV, viêm gan
            B...) cho túi máu.
          </p>
        </div>

        {/* Banner cảnh báo số lượng túi máu cần xét nghiệm khẩn cấp */}
        {reTestRequests.length > 0 && (
          <div className="xn-alert-banner">
            <div className="xn-alert-left">
              <div className="xn-alert-icon animate-bounce">🚨</div>
              <div>
                <h4 className="xn-alert-title">
                  YÊU CẦU XÉT NGHIỆM MÁU KHẨN CẤP
                </h4>
                <p className="xn-alert-desc">
                  Hiện đang có <strong>{reTestRequests.length} túi máu</strong>{" "}
                  mới thu hoạch chưa được xét nghiệm lâm sàng. Vui lòng cập nhật
                  sớm!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="xn-table-card">
          {loading ? (
            <div className="xn-loading">
              Đang tải danh sách xét nghiệm kho máu...
            </div>
          ) : list.length === 0 ? (
            <div className="xn-empty">
              Chưa có túi máu nào chờ hoặc đã xét nghiệm.
            </div>
          ) : (
            <div className="xn-table-wrapper">
              <table className="xn-table">
                <thead>
                  <tr>
                    <th>Mã XN</th>
                    <th>Mã túi máu</th>
                    <th>Người hiến máu</th>
                    <th>Chiến dịch</th>
                    <th>Nhóm máu</th>
                    <th>Số lần test</th>
                    <th>Trạng thái kết quả</th>
                    <th>Ghi chú / Mô tả bệnh</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((xn) => {
                    const isPending =
                      xn.ketQua === null || xn.ketQua === undefined;
                    return (
                      <tr
                        key={xn.maKQ}
                        className={isPending ? "row-pending-test" : ""}
                      >
                        <td className="font-mono">
                          <strong>
                            {xn.maKQ.startsWith("CHUA_TEST_")
                              ? "Chưa có"
                              : xn.maKQ}
                          </strong>
                        </td>
                        <td className="font-mono text-primary">
                          <strong>{xn.maTuiMau}</strong>
                        </td>
                        <td>{xn.tenTinhNguyenVien}</td>
                        <td className="col-campaign">{xn.tenChienDich}</td>
                        <td>
                          {xn.nhomMau && xn.nhomMau !== "Chưa rõ" ? (
                            <span className="badge-blood-type">
                              {xn.nhomMau}
                            </span>
                          ) : (
                            <span className="text-muted">Chưa rõ</span>
                          )}
                        </td>
                        <td>{xn.soLanXetNghiem} lần</td>
                        <td>
                          {isPending ? (
                            <span className="tag-result pending">
                              🧪 Chờ xét nghiệm
                            </span>
                          ) : xn.ketQua ? (
                            <span className="tag-result success">
                              ✅ Đạt chuẩn
                            </span>
                          ) : (
                            <span className="tag-result danger">
                              ❌ Nhiễm bệnh (Hủy)
                            </span>
                          )}
                        </td>
                        <td className="col-desc">
                          {xn.moTa || "Chưa có ghi chú"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="actions-cell">
                            <button
                              onClick={() => {
                                setEditXN(xn);
                                setXnForm({
                                  nhomMau:
                                    xn.nhomMau === "Chưa rõ"
                                      ? "O+"
                                      : xn.nhomMau,
                                  soLanXetNghiem: String(xn.soLanXetNghiem),
                                  moTa:
                                    xn.moTa === "Chờ xét nghiệm lần đầu"
                                      ? ""
                                      : xn.moTa,
                                  ketQua:
                                    xn.ketQua === true
                                      ? "true"
                                      : xn.ketQua === false
                                        ? "false"
                                        : "",
                                });
                              }}
                              className="btn-action-edit"
                              title="Cập nhật kết quả"
                            >
                              ✏️
                            </button>
                            {!xn.maKQ.startsWith("CHUA_TEST_") && (
                              <button
                                onClick={() => handleDeleteXetNghiem(xn)}
                                className="btn-action-delete"
                                title="Xóa kết quả"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal nhập / sửa đổi kết quả xét nghiệm */}
        {editXN && (
          <div className="modal-backdrop" onClick={() => setEditXN(null)}>
            <div
              className="modal-card animate-fadein"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>🧪 Cập nhật kết quả xét nghiệm</h3>
                <p className="font-mono">Túi máu: {editXN.maTuiMau}</p>
              </div>

              <div className="modal-body">
                <div className="modal-form-group">
                  <label>Kết quả kiểm tra virus truyền nhiễm</label>
                  <div className="modal-radio-row">
                    <label className="modal-radio-label">
                      <input
                        type="radio"
                        name="modalKq"
                        value="true"
                        checked={xnForm.ketQua === "true"}
                        onChange={(e) =>
                          setXnForm((p) => ({ ...p, ketQua: e.target.value }))
                        }
                      />
                      Đạt chuẩn (An toàn)
                    </label>
                    <label className="modal-radio-label">
                      <input
                        type="radio"
                        name="modalKq"
                        value="false"
                        checked={xnForm.ketQua === "false"}
                        onChange={(e) =>
                          setXnForm((p) => ({ ...p, ketQua: e.target.value }))
                        }
                      />
                      Không đạt (Hủy bỏ túi máu)
                    </label>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label>Nhóm máu xác nhận</label>
                  <select
                    value={xnForm.nhomMau}
                    onChange={(e) =>
                      setXnForm((p) => ({ ...p, nhomMau: e.target.value }))
                    }
                  >
                    <option value="">-- Chọn nhóm máu --</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                      (nm) => (
                        <option key={nm} value={nm}>
                          {nm}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Số lần xét nghiệm kiểm chứng</label>
                  <input
                    type="number"
                    min="1"
                    value={xnForm.soLanXetNghiem}
                    onChange={(e) =>
                      setXnForm((p) => ({
                        ...p,
                        soLanXetNghiem: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="modal-form-group">
                  <label>Ghi chú bệnh lý (nếu có)</label>
                  <textarea
                    value={xnForm.moTa}
                    onChange={(e) =>
                      setXnForm((p) => ({ ...p, moTa: e.target.value }))
                    }
                    rows="3"
                    placeholder="Nhập ghi chú hoặc mô tả lý do không đạt..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setEditXN(null)}
                  className="btn-modal-cancel"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={xnSaving}
                  className="btn-modal-submit"
                >
                  {xnSaving ? "Đang lưu..." : "Lưu kết quả"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
