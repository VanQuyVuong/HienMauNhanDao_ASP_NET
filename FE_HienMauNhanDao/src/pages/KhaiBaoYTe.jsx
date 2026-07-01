import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/KhaiBaoYTe.css";

export default function KhaiBaoYTe() {
  const { maDon } = useParams();
  const navigate = useNavigate();
  const [donData, setDonData] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [answers, setAnswers] = useState({
    q1: false, // Mệt mỏi, sốt
    q2: false, // Dùng kháng sinh
    q3: false, // Bệnh truyền nhiễm
    q4: false, // Thai sản (nữ)
  });
  const [moTaKhac, setMoTaKhac] = useState("");
  const [camDoan, setCamDoan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tải thông tin đơn hiến máu để hiển thị tóm tắt ở cột trái
  useEffect(() => {
    const fetchDonInfo = async () => {
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
          setDonData(json.data);
        } else {
          alert("❌ Không tìm thấy thông tin đơn đăng ký!");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin đơn:", error);
      } finally {
        setLoadingInfo(false);
      }
    };
    if (maDon) fetchDonInfo();
  }, [maDon, navigate]);

  const handleToggleAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!camDoan) {
      alert(
        "⚠️ Bạn phải tích xác nhận cam đoan thông tin khai báo là sự thật!",
      );
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://localhost:7004/api/hososuckhoe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maDon: maDon,
          khangSinh: answers.q2,
          truyenNhiem: answers.q3,
          dauHong: answers.q1,
          coThai: answers.q4,
          moTaKhac: moTaKhac,
        }),
      });

      const resJson = await response.json();
      if (response.ok) {
        alert("✅ Khai báo y tế thành công! Đơn của bạn đang chờ phê duyệt.");
        navigate("/lich-su"); // Chuyển về trang lịch sử
      } else {
        alert("❌ Lỗi: " + resJson.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInfo)
    return (
      <div className="loading-screen">Đang tải thông tin đơn đăng ký...</div>
    );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="kb-container">
        <div className="kb-layout">
          {/* Cột trái: Tóm tắt thông tin đơn đăng ký */}
          <div className="kb-info-card">
            <h3 className="kb-info-title">📍 Lượt hiến máu đăng ký</h3>
            <div className="kb-info-content">
              <p>
                <strong>Mã Đơn:</strong>{" "}
                <span className="text-green font-mono">{maDon}</span>
              </p>
              <p>
                <strong>Người đăng ký:</strong>{" "}
                {donData?.tinhNguyenVien?.hoVaTen}
              </p>
              <p>
                <strong>Chiến dịch:</strong> {donData?.chienDich?.tenChienDich}
              </p>
              <p>
                <strong>Địa điểm:</strong>{" "}
                {donData?.chienDich?.diaDiem?.tenDiaDiem}
              </p>
              <p>
                <strong>Thời gian hiến:</strong>{" "}
                {donData?.chienDich?.thoiGianBD
                  ? new Date(donData.chienDich.thoiGianBD).toLocaleString(
                      "vi-VN",
                    )
                  : "N/A"}
              </p>
            </div>
            <div className="kb-tip-box">
              <h5>💡 Lưu ý trước ngày hiến:</h5>
              <ul>
                <li>Ngủ đủ giấc (ít nhất 6 tiếng).</li>
                <li>Không dùng rượu bia trong 24 giờ qua.</li>
                <li>Ăn nhẹ, tránh đồ mỡ trước khi đi hiến.</li>
              </ul>
            </div>
          </div>

          {/* Cột phải: Phiếu khai báo y tế */}
          <div className="kb-form-card">
            <div className="kb-form-header">
              <h2>📋 Phiếu Khai Báo Sức Khỏe Y Tế</h2>
              <p>
                Vui lòng trả lời trung thực các câu hỏi dưới đây để bác sĩ sàng
                lọc an toàn.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="kb-form">
              <div className="kb-questions-list">
                {/* Câu hỏi 1 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    1. Bạn có đang cảm thấy mệt mỏi, sốt hoặc đau họng không?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q1", true)}
                      className={`btn-yesno ${answers.q1 ? "active" : ""}`}
                    >
                      Có
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q1", false)}
                      className={`btn-yesno ${!answers.q1 ? "active" : ""}`}
                    >
                      Không
                    </button>
                  </div>
                </div>

                {/* Câu hỏi 2 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    2. Bạn có đang dùng thuốc kháng sinh hay điều trị bệnh nào
                    không?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q2", true)}
                      className={`btn-yesno ${answers.q2 ? "active" : ""}`}
                    >
                      Có
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q2", false)}
                      className={`btn-yesno ${!answers.q2 ? "active" : ""}`}
                    >
                      Không
                    </button>
                  </div>
                </div>

                {/* Câu hỏi 3 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    3. Trong 6 tháng qua, bạn có mắc bệnh truyền nhiễm hay phẫu
                    thuật không?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q3", true)}
                      className={`btn-yesno ${answers.q3 ? "active" : ""}`}
                    >
                      Có
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q3", false)}
                      className={`btn-yesno ${!answers.q3 ? "active" : ""}`}
                    >
                      Không
                    </button>
                  </div>
                </div>

                {/* Câu hỏi 4 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    4. Đối với nữ: Bạn có đang mang thai hoặc cho con bú không?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q4", true)}
                      className={`btn-yesno ${answers.q4 ? "active" : ""}`}
                    >
                      Có
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q4", false)}
                      className={`btn-yesno ${!answers.q4 ? "active" : ""}`}
                    >
                      Không
                    </button>
                  </div>
                </div>
              </div>

              {/* Nhập mô tả khác */}
              <div className="kb-textarea-group">
                <label>Mô tả khác (Nếu có bệnh nền hoặc lưu ý đặc biệt):</label>
                <textarea
                  value={moTaKhac}
                  onChange={(e) => setMoTaKhac(e.target.value)}
                  placeholder="Ghi chú thêm về sức khỏe của bạn tại đây..."
                  rows="3"
                />
              </div>

              {/* Hộp cam đoan */}
              <div className="kb-confirm-box">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={camDoan}
                    onChange={(e) => setCamDoan(e.target.checked)}
                  />
                  <span>
                    Tôi xin cam đoan các thông tin khai báo trên hoàn toàn đúng
                    sự thật và chịu trách nhiệm trước pháp luật.
                  </span>
                </label>
              </div>

              <div className="kb-submit-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-kb-submit"
                >
                  {submitting ? "Đang xử lý..." : "XÁC NHẬN HOÀN TẤT ĐĂNG KÝ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
