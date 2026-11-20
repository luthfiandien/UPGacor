import {
  AnnualEvalMap,
  AnnualEvalSatkerRecord,
  AuditKinerjaItem,
  MasterSatker,
  MonevActivityItem,
  MonevProgramGroup,
  MonevQuarterStatus,
  MonevQuarters,
  MonevSatkerRecord,
  PageId,
  PengawasanRegulerItem,
  RiskAssessmentRecord,
  RiskAssessmentStatus,
  RiskLevelCategory,
  RiskLibraryItem,
  RiskMatrixConfig,
  RiskMatrixGrid,
  UpgLevel,
} from '../types/upg';
import {
  buildInitialMandatoryEvidences,
  buildInitialTierSampleAssessments,
  INITIAL_SATKER_EVAL_SCORES,
  MANDATORY_CONTROLS_CATALOG,
  MANDATORY_PROGRAM_GROUPS,
} from './mandatoryControlsData';
import { RISK_CONTROL_LIBRARY } from './riskCatalogData';

export {
  INITIAL_SATKER_EVAL_SCORES,
  MANDATORY_CONTROLS_CATALOG,
  MANDATORY_PROGRAM_GROUPS,
  RISK_CONTROL_LIBRARY,
};

export const PAGE_META: Record<
  PageId,
  { title: string; crumb: string; subtitle: string }
> = {
  'pengawasan-reguler': {
    title: 'Daftar Obrik > Pengawasan Reguler',
    crumb: 'Pengawasan Reguler',
    subtitle: 'Pengawasan Reguler Badan Pengawasan Mahkamah Agung RI',
  },
  'audit-kinerja': {
    title: 'Audit Kinerja / Daftar Obrik',
    crumb: 'Audit Kinerja',
    subtitle: 'Audit Kinerja Badan Pengawasan Mahkamah Agung RI',
  },
  'ppg-risiko': {
    title: 'Penilaian Risiko Gratifikasi',
    crumb: 'PPG / Penilaian Risiko Gratifikasi',
    subtitle: 'Program Pengendalian Gratifikasi (PPG)',
  },
  'ppg-dashboard': {
    title: 'Dashboard PPG',
    crumb: 'PPG / Dashboard PPG',
    subtitle: 'Monitoring Penilaian Risiko & Evaluasi Tahunan PPG',
  },
  'ppg-monev': {
    title: 'Monev PPG',
    crumb: 'PPG / Monev PPG',
    subtitle: 'Matriks Monitoring Triwulanan Program Pengendalian Gratifikasi',
  },
};

export const UPG_LEVELS: UpgLevel[] = [
  'UPG Tingkat 1',
  'UPG Tingkat 2',
  'UPG Tingkat 3',
];

export function makeSatkerUniqueId(upgLevel: UpgLevel, kodeSatker: number): string {
  return `${upgLevel}::${kodeSatker}`;
}

