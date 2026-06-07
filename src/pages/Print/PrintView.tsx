import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PrintTemplate } from '../../components/PrintTemplate/PrintTemplate';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useGaugeStore } from '../../store/useGaugeStore';
import { cn } from '../../lib/utils';

export const PrintView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { records } = useHistoryStore();
  const { currentRecord } = useGaugeStore();
  const printRef = useRef<HTMLDivElement>(null);

  const [record, setRecord] = useState(currentRecord);

  useEffect(() => {
    if (!record && id) {
      const found = records.find(r => r.id === id);
      if (found) {
        setRecord(found);
      } else {
        navigate('/history');
      }
    }
  }, [record, id, records, navigate]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: record ? `水尺计量单_${record.operationNo}` : '水尺计量单',
    onAfterPrint: () => {
      console.log('Print completed');
    },
  });

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          返回
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="btn-primary"
            data-testid="print-btn"
          >
            <Printer className="w-4 h-4 inline mr-2" />
            打印计量单
          </button>
        </div>
      </div>

      {record.status !== 'draft' && (
        <div className="mb-4 no-print">
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success-600" />
            <div>
              <p className="font-semibold text-success-700">
                计量单已{record.status === 'confirmed' ? '确认' : '审核'}
              </p>
              <p className="text-sm text-success-600">
                作业号: {record.operationNo} | 时间: {new Date(record.operateTime).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PrintTemplate ref={printRef} record={record} />
      </div>

      <div className="mt-6 flex justify-center gap-4 no-print">
        <button
          onClick={() => navigate('/reading')}
          className="btn-secondary"
        >
          新建计量
        </button>
        <button
          onClick={handlePrint}
          className="btn-primary"
        >
          <Printer className="w-4 h-4 inline mr-2" />
          打印
        </button>
      </div>
    </div>
  );
};
