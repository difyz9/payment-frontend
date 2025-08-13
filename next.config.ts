import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 根据环境决定输出模式
  output: process.env.NODE_ENV === 'production' && process.env.VERCEL ? undefined : 'export',
  distDir: process.env.VERCEL ? '.next' : 'dist',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  assetPrefix: '',
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8089'
  },
  // Vercel 特定配置
  ...(process.env.VERCEL && {
    experimental: {
      optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
    }
  })
};

export default nextConfig;
