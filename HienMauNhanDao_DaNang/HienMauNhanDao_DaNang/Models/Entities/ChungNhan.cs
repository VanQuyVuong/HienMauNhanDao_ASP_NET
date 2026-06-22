using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("CHUNGNHAN")]
    public class ChungNhan
    {
        [Key]
        [Column("maChungNhan")]
        [MaxLength(10)]
        public string MaChungNhan { get; set; } = string.Empty;

        // FK → DonDangKy
        [Column("maDon")]
        [MaxLength(10)]
        public string? MaDon { get; set; }

        [ForeignKey("MaDon")]
        public DonDangKy? DonDangKy { get; set; }

        // FK → NhanVien (người ký chứng nhận)
        [Column("maNhanVien")]
        [MaxLength(10)]
        public string? MaNhanVien { get; set; }

        [ForeignKey("MaNhanVien")]
        public NhanVien? NhanVienKy { get; set; }

        [Column("filePDF")]
        public string? FilePDF { get; set; }

        // DateOnly = chỉ lưu ngày, không lưu giờ
        [Column("ngayCap")]
        public DateOnly? NgayCap { get; set; }
    }
}
