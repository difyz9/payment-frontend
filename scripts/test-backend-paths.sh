#!/bin/bash

# 测试后端 API 路径结构
echo "🔍 测试后端 API 路径结构..."

BASE_URL="https://www.coding520.top/pay-api"

echo "📋 测试不同的路径组合:"
echo ""

# 测试认证 API 路径
echo "🔐 认证 API 测试:"
echo "1. 测试 /api/auth/login"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/api/auth/login" || echo "请求失败"

echo "2. 测试 /auth/login"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/auth/login" || echo "请求失败"

echo ""

# 测试业务 API 路径
echo "📊 业务 API 测试:"
echo "1. 测试 /api/v1/orders"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/api/v1/orders" || echo "请求失败"

echo "2. 测试 /v1/orders"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/v1/orders" || echo "请求失败"

echo "3. 测试 /orders"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/orders" || echo "请求失败"

echo ""

# 测试应用 API 路径
echo "🏗️ 应用 API 测试:"
echo "1. 测试 /api/v1/apps"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/api/v1/apps" || echo "请求失败"

echo "2. 测试 /v1/apps"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/v1/apps" || echo "请求失败"

echo "3. 测试 /apps"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/apps" || echo "请求失败"

echo ""
echo "💡 说明:"
echo "- 200/401: 路径正确，可能需要认证"
echo "- 404: 路径不存在"
echo "- 405: 路径存在但方法不允许"
echo "- 其他: 服务器错误或网络问题"
