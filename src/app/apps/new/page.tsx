'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, ArrowLeft, Copy, Eye, EyeOff } from 'lucide-react';
import { appApi, CreateAppRequest } from '@/lib/api';
import { toast } from 'sonner';

const formSchema = z.object({
  appName: z.string().min(1, '应用名称不能为空').max(100, '应用名称不能超过100个字符'),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  callbackUrl: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  ipWhitelist: z.string().optional(),
  rateLimit: z.number().min(1, '速率限制必须大于0').max(10000, '速率限制不能超过10000'),
});

type FormData = z.infer<typeof formSchema>;

export default function NewAppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdApp, setCreatedApp] = useState<{ appId: string; appSecret: string; appName: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: '',
      description: '',
      callbackUrl: '',
      ipWhitelist: '',
      rateLimit: 1000,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const requestData: CreateAppRequest = {
        appName: data.appName,
        description: data.description || '',
        callbackUrl: data.callbackUrl || '',
        ipWhitelist: data.ipWhitelist || '',
        rateLimit: data.rateLimit,
      };

      const result = await appApi.createApp(requestData);
      setCreatedApp(result);
      setSuccessDialogOpen(true);
      toast.success('应用创建成功');
    } catch (error) {
      console.error('Failed to create app:', error);
      toast.error('创建应用失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const handleGoToApps = () => {
    setSuccessDialogOpen(false);
    router.push('/apps');
  };

  const handleCreateAnother = () => {
    setSuccessDialogOpen(false);
    setCreatedApp(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">支付服务管理</h1>
              </Link>
            </div>
            <Link href="/apps">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回应用列表
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>创建新应用</CardTitle>
            <CardDescription>
              创建一个新的API应用来接入支付服务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>应用名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入应用名称" {...field} />
                      </FormControl>
                      <FormDescription>
                        应用的显示名称，便于识别和管理
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>应用描述</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入应用描述" {...field} />
                      </FormControl>
                      <FormDescription>
                        简要描述应用的用途和功能
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="callbackUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>回调地址</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/callback" {...field} />
                      </FormControl>
                      <FormDescription>
                        支付成功后的回调通知地址
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ipWhitelist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP白名单</FormLabel>
                      <FormControl>
                        <Input placeholder="127.0.0.1,192.168.1.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        允许访问的IP地址，多个IP用逗号分隔。留空表示不限制
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rateLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>速率限制 *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        每分钟允许的API调用次数
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Link href="/apps">
                    <Button variant="outline" type="button">
                      取消
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? '创建中...' : '创建应用'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>应用创建成功</DialogTitle>
              <DialogDescription>
                请妥善保存以下信息，appSecret只会显示这一次
              </DialogDescription>
            </DialogHeader>
            
            {createdApp && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">应用名称</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                    {createdApp.appName}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">应用ID (AppId)</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                      {createdApp.appId}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdApp.appId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">应用密钥 (AppSecret)</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                      {showSecret ? createdApp.appSecret : '••••••••••••••••••••••••••••••••'}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdApp.appSecret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ 请务必保存好AppSecret，离开此页面后将无法再次查看
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={handleCreateAnother}>
                继续创建
              </Button>
              <Button onClick={handleGoToApps}>
                查看应用列表
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
