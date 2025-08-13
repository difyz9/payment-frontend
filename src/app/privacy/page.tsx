export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">隐私政策</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">1. 信息收集</h2>
            <p className="text-gray-700 mb-4">
              我们收集您提供的信息，包括但不限于：
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>注册时提供的个人信息（用户名、邮箱、手机号）</li>
              <li>使用服务过程中产生的数据</li>
              <li>设备和技术信息</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. 信息使用</h2>
            <p className="text-gray-700 mb-4">
              我们使用收集的信息来：
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>提供和改进我们的服务</li>
              <li>处理您的请求和交易</li>
              <li>发送服务相关通知</li>
              <li>确保平台安全</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. 信息保护</h2>
            <p className="text-gray-700 mb-4">
              我们采取合理的安全措施来保护您的个人信息，包括：
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>数据加密传输和存储</li>
              <li>访问控制和权限管理</li>
              <li>定期安全审计</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. 信息共享</h2>
            <p className="text-gray-700 mb-4">
              我们不会向第三方出售、交易或转让您的个人信息，除非：
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>获得您的明确同意</li>
              <li>法律法规要求</li>
              <li>保护我们的权利和财产</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Cookie使用</h2>
            <p className="text-gray-700 mb-4">
              我们使用Cookie来改善用户体验，您可以通过浏览器设置控制Cookie的使用。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. 联系我们</h2>
            <p className="text-gray-700 mb-4">
              如果您对本隐私政策有任何疑问，请联系我们。
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                最后更新时间：{new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
