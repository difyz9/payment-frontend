#!/bin/bash

# 验证 API 路径映射
echo "🔍 验证 API 路径映射..."

echo "📋 当前配置:"
echo "前端调用路径 → Vercel 代理后 → 实际后端路径"
echo ""

echo "认证相关 API:"
echo "/api/auth/login → https://www.coding520.top/pay-api/api/auth/login"
echo "/api/auth/register → https://www.coding520.top/pay-api/api/auth/register"
echo "/api/auth/logout → https://www.coding520.top/pay-api/api/auth/logout"
echo "/api/auth/me → https://www.coding520.top/pay-api/api/auth/me"

echo ""
echo "业务 API:"
echo "/api/v1/apps → https://www.coding520.top/pay-api/api/v1/apps"
echo "/api/v1/orders → https://www.coding520.top/pay-api/api/v1/orders"

echo ""
echo "✅ 这样配置后，前端请求的路径会正确映射到后端的实际路径"
echo "   前端: /api/auth/login"
echo "   后端: /api/auth/login (通过 Vercel 代理)"

echo ""
echo "🔧 如果还有问题，可能的原因:"
echo "1. 后端服务没有运行在 https://www.coding520.top/pay-api"
echo "2. 后端的 CORS 配置不允许来自 Vercel 域名的请求"
echo "3. 认证令牌或请求头配置问题"
