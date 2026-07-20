import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

const ROLE_LABELS = {
  AD: "Quáº£n trá»‹ viÃªn",
  BS: "BÃ¡c sÄ©",
  NVYT: "NhÃ¢n viÃªn Y táº¿",
  QLK: "Quáº£n lÃ½ kho",
  TNV: "TÃ¬nh nguyá»‡n viÃªn",
};

export default function QuanLyNguoiDung() {
  // 1. Khai bÃ¡o cÃ¡c State quáº£n lÃ½ dá»¯ liá»‡u
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", matKhau: "", maVaiTro: "" });

  // 2. HÃ m gá»i API táº£i danh sÃ¡ch tÃ i khoáº£n & vai trÃ² tá»« Backend
  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Gá»i API láº¥y danh sÃ¡ch tÃ i khoáº£n
      const resUsers = await fetch("https://localhost:7004/api/taikhoan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataUsers = await resUsers.json();

      // Gá»i API láº¥y danh sÃ¡ch vai trÃ² Ä‘á»ƒ phá»¥c vá»¥ Dropdown Form
      const resRoles = await fetch(
        "https://localhost:7004/api/taikhoan/vaitro",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dataRoles = await resRoles.json();

      if (resUsers.ok) setUsers(dataUsers);
      if (resRoles.ok) setRoles(dataRoles);
    } catch (err) {
      alert("âŒ Lá»—i táº£i dá»¯ liá»‡u tá»« server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tá»± Ä‘á»™ng táº£i dá»¯ liá»‡u khi vá»«a má»Ÿ trang
  useEffect(() => {
    loadData();
  }, []);

  // 3. HÃ m kÃ­ch hoáº¡t hoáº·c vÃ´ hiá»‡u hÃ³a tÃ i khoáº£n (API PATCH)
  const handleToggleStatus = async (user) => {
    const action = user.trangThai ? "vÃ´ hiá»‡u hÃ³a" : "kÃ­ch hoáº¡t";
    if (
      !window.confirm(`Báº¡n cÃ³ cháº¯c muá»‘n ${action} tÃ i khoáº£n ${user.email}?`)
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://localhost:7004/api/taikhoan/${user.maTaiKhoan}/trang-thai`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trangThai: !user.trangThai }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert("âœ… " + data.message);
        loadData(); // Táº£i láº¡i danh sÃ¡ch sau khi sá»­a thÃ nh cÃ´ng
      } else {
        alert("âŒ Lá»—i: " + data.message);
      }
    } catch (error) {
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n server!");
    }
  };

  // 4. HÃ m xÃ³a tÃ i khoáº£n ngÆ°á»i dÃ¹ng (API DELETE)
  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `HÃ nh Ä‘á»™ng xÃ³a khÃ´ng thá»ƒ khÃ´i phá»¥c. Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a tÃ i khoáº£n ${user.email}?`,
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://localhost:7004/api/taikhoan/${user.maTaiKhoan}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (response.ok) {
        alert("âœ… " + data.message);
        loadData(); // Táº£i láº¡i danh sÃ¡ch sau khi xÃ³a thÃ nh cÃ´ng
      } else {
        alert("âŒ Lá»—i: " + data.message);
      }
    } catch (error) {
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n server!");
    }
  };

  // 5. HÃ m xá»­ lÃ½ gá»­i form táº¡o tÃ i khoáº£n má»›i (API POST)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email || !form.matKhau || !form.maVaiTro) {
      alert("âš ï¸ Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ cÃ¡c thÃ´ng tin báº¯t buá»™c.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("https://localhost:7004/api/taikhoan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        alert("ðŸŽ‰ " + data.message);
        setShowModal(false); // ÄÃ³ng Modal
        setForm({ email: "", matKhau: "", maVaiTro: "" }); // Reset Form
        loadData(); // Táº£i láº¡i dá»¯ liá»‡u má»›i nháº¥t
      } else {
        alert("âŒ Lá»—i: " + data.message);
      }
    } catch (error) {
      alert("âŒ Lá»—i káº¿t ná»‘i Ä‘áº¿n server!");
    }
  };

  // 6. Xá»­ lÃ½ tÃ¬m kiáº¿m vÃ  lá»c dá»¯ liá»‡u trÃªn danh sÃ¡ch hiá»ƒn thá»‹
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.maTaiKhoan || "").toLowerCase().includes(q) ||
      (u.tenVaiTro || "").toLowerCase().includes(q);
    const matchRole = !filterRole || u.maVaiTro === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", margin: 0 }}>
      <Navbar />
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Pháº§n tiÃªu Ä‘á» trang */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div>
            <h2
              style={{
                color: "#af101a",
                fontWeight: "900",
                fontSize: "28px",
                margin: 0,
              }}
            >
              ðŸ‘¥ Quáº£n LÃ½ NgÆ°á»i DÃ¹ng
            </h2>
            <p
              style={{
                color: "#6c757d",
                margin: "5px 0 0 0",
                fontSize: "14px",
              }}
            >
              Quáº£n trá»‹ há»‡ thá»‘ng tÃ i khoáº£n vÃ  vai trÃ² cá»§a cÃ¡n bá»™ vÃ  tÃ¬nh nguyá»‡n
              viÃªn.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: "#af101a",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              fontWeight: "bold",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(175,16,26,0.2)",
            }}
          >
            âž• ThÃªm NgÆ°á»i DÃ¹ng
          </button>
        </div>

        {/* Bá»™ lá»c vÃ  TÃ¬m kiáº¿m nhanh */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            marginBottom: "20px",
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="TÃ¬m theo email, mÃ£ tÃ i khoáº£n..."
            style={{
              flex: 1,
              minWidth: "250px",
              padding: "10px 15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: "10px 15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fff",
              outline: "none",
            }}
          >
            <option value="">Táº¥t cáº£ vai trÃ²</option>
            {roles.map((r) => (
              <option key={r.maVaiTro} value={r.maVaiTro}>
                {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
              </option>
            ))}
          </select>
        </div>

        {/* Báº£ng hiá»ƒn thá»‹ danh sÃ¡ch ngÆ°á»i dÃ¹ng */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f1f3f5",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <th
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  MÃ£ tÃ i khoáº£n
                </th>
                <th
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  Vai trÃ²
                </th>
                <th
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  Tráº¡ng thÃ¡i
                </th>
                <th
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  Thao tÃ¡c
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#6c757d",
                    }}
                  >
                    Äang táº£i dá»¯ liá»‡u...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#6c757d",
                    }}
                  >
                    KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n nÃ o.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.maTaiKhoan}
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td
                      style={{
                        padding: "15px 20px",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        color: "#af101a",
                      }}
                    >
                      {user.maTaiKhoan}
                    </td>
                    <td
                      style={{
                        padding: "15px 20px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {user.email}
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            user.maVaiTro === "AD"
                              ? "#ffe3e3"
                              : user.maVaiTro === "BS"
                                ? "#e3faf2"
                                : "#e8f0fe",
                          color:
                            user.maVaiTro === "AD"
                              ? "#af101a"
                              : user.maVaiTro === "BS"
                                ? "#0ca678"
                                : "#1a73e8",
                        }}
                      >
                        {ROLE_LABELS[user.maVaiTro] ||
                          user.tenVaiTro ||
                          user.maVaiTro}
                      </span>
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: user.trangThai ? "#2b8a3e" : "#c92a2a",
                        }}
                      >
                        {user.trangThai ? "â— Äang hoáº¡t Ä‘á»™ng" : "â—‹ VÃ´ hiá»‡u hÃ³a"}
                      </span>
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        style={{
                          backgroundColor: "transparent",
                          border:
                            "1px solid " +
                            (user.trangThai ? "#e03131" : "#0ca678"),
                          color: user.trangThai ? "#e03131" : "#0ca678",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          marginRight: "10px",
                        }}
                      >
                        {user.trangThai ? "VÃ´ hiá»‡u hÃ³a" : "KÃ­ch hoáº¡t"}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #c92a2a",
                          color: "#c92a2a",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        XÃ³a
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal táº¡o tÃ i khoáº£n má»›i */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  backgroundColor: "#af101a",
                  color: "#fff",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, fontWeight: "900" }}>
                  âž• ThÃªm ngÆ°á»i dÃ¹ng má»›i
                </h3>
                <span
                  onClick={() => setShowModal(false)}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  âœ•
                </span>
              </div>
              <form
                onSubmit={handleCreate}
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#6c757d",
                      marginBottom: "5px",
                    }}
                  >
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="user@example.com"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#6c757d",
                      marginBottom: "5px",
                    }}
                  >
                    Máº¬T KHáº¨U *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.matKhau}
                    onChange={(e) =>
                      setForm({ ...form, matKhau: e.target.value })
                    }
                    placeholder="Tá»‘i thiá»ƒu 6 kÃ½ tá»±"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#6c757d",
                      marginBottom: "5px",
                    }}
                  >
                    VAI TRÃ’ *
                  </label>
                  <select
                    required
                    value={form.maVaiTro}
                    onChange={(e) =>
                      setForm({ ...form, maVaiTro: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">-- Chá»n vai trÃ² --</option>
                    {roles.map((r) => (
                      <option key={r.maVaiTro} value={r.maVaiTro}>
                        {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Há»§y
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#af101a",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    XÃ¡c nháº­n
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

