import React from 'react';
import { AlertTriangle, X, CheckCircle, FileWarning } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  details?: string[];
  type?: 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  'data-testid'?: string;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  type = 'warning',
  confirmText = '确认提交',
  cancelText = '返回修改',
  ...props
}) => {
  if (!isOpen) return null;

  const isError = type === 'error';

  return (
    <div className="drawer-overlay" onClick={onClose} {...props}>
      <div
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(
          'px-6 py-4 flex items-center gap-3 border-b',
          isError ? 'bg-danger-50 border-danger-100' : 'bg-warning-50 border-warning-100'
        )}>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
            isError ? 'bg-danger-100' : 'bg-warning-100'
          )}>
            <FileWarning className={cn('w-6 h-6', isError ? 'text-danger-600' : 'text-warning-600')} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'text-lg font-bold truncate',
              isError ? 'text-danger-700' : 'text-warning-700'
            )}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/50 rounded transition-colors flex-shrink-0"
            data-testid="drawer-close-btn"
          >
            <X className={cn('w-5 h-5', isError ? 'text-danger-500' : 'text-warning-500')} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className={cn('w-5 h-5 mt-0.5 flex-shrink-0', isError ? 'text-danger-500' : 'text-warning-500')} />
            <p className="text-gray-700 leading-relaxed">{message}</p>
          </div>

          {details && details.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">详细信息：</p>
              <ul className="space-y-1.5">
                {details.map((detail, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={cn(
            'flex items-center gap-2 p-3 rounded-lg',
            isError ? 'bg-danger-50 border border-danger-100' : 'bg-warning-50 border border-warning-100'
          )}>
            <AlertTriangle className={cn('w-4 h-4 flex-shrink-0', isError ? 'text-danger-500' : 'text-warning-500')} />
            <p className={cn('text-xs font-medium', isError ? 'text-danger-600' : 'text-warning-600')}>
              请仔细核对数据准确性。如确认无误，点击"确认提交"继续。
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="btn-secondary w-full sm:w-auto flex-1 sm:flex-none"
            data-testid="drawer-cancel-btn"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(isError ? 'btn-danger' : 'btn-warning', 'w-full sm:w-auto flex-1 sm:flex-none')}
            data-testid="review-confirm-btn"
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
