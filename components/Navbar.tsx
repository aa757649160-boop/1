'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从本地存储获取用户ID，如果没有则生成一个
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);

    // 获取用户积分
    fetch(`/api/balance?userId=${storedUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.points !== undefined) {
          setPoints(data.points);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const navItems = [
    { href: '/', label: 'AI聊天', icon: '💬' },
    { href: '/image', label: '图片生成', icon: '🎨' },
    { href: '/profile', label: '个人中心', icon: '👤' },
  ];

  // 如果是管理员，显示管理入口
  if (userId === 'admin') {
    navItems.push({ href: '/admin', label: '管理后台', icon: '⚙️' });
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">AI平台</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {!loading && (
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ {points} 积分
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
