# Next.js Node.js 服务器部署指南

本指南详细说明如何将 Next.js 应用部署到 Node.js 服务器，支持 SSR（服务器端渲染）和 ISR（增量静态再生）。

## 📋 目录

1. [部署模式对比](#部署模式对比)
2. [环境要求](#环境要求)
3. [本地构建测试](#本地构建测试)
4. [服务器部署](#服务器部署)
5. [Jenkins 自动化部署](#jenkins-自动化部署)
6. [性能优化](#性能优化)
7. [故障排除](#故障排除)

## 🔄 部署模式对比

### 静态导出 vs Node.js 服务器

| 特性 | 静态导出 | Node.js 服务器 |
|-----|---------|---------------|
| **部署复杂度** | 低 | 中 |
| **运行时需求** | 仅需 Web 服务器 | 需要 Node.js 运行时 |
| **动态路由** | 需预生成 | 完全支持 |
| **API 路由** | ❌ 不支持 | ✅ 完全支持 |
| **SSR** | ❌ 不支持 | ✅ 完全支持 |
| **ISR** | ❌ 不支持 | ✅ 完全支持 |
| **图片优化** | ❌ 不支持 | ✅ 完全支持 |
| **性能** | 极高（CDN） | 高（可缓存） |
| **扩展性** | 极好 | 好（需要负载均衡） |

### 何时选择 Node.js 服务器部署

✅ **适合的场景：**
- 需要动态路由和实时数据
- 使用 API 路由处理后端逻辑
- 需要服务器端渲染（SEO）
- 需要增量静态再生
- 有用户认证和个性化内容
- 需要图片优化功能

❌ **不适合的场景：**
- 纯静态内容展示
- 极简部署需求
- 超高并发需求（建议用 CDN）
- 服务器资源有限

## 🛠️ 环境要求

### 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **Node.js**: 20.x 或更高版本
- **内存**: 最少 2GB，推荐 4GB+
- **存储**: 最少 10GB 可用空间
- **网络**: 稳定的网络连接

### 软件依赖

```bash
# Ubuntu/Debian
# 使用 curl 下载安装脚本（若没有 curl 可先用 apt install curl 安装）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js 20
sudo apt-get update && sudo apt-get install -y nodejs

sudo apt update
sudo apt install -y nodejs npm nginx curl wget

# CentOS/RHEL
sudo yum install -y nodejs npm nginx curl wget

# 验证安装
node --version  # 应该 >= 20.0.0
npm --version
```

## 🧪 本地构建测试

### 1. 配置项目

确保 `next.config.js` 配置了 standalone 模式：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Node.js 服务器部署 (支持 SSR/ISR)
  output: 'standalone',
  distDir: '.next',
  
  // 图片优化配置 (Node.js 服务器支持)
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
  
  // 其他配置...
}
```

### 2. 本地构建

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 验证构建结果
ls -la .next/standalone/
# 应该看到 server.js 文件
```

### 3. 本地测试

```bash
# 使用提供的测试脚本
./test-nodejs-server.sh

# 或手动测试
cd .next/standalone
NODE_ENV=production PORT=3000 node server.js
```

## 🚀 服务器部署

### 方式一：自动化脚本部署

```bash
# 上传项目到服务器
scp -r ./web user@server:/tmp/

# 在服务器上运行部署脚本
ssh user@server
cd /tmp/web
./deploy-nodejs.sh
```

### 方式二：手动部署

#### 1. 准备部署目录

```bash
# 创建部署目录
sudo mkdir -p /var/www/payment-service
sudo chown $USER:$USER /var/www/payment-service
```

#### 2. 复制构建文件

```bash
# 复制 standalone 文件
cp -r .next/standalone/* /var/www/payment-service/

# 复制静态文件
mkdir -p /var/www/payment-service/.next/static
cp -r .next/static /var/www/payment-service/.next/

# 复制 public 文件
cp -r public /var/www/payment-service/
```

#### 3. 创建 systemd 服务

```bash
sudo cat > /etc/systemd/system/payment-service-web.service << 'EOF'
[Unit]
Description=Payment Service Web Node.js Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/var/www/payment-service
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
ExecStart=/usr/bin/node server.js
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutStopSec=5
RestartSec=5
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

#### 4. 启动服务

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start payment-service-web
sudo systemctl enable payment-service-web

# 检查状态
sudo systemctl status payment-service-web
```

#### 5. 配置 Nginx 反向代理

```bash
sudo cat > /etc/nginx/sites-available/payment-service << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/payment-service /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

## 🤖 Jenkins 自动化部署

### 使用 Jenkins 文件

项目提供了两个 Jenkins 文件：

- `ui.Jenkinsfile` - 静态导出部署
- `nodejs.Jenkinsfile` - Node.js 服务器部署

### Node.js 服务器部署流水线

1. **拉取代码** - 从 Git 仓库拉取最新代码
2. **构建项目** - 使用 `npm run build` 构建 standalone 应用
3. **部署服务器** - 部署到目标服务器并启动服务
4. **健康检查** - 验证应用是否正常运行

### 配置步骤

1. 在 Jenkins 中创建新的 Pipeline 项目
2. 配置 Git 仓库和凭据
3. 选择 `nodejs.Jenkinsfile` 作为 Pipeline 脚本
4. 修改部署配置变量
5. 运行构建

## ⚡ 性能优化

### 1. 服务器优化

```bash
# 调整 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 使用 PM2 进程管理器
npm install -g pm2
pm2 start server.js --name payment-service
pm2 startup
pm2 save
```

### 2. Nginx 优化

```nginx
# 启用 gzip 压缩
gzip on;
gzip_types text/css application/javascript application/json;

# 启用缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 启用 HTTP/2
listen 443 ssl http2;
```

### 3. 应用优化

```javascript
// next.config.js
module.exports = {
  // 启用压缩
  compress: true,
  
  // 优化图片
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  
  // 启用实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}
```

## 🔧 故障排除

### 常见问题

#### 1. 服务启动失败

```bash
# 查看服务日志
sudo journalctl -u payment-service-web -f

# 检查端口占用
netstat -tlnp | grep :3000

# 检查文件权限
ls -la /var/www/payment-service/
```

#### 2. Nginx 502 错误

```bash
# 检查 Node.js 服务是否运行
sudo systemctl status payment-service-web

# 检查 Nginx 配置
sudo nginx -t

# 检查防火墙
sudo ufw status
```

#### 3. 静态文件 404

```bash
# 确保静态文件已复制
ls -la /var/www/payment-service/.next/static/

# 检查 Nginx 配置中的静态文件路径
```

#### 4. 内存不足

```bash
# 监控内存使用
free -h
htop

# 调整 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=2048"

# 重启服务
sudo systemctl restart payment-service-web
```

### 日志管理

```bash
# 查看应用日志
sudo journalctl -u payment-service-web -f

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 清理日志
sudo journalctl --vacuum-time=7d
```

### 监控检查

```bash
# 检查服务状态
sudo systemctl status payment-service-web

# 检查端口监听
netstat -tlnp | grep :3000

# 测试 HTTP 响应
curl -I http://localhost:3000

# 检查进程
ps aux | grep node
```

## 📝 总结

Node.js 服务器部署为 Next.js 应用提供了完整的功能支持，包括：

- ✅ 动态路由和 API 路由
- ✅ 服务器端渲染（SSR）
- ✅ 增量静态再生（ISR）
- ✅ 图片优化
- ✅ 实时数据和用户认证

通过本指南的自动化部署脚本和 Jenkins 流水线，可以快速、可靠地部署和维护生产环境的 Next.js 应用。

对于不需要服务器端功能的静态内容，仍然建议使用静态导出模式以获得更好的性能和更简单的部署。
