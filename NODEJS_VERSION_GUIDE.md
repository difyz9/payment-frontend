# 🚀 Node.js 版本管理

## 📋 版本要求

本项目需要以下版本：

- **Node.js**: `>=18.0.0` (推荐 `20.16.0`)
- **npm**: `>=8.0.0`

## 📁 版本配置文件

### `package.json` - engines 字段
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### `.nvmrc` - Node Version Manager
```
20.16.0
```

### `vercel.json` - Vercel 运行时
```json
{
  "functions": {
    "app/**/*.{js,ts}": {
      "runtime": "nodejs20.x"
    }
  }
}
```

## 🛠️ 本地开发环境设置

### 使用 nvm (推荐)

```bash
# 安装 nvm (如果还没有)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载终端或运行
source ~/.bashrc

# 使用项目指定的 Node.js 版本
nvm use

# 如果版本不存在，先安装
nvm install 20.16.0
nvm use 20.16.0

# 设置为默认版本 (可选)
nvm alias default 20.16.0
```

### 验证版本
```bash
node -v   # 应该显示 v20.16.0
npm -v    # 应该显示 >= 8.0.0
```

## 🚀 部署环境

### Vercel
- ✅ 自动读取 `.nvmrc` 文件
- ✅ 使用 `vercel.json` 中指定的运行时
- ✅ 支持 Node.js 20.x

### 其他平台
大多数现代部署平台都支持：
- 读取 `package.json` 中的 `engines` 字段
- 使用 `.nvmrc` 文件指定版本

## 🔍 版本兼容性

### Next.js 15.4.6
- ✅ Node.js 18.0.0+
- ✅ Node.js 20.x (推荐)
- ❌ Node.js 16.x (不支持)

### 依赖包兼容性
项目中的所有依赖都与 Node.js 20.x 兼容。

## 🐛 故障排除

### 版本不匹配问题

```bash
# 检查当前版本
node -v
npm -v

# 如果版本不正确，使用 nvm 切换
nvm use 20.16.0

# 清理 node_modules 并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 构建错误

```bash
# 确保使用正确的 Node.js 版本
nvm use

# 清理构建缓存
npm run clean

# 重新构建
npm run build
```

## 📊 版本检查脚本

项目包含的检查脚本：

```bash
# 验证环境
npm run validate:env

# 类型检查
npm run type-check

# 构建测试
npm run build
```

## 🔄 版本更新

当需要更新 Node.js 版本时：

1. **更新 `.nvmrc`**
2. **更新 `package.json` 中的 `engines`**
3. **更新 `vercel.json` 中的 `runtime`**
4. **测试所有构建和部署流程**

---

💡 **提示**: 使用 `nvm use` 命令可以自动切换到项目指定的 Node.js 版本。
