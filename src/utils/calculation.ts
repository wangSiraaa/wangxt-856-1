import { WaterGaugeRecord, CorrectionResult, CalculationResult } from '../types';

const STANDARD_WATER_DENSITY = 1.025;

export function calculateMeanDraft(record: WaterGaugeRecord): number {
  const readings = [
    record.frontLeft,
    record.frontRight,
    record.midLeft,
    record.midRight,
    record.aftLeft,
    record.aftRight,
  ].filter((v): v is number => v !== null && v !== undefined && !isNaN(v));

  if (readings.length === 0) return 0;
  return readings.reduce((sum, v) => sum + v, 0) / readings.length;
}

export function calculateTrim(record: WaterGaugeRecord): number {
  const frontAvg = ((record.frontLeft || 0) + (record.frontRight || 0)) / 2;
  const aftAvg = ((record.aftLeft || 0) + (record.aftRight || 0)) / 2;
  return aftAvg - frontAvg;
}

export function calculateBasicDisplacement(meanDraft: number): number {
  const baseDisplacement = 10000;
  const displacementPerMeter = 2000;
  return baseDisplacement + meanDraft * displacementPerMeter;
}

export function calculateTrimCorrection(trim: number, meanDraft: number): number {
  const correctionFactor = 50;
  return trim * correctionFactor * (meanDraft > 10 ? 1.2 : 1);
}

export function calculateDensityCorrection(
  displacement: number,
  waterDensity: number
): number {
  return displacement * (waterDensity / STANDARD_WATER_DENSITY) - displacement;
}

export function calculateAll(record: WaterGaugeRecord): CorrectionResult {
  const meanDraft = calculateMeanDraft(record);
  const trim = calculateTrim(record);
  const displacement = calculateBasicDisplacement(meanDraft);
  const trimCorrection = calculateTrimCorrection(trim, meanDraft);
  const densityCorrection = calculateDensityCorrection(displacement, record.waterDensity);
  const finalDisplacement = displacement + trimCorrection + densityCorrection;

  return {
    meanDraft: Number(meanDraft.toFixed(3)),
    trim: Number(trim.toFixed(3)),
    displacement: Number(displacement.toFixed(2)),
    trimCorrection: Number(trimCorrection.toFixed(2)),
    densityCorrection: Number(densityCorrection.toFixed(2)),
    finalDisplacement: Number(finalDisplacement.toFixed(2)),
  };
}

export function formatDisplacement(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(2) + ' 万吨';
  }
  return value.toFixed(2) + ' 吨';
}
