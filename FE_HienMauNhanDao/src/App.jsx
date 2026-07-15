import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDonDangKy from "./pages/AdminDonDangKy";
import AdminCreateCampaign from "./pages/AdminCreateCampaign"; // Phải import nó vào đây
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKhoMau from "./pages/AdminKhoMau";
import KetQuaXetNghiem from "./pages/KetQuaXetNghiem";
import QuanLyNhapKho from "./pages/QuanLyNhapKho";
import AdminQuanLyNguoiDung from "./pages/AdminQuanLyNguoiDung";
import AdminQuanLyTNV from "./pages/AdminQuanLyTNV";
import NhanYeuCauNhapKho from "./pages/NhanYeuCauNhapKho";
import QuanLyNhapKhoTheoChienDich from "./pages/QuanLyNhapKhoTheoChienDich";
import OtpVerification from "./pages/OtpVerification";
import XacNhanDangKy from "./pages/XacNhanDangKy";
import QuanLyChienDich from "./pages/QuanLyChienDich";
import QuanLyNhapKhoQuetMa from "./pages/QuanLyNhapKhoQuetMa";
import ThongKeTonKho from "./pages/ThongKeTonKho";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mặc định vào web sẽ chuyển hướng sang trang Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OtpVerification />} />
        <Route path="/xac-nhan-dang-ky/:maDon" element={<XacNhanDangKy />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Các Route của tính năng Admin phải nằm TRONG NÀY */}
        <Route path="/admin-don" element={<AdminDonDangKy />} />
        <Route path="/admin-tao-cd" element={<AdminCreateCampaign />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin-thong-ke" element={<AdminDashboard />} />
        <Route path="/admin-kho-mau" element={<AdminKhoMau />} />
        <Route path="/admin-xet-nghiem" element={<KetQuaXetNghiem />} />
        <Route path="/admin-nhap-kho" element={<QuanLyNhapKho />} />
        <Route path="/admin-users" element={<AdminQuanLyNguoiDung />} />
        <Route path="/admin-volunteers" element={<AdminQuanLyTNV />} />
        <Route path="/qlk-nhan-yeu-cau" element={<NhanYeuCauNhapKho />} />
        <Route
          path="/qlk-nhap-theo-chien-dich"
          element={<QuanLyNhapKhoTheoChienDich />}
        />
      </Routes>
      <Route path="/admin-quan-ly-chien-dich" element={<QuanLyChienDich />} />
      <Route path="/admin-nhap-kho-quet-ma" element={<QuanLyNhapKhoQuetMa />} />
      <Route path="/admin-thong-ke-ton-kho" element={<ThongKeTonKho />} />
    </BrowserRouter>
  );
}

export default App;
