import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  ChevronDown,
  Search,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { ROLE_LABELS } from '../../types';
import { cn } from '../../lib/utils';

export const Header: React.FC<{ title?: string }> = ({ title }) => {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 no-print">
      <div className="flex items-center gap-4">
        {title && (
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        )}
        <span className="text-sm text-gray-500">{formatDate()}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索作业号、船名..."
            className="pl-9 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                     transition-all"
          />
        </div>

        <button className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2" />

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">
                {currentUser?.name.charAt(0)}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser && ROLE_LABELS[currentUser.role]}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                showDropdown && 'rotate-180'
              )}
            />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-800">{currentUser?.name}</p>
                  <p className="text-sm text-gray-500">{currentUser?.username}</p>
                  <p className="text-xs text-primary-600 mt-1">
                    {currentUser && ROLE_LABELS[currentUser.role]}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
