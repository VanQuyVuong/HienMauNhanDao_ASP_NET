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
    loaiDiaDiem VARCHAR(50),
    -- Giá trị hợp lệ: BenhVien, TramYTe, TruongHoc, CoQuan, KhuDanCu
    hinhThuc VARCHAR(50) DEFAULT 'CoDinh'
    -- Giá trị hợp lệ: CoDinh, LuuDong
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
    imageUrl VARCHAR(255),
    mucDoUuTien VARCHAR(50) DEFAULT 'BinhThuong',
    nhomMauCanKhapCap VARCHAR(50) NULL
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
    moTa VARCHAR(255),
    maKhoa VARCHAR(10),
    FOREIGN KEY (maKhoa) REFERENCES KHOACONGTAC(maKhoa)
);

CREATE TABLE TUIMAU (
    maTuiMau VARCHAR(15) PRIMARY KEY,
    maDon VARCHAR(10),
    maNhanVien VARCHAR(10),
    maKho VARCHAR(10),
    theTich INT,
    thoiGianLayMau DATETIME,
    trangThai VARCHAR(50) NOT NULL,
    nhietDoVanChuyen DOUBLE,
    FOREIGN KEY (maDon) REFERENCES DONDANGKY(maDon),
    FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN(maNhanVien),
    FOREIGN KEY (maKho) REFERENCES KHOMAU(maKho)
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
('AD',      'Quản trị hệ thống'),
('BS',      'Bác sĩ chuyên khoa'),
('NVYT',    'Nhân viên y tế Lễ tân'),
('NVYT_LT', 'Nhân viên y tế Lễ tân'),
('NVYT-LT', 'Nhân viên y tế Lễ tân'),
('NVYT_XN', 'Nhân viên y tế Xét nghiệm & Lấy máu'),
('NVYT-XN', 'Nhân viên y tế Xét nghiệm & Lấy máu'),
('QLK',     'Quản lý kho máu'),
('TNV',     'Tình nguyện viên'),
('ADMIN_BV','Quản trị Bệnh viện');

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
('DD00001', 'Bệnh viện Đà Nẵng',                   '124 Hải Phòng, Hải Châu',         'PX00001', 'BenhVien', 'CoDinh'),
('DD00002', 'Bệnh viện C Đà Nẵng',                  '122 Hải Phòng, Hải Châu',         'PX00001', 'BenhVien', 'CoDinh'),
('DD00003', 'Bệnh viện Ung Bướu Đà Nẵng',           'Hoàng Trung Thông, Hải Châu',     'PX00007', 'BenhVien', 'CoDinh'),
('DD00004', 'Bệnh viện Phụ Sản - Nhi Đà Nẵng',      '402 Lê Văn Hiến, Ngũ Hành Sơn',  'PX00009', 'BenhVien', 'CoDinh'),
('DD00005', 'Hội Chữ Thập Đỏ TP. Đà Nẵng',         '522 Ông Ích Khiêm, Hải Châu',     'PX00003', 'CoQuan', 'CoDinh'),
('DD00006', 'Trường Đại học Sư phạm Kỹ thuật (UTE)','48 Cao Thắng, Hải Châu',          'PX00001', 'TruongHoc', 'LuuDong'),
('DD00007', 'Trường Đại học Đông Á',                '33 Xô Viết Nghệ Tĩnh, Hải Châu', 'PX00002', 'TruongHoc', 'LuuDong'),
('DD00008', 'Khoa Huyết học - Truyền máu (BV Đà Nẵng)', '103 Quang Trung, Hải Châu',  'PX00001', 'BenhVien', 'CoDinh'),
('DD00009', 'Bệnh viện Đa khoa Tâm Trí Đà Nẵng', '64 Cách Mạng Tháng 8, Cẩm Lệ', 'PX00015', 'BenhVien', 'LuuDong'),
('DD00010', 'Bệnh viện Đa khoa Quốc tế Vinmec Đà Nẵng', 'Đường 30 Tháng 4, Hải Châu', 'PX00001', 'BenhVien', 'LuuDong'),
('DD00011', 'Bệnh viện Đa khoa Gia Đình', '73 Nguyễn Hữu Thọ, Hải Châu', 'PX00001', 'BenhVien', 'LuuDong'),
('DD00012', 'Bệnh viện Hoàn Mỹ Đà Nẵng', '291 Nguyễn Văn Linh, Thanh Khê', 'PX00011', 'BenhVien', 'LuuDong');

-- 3.4 KHOA CÔNG TÁC (Các Bệnh viện công tác)
INSERT INTO KHOACONGTAC VALUES
('KC00001', 'Bệnh viện C Đà Nẵng'),
('KC00002', 'Bệnh viện Đà Nẵng'),
('KC00003', 'Bệnh viện Phụ Sản - Nhi Đà Nẵng'),
('KC00004', 'Bệnh viện Quân y 17'),
('KC00005', 'Bệnh viện 199 - Bộ Công An'),
('KC00006', 'Bệnh viện Đa khoa Nam Liên Chiểu'),
('KC00007', 'Trung tâm Y tế Quận Hải Châu'),
('KC00008', 'Trung tâm Y tế Quận Thanh Khê'),
('KC00009', 'Trung tâm Y tế Quận Sơn Trà'),
('KC00010', 'Trung tâm Y tế Quận Ngũ Hành Sơn'),
('KC00011', 'Trung tâm Y tế Quận Liên Chiểu'),
('KC00012', 'Trung tâm Y tế Quận Cẩm Lệ'),
('KC00013', 'Trung tâm Y tế Huyện Hòa Vang');

-- 3.5 KHO MÁU BỆNH VIỆN
INSERT INTO KHOMAU (maKho, tenKho, nhomMau, soLuongTon, nguongAnToan, moTa, maKhoa) VALUES
('KM00001', 'Kho máu A+ Bệnh viện C', 'A_positive', 50, 20, 'Tủ đông y tế', 'KC00001'),
('KM00002', 'Kho máu A- Bệnh viện C', 'A_negative', 10, 5, 'Tủ đông y tế', 'KC00001'),
('KM00003', 'Kho máu B+ Bệnh viện C', 'B_positive', 40, 20, 'Tủ đông y tế', 'KC00001'),
('KM00004', 'Kho máu B- Bệnh viện C', 'B_negative', 5, 5, 'Tủ đông y tế', 'KC00001'),
('KM00005', 'Kho máu AB+ Bệnh viện C', 'AB_positive', 20, 10, 'Tủ đông y tế', 'KC00001'),
('KM00006', 'Kho máu AB- Bệnh viện C', 'AB_negative', 5, 2, 'Tủ đông y tế', 'KC00001'),
('KM00007', 'Kho máu O+ Bệnh viện C', 'O_positive', 80, 50, 'Tủ đông y tế', 'KC00001'),
('KM00008', 'Kho máu O- Bệnh viện C', 'O_negative', 20, 10, 'Tủ đông y tế', 'KC00001'),
('KM00009', 'Kho máu A+ Bệnh viện Đà Nẵng', 'A_positive', 100, 50, 'Kho bảo quản 1', 'KC00002'),
('KM00010', 'Kho máu A- Bệnh viện Đà Nẵng', 'A_negative', 20, 10, 'Kho bảo quản hiếm', 'KC00002'),
('KM00011', 'Kho máu B+ Bệnh viện Đà Nẵng', 'B_positive', 80, 40, 'Kho bảo quản 1', 'KC00002'),
('KM00012', 'Kho máu B- Bệnh viện Đà Nẵng', 'B_negative', 15, 5, 'Kho bảo quản hiếm', 'KC00002'),
('KM00013', 'Kho máu AB+ Bệnh viện Đà Nẵng', 'AB_positive', 40, 20, 'Kho bảo quản 1', 'KC00002'),
('KM00014', 'Kho máu AB- Bệnh viện Đà Nẵng', 'AB_negative', 10, 2, 'Kho bảo quản hiếm', 'KC00002'),
('KM00015', 'Kho máu O+ Bệnh viện Đà Nẵng', 'O_positive', 150, 80, 'Kho lưu trữ trung tâm', 'KC00002'),
('KM00016', 'Kho máu O- Bệnh viện Đà Nẵng', 'O_negative', 30, 15, 'Kho bảo quản hiếm', 'KC00002');

-- =============================================================
-- BƯỚC 4: DỮ LIỆU TÀI KHOẢN HỆ THỐNG (Mật khẩu mặc định: Abc123!@#)
-- =============================================================

INSERT INTO TAIKHOAN (maTaiKhoan, maVaiTro, email, matKhau, trangThai) VALUES 
('TK00001', 'AD',      'admin@gmail.com',  '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1),
('TK00002', 'NVYT',    'nvyt1@gmail.com',  '$2a$11$t5e4TrPnBYrCVqxP8QDzOumOo9n2MboFAtbM8cu6HQzzx.JxPvQP2', 1),
('TK00003', 'NVYT',    'nvyt2@gmail.com',  '$2a$11$fJYOh9KSCyXttefr8NarOuB9I8.c.JKw5OcAjNlqoVSw5JU0tnAZG', 1),
('TK00004', 'BS',      'doctor1@gmail.com','$2a$11$dcgltimlogByLALH9P8hPOy6Yf0hImynlzF0UkqNqNTJOQiUY6Z5G', 1),
('TK00005', 'BS',      'doctor2@gmail.com','$2a$11$7v0Jg8k1Cf94UxKke.hVpOGWx5HC1pcj0L7nx1nexd3mojzcyI1IK', 1),
('TK00006', 'QLK',     'qlk@gmail.com',    '$2a$11$SoPa7XGP3InPdakUcjNC2ex2OmOZfyhGUQq1Erv2lnmN9g0VoPNvS', 1),
('TK00007', 'NVYT-XN', 'nvxn1@gmail.com',  '$2a$11$.pMKtIp7AJKcrYp.fB/JE.CvWH3mvbRWGNWmHgI8zp/2Z58wOHFqy', 1),
('TK00037', 'ADMIN_BV', 'adminbvc@gmail.com', '$2a$11$rKZh4s8EBwZwkCwX2SeneeYNHD9CCBAs.cO2Nq2QIfVfVYd2YejHu', 1),
('TK00038', 'ADMIN_BV', 'adminbvqy17@gmail.com', '$2a$11$uBALjbY.2JD8gAnpVvdyxuLRHLb/MJ6YDukQ8OldAnz5T04JQG6CO', 1)
ON DUPLICATE KEY UPDATE matKhau = VALUES(matKhau), maVaiTro = VALUES(maVaiTro);

-- HỒ SƠ NHÂN VIÊN TƯƠNG ỨNG
INSERT INTO NHANVIEN (maNhanVien, maTaiKhoan, maKhoa, maDiaDiem, hoTen, CCCD, gioiTinh, soDienThoai) VALUES 
('NV00001', 'TK00001', 'KC00001', 'DD00001', 'Admin Hệ Thống',        '048075000001', 'Nam', '0905000001'),
('NV00002', 'TK00002', 'KC00002', 'DD00001', 'Nguyễn NVYT 1',         '048075000002', 'Nữ',  '0905000002'),
('NV00003', 'TK00003', 'KC00002', 'DD00001', 'Trần NVYT 2',           '048075000003', 'Nữ',  '0905000003'),
('NV00004', 'TK00004', 'KC00001', 'DD00001', 'Bác Sĩ Một',            '048075000004', 'Nam', '0905000004'),
('NV00005', 'TK00005', 'KC00001', 'DD00001', 'Bác Sĩ Hai',            '048075000005', 'Nam', '0905000005'),
('NV00006', 'TK00006', 'KC00001', 'DD00002', 'Quản Lý Kho BV C',       '048075000006', 'Nam', '0905000006'),
('NV00007', 'TK00007', 'KC00003', 'DD00001', 'Nguyễn Văn Xét Nghiệm', '048075000007', 'Nam', '0905000007'),
('NV00022', 'TK00037', 'KC00001', 'DD00001', 'Admin BV C',             '048075000022', 'Nữ',  '0905000022'),
('NV00023', 'TK00038', 'KC00004', 'DD00001', 'Admin BV Quân Y 17',     '048075000023', 'Nam', '0905000023')
ON DUPLICATE KEY UPDATE hoTen = VALUES(hoTen), maKhoa = VALUES(maKhoa);

-- =============================================================
-- ✅ XONG! DATABASE ĐÃ ĐƯỢC CHUẨN BỊ ĐẦY ĐỦ
-- =============================================================

-- =============================================================
-- THÊM DỮ LIỆU MẪU: TÀI KHOẢN TNV (vanbin1605) & CHIẾN DỊCH KHẨN CẤP
-- =============================================================
-- Tài khoản Tình nguyện viên (15 người tiêu biểu)
INSERT INTO TAIKHOAN (maTaiKhoan, maVaiTro, email, matKhau, trangThai) VALUES 
('TK00008', 'TNV', 'vanbin1605@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00009', 'TNV', 'phamminhhuy.dev@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00010', 'TNV', 'leviethung.tech@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1),
('TK00011', 'TNV', 'levanmanh.2002@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00012', 'TNV', 'tranthuha.95@yahoo.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00013', 'TNV', 'nguyenhoanglong.dn@outlook.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1),
('TK00014', 'TNV', 'dothanhvinh.arch@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00015', 'TNV', 'truonggiabao.2003@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00016', 'TNV', 'nguyenthuylinh.marketing@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1),
('TK00017', 'TNV', 'vudinhphong.eng@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00018', 'TNV', 'trancongminh.hr@yahoo.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00019', 'TNV', 'ngothanhson.sale@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1),
('TK00020', 'TNV', 'dangngocthao.199x@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00021', 'TNV', 'hoangvanbach.teacher@outlook.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1), 
('TK00022', 'TNV', 'phanvantri.mechanic@gmail.com', '$2a$11$xk13z0u79iV/rzW89z/8uuQS36NE.fKNLwA9PG3MKtTScVKpKTufK', 1);

INSERT INTO TINHNGUYENVIEN (maTNV, maTaiKhoan, maPhuongXa, hoTen, CCCD, ngaySinh, gioiTinh, soDienThoai, nhomMau, diaChi, trangThai) VALUES 
-- Nhóm 1: 15 người CÓ TÀI KHOẢN APP (Khớp với mã TK00008 - TK00022 đã tạo)
('TN00001','TK00008','PX00006','Văn Quý Vương','048002000101','2005-05-16','Nam','0385111001','A_positive','48 Cao Thắng, Liên Chiểu', 1),
('TN00002','TK00009','PX00007','Phạm Minh Huy','048002000102','2005-10-12','Nam','0385111002','O_positive','12 Nguyễn Lương Bằng', 1),
('TN00003','TK00010','PX00001','Lê Việt Hưng','048001000103','2001-05-20','Nam','0385111003','A_positive','56 Quang Trung, Hải Châu', 1),
('TN00004','TK00011','PX00007','Lê Văn Mạnh','048002000104','2002-12-05','Nam','0385111004','O_positive','Tôn Đức Thắng, Liên Chiểu', 1),
('TN00005','TK00012','PX00002','Trần Thu Hà','048195000105','1995-03-12','Nữ','0905111005','AB_positive','Bạch Đằng, Hải Châu', 1),
('TN00006','TK00013','PX00009','Nguyễn Hoàng Long','048088000106','1988-11-25','Nam','0935111006','O_negative','Lê Văn Hiến, Ngũ Hành Sơn', 1),
('TN00007','TK00014','PX00006','Đỗ Thành Vinh','048096000107','1996-02-15','Nam','0905111007','O_positive','Ngô Thì Nhậm, Liên Chiểu', 1),
('TN00008','TK00015','PX00009','Trương Gia Bảo','048003000108','2003-01-20','Nam','0702111008','A_negative','Hồ Xuân Hương, Ngũ Hành Sơn', 1),
('TN00009','TK00016','PX00002','Nguyễn Thùy Linh','048197000109','1997-04-18','Nữ','0905111009','B_positive','Trần Phú, Hải Châu', 1),
('TN00010','TK00017','PX00006','Vũ Đình Phong','048085000110','1985-09-05','Nam','0914111010','AB_negative','Nguyễn Sinh Sắc, Liên Chiểu', 1),
('TN00011','TK00018','PX00001','Trần Công Minh','048090000111','1990-12-30','Nam','0905111011','A_positive','Đống Đa, Hải Châu', 1),
('TN00012','TK00019','PX00006','Ngô Thanh Sơn','048094000112','1994-08-14','Nam','0935111012','B_positive','Phạm Như Xương, Liên Chiểu', 1),
('TN00013','TK00020','PX00002','Đặng Ngọc Thảo','048100000113','2000-03-25','Nữ','0914111013','O_positive','Lê Lợi, Hải Châu', 1),
('TN00014','TK00021','PX00001','Hoàng Văn Bách','048082000114','1982-12-12','Nam','0914111014','O_positive','Lý Tự Trọng, Hải Châu', 1),
('TN00015','TK00022','PX00005','Phạm Minh Huy','048090000115','2005-01-09','Nam','0914111015','AB_positive','24 Bắc Đẩu', 1),

('TN00016',NULL,'PX00007','Đồng Đức Hải','048095000131','1995-05-15','Nam','0385111031','O_positive','Phước Lý, Liên Chiểu', 1),
('TN00017',NULL,'PX00001','Nhan Gia Hân','048101000132','2001-08-08','Nữ','0935111032','B_positive','Hải Phòng, Hải Châu', 1),
('TN00018',NULL,'PX00009','Mạc Văn Khoa','048090000133','1990-12-12','Nam','0914111033','O_positive','Bá Tùng, Ngũ Hành Sơn', 1),
('TN00019',NULL,'PX00002','Cấn Đình Bảo','048097000134','1997-04-04','Nam','0905111034','A_positive','Nguyễn Thái Học, Hải Châu', 1),
('TN00020',NULL,'PX00006','Lại Cẩm Nhung','048199000135','1999-09-09','Nữ','0702111035','AB_positive','Mẹ Suốt, Liên Chiểu', 1),
('TN00021',NULL,'PX00007','Uông Tiến Đạt','048002000136','2002-11-11','Nam','0385111036','O_positive','Bùi Chát, Liên Chiểu', 1),
('TN00022',NULL,'PX00001','Vi Cầm Quỳnh','048196000137','1996-02-20','Nữ','0935111037','B_positive','Cao Thắng, Hải Châu', 1),
('TN00023',NULL,'PX00009','Từ Bảo Long','048093000138','1993-06-06','Nam','0914111038','O_positive','Nam Kỳ Khởi Nghĩa, Ngũ Hành Sơn', 1),
('TN00024',NULL,'PX00002','Bạch Diễm Khanh','048198000139','1998-10-10','Nữ','0905111039','A_positive','Hùng Vương, Hải Châu', 1),
('TN00025',NULL,'PX00006','Khổng Tấn Đạt','048001000140','2001-01-01','Nam','0702111040','O_positive','Nguyễn Viết Xuân, Liên Chiểu', 1),
('TN00026',NULL,'PX00007','Tạ Thị Ngọc','048194000141','1994-05-25','Nữ','0385111041','B_positive','Hoàng Văn Thái, Liên Chiểu', 1),
('TN00027',NULL,'PX00001','Giang Hạo Thiên','048099000142','1999-08-18','Nam','0935111042','AB_positive','Nguyễn Thị Minh Khai, Hải Châu', 1),
('TN00028',NULL,'PX00009','Thân Vĩnh Trường','048092000143','1992-12-22','Nam','0914111043','O_positive','Trần Đại Nghĩa, Ngũ Hành Sơn', 1),
('TN00029',NULL,'PX00002','Phương Tú Anh','048102000144','2002-03-30','Nữ','0905111044','A_positive','Hoàng Diệu, Hải Châu', 1),
('TN00030',NULL,'PX00006','Quản Trọng Nhân','048096000145','1996-07-07','Nam','0702111045','O_positive','Tô Hiệu, Liên Chiểu', 1);

INSERT INTO CHIENDICHHIENMAU (maChienDich, maDiaDiem, maNhanVien, tenChienDich, thoiGianBD, thoiGianKT, soLuongDuKien, trangThai, maQR, imageUrl, mucDoUuTien, nhomMauCanKhapCap) VALUES 
('CD00001','DD00006','NV00001','Lễ hội Xuân Hồng UTE 2026','2026-02-10 07:00','2026-02-12 17:00',500,'DaKetThuc','QR_XH26','xuanhong2026.jpg', 'BinhThuong', NULL),
('CD00002','DD00007','NV00002','Chủ Nhật Đỏ Đại học Đông Á','2026-03-15 07:00','2026-03-15 11:30',300,'ChuaBatDau','QR_CN26','chunhatdo2026.jpg', 'BinhThuong', NULL),
('CD00003','DD00005','NV00005','Hiến máu thường xuyên Chữ Thập Đỏ','2026-05-01 07:00','2026-05-31 17:00',200,'DangDienRa','QR_TX26','hienmau.jpg', 'BinhThuong', NULL),
('CD00004', 'DD00008', 'NV00001', 'Hiến máu tình nguyện tại Bệnh viện Đà Nẵng', '2026-05-03 07:00:00', '2026-06-30 17:00:00', 100, 'DangDienRa', 'QR_BVDN_2024', 'HienMauTinhNguyenBVDM.png', 'BinhThuong', NULL);

INSERT INTO DONDANGKY (maDon, maTNV, maChienDich, maNhanVien, maQR, thoiGianDangKy, trangThai, theTich) VALUES 
('DK00001','TN00001','CD00001',NULL,'QR_01','2026-02-05','DaHien', 250), 
('DK00002','TN00002','CD00001',NULL,'QR_02','2026-02-05','DaHien', 350),
('DK00003','TN00003','CD00001',NULL,'QR_03','2026-02-05','DaHien', 450), 
('DK00004','TN00004','CD00001',NULL,'QR_04','2026-02-05','DaHien', 250),
('DK00005','TN00005','CD00001',NULL,'QR_05','2026-02-05','DaHien', 350), 
('DK00006','TN00006','CD00001',NULL,'QR_06','2026-02-05','DaHien', 450),
('DK00007','TN00007','CD00001',NULL,'QR_07','2026-02-05','DaHien', 250), 
('DK00008','TN00008','CD00001',NULL,'QR_08','2026-02-05','DaHien', 350),
('DK00009','TN00009','CD00001',NULL,'QR_09','2026-02-05','DaHien', 450), 
('DK00010','TN00010','CD00001',NULL,'QR_10','2026-02-05','DaHien', 250),
('DK00011','TN00011','CD00001',NULL,'QR_11','2026-02-05','DaHien', 350), 
('DK00012','TN00012','CD00001',NULL,'QR_12','2026-02-05','DaHien', 450),
('DK00013','TN00013','CD00001',NULL,'QR_13','2026-02-05','DaHien', 250), 
('DK00014','TN00014','CD00001',NULL,'QR_14','2026-02-05','DaHien', 350),
('DK00015','TN00015','CD00001',NULL,'QR_15','2026-02-05','ChuaHien', 0);

-- Trường hợp 2: Hiến trực tiếp (15 người)
INSERT INTO DONDANGKY (maDon, maTNV, maChienDich, maNhanVien, maQR, thoiGianDangKy, trangThai, theTich) VALUES 
('DK00016','TN00016','CD00001','NV00003','QR_16','2026-02-10','DaHien',250), 
('DK00017','TN00017','CD00001','NV00004','QR_17','2026-02-10','DaHien',350),
('DK00018','TN00018','CD00001','NV00003','QR_18','2026-02-10','DaHien',450), 
('DK00019','TN00019','CD00001','NV00004','QR_19','2026-02-10','DaHien',250),
('DK00020','TN00020','CD00001','NV00003','QR_20','2026-02-10','DaHien',350), 
('DK00021','TN00021','CD00001','NV00004','QR_21','2026-02-10','DaHien',450),
('DK00022','TN00022','CD00001','NV00003','QR_22','2026-02-10','DaHien',250), 
('DK00023','TN00023','CD00001','NV00004','QR_23','2026-02-10','ChuaHien',0),
('DK00024','TN00024','CD00001','NV00003','QR_24','2026-02-10','DaHien',350), 
('DK00025','TN00025','CD00001','NV00004','QR_25','2026-02-10','DaHien',450),
('DK00026','TN00026','CD00001','NV00003','QR_26','2026-02-10','DaHien',250), 
('DK00027','TN00027','CD00001','NV00004','QR_27','2026-02-10','DaHien',350),
('DK00028','TN00028','CD00001','NV00003','QR_28','2026-02-10','DaHien',450), 
('DK00029','TN00029','CD00001','NV00004','QR_29','2026-02-10','DaHien',250),
('DK00030','TN00030','CD00001','NV00003','QR_30','2026-02-10','DaHien',350);

-- Trường hợp 3: Quét mã tại chỗ (5 người)
INSERT INTO DONDANGKY (maDon, maTNV, maChienDich, maNhanVien, maQR, thoiGianDangKy, trangThai, theTich) VALUES 
('DK00031','TN00011','CD00001','NV00003','QR_31','2026-02-10','DaHien',350), 
('DK00032','TN00012','CD00001','NV00004','QR_32','2026-02-10','DaHien',450),
('DK00033','TN00013','CD00001','NV00003','QR_33','2026-02-10','DaHien',250), 
('DK00034','TN00014','CD00001','NV00004','QR_34','2026-02-10','DaHien',350),
('DK00035','TN00015','CD00001','NV00003','QR_35','2026-02-10','ChuaHien',0),

-- ĐƠN ĐĂNG KÝ PHỤC VỤ DỮ LIỆU LỊCH SỬ (2024 - 2025)
('DK00036','TN00016','CD00001','NV00003','QR_36','2024-10-10','DaHien',250),
('DK00037','TN00017','CD00001','NV00004','QR_37','2024-12-15','DaHien',350),
('DK00038','TN00018','CD00001','NV00003','QR_38','2025-01-01','DaHien',450),
('DK00039','TN00019','CD00001','NV00004','QR_39','2025-02-10','DaHien',250),
('DK00040','TN00020','CD00001','NV00003','QR_40','2025-05-15','DaHien',250),
('DK00041','TN00021','CD00001','NV00004','QR_41','2025-05-18','DaHien',350),
('DK00042','TN00022','CD00001','NV00003','QR_42','2025-05-20','DaHien',250),
('DK00043','TN00023','CD00003','NV00004','QR_43','2026-04-05','DaHien',350),
('DK00044','TN00024','CD00003','NV00003','QR_44','2026-04-25','DaHien',450),
('DK00045','TN00025','CD00003','NV00004','QR_45','2026-05-08','DaHien',350),

-- THÊM DỮ LIỆU ĐỂ TEST CẢNH BÁO CHỚP ĐỎ VÀ LÀM MỜ
('DK00046','TN00001','CD00001','NV00003','QR_46','2025-04-10','DaHien',250),
('DK00047','TN00002','CD00001','NV00003','QR_47','2025-04-15','DaHien',350),
('DK00048','TN00003','CD00001','NV00003','QR_48','2025-04-20','DaHien',450),
('DK00049','TN00004','CD00001','NV00003','QR_49','2025-04-25','DaHien',250),
('DK00050','TN00005','CD00001','NV00003','QR_50','2025-04-26','DaHien',350),

-- ĐƠN ĐĂNG KÝ CHO CHIẾN DỊCH CD00002 (TP.HCM - THÁNG 03/2026)
('DK00051','TN00006','CD00002','NV00003','QR_51','2026-03-05','DaHien',350),
('DK00052','TN00007','CD00002','NV00004','QR_52','2026-03-06','DaHien',450),
('DK00053','TN00008','CD00002','NV00003','QR_53','2026-03-10','DaHien',250),
('DK00054','TN00009','CD00002','NV00004','QR_54','2026-03-15','DaHien',350),
('DK00055','TN00010','CD00002','NV00003','QR_55','2026-03-20','DaHien',450);

-- =============================================================
-- 7. ĐỒNG BỘ 100%: HỒ SƠ SỨC KHỎE & KHÁM LÂM SÀNG
-- (D15 Sốt, D28 Xăm mình, D45 Thiếu cân bị đánh rớt)
-- =============================================================
INSERT INTO HOSOSUCKHOE (maHoSo, maDon, khangSinh, truyenNhiem, dauHong, coThai, moTaKhac) VALUES 
('HS00001','DK00001',0,0,0,0,'Cảm thấy khỏe mạnh'), 
('HS00002','DK00002',0,0,0,0,'Ngủ đủ giấc trên 6 tiếng'), 
('HS00003','DK00003',0,0,0,0,'Đã ăn sáng trước khi đến'), 
('HS00004','DK00004',0,0,0,0,'Tinh thần thoải mái'), 
('HS00005','DK00005',0,0,0,0,'Không có tiền sử dị ứng'),
('HS00006','DK00006',0,0,0,0,'Lần đầu tham gia hiến máu'), 
('HS00007','DK00007',0,0,0,0,'Đã uống nhiều nước trong sáng nay'), 
('HS00008','DK00008',0,0,0,0,'Sẵn sàng hiến máu'), 
('HS00009','DK00009',0,0,0,0,'Sức khỏe ổn định'), 
('HS00010','DK00010',0,0,0,0,'Cảm thấy hơi hồi hộp'),
('HS00011','DK00011',0,0,0,0,'Đã nghỉ ngơi đầy đủ'), 
('HS00012','DK00012',0,0,0,0,'Khỏe mạnh bình thường'), 
('HS00013','DK00013',0,0,0,0,'Chế độ ăn uống ổn định'), 
('HS00014','DK00014',0,0,0,0,'Không dùng thuốc trong 1 tuần qua'), 
('HS00015','DK00015',0,0,1,0,'Đang bị viêm họng, người mệt mỏi'), -- Rớt lâm sàng

('HS00016','DK00016',0,0,0,0,'Sức khỏe tốt'), 
('HS00017','DK00017',0,0,0,0,'Nghỉ ngơi tốt đêm qua'), 
('HS00018','DK00018',0,0,0,0,'Tốt'), 
('HS00019','DK00019',0,0,0,0,'Sẵn sàng hiến'), 
('HS00020','DK00020',0,0,0,0,'Khỏe mạnh'),
('HS00021','DK00021',0,0,0,0,'Tinh thần tốt'), 
('HS00022','DK00022',0,0,0,0,'Đã ăn uống đầy đủ'), 
('HS00023','DK00023',0,1,0,0,'Mới thực hiện xăm mình gần đây'), -- Rớt lâm sàng
('HS00024','DK00024',0,0,0,0,'Tốt'), 
('HS00025','DK00025',0,0,0,0,'Sức khỏe ổn định'),
('HS00026','DK00026',0,0,0,0,'Cảm thấy khỏe'), 
('HS00027','DK00027',0,0,0,0,'Tốt'), 
('HS00028','DK00028',0,0,0,0,'Đã uống nước đầy đủ'), 
('HS00029','DK00029',0,0,0,0,'Sẵn sàng'), 
('HS00030','DK00030',0,0,0,0,'Khỏe mạnh'),

('HS00031','DK00031',0,0,0,0,'Tốt'), 
('HS00032','DK00032',0,0,0,0,'Khỏe mạnh'), 
('HS00033','DK00033',0,0,0,0,'Sẵn sàng hiến máu'), 
('HS00034','DK00034',0,0,0,0,'Sẵn sàng'), 
('HS00035','DK00035',0,0,0,0,'Cơ thể cảm thấy hơi yếu'); -- Rớt lâm sàng

INSERT INTO KETQUALAMSANG VALUES 
-- Nhóm đăng ký qua App (Đơn DK00001 - DK00015)
('KL00001','DK00001','NV00003','120/80',75,65,36.5,1,NULL), 
('KL00002','DK00002','NV00004','115/75',80,55,36.6,1,NULL), 
('KL00003','DK00003','NV00003','125/85',72,70,36.5,1,NULL),
('KL00004','DK00004','NV00004','110/70',82,60,36.7,1,NULL), 
('KL00005','DK00005','NV00003','122/80',76,58,36.5,1,NULL), 
('KL00006','DK00006','NV00004','118/78',79,52,36.6,1,NULL),
('KL00007','DK00007','NV00003','130/85',74,75,36.5,1,NULL), 
('KL00008','DK00008','NV00004','125/80',81,62,36.6,1,NULL), 
('KL00009','DK00009','NV00003','115/75',77,54,36.7,1,NULL),
('KL00010','DK00010','NV00004','120/80',75,68,36.5,1,NULL), 
('KL00011','DK00011','NV00003','122/82',78,70,36.6,1,NULL), 
('KL00012','DK00012','NV00004','110/70',85,50,36.5,1,NULL),
('KL00013','DK00013','NV00003','125/85',72,72,36.7,1,NULL), 
('KL00014','DK00014','NV00004','115/75',80,60,36.6,1,NULL), 
('KL00015','DK00015','NV00003','140/90',95,65,38.0,0,'Sốt trên 37.5 độ'), -- Rớt do sốt

-- Nhóm hiến trực tiếp (Đơn DK00016 - DK00030)
('KL00016','DK00016','NV00003','118/78',78,55,36.6,1,NULL), 
('KL00017','DK00017','NV00004','125/85',72,70,36.5,1,NULL), 
('KL00018','DK00018','NV00003','110/70',82,60,36.7,1,NULL),
('KL00019','DK00019','NV00004','122/80',76,58,36.5,1,NULL), 
('KL00020','DK00020','NV00003','118/78',79,52,36.6,1,NULL), 
('KL00021','DK00021','NV00004','130/85',74,75,36.5,1,NULL),
('KL00022','DK00022','NV00003','125/80',81,62,36.6,1,NULL), 
('KL00023','DK00023','NV00004','125/85',72,72,36.7,0,'Xăm mình dưới 6 tháng'), -- Rớt do xăm mình
('KL00024','DK00024','NV00003','115/75',80,60,36.6,1,NULL), 
('KL00025','DK00025','NV00004','120/80',75,68,36.5,1,NULL),
('KL00026','DK00026','NV00003','115/75',78,55,36.6,1,NULL), 
('KL00027','DK00027','NV00004','125/85',72,70,36.5,1,NULL),
('KL00028','DK00028','NV00003','110/70',82,60,36.7,1,NULL), 
('KL00029','DK00029','NV00004','122/80',76,58,36.5,1,NULL),
('KL00030','DK00030','NV00003','118/78',79,52,36.6,1,NULL),

-- Nhóm quét mã tại chỗ (Đơn DK00031 - DK00035)
('KL00031','DK00031','NV00003','110/70',85,50,36.5,1,NULL), 
('KL00032','DK00032','NV00004','120/80',75,68,36.5,1,NULL),
('KL00033','DK00033','NV00003','115/75',80,60,36.6,1,NULL), 
('KL00034','DK00034','NV00004','120/80',75,68,36.5,1,NULL), 
('KL00035','DK00035','NV00003','100/60',90,40,36.7,0,'Cân nặng dưới 40kg'); -- Rớt do thiếu cân

-- 58 TÚI MÁU (Phân bổ đa dạng 8 nhóm máu)
INSERT INTO TUIMAU VALUES 
('TM00001','DK00001','NV00001','KM00001',350,'2026-02-10 08:00','Nhập kho',4.5), 
('TM00002','DK00002','NV00001','KM00002',250,'2026-02-12 09:30','Nhập kho',4.2), 
('TM00003','DK00003','NV00001','KM00003',450,'2026-02-15 10:00','Nhập kho',4.5), 
('TM00004','DK00004','NV00001','KM00004',250,'2026-02-18 08:00','Nhập kho',4.5), 
('TM00005','DK00005','NV00001','KM00005',350,'2026-02-20 09:00','Nhập kho',4.2), 
('TM00006','DK00006','NV00001','KM00006',250,'2026-02-22 10:00','Nhập kho',4.5), 
('TM00007','DK00007','NV00001','KM00007',350,'2026-02-25 08:00','Nhập kho',4.5), 
('TM00008','DK00008','NV00001','KM00008',450,'2026-02-28 09:00','Nhập kho',4.2), 
('TM00009','DK00009','NV00001','KM00009',250,'2026-03-01 10:00','Nhập kho',4.5), 
('TM00010','DK00010','NV00001','KM00010',350,'2026-03-05 08:00','Nhập kho',4.5), 
('TM00011','DK00011','NV00001','KM00011',250,'2026-03-10 09:00','Nhập kho',4.2), 
('TM00012','DK00012','NV00001','KM00012',450,'2026-03-15 10:00','Nhập kho',4.5), 
('TM00013','DK00013','NV00001','KM00013',350,'2026-03-20 08:00','Nhập kho',4.5), 
('TM00014','DK00014','NV00001','KM00014',250,'2026-03-25 09:00','Nhập kho',4.2), 
('TM00015','DK00016','NV00001','KM00015',450,'2026-04-01 10:00','Nhập kho',4.5), 
('TM00016','DK00017','NV00001','KM00016',250,'2026-04-05 08:00','Nhập kho',4.5),
('TM00017','DK00018','NV00001','KM00001',350,'2026-04-08 07:58','Nhập kho',4.2), 
('TM00018','DK00019','NV00001','KM00001',250,'2026-04-15 08:00','Nhập kho',4.5),
('TM00019','DK00020','NV00006','KM00006',350,'2026-04-22 08:03','Đã xuất',4.2),
-- TM00020-TM00023: Tháng 5
('TM00020','DK00021','NV00001','KM00003',250,'2026-05-05 08:05','Nhập kho',4.5), 
('TM00021','DK00022','NV00001','KM00001',350,'2026-05-10 08:08','Nhập kho',4.2),
('TM00022','DK00024','NV00006','KM00004',250,'2026-05-15 08:10','Nhập kho',4.5), 
('TM00023','DK00025','NV00001','KM00001',350,'2026-05-20 08:13','Nhập kho',4.2),
-- TM00024-TM00026: Tháng 6
('TM00024','DK00026','NV00001','KM00002',250,'2026-06-10 08:15','Nhập kho',4.5), 
('TM00025','DK00027','NV00006','KM00003',350,'2026-06-15 08:18','Nhập kho',4.2),
('TM00026','DK00028','NV00001','KM00001',250,'2026-06-20 08:20','Nhập kho',4.5), 
-- TM00027-TM00028: Tháng 7
('TM00027','DK00029','NV00001','KM00002',250,'2026-07-12 08:25','Nhập kho',4.5), 
('TM00028','DK00030','NV00006','KM00004',350,'2026-07-20 08:28','Nhập kho',4.2),
-- TM00029-TM00030: Tháng 8
('TM00029','DK00031','NV00001','KM00001',250,'2026-08-08 08:30','Nhập kho',4.5), 
('TM00030','DK00032','NV00001','KM00003',350,'2026-08-20 08:33','Nhập kho',4.2),
-- TM00031-TM00032: Tháng 9
('TM00031','DK00033','NV00006','KM00001',250,'2026-09-10 08:35','Nhập kho',4.5), 
('TM00032','DK00034','NV00001','KM00002',350,'2026-09-22 08:38','Nhập kho',4.2),

-- NHÓM 1: QUÁ HẠN NGHIÊM TRỌNG (Đã hóa mờ - Quá 30-60 ngày)
('TM00033','DK00036','NV00006','KM00001',250,'2025-03-20 08:00','Nhập kho',4.5),
('TM00034','DK00037','NV00001','KM00001',350,'2025-03-25 09:30','Nhập kho',4.2),
('TM00035','DK00038','NV00001','KM00003',450,'2025-04-05 10:00','Nhập kho',4.5),
('TM00045','DK00046','NV00006','KM00001',250,'2025-04-10 08:00','Nhập kho',4.5),
('TM00046','DK00047','NV00006','KM00001',350,'2025-04-12 09:00','Nhập kho',4.2),

-- NHÓM 2: QUÁ HẠN NGUY HIỂM (20-30 ngày -> Kích hoạt CHỚP ĐỎ thẻ Card)
('TM00043','DK00049','NV00006','KM00001',250,'2025-04-20 08:00','Nhập kho',4.5),
('TM00044','DK00050','NV00006','KM00003',350,'2025-04-22 09:00','Nhập kho',4.2),
('TM00048','DK00041','NV00006','KM00002',250,'2025-04-24 10:00','Nhập kho',4.5),

-- NHÓM 3: QUÁ HẠN THƯỜNG (Badge Đỏ)
('TM00036','DK00039','NV00006','KM00001',250,'2025-05-05 08:00','Nhập kho',4.5),
('TM00049','DK00042','NV00006','KM00004',350,'2025-05-10 09:00','Nhập kho',4.2),

-- NHÓM 4: SẮP HẾT HẠN (Badge Cam)
('TM00037','DK00040','NV00001','KM00004',250,'2025-05-18 08:00','Nhập kho',4.5),
('TM00038','DK00041','NV00001','KM00005',350,'2025-05-20 09:00','Nhập kho',4.2),
('TM00039','DK00042','NV00006','KM00001',250,'2025-05-22 10:30','Nhập kho',4.5),

-- NHÓM 5: AN TOÀN (Badge Xanh - Thêm nhiều để test phân trang)
('TM00040','DK00043','NV00001','KM00006',350,'2026-04-10 08:00','Nhập kho',4.2),
('TM00041','DK00044','NV00001','KM00003',450,'2026-05-01 09:00','Nhập kho',4.5),
('TM00042','DK00045','NV00006','KM00001',350,'2026-05-10 10:00','Nhập kho',4.2),
('TM00050','DK00043','NV00006','KM00001',250,'2026-05-12 08:00','Nhập kho',4.5),
('TM00051','DK00044','NV00006','KM00002',350,'2026-05-12 09:00','Nhập kho',4.2),
('TM00052','DK00045','NV00006','KM00003',450,'2026-05-13 10:00','Nhập kho',4.5),
('TM00053','DK00031','NV00006','KM00004',350,'2026-05-14 11:00','Nhập kho',4.2),

-- TÚI MÁU CHO CHIẾN DỊCH CD00002
('TM00054','DK00051','NV00006','KM00001',350,'2026-03-05 08:30','Nhập kho',4.5),
('TM00055','DK00052','NV00006','KM00002',450,'2026-03-06 09:30','Nhập kho',4.2),
('TM00056','DK00053','NV00006','KM00003',250,'2026-03-10 10:30','Nhập kho',4.5),
('TM00057','DK00054','NV00006','KM00004',350,'2026-03-15 08:00','Nhập kho',4.2),
('TM00058','DK00055','NV00006','KM00005',450,'2026-03-20 09:00','Nhập kho',4.5);

INSERT INTO KETQUAXETNGHIEM(maKQ, maTuiMau, maNhanVien, nhomMau, soLanXetNghiem, ketQua, moTa) VALUES
('XN00001','TM00001','NV00001','B+',1,true,'Âm tính. Đạt.'),
('XN00002','TM00002','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00003','TM00003','NV00001','A+',1,true,'Âm tính. Đạt.'),
('XN00004','TM00004','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00005','TM00005','NV00001','AB+',1,true,'Âm tính. Đạt.'),
('XN00006','TM00006','NV00001','O-',1,true,'Âm tính. Đạt.'),
('XN00007','TM00007','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00008','TM00008','NV00001','A-',1,true,'Âm tính. Đạt.'),
('XN00009','TM00009','NV00001','B+',1,true,'Âm tính. Đạt.'),
('XN00010','TM00010','NV00001','AB-',2,false,'Dương tính Viêm gan B. Hủy túi máu.'),
('XN00011','TM00011','NV00001','A+',1,true,'Âm tính. Đạt.'),
('XN00012','TM00012','NV00001','B+',1,true,'Âm tính. Đạt.'),
('XN00013','TM00013','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00014','TM00014','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00015','TM00015','NV00001','A+',1,true,'Âm tính. Đạt.'),
('XN00016','TM00016','NV00001','B+',1,true,'Âm tính. Đạt.'),
('XN00017','TM00017','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00018','TM00018','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00019','TM00019','NV00001','A-',2,true,'Âm tính. Phân phối gấp cho ca mổ.'),
('XN00020','TM00020','NV00001','B+',1,true,'Âm tính. Đạt.'),
('XN00021','TM00021','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00022','TM00022','NV00001','AB+',1,true,'Âm tính. Đạt.'),
('XN00023','TM00023','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00024','TM00024','NV00001','A+',1,true,'Âm tính. Đạt.'),
('XN00025','TM00025','NV00001','B+',1,true,'Âm tính. Đạt.'),
('XN00026','TM00026','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00027','TM00027','NV00001','A+',1,true,'Âm tính. Đạt.'),
('XN00028','TM00028','NV00001','AB+',1,true,'Âm tính. Đạt.'),
('XN00029','TM00029','NV00001','O+',1,true,'Âm tính. Đạt.'),
('XN00030','TM00030','NV00001','B+',1,true,'Âm tính. Đạt.'),
('XN00031','TM00031','NV00001',NULL,1,false,'Đang quay ly tâm.'),
('XN00032','TM00032','NV00001',NULL,2,false,'Chờ kết quả PCR.');

-- =============================================================
-- 9. CHỨNG NHẬN, NHẬP XUẤT, TƯƠNG TÁC
-- =============================================================
INSERT INTO CHUNGNHAN VALUES 
('CN00001','DK00001','NV00001','/pdf/CN01.pdf','2026-02-12'), 
('CN00002','DK00002','NV00001','/pdf/CN02.pdf','2026-02-12'),
('CN00003','DK00003','NV00001','/pdf/CN03.pdf','2026-02-12'), 
('CN00004','DK00004','NV00001','/pdf/CN04.pdf','2026-02-12'),
('CN00005','DK00005','NV00001','/pdf/CN05.pdf','2026-02-12'), 
('CN00006','DK00006','NV00001','/pdf/CN06.pdf','2026-02-12'),
('CN00007','DK00007','NV00001','/pdf/CN07.pdf','2026-02-12'), 
('CN00008','DK00008','NV00001','/pdf/CN08.pdf','2026-02-12'),
('CN00009','DK00009','NV00001','/pdf/CN09.pdf','2026-02-12'), 
('CN00010','DK00010','NV00001','/pdf/CN10.pdf','2026-02-12'),
('CN00011','DK00011','NV00001','/pdf/CN11.pdf','2026-02-12'), 
('CN00012','DK00012','NV00001','/pdf/CN12.pdf','2026-02-12'),
('CN00013','DK00013','NV00001','/pdf/CN13.pdf','2026-02-12'), 
('CN00014','DK00014','NV00001','/pdf/CN14.pdf','2026-02-12'),

('CN00015','DK00016','NV00001','/pdf/CN16.pdf','2026-02-12'), 
('CN00016','DK00017','NV00001','/pdf/CN17.pdf','2026-02-12'),
('CN00017','DK00018','NV00001','/pdf/CN18.pdf','2026-02-12'), 
('CN00018','DK00019','NV00001','/pdf/CN19.pdf','2026-02-12'),
('CN00019','DK00020','NV00001','/pdf/CN20.pdf','2026-02-12'), 
('CN00020','DK00021','NV00001','/pdf/CN21.pdf','2026-02-12'),
('CN00021','DK00022','NV00001','/pdf/CN22.pdf','2026-02-12'), 

('CN00022','DK00024','NV00001','/pdf/CN24.pdf','2026-02-12'),
('CN00023','DK00025','NV00001','/pdf/CN25.pdf','2026-02-12'), 
('CN00024','DK00026','NV00001','/pdf/CN26.pdf','2026-02-12'),
('CN00025','DK00027','NV00001','/pdf/CN27.pdf','2026-02-12'), 
('CN00026','DK00028','NV00001','/pdf/CN28.pdf','2026-02-12'),
('CN00027','DK00029','NV00001','/pdf/CN29.pdf','2026-02-12'), 
('CN00028','DK00030','NV00001','/pdf/CN30.pdf','2026-02-12'),
('CN00029','DK00031','NV00001','/pdf/CN31.pdf','2026-02-12'), 
('CN00030','DK00032','NV00001','/pdf/CN32.pdf','2026-02-12'),
('CN00031','DK00033','NV00001','/pdf/CN33.pdf','2026-02-12'), 
('CN00032','DK00034','NV00001','/pdf/CN34.pdf','2026-02-12');


INSERT INTO PHIEUNHAPXUAT VALUES 
('PN00001','NV00001','Nhập kho','2026-02-10'), 
('PN00002','NV00001','Nhập kho','2026-02-11'), 
('PN00003','NV00001','Xuất kho','2026-02-12');

INSERT INTO CHITIETNHAPXUAT VALUES 
('PN00001','TM00001'), 
('PN00001','TM00002'), 
('PN00001','TM00003'), 
('PN00001','TM00004'), 
('PN00002','TM00005'), 
('PN00002','TM00006'), 
('PN00003','TM00019');


INSERT INTO TINTUC VALUES 
('TT00001','NV00001','Tổng kết Xuân Hồng 2026','Đà Nẵng thu nhận 500 đơn vị máu','img1.jpg','2026-02-13','Đã thêm'),
('TT00002','NV00001','Kêu gọi hiến máu nhóm O','Kho máu đang thiếu hụt nhóm O','img2.jpg','2026-03-01','Đã thêm');

INSERT INTO THONGBAO VALUES 
-- Thông báo nội bộ giữa các nhân viên y tế (Điều phối công việc)
('TB00001','TK00014','TK00003','[Hệ thống] Nhắc nhở ca trực Sàng lọc tại UTE bắt đầu lúc 07:00 ngày 10/02.','2026-02-09','Đã đọc'),
('TB00002','TK00012','TK00014','[Cảnh báo tự động] Kho máu O- đang dưới ngưỡng an toàn. Cần lập chiến dịch huy động khẩn cấp.','2026-02-20','Chưa đọc');

INSERT INTO TINNHAN VALUES 
-- Kịch bản 1: Chăm sóc sức khỏe sau hiến máu (Hệ thống gửi TNV)
('MS00001','TK00014','TK00008','[Chăm sóc sức khỏe] Cảm ơn bạn Vương đã tham gia hiến máu. Vui lòng nghỉ ngơi và uống nhiều nước.','2026-02-11', 1),
('MS00002','TK00014','TK00009','[Chăm sóc sức khỏe] Cảm ơn bạn Huy đã tham gia hiến máu. Vui lòng hạn chế mang vác nặng trong 24h đầu.','2026-02-11', 1),

-- Kịch bản 2: Báo kết quả xét nghiệm và chứng nhận
('MS00003','TK00014','TK00010','[Kết quả] Túi máu của bạn Hưng đạt chuẩn. Chứng nhận điện tử đã được cập nhật trên App.','2026-02-14', 1),
('MS00004','TK00014','TK00017','[Quan trọng] Mẫu máu phát hiện kháng thể bất thường. Vui lòng đến BV Đà Nẵng để được tư vấn miễn phí.','2026-02-14', 1),

-- Kịch bản 3: Huy động máu khẩn cấp (Gửi cho TNV có nhóm máu phù hợp)
('MS00005','TK00014','TK00014','[Khẩn cấp] Kho máu đang thiếu hụt nghiêm trọng nhóm máu O+. Rất cần sự hỗ trợ từ bạn!','2026-03-01', 1);



-- =============================================================
-- CÁC CÂU LỆNH TRUY VẤN (SELECT) KIỂM TRA HỆ THỐNG
-- Phục vụ test logic và lấy số liệu làm báo cáo cho Nhóm 20
-- =============================================================


-- -------------------------------------------------------------
-- 1. KIỂM TRA TỆP TÌNH NGUYỆN VIÊN (AI DÙNG APP, AI WALK-IN)
-- -------------------------------------------------------------
SELECT 
    tnv.maTNV, 
    tnv.hoTen AS 'Tên Tình Nguyện Viên', 
    tnv.nhomMau AS 'Nhóm Máu', 
    tk.email AS 'Email Đăng Nhập',
    CASE 
        WHEN tnv.maTaiKhoan IS NULL THEN 'Hiến trực tiếp (Không có App)'
        ELSE 'Đã đăng ký App' 
    END AS 'Nhóm Người Dùng'
FROM TINHNGUYENVIEN tnv
LEFT JOIN TAIKHOAN tk ON tnv.maTaiKhoan = tk.maTaiKhoan;


-- -------------------------------------------------------------
-- 2. BÁO CÁO THỐNG KÊ 3 LUỒNG ĐĂNG KÝ TRONG CHIẾN DỊCH
-- (Logic cực kỳ quan trọng để bảo vệ trước Hội đồng)
-- -------------------------------------------------------------
SELECT 
    d.maDon AS 'Mã Đơn', 
    tnv.hoTen AS 'Người Hiến', 
    c.tenChienDich AS 'Chiến Dịch',
    CASE 
        WHEN d.maNhanVien IS NULL THEN '1. Đăng ký Online (TNV tự tạo)'
        WHEN d.maNhanVien IS NOT NULL AND tnv.maTaiKhoan IS NULL THEN '2. Trực tiếp - Không tài khoản (NV nhập mới)'
        WHEN d.maNhanVien IS NOT NULL AND tnv.maTaiKhoan IS NOT NULL THEN '3. Trực tiếp - Có tài khoản (NV quét mã)'
    END AS 'Luồng Nghiệp Vụ',
    IFNULL(nv.hoTen, 'Hệ thống tự động') AS 'Nhân Viên Tiếp Nhận'
FROM DONDANGKY d
JOIN TINHNGUYENVIEN tnv ON d.maTNV = tnv.maTNV
JOIN CHIENDICHHIENMAU c ON d.maChienDich = c.maChienDich
LEFT JOIN NHANVIEN nv ON d.maNhanVien = nv.maNhanVien
ORDER BY d.maDon;


-- -------------------------------------------------------------
-- 3. TRUY VẾT HÀNH TRÌNH TÚI MÁU (Từ khám đến kết quả)
-- Chứng minh hệ thống bắt được ca rớt lâm sàng & hủy túi máu
-- -------------------------------------------------------------
SELECT 
    d.maDon AS 'Mã Đơn', 
    tnv.hoTen AS 'Tên TNV', 
    IF(kq.ketQua = 1, 'Đạt', 'Rớt') AS 'Khám Lâm Sàng', 
    IFNULL(kq.lyDoTuChoi, 'Không') AS 'Lý do rớt',
    IFNULL(t.maTuiMau, 'Không có túi máu') AS 'Mã Túi Máu', 
    IFNULL(t.trangThai, 'N/A') AS 'Trạng Thái Túi',
    IFNULL(xn.moTa, 'Chưa xét nghiệm hoặc Không thu máu') AS 'Kết Quả Xét Nghiệm'
FROM DONDANGKY d
JOIN TINHNGUYENVIEN tnv ON d.maTNV = tnv.maTNV
LEFT JOIN KETQUALAMSANG kq ON d.maDon = kq.maDon
LEFT JOIN TUIMAU t ON d.maDon = t.maDon
LEFT JOIN KETQUAXETNGHIEM xn ON t.maTuiMau = xn.maTuiMau;


-- -------------------------------------------------------------
-- 4. BẢNG ĐIỀU KHIỂN (DASHBOARD): CẢNH BÁO KHO MÁU
-- Lấy ra những nhóm máu đang thiếu hụt để huy động
-- -------------------------------------------------------------
SELECT 
    maKho AS 'Mã Kho',
    nhomMau AS 'Nhóm Máu', 
    soLuongTon AS 'Tồn Kho Hiện Tại', 
    nguongAnToan AS 'Ngưỡng Cảnh Báo',
    IF(soLuongTon < nguongAnToan, '⚠️ BÁO ĐỘNG ĐỎ - CẦN HUY ĐỘNG', '✅ Mức an toàn') AS 'Tình Trạng Kho'
FROM KHOMAU;


-- -------------------------------------------------------------
-- 5. KIỂM TRA HỆ THỐNG GỬI TIN NHẮN TỰ ĐỘNG (AUTOMATION)
-- Xem hệ thống đã chăm sóc người hiến máu thành công chưa
-- -------------------------------------------------------------
SELECT 
    tn.maTinNhan AS 'Mã Tin',
    DATE_FORMAT(tn.thoiGian, '%d/%m/%Y %H:%i') AS 'Thời Gian Gửi',
    tk.email AS 'Gửi Đến',
    tn.noiDung AS 'Nội Dung Tin Nhắn',
    IF(tn.trangThai = 1, 'Đã gửi thành công', 'Lỗi hệ thống') AS 'Trạng Thái Gửi'
FROM TINNHAN tn
JOIN TAIKHOAN tk ON tn.maTaiKhoanNhan = tk.maTaiKhoan;




-- =============================================================
-- =============================================================
-- BƯỚC 4 & 5: HÀM, THỦ TỤC, TRIGGER VÀ TEST (THEO USE CASE)
-- =============================================================

-- -------------------------------------------------------------
-- UC1: TÌM KIẾM CHIẾN DỊCH HIẾN MÁU
-- -------------------------------------------------------------

DROP FUNCTION IF EXISTS f_DemSoNguoiDangKy;
DELIMITER //
-- 1. Function: Đếm số người đã đăng ký
CREATE FUNCTION f_DemSoNguoiDangKy(p_maChienDich VARCHAR(10)) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM DONDANGKY WHERE maChienDich = p_maChienDich;
    RETURN v_count;
END //
DELIMITER ;

-- [TEST] Kiểm tra với mã chiến dịch mới CD00001
SELECT f_DemSoNguoiDangKy('CD00001') AS 'Số người đã đăng ký CD00001';

DROP PROCEDURE IF EXISTS sp_TimKiemChienDich;
DELIMITER //
-- 2. Procedure: Tìm kiếm chiến dịch
CREATE PROCEDURE sp_TimKiemChienDich(
    IN p_TuKhoa VARCHAR(255)
)
BEGIN
    SELECT 
        c.maChienDich, 
        c.tenChienDich, 
        d.tenDiaDiem, 
        c.thoiGianBD, 
        c.soLuongDuKien,
        f_DemSoNguoiDangKy(c.maChienDich) AS soNguoiDaDangKy,
        c.trangThai
    FROM CHIENDICHHIENMAU c
    JOIN DIADIEM d ON c.maDiaDiem = d.maDiaDiem
    WHERE c.tenChienDich LIKE CONCAT('%', p_TuKhoa, '%') 
       OR d.tenDiaDiem LIKE CONCAT('%', p_TuKhoa, '%');
END //
DELIMITER ;

-- -------------------------------------------------------------
-- UC2: ĐĂNG KÝ HIẾN MÁU & KHAI BÁO Y TẾ
-- -------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_KiemTraSoLuongDuKien;
DELIMITER //
-- 3. Trigger: Kiểm tra số lượng dự kiến trước khi đăng ký
CREATE TRIGGER trg_KiemTraSoLuongDuKien
BEFORE INSERT ON DONDANGKY
FOR EACH ROW
BEGIN
    DECLARE v_soLuongDuKien INT;
    DECLARE v_daDangKy INT;
    
    SELECT soLuongDuKien INTO v_soLuongDuKien FROM CHIENDICHHIENMAU WHERE maChienDich = NEW.maChienDich;
    SET v_daDangKy = f_DemSoNguoiDangKy(NEW.maChienDich);
    
    IF v_soLuongDuKien IS NOT NULL AND v_daDangKy >= v_soLuongDuKien THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chiến dịch đã đạt đủ số lượng dự kiến, không thể đăng ký thêm!';
    END IF;
END //
DELIMITER ;


-- -------------------------------------------------------------
-- UC3: KHÁM SÀNG LỌC & THU NHẬN ĐƠN VỊ MÁU
-- -------------------------------------------------------------

DROP FUNCTION IF EXISTS f_DanhGiaChiSoSinhTon;
DELIMITER //
-- 4. Function: Đánh giá chỉ số sinh tồn
CREATE FUNCTION f_DanhGiaChiSoSinhTon(p_huyetAp VARCHAR(20), p_canNang DOUBLE, p_nhietDo DOUBLE) 
RETURNS INT
DETERMINISTIC
BEGIN
    IF p_canNang < 42 THEN RETURN 0; END IF; 
    IF p_nhietDo > 37.5 THEN RETURN 0; END IF; 
    RETURN 1;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_KiemTraTheTichMau_CanNang;
DELIMITER //
-- 5. Trigger: Kiểm tra thể tích lấy máu theo cân nặng
CREATE TRIGGER trg_KiemTraTheTichMau_CanNang
BEFORE INSERT ON TUIMAU
FOR EACH ROW
BEGIN
    DECLARE v_canNang DOUBLE;
    
    SELECT canNang INTO v_canNang FROM KETQUALAMSANG WHERE maDon = NEW.maDon LIMIT 1;
    
    IF v_canNang IS NOT NULL AND v_canNang < 45 AND NEW.theTich IN (350, 450) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Người hiến dưới 45kg chỉ được phép hiến 250ml máu!';
    END IF;
END //
DELIMITER ;


-- -------------------------------------------------------------
-- UC4: THỐNG KÊ LƯỢNG MÁU THU NHẬN VÀ TỒN KHO
-- -------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_CapNhatTonKho_XuatMau;
DELIMITER //
-- 6. Trigger: Tự động trừ tồn kho khi xuất máu
CREATE TRIGGER trg_CapNhatTonKho_XuatMau
AFTER INSERT ON CHITIETNHAPXUAT
FOR EACH ROW
BEGIN
    DECLARE v_loaiPhieu VARCHAR(50);
    DECLARE v_maKho VARCHAR(10);
    
    SELECT loaiPhieu INTO v_loaiPhieu FROM PHIEUNHAPXUAT WHERE maPhieu = NEW.maPhieu;
    
    IF v_loaiPhieu = 'Xuất kho' THEN
        SELECT maKho INTO v_maKho FROM TUIMAU WHERE maTuiMau = NEW.maTuiMau;
        UPDATE KHOMAU SET soLuongTon = GREATEST(0, soLuongTon - 1) WHERE maKho = v_maKho;
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_CanhBaoNguongAnToanKho;
DELIMITER //
-- 7. Trigger: Cảnh báo ngưỡng an toàn kho máu
CREATE TRIGGER trg_CanhBaoNguongAnToanKho
AFTER UPDATE ON KHOMAU
FOR EACH ROW
BEGIN
    IF NEW.soLuongTon < NEW.nguongAnToan AND OLD.soLuongTon >= OLD.nguongAnToan THEN
        INSERT INTO THONGBAO (maThongBao, maTaiKhoanGui, maTaiKhoanNhan, noiDung, trangThai)
        VALUES (
            CONCAT('TB', LPAD(FLOOR(RAND() * 100000), 5, '0')),
            'TK00014',
            'TK00012',
            CONCAT('[Cảnh báo] Nhóm máu ', NEW.nhomMau, ' dưới ngưỡng an toàn!'),
            'Chưa đọc'
        );
    END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_ThongKeThuNhanTheoThang;
DELIMITER //
-- 8. Procedure: Thống kê thu nhận máu theo tháng/năm
CREATE PROCEDURE sp_ThongKeThuNhanTheoThang(
    IN p_Thang INT,
    IN p_Nam INT
)
BEGIN
    SELECT 
        k.nhomMau AS 'Nhóm Máu',
        COUNT(t.maTuiMau) AS 'Số Lượng Túi',
        SUM(t.theTich) AS 'Tổng Thể Tích (ml)'
    FROM TUIMAU t
    JOIN KHOMAU k ON t.maKho = k.maKho
    WHERE MONTH(t.thoiGianLayMau) = p_Thang AND YEAR(t.thoiGianLayMau) = p_Nam AND t.trangThai = 'Nhập kho'
    GROUP BY k.nhomMau;
END //
DELIMITER ;

-- [TEST] Thống kê lượng máu thu nhận trong tháng 2 năm 2026
CALL sp_ThongKeThuNhanTheoThang(2, 2026);

-- -------------------------------------------------------------
-- 9. BỔ SUNG TÀI KHOẢN & CHIẾN DỊCH TEST HỆ THỐNG
-- -------------------------------------------------------------
INSERT INTO TAIKHOAN (maTaiKhoan, maVaiTro, email, matKhau, trangThai) VALUES 
('TK00031','NVYT','huy@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1),
('TK00032','QLK','quanlykho@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1),
('TK00033','BS','bacsi@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1),
('TK00034','AD','admin@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1),
('TK00035','NVYT_XN','nvxn1@gmail.com','$2a$11$.pMKtIp7AJKcrYp.fB/JE.CvWH3mvbRWGNWmHgI8zp/2Z58wOHFqy',1),
('TK00036','NVYT_LT','nvletan1@gmail.com','$2a$11$.pMKtIp7AJKcrYp.fB/JE.CvWH3mvbRWGNWmHgI8zp/2Z58wOHFqy',1);

INSERT INTO NHANVIEN (maNhanVien, maTaiKhoan, maKhoa, maDiaDiem, hoTen, CCCD, gioiTinh, soDienThoai) VALUES 
('NV00016', 'TK00031', 'KC00001', 'DD00001', 'Huy', '000000000000', 'Nam', '0000000000'),
('NV00017', 'TK00033', 'KC00001', 'DD00001', 'Bác sĩ','000000000001', 'Nam', '0000000001'),
('NV00018', 'TK00009', 'KC00001', 'DD00001', 'Hoàng Thị Huy', '000000000002', 'Nữ', '0000000002'),
('NV00019', 'TK00010', 'KC00001', 'DD00001', 'Nguyễn Tuyết Mai', '000000000003', 'Nữ', '0000000003'),
('NV00020', 'TK00035', 'KC00001', 'DD00001', 'Nhân Viên Xét Nghiệm 1', '000000000004', 'Nam', '0000000004'),
('NV00021', 'TK00036', 'KC00001', 'DD00001', 'Nhân Viên Lễ Tân 1', '000000000005', 'Nữ', '0000000005');

UPDATE CHIENDICHHIENMAU SET trangThai = 'DaKetThuc' WHERE maChienDich = 'CD00002';

INSERT INTO CHIENDICHHIENMAU (maChienDich, maDiaDiem, maNhanVien, tenChienDich, thoiGianBD, thoiGianKT, soLuongDuKien, trangThai, maQR, imageUrl, mucDoUuTien, nhomMauCanKhapCap) VALUES
('CD99991', 'DD00001', 'NV00001', 'Khẩn cấp cần máu A+ tại BV Đà Nẵng', DATE_ADD(NOW(), INTERVAL -1 HOUR), DATE_ADD(NOW(), INTERVAL 11 HOUR), 10, 'DangDienRa', 'QR_KCA', 'hienmau.jpg', 'KhanCap', 'A+'),
('CD99992', 'DD00002', 'NV00001', 'Khẩn cấp cần máu O+ tại BV C Đà Nẵng', DATE_ADD(NOW(), INTERVAL -2 HOUR), DATE_ADD(NOW(), INTERVAL 10 HOUR), 5, 'DangDienRa', 'QR_KCO', 'hienmau.jpg', 'KhanCap', 'O+');

SET SQL_SAFE_UPDATES = 0;
UPDATE CHIENDICHHIENMAU SET trangThai = 'DangDienRa' WHERE mucDoUuTien = 'KhanCap' AND trangThai = 'ChuaBatDau';
SET SQL_SAFE_UPDATES = 1;

