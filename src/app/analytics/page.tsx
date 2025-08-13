'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard,
  DollarSign,
  Activity,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  successRate: number;
  monthlyGrowth: number;
  dailyActiveUsers: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 1248,
    totalOrders: 3542,
    totalRevenue: 256780,
    successRate: 98.5,
    monthlyGrowth: 12.3,
    dailyActiveUsers: 324
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const statsCards = [
    {
      title: '总用户数',
      value: data.totalUsers.toLocaleString(),
      description: '注册用户总数',
      icon: Users,
      change: '+12.5%',
      changeType: 'positive' as const
    },
    {
      title: '总订单数',
      value: data.totalOrders.toLocaleString(),
      description: '累计处理订单',
      icon: CreditCard,
      change: '+8.2%',
      changeType: 'positive' as const
    },
    {
      title: '总收入',
      value: formatCurrency(data.totalRevenue),
      description: '累计交易金额',
      icon: DollarSign,
      change: '+15.3%',
      changeType: 'positive' as const
    },
    {
      title: '成功率',
      value: `${data.successRate}%`,
      description: '支付成功率',
      icon: TrendingUp,
      change: '+0.5%',
      changeType: 'positive' as const
    },
    {
      title: '月增长率',
      value: `${data.monthlyGrowth}%`,
      description: '环比上月增长',
      icon: BarChart3,
      change: '+2.1%',
      changeType: 'positive' as const
    },
    {
      title: '日活用户',
      value: data.dailyActiveUsers.toLocaleString(),
      description: '今日活跃用户',
      icon: Activity,
      change: '+5.7%',
      changeType: 'positive' as const
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">数据统计</h1>
            <p className="text-muted-foreground">
              查看系统运营数据和业务指标
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据统计</h1>
          <p className="text-muted-foreground">
            查看系统运营数据和业务指标
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            选择时间
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                <Badge 
                  variant={card.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {card.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>支付方式分布</CardTitle>
            <CardDescription>各支付方式使用情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">支付宝</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-16 h-2 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">微信支付</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-12 h-2 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-sm text-muted-foreground">35%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>近期趋势</CardTitle>
            <CardDescription>最近30天数据变化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                📊 图表功能开发中...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系统状态</CardTitle>
          <CardDescription>服务运行状态监控</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">API 服务</span>
              <Badge variant="default" className="ml-auto">正常</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">数据库</span>
              <Badge variant="default" className="ml-auto">正常</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">支付网关</span>
              <Badge variant="default" className="ml-auto">正常</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm">缓存服务</span>
              <Badge variant="secondary" className="ml-auto">监控中</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
