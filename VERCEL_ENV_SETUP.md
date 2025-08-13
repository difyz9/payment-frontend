# Vercel 环境变量配置指南

## 🚫 为什么不建议在 vercel.json 中配置环境变量

### 安全考虑
- `vercel.json` 文件会被提交到 Git，所有有权限的人都能看到
- 即使是 `NEXT_PUBLIC_` 变量，在配置文件中暴露仍有风险
- 无法区分敏感和非敏感配置

### 维护性问题
- 每次更改配置都需要修改代码并重新部署
- 无法为不同环境设置不同值
- 不符合 12-Factor App 最佳实践

## ✅ 推荐的配置方法

### 方法1：Vercel 控制台配置（推荐）

1. **访问项目设置**
   ```
   Vercel Dashboard → 选择项目 → Settings → Environment Variables
   ```

2. **添加生产环境变量**
   ```
   变量名: NODE_ENV
   值: production
   环境: Production, Preview
   
   变量名: NEXT_PUBLIC_API_BASE_URL
   值: https://www.coding520.top/pay-api
   环境: Production, Preview
   
   变量名: NEXT_PUBLIC_BASE_URL
   值: https://www.coding520.top
   环境: Production, Preview
   
   变量名: NEXT_PUBLIC_APP_ENV
   值: production
   环境: Production, Preview
   
   变量名: NEXT_PUBLIC_APP_NAME
   值: 支付管理系统
   环境: Production, Preview
   
   变量名: NEXT_PUBLIC_APP_VERSION
   值: 1.0.0
   环境: Production, Preview
   
   变量名: NEXT_PUBLIC_DEBUG
   值: false
   环境: Production, Preview
   
   变量名: NEXT_PUBLIC_BASE_PATH
   值: (留空)
   环境: Production, Preview
   ```

3. **开发环境变量**
   ```
   变量名: NEXT_PUBLIC_API_BASE_URL
   值: http://localhost:3001/api
   环境: Development
   
   变量名: NEXT_PUBLIC_DEBUG
   值: true
   环境: Development
   ```

### 方法2：使用 Vercel CLI（备选）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 设置环境变量
vercel env add NEXT_PUBLIC_API_BASE_URL production
# 输入值: https://www.coding520.top/pay-api

vercel env add NEXT_PUBLIC_BASE_URL production
# 输入值: https://www.coding520.top

vercel env add NEXT_PUBLIC_APP_ENV production
# 输入值: production

vercel env add NEXT_PUBLIC_APP_NAME production
# 输入值: 支付管理系统

vercel env add NEXT_PUBLIC_APP_VERSION production
# 输入值: 1.0.0

vercel env add NEXT_PUBLIC_DEBUG production
# 输入值: false

vercel env add NEXT_PUBLIC_BASE_PATH production
# 输入值: (直接回车，留空)
```

### 方法3：批量导入（高级）

1. **创建环境变量文件**（仅用于导入，不要提交到 Git）
   ```bash
   # 创建临时文件
   cat > vercel-env-vars.txt << 'EOF'
   NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
   NEXT_PUBLIC_BASE_URL=https://www.coding520.top
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_NAME=支付管理系统
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NEXT_PUBLIC_DEBUG=false
   NEXT_PUBLIC_BASE_PATH=
   EOF
   ```

2. **使用 Vercel CLI 批量导入**
   ```bash
   # 导入到生产环境
   vercel env pull .env.vercel.production
   
   # 或者使用 API 批量设置（需要编写脚本）
   ```

## 🔧 如果坚持使用 vercel.json

如果你确实需要在 `vercel.json` 中配置（不推荐），格式如下：

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_API_BASE_URL": "https://www.coding520.top/pay-api",
    "NEXT_PUBLIC_BASE_URL": "https://www.coding520.top",
    "NEXT_PUBLIC_APP_ENV": "production",
    "NEXT_PUBLIC_APP_NAME": "支付管理系统",
    "NEXT_PUBLIC_APP_VERSION": "1.0.0",
    "NEXT_PUBLIC_DEBUG": "false",
    "NEXT_PUBLIC_BASE_PATH": ""
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://www.coding520.top/pay-api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## ⚠️ 注意事项

1. **安全警告**：如果在 `vercel.json` 中配置，确保：
   - 不包含敏感信息（API 密钥、数据库密码等）
   - 只包含客户端可见的 `NEXT_PUBLIC_` 变量
   - 在 Git 提交前仔细检查

2. **环境区分**：在 `vercel.json` 中无法区分不同环境，所有环境都会使用相同配置

3. **更新流程**：每次更改都需要重新部署

## 📋 部署清单

- [ ] 决定使用哪种环境变量配置方法
- [ ] 在 Vercel 控制台配置所有环境变量
- [ ] 验证开发环境和生产环境配置不同
- [ ] 删除本地 `.env` 文件（避免泄露）
- [ ] 测试部署后环境变量是否正确加载
- [ ] 文档化环境变量配置流程

## 🎯 推荐选择

**强烈推荐使用 Vercel 控制台配置环境变量**，原因：
- ✅ 安全性更高
- ✅ 支持多环境配置
- ✅ 易于管理和更新
- ✅ 符合最佳实践
- ✅ 不会泄露到代码仓库
