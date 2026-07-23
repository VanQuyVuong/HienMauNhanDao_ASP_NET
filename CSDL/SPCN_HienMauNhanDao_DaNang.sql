-- =============================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ HIẾN MÁU NHÂN ĐẠO ĐÀ NẴNG
-- Phiên bản: SẠCH - Chỉ cấu trúc + dữ liệu thiết yếu
-- Mật khẩu tài khoản: Bạn tự tạo qua Scalar/Postman
-- Nhóm: Văn Quý Vương - Phạm Minh Huy - Lê Việt Hưng - Lê Văn Mạnh
-- Cập nhật: 2026-07-23
-- =============================================================

DROP DATABASE IF EXISTS SPCN_HienMauNhanDao_DaNang;
CREATE DATABASE SPCN_HienMauNhanDao_DaNang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE SPCN_HienMauNhanDao_DaNang;

-- =============================================================
-- BƯỚC 1: TẠO CẤU TRÚC BẢNG (CREATE TABLES)
-- =============================================================

CREATE TABLE VAITRO (
    maVaiTro VARCHAR(10) PRIMARY KEY,
    tenVaiTro VARCHAR(50) NOT NULL
);

CREATE TABLE PHUONGXA (
    maPhuongXa VARCHAR(10) PRIMARY KEY,
    tenPhuongXa VARCHAR(100) NOT NULL
);

CREATE TABLE DIADIEM (
    maDiaDiem VARCHAR(10) PRIMARY KEY,
    tenDiaDiem VARCHAR(150) NOT NULL,
    diaChiChiTiet VARCHAR(255) NOT NULL,
    maPhuongXa VARCHAR(10),
    loaiDiaDiem VARCHAR(50)
    -- Giá trị hợp lệ: BenhVien, TrungTamYTe, TruongHoc, CoQuan, DiaDiemCoDinh
);

CREATE TABLE KHOACONGTAC (
    maKhoa VARCHAR(10) PRIMARY KEY,
    tenKhoa VARCHAR(100) NOT NULL
);

CREATE TABLE TAIKHOAN (
    maTaiKhoan VARCHAR(10) PRIMARY KEY,
    maVaiTro VARCHAR(10),
    email VARCHAR(100) NOT NULL,
    matKhau VARCHAR(255) NOT NULL,
    trangThai BOOLEAN DEFAULT TRUE
);

CREATE TABLE NHANVIEN (
    maNhanVien VARCHAR(10) PRIMARY KEY,
    maTaiKhoan VARCHAR(10),
    maKhoa VARCHAR(10),
    maDiaDiem VARCHAR(10),
    hoTen VARCHAR(100) NOT NULL,
    CCCD VARCHAR(12) NOT NULL,
    gioiTinh VARCHAR(10),
    soDienThoai VARCHAR(10) NOT NULL
);

CREATE TABLE TINHNGUYENVIEN (
    maTNV VARCHAR(10) PRIMARY KEY,
    maTaiKhoan VARCHAR(10),
    maPhuongXa VARCHAR(10),
    hoTen VARCHAR(100) NOT NULL,
    CCCD VARCHAR(12) NOT NULL,
    ngaySinh DATE NOT NULL,
    gioiTinh VARCHAR(10),
    soDienThoai VARCHAR(10) NOT NULL,
    nhomMau VARCHAR(50),
    -- Giá trị hợp lệ: A_positive, A_negative, B_positive, B_negative,
    --                 AB_positive, AB_negative, O_positive, O_negative
    diaChi VARCHAR(255),
    maNhanVien VARCHAR(10) DEFAULT NULL,
    trangThai BOOLEAN DEFAULT TRUE
);

CREATE TABLE CHIENDICHHIENMAU (
    maChienDich VARCHAR(10) PRIMARY KEY,
    maDiaDiem VARCHAR(10),
    maNhanVien VARCHAR(10),
    tenChienDich VARCHAR(255) NOT NULL,
    thoiGianBD DATETIME NOT NULL,
    thoiGianKT DATETIME NOT NULL,
    soLuongDuKien INT,
    trangThai VARCHAR(50) NOT NULL,
    -- Giá trị hợp lệ: ChuaBatDau, DangDienRa, DaKetThuc, DaHuy
    maQR VARCHAR(255),
    imageUrl VARCHAR(255)
);

