# 支付管理系统 - Vercel 部署指南

本文档详细说明如何将支付管理系统前端项目推到 GitHub 并通过 Vercel 部署。

## 📋 准备工作

### 1. 确保项目依赖完整
```bash
npm install
npm run build  # 确保本地构建正常
```

### 2. 检查环境变量配置
项目已配置好以下环境文件：
- `.env.development` - 开发环境
- `.env.production` - 生产环境
- `.env.vercel` - Vercel 部署环境

## 🚀 部署步骤

### 步骤 1: 推送到 GitHub

1. **初始化 Git 仓库**（如果还没有）
```bash
git init
git add .
git commit -m "Initial commit: Payment management system"
```

2. **创建 GitHub 仓库**
   - 登录 GitHub
   - 点击 "New repository"
   - 仓库名称：`payment-frontend` 或你喜欢的名称
   - 设置为 Private（推荐，因为包含敏感配置）
   - 不要初始化 README（因为本地已有）

3. **关联远程仓库并推送**
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 步骤 2: Vercel 部署配置

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目设置**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: 留空（使用默认）
   - **Install Command**: `npm install`

4. **环境变量配置**
   在 Vercel 项目设置中添加以下环境变量：

   ```
   NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
   NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_NAME=支付管理系统
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NEXT_PUBLIC_DEBUG=false
   VERCEL=1
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 步骤 3: 自定义域名（可选）

1. 在 Vercel 项目设置中找到 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 🔧 项目配置说明

### Next.js 配置优化
项目的 `next.config.ts` 已优化为：
- 在 Vercel 环境下使用标准构建模式
- 在其他环境下使用静态导出模式
- 自动优化包导入以提升性能

### Vercel 特定配置
`vercel.json` 文件包含：
- API 代理配置（避免 CORS 问题）
- 安全头设置
- 边缘函数优化

### 环境变量管理
- `.env.vercel` - Vercel 专用环境变量
- 生产环境变量通过 Vercel 控制台管理
- 敏感信息不包含在代码中

## 🔄 自动部署

配置完成后，每次推送到 main 分支都会自动触发 Vercel 部署：

```bash
# 开发完成后推送更新
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

## 🛠️ 本地开发与生产环境切换

### 本地开发
```bash
npm run dev  # 使用 .env.development
```

### 本地测试生产构建
```bash
npm run build:vercel  # 模拟 Vercel 环境构建
npm run start  # 启动生产服务器
```

### 静态导出（传统部署）
```bash
npm run build  # 静态导出到 dist 目录
```

## 📊 监控和调试

### Vercel 控制台功能
- **Functions**: 查看 API 路由性能
- **Analytics**: 访问统计
- **Speed Insights**: 性能监控
- **Logs**: 实时日志查看

### 本地调试
```bash
# 检查环境变量
npm run validate:env

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 🔐 安全考虑

1. **API 密钥管理**
   - 后端 API 密钥不暴露在前端
   - 使用环境变量管理敏感配置

2. **CORS 配置**
   - 通过 Vercel 代理解决跨域问题
   - API 路由通过 `/api/*` 代理到后端

3. **安全头**
   - 已配置必要的安全 HTTP 头
   - 防止 XSS 和点击劫持攻击

## 🚨 常见问题解决

### 构建失败
1. 检查 Node.js 版本兼容性
2. 确保所有依赖已正确安装
3. 检查环境变量配置

### API 调用失败
1. 检查 `NEXT_PUBLIC_API_BASE_URL` 配置
2. 确认后端 API 服务可访问
3. 检查 CORS 配置

### 静态资源 404
1. 检查 `assetPrefix` 配置
2. 确认静态文件路径正确
3. 检查 CDN 配置

## 📝 更新部署

### 更新代码
```bash
git add .
git commit -m "更新描述"
git push origin main
```

### 更新环境变量
1. 在 Vercel 控制台修改环境变量
2. 重新部署项目

### 回滚版本
在 Vercel 控制台的 Deployments 页面可以快速回滚到之前的版本。

---

部署完成后，你的支付管理系统将可以通过 `https://your-app-name.vercel.app` 访问。