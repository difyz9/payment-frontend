#!/bin/bash

# Ubuntu 环境检查和准备脚本
# 检查系统是否满足部署要求

echo "🔍 Ubuntu 环境检查..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查项目
check_pass=0
check_fail=0

check() {
    local name="$1"
    local cmd="$2"
    local required="$3"
    
    echo -n "  检查 $name... "
    
    if eval "$cmd" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((check_pass++))
        return 0
    else
        if [ "$required" = "required" ]; then
            echo -e "${RED}❌ 失败 (必需)${NC}"
            ((check_fail++))
        else
            echo -e "${YELLOW}⚠️ 未安装 (可选)${NC}"
        fi
        return 1
    fi
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 系统信息
echo "📋 系统信息:"
echo "  操作系统: $(lsb_release -d | cut -f2)"
echo "  内核版本: $(uname -r)"
echo "  架构: $(uname -m)"
echo ""

# 内存检查
echo "💾 内存信息:"
free -h
echo ""
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_MEM" -lt 2048 ]; then
    echo -e "${YELLOW}⚠️ 内存不足 2GB，可能影响构建性能${NC}"
else
    echo -e "${GREEN}✅ 内存充足 ($((TOTAL_MEM/1024))GB)${NC}"
fi
echo ""

# 磁盘空间检查
echo "💽 磁盘空间:"
df -h .
AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}' | sed 's/[^0-9]//g')
if [ "$AVAILABLE_SPACE" -lt 5242880 ]; then  # 5GB in KB
    echo -e "${YELLOW}⚠️ 可用空间不足 5GB，建议清理磁盘${NC}"
else
    echo -e "${GREEN}✅ 磁盘空间充足${NC}"
fi
echo ""

# 网络检查
echo "🌐 网络连接:"
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 网络连接正常${NC}"
else
    echo -e "${RED}❌ 网络连接失败${NC}"
fi
echo ""

# 软件环境检查
echo "🔧 软件环境检查:"

# 基础工具
check "curl" "command -v curl" "required"
check "wget" "command -v wget" "optional"
check "git" "command -v git" "required"
check "build-essential" "command -v gcc" "required"

# Node.js 相关
if check "Node.js" "command -v node" "required"; then
    NODE_VERSION=$(node -v)
    echo "    版本: $NODE_VERSION"
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "    ${GREEN}✅ 版本符合要求 (>=18)${NC}"
    else
        echo -e "    ${RED}❌ 版本过低，需要 18.0.0+${NC}"
        ((check_fail++))
    fi
fi

if check "npm" "command -v npm" "required"; then
    NPM_VERSION=$(npm -v)
    echo "    版本: $NPM_VERSION"
fi

# 进程管理和服务器
check "PM2" "command -v pm2" "recommended"
check "Nginx" "command -v nginx" "recommended"
check "systemctl" "command -v systemctl" "required"

# 防火墙
check "UFW" "command -v ufw" "optional"

echo ""
echo "📊 检查结果:"
echo -e "  ${GREEN}通过: $check_pass${NC}"
echo -e "  ${RED}失败: $check_fail${NC}"
echo ""

if [ $check_fail -gt 0 ]; then
    echo -e "${RED}❌ 环境检查未通过，请先解决以下问题:${NC}"
    echo ""
    echo "🔧 安装缺失的软件:"
    
    if ! command -v node >/dev/null 2>&1; then
        echo "  # 安装 Node.js 20.x"
        echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "  sudo apt install -y nodejs"
        echo ""
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        echo "  # 安装 Git"
        echo "  sudo apt install -y git"
        echo ""
    fi
    
    if ! command -v gcc >/dev/null 2>&1; then
        echo "  # 安装构建工具"
        echo "  sudo apt install -y build-essential"
        echo ""
    fi
    
    if ! command -v pm2 >/dev/null 2>&1; then
        echo "  # 安装 PM2"
        echo "  sudo npm install -g pm2"
        echo ""
    fi
    
    if ! command -v nginx >/dev/null 2>&1; then
        echo "  # 安装 Nginx"
        echo "  sudo apt install -y nginx"
        echo ""
    fi
    
    echo "安装完成后，请重新运行此脚本检查环境。"
else
    echo -e "${GREEN}✅ 环境检查通过！可以开始部署。${NC}"
    echo ""
    echo "🚀 下一步操作:"
    echo "  1. 运行部署脚本:"
    echo "     bash deploy-ubuntu.sh"
    echo ""
    echo "  2. 或手动部署，参考文档:"
    echo "     cat UBUNTU_DEPLOYMENT.md"
fi

echo ""
echo "💡 有用的系统优化建议:"

# Swap 检查
SWAP_SIZE=$(free -m | awk '/^Swap:/{print $2}')
if [ "$SWAP_SIZE" -eq 0 ]; then
    echo "  • 添加 Swap 空间 (推荐 2GB):"
    echo "    sudo fallocate -l 2G /swapfile"
    echo "    sudo chmod 600 /swapfile"
    echo "    sudo mkswap /swapfile"
    echo "    sudo swapon /swapfile"
    echo "    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab"
    echo ""
fi

# 时区检查
echo "  • 设置时区:"
echo "    sudo timedatectl set-timezone Asia/Shanghai"
echo ""

echo "  • 启用自动安全更新:"
echo "    sudo apt install -y unattended-upgrades"
echo "    sudo dpkg-reconfigure -plow unattended-upgrades"
