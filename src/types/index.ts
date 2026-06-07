export type UserRole = 'gauger' | 'agent' | 'dispatcher';
export type Role = UserRole;

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  department: string;
}

export type GaugePosition = 'frontLeft' | 'frontRight' | 'midLeft' | 'midRight' | 'aftLeft' | 'aftRight';

export interface PhotoInfo {
  position: GaugePosition;
  url: string;
  uploadedAt: string;
}

export type RecordStatus = 'draft' | 'confirmed' | 'audited';

export interface WaterGaugeRecord {
  id: string;
  vesselName: string;
  voyageNo: string;
  operationNo: string;
  operator: string;
  shipAgent: string;
  operateTime: string;
  frontLeft: number | null;
  frontRight: number | null;
  midLeft: number | null;
  midRight: number | null;
  aftLeft: number | null;
  aftRight: number | null;
  waterDensity: number;
  displacement?: number;
  correction?: CorrectionResult;
  status: RecordStatus;
  reviewNote?: string;
  photos: PhotoInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  needsReview: boolean;
  reviewMessage?: string;
}

export interface CalculationResult {
  meanDraft: number;
  trim: number;
  displacement: number;
}

export interface CorrectionResult {
  meanDraft: number;
  trim: number;
  displacement: number;
  trimCorrection: number;
  densityCorrection: number;
  finalDisplacement: number;
}

export interface GaugePositionConfig {
  key: GaugePosition;
  label: string;
  section: 'front' | 'mid' | 'aft';
  side: 'left' | 'right';
}

export const GAUGE_POSITIONS: GaugePositionConfig[] = [
  { key: 'frontLeft', label: '前左', section: 'front', side: 'left' },
  { key: 'frontRight', label: '前右', section: 'front', side: 'right' },
  { key: 'midLeft', label: '中左', section: 'mid', side: 'left' },
  { key: 'midRight', label: '中右', section: 'mid', side: 'right' },
  { key: 'aftLeft', label: '后左', section: 'aft', side: 'left' },
  { key: 'aftRight', label: '后右', section: 'aft', side: 'right' },
];

export const POSITION_LABELS: Record<GaugePosition, string> = {
  frontLeft: '前左',
  frontRight: '前右',
  midLeft: '中左',
  midRight: '中右',
  aftLeft: '后左',
  aftRight: '后右',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  gauger: '计量员',
  agent: '船代',
  dispatcher: '码头调度',
};

export const STATUS_LABELS: Record<RecordStatus, string> = {
  draft: '草稿',
  confirmed: '已确认',
  audited: '已审核',
};
