import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import "../../css/AdminCreateCampaign.css";

export default function HoSoCaNhan() {
  const [formData, setFormData] = useState({
    hoTen: "",
    cccd: "",
    ngaySinh: "",
    soDienThoai: "",
    diaChi: "",
    gioiTinh: "Nam",
    nhomMau: "A",
    maPhuongXa: "",
  });

  const [phuongXaList, setPhuongXaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          "https://localhost:7004/api/tinhnguyenvien/me",
          {
            // LÆ°u Ã½: DÃ¹ng dáº¥u huyá»n ` (backtick) Ä‘á»ƒ nhÃ©t biáº¿n token vÃ o chuá»—i
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();

        if (data.success && data.data) {
          setFormData({
            hoTen: data.data.hoTen || "",
            cccd: data.data.cccd || "",
            ngaySinh: data.data.ngaySinh
              ? data.data.ngaySinh.split("T")[0]
              : "",
            soDienThoai: data.data.soDienThoai || "",
            diaChi: data.data.diaChi || "",
            gioiTinh:
              data.data.gioiTinh === 1
                ? "Nu"
                : data.data.gioiTinh === 2
                  ? "Khac"
                  : "Nam",
            nhomMau:
              data.data.nhomMau !== null ? data.data.nhomMau.toString() : "0",
            maPhuongXa: data.data.maPhuongXa || "",
          });
        }
      } catch (error) {
        console.error("Lá»—i:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const taiPhuongXa = async () => {
      try {
        const response = await fetch("https://localhost:7004/api/phuongxa");
        if (response.ok) {
          const json = await response.json();
          setPhuongXaList(json.data);
        }
      } catch (error) {
        console.error("Lá»—i:", error);
      }
    };
    taiPhuongXa();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // XÃ¡c thá»±c Ä‘á»‹nh dáº¡ng SÄT (10 sá»‘, báº¯t Ä‘áº§u báº±ng 0)
    const regexSoDienThoai = /^0\d{9}$/;
    if (!regexSoDienThoai.test(formData.soDienThoai)) {
      alert("âŒ Sá»‘ Ä‘iá»‡n thoáº¡i pháº£i gá»“m Ä‘Ãºng 10 sá»‘ vÃ  báº¯t Ä‘áº§u báº±ng sá»‘ 0!");
      return;
    }

    // XÃ¡c thá»±c Ä‘á»‹nh dáº¡ng CCCD (12 sá»‘)
    const regexCccd = /^\d{12}$/;
    if (!regexCccd.test(formData.cccd)) {
      alert("âŒ Sá»‘ CCCD pháº£i gá»“m Ä‘Ãºng 12 sá»‘!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://localhost:7004/api/tinhnguyenvien/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();
      if (response.ok) alert("ðŸŽ‰ " + data.message);
      else alert("âŒ Lá»—i: " + data.message);
    } catch (error) {
      alert("âŒ Lá»—i káº¿t ná»‘i!");
    }
  };

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Äang táº£i dá»¯ liá»‡u...
      </div>
    );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="create-container">
        <h2 className="create-title">ðŸ‘¤ Cáº­p nháº­t Há»“ SÆ¡ CÃ¡ NhÃ¢n</h2>
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group full-width">
            <label>Há» vÃ  TÃªn (ÄÃºng nhÆ° trÃªn CCCD)</label>
            <input
              type="text"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              required
              placeholder="VÃ­ dá»¥: Nguyá»…n VÄƒn A"
            />
          </div>
          <div className="form-group">
            <label>Sá»‘ CCCD</label>
            <input
              type="text"
              name="cccd"
              value={formData.cccd}
              onChange={handleChange}
              required
              maxLength="12"
            />
          </div>
          <div className="form-group">
            <label>NgÃ y Sinh</label>
            <input
              type="date"
              name="ngaySinh"
              value={formData.ngaySinh}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Giá»›i TÃ­nh</label>
            <select
              name="gioiTinh"
              value={formData.gioiTinh}
              onChange={handleChange}
            >
              <option value="Nam">Nam</option>
              <option value="Nu">Ná»¯</option>
              <option value="Khac">KhÃ¡c</option>
            </select>
          </div>
          <div className="form-group">
            <label>NhÃ³m MÃ¡u</label>
            <select
              name="nhomMau"
              value={formData.nhomMau}
              onChange={handleChange}
            >
              <option value="0">A+ (A_positive)</option>
              <option value="1">A- (A_negative)</option>
              <option value="2">B+ (B_positive)</option>
              <option value="3">B- (B_negative)</option>
              <option value="4">AB+ (AB_positive)</option>
              <option value="5">AB- (AB_negative)</option>
              <option value="6">O+ (O_positive)</option>
              <option value="7">O- (O_negative)</option>
            </select>
          </div>

          <div className="form-group">
            <label>PhÆ°á»ng / XÃ£</label>
            <select
              name="maPhuongXa"
              value={formData.maPhuongXa}
              onChange={handleChange}
              required
            >
              <option value="">-- Chá»n PhÆ°á»ng / XÃ£ --</option>
              {phuongXaList.map((px) => (
                <option key={px.maPhuongXa} value={px.maPhuongXa}>
                  {px.tenPhuongXa}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sá»‘ Ä‘iá»‡n thoáº¡i</label>
            <input
              type="text"
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleChange}
              required
              maxLength="10"
            />
          </div>
          <div className="form-group full-width">
            <label>Äá»‹a chá»‰ liÃªn há»‡</label>
            <input
              type="text"
              name="diaChi"
              value={formData.diaChi}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-submit">
            ðŸ’¾ LÆ°u há»“ sÆ¡
          </button>
        </form>
      </div>
    </div>
  );
}

