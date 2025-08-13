# 🔧 Vercel 运行时错误修复说明

## ❌ 错误描述

```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

## 🔍 问题原因

原始的 `vercel.json` 配置中包含了不正确的函数运行时配置：

```json
{
  "functions": {
    "app/**/*.{js,ts}": {
      "runtime": "nodejs20.x"  // ❌ 错误的运行时格式
    }
  }
}
```

## ✅ 解决方案

### 1. 简化 vercel.json 配置

删除了错误的 `functions` 配置，让 Vercel 自动检测和配置运行时：

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
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

### 2. 通过其他方式指定 Node.js 版本

#### `package.json` - engines 字段
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

#### `.nvmrc` 文件
```
20.16.0
```

### 3. 优化部署脚本

在 `deploy-to-vercel.sh` 中添加了 Node.js 版本检查：

```bash
# 检查 Node.js 版本
echo "🔍 检查 Node.js 版本..."
node_version=$(node -v)
echo "当前 Node.js 版本: $node_version"

# 检查版本是否满足要求
if [[ "$node_version" < "v18.0.0" ]]; then
    echo "❌ Node.js 版本过低，需要 >= 18.0.0"
    echo "建议使用 nvm 安装正确版本:"
    echo "  nvm install 20.16.0"
    echo "  nvm use 20.16.0"
    exit 1
fi
```

## 🎯 最佳实践

### 1. Vercel 运行时检测机制

Vercel 会自动根据以下顺序检测运行时：

1. **`.nvmrc` 文件** - 指定具体版本
2. **`package.json` engines** - 指定版本范围
3. **框架默认** - Next.js 15 默认使用 Node.js 18+

### 2. 不需要手动配置函数运行时

对于 Next.js 项目，Vercel 会自动：
- 检测 App Router 和 Pages Router
- 配置适当的运行时环境
- 优化函数打包和部署

### 3. 版本管理策略

```bash
# 本地开发
nvm use              # 使用 .nvmrc 指定的版本

# 构建验证
npm run build:vercel # 验证 Vercel 环境构建

# 环境验证
npm run validate:env # 检查环境变量配置
```

## 🧪 验证修复

### 1. 本地构建测试

```bash
npm run build:vercel
# ✓ Compiled successfully
```

### 2. 环境验证

```bash
npm run validate:env
# ✅ production 环境配置验证通过
```

### 3. 部署脚本测试

```bash
./deploy-to-vercel.sh --dry-run  # 可以添加 dry-run 模式
```

## 📋 修复检查清单

- [x] 移除错误的 `functions.runtime` 配置
- [x] 保留 `framework: "nextjs"` 设置
- [x] 保留 API 代理和安全头配置
- [x] 确保 `.nvmrc` 文件存在
- [x] 确保 `package.json` engines 字段正确
- [x] 验证本地构建成功
- [x] 更新部署脚本添加版本检查

## 🚀 部署就绪

现在项目配置已经完全正确，可以安全地部署到 Vercel：

1. **自动运行时检测** - Vercel 会使用 `.nvmrc` 中的 Node.js 20.16.0
2. **框架优化** - Next.js 15 的所有功能都正常工作
3. **API 代理** - 后端 API 调用通过 Vercel 代理
4. **安全头** - 生产环境安全配置已启用

---

💡 **提示**: 这种简化的配置更加可靠，减少了配置错误的可能性，让 Vercel 的自动检测机制发挥最佳效果。
