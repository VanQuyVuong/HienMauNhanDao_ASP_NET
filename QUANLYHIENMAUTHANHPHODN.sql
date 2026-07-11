-- =============================================================
-- ĐỒ ÁN: HỆ THỐNG QUẢN LÝ HIẾN MÁU NHÂN ĐẠO ĐÀ NẴNG
-- SINH VIÊN THỰC HIỆN: NHÓM 20
-- VĂN QUÝ VƯƠNG - PHẠM MINH HUY - LÊ VIỆT HƯNG - LÊ VĂN MẠNH
-- =============================================================

DROP DATABASE IF EXISTS QuanLyHienMauThanhPhoDN;
CREATE DATABASE QuanLyHienMauThanhPhoDN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyHienMauThanhPhoDN;

-- -------------------------------------------------------------
-- BƯỚC 1: TẠO CẤU TRÚC BẢNG (CREATE TABLES)
-- -------------------------------------------------------------

-- 1.1. Nhóm danh mục cơ sở
CREATE TABLE VAITRO (
    maVaiTro CHAR(10) PRIMARY KEY,
    tenVaiTro VARCHAR(50) NOT NULL
);

CREATE TABLE PHUONGXA (
    maPhuongXa CHAR(7) PRIMARY KEY,
    tenPhuongXa VARCHAR(100) NOT NULL
);

CREATE TABLE DIADIEM (
    maDiaDiem CHAR(7) PRIMARY KEY,
    tenDiaDiem VARCHAR(150) NOT NULL,
    diaChiChiTiet VARCHAR(255) NOT NULL,
    maPhuongXa CHAR(7),
    loaiDiaDiem VARCHAR(50) 
);

CREATE TABLE KHOACONGTAC (
    maKhoa CHAR(7) PRIMARY KEY,
    tenKhoa VARCHAR(100) NOT NULL
);

-- 1.2. Nhóm Tài khoản & Nhân sự
CREATE TABLE TAIKHOAN (
    maTaiKhoan CHAR(7) PRIMARY KEY,
    maVaiTro CHAR(10),
    email VARCHAR(100) NOT NULL,
    matKhau VARCHAR(255) NOT NULL,
    trangThai BOOLEAN DEFAULT TRUE 
);

CREATE TABLE NHANVIEN (
    maNhanVien CHAR(7) PRIMARY KEY,
    maTaiKhoan CHAR(7),
    maKhoa CHAR(7),
    maDiaDiem CHAR(7),
    hoTen VARCHAR(100) NOT NULL,
    CCCD CHAR(12) NOT NULL,
    gioiTinh VARCHAR(10),
    soDienThoai VARCHAR(10) NOT NULL
);

CREATE TABLE TINHNGUYENVIEN (
    maTNV CHAR(7) PRIMARY KEY,
    maTaiKhoan CHAR(7),
    maPhuongXa CHAR(7),
    hoTen VARCHAR(100) NOT NULL,
    CCCD CHAR(12) NOT NULL,
    ngaySinh DATE NOT NULL,
    gioiTinh VARCHAR(10),
    soDienThoai VARCHAR(10) NOT NULL,
    nhomMau VARCHAR(5),
    diaChi VARCHAR(255),
    maNhanVien CHAR(7) DEFAULT NULL
);

-- 1.3. Nhóm Quản lý Chiến dịch & Đăng ký
CREATE TABLE CHIENDICHHIENMAU (
    maChienDich CHAR(7) PRIMARY KEY,
    maDiaDiem CHAR(7),
    maNhanVien CHAR(7),
    tenChienDich VARCHAR(255) NOT NULL,
    thoiGianBD DATETIME NOT NULL,
    thoiGianKT DATETIME NOT NULL,
    soLuongDuKien INT,
    trangThai VARCHAR(50) NOT NULL,
    maQR VARCHAR(255),
    imageUrl VARCHAR(255) 
);

CREATE TABLE DONDANGKY (
    maDon CHAR(7) PRIMARY KEY,
    maTNV CHAR(7) NULL,
    maChienDich CHAR(7),
    maNhanVien CHAR(7) DEFAULT NULL,
    maQR VARCHAR(255),
    thoiGianDangKy DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50) NOT NULL,
    theTich INT,
    CONSTRAINT chk_theTich CHECK (
        (trangThai = 'Đã đăng ký'          AND theTich IN (250, 350, 450)) OR
        (trangThai = 'Đã hiến'             AND theTich IN (250, 350, 450)) OR
        (trangThai = 'Đã nhận chứng nhận'  AND theTich IN (250, 350, 450)) OR
        (trangThai = 'Đã hủy'              AND theTich IN (250, 350, 450)) OR
        (trangThai = 'Chưa hiến'           AND theTich = 0)
    )
);

CREATE TABLE HOSOSUCKHOE (
     maHoSo CHAR(7) PRIMARY KEY,
     maDon CHAR(7),
     khangSinh BOOLEAN DEFAULT FALSE,
     truyenNhiem BOOLEAN DEFAULT FALSE,
     dauHong BOOLEAN DEFAULT FALSE,
     coThai BOOLEAN DEFAULT FALSE,
     moTaKhac VARCHAR(255) CHARACTER SET utf8mb4 ,
     maNhanVien CHAR(7) DEFAULT NULL
);

-- 1.4. Nhóm Y tế & Kho máu
CREATE TABLE KETQUALAMSANG (
    maKQ CHAR(7) PRIMARY KEY,
    maDon CHAR(7),
    maNhanVien CHAR(7),
    huyetAp VARCHAR(20),
    nhipTim INT,
    canNang DOUBLE,
    nhietDo DOUBLE,
    ketQua BOOLEAN,
    lyDoTuChoi VARCHAR(255)
);

CREATE TABLE KHOMAU (
    maKho CHAR(7) PRIMARY KEY,
    tenKho NVARCHAR(50),
    nhomMau VARCHAR(10),
    soLuongTon INT DEFAULT 0,
    nguongAnToan INT DEFAULT 10,
    moTa NVARCHAR(255)
);

CREATE TABLE TUIMAU (
    maTuiMau CHAR(7) PRIMARY KEY,
    maDon CHAR(7),
    maNhanVien CHAR(7),
    maKho CHAR(7),
    theTich INT,
    thoiGianLayMau DATETIME,
    trangThai VARCHAR(50) NOT NULL,
    nhietDoVanChuyen DOUBLE
);

CREATE TABLE KETQUAXETNGHIEM (
    maKQ CHAR(7) PRIMARY KEY,
    maTuiMau CHAR(7),
    maNhanVien CHAR(7),
    nhomMau VARCHAR(5),
    soLanXetNghiem int,
    ketQua boolean,
    moTa VARCHAR(255)
);

-- 1.5. Nhập xuất & Tương tác
CREATE TABLE PHIEUNHAPXUAT (
    maPhieu CHAR(7) PRIMARY KEY,
    maNhanVien CHAR(7),
    loaiPhieu VARCHAR(50) NOT NULL,
    ngayNhapXuat DATE
);

CREATE TABLE CHITIETNHAPXUAT (
    maPhieu CHAR(7),
    maTuiMau CHAR(7),
    PRIMARY KEY (maPhieu, maTuiMau)
);

CREATE TABLE CHUNGNHAN (
    maChungNhan CHAR(7) PRIMARY KEY,
    maDon CHAR(7),
    maNhanVien CHAR(7),
    filePDF VARCHAR(255),
    ngayCap DATE
);

