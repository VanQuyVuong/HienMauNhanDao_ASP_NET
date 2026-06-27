using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HienMauNhanDao_DaNang.Migrations
{
    /// <inheritdoc />
    public partial class InitDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "INVALIDATED_TOKEN",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    expiry_time = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_INVALIDATED_TOKEN", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "KhoaCongTac",
                columns: table => new
                {
                    maKhoa = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tenKhoa = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhoaCongTac", x => x.maKhoa);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "KhoMau",
                columns: table => new
                {
                    maKho = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tenKho = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nhomMau = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    soLuongTon = table.Column<int>(type: "int", nullable: true),
                    nguongAnToan = table.Column<int>(type: "int", nullable: true),
                    moTa = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhoMau", x => x.maKho);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PhuongXa",
                columns: table => new
                {
                    maPhuongXa = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tenPhuongXa = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tenQuanHuyen = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tenThanhPho = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhuongXa", x => x.maPhuongXa);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "VaiTro",
                columns: table => new
                {
                    MaVaiTro = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenVaiTro = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VaiTro", x => x.MaVaiTro);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DIADIEM",
                columns: table => new
                {
                    maDiaDiem = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tenDiaDiem = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    diaChi = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    loaiDiaDiem = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maPhuongXa = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DIADIEM", x => x.maDiaDiem);
                    table.ForeignKey(
                        name: "FK_DIADIEM_PhuongXa_maPhuongXa",
                        column: x => x.maPhuongXa,
                        principalTable: "PhuongXa",
                        principalColumn: "maPhuongXa");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TaiKhoan",
                columns: table => new
                {
                    maTaiKhoan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maVaiTro = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    email = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    matKhau = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    trangThai = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaiKhoan", x => x.maTaiKhoan);
                    table.ForeignKey(
                        name: "FK_TaiKhoan_VaiTro_maVaiTro",
                        column: x => x.maVaiTro,
                        principalTable: "VaiTro",
                        principalColumn: "MaVaiTro");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NHANVIEN",
                columns: table => new
                {
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTaiKhoan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maKhoa = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maDiaDiem = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    hoTen = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CCCD = table.Column<string>(type: "varchar(12)", maxLength: 12, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    gioiTinh = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    soDienThoai = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NHANVIEN", x => x.maNhanVien);
                    table.ForeignKey(
                        name: "FK_NHANVIEN_DIADIEM_maDiaDiem",
                        column: x => x.maDiaDiem,
                        principalTable: "DIADIEM",
                        principalColumn: "maDiaDiem");
                    table.ForeignKey(
                        name: "FK_NHANVIEN_KhoaCongTac_maKhoa",
                        column: x => x.maKhoa,
                        principalTable: "KhoaCongTac",
                        principalColumn: "maKhoa");
                    table.ForeignKey(
                        name: "FK_NHANVIEN_TaiKhoan_maTaiKhoan",
                        column: x => x.maTaiKhoan,
                        principalTable: "TaiKhoan",
                        principalColumn: "maTaiKhoan");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "THONGBAO",
                columns: table => new
                {
                    maThongBao = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTaiKhoanGui = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTaiKhoanNhan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    noiDung = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    thoiGianGui = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    trangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_THONGBAO", x => x.maThongBao);
                    table.ForeignKey(
                        name: "FK_THONGBAO_TaiKhoan_maTaiKhoanGui",
                        column: x => x.maTaiKhoanGui,
                        principalTable: "TaiKhoan",
                        principalColumn: "maTaiKhoan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_THONGBAO_TaiKhoan_maTaiKhoanNhan",
                        column: x => x.maTaiKhoanNhan,
                        principalTable: "TaiKhoan",
                        principalColumn: "maTaiKhoan",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TinhNguyenVien",
                columns: table => new
                {
                    maTNV = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTaiKhoan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maPhuongXa = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    hoTen = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ngaySinh = table.Column<DateOnly>(type: "date", nullable: true),
                    gioiTinh = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nhomMau = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CCCD = table.Column<string>(type: "varchar(12)", maxLength: 12, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    soDienThoai = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    diaChi = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    trangThai = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TinhNguyenVien", x => x.maTNV);
                    table.ForeignKey(
                        name: "FK_TinhNguyenVien_PhuongXa_maPhuongXa",
                        column: x => x.maPhuongXa,
                        principalTable: "PhuongXa",
                        principalColumn: "maPhuongXa");
                    table.ForeignKey(
                        name: "FK_TinhNguyenVien_TaiKhoan_maTaiKhoan",
                        column: x => x.maTaiKhoan,
                        principalTable: "TaiKhoan",
                        principalColumn: "maTaiKhoan");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TINNHAN",
                columns: table => new
                {
                    maTinNhan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTaiKhoanGui = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTaiKhoanNhan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    noiDung = table.Column<string>(type: "TEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    thoiGian = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    trangThai = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TINNHAN", x => x.maTinNhan);
                    table.ForeignKey(
                        name: "FK_TINNHAN_TaiKhoan_maTaiKhoanGui",
                        column: x => x.maTaiKhoanGui,
                        principalTable: "TaiKhoan",
                        principalColumn: "maTaiKhoan",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TINNHAN_TaiKhoan_maTaiKhoanNhan",
                        column: x => x.maTaiKhoanNhan,
                        principalTable: "TaiKhoan",
                        principalColumn: "maTaiKhoan",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CHIENDICHHIENMAU",
                columns: table => new
                {
                    maChienDich = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maDiaDiem = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tenChienDich = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    thoiGianBD = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    thoiGianKT = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    soLuongDuKien = table.Column<int>(type: "int", nullable: true),
                    trangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    imageUrl = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CHIENDICHHIENMAU", x => x.maChienDich);
                    table.ForeignKey(
                        name: "FK_CHIENDICHHIENMAU_DIADIEM_maDiaDiem",
                        column: x => x.maDiaDiem,
                        principalTable: "DIADIEM",
                        principalColumn: "maDiaDiem");
                    table.ForeignKey(
                        name: "FK_CHIENDICHHIENMAU_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PHIEUNHAPXUAT",
                columns: table => new
                {
                    maPhieu = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    loaiPhieu = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ngayNhapXuat = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PHIEUNHAPXUAT", x => x.maPhieu);
                    table.ForeignKey(
                        name: "FK_PHIEUNHAPXUAT_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TINTUC",
                columns: table => new
                {
                    maTinTuc = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tieuDe = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    noiDung = table.Column<string>(type: "LONGTEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    hinhAnh = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ngayDang = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    trangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TINTUC", x => x.maTinTuc);
                    table.ForeignKey(
                        name: "FK_TINTUC_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DONDANGKY",
                columns: table => new
                {
                    maDon = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTNV = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maChienDich = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maQR = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    thoiGianDangKy = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    trangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    theTich = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DONDANGKY", x => x.maDon);
                    table.ForeignKey(
                        name: "FK_DONDANGKY_CHIENDICHHIENMAU_maChienDich",
                        column: x => x.maChienDich,
                        principalTable: "CHIENDICHHIENMAU",
                        principalColumn: "maChienDich");
                    table.ForeignKey(
                        name: "FK_DONDANGKY_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                    table.ForeignKey(
                        name: "FK_DONDANGKY_TinhNguyenVien_maTNV",
                        column: x => x.maTNV,
                        principalTable: "TinhNguyenVien",
                        principalColumn: "maTNV");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CHUNGNHAN",
                columns: table => new
                {
                    maChungNhan = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maDon = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    filePDF = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ngayCap = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CHUNGNHAN", x => x.maChungNhan);
                    table.ForeignKey(
                        name: "FK_CHUNGNHAN_DONDANGKY_maDon",
                        column: x => x.maDon,
                        principalTable: "DONDANGKY",
                        principalColumn: "maDon");
                    table.ForeignKey(
                        name: "FK_CHUNGNHAN_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HOSOSUCKHOE",
                columns: table => new
                {
                    maHoSo = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maDon = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    khangSinh = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    truyenNhiem = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    dauHong = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    coThai = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    moTaKhac = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HOSOSUCKHOE", x => x.maHoSo);
                    table.ForeignKey(
                        name: "FK_HOSOSUCKHOE_DONDANGKY_maDon",
                        column: x => x.maDon,
                        principalTable: "DONDANGKY",
                        principalColumn: "maDon");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "KETQUALAMSANG",
                columns: table => new
                {
                    maKQ = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maDon = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    huyetAp = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nhipTim = table.Column<int>(type: "int", nullable: true),
                    canNang = table.Column<double>(type: "double", nullable: true),
                    nhietDo = table.Column<double>(type: "double", nullable: true),
                    ketQua = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    lyDoTuChoi = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KETQUALAMSANG", x => x.maKQ);
                    table.ForeignKey(
                        name: "FK_KETQUALAMSANG_DONDANGKY_maDon",
                        column: x => x.maDon,
                        principalTable: "DONDANGKY",
                        principalColumn: "maDon");
                    table.ForeignKey(
                        name: "FK_KETQUALAMSANG_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TUIMAU",
                columns: table => new
                {
                    maTuiMau = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maDon = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maKho = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    theTich = table.Column<int>(type: "int", nullable: true),
                    thoiGianLayMau = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    trangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nhietDoVanChuyen = table.Column<double>(type: "double", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TUIMAU", x => x.maTuiMau);
                    table.ForeignKey(
                        name: "FK_TUIMAU_DONDANGKY_maDon",
                        column: x => x.maDon,
                        principalTable: "DONDANGKY",
                        principalColumn: "maDon");
                    table.ForeignKey(
                        name: "FK_TUIMAU_KhoMau_maKho",
                        column: x => x.maKho,
                        principalTable: "KhoMau",
                        principalColumn: "maKho");
                    table.ForeignKey(
                        name: "FK_TUIMAU_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CHITIETNHAPXUAT",
                columns: table => new
                {
                    maPhieu = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTuiMau = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CHITIETNHAPXUAT", x => new { x.maPhieu, x.maTuiMau });
                    table.ForeignKey(
                        name: "FK_CHITIETNHAPXUAT_PHIEUNHAPXUAT_maPhieu",
                        column: x => x.maPhieu,
                        principalTable: "PHIEUNHAPXUAT",
                        principalColumn: "maPhieu",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CHITIETNHAPXUAT_TUIMAU_maTuiMau",
                        column: x => x.maTuiMau,
                        principalTable: "TUIMAU",
                        principalColumn: "maTuiMau",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "KETQUAXETNGHIEM",
                columns: table => new
                {
                    maKQ = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maTuiMau = table.Column<string>(type: "varchar(15)", maxLength: 15, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maNhanVien = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nhomMau = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    soLanXetNghiem = table.Column<int>(type: "int", nullable: true),
                    ketQua = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    moTa = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KETQUAXETNGHIEM", x => x.maKQ);
                    table.ForeignKey(
                        name: "FK_KETQUAXETNGHIEM_NHANVIEN_maNhanVien",
                        column: x => x.maNhanVien,
                        principalTable: "NHANVIEN",
                        principalColumn: "maNhanVien");
                    table.ForeignKey(
                        name: "FK_KETQUAXETNGHIEM_TUIMAU_maTuiMau",
                        column: x => x.maTuiMau,
                        principalTable: "TUIMAU",
                        principalColumn: "maTuiMau");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_CHIENDICHHIENMAU_maDiaDiem",
                table: "CHIENDICHHIENMAU",
                column: "maDiaDiem");

            migrationBuilder.CreateIndex(
                name: "IX_CHIENDICHHIENMAU_maNhanVien",
                table: "CHIENDICHHIENMAU",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_CHITIETNHAPXUAT_maTuiMau",
                table: "CHITIETNHAPXUAT",
                column: "maTuiMau");

            migrationBuilder.CreateIndex(
                name: "IX_CHUNGNHAN_maDon",
                table: "CHUNGNHAN",
                column: "maDon");

            migrationBuilder.CreateIndex(
                name: "IX_CHUNGNHAN_maNhanVien",
                table: "CHUNGNHAN",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_DIADIEM_maPhuongXa",
                table: "DIADIEM",
                column: "maPhuongXa");

            migrationBuilder.CreateIndex(
                name: "IX_DONDANGKY_maChienDich",
                table: "DONDANGKY",
                column: "maChienDich");

            migrationBuilder.CreateIndex(
                name: "IX_DONDANGKY_maNhanVien",
                table: "DONDANGKY",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_DONDANGKY_maTNV",
                table: "DONDANGKY",
                column: "maTNV");

            migrationBuilder.CreateIndex(
                name: "IX_HOSOSUCKHOE_maDon",
                table: "HOSOSUCKHOE",
                column: "maDon");

            migrationBuilder.CreateIndex(
                name: "IX_KETQUALAMSANG_maDon",
                table: "KETQUALAMSANG",
                column: "maDon");

            migrationBuilder.CreateIndex(
                name: "IX_KETQUALAMSANG_maNhanVien",
                table: "KETQUALAMSANG",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_KETQUAXETNGHIEM_maNhanVien",
                table: "KETQUAXETNGHIEM",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_KETQUAXETNGHIEM_maTuiMau",
                table: "KETQUAXETNGHIEM",
                column: "maTuiMau");

            migrationBuilder.CreateIndex(
                name: "IX_NHANVIEN_maDiaDiem",
                table: "NHANVIEN",
                column: "maDiaDiem");

            migrationBuilder.CreateIndex(
                name: "IX_NHANVIEN_maKhoa",
                table: "NHANVIEN",
                column: "maKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_NHANVIEN_maTaiKhoan",
                table: "NHANVIEN",
                column: "maTaiKhoan");

            migrationBuilder.CreateIndex(
                name: "IX_PHIEUNHAPXUAT_maNhanVien",
                table: "PHIEUNHAPXUAT",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_TaiKhoan_maVaiTro",
                table: "TaiKhoan",
                column: "maVaiTro");

            migrationBuilder.CreateIndex(
                name: "IX_THONGBAO_maTaiKhoanGui",
                table: "THONGBAO",
                column: "maTaiKhoanGui");

            migrationBuilder.CreateIndex(
                name: "IX_THONGBAO_maTaiKhoanNhan",
                table: "THONGBAO",
                column: "maTaiKhoanNhan");

            migrationBuilder.CreateIndex(
                name: "IX_TinhNguyenVien_maPhuongXa",
                table: "TinhNguyenVien",
                column: "maPhuongXa");

            migrationBuilder.CreateIndex(
                name: "IX_TinhNguyenVien_maTaiKhoan",
                table: "TinhNguyenVien",
                column: "maTaiKhoan");

            migrationBuilder.CreateIndex(
                name: "IX_TINNHAN_maTaiKhoanGui",
                table: "TINNHAN",
                column: "maTaiKhoanGui");

            migrationBuilder.CreateIndex(
                name: "IX_TINNHAN_maTaiKhoanNhan",
                table: "TINNHAN",
                column: "maTaiKhoanNhan");

            migrationBuilder.CreateIndex(
                name: "IX_TINTUC_maNhanVien",
                table: "TINTUC",
                column: "maNhanVien");

            migrationBuilder.CreateIndex(
                name: "IX_TUIMAU_maDon",
                table: "TUIMAU",
                column: "maDon");

            migrationBuilder.CreateIndex(
                name: "IX_TUIMAU_maKho",
                table: "TUIMAU",
                column: "maKho");

            migrationBuilder.CreateIndex(
                name: "IX_TUIMAU_maNhanVien",
                table: "TUIMAU",
                column: "maNhanVien");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CHITIETNHAPXUAT");

            migrationBuilder.DropTable(
                name: "CHUNGNHAN");

            migrationBuilder.DropTable(
                name: "HOSOSUCKHOE");

            migrationBuilder.DropTable(
                name: "INVALIDATED_TOKEN");

            migrationBuilder.DropTable(
                name: "KETQUALAMSANG");

            migrationBuilder.DropTable(
                name: "KETQUAXETNGHIEM");

            migrationBuilder.DropTable(
                name: "THONGBAO");

            migrationBuilder.DropTable(
                name: "TINNHAN");

            migrationBuilder.DropTable(
                name: "TINTUC");

            migrationBuilder.DropTable(
                name: "PHIEUNHAPXUAT");

            migrationBuilder.DropTable(
                name: "TUIMAU");

            migrationBuilder.DropTable(
                name: "DONDANGKY");

            migrationBuilder.DropTable(
                name: "KhoMau");

            migrationBuilder.DropTable(
                name: "CHIENDICHHIENMAU");

            migrationBuilder.DropTable(
                name: "TinhNguyenVien");

            migrationBuilder.DropTable(
                name: "NHANVIEN");

            migrationBuilder.DropTable(
                name: "DIADIEM");

            migrationBuilder.DropTable(
                name: "KhoaCongTac");

            migrationBuilder.DropTable(
                name: "TaiKhoan");

            migrationBuilder.DropTable(
                name: "PhuongXa");

            migrationBuilder.DropTable(
                name: "VaiTro");
        }
    }
}
