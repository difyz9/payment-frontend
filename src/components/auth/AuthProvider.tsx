'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LoginCredentials, 
  RegisterData,
  getStoredUser, 
  getStoredToken, 
  setStoredUser, 
  setStoredToken, 
  clearAuthData 
} from '@/lib/auth';
import { authAPI } from '@/lib/auth-api';
import { toast } from 'sonner';

interface AuthContextType {
  // 状态
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 方法
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化认证状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        const storedToken = getStoredToken();

        if (storedUser && storedToken) {
          setUser(storedUser);
          
          // 验证 token 是否仍然有效
          try {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
            setStoredUser(currentUser);
          } catch (error) {
            console.error('Token 验证失败:', error);
            // Token 无效，清除认证信息
            clearAuthData();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('认证初始化失败:', error);
        clearAuthData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('🔍 Login response:', response);
      
      const { user: userData, token } = response;
      console.log('👤 User data:', userData);
      console.log('🔑 Token:', token ? token.substring(0, 50) + '...' : 'null');
      
      // 保存认证信息
      setStoredToken(token);
      setStoredUser(userData);
      setUser(userData);
      
      // 验证保存是否成功
      console.log('💾 Stored token:', localStorage.getItem('auth_token')?.substring(0, 50) + '...');
      
      toast.success('登录成功');
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error instanceof Error ? error.message : '登录失败';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data);
      toast.success('注册成功，请登录');
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      clearAuthData();
      setUser(null);
      toast.success('已退出登录');
      router.push('/auth/login');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setStoredUser(updatedUser);
    }
  };

  const refreshUserData = async () => {
    try {
      if (user) {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
        setStoredUser(currentUser);
      }
    } catch (error) {
      console.error('刷新用户数据失败:', error);
      // 如果刷新失败，可能是 token 过期
      clearAuthData();
      setUser(null);
      router.push('/auth/login');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 认证守卫 Hook
export function useAuthGuard(redirectTo: string = '/auth/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

// 认证守卫组件
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback = <div>加载中...</div>,
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthGuard(redirectTo);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null; // 将在 useAuthGuard 中重定向
  }

  return <>{children}</>;
}

// 游客守卫（已登录用户不能访问的页面，如登录、注册页）
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // 已登录用户重定向到支付仪表板
      if (process.env.NODE_ENV === 'production') {
        // 生产环境直接跳转到 /pay/
        window.location.href = '/pay/';
      } else {
        // 开发环境使用路由跳转到 /pay
        router.push('/pay');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (isAuthenticated) {
    return null; // 将重定向到首页
  }

  return <>{children}</>;
}
