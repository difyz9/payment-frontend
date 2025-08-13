'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthProvider';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { formatUserRole } from '@/lib/auth';
import { toast } from 'sonner';

function ProfilePageContent() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 调用更新用户信息API
      const response = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data);
        setIsEditing(false);
        toast.success('个人信息更新成功');
      } else {
        setError(data.message || '更新失败');
      }
    } catch (error) {
      console.error('更新用户信息错误:', error);
      setError('更新请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setError('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部横幅 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                个人资料
              </h1>
              <p className="text-gray-600 mt-2 text-lg">管理您的账户信息和偏好设置</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">在线</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* 用户头像和基本信息 */}
          <div className="xl:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20"></div>
                  <Avatar className="h-32 w-32 mx-auto relative border-4 border-white shadow-2xl">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-900">{user.username}</h3>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300" 
                  disabled
                >
                  更换头像
                </Button>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
                    <Shield className="h-5 w-5 mr-3 text-blue-500" />
                    <span className="text-gray-600">角色：</span>
                    <span className="ml-2 font-semibold text-gray-900 bg-blue-100 px-2 py-1 rounded-full text-xs">
                      {formatUserRole(user.role)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm bg-gray-50 rounded-lg p-3">
                    <Calendar className="h-5 w-5 mr-3 text-purple-500" />
                    <span className="text-gray-600">注册时间：</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 个人信息编辑 */}
          <div className="xl:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900">个人信息</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">编辑您的个人信息</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      编辑信息
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-gray-700 font-medium">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        disabled={!isEditing}
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-300"
                        placeholder="请输入用户名"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-gray-700 font-medium">邮箱地址</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-300"
                        placeholder="请输入邮箱地址"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">手机号</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-300"
                        placeholder="请输入手机号"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4 pt-6 border-t border-gray-100">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            保存中...
                          </>
                        ) : (
                          '保存更改'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        className="flex-1 h-12 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                      >
                        取消
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 账户安全 */}
          <div className="xl:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-500" />
                  账户安全
                </CardTitle>
                <CardDescription className="text-gray-600">管理您的密码和安全设置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">密码</h4>
                        <p className="text-xs text-gray-500">上次更改时间：未知</p>
                      </div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-orange-200 hover:bg-orange-50 text-orange-700 transition-all duration-300" 
                      disabled
                    >
                      修改密码
                    </Button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">两步验证</h4>
                        <p className="text-xs text-gray-500">增强账户安全性</p>
                      </div>
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-blue-200 hover:bg-blue-50 text-blue-700 transition-all duration-300" 
                      disabled
                    >
                      设置
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  );
}
