using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace HienMauNhanDao_DaNang.Data
{
    public class AppDbContext:DbContext 
    {
        // Constructor - nhận cấu hình từ Program.cs
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }


        //DANH SÁCH CÁC BẢNG


        public DbSet<VaiTro> VaiTros { get; set; }
        public DbSet<TaiKhoan> TaiKhoans { get; set; }
        public DbSet<PhuongXa> PhuongXas { get; set; }
        public DbSet<KhoaCongTac> KhoaCongTacs { get; set; }
        public DbSet<DiaDiem> DiaDiems { get; set; }
        public DbSet<TinhNguyenVien> TinhNguyenViens { get; set; }
        public DbSet<NhanVien> NhanViens { get; set; }
        public DbSet<KhoMau> KhoMaus { get; set; }
        public DbSet<ChienDichHienMau> ChienDichHienMaus { get; set; }
        public DbSet<DonDangKy> DonDangKys { get; set; }
        public DbSet<TuiMau> TuiMaus { get; set; }
        public DbSet<HoSoSucKhoe> HoSoSucKhoes { get; set; }
        public DbSet<KetQuaLamSang> KetQuaLamSangs { get; set; }
        public DbSet<KetQuaXetNghiem> KetQuaXetNghiems { get; set; }
        public DbSet<ChungNhan> ChungNhans { get; set; }
        public DbSet<PhieuNhapXuat> PhieuNhapXuats { get; set; }
        public DbSet<ChiTietNhapXuat> ChiTietNhapXuats { get; set; }
        public DbSet<ThongBao> ThongBaos { get; set; }
        public DbSet<TinNhan> TinNhans { get; set; }
        public DbSet<TinTuc> TinTucs { get; set; }
        public DbSet<InvalidatedToken> InvalidatedTokens { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Tạo khoá chính kepf cho ChiTietNhapXuat
            //dùng 2 cột MaPhieu, MaTuiMau làm khoá chính
            modelBuilder.Entity<ChiTietNhapXuat>()
                .HasKey(ct => new { ct.MaPhieu, ct.MaTuiMau });

            // Custom converter cho GioiTinh để đọc được cả 'Nữ' và 'Nu' từ DB
            var gioiTinhConverter = new ValueConverter<GioiTinh?, string?>(
                v => v == null ? null : (v == GioiTinh.Nu ? "Nữ" : v.ToString()),
                v => string.IsNullOrEmpty(v) ? null : (v == "Nữ" || v == "Nu" ? GioiTinh.Nu : v == "Nam" ? GioiTinh.Nam : GioiTinh.Khac)
            );

            // Custom converter cho NhomMau để đọc mượt mà cả 'A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-' và 'A_positive' v.v...
            var nhomMauConverter = new ValueConverter<NhomMau?, string?>(
                v => v == null ? null : v.ToString(),
                v => string.IsNullOrEmpty(v) ? null :
                     (v == "A+" || v == "A_positive") ? NhomMau.A_positive :
                     (v == "A-" || v == "A_negative") ? NhomMau.A_negative :
                     (v == "B+" || v == "B_positive") ? NhomMau.B_positive :
                     (v == "B-" || v == "B_negative") ? NhomMau.B_negative :
                     (v == "O+" || v == "O_positive") ? NhomMau.O_positive :
                     (v == "O-" || v == "O_negative") ? NhomMau.O_negative :
                     (v == "AB+" || v == "AB_positive") ? NhomMau.AB_positive :
                     (v == "AB-" || v == "AB_negative") ? NhomMau.AB_negative : NhomMau.O_positive
            );

            //Lưu enum dưới dạng chuỗi 
            modelBuilder.Entity<TinhNguyenVien>()
                .Property(t => t.GioiTinh).HasConversion(gioiTinhConverter);

            modelBuilder.Entity<TinhNguyenVien>()
                .Property(t => t.NhomMau).HasConversion(nhomMauConverter);

            modelBuilder.Entity<NhanVien>().Property(n => n.GioiTinh).HasConversion(gioiTinhConverter);

            modelBuilder.Entity<ChienDichHienMau>().Property(c => c.TrangThai).HasConversion<string>();
            modelBuilder.Entity<ChienDichHienMau>().Property(c => c.MucDoUuTien).HasConversion<string>();

            // Custom converter cho TrangThaiDonDangKy để tương thích mọi giá trị chuỗi từ DB (DaHien, DaDangKy, ChoDuyet...)
            var trangThaiDonConverter = new ValueConverter<TrangThaiDonDangKy, string>(
                v => v.ToString(),
                v => string.IsNullOrEmpty(v) ? TrangThaiDonDangKy.ChoDuyet :
                     (v == "DaHien" || v == "Da_Hien" || v == "DaHoanThanh" || v == "HoanThanh") ? TrangThaiDonDangKy.DaHoanThanh :
                     (v == "DaDangKy" || v == "ChoDuyet") ? TrangThaiDonDangKy.ChoDuyet :
                     (v == "DaDuyet") ? TrangThaiDonDangKy.DaDuyet :
                     (v == "DaTuChoi") ? TrangThaiDonDangKy.DaTuChoi :
                     (v == "DaHuy") ? TrangThaiDonDangKy.DaHuy : TrangThaiDonDangKy.ChoDuyet
            );

            modelBuilder.Entity<DonDangKy>().Property(d => d.TrangThai).HasConversion(trangThaiDonConverter);

            // Custom converter cho TrangThaiTuiMau để đọc mượt mà mọi giá trị tiếng Việt/tiếng Anh từ CSDL SQL ('Nhập kho', 'Chờ xét nghiệm', 'DaLuuKho', 'DaXetNghiem'...)
            var trangThaiTuiMauConverter = new ValueConverter<TrangThaiTuiMau, string>(
                v => v.ToString(),
                v => string.IsNullOrEmpty(v) ? TrangThaiTuiMau.ChuaXuLy :
                     (v == "Nhập kho" || v == "DaLuuKho" || v == "Da_Luu_Kho") ? TrangThaiTuiMau.DaLuuKho :
                     (v == "Chờ xét nghiệm" || v == "ChuaXuLy" || v == "Chua_Xu_Ly") ? TrangThaiTuiMau.ChuaXuLy :
                     (v == "Đã xét nghiệm" || v == "Yêu cầu nhập kho" || v == "DaXetNghiem") ? TrangThaiTuiMau.DaXetNghiem :
                     (v == "Đã sử dụng" || v == "DaSuDung") ? TrangThaiTuiMau.DaSuDung :
                     (v == "Hết hạn" || v == "HetHan") ? TrangThaiTuiMau.HetHan :
                     (v == "Đã hủy" || v == "DaHuy" || v == "Hủy") ? TrangThaiTuiMau.DaHuy : TrangThaiTuiMau.ChuaXuLy
            );

            modelBuilder.Entity<TuiMau>().Property(t => t.TrangThai).HasConversion(trangThaiTuiMauConverter);

            modelBuilder.Entity<KhoMau>().Property(k => k.NhomMau).HasConversion(nhomMauConverter);

            modelBuilder.Entity<KetQuaXetNghiem>().Property(k => k.NhomMau).HasConversion(nhomMauConverter);

            modelBuilder.Entity<DiaDiem>().Property(d => d.LoaiDiaDiem).HasConversion<string>();

            modelBuilder.Entity<PhieuNhapXuat>().Property(p => p.LoaiPhieu).HasConversion<string>();

            modelBuilder.Entity<ThongBao>().Property(t => t.TrangThai).HasConversion<string>();

            // Custom converter cho TrangThaiTinTuc để đọc mượt mà 'Đã thêm' từ DB cũ
            var trangThaiTinTucConverter = new ValueConverter<TrangThaiTinTuc, string>(
                v => v.ToString(),
                v => string.IsNullOrEmpty(v) ? TrangThaiTinTuc.NhapLieu :
                     (v == "Đã thêm" || v == "DanDang") ? TrangThaiTinTuc.DanDang :
                     (v == "DaAn") ? TrangThaiTinTuc.DaAn : TrangThaiTinTuc.NhapLieu
            );

            modelBuilder.Entity<TinTuc>().Property(t => t.TrangThai).HasConversion(trangThaiTinTucConverter);




            modelBuilder.Entity<ThongBao>()
                .HasOne(t => t.NguoiGui)
                .WithMany()
                .HasForeignKey(t => t.MaTaiKhoanGui)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ThongBao>()
                .HasOne(t => t.NguoiNhan)
                .WithMany()
                .HasForeignKey(t => t.MaTaiKhoanNhan)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<TinNhan>()
                .HasOne(t => t.NguoiGui)
                .WithMany()
                .HasForeignKey(t => t.MaTaiKhoanGui)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TinNhan>()
                .HasOne(t => t.NguoiNhan)
                .WithMany()
                .HasForeignKey(t => t.MaTaiKhoanNhan)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
