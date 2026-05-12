'use client';

import { useState, useEffect } from 'react';
import { MODEL_PRICING } from '@/lib/config';

export default function ImagePage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dall-e-3');
  const [size, setSize] = useState('1024x1024');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // 获取用户ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setImageUrl('');

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          size,
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const data = await response.json();
      if (data.data && data.data[0]?.url) {
        setImageUrl(data.data[0].url);
      }

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const models = ['dall-e-3', 'sdxl'];
  const sizes = ['1024x1024', '1792x1024', '1024x1792'];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI图片生成</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">选择模型</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {models.map(m => (
              <option key={m} value={m}>
                {m} - {MODEL_PRICING[m].input} 积分/张
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">图片尺寸</label>
          <select
            value={size}
            onChange={e => setSize(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sizes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">描述图片</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            placeholder="描述你想要生成的图片，例如：一只可爱的猫咪在草地上玩耍，卡通风格..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '生成中...' : '生成图片'}
        </button>

        {imageUrl && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">生成结果</h3>
            <img 
              src={imageUrl} 
              alt="Generated image" 
              className="w-full rounded-lg shadow-lg"
            />
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
            >
              查看原图
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
