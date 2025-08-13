# 快速启动指南

支付管理系统支持多种部署方式，本指南帮你快速选择和部署。

## 🎯 选择部署方式

### 🚀 我想快速测试 → [Vercel 部署](#vercel-一键部署)
- 适合：开发测试、演示、个人项目
- 时间：5-10 分钟
- 费用：免费

### 🏢 我要生产部署 → [Ubuntu 部署](#ubuntu-生产部署)
- 适合：企业应用、自有服务器、内网部署
- 时间：15-30 分钟
- 费用：服务器成本

---

## Vercel 一键部署

### 1. 推送到 GitHub
```bash
# 如果还没有 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/your-username/payment-frontend.git
git push -u origin main
```

### 2. 连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 登录
3. 点击 "New Project"
4. 选择你的仓库并导入

### 3. 配置环境变量
在 Vercel 项目设置中添加：
```
NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
NEXT_PUBLIC_APP_NAME=支付管理系统
VERCEL=1
```

### 4. 部署
点击 "Deploy" 等待完成。

✅ **完成！** 访问分配的 `.vercel.app` 域名

---

## Ubuntu 生产部署

### 1. 环境检查
```bash
# 下载项目
git clone https://github.com/your-username/payment-frontend.git
cd payment-frontend

# 检查环境
bash scripts/check-ubuntu-env.sh
```

### 2. 安装依赖（如果环境检查失败）
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装其他工具
sudo apt install -y git build-essential nginx
sudo npm install -g pm2
```

### 3. 一键部署
```bash
bash deploy-ubuntu.sh
```

按提示输入：
- 服务器 IP 或域名
- 应用端口（默认 3000）

### 4. 配置 Nginx（推荐）
```bash
# 复制生成的配置
sudo cp nginx.conf /etc/nginx/sites-available/payment-frontend

# 启用站点
sudo ln -s /etc/nginx/sites-available/payment-frontend /etc/nginx/sites-enabled/

# 测试和重启
sudo nginx -t
sudo systemctl restart nginx
```

✅ **完成！** 访问 `http://your-server-ip` 或配置的域名

---

## 🔧 故障排除

### 构建失败 (Bus error)
```bash
# 方案1: 运行修复脚本
bash scripts/fix-build-error.sh

# 方案2: 手动添加内存限制
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build
```

### 端口被占用
```bash
# 查看占用进程
sudo netstat -tlnp | grep :3000

# 杀死进程
sudo kill -9 <PID>
```

### PM2 应用无法启动
```bash
# 查看详细日志
pm2 logs payment-frontend

# 重启应用
pm2 restart payment-frontend

# 删除并重新创建
pm2 delete payment-frontend
pm2 start ecosystem.config.js
```

---

## 📱 管理命令

### PM2 管理
```bash
pm2 status                    # 查看状态
pm2 logs payment-frontend     # 查看日志
pm2 restart payment-frontend  # 重启应用
pm2 stop payment-frontend     # 停止应用
pm2 monit                     # 监控界面
```

### 更新部署
```bash
# 拉取最新代码
git pull origin main

# 重新构建
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# 重启应用
pm2 restart payment-frontend
```

### 系统监控
```bash
# 查看系统资源
htop           # 进程监控
free -h        # 内存使用
df -h          # 磁盘空间
pm2 monit      # PM2 监控
```

---

## 🎉 部署成功

部署完成后，你可以：

1. **访问应用**
   - Vercel: `https://your-app.vercel.app`
   - Ubuntu: `http://your-server-ip:3000`

2. **测试功能**
   - 用户注册/登录
   - 应用管理
   - 订单查询
   - 支付测试

3. **查看监控**
   - Vercel: 控制台 Analytics
   - Ubuntu: `pm2 monit`

4. **配置域名**
   - Vercel: 项目设置 → Domains
   - Ubuntu: 配置 Nginx + SSL

---

## 📞 获取帮助

遇到问题？查看详细文档：
- [Ubuntu 完整部署指南](UBUNTU_DEPLOYMENT.md)
- [API 问题修复](API_FIX_GUIDE.md)
- [环境变量配置](VERCEL_ENV_SETUP.md)

或者运行诊断脚本：
```bash
bash scripts/check-ubuntu-env.sh  # 环境检查
bash scripts/fix-build-error.sh   # 构建修复
```
