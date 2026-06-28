import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDonDangKy from "./pages/AdminDonDangKy";
import AdminCreateCampaign from "./pages/AdminCreateCampaign"; // Phải import nó vào đây

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mặc định vào web sẽ chuyển hướng sang trang Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Các Route của tính năng Admin phải nằm TRONG NÀY */}
        <Route path="/admin-don" element={<AdminDonDangKy />} />
        <Route path="/admin-tao-cd" element={<AdminCreateCampaign />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
