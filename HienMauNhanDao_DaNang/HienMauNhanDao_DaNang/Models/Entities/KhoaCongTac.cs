using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace HienMauNhanDao_DaNang.Models.Entities
{
    [Table("KhoaCongTac")]
    public class KhoaCongTac
    {

        [Key]
        [Column("maKhoa")]
        [MaxLength(10)]
        public string MaKhoa { set; get; } = string.Empty;

        [Required]
        [Column("tenKhoa")]
        [MaxLength(100)]
        public string TenKhoa { set; get; } = string.Empty;


    }
}
