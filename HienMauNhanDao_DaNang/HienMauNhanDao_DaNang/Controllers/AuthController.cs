using HienMauNhanDao_DaNang.Common;
using HienMauNhanDao_DaNang.Models.DTOs.Requests;
using HienMauNhanDao_DaNang.Models.DTOs.Responses;
using HienMauNhanDao_DaNang.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HienMauNhanDao_DaNang.Services;
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
        private readonly EmailQueueService _emailQueue;

        public AuthController(ITaiKhoanService taiKhoanService, IOtpService otpService, EmailQueueService emailQueue)
        {
            _taiKhoanService = taiKhoanService;
            _otpService = otpService;
            _emailQueue = emailQueue;
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
            var email = User.Identity?.Name ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
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


                // 2. Tạo mã OTP, in ra Terminal và trả về response để test trên Scalar
                string otp;
                try
                {
                    otp = _otpService.GenerateOtp(request.Email);
                }
                catch (InvalidOperationException ex) when (ex.Message == "COOLDOWN")
                {
                    return BadRequest(ApiResponse<object>.Fail("Vui lòng đợi 60 giây trước khi yêu cầu lại mã OTP để tránh Spam."));
                }

                try
                {
                    // Đẩy email vào Background Queue (Bất đồng bộ - Tốn 0.001 giây)
                    await _emailQueue.QueueEmailAsync(request.Email, otp);
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"[WARNING QUEUE]: Không thể đẩy email tới hàng đợi {request.Email} - {emailEx.Message}");
                }

                Console.WriteLine($"\n========================================================");
                Console.WriteLine($"🔑 [MÃ OTP TEST SCALAR DÀNH CHO {request.Email}]: {otp}");
                Console.WriteLine($"========================================================\n");

                return Ok(ApiResponse<object>.Ok(new { otp = otp }, $"Gửi OTP thành công! Mã OTP test trên Scalar: {otp}"));
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

        //DTO CHỨA DỮ LIỆU ĐẶT LẠI MẬT KHẨU
        public class ResetPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
            public string ConfirmNewPassword { get; set; } = string.Empty;
        }

        //API YÊU CẦU GỬI OTP KHI QUÊN MẬT KHẨU
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] OtpRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email))
                {
                    return BadRequest(ApiResponse<object>.Fail("Bắt buộc nhập Email"));
                }

                // Kiểm tra email đã đăng ký chưa
                var emailExist = await _taiKhoanService.CheckEmailExistAsync(request.Email);
                if (!emailExist)
                {
                    return BadRequest(ApiResponse<object>.Fail("Email này chưa được đăng ký tài khoản"));
                }

                // Tạo mã OTP, in ra Console và gửi mail
                string otp;
                try
                {
                    otp = _otpService.GenerateOtp(request.Email);
                }
                catch (InvalidOperationException ex) when (ex.Message == "COOLDOWN")
                {
                    return BadRequest(ApiResponse<object>.Fail("Vui lòng đợi 60 giây trước khi yêu cầu lại mã OTP để tránh Spam."));
                }

                try
                {
                    await _emailQueue.QueueEmailAsync(request.Email, otp);
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"[WARNING QUEUE]: Không thể đẩy email tới hàng đợi {request.Email} - {emailEx.Message}");
                }

                Console.WriteLine($"\n========================================================");
                Console.WriteLine($"🔑 [MÃ OTP QUÊN MẬT KHẨU DÀNH CHO {request.Email}]: {otp}");
                Console.WriteLine($"========================================================\n");

                return Ok(ApiResponse<object>.Ok(new { otp = otp }, $"Gửi OTP quên mật khẩu thành công! Mã OTP test trên Scalar: {otp}"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        //API ĐẶT LẠI MẬT KHẨU MỚI
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp) || string.IsNullOrEmpty(request.NewPassword))
                {
                    return BadRequest(ApiResponse<object>.Fail("Vui lòng nhập đầy đủ Email, OTP và mật khẩu mới"));
                }

                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    return BadRequest(ApiResponse<object>.Fail("Mật khẩu xác nhận không khớp"));
                }

                // Xác thực mã OTP
                var isValid = _otpService.ValidateOtp(request.Email, request.Otp);
                if (!isValid)
                {
                    return BadRequest(ApiResponse<object>.Fail("Mã OTP không hợp lệ hoặc đã hết hạn"));
                }

                // Cập nhật mật khẩu mới
                await _taiKhoanService.ResetPasswordAsync(request.Email, request.NewPassword);

                // Xoá trạng thái OTP sau khi đổi mật khẩu thành công
                _otpService.ClearVerification(request.Email);

                return Ok(ApiResponse<object>.Ok("Đặt lại mật khẩu thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }
    }
}

