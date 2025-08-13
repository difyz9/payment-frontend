#!/usr/bin/env node

/**
 * API 路径测试脚本
 * 验证后端 API 路径是否正确配置
 */

const https = require('https');

const BASE_URL = 'https://www.coding520.top/payment';

// 测试函数
function testAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test/1.0'
      }
    };

    if (data && method !== 'GET') {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 测试用例
async function runTests() {
  console.log('🧪 开始 API 路径测试\n');
  
  const tests = [
    {
      name: '服务状态检查',
      path: '/',
      method: 'GET'
    },
    {
      name: '认证登录路径 (POST)',
      path: '/api/auth/login',
      method: 'POST',
      data: { username: 'test', password: 'test' }
    },
    {
      name: '应用管理路径 (GET)',
      path: '/api/v1/apps',
      method: 'GET'
    },
    {
      name: '认证用户信息路径 (GET)',
      path: '/api/auth/me',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📋 测试: ${test.name}`);
      console.log(`🔗 URL: ${BASE_URL}${test.path}`);
      console.log(`🚀 方法: ${test.method}`);
      
      const result = await testAPI(test.path, test.method, test.data);
      
      console.log(`📊 状态码: ${result.status}`);
      
      if (result.status === 200) {
        console.log('✅ 路径正确');
      } else if (result.status === 404) {
        console.log('❌ 路径不存在 (404)');
      } else if (result.status === 401 || result.status === 403) {
        console.log('🔐 需要认证/权限 (这是正常的)');
      } else if (result.status >= 400 && result.status < 500) {
        console.log(`⚠️  客户端错误 (${result.status}) - 路径存在但请求有问题`);
      } else {
        console.log(`🔄 服务器响应: ${result.status}`);
      }
      
      if (result.data && typeof result.data === 'object') {
        console.log(`📄 响应数据: ${JSON.stringify(result.data, null, 2)}`);
      }
      
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n🎯 测试建议:');
  console.log('• ✅ 200: API 路径正确且可用');
  console.log('• 🔐 401/403: API 路径正确但需要认证');
  console.log('• ⚠️  400-499: API 路径正确但请求格式有问题');
  console.log('• ❌ 404: API 路径不正确');
  console.log('• 🔄 500+: 服务器内部错误');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };
