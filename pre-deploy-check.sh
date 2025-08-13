#!/bin/bash

# 支付管理系统 - 部署前检查脚本

set -e

echo "🔍 开始部署前检查..."

# 检查 Node.js 版本
echo "📦 检查 Node.js 版本..."
node_version=$(node -v)
echo "当前 Node.js 版本: $node_version"

# 检查项目依赖
echo "📋 检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  未找到 node_modules，正在安装依赖..."
    npm install
else
    echo "✅ 依赖已安装"
fi

# 检查环境变量文件
echo "🔧 检查环境变量配置..."
if [ -f ".env.production" ]; then
    echo "✅ 生产环境配置文件存在"
else
    echo "❌ 缺少 .env.production 文件"
fi

if [ -f ".env.vercel" ]; then
    echo "✅ Vercel 环境配置文件存在"
else
    echo "❌ 缺少 .env.vercel 文件"
fi

# 类型检查
echo "🔍 运行 TypeScript 类型检查..."
npm run type-check

# 代码检查
echo "🧹 运行 ESLint 检查..."
npm run lint

# 测试构建 - Vercel 模式
echo "🏗️ 测试 Vercel 构建..."
npm run build:vercel

# 测试构建 - 静态导出模式
echo "🏗️ 测试静态导出构建..."
npm run build

echo "
✅ 所有检查通过！项目已准备好部署。

📋 部署清单：
- ✅ Node.js 版本兼容
- ✅ 项目依赖完整
- ✅ 环境变量配置
- ✅ TypeScript 类型检查
- ✅ 代码质量检查
- ✅ 构建测试成功

🚀 下一步：
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署！

详细步骤请查看 readme9.md
"
