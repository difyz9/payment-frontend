'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Key, Copy, RefreshCw, Eye } from 'lucide-react';
import { appApi, ApiApp } from '@/lib/api';
import { toast } from 'sonner';

export default function AppsPage() {
  const [apps, setApps] = useState<ApiApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApiApp | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchApps();
  }, [pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApps = async () => {
    try {
      setLoading(true);
      const result = await appApi.getApps(pagination.page, pagination.pageSize);
      setApps(result.list || []);
      setPagination(prev => ({ ...prev, total: result.total || 0 }));
    } catch (error) {
      console.error('Failed to fetch apps:', error);
      toast.error('获取应用列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (app: ApiApp) => {
    try {
      await appApi.deleteApp(app.appId);
      toast.success('应用删除成功');
      setDeleteDialogOpen(false);
      setSelectedApp(null);
      fetchApps();
    } catch (error) {
      console.error('Failed to delete app:', error);
      toast.error('删除应用失败');
    }
  };

  const handleResetSecret = async (app: ApiApp) => {
    try {
      const result = await appApi.resetAppSecret(app.appId);
      toast.success('密钥重置成功');
      // 这里可以显示新的密钥
      console.log('New secret:', result.appSecret);
    } catch (error) {
      console.error('Failed to reset secret:', error);
      toast.error('重置密钥失败');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">应用管理</h1>
            <p className="text-gray-600 mt-2">管理您的支付服务API应用，查看和修改应用配置</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={fetchApps}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Link href="/apps/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                创建应用
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>API应用列表</CardTitle>
          <CardDescription>
            管理您的支付服务API应用，查看和修改应用配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : apps.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>应用名称</TableHead>
                  <TableHead>应用ID</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>速率限制</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.appName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{app.appId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(app.appId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={app.status === 1 ? "default" : "secondary"}>
                        {app.status === 1 ? "启用" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.rateLimit}/分钟</TableCell>
                    <TableCell>
                      {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/apps/${app.appId}`}>
                          <Button variant="ghost" size="sm" title="查看详情">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/apps/${app.appId}/edit`}>
                          <Button variant="ghost" size="sm" title="编辑">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="重置密钥"
                          onClick={() => handleResetSecret(app)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="删除"
                          onClick={() => {
                            setSelectedApp(app);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                共 {pagination.total} 个应用
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  上一页
                </Button>
                <span className="text-sm">
                  第 {pagination.page} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page * pagination.pageSize >= pagination.total}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除应用 &quot;{selectedApp?.appName}&quot; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApp && handleDelete(selectedApp)}
            >
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
