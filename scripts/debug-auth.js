#!/usr/bin/env node

/**
 * 前端认证调试工具
 * 检查前端认证流程中的潜在问题
 */

const issues = [
  {
    title: "1. HTTP 客户端 Token 传递检查",
    description: "检查 HTTP 客户端是否正确添加 Authorization 头",
    solution: `在 src/lib/http.ts 的请求拦截器中添加调试日志：

// 添加认证拦截器
httpClient.addRequestInterceptor((config) => {
  // 从localStorage获取token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    console.log('🔐 Auth Token:', token ? token.substring(0, 50) + '...' : 'null');
    if (token && config.headers) {
      (config.headers as Record<string, string>).Authorization = \`Bearer \${token}\`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No token or headers object');
    }
  }
  return config;
});`
  },
  {
    title: "2. 登录响应数据格式检查",
    description: "确认登录后正确保存 token",
    solution: `在 AuthProvider.tsx 的 login 函数中添加调试：

const login = async (credentials: LoginCredentials) => {
  try {
    const response = await authAPI.login(credentials);
    console.log('🔍 Login response:', response);
    
    const { user: userData, token } = response;
    console.log('👤 User data:', userData);
    console.log('🔑 Token:', token ? token.substring(0, 50) + '...' : 'null');
    
    // 保存认证信息
    setStoredToken(token);
    setStoredUser(userData);
    setUser(userData);
    
    // 验证保存是否成功
    console.log('💾 Stored token:', localStorage.getItem('auth_token')?.substring(0, 50) + '...');
    
    toast.success('登录成功');
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};`
  },
  {
    title: "3. CORS 跨域问题检查",
    description: "确认浏览器控制台没有 CORS 错误",
    solution: `检查浏览器开发者工具的控制台：
1. 打开 Network 标签页
2. 尝试登录和获取用户信息
3. 查看请求是否显示 CORS 错误
4. 确认 Authorization 头是否正确发送`
  },
  {
    title: "4. 环境变量配置检查",
    description: "确认 API 基础 URL 配置正确",
    solution: `检查 .env.production 文件：
NEXT_PUBLIC_API_BASE_URL=https://www.coding520.top/payment

在浏览器控制台执行：
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);`
  },
  {
    title: "5. 浏览器存储检查",
    description: "确认 localStorage 正常工作",
    solution: `在浏览器控制台执行：
// 检查存储的认证信息
console.log('Stored auth_token:', localStorage.getItem('auth_token'));
console.log('Stored auth_user:', localStorage.getItem('auth_user'));

// 手动设置 token 测试
localStorage.setItem('auth_token', 'test_token');
console.log('Test token:', localStorage.getItem('auth_token'));`
  }
];

console.log('🔍 前端认证问题排查指南\n');
console.log('='.repeat(60));

issues.forEach((issue, index) => {
  console.log(`\n${issue.title}`);
  console.log('-'.repeat(50));
  console.log(`描述: ${issue.description}`);
  console.log('\n解决方案:');
  console.log(issue.solution);
  console.log('\n' + '='.repeat(60));
});

console.log('\n🚀 建议按照上述顺序逐步排查问题');
console.log('💡 大多数情况下问题出现在步骤 1 和 2');
