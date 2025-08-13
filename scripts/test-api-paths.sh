#!/bin/bash

# API 路径测试脚本
echo "🔍 测试 API 路径配置..."

# 检查环境变量
echo "📋 当前环境变量:"
echo "NODE_ENV: ${NODE_ENV:-未设置}"
echo "VERCEL: ${VERCEL:-未设置}"
echo "NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-未设置}"

# 模拟不同环境下的 API 路径
echo ""
echo "🚀 模拟路径解析:"

# 开发环境
echo "开发环境 (NODE_ENV=development):"
echo "  baseURL: http://localhost:8089"
echo "  请求路径: http://localhost:8089/api/auth/login"

# 生产环境 (Vercel)
echo "生产环境 (VERCEL=1):"
echo "  baseURL: '' (空字符串)"
echo "  请求路径: /api/auth/login"
echo "  经过 vercel.json 代理后: https://www.coding520.top/pay-api/api/auth/login"

echo ""
echo "⚠️  注意: 后端 API 路径可能需要调整"
echo "   如果后端实际路径是 /auth/login"
echo "   那么 vercel.json 的代理配置可能需要修改"

echo ""
echo "🔧 建议的修复方案:"
echo "1. 检查后端 API 实际路径结构"
echo "2. 相应调整 vercel.json 的代理配置"
echo "3. 或者调整前端的 API 调用路径"
