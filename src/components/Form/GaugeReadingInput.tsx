import React from 'react';
import { GaugePosition, POSITION_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface GaugeReadingInputProps {
  position: GaugePosition;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  warning?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

export const GaugeReadingInput: React.FC<GaugeReadingInputProps> = ({
  position,
  value,
  onChange,
  error,
  warning,
  disabled,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(null);
    } else {
      const num = parseFloat(val);
      onChange(isNaN(num) ? null : num);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(null);
    } else {
      const num = parseFloat(val);
      onChange(isNaN(num) ? null : Number(num.toFixed(3)));
    }
  };

  const label = POSITION_LABELS[position];
  const hasError = !!error;

  return (
    <div className="flex flex-col" {...props}>
      <label className="gauge-reading-label">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="0.001"
          min="0"
          max="30"
          value={value !== null ? value : ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            'input-field gauge-reading-input',
            hasError && 'input-field-error',
            warning && !hasError && 'input-field-warning',
            disabled && 'bg-gray-50 cursor-not-allowed'
          )}
          placeholder="0.000"
        />
      </div>
      <div className="gauge-reading-unit">米 (m)</div>
      {hasError && (
        <p className="text-xs text-danger-500 mt-1 text-center animate-shake" key={error}>
          {error}
        </p>
      )}
    </div>
  );
};
