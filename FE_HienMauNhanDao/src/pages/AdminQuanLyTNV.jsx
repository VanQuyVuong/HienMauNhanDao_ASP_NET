import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
export default function AdminQuanLyTNV() {
  const [volunteers, setVolunteers] = state([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterGender, setFilterGender] = useState("");
const loadVolunteers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try{
const response = await fetch("http://localhost:7004/api/tinhnguyenvien", {
    headers: {authorization: `Bearer ${token}`},});
    const data = await response.json();
    if(response.ok && data.success){
        setVolunteers(data.data || []);
    }else{
        alert("❌ Lỗi kết nối: " + err.message);
    }finally{
        setLoading(false);
    }
};
useEffect(() => {
    loadVolunteers();
},[]);

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
            <h2 style={{ color: "#af101a", fontWeight: "900", fontSize: "28px", margin: 0 }}>🩸 Quản Lý Tình Nguyện Viên</h2>
            <p style={{ color: "#6c757d", margin: "5px 0 0 0", fontSize: "14px" }}>
                Tra cứu danh sách, thông tin liên lạc và nhóm máu của các tình nguyện viên hiến máu.</p>


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
            placeholder="🔍 Tìm kiếm theo tên, CCCD, số điện thoại ...."
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
            <option value="">Tất cả nhóm máu</option>
            <option value="A">Nhóm A (A+)</option>
            <option value="B">Nhóm B (B+)</option>
            <option value="AB">Nhóm AB (AB+)</option>
            <option value="O">Nhóm O (O+)</option>
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
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nu">Nữ</option>
            <option value="Khac">Khác</option>
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
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Mã TNV</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Họ và tên</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>CCCD</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Số điện thoại</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Giới tính</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Nhóm máu</th>
                        <th style={{ padding: "15px 20px", fontWeight: "bold", color: "#495057" }}>Địa chỉ</th>                    
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                    <tr>
                        <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>Đang tải dữ liệu...</td>

                    </tr>
                    ): fillteredVolunteers.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}>Không tìm thấy tình nguyện viên nào.</td>
                        </tr>
                    ):(
                        fillteredVolunteers.map((v) => (
                             <tr key={vol.maTNV} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "15px 20px", fontFamily: "monospace", fontWeight: "bold", color: "#af101a" }}>{vol.maTNV}</td>
                    <td style={{ padding: "15px 20px", fontWeight: "bold", color: "#333" }}>{vol.hoTen}</td>
                    <td style={{ padding: "15px 20px", color: "#495057" }}>{vol.cccd}</td>
                    <td style={{ padding: "15px 20px", color: "#495057" }}>{vol.soDienThoai}</td>
                    <td style={{ padding: "15px 20px" }}>{vol.gioiTinh === "Nu" ? "Nữ" : vol.gioiTinh === "Khac" ? "Khác" : "Nam"}</td>
                    <td style={{ padding: "15px 20px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: "#ffe3e3",
                        color: "#af101a"
                      }}>
                        {vol.nhomMau || "Chưa rõ"}
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