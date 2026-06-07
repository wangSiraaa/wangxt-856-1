import { WaterGaugeRecord, ValidationResult, GAUGE_POSITIONS, POSITION_LABELS } from '../types';

const MIN_READING = 0;
const MAX_READING = 30;
const FRONT_AFT_DIFF_THRESHOLD = 0.3;
const LEFT_RIGHT_DIFF_THRESHOLD = 0.1;

export function validateGaugeReadings(record: Partial<WaterGaugeRecord>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let needsReview = false;
  let reviewMessage = '';

  const readings = [
    { key: 'frontLeft', value: record.frontLeft },
    { key: 'frontRight', value: record.frontRight },
    { key: 'midLeft', value: record.midLeft },
    { key: 'midRight', value: record.midRight },
    { key: 'aftLeft', value: record.aftLeft },
    { key: 'aftRight', value: record.aftRight },
  ];

  for (const reading of readings) {
    if (reading.value === null || reading.value === undefined || isNaN(reading.value)) {
      errors.push(`${POSITION_LABELS[reading.key as keyof typeof POSITION_LABELS]}读数不能为空`);
      continue;
    }
    if (reading.value < MIN_READING || reading.value > MAX_READING) {
      errors.push(`${POSITION_LABELS[reading.key as keyof typeof POSITION_LABELS]}读数必须在 ${MIN_READING}-${MAX_READING} 米范围内`);
    }
  }

  if (errors.length === 0) {
    const frontAvg = ((record.frontLeft || 0) + (record.frontRight || 0)) / 2;
    const aftAvg = ((record.aftLeft || 0) + (record.aftRight || 0)) / 2;
    const frontAftDiff = Math.abs(aftAvg - frontAvg);

    if (frontAftDiff > FRONT_AFT_DIFF_THRESHOLD) {
      needsReview = true;
      reviewMessage = `前后水尺差异过大：前平均 ${frontAvg.toFixed(3)}m，后平均 ${aftAvg.toFixed(3)}m，差异 ${frontAftDiff.toFixed(3)}m，超过阈值 ${FRONT_AFT_DIFF_THRESHOLD}m。请确认数据是否正确。`;
      warnings.push(reviewMessage);
    }

    const sections = [
      { name: '前部', left: record.frontLeft, right: record.frontRight },
      { name: '中部', left: record.midLeft, right: record.midRight },
      { name: '后部', left: record.aftLeft, right: record.aftRight },
    ];

    for (const section of sections) {
      const diff = Math.abs((section.left || 0) - (section.right || 0));
      if (diff > LEFT_RIGHT_DIFF_THRESHOLD) {
        warnings.push(`${section.name}左右水尺差异较大：${diff.toFixed(3)}m，请注意检查。`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    needsReview,
    reviewMessage: needsReview ? reviewMessage : undefined,
  };
}

export function canCalculate(record: Partial<WaterGaugeRecord>): boolean {
  const requiredFields: (keyof WaterGaugeRecord)[] = [
    'frontLeft',
    'frontRight',
    'midLeft',
    'midRight',
    'aftLeft',
    'aftRight',
  ];

  for (const field of requiredFields) {
    const value = record[field];
    if (value === null || value === undefined || isNaN(value as number)) {
      return false;
    }
    if ((value as number) < MIN_READING || (value as number) > MAX_READING) {
      return false;
    }
  }

  return true;
}

export function formatReading(value: number | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toFixed(3);
}
