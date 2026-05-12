'use client';

import { useState, useEffect, useRef } from 'react';
import { MODEL_PRICING } from '@/lib/config';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 获取用户ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model,
          userId,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '请求失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
                  }
                  return prev;
                });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const models = Object.keys(MODEL_PRICING).filter(k => !['dall-e-3', 'sdxl'].includes(k));

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">选择模型</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {models.map(m => (
            <option key={m} value={m}>
              {m} - 输入: ${MODEL_PRICING[m].input}/1K tokens, 输出: ${MODEL_PRICING[m].output}/1K tokens
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <h3 className="text-xl font-medium mb-2">欢迎使用AI聊天</h3>
            <p>输入您的问题，开始与AI对话吧！</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-4 py-2 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="输入您的问题..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
