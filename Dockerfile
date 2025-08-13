# 前端专用 Dockerfile
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 只复制前端相关文件
COPY web/package*.json ./
RUN npm ci --only=production

# 复制前端源码
COPY web/ ./

# 构建静态文件
RUN npm run build

# 使用 nginx 提供静态文件服务
FROM nginx:alpine

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
