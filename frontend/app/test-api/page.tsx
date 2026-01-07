'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testFrameworksAPI = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing /api/frameworks...');
      
      const response = await fetch('/api/frameworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: '帮我写一个营销文案，用于推广新产品',
          model: 'deepseek',
          user_type: 'free',
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResult(data);
      } else {
        setError(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API 测试页面</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试框架匹配 API</h2>
          <button
            onClick={testFrameworksAPI}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试 /api/frameworks'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">错误</h3>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">成功</h3>
            <pre className="text-sm text-green-600 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-100 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-2">环境信息</h3>
          <div className="text-sm space-y-1">
            <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '未设置'}</p>
            <p><strong>当前域名:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>打开浏览器控制台查看详细日志</p>
        </div>
      </div>
    </div>
  );
}
