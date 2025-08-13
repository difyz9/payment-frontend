# 🚀 Vercel 部署完整指南

## 📝 概览

你的支付管理系统前端项目已经准备好部署到 Vercel！我已经为你优化了所有配置文件，下面是完整的部署步骤。

## ✅ 项目检查结果

预检查脚本显示：
- ✅ Node.js v20.16.0 (兼容)
- ✅ 所有依赖已安装
- ✅ 环境变量配置完整
- ✅ TypeScript 类型检查通过
- ✅ Vercel 和静态导出构建都成功
- ⚠️ 有一些 ESLint 警告（不影响部署）

## 🚀 快速部署（3步完成）

### 方法1: 使用自动化脚本

```bash
# 一键部署脚本（需要先创建 GitHub 仓库）
./deploy-to-vercel.sh https://github.com/your-username/payment-frontend.git
```

### 方法2: 手动步骤

#### 步骤1: 推送到 GitHub

1. **创建 GitHub 仓库**
   - 登录 GitHub
   - 点击 "New repository"
   - 仓库名：`payment-frontend`
   - 设为 Private（推荐）
   - 不要初始化 README

2. **推送代码**
```bash
# 如果还没有初始化 git
git init
git add .
git commit -m "Initial commit: Payment management system"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/payment-frontend.git
git branch -M main
git push -u origin main
```

#### 步骤2: Vercel 部署

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库 `payment-frontend`
   - 点击 "Import"

3. **项目配置**
   - Framework Preset: `Next.js`（自动检测）
   - Build Command: `npm run build`（保持默认）
   - Output Directory: 留空
   - Install Command: `npm install`（保持默认）

#### 步骤3: 环境变量配置

在 Vercel 项目设置的 "Environment Variables" 中添加：

```bash
# 必需变量
NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
NEXT_PUBLIC_BASE_URL=https://payment-frontend.vercel.app
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=支付管理系统
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=false
VERCEL=1
```

## 🔧 已优化的配置文件

### 1. `vercel.json` - Vercel 专用配置
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://www.coding520.top/pay-api/:path*"
    }
  ],
  "headers": [安全头配置]
}
```

### 2. `next.config.ts` - 智能构建配置
- Vercel 环境：标准 Next.js 构建
- 其他环境：静态导出
- 自动包优化

### 3. `package.json` - 新增脚本
- `build:vercel` - Vercel 专用构建命令
- 保持兼容其他部署方式

## 🌍 环境变量说明

| 变量 | 说明 | Vercel 值 |
|------|------|-----------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | `https://www.coding520.top/pay-api` |
| `NEXT_PUBLIC_BASE_URL` | 前端域名 | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_ENV` | 环境标识 | `production` |
| `VERCEL` | Vercel 环境标识 | `1` |

## 🔄 自动部署流程

配置完成后，每次推送代码都会自动部署：

```bash
# 开发完成后
git add .
git commit -m "feat: 新功能"
git push origin main
# Vercel 自动构建部署
```

## 🎯 部署后验证

### 1. 功能检查
- [ ] 登录/注册功能正常
- [ ] 应用管理页面可访问
- [ ] API 调用正常
- [ ] 页面样式正确

### 2. 性能检查
- 访问 Vercel 控制台查看：
  - Build 时间
  - Bundle 大小
  - Speed Insights

### 3. 错误监控
- 查看 Vercel Functions 日志
- 检查浏览器控制台错误

## 🔧 自定义域名（可选）

1. 在 Vercel 项目设置中添加域名
2. 配置 DNS 记录指向 Vercel
3. 更新 `NEXT_PUBLIC_BASE_URL` 环境变量

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 本地测试构建
   npm run build:vercel
   ```

2. **API 调用失败**
   - 检查 `NEXT_PUBLIC_API_BASE_URL` 配置
   - 确认后端服务可访问

3. **环境变量不生效**
   - 确认变量名以 `NEXT_PUBLIC_` 开头
   - 重新部署项目

### 调试工具

```bash
# 本地调试脚本
./pre-deploy-check.sh

# 验证环境变量
npm run validate:env

# 类型检查
npm run type-check

# 代码检查
npm run lint:fix
```

## 📊 监控和维护

### Vercel Analytics
- 访问统计
- 性能监控
- 用户行为分析

### 日志查看
- Function 日志
- Build 日志
- Runtime 日志

## 🎉 完成

部署完成后你将获得：
- 🌐 生产级的 Web 应用
- 🚀 自动 CDN 加速
- 📊 实时性能监控
- 🔄 自动 CI/CD 流程
- 🛡️ 安全头配置
- 📱 移动端适配

**你的应用将通过 `https://payment-frontend.vercel.app` 访问！**

---

💡 **提示**: 保存好 Vercel 项目链接和 GitHub 仓库地址，方便后续管理和更新。
