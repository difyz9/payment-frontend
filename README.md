# 支付管理系统 (Payment Management System)

基于 Next.js 构建的支付服务管理平台前端应用，提供完整的支付API应用管理和订单监控功能。

## 🚀 快速部署到 Vercel

### 一键部署脚本
```bash
./deploy-to-vercel.sh https://github.com/difyz9/your-repo-name.git
```

### 手动部署步骤
详细部署指南请查看 [readme9.md](./readme9.md)

## ✨ 功能特性

- 🔐 **身份认证**：用户注册、登录、密码重置
- 📱 **应用管理**：创建、编辑、删除支付API应用
- 🔑 **密钥管理**：生成和重置应用密钥（AppSecret）  
- 📊 **订单监控**：实时查看和筛选支付订单
- 📈 **统计面板**：应用和订单数据可视化
- 🎨 **响应式设计**：完美适配桌面和移动设备
- 🛡️ **安全机制**：HMAC-SHA256 签名验证

## 🛠️ 技术栈

- **前端框架**：Next.js 15 (App Router)
- **开发语言**：TypeScript
- **样式方案**：Tailwind CSS 4.0
- **UI组件库**：shadcn/ui + Radix UI
- **表单处理**：React Hook Form + Zod
- **状态管理**：React Context + Hooks
- **HTTP客户端**：Axios
- **图标系统**：Lucide React
- **通知系统**：Sonner

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── auth/              # 身份认证相关页面
│   │   ├── login/         # 登录页面
│   │   ├── register/      # 注册页面
│   │   └── forgot-password/ # 忘记密码页面
│   ├── apps/              # 应用管理页面
│   │   ├── new/           # 创建新应用
│   │   ├── [appId]/       # 应用详情页面
│   │   └── page.tsx       # 应用列表
│   ├── orders/            # 订单管理页面
│   ├── profile/           # 用户资料页面
│   ├── payment-test/      # 支付测试页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页仪表板
├── components/
│   ├── auth/              # 认证相关组件
│   ├── layout/            # 布局组件
│   │   ├── MainLayout.tsx # 主要布局
│   │   └── Sidebar.tsx    # 侧边栏
│   └── ui/                # UI基础组件
├── lib/                   # 工具函数和API
│   ├── api.ts            # 通用API客户端
│   ├── auth-api.ts       # 认证API
│   ├── auth.ts           # 认证工具函数
│   ├── payment.ts        # 支付相关工具
│   └── utils.ts          # 通用工具函数
└── .github/
    └── copilot-instructions.md  # GitHub Copilot 指令
```

## 🚀 本地开发

### 1. 环境要求
- Node.js 18+ 
- npm 或 yarn
- Git

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制并配置环境变量：
```bash
cp .env.development .env.local
```

编辑 `.env.local`：
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8089
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=支付管理系统
NEXT_PUBLIC_DEBUG=true
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 5. 构建生产版本
```bash
# Vercel 环境构建
npm run build:vercel

# 静态导出构建
npm run build

# 启动生产服务器
npm run start
```

## 📱 页面功能

### 🏠 首页仪表板 (/)
- 📊 实时统计数据展示
- 📋 最近应用和订单概览
- 🚀 快速操作入口

### 🔐 身份认证 (/auth/*)
- 👤 用户登录/注册
- 🔒 密码重置功能
- 🛡️ 安全验证机制

### 📱 应用管理 (/apps/*)
- 📝 应用创建和编辑
- 🔑 密钥生成和重置
- 📊 应用统计信息
- 🗑️ 应用删除管理

### 💰 订单管理 (/orders)
- 📋 订单列表展示
- 🔍 多条件筛选搜索
- 📈 订单状态统计
- 💳 支付方式分析

### 🧪 支付测试 (/payment-test)
- 🔧 API接口测试
- 📝 支付流程验证
- 🐛 调试工具集成

## 🔌 API 集成

### 认证机制
```typescript
// HMAC-SHA256 签名认证
import { generateSignature } from '@/lib/auth';

const signature = generateSignature(appId, appSecret, params);
```

### API 调用示例
```typescript
import { appApi, orderApi } from '@/lib/api';

// 应用管理
const apps = await appApi.getApps(page, limit);
const newApp = await appApi.createApp(appData);

// 订单查询
const orders = await orderApi.getOrders(filters);
const orderDetail = await orderApi.getOrderById(orderId);
```

## 🎨 主题和样式

### Tailwind CSS 配置
- 💙 自定义颜色系统
- 📱 响应式断点设计
- 🌙 深色模式支持
- ⚡ 性能优化配置

### 设计系统
- 🎯 一致的间距和尺寸
- 📚 可复用的组件库
- 🔤 统一的字体规范
- 🎨 品牌色彩体系

## 🔧 开发工具

### 代码质量
```bash
npm run lint         # ESLint 检查
npm run lint:fix     # 自动修复
npm run type-check   # TypeScript 检查
```

### 测试工具
```bash
npm run test:build   # 构建测试
npm run validate:env # 环境变量验证
```

## 🌍 环境变量配置

| 变量名 | 描述 | 开发环境 | 生产环境 |
|--------|------|----------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端API地址 | `http://localhost:8089` | `https://api.example.com` |
| `NEXT_PUBLIC_BASE_URL` | 前端基础URL | `http://localhost:3000` | `https://app.example.com` |
| `NEXT_PUBLIC_APP_ENV` | 应用环境 | `development` | `production` |
| `NEXT_PUBLIC_DEBUG` | 调试模式 | `true` | `false` |

## 🚀 部署选项

### Vercel (推荐)
- ✅ 零配置部署
- 🚀 自动优化和缓存
- 📊 性能监控
- 🔄 自动CI/CD

### 传统部署
```bash
# 静态导出
npm run build
# 上传 dist/ 目录到服务器
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:nodejs
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🤝 贡献指南

1. 🍴 Fork 项目
2. 🌟 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 💾 提交更改 (`git commit -m 'Add amazing feature'`)
4. 📤 推送分支 (`git push origin feature/amazing-feature`)
5. 🔄 创建 Pull Request

## 📞 技术支持

- 📖 [详细部署指南](./readme9.md)
- 🐛 [问题反馈](https://github.com/your-repo/issues)
- 💬 [讨论区](https://github.com/your-repo/discussions)

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件
