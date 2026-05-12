'use client';

import { useState, useEffect } from 'react';
import type { RechargeRequest } from '@/lib/db';

export default function AdminPage() {
  const [userId, setUserId] = useState('');
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取用户ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      // 获取充值列表
      fetch(`/api/admin/recharges?userId=${storedUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data.recharges) {
            setRecharges(data.recharges);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const handleApprove = async (rechargeId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          rechargeId,
          action: 'approve',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('审核通过，积分已发放');
        // 刷新列表
        window.location.reload();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleReject = async (rechargeId: string) => {
    if (!confirm('确定要拒绝这个充值申请吗？')) return;

    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          rechargeId,
          action: 'reject',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('已拒绝');
        // 刷新列表
        window.location.reload();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const pendingRecharges = recharges.filter(r => r.status === 'pending');
  const processedRecharges = recharges.filter(r => r.status !== 'pending');

  // 如果不是管理员，显示无权访问
  if (userId !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold text-red-700">无权访问</h1>
          <p className="text-red-600 mt-2">您不是管理员，无法访问此页面</p>
          <p className="text-sm text-red-500 mt-4">
            要成为管理员，请将您的用户ID设置为 "admin"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理后台</h1>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">待审核充值 ({pendingRecharges.length})</h2>
        
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : pendingRecharges.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            暂无待审核的充值申请
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRecharges.map(recharge => (
              <div key={recharge.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">用户ID: <span className="font-mono">{recharge.userId}</span></p>
                    <p className="text-sm text-gray-500">金额: {recharge.amount} 元 / {recharge.points} 积分</p>
                    <p className="text-sm text-gray-500">时间: {new Date(recharge.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(recharge.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => handleReject(recharge.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">付款截图:</p>
                  <img 
                    src={recharge.screenshot} 
                    alt="付款截图" 
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">已处理记录</h2>
        
        {processedRecharges.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            暂无处理记录
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedRecharges.slice(0, 20).map(recharge => (
                  <tr key={recharge.id}>
                    <td className="px-4 py-3 text-sm font-mono">{recharge.userId}</td>
                    <td className="px-4 py-3 text-sm">{recharge.amount}元/{recharge.points}积分</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        recharge.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {recharge.status === 'approved' ? '已通过' : '已拒绝'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(recharge.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
