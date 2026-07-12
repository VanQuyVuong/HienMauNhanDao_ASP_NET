namespace HienMauNhanDao_DaNang.Services.Interfaces
{
    public interface IOtpService
    {

        //sinh mã otp 6 chữ số ngẫu nhiên dựa trên email nguqoif nhận 
        string GenerateOtp(string email);
        //kiểm tra xem ottp người dùng nhập có khớp với mã đã lưu trong bộ nhớ tạm hay không 
        bool ValidateOtp(string email , string otp);    
        //kiểm tra xem email này đã xác thực OTP thành công chưa
        bool IsEmailVerified(string email);
        //xóa trạng thái xác thực OTP của email sau khi đăng ký thành công
        void ClearVerification(string email);
    }
}
