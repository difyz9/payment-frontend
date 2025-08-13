import { http } from './http';

// API接口类型定义
export interface ApiApp {
  id: number;
  appId: string;
  appSecret?: string; // 密钥字段（可选，仅在某些场景下返回）
  appName: string;
  status: number;
  description: string;
  callbackUrl: string;
  ipWhitelist: string;
  rateLimit: number;
  requireSign?: boolean; // 是否需要签名验证
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppRequest {
  appName: string;
  description: string;
  callbackUrl: string;
  ipWhitelist: string;
  rateLimit: number;
}

export interface CreateAppResponse {
  appId: string;
  appSecret: string;
  appName: string;
}

export interface PaymentOrder {
  id: number;
  appId: string;
  userId: string;
  orderNo: string;
  tradeNo: string;
  subject: string;
  amount: number;
  status: number;
  payWay: string;
  orderType: string;
  extra: string;
  payTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  appId?: string;
  status?: number;
  payWay?: string;
  orderNo?: string;
  subject?: string;
  startTime?: string;
  endTime?: string;
}

export interface PaginatedResponse<T> {
  list: T[] | null;
  total: number;
  page: number;
  pageSize: number;
}

// API方法
export const appApi = {
  // 获取应用列表
  getApps: (page = 1, pageSize = 10, status?: number) => {
    const params: Record<string, string | number> = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };
    if (status !== undefined) {
      params.status = status.toString();
    }
    return http.get<PaginatedResponse<ApiApp>>('/api/v1/apps', params);
  },

  // 创建应用
  createApp: (data: CreateAppRequest) => 
    http.post<CreateAppResponse>('/api/v1/apps', data),

  // 获取应用详情
  getApp: (appId: string) => 
    http.get<ApiApp>(`/api/v1/apps/${appId}`),

  // 更新应用
  updateApp: (appId: string, data: Partial<CreateAppRequest> & { status?: number; requireSign?: boolean }) => 
    http.put<string>(`/api/v1/apps/${appId}`, data),

  // 删除应用
  deleteApp: (appId: string) => 
    http.delete<string>(`/api/v1/apps/${appId}`),

  // 重置应用密钥
  resetAppSecret: (appId: string) => 
    http.post<{ appSecret: string; message: string }>(`/api/v1/apps/${appId}/reset-secret`),

  // 获取签名示例
  getSignExample: (appId: string) => 
    http.get<Record<string, string>>(`/api/v1/apps/${appId}/sign-example`),
};

// 订单管理API
export const orderApi = {
  // 获取订单列表
  getOrders: (params: OrderQueryParams = {}) => {
    const queryParams: Record<string, string> = {};
    
    // 转换参数
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.appId) queryParams.appId = params.appId;
    if (params.status !== undefined) queryParams.status = params.status.toString();
    if (params.payWay) queryParams.payWay = params.payWay;
    if (params.orderNo) queryParams.orderNo = params.orderNo;
    if (params.subject) queryParams.subject = params.subject;
    if (params.startTime) queryParams.startTime = params.startTime;
    if (params.endTime) queryParams.endTime = params.endTime;
    
    return http.get<PaginatedResponse<PaymentOrder>>('/api/v1/orders', queryParams);
  },

  // 获取订单详情
  getOrder: (orderId: number) => 
    http.get<PaymentOrder>(`/api/v1/orders/${orderId}`),

  // 根据订单号查询订单
  getOrderByNo: (orderNo: string) => 
    http.get<PaymentOrder>(`/api/v1/orders/no/${orderNo}`),

  // 获取订单统计
  getOrderStats: (params: { appId?: string; startTime?: string; endTime?: string } = {}) => {
    const queryParams: Record<string, string> = {};
    if (params.appId) queryParams.appId = params.appId;
    if (params.startTime) queryParams.startTime = params.startTime;
    if (params.endTime) queryParams.endTime = params.endTime;
    
    return http.get<{
      totalCount: number;
      paidCount: number;
      unpaidCount: number;
      totalAmount: number;
      paidAmount: number;
    }>('/api/v1/orders/stats', queryParams);
  },
};

// 订单状态映射
export const orderStatusMap = {
  1: { label: '未支付', color: 'bg-yellow-100 text-yellow-800' },
  2: { label: '已扫码', color: 'bg-blue-100 text-blue-800' },
  201: { label: '支付成功', color: 'bg-green-100 text-green-800' },
};

// 支付方式映射
export const payWayMap = {
  alipay: { label: '支付宝', color: 'bg-blue-100 text-blue-800' },
  wechat: { label: '微信支付', color: 'bg-green-100 text-green-800' },
};
