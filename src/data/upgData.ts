import {
  Activity,
  MonitoringDetailsMap,
  PageId,
  ProgramGroup,
  SatkerItem,
  SatkerStateMap,
  SelfScoresMap,
} from '../types/upg';

export const QUARTER_LABELS = ['TW I', 'TW II', 'TW III', 'TW IV'] as const;

export const PAGE_META: Record<PageId, { title: string; crumb: string }> = {
  dashboard: { title: 'Dashboard UPG Tingkat II', crumb: 'Dashboard UPG' },
  mandiri: { title: 'Penilaian Mandiri', crumb: 'Penilaian Mandiri' },
  monitoring: { title: 'Monitoring PPG', crumb: 'Monitoring PPG' },
  satker: { title: 'Evaluasi Satker Tingkat III', crumb: 'Evaluasi Satker Tingkat III' },
  rekap: { title: 'Rekapitulasi Hasil', crumb: 'Rekapitulasi Hasil' },
  laporan: { title: 'Laporan PPG', crumb: 'Laporan PPG' },
};

export const ACTIVITIES: Activity[] = [
  {
    code: '1.1',
    name: 'Pembentukan Tim UPG',
    weight: 2.5,
    quarters: ['Selesai', '—', '—', '—'],
  },
  {
    code: '1.2',
    name: 'Penyusunan Pedoman Internal dan SOP',
    weight: 2.5,
    quarters: ['Dalam Proses', 'Selesai', '—', '—'],
  },
  {
    code: '2.1.1',
    name: 'Sosialisasi internal kepada seluruh pegawai',
    weight: 5,
    quarters: ['Dalam Proses', 'Dalam Proses', 'Selesai', '—'],
  },
  {
    code: '2.1.2',
    name: 'Briefing PTSP',
    weight: 2.5,
    quarters: ['Selesai', 'Selesai', 'Selesai', 'Selesai'],
  },
  {
    code: '3.3',
    name: 'E-learning Peningkatan Pemahaman Gratifikasi',
    weight: 8,
    quarters: ['Dalam Proses', 'Dalam Proses', 'Selesai', '—'],
  },
  {
    code: '6.1',
    name: 'Laporan UPG secara berjenjang',
    weight: 5,
    quarters: ['Dalam Proses', 'Selesai', 'Dalam Proses', 'Selesai'],
  },
];

export const PROGRAMS: ProgramGroup[] = [
  {
    code: '1',
    name: 'PERANGKAT PENGENDALIAN GRATIFIKASI',
    items: ['1.1', '1.2'],
  },
  {
    code: '2',
    name: 'SOSIALISASI PENGENDALIAN GRATIFIKASI',
    items: ['2.1.1', '2.1.2'],
  },
  {
    code: '3',
    name: 'DISEMINASI PENGENDALIAN GRATIFIKASI',
    items: ['3.3'],
  },
  {
    code: '6',
    name: 'PELAPORAN GRATIFIKASI',
    items: ['6.1'],
  },
];

export const SATKER_LIST: SatkerItem[] = [
  { name: 'Pengadilan Negeri Jakarta Pusat', lingkungan: 'Umum' },
  { name: 'Pengadilan Agama Jakarta Pusat', lingkungan: 'Agama' },
  { name: 'Pengadilan Negeri Jakarta Selatan', lingkungan: 'Umum' },
  { name: 'Pengadilan Agama Jakarta Selatan', lingkungan: 'Agama' },
  { name: 'Pengadilan Negeri Bandung', lingkungan: 'Umum' },
  { name: 'Pengadilan Agama Bandung', lingkungan: 'Agama' },
  { name: 'Pengadilan Negeri Semarang', lingkungan: 'Umum' },
  { name: 'Pengadilan Agama Semarang', lingkungan: 'Agama' },
  { name: 'Pengadilan Negeri Surabaya', lingkungan: 'Umum' },
  { name: 'Pengadilan Agama Surabaya', lingkungan: 'Agama' },
  { name: 'Pengadilan Negeri Medan', lingkungan: 'Umum' },
  { name: 'Pengadilan Agama Medan', lingkungan: 'Agama' },
];

