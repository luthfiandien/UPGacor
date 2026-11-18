export type PageId =
  | 'pengawasan-reguler'
  | 'audit-kinerja'
  | 'ppg-risiko'
  | 'ppg-dashboard'
  | 'ppg-monev';

export type UserRole =
  | 'Evaluator (UPG Tingkat 2)'
  | 'Evaluator (UPG Pusat)'
  | 'Evaluatan (satker)';

export type UpgLevel = 'UPG Tingkat 1' | 'UPG Tingkat 2' | 'UPG Tingkat 3';

export interface MasterSatker {
  uniqueId: string; // e.g. "UPG Tingkat 1::1"
  upgLevel: UpgLevel;
  kodeSatker: number;
  namaSatker: string;
}

export interface RiskLibraryItem {
  kodeRisiko: string;
  pernyataanRisiko: string;
  klasifikasiRisiko: string;
  prosesSubproses: string;
  faktorPenyebab: string;
  penyebabRisiko: string[];
  dampakRisiko: string[];
  mandatoryControls: string[];
}

export type ControlEffectivenessClaim =
  | 'Belum Dinilai'
  | 'Tidak Efektif'
  | 'Sebagian Efektif'
  | 'Efektif';

export type QuarterPeriod =
  | 'Triwulan I'
  | 'Triwulan II'
  | 'Triwulan III'
  | 'Triwulan IV';

export interface ControlAssessmentEntry {
  controlName: string;
  klaimEfektivitas: ControlEffectivenessClaim;
  buktiKlaim: string;
  catatanKlaim: string;
  tahun: string;
  periode: QuarterPeriod;
}

export type RiskLevelCategory = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';

// 5 probability levels (1..5) x 4 impact levels (1..4)
export type RiskMatrixGrid = Record<string, RiskLevelCategory>;

export interface RiskMatrixConfig {
  updatedAt: string;
  note: string;
  grid: RiskMatrixGrid; // key: `${prob}-${impact}`
}

export interface RiskAssessmentRecord {
  id: string; // `${satkerUniqueId}::${kodeRisiko}`
  satkerUniqueId: string;
  upgLevel: UpgLevel;
  kodeSatker: number;
  namaSatker: string;
  kodeRisiko: string;
  pernyataanRisiko: string;
  controls: ControlAssessmentEntry[];
  inherentProb: number | '';
  inherentImpact: number | '';
  residualProb: number | '';
  residualImpact: number | '';
  updatedAt: string;
}

export type MonevQuarterStatus =
  | 'Belum Dimulai'
  | 'Dalam Proses'
  | 'Selesai'
  | 'Terkendala'
  | '—';

export type MonevQuarters = [
  MonevQuarterStatus,
  MonevQuarterStatus,
  MonevQuarterStatus,
  MonevQuarterStatus,
];

export interface MonevSatkerRecord {
  key: string; // `${year}::${satkerUniqueId}`
  year: string;
  satkerUniqueId: string;
  upgLevel: UpgLevel;
  kodeSatker: number;
  namaSatker: string;
  statuses: Record<string, MonevQuarters>; // activityCode -> [TW1, TW2, TW3, TW4]
  updatedAt: string;
}

export interface MonevActivityItem {
  code: string;
  name: string;
  weight?: number;
  parentGroup: string;
  subGroup?: string;
}

export interface MonevProgramGroup {
  code: string;
  name: string;
  weight: number;
  subGroup?: {
    code: string;
    name: string;
    weight: number;
    items: string[];
  };
  items: string[];
}

export type ApplicabilityStatus = 'Belum diisi' | 'Berlaku' | 'Tidak Berlaku';

export interface AnnualEvalEntry {
  score: number | '';
  valid: ApplicabilityStatus;
  evidence: string;
  note: string;
}

export type AnnualEvalMap = Record<string, AnnualEvalEntry>;

export interface AnnualEvalSatkerRecord {
  key: string; // `${year}::${satkerUniqueId}`
  year: string;
  satkerUniqueId: string;
  upgLevel: UpgLevel;
  kodeSatker: number;
  namaSatker: string;
  entries: AnnualEvalMap;
  updatedAt: string;
}

// Legacy / Existing modules: Pengawasan Reguler & Audit Kinerja
export interface PengawasanRegulerItem {
  id: string;
  namaObrik: string;
  tanggalPelaksanaanST: string;
  status: string;
  laporanPdf: string | null;
  monitoringZI: string;
  kendaliMutu: string;
  tanggapanAuditee: string;
  lhpBab2: string;
}

export interface AuditKinerjaItem {
  id: string;
  idTeam: string;
  namaObrik: string;
  tanggalPelaksanaan: string;
  status: string;
  lhePdf: string | null;
  kinerja: string;
  kendaliMutu: string;
  monitoringZI: string;
  hasil: string;
  notisi: string;
  laporan: string;
}