CREATE TABLE DONDANGKY (
    maDon VARCHAR(10) PRIMARY KEY,
    maTNV VARCHAR(10) NULL,
    maChienDich VARCHAR(10),
    maNhanVien VARCHAR(10) DEFAULT NULL,
    maQR VARCHAR(255),
    thoiGianDangKy DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50) NOT NULL,
    -- Giá trị hợp lệ: DaDangKy, ChuaHien, DaHien, DaNhanChungNhan, Huy
    theTich INT
);

CREATE TABLE HOSOSUCKHOE (
    maHoSo VARCHAR(10) PRIMARY KEY,
    maDon VARCHAR(10),
    khangSinh BOOLEAN DEFAULT FALSE,
    truyenNhiem BOOLEAN DEFAULT FALSE,
    dauHong BOOLEAN DEFAULT FALSE,
    coThai BOOLEAN DEFAULT FALSE,
    moTaKhac VARCHAR(255) CHARACTER SET utf8mb4,
    maNhanVien VARCHAR(10) DEFAULT NULL
);

CREATE TABLE KETQUALAMSANG (
    maKQ VARCHAR(10) PRIMARY KEY,
    maDon VARCHAR(10),
    maNhanVien VARCHAR(10),
    huyetAp VARCHAR(20),
    nhipTim INT,
    canNang DOUBLE,
    nhietDo DOUBLE,
    ketQua BOOLEAN,
    lyDoTuChoi VARCHAR(255)
);

CREATE TABLE KHOMAU (
    maKho VARCHAR(10) PRIMARY KEY,
    tenKho VARCHAR(50),
    nhomMau VARCHAR(50),
    soLuongTon INT DEFAULT 0,
    nguongAnToan INT DEFAULT 1000,
    moTa VARCHAR(255)
);

CREATE TABLE TUIMAU (
    maTuiMau VARCHAR(15) PRIMARY KEY,
    -- VARCHAR(15) vì C# sinh mã: "TM" + timestamp 13 ký tự = 15 ký tự
    maDon VARCHAR(10),
    maNhanVien VARCHAR(10),
    maKho VARCHAR(10),
    theTich INT,
    thoiGianLayMau DATETIME,
    trangThai VARCHAR(50) NOT NULL,
    -- Giá trị hợp lệ: ChoXetNghiem, DaLuuKho, DaXuatKho, DaHuy, YeuCauNhapKho
    nhietDoVanChuyen DOUBLE
);

CREATE TABLE KETQUAXETNGHIEM (
    maKQ VARCHAR(10) PRIMARY KEY,
    maTuiMau VARCHAR(15),
    maNhanVien VARCHAR(10),
    nhomMau VARCHAR(50),
    soLanXetNghiem INT,
    ketQua BOOLEAN,
    moTa VARCHAR(255)
);

CREATE TABLE PHIEUNHAPXUAT (
    maPhieu VARCHAR(10) PRIMARY KEY,
    maNhanVien VARCHAR(10),
    loaiPhieu VARCHAR(50) NOT NULL,
    -- Giá trị hợp lệ: Nhap, Xuat
    ngayNhapXuat DATE
);

CREATE TABLE CHITIETNHAPXUAT (
    maPhieu VARCHAR(10),
    maTuiMau VARCHAR(15),
    PRIMARY KEY (maPhieu, maTuiMau)
);

CREATE TABLE CHUNGNHAN (
    maChungNhan VARCHAR(10) PRIMARY KEY,
    maDon VARCHAR(10),
    maNhanVien VARCHAR(10),
    filePDF VARCHAR(255),
    ngayCap DATE
);

CREATE TABLE TINTUC (
    maTinTuc VARCHAR(10) PRIMARY KEY,
    maNhanVien VARCHAR(10),
    tieuDe VARCHAR(255) NOT NULL,
    noiDung TEXT,
    hinhAnh VARCHAR(255),
    ngayDang DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50)
    -- Giá trị hợp lệ: NhapLieu, DanDang, DaAn
);

