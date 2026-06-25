using HienMauNhanDao_DaNang.Common;
using HienMauNhanDao_DaNang.Models.DTOs.Requests;
using HienMauNhanDao_DaNang.Models.DTOs.Responses;
using HienMauNhanDao_DaNang.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.UA;

namespace HienMauNhanDao_DaNang.Controllers
{

    //Khai báo đây là một API Controller, tự động validate dữ liệu
    [ApiController]

    // [Route] = Đường dẫn gốc. "[controller]" sẽ tự lấy tên class bỏ chữ "Controller"
    // AuthController → Đường dẫn là: /api/auth
    [Route("api/[controller]")]


    public class AuthController : ControllerBase
    {
        // Khai báo (Controller) cần gọi đến (Service)
        private readonly ITaiKhoanService _taiKhoanService;


        public AuthController(ITaiKhoanService taiKhoanService)
        {
            _taiKhoanService = taiKhoanService;

        }


        //APU ĐĂNG NHẬP
        //[HTTP POST] Nhận vào đường dẫn: POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                //Gọi service đến làm việc 
                var response = await _taiKhoanService.LoginAsync(request);

                //trả về kết quả bọc trong apirespnse
                return Ok(ApiResponse<LoginResponse>.Ok(response, "Dang nhap thanh cong"));
            }
            catch (UnauthorizedAccessException ex)
            {
                // Báo lỗi 401: Lỗi xác thực
                return Unauthorized(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                // Báo lỗi 500: Lỗi server không lường trước

                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }


        //API ĐĂNG KÝ
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                await _taiKhoanService.RegisterAsync(request);

                // Đăng ký không trả về dữ liệu (chỉ cần báo thành công)

                return Ok(ApiResponse<object>.Ok("Dang ky thanh cong"));
            }
            catch (InvalidOperationException ex)
            {

                // Báo lỗi 400: Dữ liệu gửi lên không hợp lệ (VD: Email trùng)

                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }
        


    [HttpGet("profile")]
        [Authorize]     //<== AI CÓ TOKEN MỚI ĐƯỢC VÀO!

        public IActionResult GetProfile()
        {
            // C# sẽ tự động lấy Token do React gửi lên, giải mã nó để biết ai đang gọi API
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            return Ok(new
            {
                thongDiep = $"Xin chao {email}, day la kho bao chi nhung nguoi co token moi xem duoc"
            });

        }

    }
}

