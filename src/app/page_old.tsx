'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreditCard, Settings, Plus, BarChart3, User, LogIn, TestTube, Info } from 'lucide-react';
import { appApi, ApiApp } from '@/lib/api';
import { getUserDisplayName } from '@/lib/auth';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<ApiApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApps: 0,
    activeApps: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      // 已登录用户重定向到支付仪表板
      router.replace('/pay');
      return;
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const result = await appApi.getApps(1, 10);
      const appList = result.list || [];
      setApps(appList);
      setStats({
        totalApps: result.total || 0,
        activeApps: appList.filter(app => app.status === 1).length,
        totalOrders: 0, // TODO: 实现订单统计
      });
    } catch (error) {
      console.error('Failed to fetch apps:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 已登录用户会被重定向到支付仪表板，所以这里只显示未登录状态
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在跳转到支付仪表板...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          {isAuthenticated && user ? (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mr-4">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    欢迎回来，{getUserDisplayName(user)}！
                  </h1>
                  <p className="text-blue-100 mt-1">
                    今天是 {new Date().toLocaleDateString('zh-CN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-center">
                <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  支付服务管理平台
                </h1>
                <p className="text-gray-600 mb-6">
                  专业的支付API管理和测试平台，支持支付宝、微信等多种支付方式
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/auth/login">
                    <Button size="lg">
                      <LogIn className="h-4 w-4 mr-2" />
                      立即登录
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline" size="lg">
                      开始使用
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guest Information */}
        {!isAuthenticated && (
          <div className="mb-8">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                体验功能无需登录：您可以直接使用{' '}
                <Link href="/payment-test" className="text-blue-600 hover:underline font-medium">
                  支付测试
                </Link>
                {' '}功能来测试支付接口。更多功能需要{' '}
                <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                  注册账户
                </Link>
                {' '}后使用。
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Statistics Cards - Only for authenticated users */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总应用数</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApps}</div>
                <p className="text-xs text-muted-foreground">
                  活跃应用: {stats.activeApps}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">支付订单</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  今日新增订单
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API调用</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  今日API调用次数
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content for authenticated users */}
          {isAuthenticated ? (
            <>
              {/* Recent Apps */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>最近应用</CardTitle>
                      <CardDescription>
                        最近创建的API应用
                      </CardDescription>
                    </div>
                    <Link href="/apps">
                      <Button size="sm">查看全部</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">加载中...</div>
                  ) : apps.length > 0 ? (
                    <div className="space-y-4">
                      {apps.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{app.appName}</h4>
                            <p className="text-sm text-gray-500">{app.appId}</p>
                          </div>
                          <Badge variant={app.status === 1 ? "default" : "secondary"}>
                            {app.status === 1 ? "启用" : "禁用"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">暂无应用</p>
                      <Link href="/apps/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          创建应用
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions for authenticated users */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                  <CardDescription>
                    常用功能快速入口
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/apps/new">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      创建新应用
                    </Button>
                  </Link>
                  <Link href="/apps">
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      管理应用
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      查看订单
                    </Button>
                  </Link>
                  <Link href="/payment-test">
                    <Button className="w-full justify-start" variant="outline">
                      <TestTube className="h-4 w-4 mr-2" />
                      支付测试
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Features for guests */}
              <Card>
                <CardHeader>
                  <CardTitle>主要功能</CardTitle>
                  <CardDescription>
                    了解我们提供的核心服务
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">多支付渠道</h4>
                      <p className="text-sm text-gray-600">支持支付宝、微信支付等主流支付方式</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TestTube className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">接口测试</h4>
                      <p className="text-sm text-gray-600">在线测试支付接口，无需复杂配置</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">数据分析</h4>
                      <p className="text-sm text-gray-600">详细的交易数据和统计报表</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Settings className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">灵活配置</h4>
                      <p className="text-sm text-gray-600">简单易用的API配置和管理界面</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Try Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>立即体验</CardTitle>
                  <CardDescription>
                    无需注册，直接体验支付测试功能
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <TestTube className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">支付接口测试</h3>
                    <p className="text-gray-600 mb-4">
                      在线测试支付宝、微信支付接口，查看请求和响应数据
                    </p>
                    <Link href="/payment-test">
                      <Button size="lg" className="w-full">
                        <TestTube className="h-4 w-4 mr-2" />
                        开始测试
                      </Button>
                    </Link>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    想要更多功能？
                    <Link href="/auth/register" className="text-blue-600 hover:underline ml-1">
                      注册账户
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
