/** @type {import('next').NextConfig} */
const nextConfig = {
  // Node.js 服务器部署 (支持 SSR/ISR)
  output: 'standalone',
  distDir: '.next',
  
  // 生产环境配置
  ...(process.env.NODE_ENV === 'production' && {
    // 根目录部署，无需基础路径
    // basePath: '',
    // assetPrefix: '',
    // 禁用尾随斜杠
    trailingSlash: false,
    // 禁用 Source Map (大幅减少文件大小)
    productionBrowserSourceMaps: false,
  }),
  
  // 构建优化配置
  compiler: {
    // 生产环境移除 console (暂时禁用以便调试认证问题)
    // removeConsole: false, // process.env.NODE_ENV === 'production',
        removeConsole:  process.env.NODE_ENV === 'production',

  },
  
  // Webpack 优化配置
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev) {
      // 禁用 Source Map
      config.devtool = false;
      
      // 优化分包
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // 图片优化配置 (Node.js 服务器支持)
  images: {
    // 启用图片优化
    unoptimized: false,
    // 支持的图片格式
    formats: ['image/webp', 'image/avif'],
    // 图片大小
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
