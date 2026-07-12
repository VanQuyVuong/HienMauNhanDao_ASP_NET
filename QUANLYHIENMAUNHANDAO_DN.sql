-- =============================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ HIẾN MÁU NHÂN ĐẠO ĐÀ NẴNG
-- Phiên bản: SẠCH - Không có tài khoản sẵn
-- Người dùng tự đăng ký từ đầu để học cách hoạt động của BCrypt
-- Cập nhật: 2026-06-30
-- =============================================================

DROP DATABASE IF EXISTS QuanLyHienMauNhanDaoTPDN;
CREATE DATABASE QuanLyHienMauNhanDaoTPDN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyHienMauNhanDaoTPDN;

-- -------------------------------------------------------------
-- BƯỚC 1: TẠO BẢNG
-- -------------------------------------------------------------

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
    -- Giá trị Enum: BenhVien, TrungTamYTe, TruongHoc, CoQuan, DiaDiemCoDinh
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
    -- Giá trị Enum: A_positive, A_negative, B_positive, B_negative,
    --               AB_positive, AB_negative, O_positive, O_negative
    diaChi VARCHAR(255),
    maNhanVien VARCHAR(10) DEFAULT NULL,
    trangThai BOOLEAN DEFAULT TRUE  -- Khớp với C# entity: TinhNguyenVien.TrangThai
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
    -- Giá trị Enum: ChuaBatDau, DangDienRa, DaKetThuc, DaHuy
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
    -- Giá trị Enum: ChoDuyet, DaDuyet, DaTuChoi, DaHoanThanh
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
    -- Giá trị Enum: DaLuuKho, DaXuatKho, DaHuy
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
    -- Giá trị Enum: Nhap, Xuat
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
    -- Giá trị Enum: NhapLieu, DanDang, DaAn
);

CREATE TABLE THONGBAO (
    maThongBao VARCHAR(10) PRIMARY KEY,
    maTaiKhoanGui VARCHAR(10),
    maTaiKhoanNhan VARCHAR(10),
    noiDung TEXT,
    thoiGianGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50)
    -- Giá trị Enum: ChuaDoc, DaDoc
);

CREATE TABLE TINNHAN (
    maTinNhan VARCHAR(10) PRIMARY KEY,
    maTaiKhoanGui VARCHAR(10),
    maTaiKhoanNhan VARCHAR(10),
    noiDung TEXT,
    thoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai BOOLEAN DEFAULT FALSE
);

-- Bảng lưu JWT Token đã bị thu hồi (dùng cho Logout)
CREATE TABLE INVALIDATED_TOKEN (
    id VARCHAR(512) PRIMARY KEY,
    expiry_time DATETIME NOT NULL
);

