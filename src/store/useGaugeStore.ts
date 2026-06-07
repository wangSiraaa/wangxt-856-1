import { create } from 'zustand';
import { WaterGaugeRecord, GaugePosition, PhotoInfo, CorrectionResult } from '../types';
import { createEmptyRecord, generateId } from '../utils/mock';
import { calculateAll } from '../utils/calculation';

interface GaugeState {
  currentRecord: WaterGaugeRecord | null;
  correctionResult: CorrectionResult | null;
  isCalculated: boolean;
  reviewConfirmed: boolean;
  initNewRecord: (operatorName: string) => void;
  setRecordField: <K extends keyof WaterGaugeRecord>(
    field: K,
    value: WaterGaugeRecord[K]
  ) => void;
  setBasicInfo: (field: 'vesselName' | 'voyageNo' | 'shipAgent' | 'waterDensity', value: string | number) => void;
  setGaugeReading: (position: GaugePosition, value: number | null) => void;
  setPhoto: (photo: PhotoInfo) => void;
  removePhoto: (position: GaugePosition) => void;
  calculate: () => CorrectionResult | null;
  submit: () => boolean;
  confirmReview: () => void;
  clearRecord: () => void;
  reset: () => void;
  loadRecord: (record: WaterGaugeRecord) => void;
}

export const useGaugeStore = create<GaugeState>((set, get) => ({
  currentRecord: null,
  correctionResult: null,
  isCalculated: false,
  reviewConfirmed: false,

  initNewRecord: (operatorName: string) => {
    set({
      currentRecord: createEmptyRecord(operatorName),
      correctionResult: null,
      isCalculated: false,
      reviewConfirmed: false,
    });
  },

  reset: () => {
    set({
      currentRecord: null,
      correctionResult: null,
      isCalculated: false,
      reviewConfirmed: false,
    });
  },

  setBasicInfo: (field, value) => {
    const { currentRecord } = get();
    if (!currentRecord) return;
    set({
      currentRecord: {
        ...currentRecord,
        [field]: value,
        updatedAt: new Date().toISOString(),
      },
      isCalculated: false,
      correctionResult: null,
    });
  },

  setRecordField: <K extends keyof WaterGaugeRecord>(
    field: K,
    value: WaterGaugeRecord[K]
  ) => {
    const { currentRecord } = get();
    if (!currentRecord) return;
    set({
      currentRecord: {
        ...currentRecord,
        [field]: value,
        updatedAt: new Date().toISOString(),
      },
      isCalculated: false,
      correctionResult: null,
    });
  },

  setGaugeReading: (position: GaugePosition, value: number | null) => {
    const { currentRecord } = get();
    if (!currentRecord) return;
    set({
      currentRecord: {
        ...currentRecord,
        [position]: value,
        updatedAt: new Date().toISOString(),
      },
      isCalculated: false,
      correctionResult: null,
    });
  },

  setPhoto: (photo: PhotoInfo) => {
    const { currentRecord } = get();
    if (!currentRecord) return;
    const existingIndex = currentRecord.photos.findIndex(p => p.position === photo.position);
    let newPhotos: PhotoInfo[];
    if (existingIndex >= 0) {
      newPhotos = [...currentRecord.photos];
      newPhotos[existingIndex] = photo;
    } else {
      newPhotos = [...currentRecord.photos, photo];
    }
    set({
      currentRecord: {
        ...currentRecord,
        photos: newPhotos,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  removePhoto: (position: GaugePosition) => {
    const { currentRecord } = get();
    if (!currentRecord) return;
    set({
      currentRecord: {
        ...currentRecord,
        photos: currentRecord.photos.filter(p => p.position !== position),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  calculate: () => {
    const { currentRecord } = get();
    if (!currentRecord) return null;
    const result = calculateAll(currentRecord);
    set({
      correctionResult: result,
      isCalculated: true,
      currentRecord: {
        ...currentRecord,
        correction: result,
        displacement: result.finalDisplacement,
        updatedAt: new Date().toISOString(),
      },
    });
    return result;
  },

  submit: () => {
    const { currentRecord, isCalculated } = get();
    if (!currentRecord || !isCalculated) return false;
    const savedRecords = JSON.parse(localStorage.getItem('water_gauge_records') || '[]');
    const existingIndex = savedRecords.findIndex((r: WaterGaugeRecord) => r.id === currentRecord.id);
    const recordToSave = { ...currentRecord, status: 'confirmed' as const };
    if (existingIndex >= 0) {
      savedRecords[existingIndex] = recordToSave;
    } else {
      savedRecords.push(recordToSave);
    }
    localStorage.setItem('water_gauge_records', JSON.stringify(savedRecords));
    set({
      currentRecord: recordToSave,
    });
    return true;
  },

  confirmReview: () => {
    const { currentRecord } = get();
    if (!currentRecord) return;
    set({
      reviewConfirmed: true,
      currentRecord: {
        ...currentRecord,
        reviewNote: '已复核确认异常数据',
        updatedAt: new Date().toISOString(),
      },
    });
  },

  clearRecord: () => {
    set({
      currentRecord: null,
      correctionResult: null,
      isCalculated: false,
    });
  },

  loadRecord: (record: WaterGaugeRecord) => {
    set({
      currentRecord: { ...record },
      correctionResult: record.correction || null,
      isCalculated: !!record.correction,
    });
  },
}));
