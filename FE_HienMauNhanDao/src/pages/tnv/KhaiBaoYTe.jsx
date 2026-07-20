import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/KhaiBaoYTe.css";

export default function KhaiBaoYTe() {
  const { maDon } = useParams();
  const navigate = useNavigate();
  const [donData, setDonData] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [answers, setAnswers] = useState({
    q1: false, // Má»‡t má»i, sá»‘t
    q2: false, // DÃ¹ng khÃ¡ng sinh
    q3: false, // Bá»‡nh truyá»n nhiá»…m
    q4: false, // Thai sáº£n (ná»¯)
  });
  const [moTaKhac, setMoTaKhac] = useState("");
  const [camDoan, setCamDoan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Táº£i thÃ´ng tin Ä‘Æ¡n hiáº¿n mÃ¡u Ä‘á»ƒ hiá»ƒn thá»‹ tÃ³m táº¯t á»Ÿ cá»™t trÃ¡i
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
          alert("âŒ KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin Ä‘Æ¡n Ä‘Äƒng kÃ½!");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Lá»—i láº¥y thÃ´ng tin Ä‘Æ¡n:", error);
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
        "âš ï¸ Báº¡n pháº£i tÃ­ch xÃ¡c nháº­n cam Ä‘oan thÃ´ng tin khai bÃ¡o lÃ  sá»± tháº­t!",
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
        alert("âœ… Khai bÃ¡o y táº¿ thÃ nh cÃ´ng! ÄÆ¡n cá»§a báº¡n Ä‘ang chá» phÃª duyá»‡t.");
        navigate('/xac-nhan-dang-ky/' + maDon);
      } else {
        alert("âŒ Lá»—i: " + resJson.message);
      }
    } catch (error) {
      console.error(error);
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n mÃ¡y chá»§.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInfo)
    return (
      <div className="loading-screen">Äang táº£i thÃ´ng tin Ä‘Æ¡n Ä‘Äƒng kÃ½...</div>
    );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="kb-container">
        <div className="kb-layout">
          {/* Cá»™t trÃ¡i: TÃ³m táº¯t thÃ´ng tin Ä‘Æ¡n Ä‘Äƒng kÃ½ */}
          <div className="kb-info-card">
            <h3 className="kb-info-title">ðŸ“ LÆ°á»£t hiáº¿n mÃ¡u Ä‘Äƒng kÃ½</h3>
            <div className="kb-info-content">
              <p>
                <strong>MÃ£ ÄÆ¡n:</strong>{" "}
                <span className="text-green font-mono">{maDon}</span>
              </p>
              <p>
                <strong>NgÆ°á»i Ä‘Äƒng kÃ½:</strong>{" "}
                {donData?.tinhNguyenVien?.hoVaTen}
              </p>
              <p>
                <strong>Chiáº¿n dá»‹ch:</strong> {donData?.chienDich?.tenChienDich}
              </p>
              <p>
                <strong>Äá»‹a Ä‘iá»ƒm:</strong>{" "}
                {donData?.chienDich?.diaDiem?.tenDiaDiem}
              </p>
              <p>
                <strong>Thá»i gian hiáº¿n:</strong>{" "}
                {donData?.chienDich?.thoiGianBD
                  ? new Date(donData.chienDich.thoiGianBD).toLocaleString(
                      "vi-VN",
                    )
                  : "N/A"}
              </p>
            </div>
            <div className="kb-tip-box">
              <h5>ðŸ’¡ LÆ°u Ã½ trÆ°á»›c ngÃ y hiáº¿n:</h5>
              <ul>
                <li>Ngá»§ Ä‘á»§ giáº¥c (Ã­t nháº¥t 6 tiáº¿ng).</li>
                <li>KhÃ´ng dÃ¹ng rÆ°á»£u bia trong 24 giá» qua.</li>
                <li>Ä‚n nháº¹, trÃ¡nh Ä‘á»“ má»¡ trÆ°á»›c khi Ä‘i hiáº¿n.</li>
              </ul>
            </div>
          </div>

          {/* Cá»™t pháº£i: Phiáº¿u khai bÃ¡o y táº¿ */}
          <div className="kb-form-card">
            <div className="kb-form-header">
              <h2>ðŸ“‹ Phiáº¿u Khai BÃ¡o Sá»©c Khá»e Y Táº¿</h2>
              <p>
                Vui lÃ²ng tráº£ lá»i trung thá»±c cÃ¡c cÃ¢u há»i dÆ°á»›i Ä‘Ã¢y Ä‘á»ƒ bÃ¡c sÄ© sÃ ng
                lá»c an toÃ n.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="kb-form">
              <div className="kb-questions-list">
                {/* CÃ¢u há»i 1 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    1. Báº¡n cÃ³ Ä‘ang cáº£m tháº¥y má»‡t má»i, sá»‘t hoáº·c Ä‘au há»ng khÃ´ng?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q1", true)}
                      className={`btn-yesno ${answers.q1 ? "active" : ""}`}
                    >
                      CÃ³
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q1", false)}
                      className={`btn-yesno ${!answers.q1 ? "active" : ""}`}
                    >
                      KhÃ´ng
                    </button>
                  </div>
                </div>

                {/* CÃ¢u há»i 2 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    2. Báº¡n cÃ³ Ä‘ang dÃ¹ng thuá»‘c khÃ¡ng sinh hay Ä‘iá»u trá»‹ bá»‡nh nÃ o
                    khÃ´ng?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q2", true)}
                      className={`btn-yesno ${answers.q2 ? "active" : ""}`}
                    >
                      CÃ³
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q2", false)}
                      className={`btn-yesno ${!answers.q2 ? "active" : ""}`}
                    >
                      KhÃ´ng
                    </button>
                  </div>
                </div>

                {/* CÃ¢u há»i 3 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    3. Trong 6 thÃ¡ng qua, báº¡n cÃ³ máº¯c bá»‡nh truyá»n nhiá»…m hay pháº«u
                    thuáº­t khÃ´ng?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q3", true)}
                      className={`btn-yesno ${answers.q3 ? "active" : ""}`}
                    >
                      CÃ³
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q3", false)}
                      className={`btn-yesno ${!answers.q3 ? "active" : ""}`}
                    >
                      KhÃ´ng
                    </button>
                  </div>
                </div>

                {/* CÃ¢u há»i 4 */}
                <div className="kb-q-row">
                  <div className="kb-q-text">
                    4. Äá»‘i vá»›i ná»¯: Báº¡n cÃ³ Ä‘ang mang thai hoáº·c cho con bÃº khÃ´ng?
                  </div>
                  <div className="kb-q-buttons">
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q4", true)}
                      className={`btn-yesno ${answers.q4 ? "active" : ""}`}
                    >
                      CÃ³
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer("q4", false)}
                      className={`btn-yesno ${!answers.q4 ? "active" : ""}`}
                    >
                      KhÃ´ng
                    </button>
                  </div>
                </div>
              </div>

              {/* Nháº­p mÃ´ táº£ khÃ¡c */}
              <div className="kb-textarea-group">
                <label>MÃ´ táº£ khÃ¡c (Náº¿u cÃ³ bá»‡nh ná»n hoáº·c lÆ°u Ã½ Ä‘áº·c biá»‡t):</label>
                <textarea
                  value={moTaKhac}
                  onChange={(e) => setMoTaKhac(e.target.value)}
                  placeholder="Ghi chÃº thÃªm vá» sá»©c khá»e cá»§a báº¡n táº¡i Ä‘Ã¢y..."
                  rows="3"
                />
              </div>

              {/* Há»™p cam Ä‘oan */}
              <div className="kb-confirm-box">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={camDoan}
                    onChange={(e) => setCamDoan(e.target.checked)}
                  />
                  <span>
                    TÃ´i xin cam Ä‘oan cÃ¡c thÃ´ng tin khai bÃ¡o trÃªn hoÃ n toÃ n Ä‘Ãºng
                    sá»± tháº­t vÃ  chá»‹u trÃ¡ch nhiá»‡m trÆ°á»›c phÃ¡p luáº­t.
                  </span>
                </label>
              </div>

              <div className="kb-submit-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-kb-submit"
                >
                  {submitting ? "Äang xá»­ lÃ½..." : "XÃC NHáº¬N HOÃ€N Táº¤T ÄÄ‚NG KÃ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

