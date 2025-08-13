#!/usr/bin/env node

/**
 * 前端认证问题诊断工具
 * 创建一个简单的 HTML 页面来测试认证流程
 */

const fs = require('fs');
const path = require('path');

const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>认证测试</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .log {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 3px;
            max-height: 300px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
        }
        input, button {
            margin: 5px;
            padding: 8px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        button:disabled {
            background: #ccc;
        }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
    </style>
</head>
<body>
    <h1>前端认证测试工具</h1>
    
    <div class="section">
        <h3>1. 登录测试</h3>
        <input type="email" id="email" value="guanpeizuo@126.com" placeholder="邮箱">
        <input type="password" id="password" value="Ab123456" placeholder="密码">
        <button onclick="testLogin()" id="loginBtn">登录</button>
        <button onclick="testGetUser()" id="getUserBtn">获取用户信息</button>
        <button onclick="clearAuth()" id="clearBtn">清除认证</button>
    </div>
    
    <div class="section">
        <h3>2. 当前状态</h3>
        <div id="status">
            <div>Token: <span id="tokenDisplay">无</span></div>
            <div>用户: <span id="userDisplay">无</span></div>
        </div>
    </div>
    
    <div class="section">
        <h3>3. 调试日志</h3>
        <button onclick="clearLogs()">清除日志</button>
        <div id="logs" class="log"></div>
    </div>

    <script>
        const API_BASE_URL = 'https://www.coding520.top/payment';
        
        function log(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const logs = document.getElementById('logs');
            const div = document.createElement('div');
            div.className = type;
            div.textContent = \`[\${timestamp}] \${message}\`;
            logs.appendChild(div);
            logs.scrollTop = logs.scrollHeight;
            console.log(\`[\${type.toUpperCase()}] \${message}\`);
        }
        
        function updateStatus() {
            const token = localStorage.getItem('auth_token');
            const user = localStorage.getItem('auth_user');
            
            document.getElementById('tokenDisplay').textContent = 
                token ? token.substring(0, 50) + '...' : '无';
            document.getElementById('userDisplay').textContent = 
                user ? JSON.parse(user).username + ' (' + JSON.parse(user).email + ')' : '无';
        }
        
        async function makeRequest(url, options = {}) {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            if (token && options.needAuth !== false) {
                headers['Authorization'] = \`Bearer \${token}\`;
                log(\`🔐 添加认证头: Bearer \${token.substring(0, 50)}...\`);
            }
            
            log(\`📤 请求: \${options.method || 'GET'} \${url}\`);
            log(\`📋 请求头: \${JSON.stringify(headers, null, 2)}\`);
            
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            log(\`📥 响应状态: \${response.status} \${response.statusText}\`);
            
            const data = await response.json();
            log(\`📄 响应数据: \${JSON.stringify(data, null, 2)}\`);
            
            if (!response.ok) {
                throw new Error(\`HTTP \${response.status}: \${data.message || response.statusText}\`);
            }
            
            return data;
        }
        
        async function testLogin() {
            try {
                log('🚀 开始登录测试...');
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                const response = await makeRequest(\`\${API_BASE_URL}/api/auth/login\`, {
                    method: 'POST',
                    needAuth: false,
                    body: JSON.stringify({ email, password })
                });
                
                if (response.code === 200 && response.data) {
                    const { user, token } = response.data;
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    
                    log(\`✅ 登录成功！用户: \${user.username}\`, 'success');
                    log(\`🔑 Token 已保存: \${token.substring(0, 50)}...\`, 'success');
                    updateStatus();
                } else {
                    throw new Error('登录响应格式错误');
                }
            } catch (error) {
                log(\`❌ 登录失败: \${error.message}\`, 'error');
            }
        }
        
        async function testGetUser() {
            try {
                log('👤 开始获取用户信息...');
                
                const response = await makeRequest(\`\${API_BASE_URL}/api/auth/me\`);
                
                if (response.code === 200 && response.data) {
                    const user = response.data;
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    
                    log(\`✅ 获取用户信息成功！用户: \${user.username}\`, 'success');
                    updateStatus();
                } else {
                    throw new Error('获取用户信息响应格式错误');
                }
            } catch (error) {
                log(\`❌ 获取用户信息失败: \${error.message}\`, 'error');
                
                if (error.message.includes('401')) {
                    log('🔄 Token 可能已过期，请重新登录', 'error');
                    clearAuth();
                }
            }
        }
        
        function clearAuth() {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            log('🗑️ 已清除认证信息');
            updateStatus();
        }
        
        function clearLogs() {
            document.getElementById('logs').innerHTML = '';
        }
        
        // 页面加载时更新状态
        updateStatus();
        log('📱 页面已加载，当前认证状态已显示');
    </script>
</body>
</html>
`;

// 保存到 public 目录
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'auth-test.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('✅ 认证测试页面已创建: public/auth-test.html');
console.log('');
console.log('📖 使用说明:');
console.log('1. 构建并部署前端项目');
console.log('2. 访问: https://www.coding520.top/pay/auth-test.html');
console.log('3. 使用页面测试认证流程');
console.log('4. 查看详细的调试日志');
console.log('');
console.log('🔍 这个工具将帮助诊断:');
console.log('- Token 是否正确保存到 localStorage');
console.log('- Authorization 头是否正确添加');
console.log('- API 请求和响应的详细信息');
console.log('- 认证流程中的每一步状态');
