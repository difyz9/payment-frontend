#!/bin/bash

# 解决 Next.js 构建 Bus error 问题的脚本

echo "🔧 检测和解决 Next.js 构建问题..."

# 检查系统资源
echo "📋 系统资源检查:"
echo "内存使用情况:"
free -h 2>/dev/null || echo "无法检查内存（非 Linux 系统）"

echo ""
echo "磁盘空间:"
df -h . 2>/dev/null || echo "无法检查磁盘空间"

echo ""
echo "Node.js 版本:"
node --version

echo ""
echo "npm 版本:"
npm --version

echo ""
echo "🛠️ 尝试解决方案..."

# 解决方案1: 清理缓存和重新安装依赖
echo "1. 清理 npm 缓存和 node_modules..."
rm -rf node_modules package-lock.json .next
npm cache clean --force

echo "2. 重新安装依赖..."
npm install

# 解决方案2: 使用内存限制构建
echo "3. 创建内存限制构建脚本..."
cat > scripts/build-with-memory-limit.sh << 'EOF'
#!/bin/bash

# 设置 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=2048"

echo "🚀 使用内存限制构建 (2GB)..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败，尝试更低内存限制..."
    export NODE_OPTIONS="--max-old-space-size=1024"
    echo "🚀 使用更低内存限制构建 (1GB)..."
    npm run build
fi
EOF

chmod +x scripts/build-with-memory-limit.sh

# 解决方案3: 使用增量构建
echo "4. 创建增量构建配置..."
if [ ! -f "next.config.backup.ts" ]; then
    cp next.config.ts next.config.backup.ts
fi

cat > next.config.memory-optimized.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用 SWC 编译器（更快，内存使用更少）
  swcMinify: true,
  
  // 启用增量静态生成
  experimental: {
    // 启用包导入优化（减少内存使用）
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    
    // 启用增量缓存
    incrementalCacheHandlerPath: undefined,
  },
  
  // 代码分割优化
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 生产环境优化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // 在 Vercel 环境下的特殊配置
  ...(process.env.VERCEL === '1' ? {} : {
    // 本地构建时的静态导出配置
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true }
  })
};

export default nextConfig;
EOF

echo "5. 更新 package.json 脚本..."
# 使用 Node.js 脚本来安全地更新 package.json
node << 'EOF'
const fs = require('fs');
const path = require('path');

const packagePath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// 添加内存限制的构建脚本
pkg.scripts = {
  ...pkg.scripts,
  "build:memory": "NODE_OPTIONS='--max-old-space-size=2048' next build",
  "build:low-memory": "NODE_OPTIONS='--max-old-space-size=1024' next build",
  "build:safe": "bash scripts/build-with-memory-limit.sh",
  "build:optimized": "cp next.config.memory-optimized.ts next.config.ts && npm run build:memory && cp next.config.backup.ts next.config.ts"
};

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
console.log('✅ package.json 已更新');
EOF

echo ""
echo "🎯 解决方案总结:"
echo "1. npm run build:safe        - 使用内存限制构建"
echo "2. npm run build:memory      - 直接使用 2GB 内存限制"
echo "3. npm run build:low-memory  - 使用 1GB 内存限制"
echo "4. npm run build:optimized   - 使用优化配置构建"
echo ""
echo "5. 如果还是失败，可以尝试："
echo "   - 重启服务器释放内存"
echo "   - 关闭其他占用内存的进程"
echo "   - 增加系统 swap 空间"
echo ""
echo "6. 对于生产部署，推荐使用 Vercel 云构建"
echo "   Vercel 有足够的资源处理构建过程"
