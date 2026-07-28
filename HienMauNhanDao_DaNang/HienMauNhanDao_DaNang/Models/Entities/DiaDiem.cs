using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("DIADIEM")]
    public class DiaDiem
    {
        [Key]
        [Column("maDiaDiem")]
        [MaxLength(10)]
        public string MaDiaDiem { set; get; } = string.Empty;

        [Required]
        [Column("tenDiaDiem")]
        [MaxLength(255)]
        public string TenDiaDiem { set; get; } = string.Empty;

        [Column("diaChiChiTiet")]
        [MaxLength(255)]
        public string? DiaChi { set; get; }

        [Column("loaiDiaDiem")]
        public LoaiDiaDiem? LoaiDiaDiem { set; get; }

        [Column("hinhThuc")]
        [MaxLength(50)]
        public string? HinhThuc { set; get; } = "CoDinh"; // "CoDinh" hoặc "LuuDong"



        [Column("maPhuongXa")]
        [MaxLength(10)]
        public string? MaPhuongXa { set; get; }

        [ForeignKey("MaPhuongXa")]
        public PhuongXa? PhuongXa { set; get; }
    }
}
