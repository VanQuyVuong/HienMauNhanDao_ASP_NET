import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login"; // Tí nữa mình sẽ code file này
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mặc định vào web sẽ chuyển hướng sang trang Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Đường dẫn cho trang đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Sau này mình sẽ thêm trang Đăng ký ở đây */}
        {/* <Route path="/register" element={<Register />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
