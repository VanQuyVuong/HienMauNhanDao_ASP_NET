import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDonDangKy from "./pages/AdminDonDangKy";
import AdminCreateCampaign from "./pages/AdminCreateCampaign";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKhoMau from "./pages/AdminKhoMau";
import AdminChungNhan from "./pages/AdminChungNhan";
import GiayChungNhan from "./pages/GiayChungNhan";
import AdminKhaiBaoYTe from "./pages/AdminKhaiBaoYTe";
import KhaiBaoYTe from "./pages/KhaiBaoYTe";
import QuanLyHanDung from "./pages/QuanLyHanDung";
import KhamLamSang from "./pages/KhamLamSang";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Các Route của tính năng Admin */}
        <Route path="/admin-don" element={<AdminDonDangKy />} />
        <Route path="/admin-tao-cd" element={<AdminCreateCampaign />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin-thong-ke" element={<AdminDashboard />} />
        <Route path="/admin-kho-mau" element={<AdminKhoMau />} />
        <Route path="/admin-chung-nhan" element={<AdminChungNhan />} />

        <Route path="/chung-nhan/:maDon" element={<GiayChungNhan />} />

        <Route path="/khai-bao-y-te/:maDon" element={<KhaiBaoYTe />} />
        <Route path="/admin-ho-so-yte" element={<AdminKhaiBaoYTe />} />
        <Route path="/admin-han-dung" element={<QuanLyHanDung />} />
        <Route path="/admin-kham-sang-loc" element={<KhamLamSang />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
