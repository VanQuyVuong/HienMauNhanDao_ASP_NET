using System.ComponentModel.DataAnnotations;
using System.Text;

namespace HienMauNhanDao_DaNang.Models.DTOs.Requests
{
    public class LoginRequest
    {

        [Required(ErrorMessage = "Email khong duoc de trong")]
        [EmailAddress(ErrorMessage = "Email khong dung dinh dang")]
        public string Email { set; get; } = string.Empty;


        [Required(ErrorMessage = "Mat khau khong duoc de trong")]
        [MinLength(6, ErrorMessage = "Mat khau phai tu 6 ky tu tro len")]
        public string MatKhau { get; set; } = string.Empty;
    }
}
