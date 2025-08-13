'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';

function PaymentDashboardContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            支付管理系统
          </h1>
          <p className="text-gray-600">
            欢迎回来，{user?.username || user?.email}！管理您的支付应用和订单。
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总收入</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% 相比上月
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">订单数量</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% 相比上月
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-xs text-muted-foreground">
                +2% 相比上月
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 自上周
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>应用管理</CardTitle>
              <CardDescription>管理您的支付应用配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => window.location.href = '/apps'}>
                查看应用列表
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/apps/new'}>
                创建新应用
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>订单管理</CardTitle>
              <CardDescription>查看和管理支付订单</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => window.location.href = '/orders'}>
                查看订单列表
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/payment-test'}>
                支付测试
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 最近活动 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>最新的支付活动和系统事件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">支付成功</p>
                  <p className="text-xs text-gray-500">订单 #12345 - ¥299.00</p>
                </div>
                <div className="text-xs text-gray-500">2分钟前</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">新用户注册</p>
                  <p className="text-xs text-gray-500">用户 user@example.com 注册成功</p>
                </div>
                <div className="text-xs text-gray-500">5分钟前</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">应用配置更新</p>
                  <p className="text-xs text-gray-500">应用 &quot;测试应用&quot; 配置已更新</p>
                </div>
                <div className="text-xs text-gray-500">10分钟前</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentDashboard() {
  return (
    <AuthGuard>
      <PaymentDashboardContent />
    </AuthGuard>
  );
}