CREATE TABLE TINTUC (
    maTinTuc CHAR(7) PRIMARY KEY,
    maNhanVien CHAR(7),
    tieuDe VARCHAR(255) NOT NULL,
    noiDung TEXT,
    hinhAnh VARCHAR(255),
    ngayDang DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50)
);

CREATE TABLE THONGBAO (
    maThongBao CHAR(7) PRIMARY KEY,
    maTaiKhoanGui CHAR(7),
    maTaiKhoanNhan CHAR(7),
    noiDung TEXT,
    thoiGianGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50)
);

CREATE TABLE TINNHAN (
    maTinNhan CHAR(7) PRIMARY KEY,
    maTaiKhoanGui CHAR(7),
    maTaiKhoanNhan CHAR(7),
    noiDung TEXT,
    thoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai BOOLEAN DEFAULT FALSE 
);

-- -------------------------------------------------------------
-- BƯỚC 2: THIẾT LẬP RÀNG BUỘC (ALTER TABLE)
-- -------------------------------------------------------------

-- 2.1. Định danh & Liên lạc
ALTER TABLE NHANVIEN ADD CONSTRAINT chk_cccd_nv CHECK (CCCD REGEXP '^[0-9]{12}$');
ALTER TABLE TINHNGUYENVIEN ADD CONSTRAINT chk_cccd_tnv CHECK (CCCD REGEXP '^[0-9]{12}$');
ALTER TABLE NHANVIEN ADD CONSTRAINT chk_sdt_nv CHECK (soDienThoai REGEXP '^0[0-9]{9}$');
ALTER TABLE TINHNGUYENVIEN ADD CONSTRAINT chk_sdt_tnv CHECK (soDienThoai REGEXP '^0[0-9]{9}$');
ALTER TABLE TAIKHOAN ADD CONSTRAINT chk_email_tk CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

-- 2.2. Y tế
-- Cập nhật ràng buộc cân nặng xuống 40kg để cho phép D45 thất bại một cách hợp lệ
ALTER TABLE KETQUALAMSANG ADD CONSTRAINT chk_can_nang CHECK (canNang >= 40); 
ALTER TABLE TUIMAU ADD CONSTRAINT chk_the_tich CHECK (theTich IN (250, 350, 450));

-- 2.3. Trạng thái 
ALTER TABLE THONGBAO ADD CONSTRAINT chk_tt_thong_bao CHECK (trangThai IN ('Đã đọc', 'Chưa đọc'));
ALTER TABLE TINTUC ADD CONSTRAINT chk_tt_tin_tuc CHECK (trangThai IN ('Đã thêm', 'Đã xoá', 'Hết hạn'));
ALTER TABLE DONDANGKY ADD CONSTRAINT chk_tt_don CHECK (trangThai IN ('Đã đăng ký', 'Đã hiến', 'Đã nhận chứng nhận', 'Chưa hiến'));
ALTER TABLE TUIMAU ADD CONSTRAINT chk_tt_tui CHECK (trangThai IN ('Chờ xét nghiệm', 'Nhập kho', 'Đã xuất', 'Hủy','Yêu cầu nhập kho'));
ALTER TABLE CHIENDICHHIENMAU ADD CONSTRAINT chk_tt_cd CHECK (trangThai IN ('Đang lập kế hoạch', 'Đã phê duyệt', 'Đang diễn ra', 'Đã kết thúc'));
ALTER TABLE PHIEUNHAPXUAT ADD CONSTRAINT chk_loai_phieu CHECK (loaiPhieu IN ('Nhập kho', 'Xuất kho'));

-- -------------------------------------------------------------
-- BƯỚC 3: THIẾT LẬP KHÓA NGOẠI (FOREIGN KEYS)
-- -------------------------------------------------------------

ALTER TABLE DIADIEM ADD FOREIGN KEY (maPhuongXa) REFERENCES PHUONGXA(maPhuongXa);
ALTER TABLE TAIKHOAN ADD FOREIGN KEY (maVaiTro) REFERENCES VAITRO(maVaiTro);
ALTER TABLE NHANVIEN ADD FOREIGN KEY (maTaiKhoan) REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE NHANVIEN ADD FOREIGN KEY (maKhoa) REFERENCES KHOACONGTAC(maKhoa);
ALTER TABLE NHANVIEN ADD FOREIGN KEY (maDiaDiem) REFERENCES DIADIEM(maDiaDiem);
ALTER TABLE TINHNGUYENVIEN ADD FOREIGN KEY (maTaiKhoan) REFERENCES TAIKHOAN(maTaiKhoan);
ALTER TABLE TINHNGUYENVIEN ADD FOREIGN KEY (maPhuongXa) REFERENCES PHUONGXA(maPhuongXa);
ALTER TABLE TINHNGUYENVIEN ADD FOREIGN KEY (maNhanVien) REFERENCES  NHANVIEN(maNhanVien);
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
-- 1. DANH MỤC CƠ SỞ, ĐỊA ĐIỂM & KHOA CÔNG TÁC (QUY MÔ TP ĐÀ NẴNG)
-- =============================================================

INSERT INTO VAITRO VALUES 
('AD','Quản trị hệ thống'), 
('BS','Bác sĩ chuyên khoa'), 
('NVYT','Nhân viên y tế'), 
('QLK','Quản lý kho máu'), 
('TNV','Tình nguyện viên');

INSERT INTO PHUONGXA VALUES 
('PX00001','Phường Thạch Thang, Hải Châu'), 
('PX00002','Phường Hải Châu I, Hải Châu'), 
('PX00003','Phường Hải Châu II, Hải Châu'), 
('PX00004','Phường Thuận Phước, Hải Châu'), 
('PX00005','Phường Thanh Bình, Hải Châu'), 
('PX00006','Phường Hòa Khánh Bắc, Liên Chiểu'), 
('PX00007','Phường Hòa Minh, Liên Chiểu'), 
('PX00008','Phường Hòa Khánh Nam, Liên Chiểu'), 
('PX00009','Phường Khuê Mỹ, Ngũ Hành Sơn'), 
('PX00010','Phường Mỹ An, Ngũ Hành Sơn'), 
('PX00011','Phường Vĩnh Trung, Thanh Khê'), 
('PX00012','Phường Thạc Gián, Thanh Khê');

INSERT INTO DIADIEM VALUES 
('DD00001','Bệnh viện Đà Nẵng','124 Hải Phòng','PX00001','Bệnh viện'),
('DD00002','Bệnh viện C Đà Nẵng','122 Hải Phòng','PX00001','Bệnh viện'),
('DD00003','Bệnh viện Ung bướu','Hoàng Trung Thông','PX00007','Bệnh viện'),
('DD00004','Bệnh viện Phụ sản - Nhi','402 Lê Văn Hiến','PX00009','Bệnh viện'),
('DD00005','Hội Chữ thập đỏ TP Đà Nẵng','522 Ông Ích Khiêm','PX00003','Điểm cố định'),
('DD00006','ĐH Sư phạm Kỹ thuật (UTE)','48 Cao Thắng','PX00001','Điểm lưu động'),
('DD00007','Đại học Đông Á','33 Xô Viết Nghệ Tĩnh','PX00002','Điểm lưu động'),
('DD00008','Khoa Huyết học - Truyền máu (BV Đà Nẵng)','103 Quang Trung','PX00001','Bệnh viện');

