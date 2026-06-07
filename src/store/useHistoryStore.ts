import { create } from 'zustand';
import { WaterGaugeRecord } from '../types';
import { MOCK_HISTORY_RECORDS } from '../utils/mock';

interface HistoryState {
  records: WaterGaugeRecord[];
  selectedIds: string[];
  isLoading: boolean;
  fetchRecords: () => void;
  searchRecords: (keyword: string) => WaterGaugeRecord[];
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  getSelectedRecords: () => WaterGaugeRecord[];
  getRecordById: (id: string) => WaterGaugeRecord | undefined;
  saveRecord: (record: WaterGaugeRecord) => void;
  deleteRecord: (id: string) => void;
  addRecord: (record: WaterGaugeRecord) => void;
  removeRecord: (id: string) => void;
}

const STORAGE_KEY = 'water_gauge_records';

function loadRecords(): WaterGaugeRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load records from storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_HISTORY_RECORDS));
  return MOCK_HISTORY_RECORDS;
}

function saveRecords(records: WaterGaugeRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to storage', e);
  }
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  records: loadRecords(),
  selectedIds: [],
  isLoading: false,

  fetchRecords: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ records: loadRecords(), isLoading: false });
    }, 300);
  },

  searchRecords: (keyword: string) => {
    const { records } = get();
    if (!keyword.trim()) return records;
    const lowerKeyword = keyword.toLowerCase();
    return records.filter(
      r =>
        r.vesselName.toLowerCase().includes(lowerKeyword) ||
        r.voyageNo.toLowerCase().includes(lowerKeyword) ||
        r.operationNo.toLowerCase().includes(lowerKeyword)
    );
  },

  toggleSelect: (id: string) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter(i => i !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  selectAll: () => {
    const { records } = get();
    set({ selectedIds: records.map(r => r.id) });
  },

  getSelectedRecords: () => {
    const { records, selectedIds } = get();
    return records.filter(r => selectedIds.includes(r.id));
  },

  getRecordById: (id: string) => {
    const { records } = get();
    return records.find(r => r.id === id);
  },

  saveRecord: (record: WaterGaugeRecord) => {
    const { records } = get();
    const existingIndex = records.findIndex(r => r.id === record.id);
    let newRecords: WaterGaugeRecord[];
    if (existingIndex >= 0) {
      newRecords = [...records];
      newRecords[existingIndex] = record;
    } else {
      newRecords = [record, ...records];
    }
    set({ records: newRecords });
    saveRecords(newRecords);
  },

  deleteRecord: (id: string) => {
    const { records, selectedIds } = get();
    const newRecords = records.filter(r => r.id !== id);
    set({
      records: newRecords,
      selectedIds: selectedIds.filter(i => i !== id),
    });
    saveRecords(newRecords);
  },

  addRecord: (record: WaterGaugeRecord) => {
    get().saveRecord(record);
  },

  removeRecord: (id: string) => {
    get().deleteRecord(id);
  },
}));
