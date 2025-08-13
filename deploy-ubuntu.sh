#!/bin/bash

# Ubuntu 自动部署脚本
# 使用方法: bash deploy-ubuntu.sh

set -e  # 遇到错误时退出

echo "🚀 开始 Ubuntu 自动部署..."

# 检查是否为 root 用户
if [[ $EUID -eq 0 ]]; then
   echo "❌ 请不要使用 root 用户运行此脚本"
   echo "   使用普通用户执行: bash deploy-ubuntu.sh"
   exit 1
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
    exit 1
}

# 检查系统
log "检查系统环境..."
if ! command -v node &> /dev/null; then
    error "Node.js 未安装。请先安装 Node.js 18+"
fi

if ! command -v npm &> /dev/null; then
    error "npm 未安装。请先安装 npm"
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$MAJOR_VERSION" -lt 18 ]; then
    error "Node.js 版本过低 ($NODE_VERSION)，需要 18.0.0 或更高版本"
fi

log "✅ Node.js 版本: $NODE_VERSION"

# 设置环境变量
export NODE_OPTIONS="--max-old-space-size=2048"
log "设置 Node.js 内存限制: 2GB"

# 获取用户输入
read -p "请输入服务器域名或IP地址: " SERVER_HOST
read -p "请输入应用端口 (默认3000): " APP_PORT
APP_PORT=${APP_PORT:-3000}

# 清理和安装依赖
log "清理旧的构建文件..."
rm -rf .next node_modules package-lock.json

log "安装项目依赖..."
npm install

# 创建生产环境配置
log "创建生产环境配置..."
cat > .env.production << EOF
# 生产环境配置
NODE_ENV=production

# API 配置
NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
NEXT_PUBLIC_BASE_URL=http://$SERVER_HOST:$APP_PORT

# 应用配置
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=支付管理系统
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=false

# 服务器配置
PORT=$APP_PORT
EOF

# 构建项目
log "开始构建项目..."
if ! npm run build; then
    warn "标准构建失败，尝试低内存模式..."
    export NODE_OPTIONS="--max-old-space-size=1024"
    if ! npm run build; then
        error "构建失败。请检查系统内存是否足够 (建议 2GB+)"
    fi
fi

log "✅ 项目构建成功"

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    log "安装 PM2 进程管理器..."
    npm install -g pm2
fi

# 创建 PM2 配置
log "创建 PM2 配置文件..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'payment-frontend',
    script: 'npm',
    args: 'start',
    cwd: '$(pwd)',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2.log',
    time: true
  }]
};
EOF

# 创建日志目录
mkdir -p logs

# 停止可能存在的旧进程
log "停止旧的应用进程..."
pm2 stop payment-frontend 2>/dev/null || true
pm2 delete payment-frontend 2>/dev/null || true

# 启动应用
log "启动应用..."
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 检查应用状态
sleep 3
if pm2 describe payment-frontend > /dev/null 2>&1; then
    log "✅ 应用启动成功"
    pm2 status
else
    error "应用启动失败。请检查日志: pm2 logs payment-frontend"
fi

# 生成 Nginx 配置
log "生成 Nginx 配置文件..."
cat > nginx.conf << EOF
server {
    listen 80;
    server_name $SERVER_HOST;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js 应用代理
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # 静态文件缓存
    location /_next/static/ {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API 代理到后端
    location /api/ {
        proxy_pass https://www.coding520.top/pay-api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo ""
log "🎉 部署完成！"
echo ""
echo "📋 部署信息:"
echo "   应用地址: http://$SERVER_HOST:$APP_PORT"
echo "   PM2 应用名: payment-frontend"
echo "   日志目录: $(pwd)/logs"
echo ""
echo "🔧 下一步操作:"
echo "   1. 配置 Nginx (可选):"
echo "      sudo cp nginx.conf /etc/nginx/sites-available/payment-frontend"
echo "      sudo ln -s /etc/nginx/sites-available/payment-frontend /etc/nginx/sites-enabled/"
echo "      sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "   2. 常用管理命令:"
echo "      pm2 status              # 查看应用状态"
echo "      pm2 logs payment-frontend    # 查看日志"
echo "      pm2 restart payment-frontend # 重启应用"
echo "      pm2 stop payment-frontend    # 停止应用"
echo ""
echo "   3. 设置开机自启:"
echo "      pm2 startup"
echo "      # 然后执行输出的命令"
echo ""
log "✅ 支付管理系统已成功部署到 Ubuntu!"
