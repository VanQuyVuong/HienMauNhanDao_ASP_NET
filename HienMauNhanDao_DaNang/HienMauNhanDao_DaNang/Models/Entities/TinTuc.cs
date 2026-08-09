using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("TINTUC")]
    public class TinTuc
    {
        [Key]
        [Column("maTinTuc")]
        [MaxLength(10)]
        public string MaTinTuc { get; set; } = string.Empty;

        [Column("maNhanVien")]
        [MaxLength(10)]
        public string? MaNhanVien { get; set; }

        [ForeignKey("MaNhanVien")]
        public NhanVien? NguoiDang { get; set; }

        [Required]
        [Column("tieuDe")]
        public string TieuDe { get; set; } = string.Empty;

        [Column("noiDung", TypeName = "LONGTEXT")]
        public string? NoiDung { get; set; }

        [Column("hinhAnh")]
        public string? HinhAnh { get; set; }

        [Column("loaiTin")]
        [MaxLength(50)]
        public string LoaiTin { get; set; } = "ChienDich";

        [Column("chuKyLap")]
        [MaxLength(50)]
        public string ChuKyLap { get; set; } = "None";

        [Column("ngayDang")]
        public DateTime NgayDang { get; set; } = DateTime.Now;

        [Column("trangThai")]
        public TrangThaiTinTuc TrangThai { get; set; } = TrangThaiTinTuc.NhapLieu;
    }
}