export function createInitialMonitoringDetails(): MonitoringDetailsMap {
  const details: MonitoringDetailsMap = {};
  ACTIVITIES.forEach((a) => {
    a.quarters.forEach((status, index) => {
      details[`${a.code}-${index}`] = {
        status,
        target: '',
        actual: '',
        unit: '',
        note: '',
        issue: '',
        plan: '',
        evidence: '',
        owner: '',
      };
    });
  });
  return details;
}

export function createInitialSatkerState(): SatkerStateMap {
  const state: SatkerStateMap = {};
  SATKER_LIST.forEach((s) => {
    state[s.name] = {
      status: 'Belum Dievaluasi',
      score: '',
      note: '',
    };
  });
  return state;
}

export function getAchievementCategory(score: number | ''): string {
  if (score === '') return '—';
  const v = Number(score);
  if (v >= 90) return 'Sangat Baik';
  if (v >= 80) return 'Baik';
  if (v >= 70) return 'Cukup';
  if (v >= 60) return 'Kurang';
  return 'Sangat Kurang';
}

export function formatWeight(weight: number): string {
  return weight.toFixed(2).replace('.', ',');
}

export function downloadCSV(
  type: 'monitoring' | 'evaluation' | 'rekap',
  data: {
    details: MonitoringDetailsMap;
    selfScores: SelfScoresMap;
    satState: SatkerStateMap;
  }
) {
  let rows: (string | number)[][] = [];

  if (type === 'monitoring') {
    rows = [
      [
        'Kode',
        'Kegiatan',
        'Triwulan',
        'Status',
        'Target',
        'Realisasi',
        'Satuan',
        'Progres/Keterangan',
        'Kendala',
        'Rencana Perbaikan',
        'Bukti Dukung',
        'Penanggung Jawab',
      ],
    ];
    ACTIVITIES.forEach((a) => {
      a.quarters.forEach((_, i) => {
        const d = data.details[`${a.code}-${i}`];
        rows.push([
          a.code,
          a.name,
          QUARTER_LABELS[i],
          d?.status ?? '—',
          d?.target ?? '',
          d?.actual ?? '',
          d?.unit ?? '',
          d?.note ?? '',
          d?.issue ?? '',
          d?.plan ?? '',
          d?.evidence ?? '',
          d?.owner ?? '',
        ]);
      });
    });
  } else if (type === 'evaluation') {
    rows = [
      [
        'Kode',
        'Kegiatan',
        'Bobot',
        'Nilai Perolehan',
        'Capaian',
        'Keberlakuan',
        'Bukti',
        'Catatan',
      ],
    ];
    ACTIVITIES.forEach((a) => {
      const s = data.selfScores[a.code];
      const scoreVal = s?.score ?? '';
      const capaian =
        scoreVal === '' ? '' : `${((Number(scoreVal) / a.weight) * 100).toFixed(1)}%`;
      rows.push([
        a.code,
        a.name,
        a.weight,
        scoreVal,
        capaian,
        s?.valid ?? '',
        s?.evidence ?? '',
        s?.note ?? '',
      ]);
    });
  } else {
    rows = [
      ['No', 'Satuan Kerja', 'Bobot Dasar', 'Nilai/Capaian', 'Kategori', 'Status'],
    ];
    SATKER_LIST.forEach((satker, i) => {
      const d = data.satState[satker.name];
      const scoreText = d?.score === '' || d?.score === undefined ? '' : `${d.score}%`;
      rows.push([
        i + 1,
        satker.name,
        '60,5%',
        scoreText,
        getAchievementCategory(d?.score ?? ''),
        d?.status ?? 'Belum Dievaluasi',
      ]);
    });
  }

  const csv = rows
    .map((r) =>
      r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')
    )
    .join('\r\n');

  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Wastitama_UPG_${type}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
