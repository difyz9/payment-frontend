// 支付相关API
import { http } from './http';

// 支付订单接口
export interface PaymentOrder {
  id: number;
  appId: string;
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
}

// 创建支付订单请求
export interface CreatePaymentRequest {
  amount: number;
  subject: string;
  orderNo: string;
  payWay: 'alipay' | 'wechat' | 'paypal';
  notifyUrl?: string;
  returnUrl?: string;
  extra?: string;
}

// 支付响应
export interface PaymentResponse {
  orderId: string;
  payUrl?: string;
  qrCode?: string;
  formData?: string;
}

// 订单查询响应
export interface OrderQueryResponse {
  order: PaymentOrder;
  payStatus: string;
  payTime?: string;
}

// 分页响应
export interface PaginatedOrders {
  list: PaymentOrder[];
  total: number;
  page: number;
  pageSize: number;
}

// 支付统计数据
export interface PaymentStats {
  totalOrders: number;
  successOrders: number;
  totalAmount: number;
  successAmount: number;
  todayOrders: number;
  todayAmount: number;
}

// 支付API
export const paymentAPI = {
  // 创建支付订单
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    return http.post('/api/v1/payment/create', data);
  },

  // 查询订单详情
  async getOrder(orderId: string): Promise<OrderQueryResponse> {
    return http.get(`/api/v1/payment/order/${orderId}`);
  },

  // 获取订单列表
  async getOrders(
    page = 1, 
    pageSize = 10, 
    filters?: {
      status?: number;
      payWay?: string;
      dateRange?: [string, string];
      appId?: string;
    }
  ): Promise<PaginatedOrders> {
    const params: Record<string, string | number> = {
      page,
      pageSize,
    };

    if (filters) {
      if (filters.status !== undefined) params.status = filters.status;
      if (filters.payWay) params.payWay = filters.payWay;
      if (filters.appId) params.appId = filters.appId;
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0];
        params.endDate = filters.dateRange[1];
      }
    }

    return http.get('/api/v1/payment/orders', params);
  },

  // 获取支付统计
  async getPaymentStats(appId?: string): Promise<PaymentStats> {
    const params: Record<string, string | number> = {};
    if (appId) params.appId = appId;
    return http.get('/api/v1/payment/stats', params);
  },

  // 手动查询支付状态
  async queryPaymentStatus(orderId: string): Promise<{ status: string; message: string }> {
    return http.post(`/api/v1/payment/query/${orderId}`);
  },

  // 发起退款
  async refund(
    orderId: string, 
    refundAmount: number, 
    reason?: string
  ): Promise<{ refundId: string; status: string }> {
    return http.post(`/api/v1/payment/refund/${orderId}`, {
      refundAmount,
      reason,
    });
  },

  // 获取支付二维码
  async getPaymentQRCode(orderId: string): Promise<{ qrCode: string; expireTime: string }> {
    return http.get(`/api/v1/payment/qrcode/${orderId}`);
  },

  // 取消订单
  async cancelOrder(orderId: string, reason?: string): Promise<{ message: string }> {
    return http.post(`/api/v1/payment/cancel/${orderId}`, { reason });
  },

  // 导出订单数据
  async exportOrders(
    filters?: {
      status?: number;
      payWay?: string;
      dateRange?: [string, string];
      appId?: string;
    },
    format: 'xlsx' | 'csv' = 'xlsx'
  ): Promise<void> {
    const params: Record<string, string | number> = { format };
    
    if (filters) {
      if (filters.status !== undefined) params.status = filters.status;
      if (filters.payWay) params.payWay = filters.payWay;
      if (filters.appId) params.appId = filters.appId;
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0];
        params.endDate = filters.dateRange[1];
      }
    }

    const filename = `orders_${new Date().toISOString().split('T')[0]}.${format}`;
    return http.download('/api/v1/payment/export', filename, { params });
  },

  // 批量操作订单
  async batchUpdateOrders(
    orderIds: string[], 
    action: 'cancel' | 'refund',
    params?: { reason?: string; refundAmount?: number }
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    return http.post('/api/v1/payment/batch', {
      orderIds,
      action,
      ...params,
    });
  },
};

// 导出订单状态常量
export const ORDER_STATUS = {
  PENDING: 1,      // 未支付
  SCANNING: 2,     // 已扫码
  SUCCESS: 201,    // 支付成功
  FAILED: 500,     // 支付失败
  CANCELLED: 600,  // 已取消
  REFUNDED: 700,   // 已退款
} as const;

// 支付方式常量
export const PAY_METHODS = {
  ALIPAY: 'alipay',
  WECHAT: 'wechat',
  PAYPAL: 'paypal',
} as const;

// 订单状态映射
export const orderStatusMap = {
  [ORDER_STATUS.PENDING]: { label: '未支付', color: 'bg-yellow-100 text-yellow-800' },
  [ORDER_STATUS.SCANNING]: { label: '已扫码', color: 'bg-blue-100 text-blue-800' },
  [ORDER_STATUS.SUCCESS]: { label: '支付成功', color: 'bg-green-100 text-green-800' },
  [ORDER_STATUS.FAILED]: { label: '支付失败', color: 'bg-red-100 text-red-800' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  [ORDER_STATUS.REFUNDED]: { label: '已退款', color: 'bg-purple-100 text-purple-800' },
};

// 支付方式映射
export const payWayMap = {
  [PAY_METHODS.ALIPAY]: { label: '支付宝', color: 'bg-blue-100 text-blue-800' },
  [PAY_METHODS.WECHAT]: { label: '微信支付', color: 'bg-green-100 text-green-800' },
  [PAY_METHODS.PAYPAL]: { label: 'PayPal', color: 'bg-indigo-100 text-indigo-800' },
};
