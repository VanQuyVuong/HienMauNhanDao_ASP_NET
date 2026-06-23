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
                        ClockSkew = TimeSpan.Zero
                    };
                });

            builder.Services.AddAuthorization();


            //5.Swagger -test api
            //builder.Services.AddEndpointsApiExplorer();
            //builder.Services.AddSwaggerGen();

            //AddScoped: khi từ FE gửi 1 reqquerst cấp cho 1 sêvices riêng
            builder.Services.AddScoped<ITaiKhoanService, TaiKhoanServiceImpl>();

            // AddSingleton: Cả nhà hàng chỉ dùng chung 1 máy làm Token

            builder.Services.AddSingleton<JwtHelper>();

            builder.Services.AddOpenApi();

            var app = builder.Build();

            app.MapOpenApi();
            app.MapScalarApiReference(options =>
            {
                // Bạn có thể đổi màu giao diện (Default, DeepSpace, Moon...)
                options.WithTheme(ScalarTheme.DeepSpace);
            });


            //app.UseSwaggerUI();
            //app.UseSwagger();

            app.UseCors("AllowReactApp");

            app.UseAuthentication();

            app.MapControllers();

            app.Run();

        }
    }
}
