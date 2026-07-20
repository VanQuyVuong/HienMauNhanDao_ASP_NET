import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../css/AdminCreateCampaign.css";

export default function AdminCreateCampaign() {
  const navigate = useNavigate();
  const [diaDiems, setDiaDiems] = useState([]);

  // NÆ¡i chá»©a dá»¯ liá»‡u Admin gÃµ vÃ o
  const [formData, setFormData] = useState({
    tenChienDich: "",
    thoiGianBD: "",
    thoiGianKT: "",
    soLuongDuKien: 0,
    maDiaDiem: "",
    imageUrl: "",
  });

  useEffect(() => {
    // Vá»«a vÃ o trang lÃ  láº¥y danh sÃ¡ch Bá»‡nh viá»‡n/Äá»‹a Ä‘iá»ƒm ngay
    fetch("https://localhost:7004/api/diadiem")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDiaDiems(data.data);
          if (data.data.length > 0)
            setFormData((prev) => ({
              ...prev,
              maDiaDiem: data.data[0].maDiaDiem,
            })); // Chá»n sáºµn cÃ¡i Ä‘áº§u tiÃªn
        }
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://localhost:7004/api/chiendich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("ðŸŽ‰ " + data.message);
        navigate("/dashboard"); // Táº¡o xong tá»± Ä‘á»™ng bay ra trang chá»§ Ä‘á»ƒ ngáº¯m thÃ nh quáº£
      } else {
        alert("âŒ Lá»—i: " + data.message);
      }
    } catch (error) {
      alert("âŒ Lá»—i káº¿t ná»‘i!");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div className="create-container">
        <h2 className="create-title">âœ¨ Táº¡o Má»›i Chiáº¿n Dá»‹ch Hiáº¿n MÃ¡u</h2>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group full-width">
            <label>TÃªn chiáº¿n dá»‹ch</label>
            <input
              type="text"
              name="tenChienDich"
              value={formData.tenChienDich}
              onChange={handleChange}
              required
              placeholder="VÃ­ dá»¥: Giá»t mÃ¡u há»“ng ÄÃ  Náºµng 2026..."
            />
          </div>

          <div className="form-group">
            <label>Thá»i gian báº¯t Ä‘áº§u</label>
            <input
              type="datetime-local"
              name="thoiGianBD"
              value={formData.thoiGianBD}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Thá»i gian káº¿t thÃºc</label>
            <input
              type="datetime-local"
              name="thoiGianKT"
              value={formData.thoiGianKT}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Äá»‹a Ä‘iá»ƒm tá»• chá»©c</label>
            <select
              name="maDiaDiem"
              value={formData.maDiaDiem}
              onChange={handleChange}
              required
            >
              {diaDiems.map((dd) => (
                <option key={dd.maDiaDiem} value={dd.maDiaDiem}>
                  {dd.tenDiaDiem}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Má»¥c tiÃªu (ÄÆ¡n vá»‹ mÃ¡u)</label>
            <input
              type="number"
              name="soLuongDuKien"
              value={formData.soLuongDuKien}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group full-width">
            <label>Link hÃ¬nh áº£nh bÃ¬a (URL)</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <button type="submit" className="btn-submit">
            ðŸš€ Xuáº¥t báº£n Chiáº¿n dá»‹ch
          </button>
        </form>
      </div>
    </div>
  );
}

