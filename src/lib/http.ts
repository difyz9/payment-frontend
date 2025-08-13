// HTTP 网络请求工具类

// 后端响应格式接口
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

// 请求配置接口
export interface RequestConfig extends RequestInit {
  timeout?: number;
  baseURL?: string;
  params?: Record<string, string | number | boolean>;
}

// 错误类型
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

// 拦截器接口
export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

export interface ResponseInterceptor {
  (response: Response): Response | Promise<Response>;
}

export interface ErrorInterceptor {
  (error: HttpError): HttpError | Promise<HttpError>;
}

/**
 * HTTP 工具类
 * 统一管理所有网络请求，支持拦截器、超时控制、错误处理等
 */
export class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseURL?: string, timeout = 10000) {
    // 在生产环境（Vercel）使用相对路径，让 vercel.json 的代理配置生效
    // 在开发环境使用完整的后端地址
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      this.baseURL = baseURL || '';  // 空字符串，使用相对路径
    } else {
      this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8089';
    }
    this.defaultTimeout = timeout;
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // 添加错误拦截器
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // 构建完整URL
  private buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      urlParams.append(key, String(value));
    });

    const separator = fullURL.includes('?') ? '&' : '?';
    return `${fullURL}${separator}${urlParams.toString()}`;
  }

  // 处理请求配置
  private async processRequestConfig(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = { ...config };
    
    // 应用请求拦截器
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  // 处理响应
  private async processResponse(response: Response): Promise<Response> {
    let processedResponse = response;
    
    // 应用响应拦截器
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    return processedResponse;
  }

  // 处理错误
  private async processError(error: HttpError): Promise<HttpError> {
    let processedError = error;
    
    // 应用错误拦截器
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }

    return processedError;
  }

  // 核心请求方法
  private async request<T = unknown>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    try {
      // 处理配置
      const processedConfig = await this.processRequestConfig(config);
      const { timeout = this.defaultTimeout, params, ...fetchConfig } = processedConfig;

      // 构建URL
      const requestURL = this.buildURL(url, params);

      // 设置默认headers - 注意：先设置默认值，再合并拦截器添加的headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((fetchConfig.headers as Record<string, string>) || {}),
      };

      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // 发送请求
        const response = await fetch(requestURL, {
          ...fetchConfig,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 处理响应
        const processedResponse = await this.processResponse(response);

        // 解析响应数据
        const responseData: ApiResponse<T> = await processedResponse.json().catch(() => ({
          code: processedResponse.status,
          message: `请求失败: ${processedResponse.status}`,
        }));

        // 检查业务状态码
        if (responseData.code !== 200) {
          throw new HttpError(
            responseData.message || `请求失败: ${responseData.code}`,
            processedResponse.status,
            responseData.code,
            responseData.data
          );
        }

        // 检查HTTP状态码
        if (!processedResponse.ok) {
          throw new HttpError(
            responseData.message || `HTTP错误: ${processedResponse.status}`,
            processedResponse.status,
            responseData.code,
            responseData.data
          );
        }

        // 返回数据字段，如果没有data则返回整个响应
        return (responseData.data !== undefined ? responseData.data : responseData) as T;

      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof HttpError) {
          throw await this.processError(error);
        }

        if ((error as Error).name === 'AbortError') {
          const timeoutError = new HttpError('请求超时', 408);
          throw await this.processError(timeoutError);
        }

        const networkError = new HttpError(
          error instanceof Error ? error.message : '网络错误',
          0
        );
        throw await this.processError(networkError);
      }

    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      
      const unknownError = new HttpError(
        error instanceof Error ? error.message : '未知错误',
        0
      );
      throw await this.processError(unknownError);
    }
  }

  // GET 请求
  async get<T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'GET',
      params: { ...params, ...(config.params || {}) },
    });
  }

  // POST 请求
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 请求
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 请求
  async delete<T = unknown>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'DELETE',
    });
  }

  // PATCH 请求
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // 文件上传
  async upload<T = unknown>(
    url: string,
    formData: FormData,
    config: RequestConfig = {}
  ): Promise<T> {
    const { headers, ...restConfig } = config;
    
    // 删除Content-Type让浏览器自动设置multipart/form-data
    const uploadHeaders = { ...(headers as Record<string, string>) };
    delete uploadHeaders['Content-Type'];

    return this.request<T>(url, {
      ...restConfig,
      method: 'POST',
      headers: uploadHeaders,
      body: formData,
    });
  }

  // 下载文件
  async download(
    url: string,
    filename?: string,
    config: RequestConfig = {}
  ): Promise<void> {
    try {
      const processedConfig = await this.processRequestConfig(config);
      const requestURL = this.buildURL(url, processedConfig.params);

      const response = await fetch(requestURL, {
        ...processedConfig,
        method: 'GET',
      });

      if (!response.ok) {
        throw new HttpError(`下载失败: ${response.status}`, response.status);
      }

      const blob = await response.blob();
      const downloadURL = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadURL);
    } catch (error) {
      if (error instanceof HttpError) {
        throw await this.processError(error);
      }
      throw error;
    }
  }
}

// 创建默认HTTP客户端实例
export const httpClient = new HttpClient();

// 添加认证拦截器
httpClient.addRequestInterceptor((config) => {
  // 从localStorage获取token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    console.log('🔐 Auth Token:', token ? token.substring(0, 50) + '...' : 'null');
    if (token) {
      // 确保headers对象存在
      if (!config.headers) {
        config.headers = {};
      }
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No token found');
    }
  }
  return config;
});

// 添加认证错误处理拦截器
httpClient.addErrorInterceptor((error) => {
  if (error.status === 401) {
    console.log('🔓 收到 401 错误，清除认证信息');
    // Token过期，清除认证信息
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');
      // 不要立即跳转，让组件来处理
      // window.location.href = '/auth/login';
    }
    error.message = '认证已过期，请重新登录';
  }
  return error;
});

// 导出便捷方法
export const http = {
  get: httpClient.get.bind(httpClient),
  post: httpClient.post.bind(httpClient),
  put: httpClient.put.bind(httpClient),
  delete: httpClient.delete.bind(httpClient),
  patch: httpClient.patch.bind(httpClient),
  upload: httpClient.upload.bind(httpClient),
  download: httpClient.download.bind(httpClient),
};

export default httpClient;
