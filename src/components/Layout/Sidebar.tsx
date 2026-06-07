import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Ruler,
  Calculator,
  History,
  CheckCircle,
  LayoutDashboard,
  Anchor,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getRoleRoutes } from '../../utils/mock';
import { ROLE_LABELS } from '../../types';
import { cn } from '../../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  ruler: Ruler,
  calculator: Calculator,
  history: History,
  'check-circle': CheckCircle,
  'layout-dashboard': LayoutDashboard,
};

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuthStore();
  const location = useLocation();

  if (!currentUser) return null;

  const routes = getRoleRoutes(currentUser.role);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen no-print">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">水尺计量系统</h1>
            <p className="text-xs text-gray-500">Water Gauge System</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 text-sm truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500">
              {ROLE_LABELS[currentUser.role]}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
          功能菜单
        </p>
        {routes.map((route) => {
          const Icon = iconMap[route.icon] || Ruler;
          const isActive = location.pathname === route.path;

          return (
            <NavLink
              key={route.path}
              to={route.path}
              className={cn(
                'nav-menu-item',
                isActive && 'nav-menu-item-active'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{route.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4">
          <p className="text-xs text-primary-700 font-medium mb-1">
            系统状态
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse-slow" />
            服务正常运行中
          </p>
        </div>
      </div>
    </aside>
  );
};
