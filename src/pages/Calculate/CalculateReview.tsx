import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calculator, Save, ArrowLeft, Printer, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { StepIndicator } from '../../components/Form/StepIndicator';
import { AlertBanner } from '../../components/Form/AlertBanner';
import { DetailDrawer } from '../../components/DetailDrawer/DetailDrawer';
import { useGaugeStore } from '../../store/useGaugeStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { validateGaugeReadings, canCalculate, formatReading } from '../../utils/validation';
import { formatDisplacement } from '../../utils/calculation';
import { cn } from '../../lib/utils';

const STEPS = ['基本信息', '读数录入', '照片上传', '计算复核'];

export const CalculateReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRecord, calculate, submit, confirmReview, reset } = useGaugeStore();
  const { addRecord } = useHistoryStore();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [calculateTriggered, setCalculateTriggered] = useState(false);

  const fromHistory = location.state?.fromHistory === true;

  useEffect(() => {
    if (!currentRecord) {
      navigate('/reading');
    }
  }, [currentRecord, navigate]);

  const validation = useMemo(() => {
    if (!currentRecord) return null;
    return validateGaugeReadings(currentRecord);
  }, [currentRecord]);

  const needsReview = validation?.needsReview ?? false;
  const canSubmit = useMemo(() => {
    if (!currentRecord || !currentRecord.correction) return false;
    if (needsReview && !reviewConfirmed) return false;
    return currentRecord.vesselName?.trim().length > 0 && currentRecord.voyageNo?.trim().length > 0;
  }, [currentRecord, needsReview, reviewConfirmed]);

  useEffect(() => {
    if (calculateTriggered && needsReview && !reviewConfirmed) {
      setShowReviewModal(true);
    }
  }, [calculateTriggered, needsReview, reviewConfirmed]);

  const handleCalculate = () => {
    if (!currentRecord || !canCalculate(currentRecord)) return;
    calculate();
    setCalculateTriggered(true);
  };

  const handleConfirmReview = () => {
    confirmReview();
    setReviewConfirmed(true);
  };

  const handleSubmit = () => {
    if (!canSubmit || !currentRecord) return;
    const success = submit();
    if (success && currentRecord) {
      addRecord(currentRecord);
      navigate(`/print/${currentRecord.id}`);
    }
  };

  const handleBack = () => {
    if (fromHistory) {
      navigate('/history');
    } else {
      navigate('/reading');
    }
  };

  const handleNewRecord = () => {
    reset();
    navigate('/reading');
  };

  if (!currentRecord) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const frontAvg = currentRecord.frontLeft !== null && currentRecord.frontRight !== null
    ? ((currentRecord.frontLeft + currentRecord.frontRight) / 2).toFixed(3)
    : '--';
  const midAvg = currentRecord.midLeft !== null && currentRecord.midRight !== null
    ? ((currentRecord.midLeft + currentRecord.midRight) / 2).toFixed(3)
    : '--';
  const aftAvg = currentRecord.aftLeft !== null && currentRecord.aftRight !== null
    ? ((currentRecord.aftLeft + currentRecord.aftRight) / 2).toFixed(3)
    : '--';

  const frontAftDiff = currentRecord.frontLeft !== null && currentRecord.frontRight !== null &&
    currentRecord.aftLeft !== null && currentRecord.aftRight !== null
    ? Math.abs(
        ((currentRecord.aftLeft + currentRecord.aftRight) / 2) -
        ((currentRecord.frontLeft + currentRecord.frontRight) / 2)
      ).toFixed(3)
    : '--';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="card no-print">
        <div className="card-header">
          <StepIndicator steps={STEPS} currentStep={3} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">水尺读数汇总</h2>
                <p className="text-sm text-gray-500">六面水尺读数一览</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            {validation && validation.warnings.length > 0 && (
              <AlertBanner
                type="warning"
                message={validation.warnings[0]}
                className="mb-4"
                data-testid="reading-warning-banner"
              />
            )}
            {validation && validation.needsReview && (
              <AlertBanner
                type="warning"
                message={validation.reviewMessage || '数据存在异常，需要复核确认'}
                className="mb-4"
                data-testid="review-warning-banner"
              />
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">前部 (Forward)</h4>
                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">左舷</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{formatReading(currentRecord.frontLeft)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">右舷</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{formatReading(currentRecord.frontRight)}</p>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <p className="text-xs text-gray-500">平均</p>
                    <p className="text-lg font-mono font-bold text-primary-600">{frontAvg}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">中部 (Midship)</h4>
                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">左舷</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{formatReading(currentRecord.midLeft)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">右舷</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{formatReading(currentRecord.midRight)}</p>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <p className="text-xs text-gray-500">平均</p>
                    <p className="text-lg font-mono font-bold text-primary-600">{midAvg}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">后部 (Aft)</h4>
                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">左舷</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{formatReading(currentRecord.aftLeft)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">右舷</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{formatReading(currentRecord.aftRight)}</p>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <p className="text-xs text-gray-500">平均</p>
                    <p className="text-lg font-mono font-bold text-primary-600">{aftAvg}</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-700">前后水尺差异</p>
                    <p className={`text-2xl font-mono font-bold ${
                      parseFloat(frontAftDiff) > 0.3 ? 'text-danger-600' : 'text-primary-700'
                    }`}>
                      {frontAftDiff} m
                    </p>
                  </div>
                  {parseFloat(frontAftDiff) > 0.3 && (
                    <div className="flex items-center gap-1 text-danger-600 bg-danger-50 px-3 py-1.5 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">差异过大</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 no-print">
              {!currentRecord.correction ? (
                <button
                  onClick={handleCalculate}
                  disabled={!canCalculate(currentRecord)}
                  className={cn(
                    'w-full btn-primary py-3 text-lg',
                    !canCalculate(currentRecord) && 'opacity-50 cursor-not-allowed'
                  )}
                  data-testid="calculate-btn"
                >
                  <Calculator className="w-5 h-5 inline mr-2" />
                  开始计算
                </button>
              ) : (
                <button
                  onClick={handleCalculate}
                  className="w-full btn-secondary py-3"
                  data-testid="recalculate-btn"
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  重新计算
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">排水量计算结果</h2>
                <p className="text-sm text-gray-500">包含纵倾修正与密度修正</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            {!currentRecord.correction ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Calculator className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg">点击左侧"开始计算"按钮</p>
                <p className="text-sm">系统将自动计算排水量</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">平均吃水</p>
                    <p className="text-xl font-mono font-bold text-gray-800">
                      {currentRecord.correction.meanDraft.toFixed(3)} m
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">纵倾值</p>
                    <p className="text-xl font-mono font-bold text-gray-800">
                      {currentRecord.correction.trim.toFixed(3)} m
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">排水量修正</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">港水密度</span>
                      <span className="font-mono font-semibold">{currentRecord.waterDensity.toFixed(3)} t/m³</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">标准排水量</span>
                      <span className="font-mono font-semibold">
                        {formatDisplacement(currentRecord.correction.displacement)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">纵倾修正</span>
                      <span className={`font-mono font-semibold ${
                        currentRecord.correction.trimCorrection >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {currentRecord.correction.trimCorrection >= 0 ? '+' : ''}
                        {currentRecord.correction.trimCorrection.toFixed(2)} t
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">密度修正</span>
                      <span className={`font-mono font-semibold ${
                        currentRecord.correction.densityCorrection >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {currentRecord.correction.densityCorrection >= 0 ? '+' : ''}
                        {currentRecord.correction.densityCorrection.toFixed(2)} t
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white">
                  <p className="text-primary-100 text-sm mb-1">最终排水量</p>
                  <p className="text-3xl font-mono font-bold">
                    {formatDisplacement(currentRecord.correction.finalDisplacement)}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-primary-200 text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>计算完成</span>
                  </div>
                </div>

                {currentRecord.reviewNote && (
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-warning-700">复核备注</p>
                    <p className="text-sm text-warning-800">{currentRecord.reviewNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {currentRecord.status !== 'draft' && (
        <AlertBanner
          type="success"
          message={`该记录已${currentRecord.status === 'confirmed' ? '确认' : '审核'}，不可修改`}
          className="no-print"
        />
      )}

      <div className="flex items-center justify-between no-print">
        <button
          onClick={handleBack}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          返回修改
        </button>
        <div className="flex gap-3">
          {currentRecord.correction && (
            <button
              onClick={() => navigate(`/print/${currentRecord.id}`)}
              className="btn-secondary"
              data-testid="preview-print-btn"
            >
              <Printer className="w-4 h-4 inline mr-2" />
              预览打印
            </button>
          )}
          {canSubmit && currentRecord.status === 'draft' && (
            <button
              onClick={handleSubmit}
              className="btn-primary"
              data-testid="submit-btn"
            >
              <Save className="w-4 h-4 inline mr-2" />
              确认提交
            </button>
          )}
          {currentRecord.status !== 'draft' && (
            <button
              onClick={handleNewRecord}
              className="btn-primary"
            >
              新建记录
            </button>
          )}
        </div>
      </div>

      <DetailDrawer
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleConfirmReview}
        title="数据异常复核确认"
        message={validation?.reviewMessage || '检测到水尺读数存在异常，请仔细核对数据准确性。如确认数据无误，请点击"确认提交"继续。'}
        details={validation?.errors}
        type="warning"
        data-testid="review-modal"
      />
    </div>
  );
};
