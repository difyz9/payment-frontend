'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Key, Eye, EyeOff } from 'lucide-react';
import { appApi, ApiApp } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditAppPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.appId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [app, setApp] = useState<ApiApp | null>(null);
  const [formData, setFormData] = useState({
    appName: '',
    description: '',
    callbackUrl: '',
    ipWhitelist: '',
    rateLimit: 1000,
    status: 1,
    requireSign: true
  });

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
      setFormData({
        appName: result.appName,
        description: result.description || '',
        callbackUrl: result.callbackUrl || '',
        ipWhitelist: result.ipWhitelist || '',
        rateLimit: result.rateLimit,
        status: result.status,
        requireSign: result.requireSign ?? true
      });
    } catch (error) {
      console.error('Failed to fetch app:', error);
      toast.error('获取应用信息失败');
      router.push('/apps');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.appName.trim()) {
      toast.error('请输入应用名称');
      return;
    }

    try {
      setSaving(true);
      await appApi.updateApp(appId, formData);
      toast.success('应用更新成功');
      router.push('/apps');
    } catch (error) {
      console.error('Failed to update app:', error);
      toast.error('更新应用失败');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSecret = async () => {
    if (!confirm('确认要重置应用密钥吗？重置后需要更新所有使用该应用的代码。')) {
      return;
    }

    try {
      const result = await appApi.resetAppSecret(appId);
      toast.success('密钥重置成功');
      if (app) {
        setApp({ ...app, appSecret: result.appSecret });
      }
    } catch (error) {
      console.error('Failed to reset secret:', error);
      toast.error('重置密钥失败');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
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
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/apps">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">编辑应用</h1>
              <p className="text-gray-600">修改应用配置和设置</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>应用的基本配置信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="appId" className="w-20 text-right">应用ID</Label>
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    id="appId"
                    value={app.appId}
                    disabled
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(app.appId)}
                  >
                    复制
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Label htmlFor="appName" className="w-20 text-right">应用名称 *</Label>
                <Input
                  id="appName"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  placeholder="请输入应用名称"
                  required
                  className="flex-1"
                />
              </div>

              <div className="flex items-start space-x-4">
                <Label htmlFor="description" className="w-20 text-right pt-2">应用描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入应用描述"
                  rows={3}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center space-x-4">
                <Label htmlFor="status" className="w-20 text-right">状态</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status === 1}
                    onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 1 : 0 })}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.status === 1 ? '启用' : '禁用'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>应用的安全配置和密钥管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="appSecret" className="w-20 text-right">应用密钥</Label>
                <div className="flex items-center space-x-2 flex-1">
                  <div className="relative flex-1">
                    <Input
                      id="appSecret"
                      type={showSecret ? "text" : "password"}
                      value={app.appSecret || ''}
                      disabled
                      className="font-mono pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(app.appSecret || '')}
                  >
                    复制
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetSecret}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    重置
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="requireSign" className="w-20 text-right">签名验证</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSign"
                      checked={formData.requireSign}
                      onCheckedChange={(checked) => setFormData({ ...formData, requireSign: checked })}
                    />
                    <span className="text-sm text-gray-600">
                      {formData.requireSign ? '需要签名验证' : '不需要签名验证（测试模式）'}
                    </span>
                  </div>
                </div>
                <div className="ml-24">
                  <p className="text-sm text-gray-500">
                    测试模式下可以不提供签名参数，生产环境建议启用签名验证
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-4">
                  <Label htmlFor="ipWhitelist" className="w-20 text-right pt-2">IP白名单</Label>
                  <Textarea
                    id="ipWhitelist"
                    value={formData.ipWhitelist}
                    onChange={(e) => setFormData({ ...formData, ipWhitelist: e.target.value })}
                    placeholder="多个IP用逗号分隔，* 表示允许所有IP"
                    rows={2}
                    className="flex-1"
                  />
                </div>
                <div className="ml-24">
                  <p className="text-sm text-gray-500">
                    留空或填写 * 表示允许所有IP访问
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle>API设置</CardTitle>
              <CardDescription>应用的API相关配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="callbackUrl" className="w-20 text-right">回调地址</Label>
                <Input
                  id="callbackUrl"
                  type="url"
                  value={formData.callbackUrl}
                  onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                  placeholder="https://your-domain.com/callback"
                  className="flex-1"
                />
              </div>

              <div className="flex items-center space-x-4">
                <Label htmlFor="rateLimit" className="w-20 text-right">速率限制</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="rateLimit"
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.rateLimit}
                    onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) || 1000 })}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">次/分钟</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/apps">
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
