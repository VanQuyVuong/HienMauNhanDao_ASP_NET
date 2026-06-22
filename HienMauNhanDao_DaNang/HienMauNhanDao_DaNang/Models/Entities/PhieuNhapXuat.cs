using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("PHIEUNHAPXUAT")]
    public class PhieuNhapXuat
    {
        [Key]
        [Column("maPhieu")]
        [MaxLength(10)]
        public string MaPhieu { get; set; } = string.Empty;

        // FK → NhanVien (ai thực hiện)
        [Column("maNhanVien")]
        [MaxLength(10)]
        public string? MaNhanVien { get; set; }

        [ForeignKey("MaNhanVien")]
        public NhanVien? NhanVienThucHien { get; set; }

        [Required]
        [Column("loaiPhieu")]
        public LoaiPhieuNhapXuat LoaiPhieu { get; set; }

        [Column("ngayNhapXuat")]
        public DateOnly? NgayNhapXuat { get; set; }

        // 1 phiếu có nhiều chi tiết → danh sách ChiTietNhapXuat
        public ICollection<ChiTietNhapXuat> ChiTietPhieu { get; set; }
            = new List<ChiTietNhapXuat>();
    }
}