-- -------------------------------------------------------------
-- BƯỚC 2: THIẾT LẬP KHÓA NGOẠI
-- -------------------------------------------------------------
ALTER TABLE DIADIEM ADD FOREIGN KEY (maPhuongXa) REFERENCES PHUONGXA(maPhuongXa);
ALTER TABLE TAIKHOAN ADD FOREIGN KEY (maVaiTro) REFERENCES VAITRO(maVaiTro);
ALTER TABLE NHANVIEN ADD FOREIGN KEY (maTaiKhoan) REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE NHANVIEN ADD FOREIGN KEY (maKhoa) REFERENCES KHOACONGTAC(maKhoa);
ALTER TABLE NHANVIEN ADD FOREIGN KEY (maDiaDiem) REFERENCES DIADIEM(maDiaDiem);
ALTER TABLE TINHNGUYENVIEN ADD FOREIGN KEY (maTaiKhoan) REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE TINHNGUYENVIEN ADD FOREIGN KEY (maPhuongXa) REFERENCES PHUONGXA(maPhuongXa);
ALTER TABLE TINHNGUYENVIEN ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE CHIENDICHHIENMAU ADD FOREIGN KEY (maDiaDiem) REFERENCES DIADIEM(maDiaDiem);
ALTER TABLE CHIENDICHHIENMAU ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE DONDANGKY ADD FOREIGN KEY (maTNV) REFERENCES TINHNGUYENVIEN(maTNV);
ALTER TABLE DONDANGKY ADD FOREIGN KEY (maChienDich) REFERENCES CHIENDICHHIENMAU(maChienDich);
ALTER TABLE DONDANGKY ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE HOSOSUCKHOE ADD FOREIGN KEY (maDon) REFERENCES DONDANGKY(maDon);
ALTER TABLE HOSOSUCKHOE ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE TUIMAU ADD FOREIGN KEY (maDon) REFERENCES DONDANGKY(maDon);
ALTER TABLE TUIMAU ADD FOREIGN KEY (maKho) REFERENCES KHOMAU(maKho);
ALTER TABLE TUIMAU ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE KETQUALAMSANG ADD FOREIGN KEY (maDon) REFERENCES DONDANGKY(maDon);
ALTER TABLE KETQUALAMSANG ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE KETQUAXETNGHIEM ADD FOREIGN KEY (maTuiMau) REFERENCES TUIMAU(maTuiMau);
ALTER TABLE KETQUAXETNGHIEM ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE PHIEUNHAPXUAT ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE CHITIETNHAPXUAT ADD FOREIGN KEY (maPhieu) REFERENCES PHIEUNHAPXUAT(maPhieu);
ALTER TABLE CHITIETNHAPXUAT ADD FOREIGN KEY (maTuiMau) REFERENCES TUIMAU(maTuiMau);
ALTER TABLE CHUNGNHAN ADD FOREIGN KEY (maDon) REFERENCES DONDANGKY(maDon);
ALTER TABLE CHUNGNHAN ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE TINTUC ADD FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien);
ALTER TABLE THONGBAO ADD FOREIGN KEY (maTaiKhoanGui) REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE THONGBAO ADD FOREIGN KEY (maTaiKhoanNhan) REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE TINNHAN ADD FOREIGN KEY (maTaiKhoanGui) REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE TINNHAN ADD FOREIGN KEY (maTaiKhoanNhan) REFERENCES TAIKHOAN(maTaiKhoan);

-- =============================================================
-- BƯỚC 3: DỮ LIỆU NỀN (Không có tài khoản - Bạn tự đăng ký!)
-- =============================================================

-- 3.1 VAI TRÒ
INSERT INTO VAITRO VALUES
('AD',   'Quản trị hệ thống'),
('NVYT', 'Nhân viên y tế'),
('TNV',  'Tình nguyện viên');

-- 3.2 PHƯỜNG XÃ
INSERT INTO PHUONGXA VALUES
('PX00001', 'Phường Thạch Thang, Hải Châu'),
('PX00002', 'Phường Hòa Cường Bắc, Hải Châu'),
('PX00003', 'Phường Mỹ An, Ngũ Hành Sơn'),
('PX00004', 'Phường Hòa Minh, Liên Chiểu');

-- 3.3 ĐỊA ĐIỂM
INSERT INTO DIADIEM VALUES
('DD00001', 'Bệnh viện Đà Nẵng',            '124 Hải Phòng, Hải Châu',        'PX00001', 'BenhVien'),
('DD00002', 'Bệnh viện C Đà Nẵng',           '122 Hải Phòng, Hải Châu',        'PX00001', 'BenhVien'),
('DD00003', 'Trung tâm Y tế Ngũ Hành Sơn',   '231 Trần Đại Nghĩa',             'PX00003', 'TrungTamYTe'),
('DD00004', 'Trường Đại học UTE Đà Nẵng',    '48 Cao Thắng, Hải Châu',         'PX00002', 'TruongHoc'),
('DD00005', 'Trường Đại học Đông Á',          '33 Xô Viết Nghệ Tĩnh, Hải Châu', 'PX00002', 'TruongHoc');

-- 3.4 KHOA CÔNG TÁC
INSERT INTO KHOACONGTAC VALUES
('KC00001', 'Khoa Huyết học - BV Đà Nẵng'),
('KC00002', 'Khoa Xét nghiệm - BV Đà Nẵng'),
('KC00003', 'Khoa Nội - BV C Đà Nẵng'),
('KC00004', 'Phòng Hành chính - Quản trị');

-- 3.5 CHIẾN DỊCH (maNhanVien = NULL vì chưa có NVYT, sẽ cập nhật sau)
INSERT INTO CHIENDICHHIENMAU
    (maChienDich, maDiaDiem, maNhanVien, tenChienDich, thoiGianBD, thoiGianKT, soLuongDuKien, trangThai, maQR, imageUrl)
