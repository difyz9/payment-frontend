'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Calendar } from 'lucide-react';
import { orderStatusMap, payWayMap, orderApi, PaymentOrder, OrderQueryParams } from '@/lib/api';
import { toast } from 'sonner';

interface OrderStats {
  totalCount: number;
  paidCount: number;
  unpaidCount: number;
  totalAmount: number;
  paidAmount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<OrderStats>({
    totalCount: 0,
    paidCount: 0,
    unpaidCount: 0,
    totalAmount: 0,
    paidAmount: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  
  // 搜索和过滤条件
  const [filters, setFilters] = useState<OrderQueryParams>({
    page: 1,
    pageSize: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [payWayFilter, setPayWayFilter] = useState<string>('');

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderApi.getOrders(filters);
      setOrders(result.list || []);
      setPagination({
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await orderApi.getOrderStats({
        appId: filters.appId,
        startTime: filters.startTime,
        endTime: filters.endTime,
      });
      setStats(result);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = () => {
    const newFilters: OrderQueryParams = {
      ...filters,
      page: 1,
      orderNo: searchTerm.includes('_') ? searchTerm : undefined,
      subject: !searchTerm.includes('_') && searchTerm ? searchTerm : undefined,
      status: statusFilter,
      payWay: payWayFilter || undefined,
    };
    setFilters(newFilters);
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter(undefined);
    setPayWayFilter('');
    setFilters({ page: 1, pageSize: 20 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return '-';
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">订单管理</h1>
            <p className="text-gray-600 mt-2">查看和管理所有支付订单</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCount}</div>
            <div className="text-sm text-gray-500">总订单数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.paidCount}</div>
            <div className="text-sm text-gray-500">成功支付</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.unpaidCount}</div>
            <div className="text-sm text-gray-500">待支付</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">¥{stats.paidAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-500">总收入</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalCount > 0 ? ((stats.paidCount / stats.totalCount) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-500">支付成功率</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>支付订单列表</CardTitle>
          <CardDescription>
            查看和管理所有支付订单
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索订单号、商品名称或应用ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有状态</option>
                <option value="1">未支付</option>
                <option value="2">已扫码</option>
                <option value="201">支付成功</option>
              </select>
              
              <select
                value={payWayFilter}
                onChange={(e) => setPayWayFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有支付方式</option>
                <option value="alipay">支付宝</option>
                <option value="wechat">微信支付</option>
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset}>
                重置
              </Button>
            </div>
          </div>

          {/* Orders Table */}
          {orders.length > 0 ? (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单信息</TableHead>
                    <TableHead>商品名称</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>支付时间</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-mono text-sm">{order.orderNo}</div>
                        <div className="text-xs text-gray-500">{order.appId}</div>
                        {order.tradeNo && (
                          <div className="text-xs text-gray-400">交易号: {order.tradeNo}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.subject}</div>
                        <div className="text-xs text-gray-500">{order.orderType}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(order.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={payWayMap[order.payWay as keyof typeof payWayMap]?.color}
                        >
                          {payWayMap[order.payWay as keyof typeof payWayMap]?.label || order.payWay}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={orderStatusMap[order.status as keyof typeof orderStatusMap]?.color}
                        >
                          {orderStatusMap[order.status as keyof typeof orderStatusMap]?.label || '未知'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(order.payTime)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {pagination.total > pagination.pageSize && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    共 {pagination.total} 条记录，第 {pagination.page} 页
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1 || loading}
                    >
                      上一页
                    </Button>
                    <span className="text-sm">
                      {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize) || loading}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {loading ? '加载中...' : '暂无订单数据'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
