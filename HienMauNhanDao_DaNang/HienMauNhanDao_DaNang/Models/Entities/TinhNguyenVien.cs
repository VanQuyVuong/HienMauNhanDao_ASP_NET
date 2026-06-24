using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HienMauNhanDao_DaNang.Models.Enums;


namespace HienMauNhanDao_DaNang.Models.Entities
{

    [Table("TinhNguyenVien")]
    public class TinhNguyenVien
    {

        [Key]
        [Column("maTNV")]
        [MaxLength(10)]
        public string maTNV { set; get; } = string.Empty;



        [Column("maTaiKhoan")]
        [MaxLength(10)]
        public string? MaTaiKhoan { set; get; } = string.Empty;

        [ForeignKey("MaTaiKhoan")]
        public TaiKhoan? TaiKhoan { set; get; }



        [Column("maPhuongXa")]
        [MaxLength(10)]
        public string? MaPhuongXa { set; get; } = string.Empty;

        [ForeignKey("MaPhuongXa")]
        public PhuongXa? PhuongXa { set; get; }



        [Required]
        [Column("hoTen")]
        [MaxLength(255)]
        public string HoTen { set; get; } = string.Empty;



        [Column("ngaySinh")]
        public DateOnly? NgaySinh { set; get; }



        [Column("gioiTinh")]
        public GioiTinh? GioiTinh { get; set; }


        [Column("nhomMau")]
        public NhomMau? NhomMau { get; set; }


        [Column("CCCD")]
        [MaxLength(12)]
        public string? Cccd { get; set; }


        [Column("soDienThoai")]
        [MaxLength(10)]
        public string? SoDienThoai { get; set; }
        [Column("diaChi")]
        [MaxLength(255)]
        public string? DiaChi { get; set; }
        [Column("trangThai")]
        public bool TrangThai { get; set; } = true;
    }
}
        

        
   
