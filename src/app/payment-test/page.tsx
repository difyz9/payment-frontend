'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Copy,
  Loader2,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { http } from '@/lib/http';
import CryptoJS from 'crypto-js';

interface TestResult {
  id: string;
  status: 'pending' | 'success' | 'failed';
  method: string;
  amount: number;
  orderId: string;
  timestamp: string;
  response?: Record<string, unknown>;
  error?: string;
}

export default function PaymentTestPage() {
  const [activeTab, setActiveTab] = useState('create-order');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // 创建订单表单数据
  const [orderData, setOrderData] = useState({
    appId: 'test-app-001',
    appSecret: '',
    amount: '',
    outTradeNo: '',
    subject: '测试商品',
    body: '这是一个测试订单',
    notifyUrl: 'https://your-domain.com/notify',
    returnUrl: 'https://your-domain.com/return',
    paymentMethod: 'alipay',
    useSignature: false // 是否使用签名
  });

  // 查询订单表单数据
  const [queryData, setQueryData] = useState({
    appId: 'test-app-001',
    appSecret: '',
    outTradeNo: '',
    orderId: '',
    useSignature: false // 是否使用签名
  });

  const handleCreateOrder = async () => {
    if (!orderData.appId || !orderData.amount || !orderData.outTradeNo) {
      toast.error('请填写必要信息（应用ID、金额、订单号）');
      return;
    }

    if (orderData.useSignature && !orderData.appSecret) {
      toast.error('使用签名模式时必须填写应用密钥');
      return;
    }

    setLoading(true);
    const testId = Date.now().toString();

    // 添加测试记录
    const newTest: TestResult = {
      id: testId,
      status: 'pending',
      method: 'CREATE_ORDER',
      amount: parseFloat(orderData.amount),
      orderId: orderData.outTradeNo,
      timestamp: new Date().toLocaleString('zh-CN')
    };

    setTestResults(prev => [newTest, ...prev]);

    try {
      // 构建请求头
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = Math.random().toString(36).substring(2);
      const headers: Record<string, string> = {
        'X-App-Id': orderData.appId,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce
      };

      // 如果使用签名模式，生成签名
      if (orderData.useSignature && orderData.appSecret) {
        const signParams = {
          appId: orderData.appId,
          timestamp: timestamp,
          nonce: nonce
        };
        headers['X-Sign'] = generateSign(signParams, orderData.appSecret);
      }

      // 使用封装的HTTP客户端调用支付API
      const response = await http.post('/api/payment/pay', {
        subject: orderData.subject,
        amount: parseFloat(orderData.amount),
        payWay: orderData.paymentMethod,
        orderType: 'product',
        userId: 'test_user',
        extra: JSON.stringify({
          outTradeNo: orderData.outTradeNo,
          body: orderData.body,
          notifyUrl: orderData.notifyUrl,
          returnUrl: orderData.returnUrl
        })
      }, { headers });

      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'success', response: response as Record<string, unknown> }
          : test
      ));
      toast.success('订单创建成功');
    } catch (error) {
      console.error('创建订单失败:', error);
      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'failed', error: error instanceof Error ? error.message : '未知错误' }
          : test
      ));
      toast.error('创建订单失败');
    } finally {
      setLoading(false);
    }
  };

    const handleQueryOrder = async () => {
    if (!queryData.appId || !queryData.outTradeNo) {
      toast.error('请填写必要信息（应用ID、订单号）');
      return;
    }

    if (queryData.useSignature && !queryData.appSecret) {
      toast.error('使用签名模式时必须填写应用密钥');
      return;
    }

    setLoading(true);
    const testId = Date.now().toString();

    // 添加测试记录
    const newTest: TestResult = {
      id: testId,
      status: 'pending',
      method: 'QUERY_ORDER',
      amount: 0,
      orderId: queryData.outTradeNo,
      timestamp: new Date().toLocaleString('zh-CN')
    };

    setTestResults(prev => [newTest, ...prev]);

    try {
      // 构建请求头
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = Math.random().toString(36).substring(2);
      const headers: Record<string, string> = {
        'X-App-Id': queryData.appId,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce
      };

      // 如果使用签名模式，生成签名
      if (queryData.useSignature && queryData.appSecret) {
        const signParams = {
          appId: queryData.appId,
          timestamp: timestamp,
          nonce: nonce
        };
        headers['X-Sign'] = generateSign(signParams, queryData.appSecret);
      }

      // 使用封装的HTTP客户端调用支付API
      const response = await http.get(`/api/payment/query/${queryData.outTradeNo}`, undefined, { headers });

      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'success', response: response as Record<string, unknown> }
          : test
      ));
      toast.success('订单查询成功');
    } catch (error) {
      console.error('查询订单失败:', error);
      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'failed', error: error instanceof Error ? error.message : '未知错误' }
          : test
      ));
      toast.error('查询订单失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const generateOutTradeNo = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TEST${timestamp}${random}`;
  };

  // 生成API签名
  const generateSign = (params: Record<string, string>, secret: string): string => {
    // 按照后端逻辑生成签名
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    return CryptoJS.HmacSHA256(paramString, secret).toString(CryptoJS.enc.Hex).toUpperCase();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <TestTube className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">支付业务测试</h1>
        </div>
        <p className="text-gray-600">在线验证支付接口的功能和性能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 测试面板 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                接口测试
              </CardTitle>
              <CardDescription>
                测试支付接口的创建订单和查询订单功能
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create-order" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    创建订单
                  </TabsTrigger>
                  <TabsTrigger value="query-order" className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    查询订单
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create-order" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appId">应用ID *</Label>
                      <Input
                        id="appId"
                        placeholder="请输入应用ID"
                        value={orderData.appId}
                        onChange={(e) => setOrderData({...orderData, appId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">金额 (元) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.01"
                        value={orderData.amount}
                        onChange={(e) => setOrderData({...orderData, amount: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="useSignature"
                      checked={orderData.useSignature}
                      onChange={(e) => setOrderData({...orderData, useSignature: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="useSignature" className="text-sm font-medium">
                      使用签名验证（生产环境模式）
                    </Label>
                  </div>

                  {orderData.useSignature && (
                    <div>
                      <Label htmlFor="appSecret">应用密钥 *</Label>
                      <Input
                        id="appSecret"
                        type="password"
                        placeholder="请输入应用密钥"
                        value={orderData.appSecret}
                        onChange={(e) => setOrderData({...orderData, appSecret: e.target.value})}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="outTradeNo">商户订单号 *</Label>
                    <div className="flex">
                      <Input
                        id="outTradeNo"
                        placeholder="请输入订单号"
                        value={orderData.outTradeNo}
                        onChange={(e) => setOrderData({...orderData, outTradeNo: e.target.value})}
                        className="rounded-r-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOrderData({...orderData, outTradeNo: generateOutTradeNo()})}
                        className="rounded-l-none border-l-0"
                      >
                        生成
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">支付方式</Label>
                    <Select value={orderData.paymentMethod} onValueChange={(value) => setOrderData({...orderData, paymentMethod: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alipay">支付宝</SelectItem>
                        <SelectItem value="wechat">微信支付</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">商品标题</Label>
                    <Input
                      id="subject"
                      placeholder="商品名称"
                      value={orderData.subject}
                      onChange={(e) => setOrderData({...orderData, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="body">商品描述</Label>
                    <Textarea
                      id="body"
                      placeholder="商品详细描述"
                      value={orderData.body}
                      onChange={(e) => setOrderData({...orderData, body: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="notifyUrl">异步通知地址</Label>
                      <Input
                        id="notifyUrl"
                        placeholder="https://your-domain.com/notify"
                        value={orderData.notifyUrl}
                        onChange={(e) => setOrderData({...orderData, notifyUrl: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="returnUrl">同步跳转地址</Label>
                      <Input
                        id="returnUrl"
                        placeholder="https://your-domain.com/return"
                        value={orderData.returnUrl}
                        onChange={(e) => setOrderData({...orderData, returnUrl: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateOrder} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        创建订单
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="query-order" className="space-y-4">
                  <div>
                    <Label htmlFor="queryAppId">应用ID *</Label>
                    <Input
                      id="queryAppId"
                      placeholder="请输入应用ID"
                      value={queryData.appId}
                      onChange={(e) => setQueryData({...queryData, appId: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="queryUseSignature"
                      checked={queryData.useSignature}
                      onChange={(e) => setQueryData({...queryData, useSignature: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="queryUseSignature" className="text-sm font-medium">
                      使用签名验证（生产环境模式）
                    </Label>
                  </div>

                  {queryData.useSignature && (
                    <div>
                      <Label htmlFor="queryAppSecret">应用密钥 *</Label>
                      <Input
                        id="queryAppSecret"
                        type="password"
                        placeholder="请输入应用密钥"
                        value={queryData.appSecret}
                        onChange={(e) => setQueryData({...queryData, appSecret: e.target.value})}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="queryOutTradeNo">商户订单号</Label>
                    <Input
                      id="queryOutTradeNo"
                      placeholder="请输入商户订单号"
                      value={queryData.outTradeNo}
                      onChange={(e) => setQueryData({...queryData, outTradeNo: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="queryOrderId">系统订单号</Label>
                    <Input
                      id="queryOrderId"
                      placeholder="请输入系统订单号"
                      value={queryData.orderId}
                      onChange={(e) => setQueryData({...queryData, orderId: e.target.value})}
                    />
                  </div>

                  <Alert>
                    <AlertDescription>
                      商户订单号和系统订单号至少填写一个
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleQueryOrder} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        查询中...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        查询订单
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* 测试结果 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  测试结果
                </span>
                <Badge variant="outline">
                  {testResults.length} 条记录
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>暂无测试记录</p>
                  </div>
                ) : (
                  testResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                          {result.status === 'failed' && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                          {result.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500 mr-2" />}
                          <span className="font-medium text-sm">{result.method}</span>
                        </div>
                        <Badge variant={
                          result.status === 'success' ? 'default' : 
                          result.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {result.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>订单号: {result.orderId}</div>
                        <div>时间: {result.timestamp}</div>
                        {result.amount > 0 && <div>金额: ¥{result.amount}</div>}
                      </div>

                      {result.response && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(result.response, null, 2))}
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            复制响应
                          </Button>
                        </div>
                      )}

                      {result.error && (
                        <div className="mt-2 text-xs text-red-600">
                          错误: {result.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
