// 认证相关的工具函数
import { http } from './http';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  status: number;
  role: string;
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at?: string;
  created_at: string;
  gender: number;
  // 可选的扩展字段（可能在其他API中返回）
  nickname?: string;
  avatar?: string;
  province?: string;
  city?: string;
  description?: string;
}

export interface AuthTokens {
  token: string;        // 后端返回的是 token 而不是 accessToken
  refresh_token?: string;
  expires_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_at: string;
}

// 本地存储相关
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
} as const;

// 获取存储的 token
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
}

// 设置 token
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
}

// 获取存储的用户信息
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// 设置用户信息
export function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
}

// 清除认证信息
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证手机号格式（中国大陆）
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 验证密码强度
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('密码至少需要6个字符');
  }
  
  if (password.length > 20) {
    errors.push('密码不能超过20个字符');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('密码需要包含字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码需要包含数字');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 格式化用户显示名称
export function getUserDisplayName(user: User): string {
  return user.username || user.email.split('@')[0];
}

// 格式化用户角色
export function formatUserRole(role: string): string {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    user: '普通用户',
    vip: 'VIP用户',
    operator: '操作员',
  };
  
  return roleMap[role] || role;
}

// 认证相关的 API 调用
export const authAPI = {
  // 登录
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return http.post('/api/auth/login', credentials);
  },

  // 注册
  async register(data: RegisterData): Promise<{ message: string }> {
    return http.post('/api/auth/register', data);
  },

  // 忘记密码
  async forgotPassword(email: string): Promise<{ message: string }> {
    return http.post('/api/auth/forgot-password', { email });
  },

  // 重置密码
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return http.post('/api/auth/reset-password', { token, password });
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    return http.get('/api/auth/me');
  },

  // 更新用户信息
  async updateProfile(data: Partial<User>): Promise<User> {
    return http.put('/api/auth/profile', data);
  },

  // 修改密码
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return http.post('/api/auth/change-password', { 
      old_password: oldPassword, 
      new_password: newPassword 
    });
  },

  // 登出
  async logout(): Promise<void> {
    try {
      await http.post('/api/auth/logout');
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      clearAuthData();
    }
  },

  // 刷新 token
  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('没有刷新令牌');
    }
    
    return http.post('/api/auth/refresh', { refresh_token: refreshToken });
  },
};
