# Ubuntu 部署指南 - 适用于已安装 PM2 的环境

## 快速部署

如果您的Ubuntu服务器上已经安装了PM2，使用这个简化的部署脚本：

```bash
# 直接运行部署脚本
bash deploy-simple.sh
```

## 脚本功能

这个脚本将自动完成以下操作：

1. **环境检查**
   - 检查Node.js版本（需要18+）
   - 验证PM2是否已安装
   - 设置内存限制避免构建错误

2. **项目配置**
   - 提示输入服务器IP/域名
   - 设置应用端口（默认3000）
   - 创建生产环境配置文件

3. **构建和部署**
   - 安装项目依赖
   - 构建Next.js应用
   - 创建PM2配置文件
   - 启动应用进程

4. **进程管理**
   - 停止旧的进程实例
   - 启动新的应用实例
   - 保存PM2配置
   - 设置开机自启动

## 使用示例

```bash
# 1. 进入项目目录
cd /path/to/payment-frontend

# 2. 运行部署脚本
bash deploy-simple.sh

# 3. 按提示输入配置信息
服务器IP或域名 (默认: localhost): 192.168.1.100
应用端口 (默认: 3000): 3000
```

## 部署后管理

部署完成后，您可以使用以下PM2命令管理应用：

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs payment-frontend

# 重启应用
pm2 restart payment-frontend

# 停止应用
pm2 stop payment-frontend

# 删除应用
pm2 delete payment-frontend

# 监控面板
pm2 monit
```

## 访问应用

部署成功后，可以通过浏览器访问：
- 本地访问：http://localhost:3000
- 远程访问：http://您的服务器IP:3000

## 故障排除

### 1. 构建内存错误
如果遇到"Bus error"或内存不足错误，脚本会自动降低内存使用：
```bash
export NODE_OPTIONS="--max-old-space-size=1024"
```

### 2. 端口被占用
如果端口已被占用，脚本会提示是否继续部署。您可以：
- 选择继续（将覆盖现有服务）
- 取消部署并手动停止占用端口的进程

### 3. PM2权限问题
确保当前用户有权限使用PM2：
```bash
# 检查PM2状态
pm2 status

# 如果权限不足，可能需要重新安装PM2
sudo npm install -g pm2
```

### 4. 查看详细日志
```bash
# 查看PM2日志
pm2 logs payment-frontend

# 查看错误日志
pm2 logs payment-frontend --err

# 查看输出日志
pm2 logs payment-frontend --out
```

## 环境要求

- Ubuntu 18.04+ 或其他Linux发行版
- Node.js 18.0.0+
- npm 或 yarn
- PM2 (已安装)
- 至少1GB可用内存

## 安全建议

1. **防火墙配置**
   ```bash
   # 允许应用端口
   sudo ufw allow 3000
   ```

2. **Nginx反向代理**
   建议配置Nginx作为反向代理，提供SSL和负载均衡功能。

3. **定期备份**
   定期备份应用配置和数据。
