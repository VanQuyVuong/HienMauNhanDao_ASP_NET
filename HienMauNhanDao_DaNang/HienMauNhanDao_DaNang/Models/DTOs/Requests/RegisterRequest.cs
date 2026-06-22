using System.ComponentModel.DataAnnotations;

namespace HienMauNhanDao_DaNang.Models.DTOs.Requests
{
    public class RegisterRequest
    {

        [Required(ErrorMessage = "Eamil khong duoc de trong")]
        [EmailAddress(ErrorMessage = "Email khong dung dinh dang")]
        public string Email { set; get; } = string.Empty;

        [Required(ErrorMessage = "Mat khau khong duoc de trong")]
        [MinLength(6, ErrorMessage = "Mat khau phai tu 6 ky tu tro len")]
        [MaxLength(50, ErrorMessage = "Mat khau khong qua 50 ky tu")]
        public string MatKhau { set; get; } = string.Empty;

        // THÊM VÀO để BE cũng kiểm tra lại mật khẩu confirm pasword

        [Required(ErrorMessage = "Vui lòng nhập lại mật khẩu")]
        public string XacNhanMatKhau { get; set; } = string.Empty;
    }
}
