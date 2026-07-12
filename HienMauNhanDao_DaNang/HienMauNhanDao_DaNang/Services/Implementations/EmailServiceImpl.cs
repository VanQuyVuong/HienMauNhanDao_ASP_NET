using HienMauNhanDao_DaNang.Services.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace HienMauNhanDao_DaNang.Services.Implementations
{
    public class EmailServiceImpl : IEmailService
    {
        private readonly IConfiguration _configuration;

        // Inject IConfiguration để đọc các thông số cấu hình Email từ appsettings.json
        public EmailServiceImpl(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp)
        {

            //1. Đọc các thông số cấu hình từ section "EmailSettings" trong appsetting.json

            var emailSettings = _configuration.GetSection("EmailSettings");
            var host = emailSettings["Host"];
            var port = int.Parse(emailSettings["Port"] ?? "587");
            var username = emailSettings["Username"];
            var password = emailSettings["Password"];
            var displayName = emailSettings["DisplayName"] ?? "Hệ Thống Hiến Máu Nhân Đạo";

            //2.Tạo đối tượng email gửi đi (MimeMessage)
            var emailMessage = new MimeMessage();
            //Người gửi :Tên hiển thị + email của hệ thống 
            emailMessage.From.Add(new MailboxAddress(displayName, username));
            //Người nhận :Email của tình nguyện viên đăng ký 
            emailMessage.To.Add(new MailboxAddress("", toEmail));
            //tiêu đề email
            emailMessage.Subject = "Mã xác thực OTP - Hệ thống Quản lý Hiến máu nhân đạo";

            //Nội dung email dạng văn bản thuần(TextBody)
            var bodyBuilder = new BodyBuilder
            {
                TextBody = $"Xin chào,\n\nMã OTP của bạn là: {otp}\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nBan Quản Trị"
            };
            emailMessage.Body = bodyBuilder.ToMessageBody();

            //3. kết nối SMTP server và thực hiện gửi email 
            using var client = new SmtpClient();

            //kết nối bất đồng bộ tới máy chủ mail sử dụng phường thức STARTLS
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);

            //Xác thực thông tin tài khoản SMTP gửi email
            await client.AuthenticateAsync(username, password);

            //tiến hành gửi email đi 
            await client.SendAsync(emailMessage);

            //Ngắt kết nối một cách an toàn 
            await client.DisconnectAsync(true);
        } 


    }
}
