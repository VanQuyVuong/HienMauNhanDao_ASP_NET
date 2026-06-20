using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Models.Entities
{

    [Table("KhoMau")]
    public class KhoMau
    {
        [Key]
        [Column("maKho")]
        [MaxLength(10)]
        public string MaKho { set; get; } = string.Empty;

        
        [Column("tenKho")]
        [MaxLength(100)]
        public string TenKho { set; get; } = string.Empty;


        // Dùng Enum NhomMau đã tạo ở bước trước
        [Column("nhomMau")]
        public NhomMau? NhomMau { set; get; }


        [Column("soLuongTon")]
        public int? SoLuongTon { set; get; }


        [Column("nguongAnToan")]
        public int? NguongAnToan { get; set; }


        [Column("moTa")]
        [MaxLength(200)]
        public string? MoTa { get; set; }
    }
}
