#!/bin/bash

# 验证 API 路径统一性
echo "🔍 验证 API 路径统一性..."

echo "📋 检查前端代码中的 API 调用路径:"
echo ""

echo "1. 检查是否还有旧的 /api/auth/ 路径:"
if grep -r "/api/auth/" src/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
    echo "❌ 发现旧的认证路径，需要更新"
else
    echo "✅ 已统一使用 /api/v1/auth/ 路径"
fi

echo ""
echo "2. 检查所有 API 调用是否都使用 /api/v1/ 前缀:"
echo "   API 调用统计:"
grep -r "/api/" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
    grep -E "http\.(get|post|put|delete|patch)" | \
    sed "s/.*'//" | sed "s/'.*//" | sed "s/\`.*\`//" | \
    sort | uniq -c | sort -nr

echo ""
echo "3. 验证 vercel.json 配置:"
echo "   当前代理规则:"
grep -A 5 '"rewrites"' vercel.json

echo ""
echo "4. 路径映射示例:"
echo "   前端调用                     → 后端实际路径"
echo "   /api/v1/auth/login          → /v1/auth/login"
echo "   /api/v1/apps                → /v1/apps"
echo "   /api/v1/orders              → /v1/orders"

echo ""
echo "✅ 统一后的优势:"
echo "   • 前后端路径一致，便于调试"
echo "   • API 版本化管理清晰"
echo "   • 代理配置简单统一"
echo "   • 易于后续版本升级（v2, v3...）"
