#!/bin/bash

# 支付管理系统 - 快速部署到 Vercel 脚本
# 使用方法: ./deploy-to-vercel.sh [github-repo-url]

set -e

echo "🚀 开始部署支付管理系统到 Vercel..."

# 检查是否提供了 GitHub 仓库 URL
if [ -z "$1" ]; then
    echo "❌ 请提供 GitHub 仓库 URL"
    echo "用法: ./deploy-to-vercel.sh https://github.com/username/repo-name.git"
    exit 1
fi

GITHUB_REPO_URL="$1"

echo "📦 安装依赖..."
npm install

echo "🔍 运行类型检查..."
npm run type-check

echo "🧹 运行代码检查..."
npm run lint

echo "🏗️ 测试构建..."
npm run build:vercel

echo "✅ 本地检查通过！"

echo "📤 推送到 GitHub..."

# 检查是否已经初始化 git
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    git init
fi

# 添加所有文件
git add .

# 提交更改
echo "请输入提交信息 (默认: Deploy to Vercel):"
read -r commit_message
if [ -z "$commit_message" ]; then
    commit_message="Deploy to Vercel"
fi

git commit -m "$commit_message"

# 添加远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "添加远程仓库..."
    git remote add origin "$GITHUB_REPO_URL"
fi

# 推送到 GitHub
git branch -M main
git push -u origin main

echo "✅ 代码已推送到 GitHub！"

echo "
🎉 部署准备完成！

下一步在 Vercel 控制台操作：
1. 访问 https://vercel.com
2. 点击 'New Project'
3. 选择刚才推送的 GitHub 仓库
4. 配置环境变量：
   - NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/pay-api
   - NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   - NEXT_PUBLIC_APP_ENV=production
   - NEXT_PUBLIC_APP_NAME=支付管理系统
   - NEXT_PUBLIC_APP_VERSION=1.0.0
   - NEXT_PUBLIC_DEBUG=false
   - VERCEL=1
5. 点击 'Deploy'

详细说明请查看 readme9.md 文件。
"
