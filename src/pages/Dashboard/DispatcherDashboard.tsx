import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, Calendar, BarChart3, FileText, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDisplacement } from '../../utils/calculation';
import { STATUS_LABELS } from '../../types';

export const DispatcherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { records } = useHistoryStore();
  const { currentUser } = useAuthStore();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(r => new Date(r.operateTime).toDateString() === today);
    const confirmed = records.filter(r => r.status === 'confirmed');
    const audited = records.filter(r => r.status === 'audited');
    const draft = records.filter(r => r.status === 'draft');

    const totalDisplacement = records.reduce((sum, r) => {
      return sum + (r.correction?.finalDisplacement || 0);
    }, 0);

    const vessels = new Set(records.map(r => r.vesselName).filter(Boolean));

    return {
      total: records.length,
      today: todayRecords.length,
      confirmed: confirmed.length,
      audited: audited.length,
      draft: draft.length,
      totalDisplacement,
      vessels: vessels.size,
    };
  }, [records]);

  const statusData = useMemo(() => [
    { name: '已审核', value: stats.audited, color: '#059669' },
    { name: '已确认', value: stats.confirmed, color: '#1e3a5f' },
    { name: '草稿', value: stats.draft, color: '#9ca3af' },
  ], [stats]);

  const vesselData = useMemo(() => {
    const vesselMap = new Map<string, number>();
    records.forEach(r => {
      if (r.vesselName && r.correction) {
        const current = vesselMap.get(r.vesselName) || 0;
        vesselMap.set(r.vesselName, current + r.correction.finalDisplacement);
      }
    });
    return Array.from(vesselMap.entries())
      .map(([name, displacement]) => ({ name, 排水量: displacement }))
      .sort((a, b) => b.排水量 - a.排水量)
      .slice(0, 5);
  }, [records]);

  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.operateTime).getTime() - new Date(a.operateTime).getTime())
      .slice(0, 5);
  }, [records]);

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    confirmed: 'bg-primary-100 text-primary-700',
    audited: 'bg-success-100 text-success-700',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">调度看板</h1>
              <p className="text-sm text-gray-500">欢迎回来，{currentUser?.name} | {currentUser?.role && STATUS_LABELS[currentUser.role as keyof typeof STATUS_LABELS] || ''}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reading')}
            className="btn-primary"
          >
            新建计量
            <ArrowRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">今日作业</p>
              <p className="text-3xl font-bold text-gray-800">{stats.today}</p>
              <p className="text-xs text-success-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                正常
              </p>
            </div>
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总记录数</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1">累计计量</p>
            </div>
            <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">作业船舶</p>
              <p className="text-3xl font-bold text-gray-800">{stats.vessels}</p>
              <p className="text-xs text-gray-400 mt-1">艘次</p>
            </div>
            <div className="w-14 h-14 bg-info-100 rounded-xl flex items-center justify-center">
              <Ship className="w-7 h-7 text-info-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总排水量</p>
              <p className="text-2xl font-bold text-gray-800 font-mono">
                {formatDisplacement(stats.totalDisplacement)}
              </p>
              <p className="text-xs text-gray-400 mt-1">累计</p>
            </div>
            <div className="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-bold text-gray-800">状态分布</h2>
          </div>
          <div className="card-body">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-lg font-bold text-gray-800">船舶排水量排行 (Top 5)</h2>
          </div>
          <div className="card-body">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vesselData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatDisplacement(value), '排水量']}
                  />
                  <Bar dataKey="排水量" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-bold text-gray-800">待处理事项</h2>
            <span className="px-2 py-1 bg-danger-100 text-danger-600 rounded-full text-xs font-medium">
              {stats.draft} 条待审核
            </span>
          </div>
          <div className="card-body">
            {stats.draft === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无待处理事项</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.filter(r => r.status === 'draft').slice(0, 5).map(record => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      navigate('/history');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-warning-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{record.vesselName || '未命名船舶'}</p>
                        <p className="text-xs text-gray-500">{record.operationNo}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-bold text-gray-800">最近作业</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部
            </button>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-gray-100">
              {recentRecords.map(record => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/print/${record.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Ship className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{record.vesselName || '-'}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.operateTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-primary-600">
                      {record.correction ? formatDisplacement(record.correction.finalDisplacement) : '-'}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                      {STATUS_LABELS[record.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
