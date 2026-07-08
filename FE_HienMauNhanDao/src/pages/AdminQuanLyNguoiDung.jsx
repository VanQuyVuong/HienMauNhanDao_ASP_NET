import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const ROLE_LABELS = {
  AD: "Quản trị viên",
  BS: "Bác sĩ",
  NVYT: "Nhân viên Y tế",
  QLK: "Quản lý kho",
  TNV: "Tình nguyện viên",
};

export default function AdminQuanLyNguoiDung() {
  // 1. Khai báo các State quản lý dữ liệu
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", matKhau: "", maVaiTro: "" });

  // 2. Hàm gọi API tải danh sách tài khoản & vai trò từ Backend
  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Gọi API lấy danh sách tài khoản
      const resUsers = await fetch("https://localhost:7004/api/taikhoan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataUsers = await resUsers.json();

      // Gọi API lấy danh sách vai trò để phục vụ Dropdown Form
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
      alert("❌ Lỗi tải dữ liệu từ server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải dữ liệu khi vừa mở trang
  useEffect(() => {
    loadData();
  }, []);

  // 3. Hàm kích hoạt hoặc vô hiệu hóa tài khoản (API PATCH)
  const handleToggleStatus = async (user) => {
    const action = user.trangThai ? "vô hiệu hóa" : "kích hoạt";
    if (
      !window.confirm(`Bạn có chắc muốn ${action} tài khoản ${user.email}?`)
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
        alert("✅ " + data.message);
        loadData(); // Tải lại danh sách sau khi sửa thành công
      } else {
        alert("❌ Lỗi: " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến server!");
    }
  };

  // 4. Hàm xóa tài khoản người dùng (API DELETE)
  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Hành động xóa không thể khôi phục. Bạn có chắc muốn xóa tài khoản ${user.email}?`,
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
        alert("✅ " + data.message);
        loadData(); // Tải lại danh sách sau khi xóa thành công
      } else {
        alert("❌ Lỗi: " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến server!");
    }
  };

  // 5. Hàm xử lý gửi form tạo tài khoản mới (API POST)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email || !form.matKhau || !form.maVaiTro) {
      alert("⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc.");
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
        alert("🎉 " + data.message);
        setShowModal(false); // Đóng Modal
        setForm({ email: "", matKhau: "", maVaiTro: "" }); // Reset Form
        loadData(); // Tải lại dữ liệu mới nhất
      } else {
        alert("❌ Lỗi: " + data.message);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến server!");
    }
  };

  // 6. Xử lý tìm kiếm và lọc dữ liệu trên danh sách hiển thị
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
        {/* Phần tiêu đề trang */}
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
              👥 Quản Lý Người Dùng
            </h2>
            <p
              style={{
                color: "#6c757d",
                margin: "5px 0 0 0",
                fontSize: "14px",
              }}
            >
              Quản trị hệ thống tài khoản và vai trò của cán bộ và tình nguyện
              viên.
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
            ➕ Thêm Người Dùng
          </button>
        </div>

        {/* Bộ lọc và Tìm kiếm nhanh */}
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
            placeholder="Tìm theo email, mã tài khoản..."
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
            <option value="">Tất cả vai trò</option>
            {roles.map((r) => (
              <option key={r.maVaiTro} value={r.maVaiTro}>
                {ROLE_LABELS[r.maVaiTro] || r.tenVaiTro}
              </option>
            ))}
          </select>
        </div>

        {/* Bảng hiển thị danh sách người dùng */}
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
                  Mã tài khoản
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
                  Vai trò
                </th>
                <th
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  Trạng thái
                </th>
                <th
                  style={{
                    padding: "15px 20px",
                    fontWeight: "bold",
                    color: "#495057",
                  }}
                >
                  Thao tác
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
                    Đang tải dữ liệu...
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
                    Không tìm thấy tài khoản nào.
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
                        {user.trangThai ? "● Đang hoạt động" : "○ Vô hiệu hóa"}
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
                        {user.trangThai ? "Vô hiệu hóa" : "Kích hoạt"}
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
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal tạo tài khoản mới */}
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
                  ➕ Thêm người dùng mới
                </h3>
                <span
                  onClick={() => setShowModal(false)}
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  ✕
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
                    MẬT KHẨU *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.matKhau}
                    onChange={(e) =>
                      setForm({ ...form, matKhau: e.target.value })
                    }
                    placeholder="Tối thiểu 6 ký tự"
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
                    VAI TRÒ *
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
                    <option value="">-- Chọn vai trò --</option>
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
                    Hủy
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
                    Xác nhận
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