INSERT INTO KHOACONGTAC VALUES 
('KC00001','Khoa Huyết học - BV Đà Nẵng'), 
('KC00002','Khoa Khám bệnh - BV Đà Nẵng'), 
('KC00003','Khoa Xét nghiệm - BV Đà Nẵng'),
('KC00004','Khoa Huyết học - BV C'), 
('KC00005','Khoa Cấp cứu - BV Phụ sản Nhi'), 
('KC00006','Khoa Huyết học - BV Ung bướu');

-- =============================================================
-- 2. HỆ THỐNG TÀI KHOẢN (DÙNG CHUNG NHÂN VIÊN & TNV CÓ APP)
-- =============================================================

INSERT INTO TAIKHOAN VALUES 
-- Tài khoản Nhân sự y tế & Admin (15 người)
('TK00001','BS','bacsi@gmail.com','Abc123!@#',1), 
('TK00002','BS','phamhongngoc.bs@bvdn.vn','123',1), 
('TK00003','NVYT','huy@gmail.com','Abc123!@#',1),
('TK00004','NVYT','trinhdieuthuy.sl@bvdn.vn','123',1), 
('TK00005','NVYT','dolanphuong.sl@bvc.vn','123',1), 
('TK00006','NVYT','dangvanmanh.lm@bvdn.vn','123',1), -- Cập nhật NV_LM
('TK00007','NVYT','levanhoang.lm@bvdn.vn','123',1), -- Cập nhật NV_LM
('TK00008','NVYT','vubaoquynh.lm@bvc.vn','123',1), -- Cập nhật NV_LM
('TK00009','NVYT','hoangthihuy.xn@bvdn.vn','123',1),
('TK00010','NVYT','nguyentuyetmai.xn@bvdn.vn','123',1), 
('TK00011','NVYT','trandinhnam.xn@bvub.vn','123',1), 
('TK00012','QLK','quanlykho@gmail.com','Abc123!@#',1),
('TK00013','QLK','lamtandat.kho@bvc.vn','123',1), 
('TK00014','AD','admin@gmail.com','Abc123!@#',1), 
('TK00015','BS','vunhatminh.bs@bvc.vn','123',1),

-- Tài khoản Tình nguyện viên (15 người tiêu biểu)
('TK00016','TNV','vanquyvuong.it@gmail.com','123',1), 
('TK00017','TNV','phamminhhuy.dev@gmail.com','123',1), 
('TK00018','TNV','leviethung.tech@gmail.com','123',1),
('TK00019','TNV','levanmanh.2002@gmail.com','123',1), 
('TK00020','TNV','tranthuha.95@yahoo.com','123',1), 
('TK00021','TNV','nguyenhoanglong.dn@outlook.com','123',1),
('TK00022','TNV','dothanhvinh.arch@gmail.com','123',1), 
('TK00023','TNV','truonggiabao.2003@gmail.com','123',1), 
('TK00024','TNV','nguyenthuylinh.marketing@gmail.com','123',1),
('TK00025','TNV','vudinhphong.eng@gmail.com','123',1), 
('TK00026','TNV','trancongminh.hr@yahoo.com','123',1), 
('TK00027','TNV','ngothanhson.sale@gmail.com','123',1),
('TK00028','TNV','dangngocthao.199x@gmail.com','123',1), 
('TK00029','TNV','hoangvanbach.teacher@outlook.com','123',1), 
('TK00030','TNV','phanvantri.mechanic@gmail.com','123',1);


-- =============================================================
-- 3. NHÂN VIÊN Y TẾ ĐƯỢC PHÂN CÔNG (15 NGƯỜI)
-- =============================================================

INSERT INTO NHANVIEN VALUES 
('NV00001','TK00001','KC00002','DD00001','Lê Quốc Tuấn','048075000001','Nam','0905123456'),
('NV00002','TK00002','KC00002','DD00001','Phạm Hồng Ngọc','048182000002','Nữ','0914234567'),
('NV00003','TK00003','KC00002','DD00001','Nguyễn Thị Lan','048185000003','Nữ','0935345678'),
('NV00004','TK00004','KC00002','DD00001','Trịnh Diệu Thúy','048190000004','Nữ','0905456789'),
('NV00005','TK00005','KC00004','DD00002','Đỗ Lan Phương','048188000005','Nữ','0702567890'),
('NV00006','TK00006','KC00001','DD00001','Đặng Văn Mạnh','048092000006','Nam','0385678901'),
('NV00007','TK00007','KC00001','DD00001','Lê Văn Hoàng','048095000007','Nam','0914789012'),
('NV00008','TK00008','KC00004','DD00002','Vũ Bảo Quỳnh','048195000008','Nữ','0935890123'),
('NV00009','TK00012','KC00003','DD00001','Hoàng Thị Huy','048190000009','Nữ','0905901234'),
('NV00010','TK00013','KC00003','DD00001','Nguyễn Tuyết Mai','048199000010','Nữ','0702012345'),
('NV00011','TK00011','KC00006','DD00003','Trần Đình Nam','048096000011','Nam','0914123450'),
('NV00012','TK00012','KC00001','DD00001','Trần Minh Hưng','048080000012','Nam','0935234561'),
('NV00013','TK00013','KC00004','DD00002','Lâm Tấn Đạt','048085000013','Nam','0905345672'),
('NV00014','TK00014','KC00002','DD00001','Admin Hệ Thống','048099000014','Nam','0702456783'),
('NV00015','TK00015','KC00002','DD00002','Vũ Nhật Minh','048088000015','Nam','0914567894');

-- =============================================================
INSERT INTO TINHNGUYENVIEN(maTNV,maTaiKhoan,maPhuongXa,hoTen,CCCD,ngaySinh,gioiTinh,soDienThoai,nhomMau,diaChi) VALUES 
-- Nhóm 1: 15 người CÓ TÀI KHOẢN APP (Khớp với mã TK00016 - TK00030 đã tạo)
('TN00001','TK00016','PX00006','Văn Quý Vương','048002000101','2005-05-16','Nam','0385111001','B+','48 Cao Thắng, Liên Chiểu'),
('TN00002','TK00017','PX00007','Phạm Minh Huy','048002000102','2005-10-12','Nam','0385111002','O+','12 Nguyễn Lương Bằng'),
('TN00003','TK00018','PX00001','Lê Việt Hưng','048001000103','2001-05-20','Nam','0385111003','A+','56 Quang Trung, Hải Châu'),
('TN00004','TK00019','PX00007','Lê Văn Mạnh','048002000104','2002-12-05','Nam','0385111004','O+','Tôn Đức Thắng, Liên Chiểu'),
('TN00005','TK00020','PX00002','Trần Thu Hà','048195000105','1995-03-12','Nữ','0905111005','AB+','Bạch Đằng, Hải Châu'),
('TN00006','TK00021','PX00009','Nguyễn Hoàng Long','048088000106','1988-11-25','Nam','0935111006','O-','Lê Văn Hiến, Ngũ Hành Sơn'),
('TN00007','TK00022','PX00006','Đỗ Thành Vinh','048096000107','1996-02-15','Nam','0905111007','O+','Ngô Thì Nhậm, Liên Chiểu'),
('TN00008','TK00023','PX00009','Trương Gia Bảo','048003000108','2003-01-20','Nam','0702111008','A-','Hồ Xuân Hương, Ngũ Hành Sơn'),
('TN00009','TK00024','PX00002','Nguyễn Thùy Linh','048197000109','1997-04-18','Nữ','0905111009','B+','Trần Phú, Hải Châu'),
('TN00010','TK00025','PX00006','Vũ Đình Phong','048085000110','1985-09-05','Nam','0914111010','AB-','Nguyễn Sinh Sắc, Liên Chiểu'),
('TN00011','TK00026','PX00001','Trần Công Minh','048090000111','1990-12-30','Nam','0905111011','A+','Đống Đa, Hải Châu'),
('TN00012','TK00027','PX00006','Ngô Thanh Sơn','048094000112','1994-08-14','Nam','0935111012','B+','Phạm Như Xương, Liên Chiểu'),
('TN00013','TK00028','PX00002','Đặng Ngọc Thảo','048100000113','2000-03-25','Nữ','0914111013','O+','Lê Lợi, Hải Châu'),
('TN00014','TK00029','PX00001','Hoàng Văn Bách','048082000114','1982-12-12','Nam','0914111014','O+','Lý Tự Trọng, Hải Châu'),
('TN00015','TK00030','PX00005','Phạm Minh Huy','048090000115','2005-01-09','Nam','0914111015','AB+','24 Bắc Đẩu'),

