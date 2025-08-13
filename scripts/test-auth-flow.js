#!/usr/bin/env node

/**
 * 测试完整的认证流程：登录 -> 获取用户信息
 */

const https = require('https');

const baseUrl = 'https://www.coding520.top/payment';

// 测试登录数据
const loginData = {
  email: 'guanpeizuo@126.com',
  password: 'Ab123456'
};

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'User-Agent': 'Frontend Test Script',
        'Accept': 'application/json',
        ...headers
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

async function testFullAuthFlow() {
  console.log('🚀 开始测试完整认证流程...\n');
  
  try {
    // 1. 登录获取 token
    console.log('1. 登录获取 token...');
    console.log(`   请求数据: ${JSON.stringify(loginData, null, 2)}`);
    
    const loginResult = await makeRequest('/api/auth/login', 'POST', loginData);
    console.log(`   状态: ${loginResult.status}`);
    
    if (loginResult.status !== 200 || !loginResult.body || !loginResult.body.data) {
      console.log(`   ❌ 登录失败: ${JSON.stringify(loginResult.body, null, 2)}`);
      return;
    }
    
    const { token, user } = loginResult.body.data;
    console.log(`   ✅ 登录成功！`);
    console.log(`   用户: ${user.username} (${user.email})`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log('');

    // 2. 使用 token 获取用户信息
    console.log('2. 使用 token 获取用户信息...');
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    };
    
    const userResult = await makeRequest('/api/auth/me', 'GET', null, authHeaders);
    console.log(`   状态: ${userResult.status}`);
    console.log(`   请求头: Authorization: Bearer ${token.substring(0, 50)}...`);
    
    if (userResult.body) {
      console.log(`   响应: ${JSON.stringify(userResult.body, null, 2)}`);
    }
    
    if (userResult.status === 200) {
      console.log('   ✅ 获取用户信息成功！');
    } else if (userResult.status === 401) {
      console.log('   ❌ 认证失败 - Token 可能无效或格式错误');
    } else {
      console.log(`   ⚠️  未知错误: ${userResult.status}`);
    }
    console.log('');

    // 3. 测试不同的 Authorization 格式
    console.log('3. 测试不同的 Authorization 格式...');
    
    // 测试不带 Bearer 前缀
    console.log('   测试格式: Authorization: {token}');
    const testResult1 = await makeRequest('/api/auth/me', 'GET', null, {
      'Authorization': token
    });
    console.log(`   状态: ${testResult1.status}`);
    
    // 测试小写 bearer
    console.log('   测试格式: Authorization: bearer {token}');
    const testResult2 = await makeRequest('/api/auth/me', 'GET', null, {
      'Authorization': `bearer ${token}`
    });
    console.log(`   状态: ${testResult2.status}`);
    
    // 测试自定义头
    console.log('   测试格式: X-Auth-Token: {token}');
    const testResult3 = await makeRequest('/api/auth/me', 'GET', null, {
      'X-Auth-Token': token
    });
    console.log(`   状态: ${testResult3.status}`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
  
  console.log('\n✅ 测试完成！');
}

// 运行测试
testFullAuthFlow();
