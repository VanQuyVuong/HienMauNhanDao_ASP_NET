using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Linq;
using HienMauNhanDao_DaNang.Common;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", "webp" };
        private const long MaxFileSize = 5 * 1024 * 1024;

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(
            IFormFile file, 
            [FromForm] string type = "chiendich", 
            [FromForm] string category = "", 
            [FromForm] string title = "")
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<Object>.Fail("Vui lòng chọn file ảnh hợp lệ "));
                }

                if(file.Length > MaxFileSize)
                {
                    return BadRequest(ApiResponse<Object>.Fail("Ảnh không được vượt quá 5M"));   
                }

                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(ext))
                {
                    return BadRequest(ApiResponse<Object>.Fail("Chỉ chấp nhận những ảnh định dạng JPG, PNG, WEBP hoặc GIF"));
                }

                // Tiền xử lý title thành chuỗi không dấu (nếu có title)
                string safeTitle = "image";
                if (!string.IsNullOrEmpty(title))
                {
                    safeTitle = new string(title
                        .Where(c => char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
                        .ToArray())
                        .Replace(" ", "_")
                        .ToLower();
                    
                    if (safeTitle.Length > 30) safeTitle = safeTitle.Substring(0, 30);
                }

                string timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
                string filename = "";
                
                // Quy tắc đặt tên và thư mục lưu trữ
                string targetFolder = type.ToLower() == "tintuc" ? "tintuc" : "chiendich";
                
                if (type.ToLower() == "tintuc")
                {
                    string catStr = string.IsNullOrEmpty(category) ? "Chung" : category;
                    filename = $"tintuc_{catStr}_{safeTitle}_{timestamp}{ext}";
                }
                else
                {
                    filename = $"chiendich_{timestamp}_{Guid.NewGuid().ToString().Substring(0, 8)}{ext}";
                }

                // Đường dẫn thư mục
                string fePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(),"..","..","FE_HienMauNhanDao","public","images", targetFolder));
                if (!Directory.Exists(fePath))
                {
                    Directory.CreateDirectory(fePath);
                }
                string feFilePath = Path.Combine(fePath, filename);
                using (var stream = new FileStream(feFilePath,FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                string bePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", targetFolder);
                if (!Directory.Exists(bePath))
                {
                    Directory.CreateDirectory(bePath);
                }
                string beFilePath = Path.Combine(bePath, filename);
                using (var stream = new FileStream(beFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Trả về đường dẫn bao gồm cả thư mục con để Frontend gọi đúng ảnh
                string relativePath = $"{targetFolder}/{filename}";
                return Ok(ApiResponse<string>.Ok(relativePath, "Tải ảnh lên thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail($"Lỗi khi tải ảnh lên server : {ex.Message}"));
            }
        }
    }
}