-- Nhóm 2: 15 người ĐẾN HIẾN TRỰC TIẾP (maTaiKhoan = NULL)
('TN00016',NULL,'PX00007','Đồng Đức Hải','048095000131','1995-05-15','Nam','0385111031','O+','Phước Lý, Liên Chiểu'),
('TN00017',NULL,'PX00001','Nhan Gia Hân','048101000132','2001-08-08','Nữ','0935111032','B+','Hải Phòng, Hải Châu'),
('TN00018',NULL,'PX00009','Mạc Văn Khoa','048090000133','1990-12-12','Nam','0914111033','O+','Bá Tùng, Ngũ Hành Sơn'),
('TN00019',NULL,'PX00002','Cấn Đình Bảo','048097000134','1997-04-04','Nam','0905111034','A+','Nguyễn Thái Học, Hải Châu'),
('TN00020',NULL,'PX00006','Lại Cẩm Nhung','048199000135','1999-09-09','Nữ','0702111035','AB+','Mẹ Suốt, Liên Chiểu'),
('TN00021',NULL,'PX00007','Uông Tiến Đạt','048002000136','2002-11-11','Nam','0385111036','O+','Bùi Chát, Liên Chiểu'),
('TN00022',NULL,'PX00001','Vi Cầm Quỳnh','048196000137','1996-02-20','Nữ','0935111037','B+','Cao Thắng, Hải Châu'),
('TN00023',NULL,'PX00009','Từ Bảo Long','048093000138','1993-06-06','Nam','0914111038','O+','Nam Kỳ Khởi Nghĩa, Ngũ Hành Sơn'),
('TN00024',NULL,'PX00002','Bạch Diễm Khanh','048198000139','1998-10-10','Nữ','0905111039','A+','Hùng Vương, Hải Châu'),
('TN00025',NULL,'PX00006','Khổng Tấn Đạt','048001000140','2001-01-01','Nam','0702111040','O+','Nguyễn Viết Xuân, Liên Chiểu'),
('TN00026',NULL,'PX00007','Tạ Thị Ngọc','048194000141','1994-05-25','Nữ','0385111041','B+','Hoàng Văn Thái, Liên Chiểu'),
('TN00027',NULL,'PX00001','Giang Hạo Thiên','048099000142','1999-08-18','Nam','0935111042','AB+','Nguyễn Thị Minh Khai, Hải Châu'),
('TN00028',NULL,'PX00009','Thân Vĩnh Trường','048092000143','1992-12-22','Nam','0914111043','O+','Trần Đại Nghĩa, Ngũ Hành Sơn'),
('TN00029',NULL,'PX00002','Phương Tú Anh','048102000144','2002-03-30','Nữ','0905111044','A+','Hoàng Diệu, Hải Châu'),
('TN00030',NULL,'PX00006','Quản Trọng Nhân','048096000145','1996-07-07','Nam','0702111045','O+','Tô Hiệu, Liên Chiểu');
-- =============================================================
-- 5. CHIẾN DỊCH HIẾN MÁU
-- =============================================================
INSERT INTO CHIENDICHHIENMAU(maChienDich, maDiaDiem, maNhanVien, tenChienDich, thoiGianBD, thoiGianKT, soLuongDuKien, trangThai, maQR, imageUrl) VALUES 
('CD00001','DD00006','NV00001','Lễ hội Xuân Hồng UTE 2026','2026-02-10 07:00','2026-02-12 17:00',500,'Đã kết thúc','QR_XH26','xuanhong2026.jpg'),
('CD00002','DD00007','NV00002','Chủ Nhật Đỏ Đại học Đông Á','2026-03-15 07:00','2026-03-15 11:30',300,'Đã phê duyệt','QR_CN26','chunhatdo2026.jpg'),
('CD00003','DD00005','NV00015','Hiến máu thường xuyên Chữ Thập Đỏ','2026-05-01 07:00','2026-05-31 17:00',200,'Đang diễn ra','QR_TX26','hienmau.jpg'),
('CD00004', 'DD00008', 'NV00001', 'Hiến máu tình nguyện tại Bệnh viện Đà Nẵng', '2026-05-03 07:00:00', '2026-06-30 17:00:00', 100, 'Đang diễn ra', 'QR_BVDN_2024', 'HienMauTinhNguyenBVDM.png');

-- =============================================================
-- 6. ĐƠN ĐĂNG KÝ (3 LUỒNG HOẠT ĐỘNG RÕ RÀNG)
-- =============================================================

-- Trường hợp 1: Đăng ký qua App (15 người)
INSERT INTO DONDANGKY (maDon, maTNV, maChienDich, maNhanVien, maQR, thoiGianDangKy, trangThai, theTich) VALUES 
('DK00001','TN00001','CD00001',NULL,'QR_01','2026-02-05','Đã hiến', 250), 
('DK00002','TN00002','CD00001',NULL,'QR_02','2026-02-05','Đã hiến', 350),
('DK00003','TN00003','CD00001',NULL,'QR_03','2026-02-05','Đã hiến', 450), 
('DK00004','TN00004','CD00001',NULL,'QR_04','2026-02-05','Đã hiến', 250),
('DK00005','TN00005','CD00001',NULL,'QR_05','2026-02-05','Đã hiến', 350), 
('DK00006','TN00006','CD00001',NULL,'QR_06','2026-02-05','Đã hiến', 450),
('DK00007','TN00007','CD00001',NULL,'QR_07','2026-02-05','Đã hiến', 250), 
('DK00008','TN00008','CD00001',NULL,'QR_08','2026-02-05','Đã hiến', 350),
('DK00009','TN00009','CD00001',NULL,'QR_09','2026-02-05','Đã hiến', 450), 
('DK00010','TN00010','CD00001',NULL,'QR_10','2026-02-05','Đã hiến', 250),
('DK00011','TN00011','CD00001',NULL,'QR_11','2026-02-05','Đã hiến', 350), 
('DK00012','TN00012','CD00001',NULL,'QR_12','2026-02-05','Đã hiến', 450),
('DK00013','TN00013','CD00001',NULL,'QR_13','2026-02-05','Đã hiến', 250), 
('DK00014','TN00014','CD00001',NULL,'QR_14','2026-02-05','Đã hiến', 350),
('DK00015','TN00015','CD00001',NULL,'QR_15','2026-02-05','Chưa hiến', 0);

