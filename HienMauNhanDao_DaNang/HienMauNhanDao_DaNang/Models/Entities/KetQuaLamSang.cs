using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("KETQUALAMSANG")]
    public class KetQuaLamSang
    {
        [Key]
        [Column("maKQ")]
        [MaxLength(10)]
        public string MaKQ { get; set; } = string.Empty;

        // FK → DonDangKy
        [Column("maDon")]
        [MaxLength(10)]
        public string? MaDon { get; set; }

        [ForeignKey("MaDon")]
        public DonDangKy? DonDangKy { get; set; }

        // FK → NhanVien (bác sĩ khám)
        [Column("maNhanVien")]
        [MaxLength(10)]
        public string? MaNhanVien { get; set; }

        [ForeignKey("MaNhanVien")]
        public NhanVien? BacSiKham { get; set; }

        [Column("huyetAp")]
        [MaxLength(20)]
        public string? HuyetAp { get; set; }   // VD: "120/80"

        [Column("nhipTim")]
        public int? NhipTim { get; set; }       // nhịp/phút

        [Column("canNang")]
        public double? CanNang { get; set; }    // kg

        [Column("nhietDo")]
        public double? NhietDo { get; set; }    // °C

        // true = đủ điều kiện, false = bị từ chối
        [Column("ketQua")]
        public bool? KetQua { get; set; }

        [Column("lyDoTuChoi")]
        [MaxLength(500)]
        public string? LyDoTuChoi { get; set; }
    }
}
