import React, { forwardRef } from 'react';
import { WaterGaugeRecord, POSITION_LABELS, STATUS_LABELS } from '../../types';
import { formatReading } from '../../utils/validation';
import { formatDisplacement } from '../../utils/calculation';

interface PrintTemplateProps {
  record: WaterGaugeRecord;
}

export const PrintTemplate = forwardRef<HTMLDivElement, PrintTemplateProps>(
  ({ record }, ref) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const frontAvg = record.frontLeft !== null && record.frontRight !== null
      ? ((record.frontLeft + record.frontRight) / 2).toFixed(3)
      : '--';
    const midAvg = record.midLeft !== null && record.midRight !== null
      ? ((record.midLeft + record.midRight) / 2).toFixed(3)
      : '--';
    const aftAvg = record.aftLeft !== null && record.aftRight !== null
      ? ((record.aftLeft + record.aftRight) / 2).toFixed(3)
      : '--';

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">船舶水尺计量单</h1>
          <p className="text-sm text-gray-500">VESSEL DRAFT SURVEY REPORT</p>
        </div>

        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="text-gray-600 w-24">船名：</span>
              <span className="font-semibold">{record.vesselName || '-'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-24">航次：</span>
              <span className="font-semibold">{record.voyageNo || '-'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-24">作业号：</span>
              <span className="font-semibold font-mono">{record.operationNo}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-24">状态：</span>
              <span className={`font-semibold ${
                record.status === 'audited' ? 'text-green-600' :
                record.status === 'confirmed' ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {STATUS_LABELS[record.status]}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-24">计量员：</span>
              <span className="font-semibold">{record.operator || '-'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-24">船代：</span>
              <span className="font-semibold">{record.shipAgent || '-'}</span>
            </div>
            <div className="flex items-center col-span-2">
              <span className="text-gray-600 w-24">作业时间：</span>
              <span className="font-semibold">{formatDate(record.operateTime)}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            一、水尺读数
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-4 py-2 text-left text-sm font-semibold">位置</th>
                <th className="border border-gray-400 px-4 py-2 text-center text-sm font-semibold">左舷 (m)</th>
                <th className="border border-gray-400 px-4 py-2 text-center text-sm font-semibold">右舷 (m)</th>
                <th className="border border-gray-400 px-4 py-2 text-center text-sm font-semibold">平均 (m)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">前部 (F)</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono">{formatReading(record.frontLeft)}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono">{formatReading(record.frontRight)}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono font-semibold">{frontAvg}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-400 px-4 py-2 font-medium">中部 (M)</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono">{formatReading(record.midLeft)}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono">{formatReading(record.midRight)}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono font-semibold">{midAvg}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">后部 (A)</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono">{formatReading(record.aftLeft)}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono">{formatReading(record.aftRight)}</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono font-semibold">{aftAvg}</td>
              </tr>
              <tr className="bg-primary-50 font-bold">
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>平均吃水 (Mean Draft)</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-mono text-primary-700">
                  {record.correction ? record.correction.meanDraft.toFixed(3) : '--'} m
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            二、排水量计算
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">港水密度</p>
              <p className="text-xl font-mono font-bold text-gray-800">
                {record.waterDensity.toFixed(3)} t/m³
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">纵倾值 (Trim)</p>
              <p className="text-xl font-mono font-bold text-gray-800">
                {record.correction ? record.correction.trim.toFixed(3) : '--'} m
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">标准排水量</p>
              <p className="text-xl font-mono font-bold text-gray-800">
                {record.correction ? formatDisplacement(record.correction.displacement) : '--'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">纵倾修正</p>
              <p className="text-xl font-mono font-bold text-gray-800">
                {record.correction
                  ? `${record.correction.trimCorrection >= 0 ? '+' : ''}${record.correction.trimCorrection.toFixed(2)} t`
                  : '--'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">密度修正</p>
              <p className="text-xl font-mono font-bold text-gray-800">
                {record.correction
                  ? `${record.correction.densityCorrection >= 0 ? '+' : ''}${record.correction.densityCorrection.toFixed(2)} t`
                  : '--'}
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
              <p className="text-sm text-primary-700 mb-1 font-semibold">最终排水量</p>
              <p className="text-2xl font-mono font-bold text-primary-700">
                {record.correction ? formatDisplacement(record.correction.finalDisplacement) : '--'}
              </p>
            </div>
          </div>
        </div>

        {record.reviewNote && (
          <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm font-semibold text-warning-700 mb-1">复核备注</p>
            <p className="text-sm text-warning-800">{record.reviewNote}</p>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-20 border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">计量员签字</p>
            </div>
            <div className="text-center">
              <div className="h-20 border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">船代签字</p>
            </div>
            <div className="text-center">
              <div className="h-20 border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">调度签字</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
          <p>本计量单由水尺计量系统自动生成</p>
          <p>打印时间：{new Date().toLocaleString('zh-CN')}</p>
        </div>
      </div>
    );
  }
);

PrintTemplate.displayName = 'PrintTemplate';
