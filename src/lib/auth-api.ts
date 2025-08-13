import { http } from './http';
import { User, LoginCredentials, RegisterData } from './auth';

// 后端登录响应格式
interface LoginResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_at: string;
}

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await http.post<LoginResponse>('/api/v1/auth/login', credentials);
    // 返回前端期望的格式
    return {
      user: response.user,
      token: response.token
    };
  },

  async register(data: RegisterData): Promise<void> {
    await http.post('/api/v1/auth/register', data);
  },

  async logout(): Promise<void> {
    await http.post('/api/v1/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await http.get<User>('/api/v1/auth/me');
    return response;
  }
};
