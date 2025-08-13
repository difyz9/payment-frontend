#!/bin/bash

# Ubuntu 部署脚本 - 适用于已安装 PM2 的环境
# 使用方法: bash deploy-simple.sh

set -e  # 遇到错误时退出

echo "🚀 开始部署支付管理系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# 检查必需的工具
log "检查系统环境..."

if ! command -v node &> /dev/null; then
    error "Node.js 未安装"
fi

if ! command -v npm &> /dev/null; then
    error "npm 未安装"
fi

if ! command -v pm2 &> /dev/null; then
    error "PM2 未安装。请使用 sudo npm install -g pm2 安装"
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    error "Node.js 版本过低 ($NODE_VERSION)，需要 18.0.0 或更高版本"
fi

log "✅ Node.js 版本: $NODE_VERSION"
log "✅ PM2 已安装"

# 设置环境变量避免内存错误
export NODE_OPTIONS="--max-old-space-size=2048"
log "设置 Node.js 内存限制: 2GB"

# 获取配置信息
read -p "服务器IP或域名 (默认: localhost): " SERVER_HOST
SERVER_HOST=${SERVER_HOST:-localhost}

read -p "应用端口 (默认: 3000): " APP_PORT
APP_PORT=${APP_PORT:-3000}

# 检查端口是否被占用
if netstat -tlnp 2>/dev/null | grep -q ":$APP_PORT "; then
    warn "端口 $APP_PORT 已被占用"
    read -p "是否继续部署? (y/N): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 安装依赖
log "安装项目依赖..."
npm install

# 创建环境配置
log "创建生产环境配置..."
cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
NEXT_PUBLIC_BASE_URL=http://$SERVER_HOST:$APP_PORT
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=支付管理系统
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=false
PORT=$APP_PORT
EOF

# 构建项目
log "开始构建项目..."
if ! npm run build; then
    warn "构建失败，尝试低内存模式..."
    export NODE_OPTIONS="--max-old-space-size=1024"
    npm run build || error "构建失败，请检查系统内存"
fi

log "✅ 项目构建成功"

# 创建 PM2 配置
log "创建 PM2 配置..."
mkdir -p logs

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
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 停止旧进程
log "停止可能存在的旧进程..."
pm2 stop payment-frontend 2>/dev/null || true
pm2 delete payment-frontend 2>/dev/null || true

# 启动应用
log "启动应用..."
pm2 start ecosystem.config.js

# 保存 PM2 配置
log "保存 PM2 配置..."
pm2 save

# 设置开机自启动
log "设置开机自启动..."
pm2 startup || true

# 检查应用状态
sleep 3
log "检查应用状态..."
pm2 status

echo ""
log "🎉 部署完成！"
echo ""
echo "📋 部署信息:"
echo "   应用地址: http://$SERVER_HOST:$APP_PORT"
echo "   工作目录: $(pwd)"
echo ""
echo "🔧 管理命令:"
echo "   查看状态: pm2 status"
echo "   查看日志: pm2 logs payment-frontend"
echo "   重启应用: pm2 restart payment-frontend"
echo "   停止应用: pm2 stop payment-frontend"
echo "   监控面板: pm2 monit"
echo ""
log "✅ 支付管理系统部署完成!"