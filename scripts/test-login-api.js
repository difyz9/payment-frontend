#!/usr/bin/env node

/**
 * 测试登录 API 的完整流程
 */

const https = require('https');

const baseUrl = 'https://www.coding520.top/payment';

// 测试数据
const testCredentials = {
  email: 'test@example.com',
  password: 'test123'
};

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'User-Agent': 'Node.js Test Script',
        'Accept': 'application/json',
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLoginAPI() {
  console.log('🚀 开始测试登录 API...\n');
  
  try {
    // 1. 测试服务状态
    console.log('1. 测试服务状态...');
    const statusResult = await makeRequest('/');
    console.log(`   状态: ${statusResult.status}`);
    if (statusResult.body) {
      console.log(`   响应: ${JSON.stringify(statusResult.body, null, 2)}`);
    }
    console.log('');

    // 2. 测试登录 API - OPTIONS 请求 (检查 CORS)
    console.log('2. 测试 CORS 预检请求...');
    const optionsResult = await makeRequest('/api/auth/login', 'OPTIONS');
    console.log(`   状态: ${optionsResult.status}`);
    console.log(`   CORS 头: ${JSON.stringify({
      'access-control-allow-origin': optionsResult.headers['access-control-allow-origin'],
      'access-control-allow-methods': optionsResult.headers['access-control-allow-methods'],
      'access-control-allow-headers': optionsResult.headers['access-control-allow-headers']
    }, null, 2)}`);
    console.log('');

    // 3. 测试登录 API - POST 请求
    console.log('3. 测试登录 POST 请求...');
    console.log(`   请求数据: ${JSON.stringify(testCredentials, null, 2)}`);
    const loginResult = await makeRequest('/api/auth/login', 'POST', testCredentials);
    console.log(`   状态: ${loginResult.status}`);
    
    if (loginResult.body) {
      console.log(`   响应: ${JSON.stringify(loginResult.body, null, 2)}`);
      
      // 分析响应
      if (loginResult.status === 200) {
        console.log('   ✅ 登录成功！');
      } else if (loginResult.status === 400) {
        console.log('   ⚠️  请求参数错误，但 API 路径正确');
      } else if (loginResult.status === 401) {
        console.log('   ⚠️  认证失败，但 API 路径正确');
      } else if (loginResult.status === 404) {
        console.log('   ❌ API 路径不存在');
      } else if (loginResult.status === 405) {
        console.log('   ⚠️  方法不允许，但 API 路径存在');
      } else {
        console.log(`   ⚠️  未知状态: ${loginResult.status}`);
      }
    }
    console.log('');

    // 4. 测试获取用户信息 API
    console.log('4. 测试获取用户信息 API...');
    const meResult = await makeRequest('/api/auth/me', 'GET');
    console.log(`   状态: ${meResult.status}`);
    if (meResult.body) {
      console.log(`   响应: ${JSON.stringify(meResult.body, null, 2)}`);
    }
    console.log('');

    // 5. 检查后端 API 文档
    console.log('5. 检查 API 文档...');
    const docsResult = await makeRequest('/docs/swagger.json', 'GET');
    console.log(`   状态: ${docsResult.status}`);
    if (docsResult.status === 200 && docsResult.body) {
      const paths = docsResult.body.paths || {};
      const authPaths = Object.keys(paths).filter(path => path.includes('auth'));
      console.log(`   发现的认证相关路径: ${JSON.stringify(authPaths, null, 2)}`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
  
  console.log('\n✅ 测试完成！');
}

// 运行测试
testLoginAPI();
