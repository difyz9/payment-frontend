#!/usr/bin/env node

/**
 * Vercel 配置验证脚本
 * 验证 vercel.json 文件的有效性和最佳实践
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

function validateVercelConfig() {
  log('🔍 验证 Vercel 配置文件', 'cyan');
  
  const vercelConfigPath = 'vercel.json';
  
  // 检查文件是否存在
  if (!fs.existsSync(vercelConfigPath)) {
    log('❌ vercel.json 文件不存在', 'red');
    return false;
  }
  
  try {
    // 读取并解析 JSON
    const configContent = fs.readFileSync(vercelConfigPath, 'utf8');
    
    if (!configContent.trim()) {
      log('❌ vercel.json 文件为空', 'red');
      return false;
    }
    
    const config = JSON.parse(configContent);
    log('✅ JSON 格式正确', 'green');
    
    // 验证必需字段
    const requiredFields = ['framework'];
    const recommendedFields = ['buildCommand', 'rewrites', 'headers'];
    
    requiredFields.forEach(field => {
      if (config[field]) {
        log(`✅ ${field}: ${config[field]}`, 'green');
      } else {
        log(`❌ 缺少必需字段: ${field}`, 'red');
      }
    });
    
    recommendedFields.forEach(field => {
      if (config[field]) {
        log(`✅ ${field}: 已配置`, 'green');
      } else {
        log(`⚠️  建议配置: ${field}`, 'yellow');
      }
    });
    
    // 验证框架配置
    if (config.framework !== 'nextjs') {
      log(`⚠️  框架配置: ${config.framework} (推荐: nextjs)`, 'yellow');
    }
    
    // 验证构建命令
    if (config.buildCommand && config.buildCommand !== 'npm run build') {
      log(`⚠️  构建命令: ${config.buildCommand} (标准: npm run build)`, 'yellow');
    }
    
    // 验证 API 重写规则
    if (config.rewrites && Array.isArray(config.rewrites)) {
      log(`✅ API 重写规则: ${config.rewrites.length} 条`, 'green');
      config.rewrites.forEach((rule, index) => {
        if (rule.source && rule.destination) {
          log(`   ${index + 1}. ${rule.source} -> ${rule.destination}`, 'blue');
        }
      });
    }
    
    // 验证安全头
    if (config.headers && Array.isArray(config.headers)) {
      log(`✅ 安全头配置: ${config.headers.length} 组`, 'green');
      config.headers.forEach((headerGroup, index) => {
        if (headerGroup.headers && Array.isArray(headerGroup.headers)) {
          log(`   第 ${index + 1} 组: ${headerGroup.headers.length} 个安全头`, 'blue');
        }
      });
    }
    
    // 检查过时或不推荐的配置
    const deprecatedFields = ['outputDirectory', 'functions'];
    deprecatedFields.forEach(field => {
      if (config[field]) {
        log(`⚠️  不推荐使用的字段: ${field}`, 'yellow');
      }
    });
    
    return true;
    
  } catch (error) {
    log(`❌ JSON 解析错误: ${error.message}`, 'red');
    return false;
  }
}

function validatePackageJson() {
  log('\n📦 验证 package.json 兼容性', 'cyan');
  
  if (!fs.existsSync('package.json')) {
    log('❌ package.json 文件不存在', 'red');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // 检查 engines 字段
    if (packageJson.engines) {
      if (packageJson.engines.node) {
        log(`✅ Node.js 版本要求: ${packageJson.engines.node}`, 'green');
      }
      if (packageJson.engines.npm) {
        log(`✅ npm 版本要求: ${packageJson.engines.npm}`, 'green');
      }
    } else {
      log('⚠️  建议添加 engines 字段指定 Node.js 版本', 'yellow');
    }
    
    // 检查构建脚本
    const buildScripts = ['build', 'build:vercel', 'start'];
    buildScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`✅ 构建脚本存在: ${script}`, 'green');
      } else {
        log(`⚠️  构建脚本缺失: ${script}`, 'yellow');
      }
    });
    
    return true;
    
  } catch (error) {
    log(`❌ package.json 解析错误: ${error.message}`, 'red');
    return false;
  }
}

function validateNvmrc() {
  log('\n🔧 验证 .nvmrc 文件', 'cyan');
  
  if (fs.existsSync('.nvmrc')) {
    const nodeVersion = fs.readFileSync('.nvmrc', 'utf8').trim();
    log(`✅ .nvmrc 文件存在: Node.js ${nodeVersion}`, 'green');
    return true;
  } else {
    log('⚠️  .nvmrc 文件不存在，建议添加以指定 Node.js 版本', 'yellow');
    return false;
  }
}

function main() {
  log('🚀 Vercel 配置验证工具\n', 'cyan');
  
  const results = [
    validateVercelConfig(),
    validatePackageJson(),
    validateNvmrc()
  ];
  
  const allPassed = results.every(result => result);
  
  log('\n📝 验证总结:', 'cyan');
  if (allPassed) {
    log('✅ 所有验证通过，配置符合最佳实践', 'green');
  } else {
    log('⚠️  部分验证未通过，建议优化配置', 'yellow');
  }
  
  log('\n💡 建议:', 'blue');
  log('1. 确保 vercel.json 格式正确且包含必要配置');
  log('2. 在 package.json 中指定 Node.js 版本要求');
  log('3. 使用 .nvmrc 文件统一开发环境');
  log('4. 配置安全头和 API 代理规则');
  log('5. 在 Vercel 控制台配置环境变量');
}

if (require.main === module) {
  main();
}

module.exports = { validateVercelConfig, validatePackageJson, validateNvmrc };
