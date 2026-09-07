# Stage 1: Dùng ảnh SDK của .NET 10 để build mã nguồn
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file csproj và restore các thư viện (NuGet packages)
COPY ["HienMauNhanDao_DaNang.csproj", "./"]
RUN dotnet restore "./HienMauNhanDao_DaNang.csproj"

# Copy toàn bộ code còn lại và build dự án
COPY . .
RUN dotnet publish "HienMauNhanDao_DaNang.csproj" -c Release -o /app/publish

# Stage 2: Dùng ảnh ASP.NET 10 (chỉ chứa runtime nhẹ nhàng) để chạy app
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Mở cổng 8080 (mặc định của .NET Core / .NET 8+)
EXPOSE 8080

ENTRYPOINT ["dotnet", "HienMauNhanDao_DaNang.dll"]