export const MASTER_SATKER_LIST: MasterSatker[] = [
  // UPG TINGKAT 1 (Kode 1..6)
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 1', 1),
    upgLevel: 'UPG Tingkat 1',
    kodeSatker: 1,
    namaSatker: 'Badan Pengawasan',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 1', 2),
    upgLevel: 'UPG Tingkat 1',
    kodeSatker: 2,
    namaSatker:
      'Badan Strategi Kebijakan dan Pendidikan dan Pelatihan Hukum dan Peradilan',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 1', 3),
    upgLevel: 'UPG Tingkat 1',
    kodeSatker: 3,
    namaSatker: 'Badan Urusan Administrasi',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 1', 4),
    upgLevel: 'UPG Tingkat 1',
    kodeSatker: 4,
    namaSatker: 'Direktorat Jenderal Badan Peradilan Agama',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 1', 5),
    upgLevel: 'UPG Tingkat 1',
    kodeSatker: 5,
    namaSatker:
      'Direktorat Jenderal Badan Peradilan Militer dan Peradilan Tata Usaha Negara',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 1', 6),
    upgLevel: 'UPG Tingkat 1',
    kodeSatker: 6,
    namaSatker: 'Direktorat Jenderal Badan Peradilan Umum',
  },

  // UPG TINGKAT 2 (Kode 1..6)
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 2', 1),
    upgLevel: 'UPG Tingkat 2',
    kodeSatker: 1,
    namaSatker: 'Pengadilan Tinggi Ambon',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 2', 2),
    upgLevel: 'UPG Tingkat 2',
    kodeSatker: 2,
    namaSatker: 'Pengadilan Tinggi Aceh',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 2', 3),
    upgLevel: 'UPG Tingkat 2',
    kodeSatker: 3,
    namaSatker: 'Pengadilan Tinggi Jakarta',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 2', 4),
    upgLevel: 'UPG Tingkat 2',
    kodeSatker: 4,
    namaSatker: 'Pengadilan Tinggi Jawa Tengah',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 2', 5),
    upgLevel: 'UPG Tingkat 2',
    kodeSatker: 5,
    namaSatker: 'Pengadilan Tinggi Surabaya',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 2', 6),
    upgLevel: 'UPG Tingkat 2',
    kodeSatker: 6,
    namaSatker: 'Pengadilan Tinggi Yogyakarta',
  },

  // UPG TINGKAT 3 (Kode 1..7)
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 3', 1),
    upgLevel: 'UPG Tingkat 3',
    kodeSatker: 1,
    namaSatker: 'Pengadilan Negeri Bandung',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 3', 2),
    upgLevel: 'UPG Tingkat 3',
    kodeSatker: 2,
    namaSatker: 'Pengadilan Negeri Bantul',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 3', 3),
    upgLevel: 'UPG Tingkat 3',
    kodeSatker: 3,
    namaSatker: 'Pengadilan Negeri Jakarta Pusat',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 3', 4),
    upgLevel: 'UPG Tingkat 3',
    kodeSatker: 4,
    namaSatker: 'Pengadilan Agama Semarang',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 3', 5),
    upgLevel: 'UPG Tingkat 3',
    kodeSatker: 5,
    namaSatker: 'Pengadilan Agama Jakarta Pusat',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 3', 6),
    upgLevel: 'UPG Tingkat 3',
    kodeSatker: 6,
    namaSatker: 'Pengadilan Tata Usaha Negara Yogyakarta',
  },
  {
    uniqueId: makeSatkerUniqueId('UPG Tingkat 3', 7),
    upgLevel: 'UPG Tingkat 3',
    kodeSatker: 7,
    namaSatker: 'Pengadilan Militer III-10 Surabaya',
  },
];

export const BADAN_PENGAWASAN_SATKER: MasterSatker = MASTER_SATKER_LIST[0];

export const PROBABILITY_OPTIONS = [
  { value: 1, label: 'Level 1 – Sangat Jarang Terjadi' },
  { value: 2, label: 'Level 2 – Jarang Terjadi' },
  { value: 3, label: 'Level 3 – Kadang Terjadi' },
  { value: 4, label: 'Level 4 – Sering Terjadi' },
  { value: 5, label: 'Level 5 – Hampir Pasti Terjadi' },
] as const;

export const IMPACT_OPTIONS = [
  { value: 1, label: 'Level 1 – Tidak Signifikan' },
  { value: 2, label: 'Level 2 – Minor' },
  { value: 3, label: 'Level 3 – Moderat' },
  { value: 4, label: 'Level 4 – Signifikan' },
] as const;

export function normalizeRiskCategory(raw: unknown): RiskLevelCategory {
  if (raw === 'Rendah') return 'Rendah';
  if (raw === 'Sedang') return 'Sedang';
  if (raw === 'Tinggi') return 'Tinggi';
  if (raw === 'Ekstrem' || raw === 'Sangat Tinggi') return 'Ekstrem';
  return 'Sedang';
}

