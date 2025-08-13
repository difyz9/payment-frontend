#!/usr/bin/env node

/**
 * 环境配置验证脚本
 * 验证不同环境下的配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 验证环境配置
function validateEnvironment(env = 'production') {
  log(`\n🔍 验证 ${env} 环境配置`, 'cyan');
  
  const envFile = `.env.${env}`;
  
  // 检查环境变量文件是否存在（本地检查，不影响部署）
  if (fs.existsSync(envFile)) {
    log(`✅ 本地环境配置文件存在: ${envFile}`, 'green');
    
    // 读取环境配置
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    // 显示本地配置
    log('\n📋 本地环境配置:', 'blue');
    Object.entries(envVars).forEach(([key, value]) => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        log(`   ${key}: ${value}`, 'blue');
      }
    });
    
    return true;
  } else {
    log(`⚠️  本地环境配置文件不存在: ${envFile}`, 'yellow');
    log(`💡 这是正常的，部署时应在平台配置环境变量`, 'cyan');
    return true; // 不再要求本地文件存在
  }
  
  // 验证必需的环境变量
  const requiredVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_API_BASE_URL'
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_BASE_PATH',
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_VERSION',
    'NEXT_PUBLIC_DEBUG'
  ];

  // 如果本地环境文件存在，验证配置
  if (fs.existsSync(envFile)) {
    const missingVars = [];
    
    requiredVars.forEach(varName => {
      if (envVars[varName]) {
        log(`✅ ${varName}: ${envVars[varName]}`, 'green');
      } else {
        missingVars.push(varName);
        log(`❌ ${varName}: 未配置`, 'red');
      }
    });
    
    // 验证可选环境变量
    optionalVars.forEach(varName => {
      if (envVars.hasOwnProperty(varName)) {
        const value = envVars[varName] || '(空值)';
        log(`✅ ${varName}: ${value}`, 'green');
      } else {
        log(`⚠️  ${varName}: 未配置 (可选)`, 'yellow');
      }
    });
    
    return missingVars.length === 0;
  }
  
  return true;  // 显示其他配置
  if (fs.existsSync(envFile)) {
    log('\n📋 其他配置:', 'blue');
    Object.entries(envVars).forEach(([key, value]) => {
      if (!requiredVars.includes(key) && !optionalVars.includes(key)) {
        log(`   ${key}: ${value}`, 'blue');
      }
    });
    
    // 验证API URL格式
    if (envVars.NEXT_PUBLIC_API_BASE_URL) {
      const apiUrl = envVars.NEXT_PUBLIC_API_BASE_URL;
      if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
        log(`✅ API URL 格式正确: ${apiUrl}`, 'green');
      } else {
        log(`⚠️  API URL 格式可能有问题: ${apiUrl}`, 'yellow');
      }
    }
    
    // 验证路径配置
    if (envVars.NEXT_PUBLIC_BASE_PATH) {
      const basePath = envVars.NEXT_PUBLIC_BASE_PATH;
      if (basePath.startsWith('/')) {
        log(`✅ Base Path 格式正确: ${basePath}`, 'green');
      } else {
        log(`⚠️  Base Path 应该以 / 开头: ${basePath}`, 'yellow');
      }
    }
  }
}

// 比较不同环境的配置
function compareEnvironments() {
  log('\n🔄 检查环境配置文件', 'cyan');
  
  const environments = ['development', 'staging', 'production'];
  const envConfigs = {};
  
  environments.forEach(env => {
    const envFile = `.env.${env}`;
    if (fs.existsSync(envFile)) {
      log(`✅ ${env}: 本地配置文件存在`, 'green');
    } else {
      log(`⚠️  ${env}: 本地配置文件不存在 (正常情况)`, 'yellow');
    }
  });
  
  // 检查 .env.example 文件
  if (fs.existsSync('.env.example')) {
    log(`✅ .env.example: 示例文件存在`, 'green');
    
    const content = fs.readFileSync('.env.example', 'utf8');
    log('\n📋 环境变量示例:', 'blue');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key] = trimmed.split('=');
        log(`   ${key.trim()}`, 'blue');
      }
    });
  } else {
    log(`❌ .env.example: 示例文件缺失`, 'red');
  }
}

// 验证构建配置
function validateBuildConfig() {
  log('\n🏗️  验证构建配置', 'cyan');
  
  // 检查 package.json
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    log('✅ package.json 存在', 'green');
    
    // 检查构建脚本
    const buildScripts = [
      'build',
      'build:prod',
      'build:ci'
    ];
    
    buildScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`✅ 构建脚本存在: ${script}`, 'green');
      } else {
        log(`❌ 构建脚本缺失: ${script}`, 'red');
      }
    });
  }
  
  // 检查 Next.js 配置
  if (fs.existsSync('next.config.js')) {
    log('✅ next.config.js 存在', 'green');
  } else {
    log('❌ next.config.js 不存在', 'red');
  }
  
  // 检查 TypeScript 配置
  if (fs.existsSync('tsconfig.json')) {
    log('✅ tsconfig.json 存在', 'green');
  } else {
    log('❌ tsconfig.json 不存在', 'red');
  }
}

// 主函数
function main() {
  log('🚀 环境配置验证工具', 'cyan');
  
  const env = process.argv[2] || 'production';
  
  // 验证指定环境
  const isValid = validateEnvironment(env);
  
  // 比较不同环境
  compareEnvironments();
  
  // 验证构建配置
  validateBuildConfig();
  
  // 总结
  log('\n📝 验证总结:', 'cyan');
  if (isValid) {
    log(`✅ ${env} 环境配置验证通过`, 'green');
  } else {
    log(`❌ ${env} 环境配置验证失败`, 'red');
    process.exit(1);
  }
  
  log('\n🎯 建议:', 'yellow');
  log('1. 在构建前运行此脚本验证环境配置');
  log('2. 确保所有环境的 API URL 配置正确');
  log('3. 定期检查环境配置文件的一致性');
  log(`4. 使用 npm run build:prod 进行生产环境构建`);
}

if (require.main === module) {
  main();
}

module.exports = { validateEnvironment, compareEnvironments, validateBuildConfig };
