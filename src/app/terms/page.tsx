export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">用户协议</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">1. 服务条款</h2>
            <p className="text-gray-700 mb-4">
              欢迎使用支付服务管理平台。本协议规定了您使用本服务的条款和条件。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. 用户账户</h2>
            <p className="text-gray-700 mb-4">
              您需要创建一个账户来使用本服务。您有责任保护您的账户信息安全。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. 服务使用</h2>
            <p className="text-gray-700 mb-4">
              您同意按照本协议和相关法律法规使用本服务。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. 隐私保护</h2>
            <p className="text-gray-700 mb-4">
              我们重视您的隐私，详细的隐私政策请参见隐私政策页面。
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. 责任限制</h2>
            <p className="text-gray-700 mb-4">
              在适用法律允许的最大范围内，我们对因使用本服务而产生的任何损失不承担责任。
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
