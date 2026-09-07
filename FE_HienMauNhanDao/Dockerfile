# Stage 1: Build ứng dụng React với Node.js
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các thư viện (node_modules)
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Chạy lệnh build để tạo ra thư mục dist (giao diện tĩnh)
RUN npm run build

# Stage 2: Chạy ứng dụng web bằng Nginx (Máy chủ web siêu nhẹ)
FROM nginx:alpine

# Copy toàn bộ file build từ Stage 1 sang thư mục mặc định của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở cổng 80 để Nginx có thể nhận request từ bên ngoài
EXPOSE 80

# Copy file cấu hình nginx (giải quyết lỗi F5 404 cho React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Chạy Nginx (mặc định)
CMD ["nginx", "-g", "daemon off;"]
