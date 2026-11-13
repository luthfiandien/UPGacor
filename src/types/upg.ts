export type PageId =
  | 'dashboard'
  | 'mandiri'
  | 'monitoring'
  | 'satker'
  | 'rekap'
  | 'laporan';

export type QuarterStatus =
  | 'Belum Dimulai'
  | 'Dalam Proses'
  | 'Selesai'
  | 'Terkendala'
  | '—';

export type EvaluationStatus =
  | 'Belum Dievaluasi'
  | 'Dalam Proses'
  | 'Selesai';

export type ApplicabilityStatus =
  | 'Belum diisi'
  | 'Berlaku'
  | 'Tidak Berlaku';

export type JudicialEnvironment = 'Semua' | 'Umum' | 'Agama' | 'Militer' | 'TUN';

export interface Activity {
  code: string;
  name: string;
  weight: number;
  quarters: [QuarterStatus, QuarterStatus, QuarterStatus, QuarterStatus];
}

export interface ProgramGroup {
  code: string;
  name: string;
  items: string[];
}

export interface MonitoringDetail {
  status: QuarterStatus;
  target: string;
  actual: string;
  unit: string;
  note: string;
  issue: string;
  plan: string;
  evidence: string;
  owner: string;
}

export type MonitoringDetailsMap = Record<string, MonitoringDetail>;

export interface SelfScoreEntry {
  score: number | '';
  valid: ApplicabilityStatus;
  evidence: string;
  note: string;
}

export type SelfScoresMap = Record<string, SelfScoreEntry>;

export interface SatkerEvaluation {
  status: EvaluationStatus;
  score: number | '';
  note: string;
}

export type SatkerStateMap = Record<string, SatkerEvaluation>;

export interface SatkerItem {
  name: string;
  lingkungan: Exclude<JudicialEnvironment, 'Semua'>;
}
