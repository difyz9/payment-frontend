'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Copy, Key, Eye, EyeOff } from 'lucide-react';
import { appApi, ApiApp } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AppDetailPage() {
  const params = useParams();
  const appId = params.appId as string;

  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [app, setApp] = useState<ApiApp | null>(null);

  useEffect(() => {
    if (appId) {
      fetchApp();
    }
  }, [appId]);

  const fetchApp = async () => {
    try {
      setLoading(true);
      const result = await appApi.getApp(appId);
      setApp(result);
    } catch (error) {
      console.error('Failed to fetch app:', error);
      toast.error('获取应用信息失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="text-gray-500">加载中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="text-gray-500">应用不存在</div>
            <Link href="/apps">
              <Button className="mt-4">返回应用列表</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/apps">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回应用列表
                </Button>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{app.appName}</h1>
                  <Badge variant={app.status === 1 ? "default" : "secondary"} className="text-xs">
                    {app.status === 1 ? "运行中" : "已停用"}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mt-1">应用ID: {app.appId}</p>
              </div>
            </div>
            <Link href={`/apps/${app.appId}/edit`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                编辑应用
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">应用概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">应用ID</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-white px-2 py-1 rounded border font-mono">{app.appId}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(app.appId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">应用名称</span>
                      <span className="text-sm font-medium text-gray-900">{app.appName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">运行状态</span>
                      <Badge variant={app.status === 1 ? "default" : "secondary"}>
                        {app.status === 1 ? "运行中" : "已停用"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">创建时间</span>
                      <span className="text-sm text-gray-900">
                        {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">更新时间</span>
                      <span className="text-sm text-gray-900">
                        {new Date(app.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">速率限制</span>
                      <span className="text-sm font-medium text-gray-900">{app.rateLimit} 次/分钟</span>
                    </div>
                  </div>
                </div>
                
                {app.description && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">应用描述</h4>
                    <p className="text-sm text-blue-800">{app.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">API配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">回调地址</span>
                  </div>
                  {app.callbackUrl ? (
                    <code className="text-xs bg-gray-100 px-3 py-2 rounded block break-all font-mono">{app.callbackUrl}</code>
                  ) : (
                    <div className="text-sm text-gray-400 py-2">未设置回调地址</div>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">IP白名单</span>
                  </div>
                  {app.ipWhitelist ? (
                    <code className="text-xs bg-gray-100 px-3 py-2 rounded block font-mono">{app.ipWhitelist}</code>
                  ) : (
                    <div className="text-sm text-gray-400 py-2">允许所有IP访问</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Security & Actions */}
          <div className="space-y-6">
            {/* Security Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">安全设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-amber-800">应用密钥</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-amber-700 hover:text-amber-900"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      {app.appSecret && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-amber-700 hover:text-amber-900"
                          onClick={() => copyToClipboard(app.appSecret || '')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <code className={`text-xs bg-white px-2 py-1 rounded block font-mono ${showSecret ? '' : 'blur-sm'}`}>
                    {app.appSecret || '••••••••••••••••••••••••••••••••'}
                  </code>
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">签名验证</span>
                    <Badge variant={app.requireSign ? "default" : "secondary"} className="text-xs">
                      {app.requireSign ? "已启用" : "测试模式"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {app.requireSign ? "所有API请求需要签名验证" : "开发测试模式，无需签名"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/payment-test" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    API测试工具
                  </Button>
                </Link>
                
                <Link href={`/apps/${app.appId}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    编辑应用设置
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* API Usage Guide */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">接入指南</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs space-y-2">
                    <p className="font-medium text-gray-700">请求头参数：</p>
                    <div className="bg-gray-50 p-3 rounded border space-y-1">
                      <div><code>X-App-Id: {app.appId}</code></div>
                      <div><code>X-Timestamp: {Math.floor(Date.now() / 1000)}</code></div>
                      <div><code>X-Nonce: random_string</code></div>
                      {app.requireSign && (
                        <div><code>X-Sign: hmac_sha256_signature</code></div>
                      )}
                    </div>
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