CREATE TABLE THONGBAO (
    maThongBao VARCHAR(10) PRIMARY KEY,
    maTaiKhoanGui VARCHAR(10),
    maTaiKhoanNhan VARCHAR(10),
    noiDung TEXT,
    thoiGianGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50)
    -- Giá trị hợp lệ: ChuaDoc, DaDoc
);

CREATE TABLE TINNHAN (
    maTinNhan VARCHAR(10) PRIMARY KEY,
    maTaiKhoanGui VARCHAR(10),
    maTaiKhoanNhan VARCHAR(10),
    noiDung TEXT,
    thoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai BOOLEAN DEFAULT FALSE
);

-- Bảng lưu JWT Token đã bị thu hồi (dùng cho chức năng Đăng xuất)
CREATE TABLE INVALIDATED_TOKEN (
    id VARCHAR(512) PRIMARY KEY,
    expiry_time DATETIME NOT NULL
);

-- =============================================================
-- BƯỚC 2: THIẾT LẬP KHÓA NGOẠI (FOREIGN KEYS)
-- =============================================================
ALTER TABLE DIADIEM          ADD FOREIGN KEY (maPhuongXa)      REFERENCES PHUONGXA(maPhuongXa);
ALTER TABLE TAIKHOAN         ADD FOREIGN KEY (maVaiTro)         REFERENCES VAITRO(maVaiTro);
ALTER TABLE NHANVIEN         ADD FOREIGN KEY (maTaiKhoan)       REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE NHANVIEN         ADD FOREIGN KEY (maKhoa)           REFERENCES KHOACONGTAC(maKhoa);
ALTER TABLE NHANVIEN         ADD FOREIGN KEY (maDiaDiem)        REFERENCES DIADIEM(maDiaDiem);
ALTER TABLE TINHNGUYENVIEN   ADD FOREIGN KEY (maTaiKhoan)       REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE TINHNGUYENVIEN   ADD FOREIGN KEY (maPhuongXa)       REFERENCES PHUONGXA(maPhuongXa);
ALTER TABLE TINHNGUYENVIEN   ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE CHIENDICHHIENMAU ADD FOREIGN KEY (maDiaDiem)        REFERENCES DIADIEM(maDiaDiem);
ALTER TABLE CHIENDICHHIENMAU ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE DONDANGKY        ADD FOREIGN KEY (maTNV)            REFERENCES TINHNGUYENVIEN(maTNV);
ALTER TABLE DONDANGKY        ADD FOREIGN KEY (maChienDich)      REFERENCES CHIENDICHHIENMAU(maChienDich);
ALTER TABLE DONDANGKY        ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE HOSOSUCKHOE      ADD FOREIGN KEY (maDon)            REFERENCES DONDANGKY(maDon);
ALTER TABLE HOSOSUCKHOE      ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE TUIMAU           ADD FOREIGN KEY (maDon)            REFERENCES DONDANGKY(maDon);
ALTER TABLE TUIMAU           ADD FOREIGN KEY (maKho)            REFERENCES KHOMAU(maKho);
ALTER TABLE TUIMAU           ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE KETQUALAMSANG    ADD FOREIGN KEY (maDon)            REFERENCES DONDANGKY(maDon);
ALTER TABLE KETQUALAMSANG    ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE KETQUAXETNGHIEM  ADD FOREIGN KEY (maTuiMau)         REFERENCES TUIMAU(maTuiMau);
ALTER TABLE KETQUAXETNGHIEM  ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE PHIEUNHAPXUAT    ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE CHITIETNHAPXUAT  ADD FOREIGN KEY (maPhieu)          REFERENCES PHIEUNHAPXUAT(maPhieu);
ALTER TABLE CHITIETNHAPXUAT  ADD FOREIGN KEY (maTuiMau)         REFERENCES TUIMAU(maTuiMau);
ALTER TABLE CHUNGNHAN        ADD FOREIGN KEY (maDon)            REFERENCES DONDANGKY(maDon);
ALTER TABLE CHUNGNHAN        ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE TINTUC           ADD FOREIGN KEY (maNhanVien)       REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE THONGBAO         ADD FOREIGN KEY (maTaiKhoanGui)    REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE THONGBAO         ADD FOREIGN KEY (maTaiKhoanNhan)   REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE TINNHAN          ADD FOREIGN KEY (maTaiKhoanGui)    REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE TINNHAN          ADD FOREIGN KEY (maTaiKhoanNhan)   REFERENCES TAIKHOAN(maTaiKhoan);

