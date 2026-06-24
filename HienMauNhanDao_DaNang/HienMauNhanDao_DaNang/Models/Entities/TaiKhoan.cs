using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("TaiKhoan")]
    public class TaiKhoan
    {

        [Key]
        [Column("maTaiKhoan")]
        [MaxLength(10)]
        public string MaTaiKhoan { set; get; } = string.Empty;

        // --- KHÓA NGOẠI (Foreign Key) ---
        // Cột này lưu GIÁ TRỊ của maVaiTro trong bảng VAITRO
        [Column("maVaiTro")]
        [MaxLength(10)]
        public string? MaVaiTro { get; set; }


        // --- NAVIGATION PROPERTY ---
        // KHÔNG phải cột trong DB
        // Dùng để truy cập object VaiTro từ TaiKhoan
        [ForeignKey("MaVaiTro")]
        public VaiTro? VaiTro { get; set; }

        [Required]
        [Column("email")]
        [MaxLength(100)]
        public string Email { set; get; } = string.Empty;

        [Required]
        [Column("matKhau")]
        public string MatKhau { set; get; } = string.Empty;


        // bool = true/false, mặc định true = tài khoản đang hoạt động
        [Column("trangThai")]
        public bool TrangThai { set; get; } = true;
        
    }
}
