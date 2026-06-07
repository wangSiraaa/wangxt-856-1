import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Calendar, Calculator, FileText, AlertTriangle } from 'lucide-react';
import { StepIndicator } from '../../components/Form/StepIndicator';
import { GaugeReadingInput } from '../../components/Form/GaugeReadingInput';
import { PhotoUpload } from '../../components/PhotoUpload/PhotoUpload';
import { AlertBanner } from '../../components/Form/AlertBanner';
import { useAuthStore } from '../../store/useAuthStore';
import { useGaugeStore } from '../../store/useGaugeStore';
import { validateGaugeReadings, canCalculate } from '../../utils/validation';
import { GaugePosition, POSITION_LABELS } from '../../types';
import { cn } from '../../lib/utils';

const STEPS = ['基本信息', '读数录入', '照片上传', '计算复核'];
const POSITIONS: GaugePosition[] = ['frontLeft', 'frontRight', 'midLeft', 'midRight', 'aftLeft', 'aftRight'];

export const ReadingEntry: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { currentRecord, initNewRecord, setGaugeReading, setBasicInfo, setPhoto, removePhoto, reset } = useGaugeStore();

  useEffect(() => {
    if (currentUser && !currentRecord) {
      initNewRecord(currentUser.name);
    }
  }, [currentUser, currentRecord, initNewRecord]);

  const validation = useMemo(() => {
    if (!currentRecord) return null;
    return validateGaugeReadings(currentRecord);
  }, [currentRecord]);

  const canProceedToCalculate = useMemo(() => {
    if (!currentRecord) return false;
    return canCalculate(currentRecord);
  }, [currentRecord]);

  const getPositionError = (position: GaugePosition): string | undefined => {
    if (!validation) return undefined;
    const label = POSITION_LABELS[position];
    return validation.errors.find(e => e.includes(label));
  };

  const handleNext = () => {
    if (canProceedToCalculate) {
      navigate('/calculate');
    }
  };

  if (!currentRecord) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="card">
        <div className="card-header">
          <StepIndicator steps={STEPS} currentStep={1} className="no-print" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Ship className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">基本信息</h2>
              <p className="text-sm text-gray-500">填写船舶基本信息</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                船名 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={currentRecord.vesselName || ''}
                onChange={(e) => setBasicInfo('vesselName', e.target.value)}
                className="input-field"
                placeholder="请输入船名"
                data-testid="vessel-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                航次 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={currentRecord.voyageNo || ''}
                onChange={(e) => setBasicInfo('voyageNo', e.target.value)}
                className="input-field"
                placeholder="请输入航次"
                data-testid="voyage-no-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作业号
              </label>
              <div className="input-field bg-gray-50 font-mono text-gray-500">
                {currentRecord.operationNo}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作业时间
              </label>
              <div className="input-field bg-gray-50 flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(currentRecord.operateTime).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                港水密度 (t/m³) <span className="text-danger-500">*</span>
              </label>
              <input
                type="number"
                step="0.001"
                min="1.000"
                max="1.030"
                value={currentRecord.waterDensity}
                onChange={(e) => setBasicInfo('waterDensity', parseFloat(e.target.value) || 1.025)}
                className="input-field font-mono"
                data-testid="water-density-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                计量员
              </label>
              <div className="input-field bg-gray-50 text-gray-500">
                {currentUser?.name || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">水尺读数</h2>
              <p className="text-sm text-gray-500">依次录入船舶六面水尺读数（单位：米）</p>
            </div>
            {!canProceedToCalculate && (
              <div className="flex items-center gap-2 text-sm text-warning-600 bg-warning-50 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>请填写全部6个水尺读数</span>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {validation && validation.errors.length > 0 && (
            <AlertBanner
              type="error"
              message={validation.errors[0]}
              className="mb-6"
              data-testid="reading-error-banner"
            />
          )}
          {validation && validation.warnings.length > 0 && (
            <AlertBanner
              type="warning"
              message={validation.warnings[0]}
              className="mb-6"
              data-testid="reading-warning-banner"
            />
          )}

          <div className="space-y-8">
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                前部水尺 (Forward)
              </h3>
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <GaugeReadingInput
                  position="frontLeft"
                  value={currentRecord.frontLeft}
                  onChange={(v) => setGaugeReading('frontLeft', v)}
                  error={getPositionError('frontLeft')}
                  data-testid="gauge-frontLeft"
                />
                <GaugeReadingInput
                  position="frontRight"
                  value={currentRecord.frontRight}
                  onChange={(v) => setGaugeReading('frontRight', v)}
                  error={getPositionError('frontRight')}
                  data-testid="gauge-frontRight"
                />
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                中部水尺 (Midship)
              </h3>
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <GaugeReadingInput
                  position="midLeft"
                  value={currentRecord.midLeft}
                  onChange={(v) => setGaugeReading('midLeft', v)}
                  error={getPositionError('midLeft')}
                  data-testid="gauge-midLeft"
                />
                <GaugeReadingInput
                  position="midRight"
                  value={currentRecord.midRight}
                  onChange={(v) => setGaugeReading('midRight', v)}
                  error={getPositionError('midRight')}
                  data-testid="gauge-midRight"
                />
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
                后部水尺 (Aft)
              </h3>
              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <GaugeReadingInput
                  position="aftLeft"
                  value={currentRecord.aftLeft}
                  onChange={(v) => setGaugeReading('aftLeft', v)}
                  error={getPositionError('aftLeft')}
                  data-testid="gauge-aftLeft"
                />
                <GaugeReadingInput
                  position="aftRight"
                  value={currentRecord.aftRight}
                  onChange={(v) => setGaugeReading('aftRight', v)}
                  error={getPositionError('aftRight')}
                  data-testid="gauge-aftRight"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">现场照片</h2>
              <p className="text-sm text-gray-500">上传各位置水尺照片存档备查</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POSITIONS.map((position) => (
              <PhotoUpload
                key={position}
                position={position}
                photo={currentRecord.photos.find(p => p.position === position)}
                onUpload={(photo) => setPhoto(photo)}
                onRemove={() => removePhoto(position)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => reset()}
          className="btn-secondary"
        >
          重置
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceedToCalculate}
          className={cn(
            'btn-primary',
            !canProceedToCalculate && 'opacity-50 cursor-not-allowed'
          )}
          data-testid="to-calculate-btn"
        >
          <Calculator className="w-4 h-4 inline mr-2" />
          进入计算
        </button>
      </div>
    </div>
  );
};
