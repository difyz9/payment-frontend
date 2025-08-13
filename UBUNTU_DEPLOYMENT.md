# 支付管理系统 - Ubuntu Node.js 部署指南

本文档详细说明如何在 Ubuntu 服务器上通过 Node.js 部署支付管理系统前端项目。

## 📋 系统要求

### 最低配置
- **操作系统**: Ubuntu 18.04+ (推荐 20.04/22.04)
- **内存**: 2GB RAM (推荐 4GB+)
- **磁盘**: 10GB 可用空间
- **网络**: 稳定的网络连接

### 软件要求
- Node.js 18.0+ (推荐 20.16.0)
- npm 8.0+
- PM2 (进程管理器)
- Nginx (反向代理)

## 🚀 部署步骤

### 步骤 1: 准备 Ubuntu 服务器

1. **更新系统包**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **安装必要的系统工具**
```bash
sudo apt install -y curl wget git build-essential
```

3. **安装 Node.js (推荐使用 NodeSource)**
```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js
sudo apt install -y nodejs

# 验证安装
node --version  # 应该显示 v20.x.x
npm --version   # 应该显示 8.x.x+
```

4. **安装 PM2 进程管理器**
```bash
sudo npm install -g pm2
```

5. **安装 Nginx**
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤 2: 部署项目

1. **克隆项目代码**
```bash
# 创建项目目录
sudo mkdir -p /var/www
cd /var/www

# 克隆项目 (替换为你的 GitHub 仓库地址)
sudo git clone https://github.com/difyz9/payment-frontend.git
sudo chown -R $USER:$USER payment-frontend
cd payment-frontend
```

2. **安装项目依赖**
```bash
# 设置 Node.js 内存限制 (解决 Bus error)
export NODE_OPTIONS="--max-old-space-size=2048"

# 安装依赖
npm install
```

3. **配置环境变量**
```bash
# 创建生产环境配置文件
cat > .env.production << 'EOF'
# 生产环境配置
NODE_ENV=production

# API 配置
NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
NEXT_PUBLIC_BASE_URL=http://your-server-ip:3000

# 应用配置
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=支付管理系统
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=false

# 服务器配置
PORT=3000
EOF
```

4. **构建项目**
```bash
# 使用内存限制构建
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# 如果构建失败，尝试更低内存限制
# NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

### 步骤 3: PM2 进程管理配置

1. **创建 PM2 配置文件**
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'payment-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/payment-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/payment-frontend-error.log',
    out_file: '/var/log/pm2/payment-frontend-out.log',
    log_file: '/var/log/pm2/payment-frontend.log',
    time: true
  }]
};
EOF
```

2. **启动应用**
```bash
# 创建日志目录
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# 启动应用
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save
pm2 startup
# 按照输出的命令执行，通常是：
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 步骤 4: Nginx 反向代理配置

1. **创建 Nginx 配置文件**
```bash
sudo tee /etc/nginx/sites-available/payment-frontend << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器 IP

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js 应用代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 静态文件缓存
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API 代理到后端 (可选，如果需要)
    location /api/ {
        proxy_pass https://www.coding520.top/pay-api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

2. **启用站点配置**
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/payment-frontend /etc/nginx/sites-enabled/

# 删除默认站点 (可选)
sudo rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 5: SSL 证书配置 (推荐)

1. **安装 Certbot**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. **获取 SSL 证书**
```bash
# 替换为你的域名
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 步骤 6: 防火墙配置

```bash
# 启用 UFW 防火墙
sudo ufw enable

# 允许基本服务
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# 查看状态
sudo ufw status
```

## 🛠️ 管理和维护

### PM2 常用命令
```bash
# 查看应用状态
pm2 list
pm2 status

# 查看日志
pm2 logs payment-frontend
pm2 logs payment-frontend --lines 50

# 重启应用
pm2 restart payment-frontend

# 停止应用
pm2 stop payment-frontend

# 重新加载 (无停机时间)
pm2 reload payment-frontend

# 监控
pm2 monit
```

### 更新部署
```bash
# 进入项目目录
cd /var/www/payment-frontend

# 拉取最新代码
git pull origin main

# 安装新依赖 (如果有)
npm install

# 重新构建
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# 重启应用
pm2 restart payment-frontend
```

### 系统监控
```bash
# 查看系统资源
htop
free -h
df -h

# 查看 Nginx 状态
sudo systemctl status nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 故障排除

### 构建失败 (Bus error)
```bash
# 方案1: 增加内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 方案2: 清理缓存重试
rm -rf node_modules package-lock.json .next
npm install
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# 方案3: 增加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 应用无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 检查 PM2 日志
pm2 logs payment-frontend

# 检查环境变量
pm2 env payment-frontend
```

### Nginx 502 错误
```bash
# 检查 Next.js 应用是否运行
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

## 🔐 安全最佳实践

1. **定期更新系统**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **配置防火墙**
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

3. **禁用 root SSH 登录**
```bash
sudo nano /etc/ssh/sshd_config
# 设置: PermitRootLogin no
sudo systemctl restart ssh
```

4. **使用非 root 用户运行应用**
```bash
# 创建专用用户
sudo adduser --system --group nextjs
sudo chown -R nextjs:nextjs /var/www/payment-frontend
```

## 📊 性能优化

### 启用 Gzip 压缩
```bash
sudo nano /etc/nginx/nginx.conf
# 在 http 块中添加：
# gzip on;
# gzip_vary on;
# gzip_min_length 1024;
# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 配置缓存策略
```bash
# 在 Nginx 配置中添加缓存头
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

部署完成后，你的支付管理系统将可以通过 `http://your-server-ip` 或配置的域名访问。