-- =============================================================
-- BƯỚC 3: DỮ LIỆU THIẾT YẾU (Danh mục nền - không bao gồm tài khoản)
-- =============================================================

-- 3.1 VAI TRÒ
INSERT INTO VAITRO VALUES
('AD',   'Quản trị hệ thống'),
('BS',   'Bác sĩ chuyên khoa'),
('NVYT', 'Nhân viên y tế'),
('QLK',  'Quản lý kho máu'),
('TNV',  'Tình nguyện viên');

-- 3.2 PHƯỜNG XÃ (TP. Đà Nẵng)
INSERT INTO PHUONGXA VALUES
('PX00001', 'Phường Thạch Thang, Hải Châu'),
('PX00002', 'Phường Hải Châu I, Hải Châu'),
('PX00003', 'Phường Hải Châu II, Hải Châu'),
('PX00004', 'Phường Thuận Phước, Hải Châu'),
('PX00005', 'Phường Thanh Bình, Hải Châu'),
('PX00006', 'Phường Hòa Khánh Bắc, Liên Chiểu'),
('PX00007', 'Phường Hòa Minh, Liên Chiểu'),
('PX00008', 'Phường Hòa Khánh Nam, Liên Chiểu'),
('PX00009', 'Phường Khuê Mỹ, Ngũ Hành Sơn'),
('PX00010', 'Phường Mỹ An, Ngũ Hành Sơn'),
('PX00011', 'Phường Vĩnh Trung, Thanh Khê'),
('PX00012', 'Phường Thạc Gián, Thanh Khê'),
('PX00013', 'Phường An Hải Bắc, Sơn Trà'),
('PX00014', 'Phường Mỹ Khê, Sơn Trà'),
('PX00015', 'Phường Hòa Xuân, Cẩm Lệ');

-- 3.3 ĐỊA ĐIỂM TIẾP NHẬN MÁU
INSERT INTO DIADIEM VALUES
('DD00001', 'Bệnh viện Đà Nẵng',                   '124 Hải Phòng, Hải Châu',         'PX00001', 'BenhVien'),
('DD00002', 'Bệnh viện C Đà Nẵng',                  '122 Hải Phòng, Hải Châu',         'PX00001', 'BenhVien'),
('DD00003', 'Bệnh viện Ung Bướu Đà Nẵng',           'Hoàng Trung Thông, Hải Châu',     'PX00007', 'BenhVien'),
('DD00004', 'Bệnh viện Phụ Sản - Nhi Đà Nẵng',      '402 Lê Văn Hiến, Ngũ Hành Sơn',  'PX00009', 'BenhVien'),
('DD00005', 'Hội Chữ Thập Đỏ TP. Đà Nẵng',         '522 Ông Ích Khiêm, Hải Châu',     'PX00003', 'DiaDiemCoDinh'),
('DD00006', 'Trường Đại học Sư phạm Kỹ thuật (UTE)','48 Cao Thắng, Hải Châu',          'PX00001', 'TruongHoc'),
('DD00007', 'Trường Đại học Đông Á',                '33 Xô Viết Nghệ Tĩnh, Hải Châu', 'PX00002', 'TruongHoc'),
('DD00008', 'Khoa Huyết học - Truyền máu (BV Đà Nẵng)', '103 Quang Trung, Hải Châu',  'PX00001', 'BenhVien');

