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
        public async Task<IActionResult> UploadImage(IFormFile file)
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

                string filename = $"chiendich_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid().ToString().Substring(0, 8)}{ext}";
                string fePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(),"..","..","FE_HienMauNhanDao","public","images"));
                
                if (!Directory.Exists(fePath))
                {
                    Directory.CreateDirectory(fePath);
                }

                string feFilePath = Path.Combine(fePath, filename);

                using (var stream = new FileStream(feFilePath,FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                string bePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                if (!Directory.Exists(bePath))
                {
                    Directory.CreateDirectory(bePath);
                }
                string beFilePath = Path.Combine(bePath, filename);
                using (var stream = new FileStream(beFilePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(ApiResponse<string>.Ok(filename, "Tải ảnh lên thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail($"Lỗi khi tải ảnh lên server : {ex.Message}"));
            }
        }
    }
}
