using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HienMauNhanDao_DaNang.Security
{
    public class JwtHelper
    {

        private readonly IConfiguration _configuration;
        public JwtHelper (IConfiguration configuration)
        {
            _configuration = configuration;
        }


        private SymmetricSecurityKey GetSigningKey()
        {
            var secret = _configuration["Jwt:Secret"]!;
            var keyBytes = Encoding.UTF8.GetBytes(secret);
            return new SymmetricSecurityKey(keyBytes);
        }

        //Tao Aaccess Token (Het han sau 15 phut)
        public string GenerateAccessToken(string email, string role, string maTaiKhoan)
        {
            var expiratioMinutes = int.Parse(
                _configuration["Jwt:AccessTokenExprirationMinutes"] ?? "15");

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("maTaiKhoan",maTaiKhoan),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expiratioMinutes),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    GetSigningKey(),
                    SecurityAlgorithms.HmacSha256)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
            }


        //Taoj refresh Token(Het han sau 12 thang)
        public string GenerateRefreshToken(string email)
        {
            var expirationHours = int.Parse(
                _configuration["Jwt:RefreshTokenEpirationHours"] ?? "2");
            var claims = new[]
            {
                new Claim(ClaimTypes.Name,email ),
                new Claim("type","refresh"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(expirationHours),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    GetSigningKey(),
                    SecurityAlgorithms.HmacSha256)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        public bool ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = GetSigningKey(),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero

                }, out _);
                return true;
            }
            catch
            {
                return false;
            }
        }

        //Lay email tu token
        public string? GetEmailFromToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwt = tokenHandler.ReadJwtToken(token);
                return jwt.Claims.FirstOrDefault(c=>c.Type==ClaimTypes.Name)?.Value;
            }
            catch { return null; }
        }
        }
        }

    

