import {
  ControlEffectivenessClaim,
  MandatoryControlDefinition,
  MandatoryProgramGroup,
  MasterSatker,
  QuarterPeriod,
  RiskAssessmentRecord,
  SatkerEvalScore,
  SatkerMandatoryEvidence,
} from '../types/upg';
import { RISK_CONTROL_LIBRARY } from './riskCatalogData';

export const MANDATORY_PROGRAM_GROUPS: MandatoryProgramGroup[] = [
  '1. Perangkat pengendalian',
  '2. Sosialisasi',
  '3. Diseminasi & e-learning',
  '6. Pelaporan',
  '7. Apresiasi & inovasi',
];

export const MANDATORY_CONTROLS_CATALOG: MandatoryControlDefinition[] = [
  {
    code: '1.1',
    name: 'Pembentukan Tim UPG',
    programGroup: '1. Perangkat pengendalian',
  },
  {
    code: '1.2',
    name: 'Penyusunan Pedoman Internal dan SOP',
    programGroup: '1. Perangkat pengendalian',
  },
  {
    code: '2.1.1',
    name: 'Sosialisasi internal kepada seluruh pegawai',
    programGroup: '2. Sosialisasi',
  },
  {
    code: '2.1.2',
    name: 'Briefing PTSP',
    programGroup: '2. Sosialisasi',
  },
  {
    code: '2.1.3',
    name: 'Briefing petugas keamanan dan tenaga alih daya',
    programGroup: '2. Sosialisasi',
  },
  {
    code: '2.2.1',
    name: 'Sosialisasi kepada pemangku kepentingan eksternal',
    programGroup: '2. Sosialisasi',
  },
  {
    code: '3.1.1',
    name: 'Pemasangan screensaver/wallpaper pada komputer pegawai',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.1.2',
    name: 'Pemasangan pop-up pada aplikasi internal, antara lain SIKEP, Wastitama, SIWAS, dan Lensa',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.1.3',
    name: 'Penyebaran pesan melalui broadcast email/WhatsApp pegawai dengan membubuhkan signature email "antigratifikasi"',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.1.4',
    name: 'Penayangan informasi gratifikasi melalui monitor internal',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.1.5',
    name: 'Penyebaran surat edaran atau surat imbauan untuk pihak internal dengan membubuhkan "antigratifikasi"',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.1.6',
    name: 'Pemasangan banner, poster, spanduk, flyer, stiker, keychain, kalender digital, atau virtual background pada Zoom',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.1.7',
    name: 'Pencantuman imbauan antigratifikasi pada templat surat keluar dan amplop untuk surat yang ditujukan kepada pihak internal',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.1.8',
    name: 'Pemutaran audio antigratifikasi setiap 2 (dua) jam',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.2.1',
    name: 'Penyampaian pesan antigratifikasi oleh Majelis Hakim sebelum persidangan, khusus bagi pengadilan',
    programGroup: '3. Diseminasi & e-learning',
    courtOnly: true,
  },
  {
    code: '3.2.2',
    name: 'Pemasangan banner, poster, spanduk, flyer, atau stiker di PTSP dan ruang tunggu sidang',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.2.3',
    name: 'Penyebaran pesan melalui media cetak atau media digital',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.2.4',
    name: 'Penyebaran konten melalui media sosial instansi, laman resmi instansi, laman layanan publik, dan sejenisnya',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.2.5',
    name: 'Penayangan video antigratifikasi pada televisi di PTSP',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.2.6',
    name: 'Pemasangan pop-up pada aplikasi eksternal, antara lain laman resmi, SIWAS, SIPP, e-Court, dan e-Raterang',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.2.7',
    name: 'Pencantuman logo atau pesan antigratifikasi pada surat keluar kepada masyarakat, struk biaya perkara, dan nomor antrean',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '3.3',
    name: 'E-learning Peningkatan Pemahaman Gratifikasi',
    programGroup: '3. Diseminasi & e-learning',
  },
  {
    code: '6.1',
    name: 'Laporan UPG secara berjenjang',
    programGroup: '6. Pelaporan',
  },
  {
    code: '7.2',
    name: 'Inovasi pengendalian gratifikasi di satuan kerja (tentatif)',
    programGroup: '7. Apresiasi & inovasi',
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
}

const BAWAS_UNFILLED_CODES = new Set(['2.1.3', '3.1.4', '3.1.8', '3.2.5', '7.2']);
const BAWAS_PARTIAL_CODES = new Set(['2.2.1', '3.1.7', '3.2.7']);

export function buildInitialMandatoryEvidences(
  satkerList: MasterSatker[]
): SatkerMandatoryEvidence[] {
  const results: SatkerMandatoryEvidence[] = [];
  const quarters: QuarterPeriod[] = [
    'Triwulan I',
    'Triwulan II',
    'Triwulan I',
    'Triwulan II',
  ];

  satkerList.forEach((satker, sIdx) => {
    const isBawas = satker.uniqueId === 'UPG Tingkat 1::1';
    const isCourt =
      satker.upgLevel === 'UPG Tingkat 2' ||
      satker.upgLevel === 'UPG Tingkat 3';
    const satkerSlug = isBawas ? 'bawas' : slugify(satker.namaSatker);

    MANDATORY_CONTROLS_CATALOG.forEach((ctrl, cIdx) => {
      const id = `${satker.uniqueId}::${ctrl.code}`;
      const codeSlug = ctrl.code.replace(/\./g, '-');

      // 3.2.1 is court-only ("khusus bagi pengadilan")
      if (ctrl.courtOnly && !isCourt) {
        results.push({
          id,
          satkerUniqueId: satker.uniqueId,
          controlCode: ctrl.code,
          status: 'Khusus Pengadilan',
          klaimEfektivitas: 'N/A',
          buktiUrl: '',
          periode: 'Triwulan I',
          catatan:
            'Tidak berlaku bagi unit Eselon I non-pengadilan (khusus pengadilan).',
          updatedAt: '2026-03-10T08:00:00.000Z',
        });
        return;
      }

      if (isBawas) {
        if (BAWAS_UNFILLED_CODES.has(ctrl.code)) {
          results.push({
            id,
            satkerUniqueId: satker.uniqueId,
            controlCode: ctrl.code,
            status: 'Belum Diisi',
            klaimEfektivitas: 'Belum Dinilai',
            buktiUrl: '',
            periode: 'Triwulan I',
            catatan: '',
            updatedAt: '',
          });
        } else {
          const isPartial = BAWAS_PARTIAL_CODES.has(ctrl.code);
          results.push({
            id,
            satkerUniqueId: satker.uniqueId,
            controlCode: ctrl.code,
            status: 'Sudah Diisi',
            klaimEfektivitas: isPartial ? 'Efektif Sebagian' : 'Efektif',
            buktiUrl: `https://wastitama.mahkamahagung.go.id/dokumen/bawas/kontrol-${codeSlug}-2026`,
            periode: quarters[cIdx % quarters.length],
            catatan: isPartial
              ? `Pelaksanaan ${ctrl.name} di Badan Pengawasan berjalan sebagian dan sedang dilengkapi.`
              : `Dokumentasi dan bukti implementasi ${ctrl.name} Badan Pengawasan telah terverifikasi.`,
            updatedAt: '2026-03-22T09:30:00.000Z',
          });
        }
        return;
      }

      // Deterministic realistic fill across Tier 1, 2, 3 satkers
      const seed = (sIdx * 7 + cIdx * 3) % 10;
      // ~80% filled for active satkers, leaving a few realistic gaps
      const isLastInTier =
        satker.uniqueId === 'UPG Tingkat 1::6' ||
        satker.uniqueId === 'UPG Tingkat 2::6' ||
        satker.uniqueId === 'UPG Tingkat 3::7';

      const shouldFill = isLastInTier ? seed < 3 : seed < 8;

      if (!shouldFill) {
        results.push({
          id,
          satkerUniqueId: satker.uniqueId,
          controlCode: ctrl.code,
          status: 'Belum Diisi',
          klaimEfektivitas: 'Belum Dinilai',
          buktiUrl: '',
          periode: 'Triwulan I',
          catatan: '',
          updatedAt: '',
        });
        return;
      }

      const claim: ControlEffectivenessClaim =
        seed === 7 || seed === 6 ? 'Efektif Sebagian' : 'Efektif';

      results.push({
        id,
        satkerUniqueId: satker.uniqueId,
        controlCode: ctrl.code,
        status: 'Sudah Diisi',
        klaimEfektivitas: claim,
        buktiUrl: `https://ppg.mahkamahagung.go.id/bukti/${satkerSlug}/kontrol-${codeSlug}-2026`,
        periode: quarters[(sIdx + cIdx) % quarters.length],
        catatan:
          claim === 'Efektif'
            ? `Bukti dukung ${ctrl.name} telah diunggah oleh ${satker.namaSatker}.`
            : `Implementasi ${ctrl.name} di ${satker.namaSatker} berjalan bertahap dan dalam pemantauan.`,
        updatedAt: '2026-03-25T14:15:00.000Z',
      });
    });
  });

  return results;
}

export const INITIAL_SATKER_EVAL_SCORES: Record<string, SatkerEvalScore> = {
  // UPG Tingkat 1
  'UPG Tingkat 1::1': {
    satkerUniqueId: 'UPG Tingkat 1::1',
    mandiriScore: 88.5,
    evaluatorScore: 87.0,
  },
  'UPG Tingkat 1::2': {
    satkerUniqueId: 'UPG Tingkat 1::2',
    mandiriScore: 86.0,
    evaluatorScore: 84.5,
  },
  'UPG Tingkat 1::3': {
    satkerUniqueId: 'UPG Tingkat 1::3',
    mandiriScore: 89.2,
    evaluatorScore: 86.8,
  },
  'UPG Tingkat 1::4': {
    satkerUniqueId: 'UPG Tingkat 1::4',
    mandiriScore: 85.4,
    evaluatorScore: 83.2,
  },
  'UPG Tingkat 1::5': {
    satkerUniqueId: 'UPG Tingkat 1::5',
    mandiriScore: 82.0,
    evaluatorScore: 79.5,
  },
  'UPG Tingkat 1::6': {
    satkerUniqueId: 'UPG Tingkat 1::6',
    mandiriScore: null,
    evaluatorScore: null,
  },

  // UPG Tingkat 2
  'UPG Tingkat 2::1': {
    satkerUniqueId: 'UPG Tingkat 2::1',
    mandiriScore: 84.0,
    evaluatorScore: 81.5,
  },
  'UPG Tingkat 2::2': {
    satkerUniqueId: 'UPG Tingkat 2::2',
    mandiriScore: 86.5,
    evaluatorScore: 84.0,
  },
  'UPG Tingkat 2::3': {
    satkerUniqueId: 'UPG Tingkat 2::3',
    mandiriScore: 90.4,
    evaluatorScore: 88.5,
  },
  'UPG Tingkat 2::4': {
    satkerUniqueId: 'UPG Tingkat 2::4',
    mandiriScore: 87.8,
    evaluatorScore: 85.2,
  },
  'UPG Tingkat 2::5': {
    satkerUniqueId: 'UPG Tingkat 2::5',
    mandiriScore: 81.2,
    evaluatorScore: 78.6,
  },
  'UPG Tingkat 2::6': {
    satkerUniqueId: 'UPG Tingkat 2::6',
    mandiriScore: null,
    evaluatorScore: null,
  },

  // UPG Tingkat 3
  'UPG Tingkat 3::1': {
    satkerUniqueId: 'UPG Tingkat 3::1',
    mandiriScore: 85.6,
    evaluatorScore: 83.4,
  },
  'UPG Tingkat 3::2': {
    satkerUniqueId: 'UPG Tingkat 3::2',
    mandiriScore: 82.4,
    evaluatorScore: 80.1,
  },
  'UPG Tingkat 3::3': {
    satkerUniqueId: 'UPG Tingkat 3::3',
    mandiriScore: 88.0,
    evaluatorScore: 85.5,
  },
  'UPG Tingkat 3::4': {
    satkerUniqueId: 'UPG Tingkat 3::4',
    mandiriScore: 83.5,
    evaluatorScore: 81.0,
  },
  'UPG Tingkat 3::5': {
    satkerUniqueId: 'UPG Tingkat 3::5',
    mandiriScore: 79.4,
    evaluatorScore: 76.8,
  },
  'UPG Tingkat 3::6': {
    satkerUniqueId: 'UPG Tingkat 3::6',
    mandiriScore: 80.8,
    evaluatorScore: 78.0,
  },
  'UPG Tingkat 3::7': {
    satkerUniqueId: 'UPG Tingkat 3::7',
    mandiriScore: null,
    evaluatorScore: null,
  },
};

function makeCompleteAssessment(
  satker: MasterSatker,
  riskIdx: number,
  inhP: number,
  inhI: number,
  resP: number,
  resI: number,
  partial = false
): RiskAssessmentRecord {
  const lib = RISK_CONTROL_LIBRARY[riskIdx];
  const slug = slugify(satker.namaSatker);
  return {
    id: `${satker.uniqueId}::${lib.kodeRisiko}`,
    satkerUniqueId: satker.uniqueId,
    upgLevel: satker.upgLevel,
    kodeSatker: satker.kodeSatker,
    namaSatker: satker.namaSatker,
    tahun: '2026',
    kodeRisiko: lib.kodeRisiko,
    prosesSubproses: lib.prosesSubproses,
    pernyataanRisiko: lib.pernyataanRisiko,
    controls: lib.mandatoryControls.map((ctrlName, idx) => ({
      controlName: ctrlName,
      klaimEfektivitas: partial && idx === 1 ? 'Efektif Sebagian' : 'Efektif',
      buktiKlaim: `https://ppg.mahkamahagung.go.id/bukti/${slug}/${lib.kodeRisiko.toLowerCase()}-k${idx + 1}`,
      catatanKlaim: `Pengendalian ${ctrlName} telah dilaksanakan sesuai SOP pada ${satker.namaSatker}.`,
      tahun: '2026',
      periode: 'Triwulan I',
    })),
    nonMandatoryControls: lib.nonMandatoryControls.map((ctrlName) => ({
      controlName: ctrlName,
      klaimEfektivitas: 'Belum Dinilai',
      buktiKlaim: '',
      catatanKlaim: '',
      tahun: '2026',
      periode: 'Triwulan I',
    })),
    inherentProb: inhP,
    inherentImpact: inhI,
    residualProb: resP,
    residualImpact: resI,
    updatedAt: '2026-03-20T10:00:00.000Z',
  };
}

function makeDraftAssessment(
  satker: MasterSatker,
  riskIdx: number
): RiskAssessmentRecord {
  const lib = RISK_CONTROL_LIBRARY[riskIdx];
  const slug = slugify(satker.namaSatker);
  return {
    id: `${satker.uniqueId}::${lib.kodeRisiko}`,
    satkerUniqueId: satker.uniqueId,
    upgLevel: satker.upgLevel,
    kodeSatker: satker.kodeSatker,
    namaSatker: satker.namaSatker,
    tahun: '2026',
    kodeRisiko: lib.kodeRisiko,
    prosesSubproses: lib.prosesSubproses,
    pernyataanRisiko: lib.pernyataanRisiko,
    controls: lib.mandatoryControls.map((ctrlName, idx) =>
      idx === 0
        ? {
            controlName: ctrlName,
            klaimEfektivitas: 'Efektif Sebagian',
            buktiKlaim: `https://ppg.mahkamahagung.go.id/bukti/${slug}/${lib.kodeRisiko.toLowerCase()}-draft`,
            catatanKlaim: 'Tahap melengkapi dokumen pendukung triwulan I.',
            tahun: '2026',
            periode: 'Triwulan I',
          }
        : {
            controlName: ctrlName,
            klaimEfektivitas: 'Belum Dinilai',
            buktiKlaim: '',
            catatanKlaim: '',
            tahun: '2026',
            periode: 'Triwulan I',
          }
    ),
    nonMandatoryControls: [],
    inherentProb: 3,
    inherentImpact: 3,
    residualProb: '',
    residualImpact: '',
    savedAsDraft: true,
    updatedAt: '2026-03-21T11:20:00.000Z',
  };
}

export function buildInitialTierSampleAssessments(
  satkerList: MasterSatker[]
): RiskAssessmentRecord[] {
  const byId = Object.fromEntries(satkerList.map((s) => [s.uniqueId, s]));
  const rows: RiskAssessmentRecord[] = [];

  // UPG Tingkat 1 (skip ::1 Badan Pengawasan; already in INITIAL_BADAN_PENGAWASAN_ASSESSMENTS)
  if (byId['UPG Tingkat 1::2']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 1::2'], 0, 4, 3, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 1::2'], 13, 3, 3, 1, 2));
  }
  if (byId['UPG Tingkat 1::3']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 1::3'], 28, 4, 4, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 1::3'], 30, 3, 3, 2, 1));
  }
  if (byId['UPG Tingkat 1::4']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 1::4'], 1, 4, 3, 2, 2, true));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 1::4'], 14, 3, 4, 2, 2));
  }
  if (byId['UPG Tingkat 1::5']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 1::5'], 35, 3, 3, 2, 2));
    rows.push(makeDraftAssessment(byId['UPG Tingkat 1::5'], 36));
  }
  // UPG Tingkat 1::6 left as Belum Dinilai (0 assessments)

  // UPG Tingkat 2 (6 satkers: 4 Selesai, 1 Draft, 1 Belum)
  if (byId['UPG Tingkat 2::1']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::1'], 0, 4, 3, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::1'], 1, 3, 3, 2, 1));
  }
  if (byId['UPG Tingkat 2::2']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::2'], 14, 4, 3, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::2'], 21, 3, 3, 1, 2));
  }
  if (byId['UPG Tingkat 2::3']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::3'], 0, 4, 4, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::3'], 1, 4, 3, 2, 1));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::3'], 22, 3, 3, 1, 2));
  }
  if (byId['UPG Tingkat 2::4']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::4'], 1, 4, 3, 2, 2, true));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::4'], 21, 3, 3, 2, 2));
  }
  if (byId['UPG Tingkat 2::5']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 2::5'], 0, 3, 3, 2, 2));
    rows.push(makeDraftAssessment(byId['UPG Tingkat 2::5'], 14));
  }
  // UPG Tingkat 2::6 left as Belum Dinilai

  // UPG Tingkat 3 (7 satkers: 4 Selesai, 2 Draft, 1 Belum)
  if (byId['UPG Tingkat 3::1']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::1'], 0, 4, 3, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::1'], 15, 3, 3, 2, 1));
  }
  if (byId['UPG Tingkat 3::2']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::2'], 0, 4, 3, 2, 2, true));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::2'], 20, 3, 3, 2, 2));
  }
  if (byId['UPG Tingkat 3::3']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::3'], 0, 4, 4, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::3'], 1, 4, 3, 2, 2));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::3'], 16, 3, 4, 2, 2));
  }
  if (byId['UPG Tingkat 3::4']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::4'], 18, 3, 3, 2, 1));
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::4'], 20, 3, 3, 2, 2));
  }
  if (byId['UPG Tingkat 3::5']) {
    rows.push(makeCompleteAssessment(byId['UPG Tingkat 3::5'], 0, 4, 3, 2, 2));
    rows.push(makeDraftAssessment(byId['UPG Tingkat 3::5'], 19));
  }
  if (byId['UPG Tingkat 3::6']) {
    rows.push(makeDraftAssessment(byId['UPG Tingkat 3::6'], 23));
  }
  // UPG Tingkat 3::7 left as Belum Dinilai

  return rows;
}