VALUES
('CD00001', 'DD00004', NULL, 'Lễ hội Xuân Hồng UTE 2026',          '2026-02-10 07:00', '2026-02-12 17:00', 500, 'DaKetThuc',  'QR_XH26', 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600'),
('CD00002', 'DD00005', NULL, 'Chủ Nhật Đỏ - Đại học Đông Á 2026',  '2026-03-15 07:00', '2026-03-15 11:30', 300, 'DaKetThuc',  'QR_CN26', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=600'),
('CD00003', 'DD00001', NULL, 'Hiến Máu Thường Xuyên Tháng 7/2026', '2026-07-01 07:00', '2026-07-31 17:00', 200, 'DangDienRa', 'QR_TX26', 'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?q=80&w=600'),
('CD00004', 'DD00001', NULL, 'Ngày Hiến Máu Nhân Đạo T8/2026',     '2026-08-15 07:00', '2026-08-15 17:00', 400, 'ChuaBatDau', 'QR_T826', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=600'),
('CD00005', 'DD00003', NULL, 'Chiến Dịch Hè Xanh - Ngũ Hành Sơn', '2026-08-01 07:00', '2026-08-03 17:00', 150, 'ChuaBatDau', 'QR_HX26', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=600');

-- 3.6 KHO MÁU - 8 nhóm máu, tồn kho = 0 (chờ hiến máu thực tế)
INSERT INTO KHOMAU VALUES
('K_1', 'Kho máu A+',  'A_positive',  0, 1000, 'Nhóm máu A Rh dương'),
('K_2', 'Kho máu B+',  'B_positive',  0, 1000, 'Nhóm máu B Rh dương'),
('K_3', 'Kho máu AB+', 'AB_positive', 0, 1000, 'Nhóm máu AB Rh dương - hiếm'),
('K_4', 'Kho máu O+',  'O_positive',  0, 1000, 'Nhóm máu O Rh dương - phổ biến nhất'),
('K_5', 'Kho máu A-',  'A_negative',  0,  500, 'Nhóm máu A Rh âm - hiếm'),
('K_6', 'Kho máu B-',  'B_negative',  0,  500, 'Nhóm máu B Rh âm - hiếm'),
('K_7', 'Kho máu AB-', 'AB_negative', 0,  500, 'Nhóm máu AB Rh âm - cực hiếm'),
('K_8', 'Kho máu O-',  'O_negative',  0,  500, 'Nhóm máu O Rh âm - cho được tất cả');

-- 3.7 TÀI KHOẢN NỘI BỘ (Mật khẩu mặc định là '123' - C# tự động băm khi đăng nhập lần đầu)
INSERT INTO TAIKHOAN VALUES 
('TK00001', 'BS',   'lequoctuan.bs@bvdn.vn',    '123', 1), 
('TK00002', 'BS',   'phamhongngoc.bs@bvdn.vn',  '123', 1), 
('TK00003', 'NVYT', 'nguyenthilan.sl@bvdn.vn',  '123', 1),
('TK00004', 'NVYT', 'trinhdieuthuy.sl@bvdn.vn', '123', 1), 
('TK00005', 'NVYT', 'dolanphuong.sl@bvc.vn',    '123', 1), 
('TK00006', 'NVYT', 'dangvanmanh.lm@bvdn.vn',   '123', 1), 
('TK00007', 'NVYT', 'levanhoang.lm@bvdn.vn',    '123', 1), 
('TK00008', 'NVYT', 'vubaoquynh.lm@bvc.vn',     '123', 1), 
('TK00009', 'NVYT', 'hoangthihuy.xn@bvdn.vn',    '123', 1),
('TK00010', 'NVYT', 'nguyentuyetmai.xn@bvdn.vn', '123', 1), 
('TK00011', 'NVYT', 'trandinhnam.xn@bvub.vn',    '123', 1), 
('TK00012', 'QLK',  'tranminhhung.kho@bvdn.vn',  '123', 1),
('TK00013', 'QLK',  'lamtandat.kho@bvc.vn',      '123', 1), 
('TK00014', 'AD',   'admin.system@redcross.dn.vn','123', 1), 
('TK00015', 'BS',   'vunhatminh.bs@bvc.vn',      '123', 1);

-- 3.8 NHÂN VIÊN Y TẾ / BÁC SĨ / THỦ KHO TƯƠNG ỨNG
INSERT INTO NHANVIEN VALUES 
('NV00001', 'TK00001', 'KC00001', 'DD00001', 'Lê Quốc Tuấn',       '048075000001', 'Nam', '0905111222'),
('NV00002', 'TK00002', 'KC00001', 'DD00001', 'Phạm Hồng Ngọc',     '048075000002', 'Nữ',  '0905111333'),
('NV00003', 'TK00003', 'KC00001', 'DD00001', 'Nguyễn Thị Lan',     '048075000003', 'Nữ',  '0905111444'),
('NV00004', 'TK00004', 'KC00001', 'DD00001', 'Trịnh Diệu Thúy',    '048075000004', 'Nữ',  '0905111555'),
('NV00005', 'TK00005', 'KC00001', 'DD00002', 'Đỗ Lan Phương',      '048075000005', 'Nữ',  '0905111666'),
('NV00006', 'TK00006', 'KC00001', 'DD00001', 'Đặng Văn Mạnh',      '048075000006', 'Nam', '0905111777'),
('NV00007', 'TK00007', 'KC00001', 'DD00001', 'Lê Văn Hoàng',       '048075000007', 'Nam', '0905111888'),
('NV00008', 'TK00008', 'KC00001', 'DD00002', 'Vũ Bảo Quỳnh',       '048075000008', 'Nữ',  '0905111999'),
('NV00009', 'TK00009', 'KC00001', 'DD00001', 'Hoàng Thị Huy',       '048075000009', 'Nữ',  '0905222111'),
('NV00010', 'TK00010', 'KC00001', 'DD00001', 'Nguyễn Tuyết Mai',   '048075000010', 'Nữ',  '0905222222'),
('NV00011', 'TK00011', 'KC00001', 'DD00003', 'Trần Đình Nam',      '048075000011', 'Nam', '0905222333'),
('NV00012', 'TK00012', 'KC00001', 'DD00001', 'Trần Minh Hưng',     '048075000012', 'Nam', '0905222444'),
('NV00013', 'TK00013', 'KC00001', 'DD00002', 'Lâm Tấn Đạt',        '048075000013', 'Nam', '0905222555'),
('NV00014', 'TK00014', 'KC00004', 'DD00001', 'Hệ Thống Admin',     '048075000014', 'Nam', '0905333333'),
('NV00015', 'TK00015', 'KC00001', 'DD00002', 'Vũ Nhật Minh',       '048075000015', 'Nam', '0905222666');

-- =============================================================
-- ✅ XONG! DB SẴN SÀNG - ĐÃ CÓ 15 TÀI KHOẢN NỘI BỘ
--
-- ═══════════════════════════════════════════════════════════
-- HƯỚNG DẪN TẠO TÀI KHOẢN THEO TỪNG VAI TRÒ
-- ═══════════════════════════════════════════════════════════
--
-- ── BƯỚC 1: Đăng ký tài khoản qua Web ──────────────────────
--   Vào localhost:5173/register
--   Đăng ký bình thường → C# tự hash BCrypt → Lưu vào DB
--   Mặc định tất cả tài khoản đăng ký qua web đều là TNV
--
-- ── BƯỚC 2: Nâng quyền lên NVYT trong MySQL Workbench ──────
--   UPDATE TAIKHOAN
--   SET maVaiTro = 'NVYT'
--   WHERE email = 'email_ban_vua_dang_ky@gmail.com';
--
-- ── BƯỚC 3: Thêm hồ sơ Nhân viên (bắt buộc!) ──────────────
--   INSERT INTO NHANVIEN VALUES (
--     'NV00001',
--     (SELECT maTaiKhoan FROM TAIKHOAN
--      WHERE email = 'email_ban_vua_dang_ky@gmail.com'),
--     'KC00001', 'DD00001',
--     'Tên Nhân Viên Của Bạn', '000000000000', 'Nam', '0900000000'
--   );
--
-- ── BƯỚC 4: Đăng nhập lại ───────────────────────────────────
--   Token mới sẽ tự động có quyền NVYT ✅
--
-- ── LƯU Ý VỀ BCrypt ─────────────────────────────────────────
--   BCrypt là mã hóa 1 chiều - không giải mã ngược được.
--   Mỗi lần hash cùng 1 mật khẩu sẽ ra kết quả KHÁC NHAU,
--   nhưng BCrypt.Verify("123", hash) luôn trả về TRUE.
--   Đây là lý do hệ thống an toàn - dù lộ DB cũng không
--   ai biết được mật khẩu gốc của bạn!
-- =============================================================
