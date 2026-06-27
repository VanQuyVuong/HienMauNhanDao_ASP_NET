-- =============================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ HIẾN MÁU NHÂN ĐẠO ĐÀ NẴNG (BẢN CHUẨN)
-- Đã được tinh chỉnh 100% để đồng bộ với Code C# (Mô hình Database-First)
-- =============================================================

DROP DATABASE IF EXISTS QuanLyHienMauDN;
CREATE DATABASE QuanLyHienMauDN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyHienMauDN;

-- -------------------------------------------------------------
-- BƯỚC 1: TẠO BẢNG (Đã sửa lại kiểu CHAR -> VARCHAR cho linh hoạt)
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
    loaiDiaDiem VARCHAR(50) -- Khớp Enum: BenhVien, TrungTamYTe, TruongHoc, CoQuan, ĐiaiemCoDinh
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
    nhomMau VARCHAR(50), -- Khớp Enum: A_positive, O_negative...
    diaChi VARCHAR(255),
    maNhanVien VARCHAR(10) DEFAULT NULL
);

CREATE TABLE CHIENDICHHIENMAU (
    maChienDich VARCHAR(10) PRIMARY KEY,
    maDiaDiem VARCHAR(10),
    maNhanVien VARCHAR(10),
    tenChienDich VARCHAR(255) NOT NULL,
    thoiGianBD DATETIME NOT NULL,
    thoiGianKT DATETIME NOT NULL,
    soLuongDuKien INT,
    trangThai VARCHAR(50) NOT NULL, -- Khớp Enum: ChuaBatDau, DangDienRa, DaKetThuc, DaHuy
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
    trangThai VARCHAR(50) NOT NULL, -- Khớp Enum: ChoDuyet, DaDuyet, DaTuChoi, DaHoanThanh
    theTich INT
);

CREATE TABLE HOSOSUCKHOE (
     maHoSo VARCHAR(10) PRIMARY KEY,
     maDon VARCHAR(10),
     khangSinh BOOLEAN DEFAULT FALSE,
     truyenNhiem BOOLEAN DEFAULT FALSE,
     dauHong BOOLEAN DEFAULT FALSE,
     coThai BOOLEAN DEFAULT FALSE,
     moTaKhac VARCHAR(255) CHARACTER SET utf8mb4 ,
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
    tenKho NVARCHAR(50),
    nhomMau VARCHAR(50),
    soLuongTon INT DEFAULT 0,
    nguongAnToan INT DEFAULT 10,
    moTa NVARCHAR(255)
);

CREATE TABLE TUIMAU (
    maTuiMau VARCHAR(10) PRIMARY KEY,
    maDon VARCHAR(10),
    maNhanVien VARCHAR(10),
    maKho VARCHAR(10),
    theTich INT,
    thoiGianLayMau DATETIME,
    trangThai VARCHAR(50) NOT NULL, -- Khớp Enum: ChuaXuLy, DaXetNghiem...
    nhietDoVanChuyen DOUBLE
);

CREATE TABLE KETQUAXETNGHIEM (
    maKQ VARCHAR(10) PRIMARY KEY,
    maTuiMau VARCHAR(10),
    maNhanVien VARCHAR(10),
    nhomMau VARCHAR(50),
    soLanXetNghiem int,
    ketQua boolean,
    moTa VARCHAR(255)
);

CREATE TABLE PHIEUNHAPXUAT (
    maPhieu VARCHAR(10) PRIMARY KEY,
    maNhanVien VARCHAR(10),
    loaiPhieu VARCHAR(50) NOT NULL, -- Khớp Enum: Nhap, Xuat
    ngayNhapXuat DATE
);

CREATE TABLE CHITIETNHAPXUAT (
    maPhieu VARCHAR(10),
    maTuiMau VARCHAR(10),
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
    trangThai VARCHAR(50) -- Khớp Enum: NhapLieu, DanDang, DaAn
);

CREATE TABLE THONGBAO (
    maThongBao VARCHAR(10) PRIMARY KEY,
    maTaiKhoanGui VARCHAR(10),
    maTaiKhoanNhan VARCHAR(10),
    noiDung TEXT,
    thoiGianGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50) -- Khớp Enum: ChuaDoc, DaDoc
);

CREATE TABLE TINNHAN (
    maTinNhan VARCHAR(10) PRIMARY KEY,
    maTaiKhoanGui VARCHAR(10),
    maTaiKhoanNhan VARCHAR(10),
    noiDung TEXT,
    thoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai BOOLEAN DEFAULT FALSE 
);

-- -------------------------------------------------------------
-- BƯỚC 2: THIẾT LẬP KHÓA NGOẠI (FOREIGN KEYS)
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

-- -------------------------------------------------------------
-- BƯỚC 3: DỮ LIỆU MẪU CƠ BẢN ĐỂ REACT HIỂN THỊ ĐƯỢC NGAY
-- -------------------------------------------------------------

INSERT INTO VAITRO VALUES 
('AD','Quản trị hệ thống'), 
('NVYT','Nhân viên y tế'), 
('TNV','Tình nguyện viên');

INSERT INTO PHUONGXA VALUES ('PX00001','Phường Thạch Thang, Hải Châu');

-- Chú ý cột Enum loaiDiaDiem: BenhVien
INSERT INTO DIADIEM VALUES 
('DD00001','Bệnh viện Đà Nẵng','124 Hải Phòng','PX00001','BenhVien');

INSERT INTO KHOACONGTAC VALUES ('KC00001','Khoa Huyết học - BV Đà Nẵng');

-- Tài khoản mật khẩu là 123 (nếu bạn đã mã hóa bằng BCrypt thì dùng Hash của 123)
-- Tạm thời tôi để mật khẩu là chuỗi hash bcrypt của chữ "123" để bạn đăng nhập được.
INSERT INTO TAIKHOAN VALUES 
('TK00001','NVYT','admin@bvdn.vn','$2a$11$w8/QvP6b2e1B2m8t9Qv5kOiT9D3q6v.H4B7v7M/1A6X9vD6D3A0qO',1);

INSERT INTO NHANVIEN VALUES 
('NV00001','TK00001','KC00001','DD00001','Admin Hệ Thống','048075000001','Nam','0905123456');

-- Chú ý cột Enum trangThai: DangDienRa, DaKetThuc...
INSERT INTO CHIENDICHHIENMAU VALUES 
('CD00001','DD00001','NV00001','Lễ hội Xuân Hồng UTE 2026','2026-02-10 07:00','2026-02-12 17:00',500,'DangDienRa','QR_XH26','https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600'),
('CD00002','DD00001','NV00001','Chủ Nhật Đỏ Đại học Đông Á','2026-03-15 07:00','2026-03-15 11:30',300,'ChuaBatDau','QR_CN26','https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=600'),
('CD00003','DD00001','NV00001','Hiến máu thường xuyên','2026-05-01 07:00','2026-05-31 17:00',200,'DaKetThuc','QR_TX26','https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?q=80&w=600');
