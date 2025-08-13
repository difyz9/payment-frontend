/**
 * 路径工具函数
 * 处理生产环境和开发环境的路径差异
 */

// 获取基础路径
export function getBasePath(): string {
  // 在构建时，这个值会被环境变量替换
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

// 获取完整的 URL 路径
export function getFullPath(path: string): string {
  const basePath = getBasePath();
  
  // 如果 path 已经包含 basePath，直接返回
  if (basePath && path.startsWith(basePath)) {
    return path;
  }
  
  // 处理根路径
  if (path === '/') {
    return basePath || '/';
  }
  
  // 拼接 basePath 和 path
  const fullPath = basePath + path;
  
  // 确保路径格式正确
  return fullPath.replace(/\/+/g, '/');
}

// 路由导航函数
export function navigateTo(router: { push: (path: string) => void }, path: string) {
  const fullPath = getFullPath(path);
  
  // 在生产环境中，如果使用了 basePath，需要使用 window.location
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && getBasePath()) {
    // 使用原生导航确保路径正确
    window.location.href = fullPath;
  } else {
    // 开发环境使用 Next.js 路由
    router.push(path);
  }
}

// 检查当前是否在正确的基础路径下
export function isOnCorrectBasePath(): boolean {
  if (typeof window === 'undefined') return true;
  
  const basePath = getBasePath();
  if (!basePath) return true;
  
  return window.location.pathname.startsWith(basePath);
}

// 重定向到正确的基础路径
export function redirectToCorrectBasePath() {
  if (typeof window === 'undefined') return;
  
  const basePath = getBasePath();
  if (!basePath) return;
  
  if (!isOnCorrectBasePath()) {
    const currentPath = window.location.pathname;
    const newPath = basePath + currentPath;
    window.location.href = newPath;
  }
}