-- Trường hợp 2: Hiến trực tiếp (15 người)
INSERT INTO DONDANGKY (maDon, maTNV, maChienDich, maNhanVien, maQR, thoiGianDangKy, trangThai, theTich) VALUES 
('DK00016','TN00016','CD00001','NV00003','QR_16','2026-02-10','Đã hiến',250), 
('DK00017','TN00017','CD00001','NV00004','QR_17','2026-02-10','Đã hiến',350),
('DK00018','TN00018','CD00001','NV00003','QR_18','2026-02-10','Đã hiến',450), 
('DK00019','TN00019','CD00001','NV00004','QR_19','2026-02-10','Đã hiến',250),
('DK00020','TN00020','CD00001','NV00003','QR_20','2026-02-10','Đã hiến',350), 
('DK00021','TN00021','CD00001','NV00004','QR_21','2026-02-10','Đã hiến',450),
('DK00022','TN00022','CD00001','NV00003','QR_22','2026-02-10','Đã hiến',250), 
('DK00023','TN00023','CD00001','NV00004','QR_23','2026-02-10','Chưa hiến',0),
('DK00024','TN00024','CD00001','NV00003','QR_24','2026-02-10','Đã hiến',350), 
('DK00025','TN00025','CD00001','NV00004','QR_25','2026-02-10','Đã hiến',450),
('DK00026','TN00026','CD00001','NV00003','QR_26','2026-02-10','Đã hiến',250), 
('DK00027','TN00027','CD00001','NV00004','QR_27','2026-02-10','Đã hiến',350),
('DK00028','TN00028','CD00001','NV00003','QR_28','2026-02-10','Đã hiến',450), 
('DK00029','TN00029','CD00001','NV00004','QR_29','2026-02-10','Đã hiến',250),
('DK00030','TN00030','CD00001','NV00003','QR_30','2026-02-10','Đã hiến',350);

-- Trường hợp 3: Quét mã tại chỗ (5 người)
INSERT INTO DONDANGKY (maDon, maTNV, maChienDich, maNhanVien, maQR, thoiGianDangKy, trangThai, theTich) VALUES 
('DK00031','TN00011','CD00001','NV00003','QR_31','2026-02-10','Đã hiến',350), 
('DK00032','TN00012','CD00001','NV00004','QR_32','2026-02-10','Đã hiến',450),
('DK00033','TN00013','CD00001','NV00003','QR_33','2026-02-10','Đã hiến',250), 
('DK00034','TN00014','CD00001','NV00004','QR_34','2026-02-10','Đã hiến',350),
('DK00035','TN00015','CD00001','NV00003','QR_35','2026-02-10','Chưa hiến',0),

-- ĐƠN ĐĂNG KÝ PHỤC VỤ DỮ LIỆU LỊCH SỬ (2024 - 2025)
('DK00036','TN00016','CD00001','NV00003','QR_36','2024-10-10','Đã hiến',250),
('DK00037','TN00017','CD00001','NV00004','QR_37','2024-12-15','Đã hiến',350),
('DK00038','TN00018','CD00001','NV00003','QR_38','2025-01-01','Đã hiến',450),
('DK00039','TN00019','CD00001','NV00004','QR_39','2025-02-10','Đã hiến',250),
('DK00040','TN00020','CD00001','NV00003','QR_40','2025-05-15','Đã hiến',250),
('DK00041','TN00021','CD00001','NV00004','QR_41','2025-05-18','Đã hiến',350),
('DK00042','TN00022','CD00001','NV00003','QR_42','2025-05-20','Đã hiến',250),
('DK00043','TN00023','CD00003','NV00004','QR_43','2026-04-05','Đã hiến',350),
('DK00044','TN00024','CD00003','NV00003','QR_44','2026-04-25','Đã hiến',450),
('DK00045','TN00025','CD00003','NV00004','QR_45','2026-05-08','Đã hiến',350),

-- THÊM DỮ LIỆU ĐỂ TEST CẢNH BÁO CHỚP ĐỎ VÀ LÀM MỜ
('DK00046','TN00001','CD00001','NV00003','QR_46','2025-04-10','Đã hiến',250),
('DK00047','TN00002','CD00001','NV00003','QR_47','2025-04-15','Đã hiến',350),
('DK00048','TN00003','CD00001','NV00003','QR_48','2025-04-20','Đã hiến',450),
('DK00049','TN00004','CD00001','NV00003','QR_49','2025-04-25','Đã hiến',250),
('DK00050','TN00005','CD00001','NV00003','QR_50','2025-04-26','Đã hiến',350),

-- ĐƠN ĐĂNG KÝ CHO CHIẾN DỊCH CD00002 (TP.HCM - THÁNG 03/2026)
('DK00051','TN00006','CD00002','NV00003','QR_51','2026-03-05','Đã hiến',350),
('DK00052','TN00007','CD00002','NV00004','QR_52','2026-03-06','Đã hiến',450),
('DK00053','TN00008','CD00002','NV00003','QR_53','2026-03-10','Đã hiến',250),
('DK00054','TN00009','CD00002','NV00004','QR_54','2026-03-15','Đã hiến',350),
('DK00055','TN00010','CD00002','NV00003','QR_55','2026-03-20','Đã hiến',450);

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

-- =============================================================
-- 8. THU NHẬN, XÉT NGHIỆM VÀ KHO MÁU 
-- Đa dạng trạng thái (Nhập kho, Chờ xét nghiệm, Đã xuất, Hủy)
-- =============================================================
-- =============================================================
-- 8. THU NHẬN, XÉT NGHIỆM VÀ KHO MÁU 
-- Đa dạng trạng thái (Nhập kho, Chờ xét nghiệm, Đã xuất, Hủy)
-- =============================================================

-- Xóa dữ liệu rác (nếu có) do câu lệnh lỗi vừa rồi gây ra


-- Phân tách mã kho theo từng nhóm máu chuyên biệt
INSERT INTO KHOMAU (maKho, tenKho, nhomMau, soLuongTon, nguongAnToan, moTa) VALUES 
('KM00001', 'Kho Nhóm O+', 'O+', 150, 50, 'Tủ lạnh chuyên dụng A1 - Khu vực Tầng 1'), 
('KM00002', 'Kho Nhóm A+', 'A+', 30, 40, 'Tủ lạnh chuyên dụng A2 - Khu vực Tầng 1'), 
('KM00003', 'Kho Nhóm B+', 'B+', 60, 30, 'Tủ lạnh chuyên dụng B1 - Khu vực Tầng 2'), 
('KM00004', 'Kho Nhóm AB+', 'AB+', 10, 15, 'Tủ lạnh chuyên dụng AB1 - Khu vực Tầng 2'),
('KM00005', 'Kho Nhóm O-', 'O-', 5, 10, 'Tủ đông hiếm O- - Phòng bảo quản đặc biệt'), 
('KM00006', 'Kho Nhóm A-', 'A-', 5, 10, 'Tủ đông hiếm A- - Phòng bảo quản đặc biệt'), 
('KM00007', 'Kho Nhóm B-', 'B-', 5, 10, 'Tủ đông hiếm B- - Phòng bảo quản đặc biệt'), 
('KM00008', 'Kho Nhóm AB-', 'AB-', 2, 5, 'Tủ đông hiếm AB- - Phòng bảo quản đặc biệt');

