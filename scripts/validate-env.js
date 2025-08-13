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
  
  if (!fs.existsSync(envFile)) {
    log(`❌ 环境配置文件不存在: ${envFile}`, 'red');
    return false;
  }
  
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
  
  log(`✅ 环境配置文件存在: ${envFile}`, 'green');
  
  // 验证必需的环境变量
  const requiredVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_BASE_PATH'
  ];
  
  const missingVars = [];
  const configuredVars = [];
  
  requiredVars.forEach(varName => {
    if (envVars[varName]) {
      configuredVars.push({ name: varName, value: envVars[varName] });
      log(`✅ ${varName}: ${envVars[varName]}`, 'green');
    } else {
      missingVars.push(varName);
      log(`❌ ${varName}: 未配置`, 'red');
    }
  });
  
  // 显示其他配置
  log('\n📋 其他配置:', 'blue');
  Object.entries(envVars).forEach(([key, value]) => {
    if (!requiredVars.includes(key)) {
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
  
  return missingVars.length === 0;
}

// 比较不同环境的配置
function compareEnvironments() {
  log('\n🔄 比较不同环境配置', 'cyan');
  
  const environments = ['development', 'staging', 'production'];
  const envConfigs = {};
  
  environments.forEach(env => {
    const envFile = `.env.${env}`;
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const vars = {};
      
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          vars[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      envConfigs[env] = vars;
      log(`✅ ${env}: 配置文件存在`, 'green');
    } else {
      log(`❌ ${env}: 配置文件不存在`, 'red');
    }
  });
  
  // 显示API URL对比
  log('\n📊 API URL 对比:', 'blue');
  environments.forEach(env => {
    if (envConfigs[env] && envConfigs[env].NEXT_PUBLIC_API_BASE_URL) {
      log(`   ${env}: ${envConfigs[env].NEXT_PUBLIC_API_BASE_URL}`, 'blue');
    }
  });
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
