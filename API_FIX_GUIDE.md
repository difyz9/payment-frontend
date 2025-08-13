# API 路径配置修复说明

## 🔍 问题分析

你遇到的问题是在 Vercel 部署后，API 请求地址变成了 `http://localhost:8089/api/auth/login` 而不是正确的后端地址。

## 🔧 已修复的配置

### 1. Vercel 代理配置 (`vercel.json`)

**修复前:**
```json
{
  "source": "/api/(.*)",
  "destination": "https://www.coding520.top/pay-api/$1"
}
```
这会导致：`/api/auth/login` → `https://www.coding520.top/pay-api/auth/login` ❌

**修复后:**
```json
{
  "source": "/api/(.*)",
  "destination": "https://www.coding520.top/pay-api/api/$1"
}
```
现在正确映射：`/api/auth/login` → `https://www.coding520.top/pay-api/api/auth/login` ✅

### 2. HTTP 客户端配置 (`src/lib/http.ts`)

**修复后的逻辑:**
- **生产环境 (Vercel)**: 使用空字符串作为 baseURL，让 Vercel 代理生效
- **开发环境**: 使用 `http://localhost:8089` 直接连接后端

```typescript
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  this.baseURL = '';  // 使用相对路径，让 vercel.json 代理生效
} else {
  this.baseURL = 'http://localhost:8089';  // 开发环境直连
}
```

## 🚀 路径映射结果

| 前端调用 | Vercel 代理后 | 后端实际路径 |
|---------|--------------|-------------|
| `/api/auth/login` | `https://www.coding520.top/pay-api/api/auth/login` | `/api/auth/login` ✅ |
| `/api/auth/register` | `https://www.coding520.top/pay-api/api/auth/register` | `/api/auth/register` ✅ |
| `/api/v1/apps` | `https://www.coding520.top/pay-api/api/v1/apps` | `/api/v1/apps` ✅ |
| `/api/v1/orders` | `https://www.coding520.top/pay-api/api/v1/orders` | `/api/v1/orders` ✅ |

## 🧪 测试方法

### 1. 部署后在线测试

访问你的 Vercel 部署域名加 `/api-test.html`：
```
https://your-app.vercel.app/api-test.html
```

这个测试页面会帮你：
- 检测当前环境信息
- 测试 API 连接
- 验证路径映射
- 测试登录接口

### 2. 浏览器开发者工具测试

1. 打开部署后的网站
2. 按 F12 打开开发者工具
3. 在 Console 中运行：

```javascript
// 测试路径映射
fetch('/api/auth/me')
  .then(response => {
    console.log('状态码:', response.status);
    console.log('URL:', response.url);
    return response.text();
  })
  .then(data => console.log('响应:', data))
  .catch(error => console.error('错误:', error));
```

### 3. Network 面板验证

在开发者工具的 Network 面板中，你应该看到：
- **请求 URL**: `/api/auth/login`
- **实际请求**: 被代理到 `https://www.coding520.top/pay-api/api/auth/login`

## ⚠️ 可能的其他问题

如果修复后仍有问题，请检查：

1. **后端 CORS 配置**
   ```go
   // 确保后端允许 Vercel 域名的跨域请求
   c.Header("Access-Control-Allow-Origin", "https://your-app.vercel.app")
   ```

2. **后端服务状态**
   ```bash
   curl -X POST https://www.coding520.top/pay-api/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

3. **环境变量设置**
   在 Vercel Dashboard 确保设置了：
   ```
   VERCEL=1
   NODE_ENV=production
   ```

## 📋 部署清单

- [x] 修复 `vercel.json` 代理配置
- [x] 更新 HTTP 客户端环境判断逻辑
- [x] 创建在线测试工具
- [ ] 推送代码到 GitHub
- [ ] 在 Vercel 重新部署
- [ ] 使用测试工具验证 API 连接

## 🎯 下一步

1. 提交并推送修复代码
2. 触发 Vercel 重新部署
3. 访问 `/api-test.html` 验证修复效果
4. 如果还有问题，检查后端 CORS 和服务状态