-- 47 TÚI MÁU (Túi máu của TNV nhóm nào sẽ được lưu vào kho nhóm đó)
INSERT INTO TUIMAU VALUES 
-- TM00001-TM00005: Tháng 1 (Chiến dịch Xuân Hồng sớm)
('TM00001','DK00001','NV00006','KM00003',250,'2026-01-15 07:15','Nhập kho',4.5), 
('TM00002','DK00002','NV00007','KM00001',350,'2026-01-15 07:18','Nhập kho',4.2),
('TM00003','DK00003','NV00008','KM00002',250,'2026-01-20 07:20','Nhập kho',4.5), 
('TM00004','DK00004','NV00006','KM00001',350,'2026-01-20 07:23','Nhập kho',4.2),
('TM00005','DK00005','NV00007','KM00004',250,'2026-01-25 07:25','Nhập kho',4.5), 
-- TM00006-TM00012: Tháng 2 (Chiến dịch Xuân Hồng chính)
('TM00006','DK00006','NV00008','KM00005',350,'2026-02-10 07:28','Nhập kho',4.2),
('TM00007','DK00007','NV00006','KM00001',250,'2026-02-10 07:30','Nhập kho',4.5), 
('TM00008','DK00008','NV00007','KM00006',350,'2026-02-10 07:33','Nhập kho',4.2),
('TM00009','DK00009','NV00008','KM00003',250,'2026-02-10 07:35','Nhập kho',4.5), 
('TM00010','DK00010','NV00006','KM00008',350,'2026-02-10 07:38','Hủy',4.2),
('TM00011','DK00011','NV00007','KM00002',250,'2026-02-15 07:40','Nhập kho',4.5), 
('TM00012','DK00012','NV00008','KM00003',350,'2026-02-20 07:43','Nhập kho',4.2),
-- TM00013-TM00016: Tháng 3
('TM00013','DK00013','NV00006','KM00001',250,'2026-03-05 07:45','Nhập kho',4.5), 
('TM00014','DK00014','NV00007','KM00001',350,'2026-03-10 07:48','Nhập kho',4.2),
('TM00015','DK00016','NV00008','KM00002',350,'2026-03-15 07:53','Nhập kho',4.2), 
('TM00016','DK00017','NV00006','KM00003',250,'2026-03-20 07:55','Nhập kho',4.5),
-- TM00017-TM00019: Tháng 4
('TM00017','DK00018','NV00007','KM00001',350,'2026-04-08 07:58','Nhập kho',4.2), 
('TM00018','DK00019','NV00008','KM00001',250,'2026-04-15 08:00','Nhập kho',4.5),
('TM00019','DK00020','NV00006','KM00006',350,'2026-04-22 08:03','Đã xuất',4.2),
-- TM00020-TM00023: Tháng 5
('TM00020','DK00021','NV00007','KM00003',250,'2026-05-05 08:05','Nhập kho',4.5), 
('TM00021','DK00022','NV00008','KM00001',350,'2026-05-10 08:08','Nhập kho',4.2),
('TM00022','DK00024','NV00006','KM00004',250,'2026-05-15 08:10','Nhập kho',4.5), 
('TM00023','DK00025','NV00007','KM00001',350,'2026-05-20 08:13','Nhập kho',4.2),
-- TM00024-TM00026: Tháng 5
('TM00024','DK00026','NV00008','KM00002',250,'2026-05-22 08:15','Nhập kho',4.5), 
('TM00025','DK00027','NV00006','KM00003',350,'2026-05-24 08:18','Nhập kho',4.2),
('TM00026','DK00028','NV00007','KM00001',250,'2026-05-25 08:20','Nhập kho',4.5), 
-- TM00027-TM00028: Tháng 4
('TM00027','DK00029','NV00008','KM00002',250,'2026-04-24 08:25','Nhập kho',4.5), 
('TM00028','DK00030','NV00006','KM00004',350,'2026-04-26 08:28','Nhập kho',4.2),
-- TM00029-TM00030: Tháng 3
('TM00029','DK00031','NV00007','KM00001',250,'2026-03-22 08:30','Nhập kho',4.5), 
('TM00030','DK00032','NV00008','KM00003',350,'2026-03-24 08:33','Nhập kho',4.2),
-- TM00031-TM00032: Tháng 5
('TM00031','DK00033','NV00006','KM00001',250,'2026-05-27 08:35','Nhập kho',4.5), 
('TM00032','DK00034','NV00007','KM00002',350,'2026-05-28 08:38','Nhập kho',4.2),

-- NHÓM 1: QUÁ HẠN NGHIÊM TRỌNG (Đã hóa mờ - Quá 30-60 ngày)
('TM00033','DK00036','NV00006','KM00001',250,'2025-03-20 08:00','Nhập kho',4.5),
('TM00034','DK00037','NV00007','KM00001',350,'2025-03-25 09:30','Nhập kho',4.2),
('TM00035','DK00038','NV00008','KM00003',450,'2025-04-05 10:00','Nhập kho',4.5),
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
('TM00037','DK00040','NV00007','KM00004',250,'2025-05-18 08:00','Nhập kho',4.5),
('TM00038','DK00041','NV00008','KM00005',350,'2025-05-20 09:00','Nhập kho',4.2),
('TM00039','DK00042','NV00006','KM00001',250,'2025-05-22 10:30','Nhập kho',4.5),

-- NHÓM 5: AN TOÀN (Badge Xanh - Thêm nhiều để test phân trang)
('TM00040','DK00043','NV00007','KM00006',350,'2026-04-10 08:00','Nhập kho',4.2),
('TM00041','DK00044','NV00008','KM00003',450,'2026-05-01 09:00','Nhập kho',4.5),
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
('XN00001','TM00001','NV00009','B+',1,true,'Âm tính. Đạt.'),
('XN00002','TM00002','NV00010','O+',1,true,'Âm tính. Đạt.'),
('XN00003','TM00003','NV00011','A+',1,true,'Âm tính. Đạt.'),
('XN00004','TM00004','NV00009','O+',1,true,'Âm tính. Đạt.'),
('XN00005','TM00005','NV00010','AB+',1,true,'Âm tính. Đạt.'),
('XN00006','TM00006','NV00011','O-',1,true,'Âm tính. Đạt.'),
('XN00007','TM00007','NV00009','O+',1,true,'Âm tính. Đạt.'),
('XN00008','TM00008','NV00010','A-',1,true,'Âm tính. Đạt.'),
('XN00009','TM00009','NV00011','B+',1,true,'Âm tính. Đạt.'),
('XN00010','TM00010','NV00009','AB-',2,false,'Dương tính Viêm gan B. Hủy túi máu.'),
('XN00011','TM00011','NV00010','A+',1,true,'Âm tính. Đạt.'),
('XN00012','TM00012','NV00011','B+',1,true,'Âm tính. Đạt.'),
('XN00013','TM00013','NV00009','O+',1,true,'Âm tính. Đạt.'),
('XN00014','TM00014','NV00010','O+',1,true,'Âm tính. Đạt.'),
('XN00015','TM00015','NV00011','A+',1,true,'Âm tính. Đạt.'),
('XN00016','TM00016','NV00009','B+',1,true,'Âm tính. Đạt.'),
('XN00017','TM00017','NV00010','O+',1,true,'Âm tính. Đạt.'),
('XN00018','TM00018','NV00011','O+',1,true,'Âm tính. Đạt.'),
('XN00019','TM00019','NV00009','A-',2,true,'Âm tính. Phân phối gấp cho ca mổ.'),
('XN00020','TM00020','NV00010','B+',1,true,'Âm tính. Đạt.'),
('XN00021','TM00021','NV00011','O+',1,true,'Âm tính. Đạt.'),
('XN00022','TM00022','NV00009','AB+',1,true,'Âm tính. Đạt.'),
('XN00023','TM00023','NV00010','O+',1,true,'Âm tính. Đạt.'),
('XN00024','TM00024','NV00011','A+',1,true,'Âm tính. Đạt.'),
('XN00025','TM00025','NV00009','B+',1,true,'Âm tính. Đạt.'),
('XN00026','TM00026','NV00010','O+',1,true,'Âm tính. Đạt.'),
('XN00027','TM00027','NV00011','A+',1,true,'Âm tính. Đạt.'),
('XN00028','TM00028','NV00009','AB+',1,true,'Âm tính. Đạt.'),
('XN00029','TM00029','NV00010','O+',1,true,'Âm tính. Đạt.'),
('XN00030','TM00030','NV00011','B+',1,true,'Âm tính. Đạt.'),
('XN00031','TM00031','NV00009',NULL,1,false,'Đang quay ly tâm.'),
('XN00032','TM00032','NV00010',NULL,2,false,'Chờ kết quả PCR.');

