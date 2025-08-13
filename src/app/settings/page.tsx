'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  Shield,
  Bell,
  Database,
  Globe,
  Key,
  Mail,
  Server,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // 基本设置
    siteName: '支付管理系统',
    siteDescription: '专业的支付管理解决方案',
    adminEmail: 'admin@example.com',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    
    // 安全设置
    enableTwoFactor: true,
    passwordMinLength: 8,
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    
    // 通知设置
    emailNotifications: true,
    orderNotifications: true,
    securityAlerts: true,
    systemMaintenance: false,
    
    // 支付设置
    enableAlipay: true,
    enableWechatPay: true,
    minOrderAmount: 1,
    maxOrderAmount: 10000,
    
    // API设置
    apiBaseUrl: 'https://www.coding520.top/pay-api',
    apiTimeout: 30000,
    rateLimitEnabled: true,
    maxRequestsPerMinute: 100
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 这里应该调用API保存设置
    console.log('保存设置:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
          <p className="text-muted-foreground">
            配置系统参数和功能选项
          </p>
        </div>
        <Button onClick={handleSave} disabled={saved}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? '已保存' : '保存设置'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="payment">支付设置</TabsTrigger>
          <TabsTrigger value="api">API设置</TabsTrigger>
        </TabsList>

        {/* 基本设置 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                站点信息
              </CardTitle>
              <CardDescription>配置网站基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">站点名称</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">管理员邮箱</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => updateSetting('adminEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">站点描述</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">时区</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">语言</Label>
                  <Input
                    id="language"
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                安全配置
              </CardTitle>
              <CardDescription>配置系统安全参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用双因素认证</Label>
                  <p className="text-sm text-muted-foreground">
                    为管理员账户启用双因素认证
                  </p>
                </div>
                <Switch
                  checked={settings.enableTwoFactor}
                  onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">密码最小长度</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">会话超时时间（秒）</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">最大登录尝试次数</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full md:w-48"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                通知配置
              </CardTitle>
              <CardDescription>管理系统通知和提醒</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>邮件通知</Label>
                  <p className="text-sm text-muted-foreground">
                    启用邮件通知功能
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>订单通知</Label>
                  <p className="text-sm text-muted-foreground">
                    新订单和支付状态变更通知
                  </p>
                </div>
                <Switch
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => updateSetting('orderNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>安全警报</Label>
                  <p className="text-sm text-muted-foreground">
                    登录异常和安全事件提醒
                  </p>
                </div>
                <Switch
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => updateSetting('securityAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>系统维护通知</Label>
                  <p className="text-sm text-muted-foreground">
                    系统维护和更新通知
                  </p>
                </div>
                <Switch
                  checked={settings.systemMaintenance}
                  onCheckedChange={(checked) => updateSetting('systemMaintenance', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 支付设置 */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                支付配置
              </CardTitle>
              <CardDescription>配置支付方式和限额</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">支付方式</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>支付宝</Label>
                    <p className="text-sm text-muted-foreground">
                      启用支付宝支付
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableAlipay}
                    onCheckedChange={(checked) => updateSetting('enableAlipay', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>微信支付</Label>
                    <p className="text-sm text-muted-foreground">
                      启用微信支付
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableWechatPay}
                    onCheckedChange={(checked) => updateSetting('enableWechatPay', checked)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">最小订单金额（元）</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    step="0.01"
                    value={settings.minOrderAmount}
                    onChange={(e) => updateSetting('minOrderAmount', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOrderAmount">最大订单金额（元）</Label>
                  <Input
                    id="maxOrderAmount"
                    type="number"
                    step="0.01"
                    value={settings.maxOrderAmount}
                    onChange={(e) => updateSetting('maxOrderAmount', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API设置 */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                API配置
              </CardTitle>
              <CardDescription>配置API服务参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiBaseUrl">API基础地址</Label>
                <Input
                  id="apiBaseUrl"
                  value={settings.apiBaseUrl}
                  onChange={(e) => updateSetting('apiBaseUrl', e.target.value)}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiTimeout">API超时时间（毫秒）</Label>
                  <Input
                    id="apiTimeout"
                    type="number"
                    value={settings.apiTimeout}
                    onChange={(e) => updateSetting('apiTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRequestsPerMinute">每分钟最大请求数</Label>
                  <Input
                    id="maxRequestsPerMinute"
                    type="number"
                    value={settings.maxRequestsPerMinute}
                    onChange={(e) => updateSetting('maxRequestsPerMinute', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用速率限制</Label>
                  <p className="text-sm text-muted-foreground">
                    限制API请求频率
                  </p>
                </div>
                <Switch
                  checked={settings.rateLimitEnabled}
                  onCheckedChange={(checked) => updateSetting('rateLimitEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                系统状态
              </CardTitle>
              <CardDescription>当前系统运行状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API服务</span>
                  <Badge className="bg-green-100 text-green-800">正常</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">数据库连接</span>
                  <Badge className="bg-green-100 text-green-800">正常</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">支付网关</span>
                  <Badge className="bg-green-100 text-green-800">正常</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">缓存服务</span>
                  <Badge variant="secondary">监控中</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