-- 3.4 KHOA CÔNG TÁC
INSERT INTO KHOACONGTAC VALUES
('KC00001', 'Khoa Huyết học - BV Đà Nẵng'),
('KC00002', 'Khoa Khám bệnh - BV Đà Nẵng'),
('KC00003', 'Khoa Xét nghiệm - BV Đà Nẵng'),
('KC00004', 'Khoa Huyết học - BV C Đà Nẵng'),
('KC00005', 'Khoa Cấp cứu - BV Phụ sản Nhi'),
('KC00006', 'Phòng Hành chính - Quản trị');

-- 3.5 KHO MÁU - 8 nhóm máu (tồn kho = 0, chờ hiến thực tế)
INSERT INTO KHOMAU VALUES
('K_1', 'Kho máu A+',  'A_positive',  0, 50, 'Tủ lạnh chuyên dụng - Tầng 1'),
('K_2', 'Kho máu B+',  'B_positive',  0, 50, 'Tủ lạnh chuyên dụng - Tầng 1'),
('K_3', 'Kho máu AB+', 'AB_positive', 0, 20, 'Tủ lạnh chuyên dụng - Tầng 2'),
('K_4', 'Kho máu O+',  'O_positive',  0, 80, 'Tủ lạnh chuyên dụng - Tầng 1'),
('K_5', 'Kho máu A-',  'A_negative',  0, 10, 'Tủ đông hiếm - Phòng bảo quản đặc biệt'),
('K_6', 'Kho máu B-',  'B_negative',  0, 10, 'Tủ đông hiếm - Phòng bảo quản đặc biệt'),
('K_7', 'Kho máu AB-', 'AB_negative', 0,  5, 'Tủ đông hiếm - Phòng bảo quản đặc biệt'),
('K_8', 'Kho máu O-',  'O_negative',  0, 20, 'Tủ đông hiếm - Phòng bảo quản đặc biệt');

-- =============================================================
-- ✅ XONG! DATABASE SẠCH - SẴN SÀNG ĐỂ TẠO TÀI KHOẢN QUA SCALAR
--
-- ═══════════════════════════════════════════════════════════════
-- HƯỚNG DẪN TẠO TÀI KHOẢN BẰNG SCALAR (THAY THẾ POSTMAN)
-- ═══════════════════════════════════════════════════════════════
--
-- BƯỚC 1: Chạy C# Backend lên
--   Nhấn F5 hoặc Ctrl+F5 trong Visual Studio
--
-- BƯỚC 2: Mở Scalar trong trình duyệt
--   https://localhost:7004/scalar/v1
--
-- BƯỚC 3: Tìm endpoint "POST /api/auth/register"
--   Nhập body:
--   {
--     "email": "admin@gmail.com",
--     "matKhau": "Abc123!@#"
--   }
--   Bấm "Send" → Tài khoản được tạo với BCrypt hash tự động
--
-- BƯỚC 4: Lấy mã hash trong MySQL Workbench
--   SELECT maTaiKhoan, email, matKhau FROM TAIKHOAN WHERE email = 'admin@gmail.com';
--   Copy chuỗi hash ($2a$10$...) và gửi cho agent để INSERT vào SQL này
--
-- BƯỚC 5: Nâng quyền tài khoản
--   UPDATE TAIKHOAN SET maVaiTro = 'AD' WHERE email = 'admin@gmail.com';
--
-- BƯỚC 6: Thêm hồ sơ Nhân viên (nếu là NVYT/BS/QLK)
--   INSERT INTO NHANVIEN VALUES (
--     'NV00001',
--     (SELECT maTaiKhoan FROM TAIKHOAN WHERE email = 'admin@gmail.com'),
--     'KC00006', 'DD00001',
--     'Tên Nhân Viên', '000000000000', 'Nam', '0900000000'
--   );
--
-- ═══════════════════════════════════════════════════════════════
-- GHI CHÚ BCrypt
-- ═══════════════════════════════════════════════════════════════
-- BCrypt là mã hóa 1 chiều - không giải mã ngược được.
-- Mỗi lần hash cùng 1 mật khẩu sẽ ra chuỗi KHÁC NHAU,
-- nhưng BCrypt.Verify("Abc123!@#", hash) luôn trả về TRUE.
-- =============================================================
