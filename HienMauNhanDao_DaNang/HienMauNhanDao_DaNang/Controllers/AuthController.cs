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
        
        private readonly ITaiKhoanService _taiKhoanService;
        private readonly IOtpService _otpService;
        private readonly IEmailService _emailService;

        public AuthController(ITaiKhoanService taiKhoanService, IOtpService otpService, IEmailService emailService)
        {
            _taiKhoanService = taiKhoanService;
            _otpService = otpService;
            _emailService = emailService;
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
                // Kiểm tra xem Email đã xác thực OTP thành công trước đó chưa
                var isVerified = _otpService.IsEmailVerified(request.Email);
                if (!isVerified)
                {
                    return BadRequest(ApiResponse<object>.Fail("Email chưa được xác thực OTP hoặc mã OTP đã hết hạn. Vui lòng xác thực lại."));
                }

                await _taiKhoanService.RegisterAsync(request);

                // Đăng ký thành công, xóa cờ xác thực OTP trong cache để tránh tái sử dụng
                _otpService.ClearVerification(request.Email);

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

        //DTO CHỨA DỮ LIỆU YÊU CẦU GỬI OTP
        public class OtpRequest
        {
            public string Email { set; get; } = string.Empty;
        }

        //DTO CHỨA DỮ LIỆU YÊU CẦU XÁC THỰC otp 
        public class VerifyOtpRequest
        {
            public string Email { set; get; } = string.Empty;
            public string Otp { set; get; } = string.Empty;
        }



        //API GỬI OTP QUA EMAIL     
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email))
                {
                    return BadRequest(ApiResponse<object>.Fail("Bắt buộc nhập Emial"));

                }

                //1. Kiểm tra email đã được đăng ký tài khoản chưa 
                var emailExist = await _taiKhoanService.CheckEmailExistAsync(request.Email);
                if (emailExist)
                {
                    return BadRequest(ApiResponse<object>.Fail("Email này đã được xử dụng"));
                }


                // 2.tạo mã otp và gửi qua email bất đồng bộ 
                var otp = _otpService.GenerateOtp(request.Email);
                await _emailService.SendOtpEmailAsync(request.Email, otp);

                return Ok(ApiResponse<object>.Ok("Gửi OTP thành công"));
            }catch(Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        //API XÁC THỰC MÃ OTP
        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp))
                {
                    return BadRequest(ApiResponse<object>.Fail("Email và mã OTP không được để trống"));

                }

                //GỌI DỊCH VỤ SO SÁNH Ã OTP
                var isValid = _otpService.ValidateOtp(request.Email, request.Otp);
                if (isValid)
                {
                    return Ok(ApiResponse<object>.Ok("Xác thực OTP hợp lệ"));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.Fail("Mã OTP không hợp lệ hoặc đẵ hết hạn"));
                }
            }catch(Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }
    }
}

