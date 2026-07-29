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

            //Lưu enum dưới dạng chuỗi 
            modelBuilder.Entity<TinhNguyenVien>()
                .Property(t => t.GioiTinh).HasConversion(gioiTinhConverter);

            modelBuilder.Entity<TinhNguyenVien>()
                .Property(t => t.NhomMau).HasConversion<string>();

            modelBuilder.Entity<NhanVien>().Property(n => n.GioiTinh).HasConversion(gioiTinhConverter);

            modelBuilder.Entity<ChienDichHienMau>().Property(c => c.TrangThai).HasConversion<string>();
            modelBuilder.Entity<ChienDichHienMau>().Property(c => c.MucDoUuTien).HasConversion<string>();

            modelBuilder.Entity<DonDangKy>().Property(d => d.TrangThai).HasConversion<string>();

            modelBuilder.Entity<TuiMau>().Property(t => t.TrangThai).HasConversion<string>();

            modelBuilder.Entity<KhoMau>().Property(k => k.NhomMau).HasConversion<string>();

            modelBuilder.Entity<KetQuaXetNghiem>().Property(k => k.NhomMau).HasConversion<string>();

            modelBuilder.Entity<DiaDiem>().Property(d => d.LoaiDiaDiem).HasConversion<string>();

            modelBuilder.Entity<PhieuNhapXuat>().Property(p => p.LoaiPhieu).HasConversion<string>();

            modelBuilder.Entity<ThongBao>().Property(t => t.TrangThai).HasConversion<string>();

            modelBuilder.Entity<TinTuc>().Property(t => t.TrangThai).HasConversion<string>();




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
