import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, User, Lock, AlertCircle, Ship } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Role } from '../../types';
import { cn } from '../../lib/utils';
import { AlertBanner } from '../../components/Form/AlertBanner';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/reading');
      } else {
        setError('用户名或密码错误，请重试');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: Role) => {
    const accounts: Record<Role, { username: string; password: string }> = {
      'gauger': { username: 'gauger1', password: '123456' },
      'agent': { username: 'agent1', password: '123456' },
      'dispatcher': { username: 'dispatcher1', password: '123456' },
    };

    const acc = accounts[role];
    setUsername(acc.username);
    setPassword(acc.password);
    setLoading(true);

    try {
      const success = await login(acc.username, acc.password);
      if (success) {
        navigate('/reading');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute bottom-40 left-10 w-60 h-60 bg-white/5 rounded-full" />
            <div className="absolute bottom-10 right-20 w-20 h-20 bg-white/10 rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Anchor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">水尺计量系统</h1>
                <p className="text-primary-200 text-sm">Draft Survey System</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              码头水尺读数屏
            </h2>
            <p className="text-primary-200 text-lg leading-relaxed mb-8">
              专业的船舶水尺计量解决方案<br/>
              支持六面读数、自动计算、智能复核、历史追溯
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary-100">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">1</span>
                </div>
                <span>读数录入 - 六面水尺标准化录入</span>
              </div>
              <div className="flex items-center gap-3 text-primary-100">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">2</span>
                </div>
                <span>修正计算 - 自动计算排水量与修正</span>
              </div>
              <div className="flex items-center gap-3 text-primary-100">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">3</span>
                </div>
                <span>复核校验 - 异常数据智能提醒</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Ship className="w-12 h-12 text-white/60" />
            <div>
              <p className="text-white/80 text-sm">高效 · 精准 · 可追溯</p>
              <p className="text-primary-300 text-xs">© 2025 水尺计量系统</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Anchor className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">水尺计量系统</h1>
              <p className="text-gray-500 text-sm">Draft Survey System</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎登录</h2>
          <p className="text-gray-500 mb-8">请输入账号密码进入系统</p>

          {error && (
            <AlertBanner type="error" message={error} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="请输入用户名"
                  disabled={loading}
                  data-testid="username-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="请输入密码"
                  disabled={loading}
                  data-testid="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className={cn(
                'w-full btn-primary py-3 text-base',
                loading && 'opacity-70 cursor-not-allowed'
              )}
              data-testid="login-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </span>
              ) : (
                '登 录'
              )}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm text-gray-500 text-center mb-4">快速登录（测试账号）</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => quickLogin('gauger')}
                disabled={loading}
                className="btn-secondary text-sm py-2"
                data-testid="quick-login-gauger"
              >
                计量员
              </button>
              <button
                onClick={() => quickLogin('agent')}
                disabled={loading}
                className="btn-secondary text-sm py-2"
                data-testid="quick-login-agent"
              >
                船代
              </button>
              <button
                onClick={() => quickLogin('dispatcher')}
                disabled={loading}
                className="btn-secondary text-sm py-2"
                data-testid="quick-login-dispatcher"
              >
                调度
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              测试账号密码统一为: 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
