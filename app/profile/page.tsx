'use client';

import { useState, useEffect } from 'react';
import { RECHARGE_OPTIONS, PAYMENT_QRCODE } from '@/lib/config';

export default function ProfilePage() {
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState(0);
  const [selectedOption, setSelectedOption] = useState(RECHARGE_OPTIONS[0]);
  const [screenshot, setScreenshot] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);

  useEffect(() => {
    // 获取用户ID和积分
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      // 获取积分
      fetch(`/api/balance?userId=${storedUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data.points !== undefined) {
            setPoints(data.points);
          }
        });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshot(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecharge = async () => {
    if (!screenshot) {
      alert('请上传付款截图');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: selectedOption.amount,
          points: selectedOption.points,
          screenshot,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('充值申请已提交，请等待管理员审核，审核通过后积分会自动到账');
        setShowRecharge(false);
        setScreenshot('');
      } else {
        alert(data.error || '提交失败');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">账户信息</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">用户ID</span>
            <span className="font-mono text-sm">{userId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">当前积分</span>
            <span className="text-2xl font-bold text-indigo-600">⭐ {points}</span>
          </div>
        </div>

        <button
          onClick={() => setShowRecharge(true)}
          className="mt-4 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          充值积分
        </button>
      </div>

      {showRecharge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">充值积分</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择充值金额</label>
              <div className="grid grid-cols-2 gap-2">
                {RECHARGE_OPTIONS.map(option => (
                  <button
                    key={option.amount}
                    onClick={() => setSelectedOption(option)}
                    className={`p-3 border rounded-lg text-center ${
                      selectedOption.amount === option.amount
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">付款码</label>
              <div className="text-center">
                <img 
                  src={PAYMENT_QRCODE} 
                  alt="付款码" 
                  className="w-48 h-48 mx-auto border rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/200/200?text=请上传您的收款码';
                  }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  请扫码支付 {selectedOption.amount} 元
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">上传付款截图</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {screenshot && (
                <img 
                  src={screenshot} 
                  alt="付款截图" 
                  className="mt-2 w-full rounded-lg"
                />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRecharge(false);
                  setScreenshot('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleRecharge}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '提交中...' : '提交审核'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">使用说明</h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• 积分可以用来调用AI模型，不同模型价格不同</li>
          <li>• 充值后需要管理员审核，审核通过后积分会自动到账</li>
          <li>• 积分永久有效，不会过期</li>
          <li>• 如有问题请联系管理员</li>
        </ul>
      </div>
    </div>
  );
}
