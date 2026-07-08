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
      const resRoles = await fetch("https://localhost:7004/api/taikhoan/vaitro", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${user.email}?`)) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://localhost:7004/api/taikhoan/${user.maTaiKhoan}/trang-thai`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trangThai: !user.trangThai }),
      });
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
    if (!window.confirm(`Hành động xóa không thể khôi phục. Bạn có chắc muốn xóa tài khoản ${user.email}?`)) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://localhost:7004/api/taikhoan/${user.maTaiKhoan}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
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