-- =============================================================
-- 9. CHỨNG NHẬN, NHẬP XUẤT, TƯƠNG TÁC
-- =============================================================
INSERT INTO CHUNGNHAN VALUES 
('CN00001','DK00001','NV00014','/pdf/CN01.pdf','2026-02-12'), 
('CN00002','DK00002','NV00014','/pdf/CN02.pdf','2026-02-12'),
('CN00003','DK00003','NV00014','/pdf/CN03.pdf','2026-02-12'), 
('CN00004','DK00004','NV00014','/pdf/CN04.pdf','2026-02-12'),
('CN00005','DK00005','NV00014','/pdf/CN05.pdf','2026-02-12'), 
('CN00006','DK00006','NV00014','/pdf/CN06.pdf','2026-02-12'),
('CN00007','DK00007','NV00014','/pdf/CN07.pdf','2026-02-12'), 
('CN00008','DK00008','NV00014','/pdf/CN08.pdf','2026-02-12'),
('CN00009','DK00009','NV00014','/pdf/CN09.pdf','2026-02-12'), 
('CN00010','DK00010','NV00014','/pdf/CN10.pdf','2026-02-12'),
('CN00011','DK00011','NV00014','/pdf/CN11.pdf','2026-02-12'), 
('CN00012','DK00012','NV00014','/pdf/CN12.pdf','2026-02-12'),
('CN00013','DK00013','NV00014','/pdf/CN13.pdf','2026-02-12'), 
('CN00014','DK00014','NV00014','/pdf/CN14.pdf','2026-02-12'),

('CN00015','DK00016','NV00014','/pdf/CN16.pdf','2026-03-15'), 
('CN00016','DK00017','NV00014','/pdf/CN17.pdf','2026-03-20'),
('CN00017','DK00018','NV00014','/pdf/CN18.pdf','2026-04-08'), 
('CN00018','DK00019','NV00014','/pdf/CN19.pdf','2026-04-15'),
('CN00019','DK00020','NV00014','/pdf/CN20.pdf','2026-04-22'), 
('CN00020','DK00021','NV00014','/pdf/CN21.pdf','2026-05-05'),
('CN00021','DK00022','NV00014','/pdf/CN22.pdf','2026-05-10'), 

('CN00022','DK00024','NV00014','/pdf/CN24.pdf','2026-05-15'),
('CN00023','DK00025','NV00014','/pdf/CN25.pdf','2026-05-20'), 
('CN00024','DK00026','NV00014','/pdf/CN26.pdf','2026-05-22'),
('CN00025','DK00027','NV00014','/pdf/CN27.pdf','2026-05-24'), 
('CN00026','DK00028','NV00014','/pdf/CN28.pdf','2026-05-25'),
('CN00027','DK00029','NV00014','/pdf/CN29.pdf','2026-04-24'), 
('CN00028','DK00030','NV00014','/pdf/CN30.pdf','2026-04-26'),
('CN00029','DK00031','NV00014','/pdf/CN31.pdf','2026-03-22'), 
('CN00030','DK00032','NV00014','/pdf/CN32.pdf','2026-03-24'),
('CN00031','DK00033','NV00014','/pdf/CN33.pdf','2026-05-27'), 
('CN00032','DK00034','NV00014','/pdf/CN34.pdf','2026-05-28');


INSERT INTO PHIEUNHAPXUAT VALUES 
('PN00001','NV00012','Nhập kho','2026-02-10'), 
('PN00002','NV00013','Nhập kho','2026-02-11'), 
('PN00003','NV00012','Xuất kho','2026-02-12');

INSERT INTO CHITIETNHAPXUAT VALUES 
('PN00001','TM00001'), 
('PN00001','TM00002'), 
('PN00001','TM00003'), 
('PN00001','TM00004'), 
('PN00002','TM00005'), 
('PN00002','TM00006'), 
('PN00003','TM00019');


INSERT INTO TINTUC VALUES 
('TT00001','NV00014','Tổng kết Xuân Hồng 2026','Đà Nẵng thu nhận 500 đơn vị máu','img1.jpg','2026-02-13','Đã thêm'),
('TT00002','NV00014','Kêu gọi hiến máu nhóm O','Kho máu đang thiếu hụt nhóm O','img2.jpg','2026-03-01','Đã thêm');

INSERT INTO THONGBAO VALUES 
-- Thông báo nội bộ giữa các nhân viên y tế (Điều phối công việc)
('TB00001','TK00014','TK00003','[Hệ thống] Nhắc nhở ca trực Sàng lọc tại UTE bắt đầu lúc 07:00 ngày 10/02.','2026-02-09','Đã đọc'),
('TB00002','TK00012','TK00014','[Cảnh báo tự động] Kho máu O- đang dưới ngưỡng an toàn. Cần lập chiến dịch huy động khẩn cấp.','2026-02-20','Chưa đọc');

INSERT INTO TINNHAN VALUES 
-- Kịch bản 1: Chăm sóc sức khỏe sau hiến máu (Hệ thống gửi TNV)
('MS00001','TK00014','TK00016','[Chăm sóc sức khỏe] Cảm ơn bạn Vương đã tham gia hiến máu. Vui lòng nghỉ ngơi và uống nhiều nước.','2026-02-11', 1),
('MS00002','TK00014','TK00017','[Chăm sóc sức khỏe] Cảm ơn bạn Huy đã tham gia hiến máu. Vui lòng hạn chế mang vác nặng trong 24h đầu.','2026-02-11', 1),

-- Kịch bản 2: Báo kết quả xét nghiệm và chứng nhận
('MS00003','TK00014','TK00018','[Kết quả] Túi máu của bạn Hưng đạt chuẩn. Chứng nhận điện tử đã được cập nhật trên App.','2026-02-14', 1),
('MS00004','TK00014','TK00025','[Quan trọng] Mẫu máu phát hiện kháng thể bất thường. Vui lòng đến BV Đà Nẵng để được tư vấn miễn phí.','2026-02-14', 1),

-- Kịch bản 3: Huy động máu khẩn cấp (Gửi cho TNV có nhóm máu phù hợp)
('MS00005','TK00014','TK00022','[Khẩn cấp] Kho máu đang thiếu hụt nghiêm trọng nhóm máu O+. Rất cần sự hỗ trợ từ bạn!','2026-03-01', 1);



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

DELIMITER //
-- 1. Function: Đếm số người đã đăng ký (Sửa CHAR(10) -> CHAR(7))
CREATE FUNCTION f_DemSoNguoiDangKy(p_maChienDich CHAR(7)) 
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

DELIMITER //
-- 2. Procedure: Tìm kiếm chiến dịch (Sửa tham số logic bên trong)
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
    
    IF v_daDangKy >= v_soLuongDuKien THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chiến dịch đã đạt đủ số lượng dự kiến, không thể đăng ký thêm!';
    END IF;
