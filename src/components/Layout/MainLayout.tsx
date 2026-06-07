import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ROLE_LABELS } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { getRoleRoutes } from '../../utils/mock';

const pageTitles: Record<string, string> = {
  '/reading': '水尺读数录入',
  '/calculate': '计算复核',
  '/history': '历史对比',
  '/dashboard': '调度看板',
  '/print': '打印计量单',
};

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuthStore();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/print/')) {
      return '打印计量单';
    }
    return pageTitles[path] || '';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getPageTitle()} />
        <main className="flex-1 p-6 overflow-auto animate-slide-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
