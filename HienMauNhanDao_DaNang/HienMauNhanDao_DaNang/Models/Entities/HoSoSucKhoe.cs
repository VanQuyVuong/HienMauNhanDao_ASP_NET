using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("HOSOSUCKHOE")]
    public class HoSoSucKhoe
    {
        [Key]
        [Column("maHoSo")]
        [MaxLength(10)]
        public string MaHoSo { get; set; } = string.Empty;

        // FK → DonDangKy
        [Column("maDon")]
        [MaxLength(10)]
        public string? MaDon { get; set; }

        [ForeignKey("MaDon")]
        public DonDangKy? DonDangKy { get; set; }

        // bool? = true/false/null (có thể chưa trả lời)
        [Column("khangSinh")]
        public bool? KhangSinh { get; set; }

        [Column("truyenNhiem")]
        public bool? TruyenNhiem { get; set; }

        [Column("dauHong")]
        public bool? DauHong { get; set; }

        [Column("coThai")]
        public bool? CoThai { get; set; }

        [Column("moTaKhac")]
        [MaxLength(255)]
        public string? MoTaKhac { get; set; }
    }
}