END //
DELIMITER ;

-- [TEST] Test Trigger trg_KiemTraSoLuongDuKien
-- (Lưu ý: Comment lại dòng INSERT này vì nếu chạy sẽ ném ra lỗi do chiến dịch đã đầy)
-- INSERT INTO DONDANGKY (maDon, maTNV, maChienDich, trangThai) VALUES ('D99', 'TNV01', 'CD_XH26', 'Đã đăng ký');


-- -------------------------------------------------------------
-- UC3: KHÁM SÀNG LỌC & THU NHẬN ĐƠN VỊ MÁU
-- -------------------------------------------------------------

DELIMITER //
-- 4. Function: Đánh giá chỉ số sinh tồn (Giữ nguyên logic nhưng đảm bảo tính chính xác)
CREATE FUNCTION f_DanhGiaChiSoSinhTon(p_huyetAp VARCHAR(20), p_canNang DOUBLE, p_nhietDo DOUBLE) 
RETURNS INT
DETERMINISTIC
BEGIN
    IF p_canNang < 42 THEN RETURN 0; END IF; 
    IF p_nhietDo > 37.5 THEN RETURN 0; END IF; 
    RETURN 1;
END //
DELIMITER ;

DELIMITER //
-- 5. Trigger: Kiểm tra thể tích lấy máu (Đồng bộ mã đơn định dạng CHAR(7))
CREATE TRIGGER trg_KiemTraTheTichMau_CanNang
BEFORE INSERT ON TUIMAU
FOR EACH ROW
BEGIN
    DECLARE v_canNang DOUBLE;
    
    -- Khớp mã đơn DK000xx
    SELECT canNang INTO v_canNang FROM KETQUALAMSANG WHERE maDon = NEW.maDon LIMIT 1;
    
    IF v_canNang < 45 AND NEW.theTich IN (350, 450) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Người hiến dưới 45kg chỉ được phép hiến 250ml máu!';
    END IF;
END //
DELIMITER ;

-- [TEST] Test Trigger trg_KiemTraTheTichMau_CanNang
-- (Lưu ý: Để dạng comment vì nếu chạy sẽ cố ý ném lỗi và dừng kịch bản)
-- Để test, MySQL sẽ ném lỗi 45000 khi cố thêm túi máu 350ml cho mã đơn D45 (chỉ nặng 43kg):
-- INSERT INTO TUIMAU (maTuiMau, maDon, theTich, trangThai) VALUES ('TM99', 'D45', 350, 'Chờ xét nghiệm');


-- -------------------------------------------------------------
-- UC4: THỐNG KÊ LƯỢNG MÁU THU NHẬN VÀ TỒN KHO
-- -------------------------------------------------------------
DELIMITER //
-- 6. Trigger: Tự động trừ tồn kho khi xuất máu (Sửa CHAR(10) -> CHAR(7))
CREATE TRIGGER trg_CapNhatTonKho_XuatMau
AFTER INSERT ON CHITIETNHAPXUAT
FOR EACH ROW
BEGIN
    DECLARE v_loaiPhieu VARCHAR(50);
    DECLARE v_maKho CHAR(7);
    
    SELECT loaiPhieu INTO v_loaiPhieu FROM PHIEUNHAPXUAT WHERE maPhieu = NEW.maPhieu;
    
    IF v_loaiPhieu = 'Xuất kho' THEN
        SELECT maKho INTO v_maKho FROM TUIMAU WHERE maTuiMau = NEW.maTuiMau;
        UPDATE KHOMAU SET soLuongTon = soLuongTon - 1 WHERE maKho = v_maKho;
    END IF;
END //
DELIMITER ;

DELIMITER //
-- 7. Trigger: Cảnh báo ngưỡng an toàn (Cập nhật định dạng mã TB mới)
CREATE TRIGGER trg_CanhBaoNguongAnToanKho
AFTER UPDATE ON KHOMAU
FOR EACH ROW
BEGIN
    IF NEW.soLuongTon < NEW.nguongAnToan AND OLD.soLuongTon >= OLD.nguongAnToan THEN
        INSERT INTO THONGBAO (maThongBao, maTaiKhoanGui, maTaiKhoanNhan, noiDung, trangThai)
        VALUES (
            -- Tạo mã thông báo 7 ký tự (Ví dụ: T000001)
            LEFT(CONCAT('T', DATE_FORMAT(NOW(), '%H%i%s')), 7), 
            'TK00014', -- Mã admin mới
            'TK00012', -- Mã quản lý kho mới
            CONCAT('[Cảnh báo] Nhóm máu ', NEW.nhomMau, ' dưới ngưỡng an toàn!'),
            'Chưa đọc'
        );
    END IF;
END //
DELIMITER ;

DELIMITER //
-- 8. Procedure: Thống kê thu nhận (Giữ nguyên logic nghiệp vụ)
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

USE QuanLyHienMauThanhPhoDN;
SELECT MAX(CAST(SUBSTRING(maTaiKhoan, 3) AS unsigned)) as maLonNhat FROM taiKhoan;

USE QuanLyHienMauThanhPhoDN;
-- delete from taikhoan where mataikhoan = 'TK00031'
INSERT INTO TAIKHOAN VALUES 
('TK00031','NVYT','huy@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1),
('TK00032','QLK','quanlykho@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1),
('TK00033','BS','bacsi@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1),
('TK00034','AD','admin@gmail.com','$2a$10$xpZsghkpkmQh4rjp3AvdwuffH2HgVl65iLDC7Xa2wyG5tyk4TCK.S',1);
-- Xóa constraint cũ
ALTER TABLE DONDANGKY DROP CONSTRAINT chk_theTich;
-- Tạo lại constraint đúng: bao gồm cả trường hợp 'Đã đăng ký'
ALTER TABLE DONDANGKY ADD CONSTRAINT chk_theTich CHECK (
    (trangThai = 'Đã đăng ký'          AND theTich IN (250, 350, 450)) OR
    (trangThai = 'Đã hiến'             AND theTich IN (250, 350, 450)) OR
    (trangThai = 'Đã nhận chứng nhận'  AND theTich IN (250, 350, 450)) OR
    (trangThai = 'Đã hủy'              AND theTich IN (250, 350, 450)) OR
    (trangThai = 'Chưa hiến'           AND theTich = 0)
);
INSERT INTO NHANVIEN (maNhanVien, maTaiKhoan, maKhoa, maDiaDiem, hoTen, CCCD, gioiTinh, soDienThoai) 
VALUES ('NV00016', 'TK00031', 'KC00001', 'DD00001', 'Huy', '000000000000', 'Nam', '0000000000'),
  ('NV00017', 'TK00033', 'KC00001', 'DD00001', 'Bác sĩ','000000000001', 'Nam', '0000000001'),
  ('NV00018', 'TK00009', 'KC00001', 'DD00001', 'Hoàng Thị Huy', '000000000002', 'Nữ',  '0000000002'),
  ('NV00019', 'TK00010', 'KC00001', 'DD00001', 'Nguyễn Tuyết Mai', '000000000003', 'Nữ', '0000000003');
update chiendichhienmau set trangThai = 'Đã kết thúc' where maChienDich='CD00002';

USE QuanLyHienMauThanhPhoDN;
ALTER TABLE dondangky DROP CONSTRAINT chk_tt_don;
ALTER TABLE dondangky DROP CONSTRAINT chk_theTich;