export function createDefaultRiskMatrix(): RiskMatrixConfig {
  const grid: RiskMatrixGrid = {
    // 5 (Probabilitas) x 4 (Dampak):
    // 1–4 Rendah | 5–9 Sedang | 10–12 Tinggi | 15–20 Ekstrem
    '1-1': 'Rendah',
    '1-2': 'Rendah',
    '1-3': 'Rendah',
    '1-4': 'Rendah',
    '2-1': 'Rendah',
    '2-2': 'Rendah',
    '2-3': 'Sedang',
    '2-4': 'Sedang',
    '3-1': 'Rendah',
    '3-2': 'Sedang',
    '3-3': 'Sedang',
    '3-4': 'Tinggi',
    '4-1': 'Rendah',
    '4-2': 'Sedang',
    '4-3': 'Tinggi',
    '4-4': 'Ekstrem',
    '5-1': 'Sedang',
    '5-2': 'Tinggi',
    '5-3': 'Ekstrem',
    '5-4': 'Ekstrem',
  };
  return {
    updatedAt: '',
    note: 'Matriks 5×4: Skor 1–4 (Rendah), 5–9 (Sedang), 10–12 (Tinggi), 15–20 (Ekstrem).',
    grid,
  };
}

export function getMatrixRiskCategory(
  matrix: RiskMatrixConfig,
  prob: number | '',
  impact: number | ''
): RiskLevelCategory | null {
  if (prob === '' || impact === '') return null;
  const raw = matrix.grid[`${prob}-${impact}`];
  if (raw) return normalizeRiskCategory(raw);
  const score = Number(prob) * Number(impact);
  if (score <= 4) return 'Rendah';
  if (score <= 9) return 'Sedang';
  if (score <= 12) return 'Tinggi';
  return 'Ekstrem';
}

export function isValidHttpsUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function isControlEntryComplete(ctrl: {
  klaimEfektivitas: string;
  buktiKlaim: string;
  catatanKlaim: string;
  periode: string;
}): boolean {
  return (
    ctrl.klaimEfektivitas !== 'Belum Dinilai' &&
    isValidHttpsUrl(ctrl.buktiKlaim) &&
    ctrl.catatanKlaim.trim().length > 0 &&
    ctrl.periode.trim().length > 0
  );
}

export function isControlEntryTouched(ctrl: {
  klaimEfektivitas: string;
  buktiKlaim: string;
  catatanKlaim: string;
}): boolean {
  return (
    ctrl.klaimEfektivitas !== 'Belum Dinilai' ||
    ctrl.buktiKlaim.trim().length > 0 ||
    ctrl.catatanKlaim.trim().length > 0
  );
}

export function getRiskAssessmentStatus(
  record: RiskAssessmentRecord
): RiskAssessmentStatus {
  const mandatoryList = record.controls ?? [];
  const nonMandatoryList = record.nonMandatoryControls ?? [];

  const allMandatoryComplete =
    mandatoryList.length > 0 && mandatoryList.every(isControlEntryComplete);
  const scoresComplete =
    record.inherentProb !== '' &&
    record.inherentImpact !== '' &&
    record.residualProb !== '' &&
    record.residualImpact !== '';

  if (record.savedAsDraft) {
    return 'Draft';
  }

  if (allMandatoryComplete && scoresComplete) {
    return 'Selesai';
  }

  const anyMandatoryTouched = mandatoryList.some(isControlEntryTouched);
  const anyNonMandatoryTouched = nonMandatoryList.some(isControlEntryTouched);
  const anyScoreSelected =
    record.inherentProb !== '' ||
    record.inherentImpact !== '' ||
    record.residualProb !== '' ||
    record.residualImpact !== '';

  if (anyMandatoryTouched || anyNonMandatoryTouched || anyScoreSelected) {
    return 'Draft';
  }

  return 'Belum Dinilai';
}

