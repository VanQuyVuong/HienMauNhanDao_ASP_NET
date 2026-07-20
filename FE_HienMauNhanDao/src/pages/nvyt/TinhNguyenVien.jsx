import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
export default function TinhNguyenVien() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterGender, setFilterGender] = useState("");

  const loadVolunteers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("https://localhost:7004/api/tinhnguyenvien", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVolunteers(data.data || []);
      } else {
        alert("âŒ Lá»—i táº£i dá»¯ liá»‡u: " + (data.message || "KhÃ´ng xÃ¡c Ä‘á»‹nh"));
      }
    } catch (err) {
      alert("âŒ Lá»—i káº¿t ná»‘i: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, []);

const fillteredVolunteers = volunteers.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = 
    !q ||
    (v.hoTen ||"").toLowerCase().includes(q) ||
    (v.cccd||"").toLowerCase().includes(q) ||
    (v.soDienThoai||"").toLowerCase().includes(q) ||
    (v.maTNV ||"").toLowerCase().includes(q);

    const matchBlood = !filterBlood || v.nhomMau === filterBlood;
    const matchGender = !filterGender || v.gioiTinh === filterGender;
    

    return matchSearch && matchBlood && matchGender;
});

return (<div style={{backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0}}>
    <Navbar />
    <div style={{ maxWidth :"1200px", margin: "0 auto", padding: "40px 20px", fontFamily: " sans-serif"}}>
        <div style={{marginBottom: "30px"}}>
            <h2 style={{ color: "#af101a", fontWeight: "900", fontSize: "28px", margin: 0 }}>ðŸ©¸ Quáº£n LÃ½ TÃ¬nh Nguyá»‡n ViÃªn</h2>
            <p style={{ color: "#6c757d", margin: "5px 0 0 0", fontSize: "14px" }}>
                Tra cá»©u danh sÃ¡ch, thÃ´ng tin liÃªn láº¡c vÃ  nhÃ³m mÃ¡u cá»§a cÃ¡c tÃ¬nh nguyá»‡n viÃªn hiáº¿n mÃ¡u.</p>


        </div>
        <div style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap"
        }} >
            <input
            type = "text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ðŸ” TÃ¬m kiáº¿m theo tÃªn, CCCD, sá»‘ Ä‘iá»‡n thoáº¡i ...."
            style={{
                flex: "1",
                minWidth: "250px",
                padding: "10px 15px",
                boder : "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
            }}
            />
            <select
            value={filterBlood}
            onChange={(e) => setFilterBlood(e.target.value)}
            style={{
                padding: "10px 15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fff",
              outline: "none"
            }}>
            <option value="">Táº¥t cáº£ nhÃ³m mÃ¡u</option>
            <option value="A">NhÃ³m A (A+)</option>
            <option value="B">NhÃ³m B (B+)</option>
            <option value="AB">NhÃ³m AB (AB+)</option>
            <option value="O">NhÃ³m O (O+)</option>
            </select>
            <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            style={{
              padding: "10px 15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fff",
              outline: "none"
            }}>
            <option value="">Táº¥t cáº£ giá»›i tÃ­nh</option>
            <option value="Nam">Nam</option>
            <option value="Nu">Ná»¯</option>
            <option value="Khac">KhÃ¡c</option>
            </select>
        </div>
        <div style = {{
             backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          overflow: "hidden"
        }}>
            <table style={{width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px"}}>
                <thead>
                    <tr style={{ backgroundColor: "#f1f3f5", borderBottom: "2px solid #dee2e6" }} >
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>MÃ£ TNV</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Há» vÃ  tÃªn</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>CCCD</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Sá»‘ Ä‘iá»‡n thoáº¡i</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Giá»›i tÃ­nh</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>NhÃ³m mÃ¡u</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Äá»‹a chá»‰</th>                    
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                    <tr>
                        <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>Äang táº£i dá»¯ liá»‡u...</td>

                    </tr>
                    ): fillteredVolunteers.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>KhÃ´ng tÃ¬m tháº¥y tÃ¬nh nguyá»‡n viÃªn nÃ o.</td>
                        </tr>
                    ):(
                        fillteredVolunteers.map((v) => (
                             <tr key={vol.maTNV} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "15px 20px", fontFamily: "monospace", fontWeight: "bold", color: "#af101a" }}>{vol.maTNV}</td>
                    <td style={{ padding: "15px 20px", fontWeight: "bold", color: "#333" }}>{vol.hoTen}</td>
                    <td style={{ padding: "15px 20px", color: "#495057" }}>{vol.cccd}</td>
                    <td style={{ padding: "15px 20px", color: "#495057" }}>{vol.soDienThoai}</td>
                    <td style={{ padding: "15px 20px" }}>{vol.gioiTinh === "Nu" ? "Ná»¯" : vol.gioiTinh === "Khac" ? "KhÃ¡c" : "Nam"}</td>
                    <td style={{ padding: "15px 20px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: "#ffe3e3",
                        color: "#af101a"
                      }}>
                        {vol.nhomMau || "ChÆ°a rÃµ"}
                      </span>
                    </td>
                    <td style={{ padding: "15px 20px", color: "#6c757d" }}>{vol.diaChi}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
