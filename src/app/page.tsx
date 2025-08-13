'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreditCard, Settings, LogIn, TestTube, Info, BarChart3 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // 已登录用户重定向到支付仪表板
      router.replace('/pay');
    }
  }, [isAuthenticated, router]);

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
        </div>

        {/* Guest Information */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        </div>
      </main>
    </div>
  );
}
