import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type AlertType = 'error' | 'warning' | 'success';

interface AlertBannerProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  className?: string;
  'data-testid'?: string;
}

const icons: Record<AlertType, React.ElementType> = {
  error: XCircle,
  warning: AlertTriangle,
  success: CheckCircle,
};

const styles: Record<AlertType, string> = {
  error: 'alert-error',
  warning: 'alert-warning',
  success: 'alert-success',
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  onClose,
  className,
  ...props
}) => {
  const Icon = icons[type];
  const style = styles[type];

  return (
    <div
      className={cn(style, className, type === 'error' && 'animate-shake')}
      {...props}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/30 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
