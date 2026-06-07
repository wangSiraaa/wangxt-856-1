import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Trash2, FileText, BarChart3, Calendar, Ship, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useGaugeStore } from '../../store/useGaugeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { WaterGaugeRecord, STATUS_LABELS, ROLE_LABELS } from '../../types';
import { formatDisplacement } from '../../utils/calculation';
import { cn } from '../../lib/utils';

export const HistoryCompare: React.FC = () => {
  const navigate = useNavigate();
  const { records, removeRecord } = useHistoryStore();
  const { loadRecord } = useGaugeStore();
  const { hasRole } = useAuthStore();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = !searchKeyword ||
        r.vesselName?.includes(searchKeyword) ||
        r.voyageNo?.includes(searchKeyword) ||
        r.operationNo.includes(searchKeyword);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.operateTime).getTime() - new Date(a.operateTime).getTime());
  }, [records, searchKeyword, statusFilter]);

  const chartData = useMemo(() => {
    if (selectedIds.length === 0) {
      return records.slice(0, 10).map(r => ({
        name: r.operationNo.slice(-4),
        date: new Date(r.operateTime).toLocaleDateString(),
        排水量: r.correction?.finalDisplacement || 0,
        平均吃水: r.correction?.meanDraft || 0,
      }));
    }
    return selectedIds.map(id => {
      const r = records.find(x => x.id === id);
      if (!r) return null;
      return {
        name: r.operationNo.slice(-4),
        date: new Date(r.operateTime).toLocaleDateString(),
        排水量: r.correction?.finalDisplacement || 0,
        平均吃水: r.correction?.meanDraft || 0,
      };
    }).filter(Boolean);
  }, [records, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id].slice(-5)
    );
  };

  const handleView = (record: WaterGaugeRecord) => {
    loadRecord(record);
    navigate('/calculate', { state: { fromHistory: true } });
  };

  const handlePrint = (record: WaterGaugeRecord) => {
    navigate(`/print/${record.id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      removeRecord(id);
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    confirmed: 'bg-primary-100 text-primary-700',
    audited: 'bg-success-100 text-success-700',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{records.length}</p>
              <p className="text-sm text-gray-500">总记录数</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{records.filter(r => r.status === 'audited').length}</p>
              <p className="text-sm text-gray-500">已审核</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {records.filter(r => {
                  const today = new Date().toDateString();
                  return new Date(r.operateTime).toDateString() === today;
                }).length}
              </p>
              <p className="text-sm text-gray-500">今日作业</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
              <Ship className="w-6 h-6 text-info-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(records.map(r => r.vesselName).filter(Boolean)).size}
              </p>
              <p className="text-sm text-gray-500">作业船舶</p>
            </div>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-800">
                历史数据对比 ({selectedIds.length}/5 条)
              </h2>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              清除选择
            </button>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#1e3a5f" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="排水量"
                    stroke="#1e3a5f"
                    strokeWidth={2}
                    dot={{ fill: '#1e3a5f', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="平均吃水"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ fill: '#059669', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-bold text-gray-800">历史记录</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
                placeholder="搜索船名、航次、作业号"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="all">全部状态</option>
              <option value="draft">草稿</option>
              <option value="confirmed">已确认</option>
              <option value="audited">已审核</option>
            </select>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="card-body p-0">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">暂无记录</p>
              <p className="text-sm">请先创建水尺计量记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">
                      <span className="sr-only">对比</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">作业号</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">船名</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">航次</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">作业时间</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">排水量</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">计量员</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        selectedIds.includes(record.id) && 'bg-primary-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleSelect(record.id)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-800">{record.operationNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{record.vesselName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.voyageNo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(record.operateTime)}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-primary-600">
                        {record.correction ? formatDisplacement(record.correction.finalDisplacement) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[record.status])}>
                          {STATUS_LABELS[record.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{record.operator || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleView(record)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(record)}
                            className="p-1.5 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded transition-colors"
                            title="打印"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {hasRole('dispatcher') && record.status !== 'audited' && (
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedIds.length > 1 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-bold text-gray-800">详细对比</h2>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">项目</th>
                    {selectedIds.map(id => {
                      const r = records.find(x => x.id === id);
                      return (
                        <th key={id} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                          {r?.operationNo.slice(-6)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">船名</td>
                    {selectedIds.map(id => {
                      const r = records.find(x => x.id === id);
                      return <td key={id} className="px-4 py-3 text-sm text-center font-medium">{r?.vesselName}</td>;
                    })}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">前左</td>
                    {selectedIds.map(id => {
                      const r = records.find(x => x.id === id);
                      return <td key={id} className="px-4 py-3 text-sm text-center font-mono">{r?.frontLeft?.toFixed(3)}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">前右</td>
                    {selectedIds.map(id => {
                      const r = records.find(x => x.id === id);
                      return <td key={id} className="px-4 py-3 text-sm text-center font-mono">{r?.frontRight?.toFixed(3)}</td>;
                    })}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">后左</td>
                    {selectedIds.map(id => {
                      const r = records.find(x => x.id === id);
                      return <td key={id} className="px-4 py-3 text-sm text-center font-mono">{r?.aftLeft?.toFixed(3)}</td>;
                    })}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-600">后右</td>
                    {selectedIds.map(id => {
                      const r = records.find(x => x.id === id);
                      return <td key={id} className="px-4 py-3 text-sm text-center font-mono">{r?.aftRight?.toFixed(3)}</td>;
                    })}
                  </tr>
                  <tr className="bg-primary-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-primary-700">最终排水量</td>
                    {selectedIds.map(id => {
                      const r = records.find(x => x.id === id);
                      return (
                        <td key={id} className="px-4 py-3 text-sm text-center font-mono text-primary-700">
                          {r?.correction ? formatDisplacement(r.correction.finalDisplacement) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
