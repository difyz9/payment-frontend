#!/usr/bin/env node

/**
 * 生产环境构建脚本
 * 包含环境检查、清理、构建和验证步骤
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出函数
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

function logStep(step) {
  log(`\n🚀 ${step}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 执行命令函数
function runCommand(command, description) {
  try {
    log(`执行: ${command}`, 'blue');
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} 完成`);
  } catch (error) {
    logError(`${description} 失败`);
    process.exit(1);
  }
}

// 检查文件是否存在
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} 存在: ${filePath}`);
    return true;
  } else {
    logWarning(`${description} 不存在: ${filePath}`);
    return false;
  }
}

// 计算目录大小
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  try {
    calculateSize(dirPath);
  } catch (error) {
    log(`计算目录大小时出错: ${error.message}`, 'yellow');
  }
  
  return totalSize;
}

// 主构建流程
async function buildProduction() {
  log('开始生产环境构建流程', 'cyan');
  
  // 1. 环境检查
  logStep('步骤 1: 环境检查');
  
  // 检查 Node.js 版本
  const nodeVersion = process.version;
  log(`Node.js 版本: ${nodeVersion}`, 'blue');
  
  // 检查环境配置文件
  checkFile('.env.production', '生产环境配置文件');
  checkFile('next.config.js', 'Next.js 配置文件');
  checkFile('tsconfig.json', 'TypeScript 配置文件');
  
  // 2. 清理旧文件
  logStep('步骤 2: 清理旧构建文件');
  if (fs.existsSync('.next')) {
    runCommand('rm -rf .next', '清理 .next 目录');
  }
  if (fs.existsSync('out')) {
    runCommand('rm -rf out', '清理 out 目录');
  }
  
  // 3. 设置环境变量
  logStep('步骤 3: 设置环境变量');
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  log('环境变量设置:', 'blue');
  log(`NODE_ENV: ${process.env.NODE_ENV}`);
  log(`NEXT_TELEMETRY_DISABLED: ${process.env.NEXT_TELEMETRY_DISABLED}`);
  
  // 4. 安装依赖
  logStep('步骤 4: 检查依赖');
  if (!fs.existsSync('node_modules')) {
    runCommand('npm install --production=false', '安装项目依赖');
  } else {
    logSuccess('依赖已安装');
  }
  
  // 5. TypeScript 类型检查
  logStep('步骤 5: TypeScript 类型检查');
  runCommand('npx tsc --noEmit', 'TypeScript 类型检查');
  
  // 6. ESLint 检查
  logStep('步骤 6: 代码质量检查');
  try {
    runCommand('npm run lint', 'ESLint 检查');
  } catch (error) {
    logWarning('ESLint 检查有警告，继续构建');
  }
  
  // 7. 构建项目
  logStep('步骤 7: 构建生产版本');
  runCommand('npm run build', '构建 Next.js 项目');
  
  // 8. 验证构建结果
  logStep('步骤 8: 验证构建结果');
  
  // 检查Next.js构建输出（out目录用于静态导出）
  if (checkFile('out/index.html', '主页面文件')) {
    logSuccess('静态文件构建成功');
    
    // 检查构建统计
    const outputDir = 'out';
    log(`构建目录大小: ${(getDirectorySize(outputDir) / 1024 / 1024).toFixed(2)} MB`, 'blue');
    
    // 验证关键文件
    const criticalFiles = ['index.html', '_next'];
    criticalFiles.forEach(file => {
      const filePath = path.join(outputDir, file);
      if (fs.existsSync(filePath)) {
        logSuccess(`关键文件存在: ${file}`);
      } else {
        logWarning(`关键文件缺失: ${file}`);
      }
    });
  } else {
    logError('构建失败：未找到主页面文件');
    process.exit(1);
  }
  
  // 9. 构建完成
  logStep('构建完成');
  logSuccess('生产环境构建成功！');
  
  log('\n部署信息:', 'cyan');
  log('• 构建输出目录: out/');
  log('• 前端访问地址: https://www.coding520.top/');
  log('• API Base URL: https://www.coding520.top/payment');
  log('• 部署方式: 根目录部署（无子路径）');
  log('• 构建环境: production');
  
  log('\n后续步骤:', 'yellow');
  log('1. 将 out/ 目录内容部署到 Web 服务器根目录');
  log('2. 确保 nginx 配置将根路径指向构建输出目录');
  log('3. API 代理配置: /payment/ -> 后端服务');
  log('4. 验证 https://www.coding520.top/ 可以正常访问');
}

// 错误处理
process.on('uncaughtException', (error) => {
  logError(`未捕获的异常: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`未处理的 Promise 拒绝: ${reason}`);
  process.exit(1);
});

// 开始构建
if (require.main === module) {
  buildProduction().catch((error) => {
    logError(`构建失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { buildProduction };
