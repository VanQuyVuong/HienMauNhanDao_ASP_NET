using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Security;
using HienMauNhanDao_DaNang.Services.Implementations;
using HienMauNhanDao_DaNang.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

//Using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

namespace HienMauNhanDao_DaNang
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);



            builder.Services.AddCors(option =>
            {
                option.AddPolicy("AllowReactApp", policy =>
                {
                    policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
                });
            });


            //
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });


            //3.Kết nối với Database
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<AppDbContext>(options => 
                options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));


            //4.Cấu hình JWT
            var jwtConfig = builder.Configuration.GetSection("Jwt");
            var secretKey = Encoding.UTF8.GetBytes(jwtConfig["Secret"]!);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
                        ValidateIssuer = true,
                        ValidIssuer = jwtConfig["Issuer"],
                        ValidateAudience = true,
                        ValidAudience = jwtConfig["Audience"],
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,
                        RoleClaimType = System.Security.Claims.ClaimTypes.Role
                    };
                });

            builder.Services.AddAuthorization();


            //5.Swagger -test api
            //builder.Services.AddEndpointsApiExplorer();
            //builder.Services.AddSwaggerGen();

            //AddScoped: khi từ FE gửi 1 reqquerst cấp cho 1 sêvices riêng
            builder.Services.AddMemoryCache(); // Cần cho OtpServiceImpl
            builder.Services.AddScoped<ITaiKhoanService, TaiKhoanServiceImpl>();
            builder.Services.AddScoped<IOtpService, OtpServiceImpl>();
            builder.Services.AddScoped<IEmailService, EmailServiceImpl>();
            builder.Services.AddHostedService<EmergencyCampaignHostedService>();

            // AddSingleton: Cả nhà hàng chỉ dùng chung 1 máy làm Token
            builder.Services.AddSingleton<JwtHelper>();

            builder.Services.AddOpenApi();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                try
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    dbContext.Database.Migrate();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Lưu ý: Không thể chạy tự động Migration (có thể do DB đã tồn tại cấu trúc): " + ex.Message);
                    try
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        // Tự động thêm cột diaChi dự phòng nếu DB cũ bị thiếu cột
                        dbContext.Database.ExecuteSqlRaw("ALTER TABLE DIADIEM ADD COLUMN diaChi VARCHAR(255) NULL;");
                    }
                    catch {}
                    try
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        dbContext.Database.ExecuteSqlRaw("ALTER TABLE TINHNGUYENVIEN ADD COLUMN diaChi VARCHAR(255) NULL;");
                    }
                    catch {}
                }
            }

            app.MapOpenApi();
            app.MapScalarApiReference(options =>
            {
                // Bạn có thể đổi màu giao diện (Default, DeepSpace, Moon...)
                options.WithTheme(ScalarTheme.DeepSpace);
            });


            //app.UseSwaggerUI();
            //app.UseSwagger();

            app.UseCors("AllowReactApp");
            app.UseStaticFiles(); // Thêm dòng này để Backend C# cho phép trình duyệt hiển thị ảnh từ thư mục wwwroot/images

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();

        }
    }
}