export function getNextRiskCode(catalog: RiskLibraryItem[]): string {
  let maxNum = 0;
  catalog.forEach((item) => {
    const match = item.kodeRisiko.match(/(\d+)$/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  return `PPG.RK.${String(nextNum).padStart(2, '0')}`;
}

export function isRiskAssessmentComplete(record: RiskAssessmentRecord): boolean {
  if (!record.satkerUniqueId || !record.kodeRisiko) return false;
  return getRiskAssessmentStatus(record) === 'Selesai';
}

export function createEmptyAssessmentForRisk(
  satker: MasterSatker,
  risk: RiskLibraryItem,
  year: string
): RiskAssessmentRecord {
  return {
    id: `${satker.uniqueId}::${risk.kodeRisiko}`,
    satkerUniqueId: satker.uniqueId,
    upgLevel: satker.upgLevel,
    kodeSatker: satker.kodeSatker,
    namaSatker: satker.namaSatker,
    tahun: year,
    kodeRisiko: risk.kodeRisiko,
    prosesSubproses: risk.prosesSubproses,
    pernyataanRisiko: risk.pernyataanRisiko,
    controls: risk.mandatoryControls.map((ctrlName) => ({
      controlName: ctrlName,
      klaimEfektivitas: 'Belum Dinilai',
      buktiKlaim: '',
      catatanKlaim: '',
      tahun: year,
      periode: 'Triwulan I',
    })),
    nonMandatoryControls: risk.nonMandatoryControls.map((ctrlName) => ({
      controlName: ctrlName,
      klaimEfektivitas: 'Belum Dinilai',
      buktiKlaim: '',
      catatanKlaim: '',
      tahun: year,
      periode: 'Triwulan I',
    })),
    inherentProb: '',
    inherentImpact: '',
    residualProb: '',
    residualImpact: '',
    updatedAt: new Date().toISOString(),
  };
}

export const INITIAL_BADAN_PENGAWASAN_ASSESSMENTS: RiskAssessmentRecord[] = [
  {
    id: `${BADAN_PENGAWASAN_SATKER.uniqueId}::PPG.RK.01`,
    satkerUniqueId: BADAN_PENGAWASAN_SATKER.uniqueId,
    upgLevel: BADAN_PENGAWASAN_SATKER.upgLevel,
    kodeSatker: BADAN_PENGAWASAN_SATKER.kodeSatker,
    namaSatker: BADAN_PENGAWASAN_SATKER.namaSatker,
    tahun: '2026',
    kodeRisiko: RISK_CONTROL_LIBRARY[0].kodeRisiko,
    prosesSubproses: RISK_CONTROL_LIBRARY[0].prosesSubproses,
    pernyataanRisiko: RISK_CONTROL_LIBRARY[0].pernyataanRisiko,
    controls: [
      {
        controlName: RISK_CONTROL_LIBRARY[0].mandatoryControls[0],
        klaimEfektivitas: 'Efektif',
        buktiKlaim: 'https://wastitama.mahkamahagung.go.id/dokumen/sk-tim-upg-bawas-2026',
        catatanKlaim:
          'SK Tim UPG Badan Pengawasan telah ditetapkan dan petugas pengawas layanan aktif bertugas.',
        tahun: '2026',
        periode: 'Triwulan I',
      },
      {
        controlName: RISK_CONTROL_LIBRARY[0].mandatoryControls[1],
        klaimEfektivitas: 'Efektif',
        buktiKlaim: 'https://wastitama.mahkamahagung.go.id/dokumen/maklumat-ptsp-bawas',
        catatanKlaim:
          'Maklumat pelayanan, tarif PNBP resmi, dan pakta integritas telah terpasang di meja PTSP.',
        tahun: '2026',
        periode: 'Triwulan I',
      },
    ],
    nonMandatoryControls: [
      {
        controlName: RISK_CONTROL_LIBRARY[0].nonMandatoryControls[0],
        klaimEfektivitas: 'Efektif',
        buktiKlaim: 'https://wastitama.mahkamahagung.go.id/dokumen/briefing-ptsp-tw1',
        catatanKlaim: 'Briefing integritas petugas dilaksanakan rutin setiap hari Senin.',
        tahun: '2026',
        periode: 'Triwulan I',
      },
      {
        controlName: RISK_CONTROL_LIBRARY[0].nonMandatoryControls[1],
        klaimEfektivitas: 'Belum Dinilai',
        buktiKlaim: '',
        catatanKlaim: '',
        tahun: '2026',
        periode: 'Triwulan I',
      },
    ],
    inherentProb: 4,
    inherentImpact: 3,
    residualProb: 2,
    residualImpact: 2,
    updatedAt: '2026-03-15T09:00:00.000Z',
  },
  {
    id: `${BADAN_PENGAWASAN_SATKER.uniqueId}::PPG.RK.03`,
    satkerUniqueId: BADAN_PENGAWASAN_SATKER.uniqueId,
    upgLevel: BADAN_PENGAWASAN_SATKER.upgLevel,
    kodeSatker: BADAN_PENGAWASAN_SATKER.kodeSatker,
    namaSatker: BADAN_PENGAWASAN_SATKER.namaSatker,
    tahun: '2026',
    kodeRisiko: RISK_CONTROL_LIBRARY[2].kodeRisiko,
    prosesSubproses: RISK_CONTROL_LIBRARY[2].prosesSubproses,
    pernyataanRisiko: RISK_CONTROL_LIBRARY[2].pernyataanRisiko,
    controls: [
      {
        controlName: RISK_CONTROL_LIBRARY[2].mandatoryControls[0],
        klaimEfektivitas: 'Efektif Sebagian',
        buktiKlaim: 'https://wastitama.mahkamahagung.go.id/dokumen/pakta-integritas-pemeriksa',
        catatanKlaim:
          'Pakta integritas telah ditandatangani oleh sebagian besar tim pemeriksa wilayah.',
        tahun: '2026',
        periode: 'Triwulan I',
      },
      {
        controlName: RISK_CONTROL_LIBRARY[2].mandatoryControls[1],
        klaimEfektivitas: 'Belum Dinilai',
        buktiKlaim: '',
        catatanKlaim: '',
        tahun: '2026',
        periode: 'Triwulan I',
      },
    ],
    nonMandatoryControls: RISK_CONTROL_LIBRARY[2].nonMandatoryControls.map((ctrlName) => ({
      controlName: ctrlName,
      klaimEfektivitas: 'Belum Dinilai',
      buktiKlaim: '',
      catatanKlaim: '',
      tahun: '2026',
      periode: 'Triwulan I',
    })),
    inherentProb: 3,
    inherentImpact: 3,
    residualProb: '',
    residualImpact: '',
    updatedAt: '2026-03-18T10:30:00.000Z',
  },
  createEmptyAssessmentForRisk(
    BADAN_PENGAWASAN_SATKER,
    RISK_CONTROL_LIBRARY[4],
    '2026'
  ),
];

export const INITIAL_ALL_ASSESSMENTS: RiskAssessmentRecord[] = [
  ...INITIAL_BADAN_PENGAWASAN_ASSESSMENTS,
  ...buildInitialTierSampleAssessments(MASTER_SATKER_LIST),
];

export const INITIAL_MANDATORY_EVIDENCES =
  buildInitialMandatoryEvidences(MASTER_SATKER_LIST);

// Program & Kegiatan sesuai gambar Matriks Evaluasi Tahunan & Matriks Monitoring Triwulanan
export const MONEV_ACTIVITIES: MonevActivityItem[] = [
  {
    code: '1.1',
    name: 'Pembentukan Tim UPG',
    weight: 2.5,
    parentGroup: '1',
  },
  {
    code: '1.2',
    name: 'Penyusunan Pedoman Internal dan SOP',
    weight: 2.5,
    parentGroup: '1',
  },
  {
    code: '2.1.1',
    name: 'Sosialisasi internal kepada seluruh pegawai',
    weight: 5,
    parentGroup: '2',
    subGroup: '2.1',
  },
  {
    code: '2.1.2',
    name: 'Briefing PTSP',
    weight: 2.5,
    parentGroup: '2',
    subGroup: '2.1',
  },
  {
    code: '3.3',
    name: 'E-learning Peningkatan Pemahaman Gratifikasi',
    weight: 8,
    parentGroup: '3',
  },
  {
    code: '6.1',
    name: 'Laporan UPG secara berjenjang',
    weight: 5,
    parentGroup: '6',
  },
];

export const MONEV_PROGRAMS: MonevProgramGroup[] = [
  {
    code: '1',
    name: 'PERANGKAT PENGENDALIAN GRATIFIKASI',
    weight: 5,
    items: ['1.1', '1.2'],
  },
  {
    code: '2',
    name: 'SOSIALISASI PENGENDALIAN GRATIFIKASI',
    weight: 25,
    subGroup: {
      code: '2.1',
      name: 'Sosialisasi Internal',
      weight: 12.5,
      items: ['2.1.1', '2.1.2'],
    },
    items: ['2.1.1', '2.1.2'],
  },
  {
    code: '3',
    name: 'DISEMINASI PENGENDALIAN GRATIFIKASI',
    weight: 20,
    items: ['3.3'],
  },
  {
    code: '6',
    name: 'PELAPORAN GRATIFIKASI',
    weight: 10,
    items: ['6.1'],
  },
];

export const MONEV_STATUS_OPTIONS: MonevQuarterStatus[] = [
  'Belum Dimulai',
  'Dalam Proses',
  'Selesai',
  'Terkendala',
  '—',
];

export function createEmptyMonevStatuses(): Record<string, MonevQuarters> {
  const map: Record<string, MonevQuarters> = {};
  MONEV_ACTIVITIES.forEach((act) => {
    map[act.code] = [
      'Belum Dimulai',
      'Belum Dimulai',
      'Belum Dimulai',
      'Belum Dimulai',
    ];
  });
  return map;
}

export function createDefaultMonevRecord(
  year: string,
  satker: MasterSatker
): MonevSatkerRecord {
  return {
    key: `${year}::${satker.uniqueId}`,
    year,
    satkerUniqueId: satker.uniqueId,
    upgLevel: satker.upgLevel,
    kodeSatker: satker.kodeSatker,
    namaSatker: satker.namaSatker,
    statuses: createEmptyMonevStatuses(),
    updatedAt: '',
  };
}

export function createInitialAnnualEval(): AnnualEvalMap {
  const map: AnnualEvalMap = {};
  MONEV_ACTIVITIES.forEach((act) => {
    map[act.code] = {
      score: '',
      valid: 'Belum diisi',
      evidence: '',
      note: '',
    };
  });
  return map;
}

export function createDefaultAnnualEvalRecord(
  year: string,
  satker: MasterSatker
): AnnualEvalSatkerRecord {
  return {
    key: `${year}::${satker.uniqueId}`,
    year,
    satkerUniqueId: satker.uniqueId,
    upgLevel: satker.upgLevel,
    kodeSatker: satker.kodeSatker,
    namaSatker: satker.namaSatker,
    entries: createInitialAnnualEval(),
    updatedAt: '',
  };
}

export const INITIAL_PENGAWASAN_REGULER: PengawasanRegulerItem[] = [
  {
    id: 'pr-1',
    namaObrik: 'PENGADILAN NEGERI SAUMLAKI',
    tanggalPelaksanaanST: '17 Agustus 2026',
    status: 'Proses pemeriksaan',
    laporanPdf: 'LHP_PN_Saumlaki_2026.pdf',
    monitoringZI: '',
    kendaliMutu: '',
    tanggapanAuditee: '',
    lhpBab2: '',
  },
  {
    id: 'pr-2',
    namaObrik: 'PENGADILAN AGAMA TUBAN',
    tanggalPelaksanaanST: '10 Agustus 2026',
    status: 'Proses pemeriksaan',
    laporanPdf: 'LHP_PA_Tuban_2026.pdf',
    monitoringZI: '',
    kendaliMutu: '',
    tanggapanAuditee: '',
    lhpBab2: '',
  },
  {
    id: 'pr-3',
    namaObrik: 'PENGADILAN AGAMA SERANG',
    tanggalPelaksanaanST: '18 Mei 2026',
    status: 'Proses pemeriksaan',
    laporanPdf: 'LHP_PA_Serang_2026.pdf',
    monitoringZI: '',
    kendaliMutu: '',
    tanggapanAuditee: '',
    lhpBab2: '',
  },
];

export const INITIAL_AUDIT_KINERJA: AuditKinerjaItem[] = [
  {
    id: 'ak-1',
    idTeam: '1960',
    namaObrik: 'PENGADILAN AGAMA GARUT',
    tanggalPelaksanaan: '27 Juli 2026',
    status: 'Proses pemeriksaan',
    lhePdf: 'LHE_PA_Garut_1960.pdf',
    kinerja: '',
    kendaliMutu: '',
    monitoringZI: '',
    hasil: '',
    notisi: '',
    laporan: '',
  },
  {
    id: 'ak-2',
    idTeam: '1852',
    namaObrik: 'PENGADILAN AGAMA KOTA TASIKMALAYA',
    tanggalPelaksanaan: '29 Juni 2026',
    status: 'Proses pemeriksaan',
    lhePdf: 'LHE_PA_Tasikmalaya_1852.pdf',
    kinerja: '',
    kendaliMutu: '',
    monitoringZI: '',
    hasil: '',
    notisi: '',
    laporan: '',
  },
  {
    id: 'ak-3',
    idTeam: '1825',
    namaObrik: 'PENGADILAN AGAMA SERUI',
    tanggalPelaksanaan: '22 Juni 2026',
    status: 'Proses pemeriksaan',
    lhePdf: 'LHE_PA_Serui_1825.pdf',
    kinerja: '',
    kendaliMutu: '',
    monitoringZI: '',
    hasil: '',
    notisi: '',
    laporan: '',
  },
  {
    id: 'ak-4',
    idTeam: '1421',
    namaObrik: 'PENGADILAN NEGERI WATANSOPPENG',
    tanggalPelaksanaan: '19 Mei 2025',
    status: 'Proses pemeriksaan',
    lhePdf: 'LHE_PN_Watansoppeng_1421.pdf',
    kinerja: '',
    kendaliMutu: '',
    monitoringZI: '',
    hasil: '',
    notisi: '',
    laporan: '',
  },
  {
    id: 'ak-5',
    idTeam: '965',
    namaObrik: 'PENGADILAN NEGERI MUARA ENIM',
    tanggalPelaksanaan: '22 Oktober 2024',
    status: 'Proses pemeriksaan',
    lhePdf: 'LHE_PN_MuaraEnim_965.pdf',
    kinerja: '',
    kendaliMutu: '',
    monitoringZI: '',
    hasil: '',
    notisi: '',
    laporan: '',
  },
  {
    id: 'ak-6',
    idTeam: '931',
    namaObrik: 'PENGADILAN NEGERI TOBELO',
    tanggalPelaksanaan: '17 September 2024',
    status: 'Proses pemeriksaan',
    lhePdf: null,
    kinerja: '',
    kendaliMutu: '',
    monitoringZI: '',
    hasil: '',
    notisi: '',
    laporan: '',
  },
];

export function exportMonevExcel(record: MonevSatkerRecord) {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const cellBg = (status: MonevQuarterStatus) => {
    if (status === 'Selesai') return '#e2efda';
    if (status === 'Dalam Proses') return '#fff2cc';
    if (status === 'Terkendala') return '#fde8e8';
    return '#ffffff';
  };

  let bodyRows = '';
  MONEV_PROGRAMS.forEach((prog) => {
    bodyRows += `
      <tr style="background:#e8f2fa;font-weight:bold;">
        <td>${escapeHtml(prog.code)}</td>
        <td colspan="5">${escapeHtml(prog.name)}</td>
      </tr>
    `;
    if (prog.subGroup) {
      bodyRows += `
        <tr style="background:#f5f9fd;font-weight:bold;">
          <td>${escapeHtml(prog.subGroup.code)}</td>
          <td colspan="5">${escapeHtml(prog.subGroup.name)}</td>
        </tr>
      `;
    }
    prog.items.forEach((code) => {
      const act = MONEV_ACTIVITIES.find((a) => a.code === code);
      if (!act) return;
      const qs = record.statuses[code] ?? [
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
      ];
      bodyRows += `
        <tr>
          <td>${escapeHtml(act.code)}</td>
          <td>${escapeHtml(act.name)}</td>
          ${qs
            .map(
              (q) =>
                `<td style="text-align:center;background:${cellBg(q)};">${escapeHtml(q)}</td>`
            )
            .join('')}
        </tr>
      `;
    });
  });

  const html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
  <head><meta charset="UTF-8" /></head>
  <body>
    <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;">
      <tr>
        <th colspan="6" style="background:#1f4e78;color:#ffffff;font-size:14px;text-align:left;">
          MATRIKS MONITORING TRIWULANAN PROGRAM PENGENDALIAN GRATIFIKASI
        </th>
      </tr>
      <tr>
        <td><b>Tahun Pelaksanaan</b></td>
        <td colspan="5">${escapeHtml(record.year)}</td>
      </tr>
      <tr>
        <td><b>Nama UPG</b></td>
        <td colspan="5">${escapeHtml(record.upgLevel)}</td>
      </tr>
      <tr>
        <td><b>Nama Satker</b></td>
        <td colspan="5">${escapeHtml(record.namaSatker)}</td>
      </tr>
      <tr style="background:#0f6f73;color:#ffffff;font-weight:bold;">
        <th>No.</th>
        <th>Program/Kegiatan/Subkegiatan</th>
        <th>TW I</th>
        <th>TW II</th>
        <th>TW III</th>
        <th>TW IV</th>
      </tr>
      ${bodyRows}
    </table>
  </body>
  </html>`;

  const blob = new Blob(['\ufeff' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Monev_PPG_${record.year}_${record.namaSatker.replace(/\s+/g, '_')}.xls`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportAnnualMonevExcel(record: AnnualEvalSatkerRecord) {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  let bodyRows = '';
  MONEV_PROGRAMS.forEach((prog) => {
    bodyRows += `
      <tr style="background:#e8f2fa;font-weight:bold;">
        <td>${escapeHtml(prog.code)}</td>
        <td>${escapeHtml(prog.name)}</td>
        <td style="text-align:right;">${prog.weight}</td>
        <td>—</td>
        <td>—</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    `;
    if (prog.subGroup) {
      bodyRows += `
        <tr style="background:#f5f9fd;font-weight:bold;">
          <td>${escapeHtml(prog.subGroup.code)}</td>
          <td>${escapeHtml(prog.subGroup.name)}</td>
          <td style="text-align:right;">${prog.subGroup.weight}</td>
          <td>—</td>
          <td>—</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      `;
    }
    prog.items.forEach((code) => {
      const act = MONEV_ACTIVITIES.find((a) => a.code === code);
      if (!act) return;
      const e = record.entries[code];
      const sc = e?.score ?? '';
      const cap =
        sc === '' || !act.weight
          ? '—'
          : `${((Number(sc) / act.weight) * 100).toFixed(0)}%`;
      bodyRows += `
        <tr>
          <td>${escapeHtml(act.code)}</td>
          <td>${escapeHtml(act.name)}</td>
          <td style="text-align:right;">${act.weight ?? ''}</td>
          <td style="text-align:right;">${sc === '' ? '—' : sc}</td>
          <td style="text-align:right;">${cap}</td>
          <td>${escapeHtml(e?.valid ?? 'Belum diisi')}</td>
          <td>${escapeHtml(e?.evidence ?? '')}</td>
          <td>${escapeHtml(e?.note ?? '')}</td>
        </tr>
      `;
    });
  });

  const html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
  <head><meta charset="UTF-8" /></head>
  <body>
    <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;">
      <tr>
        <th colspan="8" style="background:#1f4e78;color:#ffffff;font-size:14px;text-align:left;">
          MATRIKS EVALUASI TAHUNAN PROGRAM PENGENDALIAN GRATIFIKASI
        </th>
      </tr>
      <tr>
        <td><b>Tahun evaluasi</b></td>
        <td colspan="3">${escapeHtml(record.year)}</td>
        <td><b>Tingkat UPG</b></td>
        <td colspan="3">${escapeHtml(record.upgLevel)}</td>
      </tr>
      <tr>
        <td><b>Nama Satker</b></td>
        <td colspan="7">${escapeHtml(record.namaSatker)}</td>
      </tr>
      <tr style="background:#0f6f73;color:#ffffff;font-weight:bold;">
        <th>No.</th>
        <th>Program/Kegiatan/Subkegiatan</th>
        <th>Bobot (%)</th>
        <th>Nilai Perolehan</th>
        <th>Capaian</th>
        <th>Keberlakuan UPG</th>
        <th>Bukti Dukung</th>
        <th>Catatan/Verifikasi</th>
      </tr>
      ${bodyRows}
    </table>
  </body>
  </html>`;

  const blob = new Blob(['\ufeff' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Monev_Evaluasi_Tahunan_PPG_${record.year}_${record.namaSatker.replace(/\s+/g, '_')}.xls`;
  anchor.click();
  URL.revokeObjectURL(url);
}
