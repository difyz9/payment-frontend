#!/bin/bash

# Vercel 环境变量快速设置脚本
# 使用前请先安装并登录 Vercel CLI: npm i -g vercel && vercel login

echo "🚀 开始配置 Vercel 环境变量..."

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 请先安装 Vercel CLI: npm i -g vercel"
    exit 1
fi

# 设置生产环境变量
echo "📝 设置生产环境变量..."

echo "NEXT_PUBLIC_API_BASE_URL (生产环境)..."
echo "https://www.coding520.top/pay-api" | vercel env add NEXT_PUBLIC_API_BASE_URL production

echo "NEXT_PUBLIC_BASE_URL (生产环境)..."
echo "https://www.coding520.top" | vercel env add NEXT_PUBLIC_BASE_URL production

echo "NEXT_PUBLIC_APP_ENV (生产环境)..."
echo "production" | vercel env add NEXT_PUBLIC_APP_ENV production

echo "NEXT_PUBLIC_APP_NAME (生产环境)..."
echo "支付管理系统" | vercel env add NEXT_PUBLIC_APP_NAME production

echo "NEXT_PUBLIC_APP_VERSION (生产环境)..."
echo "1.0.0" | vercel env add NEXT_PUBLIC_APP_VERSION production

echo "NEXT_PUBLIC_DEBUG (生产环境)..."
echo "false" | vercel env add NEXT_PUBLIC_DEBUG production

echo "NEXT_PUBLIC_BASE_PATH (生产环境)..."
echo "" | vercel env add NEXT_PUBLIC_BASE_PATH production

# 设置预览环境变量（与生产环境相同）
echo "📝 设置预览环境变量..."

echo "NEXT_PUBLIC_API_BASE_URL (预览环境)..."
echo "https://www.coding520.top/pay-api" | vercel env add NEXT_PUBLIC_API_BASE_URL preview

echo "NEXT_PUBLIC_BASE_URL (预览环境)..."
echo "https://www.coding520.top" | vercel env add NEXT_PUBLIC_BASE_URL preview

echo "NEXT_PUBLIC_APP_ENV (预览环境)..."
echo "preview" | vercel env add NEXT_PUBLIC_APP_ENV preview

echo "NEXT_PUBLIC_APP_NAME (预览环境)..."
echo "支付管理系统 (预览)" | vercel env add NEXT_PUBLIC_APP_NAME preview

echo "NEXT_PUBLIC_APP_VERSION (预览环境)..."
echo "1.0.0" | vercel env add NEXT_PUBLIC_APP_VERSION preview

echo "NEXT_PUBLIC_DEBUG (预览环境)..."
echo "true" | vercel env add NEXT_PUBLIC_DEBUG preview

echo "NEXT_PUBLIC_BASE_PATH (预览环境)..."
echo "" | vercel env add NEXT_PUBLIC_BASE_PATH preview

# 设置开发环境变量
echo "📝 设置开发环境变量..."

echo "NEXT_PUBLIC_API_BASE_URL (开发环境)..."
echo "http://localhost:3001/api" | vercel env add NEXT_PUBLIC_API_BASE_URL development

echo "NEXT_PUBLIC_BASE_URL (开发环境)..."
echo "http://localhost:3000" | vercel env add NEXT_PUBLIC_BASE_URL development

echo "NEXT_PUBLIC_APP_ENV (开发环境)..."
echo "development" | vercel env add NEXT_PUBLIC_APP_ENV development

echo "NEXT_PUBLIC_APP_NAME (开发环境)..."
echo "支付管理系统 (开发)" | vercel env add NEXT_PUBLIC_APP_NAME development

echo "NEXT_PUBLIC_APP_VERSION (开发环境)..."
echo "1.0.0-dev" | vercel env add NEXT_PUBLIC_APP_VERSION development

echo "NEXT_PUBLIC_DEBUG (开发环境)..."
echo "true" | vercel env add NEXT_PUBLIC_DEBUG development

echo "NEXT_PUBLIC_BASE_PATH (开发环境)..."
echo "" | vercel env add NEXT_PUBLIC_BASE_PATH development

echo "✅ 环境变量配置完成！"
echo "📋 接下来的步骤："
echo "1. 访问 Vercel Dashboard 验证配置"
echo "2. 进行测试部署"
echo "3. 验证环境变量是否正确加载"
