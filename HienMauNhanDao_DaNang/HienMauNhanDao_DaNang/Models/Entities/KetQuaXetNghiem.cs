using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("KETQUAXETNGHIEM")]
    public class KetQuaXetNghiem
    {
        [Key]
        [Column("maKQ")]
        [MaxLength(10)]
        public string MaKQ { get; set; } = string.Empty;

        // FK → TuiMau (xét nghiệm túi máu nào)
        [Column("maTuiMau")]
        [MaxLength(15)]
        public string? MaTuiMau { get; set; }

        [ForeignKey("MaTuiMau")]
        public TuiMau? TuiMau { get; set; }

        // FK → NhanVien (ai xét nghiệm)
        [Column("maNhanVien")]
        [MaxLength(10)]
        public string? MaNhanVien { get; set; }

        [ForeignKey("MaNhanVien")]
        public NhanVien? NhanVienXetNghiem { get; set; }

        [Column("nhomMau")]
        public NhomMau? NhomMau { get; set; }

        [Column("soLanXetNghiem")]
        public int? SoLanXetNghiem { get; set; }

        // true = máu đạt chuẩn, false = không đạt
        [Column("ketQua")]
        public bool? KetQua { get; set; }

        [Column("moTa")]
        [MaxLength(500)]
        public string? MoTa { get; set; }
    }
}
