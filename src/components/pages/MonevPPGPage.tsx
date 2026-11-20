import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Lock,
  Printer,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  computeMonevPusatTotals,
  createDefaultAnnualEvalRecord,
  createDefaultMonevRecord,
  exportAnnualMonevExcel,
  exportMonevExcel,
  isValidHttpsUrl,
  MANDATORY_CONTROL_WEIGHTS,
  MANDATORY_CONTROLS_CATALOG,
  MANDATORY_PROGRAM_GROUPS,
  MASTER_SATKER_LIST,
  MONEV_ACTIVITIES,
  MONEV_PROGRAMS,
  MONEV_STATUS_OPTIONS,
  UPG_LEVELS,
} from '../../data/ppgData';
import {
  AnnualEvalEntry,
  AnnualEvalSatkerRecord,
  ApplicabilityStatus,
  EvaluatorStepScore,
  MandatoryProgramGroup,
  MasterSatker,
  MonevActivityItem,
  MonevPusatIndicatorEntry,
  MonevPusatSatkerRecord,
  MonevQuarters,
  MonevQuarterStatus,
  MonevSatkerRecord,
  MonevVerificationStatus,
  SatkerEvalScore,
  SatkerMandatoryEvidence,
  UpgLevel,
  UserRole,
} from '../../types/upg';
import { Modal } from '../Modal';
import { ToastContainer, ToastItem, ToastVariant } from '../ToastContainer';

interface MonevPPGPageProps {
  year: string;
  onYearChange: (year: string) => void;
  userRole: UserRole;
  monevRecords: Record<string, MonevSatkerRecord>;
  annualRecords: Record<string, AnnualEvalSatkerRecord>;
  monevPusatRecords: Record<string, MonevPusatSatkerRecord>;
  mandatoryEvidences: SatkerMandatoryEvidence[];
  satkerScores: Record<string, SatkerEvalScore>;
  onSaveMonev: (record: MonevSatkerRecord) => void;
  onSaveAnnualRecord: (record: AnnualEvalSatkerRecord) => void;
  onSaveMonevPusatRecord: (record: MonevPusatSatkerRecord) => void;
}

type MonevViewTab = 'tahunan' | 'triwulanan';
type AuthorityScope = 'pusat' | 'tier1' | 'tier2' | 'tier3';
type Stage2SubTab = 'evaluasi-tahunan' | 'monitoring-triwulan';

const PILLAR_DISPLAY_TITLES: Record<MandatoryProgramGroup, string> = {
  '1. Perangkat pengendalian': '1. Perangkat Pengendalian',
  '2. Sosialisasi': '2. Sosialisasi',
  '3. Diseminasi & e-learning': '3. Diseminasi & E-Learning',
  '6. Pelaporan': '6. Pelaporan',
  '7. Apresiasi & inovasi': '7. Apresiasi & Inovasi',
};

const EVALUATOR_STEP_OPTIONS: EvaluatorStepScore[] = [0, 25, 50, 75, 100];

function formatPctId(val: number | null | undefined, digits = 1): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  return `${val.toFixed(digits).replace('.', ',')}%`;
}

function escapeCsvCell(val: string | number): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCsvFile(filename: string, rows: (string | number)[][]) {
  const csvContent = rows
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getMonevStatusBadgeClass(status: MonevVerificationStatus): string {
  switch (status) {
    case 'Terverifikasi':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'Perlu Revisi':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'Menunggu Uji':
      return 'border-sky-200 bg-sky-50 text-sky-800';
    case 'Belum Lapor':
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

function getQuarterStatusStyle(status: MonevQuarterStatus): string {
  switch (status) {
    case 'Selesai':
      return 'bg-[#e2efda] text-[#1d6434] font-semibold';
    case 'Dalam Proses':
      return 'bg-[#fff2cc] text-[#855800] font-semibold';
    case 'Terkendala':
      return 'bg-[#fde8e8] text-[#b4232c] font-semibold';
    case 'Belum Dimulai':
      return 'bg-[#f1f5f9] text-[#475569] font-medium';
    case '—':
    default:
      return 'bg-white text-[#64748b] font-semibold';
  }
}

function summarizeQuarterStats(
  quarters: Record<string, MonevQuarters>,
  upgLevel: UpgLevel
) {
  const stats = [0, 1, 2, 3].map((qIdx) => {
    let selesai = 0;
    let dalamProses = 0;
    let terkendala = 0;
    let belumDimulai = 0;
    let tidakDijadwalkan = 0;

    MANDATORY_CONTROLS_CATALOG.forEach((ctrl) => {
      if (ctrl.courtOnly && upgLevel === 'UPG Tingkat 1') return;
      const st = quarters[ctrl.code]?.[qIdx] ?? 'Belum Dimulai';
      if (st === 'Selesai') selesai += 1;
      else if (st === 'Dalam Proses') dalamProses += 1;
      else if (st === 'Terkendala') terkendala += 1;
      else if (st === '—') tidakDijadwalkan += 1;
      else belumDimulai += 1;
    });

    const scheduled =
      selesai + dalamProses + terkendala + belumDimulai;
    const pct = scheduled > 0 ? (selesai / scheduled) * 100 : 0;

    return {
      qIdx,
      label: `TW ${['I', 'II', 'III', 'IV'][qIdx]}`,
      selesai,
      dalamProses,
      terkendala,
      belumDimulai,
      tidakDijadwalkan,
      scheduled,
      pct,
    };
  });

  const totalScheduled = stats.reduce((sum, s) => sum + s.scheduled, 0);
  const totalSelesai = stats.reduce((sum, s) => sum + s.selesai, 0);
  const totalTerkendala = stats.reduce((sum, s) => sum + s.terkendala, 0);
  const overallPct =
    totalScheduled > 0 ? (totalSelesai / totalScheduled) * 100 : 0;

  return {
    quarters: stats,
    totalScheduled,
    totalSelesai,
    totalTerkendala,
    overallPct,
  };
}

function buildFallbackMonevPusatRecord(
  year: string,
  satker: MasterSatker,
  mandatoryEvidences: SatkerMandatoryEvidence[]
): MonevPusatSatkerRecord {
  const evMap = new Map<string, SatkerMandatoryEvidence>();
  mandatoryEvidences.forEach((ev) => {
    evMap.set(`${ev.satkerUniqueId}::${ev.controlCode}`, ev);
  });

  const entries: Record<string, MonevPusatIndicatorEntry> = {};
  const quarters: Record<string, MonevQuarters> = {};

  MANDATORY_CONTROLS_CATALOG.forEach((ctrl) => {
    const isNa = Boolean(ctrl.courtOnly && satker.upgLevel === 'UPG Tingkat 1');
    const ev = evMap.get(`${satker.uniqueId}::${ctrl.code}`);
    if (isNa) {
      entries[ctrl.code] = {
        mandiriScore: null,
        evaluatorScore: null,
        buktiUrl: '',
        catatanPusat: 'Khusus satuan kerja pengadilan (N/A).',
      };
      quarters[ctrl.code] = ['—', '—', '—', '—'];
      return;
    }

    const hasEvidence = Boolean(
      ev && ev.status === 'Sudah Diisi' && isValidHttpsUrl(ev.buktiUrl)
    );
    entries[ctrl.code] = {
      mandiriScore: hasEvidence
        ? ev?.klaimEfektivitas === 'Efektif'
          ? 100
          : 75
        : null,
      evaluatorScore: null,
      buktiUrl: ev?.buktiUrl ?? '',
      catatanPusat: '',
    };
    quarters[ctrl.code] = hasEvidence
      ? ['Selesai', 'Dalam Proses', 'Belum Dimulai', 'Belum Dimulai']
      : ['Belum Dimulai', 'Belum Dimulai', 'Belum Dimulai', 'Belum Dimulai'];
  });

  return {
    key: `${year}::${satker.uniqueId}`,
    year,
    satkerUniqueId: satker.uniqueId,
    status: 'Menunggu Uji',
    revisionNote: '',
    entries,
    quarters,
    updatedAt: '',
  };
}

/* ============================================================================
 * REDESIGNED UPG PUSAT 2-STAGE VERIFICATION WORKSPACE
 * ==========================================================================*/
function UpgPusatMonevWorkspace({
  year,
  onYearChange,
  monevPusatRecords,
  mandatoryEvidences,
  satkerScores,
  onSaveMonevPusatRecord,
}: {
  year: string;
  onYearChange: (year: string) => void;
  monevPusatRecords: Record<string, MonevPusatSatkerRecord>;
  mandatoryEvidences: SatkerMandatoryEvidence[];
  satkerScores: Record<string, SatkerEvalScore>;
  onSaveMonevPusatRecord: (record: MonevPusatSatkerRecord) => void;
}) {
  const [authorityScope, setAuthorityScope] = useState<AuthorityScope>('pusat');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | MonevVerificationStatus
  >('ALL');
  const [satkerSearch, setSatkerSearch] = useState('');

  // Stage 2 active satker
  const [activeSatkerId, setActiveSatkerId] = useState<string | null>(null);
  const [stage2Tab, setStage2Tab] = useState<Stage2SubTab>('evaluasi-tahunan');
  const [draftRecord, setDraftRecord] =
    useState<MonevPusatSatkerRecord | null>(null);

  // Revision modal
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNoteInput, setRevisionNoteInput] = useState('');
  const [revisionError, setRevisionError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((variant: ToastVariant, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, variant, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Build evidence lookup so Stage 2 always reflects the freshest HTTPS URLs
  const evidenceUrlLookup = useMemo(() => {
    const map = new Map<string, SatkerMandatoryEvidence>();
    mandatoryEvidences.forEach((ev) => {
      map.set(`${ev.satkerUniqueId}::${ev.controlCode}`, ev);
    });
    return map;
  }, [mandatoryEvidences]);

  // Build normalized rows for all 19 satkers
  const satkerQueueRows = useMemo(() => {
    return MASTER_SATKER_LIST.map((satker) => {
      const key = `${year}::${satker.uniqueId}`;
      const record =
        monevPusatRecords[key] ??
        buildFallbackMonevPusatRecord(year, satker, mandatoryEvidences);

      const totals = computeMonevPusatTotals(record.entries, satker.upgLevel);
      const fallbackScore = satkerScores[satker.uniqueId];

      const mandiriPct =
        record.status === 'Belum Lapor'
          ? null
          : (totals.mandiriPct ?? fallbackScore?.mandiriScore ?? null);
      const evaluatorPct =
        record.status === 'Belum Lapor'
          ? null
          : (totals.evaluatorPct ??
            (record.status === 'Terverifikasi'
              ? (fallbackScore?.evaluatorScore ?? null)
              : null));

      const quarterSummary = summarizeQuarterStats(
        record.quarters,
        satker.upgLevel
      );

      return {
        satker,
        record,
        mandiriPct,
        evaluatorPct,
        quarterSummary,
      };
    });
  }, [year, monevPusatRecords, mandatoryEvidences, satkerScores]);

  // Top 4 KPIs strictly for Kewenangan Pusat (UPG Tingkat 1 & UPG Tingkat 2)
  const pusatAuthorityStats = useMemo(() => {
    const scoped = satkerQueueRows.filter(
      (r) =>
        r.satker.upgLevel === 'UPG Tingkat 1' ||
        r.satker.upgLevel === 'UPG Tingkat 2'
    );
    const waitingCount = scoped.filter(
      (r) => r.record.status === 'Menunggu Uji'
    ).length;
    const revisionCount = scoped.filter(
      (r) => r.record.status === 'Perlu Revisi'
    ).length;
    const verifiedCount = scoped.filter(
      (r) => r.record.status === 'Terverifikasi'
    ).length;

    const mandiriVals = scoped
      .map((r) => r.mandiriPct)
      .filter((v): v is number => v !== null);
    const evalVals = scoped
      .map((r) => r.evaluatorPct)
      .filter((v): v is number => v !== null);

    const avgMandiri =
      mandiriVals.length > 0
        ? mandiriVals.reduce((a, b) => a + b, 0) / mandiriVals.length
        : null;
    const avgEval =
      evalVals.length > 0
        ? evalVals.reduce((a, b) => a + b, 0) / evalVals.length
        : null;

    return {
      total: scoped.length,
      waitingCount,
      revisionCount,
      verifiedCount,
      avgMandiri,
      avgEval,
    };
  }, [satkerQueueRows]);

  // Filter queue table
  const filteredQueueRows = useMemo(() => {
    const q = satkerSearch.trim().toLowerCase();
    return satkerQueueRows.filter((row) => {
      if (authorityScope === 'pusat') {
        if (
          row.satker.upgLevel !== 'UPG Tingkat 1' &&
          row.satker.upgLevel !== 'UPG Tingkat 2'
        ) {
          return false;
        }
      } else if (authorityScope === 'tier1') {
        if (row.satker.upgLevel !== 'UPG Tingkat 1') return false;
      } else if (authorityScope === 'tier2') {
        if (row.satker.upgLevel !== 'UPG Tingkat 2') return false;
      } else if (authorityScope === 'tier3') {
        if (row.satker.upgLevel !== 'UPG Tingkat 3') return false;
      }

      if (statusFilter !== 'ALL' && row.record.status !== statusFilter) {
        return false;
      }
      if (q && !row.satker.namaSatker.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [satkerQueueRows, authorityScope, statusFilter, satkerSearch]);

  // Open Stage 2 for selected satker
  const openSatkerWorkspace = (satkerUniqueId: string) => {
    const match = satkerQueueRows.find(
      (r) => r.satker.uniqueId === satkerUniqueId
    );
    if (!match) return;
    const rec = match.record;
    // Clone entries and refresh latest buktiUrl from mandatoryEvidences
    const clonedEntries: Record<string, MonevPusatIndicatorEntry> = {};
    MANDATORY_CONTROLS_CATALOG.forEach((ctrl) => {
      const existing = rec.entries[ctrl.code];
      const latestEv = evidenceUrlLookup.get(
        `${satkerUniqueId}::${ctrl.code}`
      );
      const freshUrl =
        latestEv?.status === 'Sudah Diisi' && isValidHttpsUrl(latestEv.buktiUrl)
          ? latestEv.buktiUrl
          : (existing?.buktiUrl ?? '');
      clonedEntries[ctrl.code] = {
        mandiriScore: existing?.mandiriScore ?? null,
        evaluatorScore: existing?.evaluatorScore ?? null,
        buktiUrl: freshUrl,
        catatanPusat: existing?.catatanPusat ?? '',
      };
    });

    const clonedQuarters: Record<string, MonevQuarters> = {};
    MANDATORY_CONTROLS_CATALOG.forEach((ctrl) => {
      const existingQ = rec.quarters[ctrl.code] ?? [
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
      ];
      clonedQuarters[ctrl.code] = [...existingQ] as MonevQuarters;
    });

    setDraftRecord({
      ...rec,
      entries: clonedEntries,
      quarters: clonedQuarters,
    });
    setActiveSatkerId(satkerUniqueId);
    setStage2Tab('evaluasi-tahunan');
  };

  const activeSatker = useMemo(
    () =>
      MASTER_SATKER_LIST.find((s) => s.uniqueId === activeSatkerId) ?? null,
    [activeSatkerId]
  );

  // Sync draft when year changes
  useEffect(() => {
    if (!activeSatkerId) return;
    const match = satkerQueueRows.find(
      (r) => r.satker.uniqueId === activeSatkerId
    );
    if (match && draftRecord && draftRecord.year !== year) {
      openSatkerWorkspace(activeSatkerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const isReadOnlyTier3 = activeSatker?.upgLevel === 'UPG Tingkat 3';

  const handleEvaluatorScoreChange = (
    code: string,
    rawVal: string
  ) => {
    if (!draftRecord || isReadOnlyTier3) return;
    const nextScore: EvaluatorStepScore | null =
      rawVal === '' ? null : (Number(rawVal) as EvaluatorStepScore);
    setDraftRecord((prev) => {
      if (!prev) return prev;
      const cur = prev.entries[code] ?? {
        mandiriScore: null,
        evaluatorScore: null,
        buktiUrl: '',
        catatanPusat: '',
      };
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [code]: {
            ...cur,
            evaluatorScore: nextScore,
          },
        },
      };
    });
  };

  const handleVerificationNoteChange = (code: string, note: string) => {
    if (!draftRecord || isReadOnlyTier3) return;
    setDraftRecord((prev) => {
      if (!prev) return prev;
      const cur = prev.entries[code] ?? {
        mandiriScore: null,
        evaluatorScore: null,
        buktiUrl: '',
        catatanPusat: '',
      };
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [code]: {
            ...cur,
            catatanPusat: note,
          },
        },
      };
    });
  };

  const handleQuarterChange = (
    code: string,
    qIdx: number,
    nextStatus: MonevQuarterStatus
  ) => {
    if (!draftRecord || isReadOnlyTier3) return;
    setDraftRecord((prev) => {
      if (!prev) return prev;
      const curTuple = prev.quarters[code] ?? [
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
      ];
      const nextTuple = [...curTuple] as MonevQuarters;
      nextTuple[qIdx] = nextStatus;
      return {
        ...prev,
        quarters: {
          ...prev.quarters,
          [code]: nextTuple,
        },
      };
    });
  };

  const handleApproveAndSave = () => {
    if (!draftRecord || !activeSatker || isReadOnlyTier3) return;

    // Auto-fill any unrated applicable indicator with its Mandiri score (or 0) only if user explicitly confirms, OR require all applicable indicators to have Evaluator score selected
    const unratedControls = MANDATORY_CONTROLS_CATALOG.filter((ctrl) => {
      if (ctrl.courtOnly && activeSatker.upgLevel === 'UPG Tingkat 1') {
        return false;
      }
      const entry = draftRecord.entries[ctrl.code];
      return (
        entry?.evaluatorScore === null || entry?.evaluatorScore === undefined
      );
    });

    if (unratedControls.length > 0) {
      pushToast(
        'warning',
        `Masih ada ${unratedControls.length} indikator yang belum diberi Nilai Evaluator (mis. kode ${unratedControls[0].code}). Lengkapi seluruh nilai atau gunakan "Isi Otomatis dari Mandiri".`
      );
      setStage2Tab('evaluasi-tahunan');
      return;
    }

    const saved: MonevPusatSatkerRecord = {
      ...draftRecord,
      key: `${year}::${activeSatker.uniqueId}`,
      year,
      status: 'Terverifikasi',
      revisionNote: '',
      updatedAt: new Date().toISOString(),
    };
    onSaveMonevPusatRecord(saved);
    setDraftRecord(saved);
    pushToast(
      'success',
      `Evaluasi & Monev PPG ${activeSatker.namaSatker} berhasil disimpan dan disahkan (Terverifikasi).`
    );
  };

  const handleAutoMatchFromMandiri = () => {
    if (!draftRecord || !activeSatker || isReadOnlyTier3) return;
    setDraftRecord((prev) => {
      if (!prev) return prev;
      const nextEntries = { ...prev.entries };
      MANDATORY_CONTROLS_CATALOG.forEach((ctrl) => {
        if (ctrl.courtOnly && activeSatker.upgLevel === 'UPG Tingkat 1') return;
        const cur = nextEntries[ctrl.code];
        if (!cur) return;
        if (cur.evaluatorScore === null || cur.evaluatorScore === undefined) {
          const m = cur.mandiriScore ?? 0;
          const snapped = (
            m >= 88 ? 100 : m >= 63 ? 75 : m >= 38 ? 50 : m >= 13 ? 25 : 0
          ) as EvaluatorStepScore;
          nextEntries[ctrl.code] = {
            ...cur,
            evaluatorScore: snapped,
          };
        }
      });
      return { ...prev, entries: nextEntries };
    });
    pushToast(
      'info',
      'Nilai Evaluator yang masih kosong telah diisi awal sesuai klaim Mandiri untuk diperiksa.'
    );
  };

  const openRevisionModal = () => {
    if (!draftRecord || isReadOnlyTier3) return;
    setRevisionNoteInput(draftRecord.revisionNote || '');
    setRevisionError(null);
    setRevisionModalOpen(true);
  };

  const handleConfirmRevision = () => {
    if (!draftRecord || !activeSatker || isReadOnlyTier3) return;
    const trimmed = revisionNoteInput.trim();
    if (!trimmed) {
      setRevisionError(
        'Catatan permintaan revisi wajib diisi agar satker mengetahui bagian yang perlu diperbaiki.'
      );
      return;
    }

    const updated: MonevPusatSatkerRecord = {
      ...draftRecord,
      key: `${year}::${activeSatker.uniqueId}`,
      year,
      status: 'Perlu Revisi',
      revisionNote: trimmed,
      updatedAt: new Date().toISOString(),
    };
    onSaveMonevPusatRecord(updated);
    setDraftRecord(updated);
    setRevisionModalOpen(false);
    pushToast(
      'warning',
      `Permintaan revisi dikirim untuk ${activeSatker.namaSatker}. Status diperbarui menjadi Perlu Revisi.`
    );
  };

  const handleExportSatkerCsv = () => {
    if (!draftRecord || !activeSatker) return;
    const header = [
      'Tahun',
      'Tingkat UPG',
      'Nama Satker',
      'Status Monev',
      'Kode Indikator',
      'Kelompok Program',
      'Program / Kegiatan / Subkegiatan',
      'Bobot (%)',
      'Nilai Mandiri (%)',
      'Nilai Evaluator (%)',
      'Capaian Terbobot (%)',
      'Bukti Dukung Satker (HTTPS)',
      'Catatan Verifikasi Pusat',
      'TW I',
      'TW II',
      'TW III',
      'TW IV',
    ];

    const rows = MANDATORY_CONTROLS_CATALOG.map((ctrl) => {
      const isNa =
        Boolean(ctrl.courtOnly) && activeSatker.upgLevel === 'UPG Tingkat 1';
      const weight = MANDATORY_CONTROL_WEIGHTS[ctrl.code] ?? 0;
      const entry = draftRecord.entries[ctrl.code];
      const q = draftRecord.quarters[ctrl.code] ?? ['—', '—', '—', '—'];
      const evalScore = entry?.evaluatorScore;
      const capaian =
        !isNa && evalScore !== null && evalScore !== undefined
          ? ((evalScore / 100) * weight).toFixed(2).replace('.', ',')
          : '—';

      return [
        year,
        activeSatker.upgLevel,
        activeSatker.namaSatker,
        draftRecord.status,
        ctrl.code,
        ctrl.programGroup,
        ctrl.name,
        isNa ? 'N/A' : weight,
        isNa ? 'N/A' : (entry?.mandiriScore ?? '—'),
        isNa ? 'N/A' : (evalScore ?? '—'),
        capaian,
        isNa ? 'Khusus Pengadilan (N/A)' : entry?.buktiUrl || 'Belum ada',
        entry?.catatanPusat || '',
        q[0],
        q[1],
        q[2],
        q[3],
      ];
    });

    downloadCsvFile(
      `Monev_PPG_${year}_${activeSatker.namaSatker.replace(/\s+/g, '_')}.csv`,
      [header, ...rows]
    );
    pushToast(
      'success',
      `Data Monev PPG ${activeSatker.namaSatker} berhasil diekspor ke CSV.`
    );
  };

  // Stage 2 live totals & quarter summary
  const stage2Totals = useMemo(() => {
    if (!draftRecord || !activeSatker) {
      return {
        mandiriPct: null,
        evaluatorPct: null,
        totalApplicableWeight: 100,
      };
    }
    return computeMonevPusatTotals(draftRecord.entries, activeSatker.upgLevel);
  }, [draftRecord, activeSatker]);

  const stage2QuarterSummary = useMemo(() => {
    if (!draftRecord || !activeSatker) return null;
    return summarizeQuarterStats(draftRecord.quarters, activeSatker.upgLevel);
  }, [draftRecord, activeSatker]);

  /* ------------------------------------------------------------------------
   * RENDER STAGE 1 OR STAGE 2
   * ---------------------------------------------------------------------- */
  return (
    <div className="space-y-5">
      {/* STAGE 1: UPG PUSAT VERIFICATION QUEUE */}
      {!activeSatker || !draftRecord ? (
        <>
          {/* Top 4 KPI Cards */}
          <section
            aria-label="Ringkasan Antrean Verifikasi Monev Pusat"
            className="grid grid-cols-4 gap-3.5 max-xl:grid-cols-2 max-sm:grid-cols-1"
          >
            <div className="rounded-[6px] border border-[#dce3eb] bg-white p-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] font-semibold text-[#52647a]">
                    Menunggu Verifikasi Pusat
                  </div>
                  <div className="mt-1.5 font-mono-num text-[26px] font-bold leading-none text-[#0F4C81] tabular-nums">
                    {pusatAuthorityStats.waitingCount}
                  </div>
                  <div className="mt-1.5 text-[11.5px] text-[#64748b] tabular-nums">
                    Dari {pusatAuthorityStats.total} satker Tingkat 1 &amp; 2
                  </div>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eaf2fc] text-[#0F4C81]">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#dce3eb] bg-white p-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] font-semibold text-[#52647a]">
                    Dalam Proses / Revisi
                  </div>
                  <div className="mt-1.5 font-mono-num text-[26px] font-bold leading-none text-[#9a6500] tabular-nums">
                    {pusatAuthorityStats.revisionCount}
                  </div>
                  <div className="mt-1.5 text-[11.5px] text-[#64748b]">
                    Memerlukan klarifikasi / bukti ulang
                  </div>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fff4d4] text-[#b7791f]">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#dce3eb] bg-white p-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] font-semibold text-[#52647a]">
                    Selesai Diverifikasi
                  </div>
                  <div className="mt-1.5 font-mono-num text-[26px] font-bold leading-none text-[#137a45] tabular-nums">
                    {pusatAuthorityStats.verifiedCount}
                  </div>
                  <div className="mt-1.5 text-[11.5px] text-[#64748b]">
                    Telah disahkan UPG Pusat
                  </div>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e3f5eb] text-[#198754]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#dce3eb] bg-white p-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
              <div className="flex items-start justify-between gap-2">
                <div className="w-full">
                  <div className="text-[12px] font-semibold text-[#52647a]">
                    Rata-Rata Nilai (Tingkat 1 &amp; 2)
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded border border-[#dce3eb] bg-[#f8fafc] px-2.5 py-1.5">
                      <div className="text-[10.5px] font-semibold text-[#64748b]">
                        Mandiri
                      </div>
                      <div className="font-mono-num text-[17px] font-bold text-[#0F4C81] tabular-nums">
                        {formatPctId(pusatAuthorityStats.avgMandiri)}
                      </div>
                    </div>
                    <div className="rounded border border-[#b7e2cb] bg-[#f4fbf7] px-2.5 py-1.5">
                      <div className="text-[10.5px] font-semibold text-[#137a45]">
                        Eval
                      </div>
                      <div className="font-mono-num text-[17px] font-bold text-[#137a45] tabular-nums">
                        {formatPctId(pusatAuthorityStats.avgEval)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Queue Card */}
          <section className="rounded-[6px] border border-[#dce3eb] bg-white p-5 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#e3e8ee] pb-3.5">
              <div>
                <h2 className="m-0 text-[16px] font-bold text-[#1d3554]">
                  Antrean Verifikasi Satker
                </h2>
                <p className="m-0 mt-1 text-[12px] text-[#64748b]">
                  UPG Pusat mengevaluasi &amp; mengesahkan UPG Tingkat 1 dan
                  Tingkat 2, sedangkan UPG Tingkat 3 dievaluasi oleh UPG Tingkat
                  2 dan dipantau secara read-only oleh Pusat.
                </p>
              </div>

              <label className="flex items-center gap-2 text-[12px] font-semibold text-[#45566c] whitespace-nowrap">
                Tahun Pelaksanaan
                <select
                  value={year}
                  onChange={(e) => onYearChange(e.target.value)}
                  className="rounded border border-[#cfd9e4] bg-[#f8fafc] px-2.5 py-1.5 font-mono-num text-[12.5px] font-bold text-[#1d3554]"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </label>
            </div>

            {/* Scope Pills + Filters */}
            <div className="mb-4 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5 rounded-[6px] border border-[#dce3eb] bg-[#f8fafc] p-1.5">
                {(
                  [
                    {
                      id: 'pusat',
                      label: 'Kewenangan Pusat (Tingkat 1 & 2)',
                    },
                    { id: 'tier1', label: 'UPG Tingkat 1 (Eselon I)' },
                    { id: 'tier2', label: 'UPG Tingkat 2 (Banding)' },
                    { id: 'tier3', label: 'Pantau Tingkat 3 (Read-Only)' },
                  ] as const
                ).map((pill) => {
                  const active = authorityScope === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setAuthorityScope(pill.id)}
                      className={`cursor-pointer rounded-[5px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#0F4C81] text-white shadow-xs'
                          : 'text-[#45566c] hover:bg-white hover:text-[#1d3554]'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-[#e3e8ee] bg-[#f8fafc] p-3">
                <label className="flex items-center gap-2 text-[12px] font-semibold text-[#45566c]">
                  Status Monev
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as 'ALL' | MonevVerificationStatus
                      )
                    }
                    className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
                  >
                    <option value="ALL">Semua Status Monev</option>
                    <option value="Menunggu Uji">Menunggu Uji</option>
                    <option value="Perlu Revisi">Perlu Revisi</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Belum Lapor">Belum Lapor</option>
                  </select>
                </label>

                <label className="relative flex flex-1 min-w-[220px] items-center">
                  <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#64748b]" />
                  <input
                    type="search"
                    value={satkerSearch}
                    onChange={(e) => setSatkerSearch(e.target.value)}
                    placeholder="Cari nama satker..."
                    aria-label="Cari nama satker pada antrean Monev"
                    className="w-full rounded border border-[#cfd9e4] bg-white py-1.5 pl-8 pr-3 text-[13px] text-[#243247]"
                  />
                </label>

                <div className="text-[12px] font-medium text-[#64748b] tabular-nums whitespace-nowrap">
                  Menampilkan{' '}
                  <strong className="text-[#1d3554]">
                    {filteredQueueRows.length}
                  </strong>{' '}
                  satker
                </div>
              </div>
            </div>

            {/* Satker Queue Table */}
            <div className="overflow-x-auto rounded-[6px] border border-[#dce3eb]">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="bg-[#0F4C81] text-white">
                    <th className="w-[52px] px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                      No.
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                      Tingkat &amp; Satuan Kerja
                    </th>
                    <th className="w-[290px] px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                      Monitoring Triwulan (TW I–IV)
                    </th>
                    <th className="w-[110px] px-3 py-2.5 text-right text-[11.5px] font-bold uppercase tracking-wide">
                      Nilai Mandiri
                    </th>
                    <th className="w-[115px] px-3 py-2.5 text-right text-[11.5px] font-bold uppercase tracking-wide">
                      Nilai Evaluator
                    </th>
                    <th className="w-[140px] px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                      Status Monev
                    </th>
                    <th className="w-[125px] px-3 py-2.5 text-right text-[11.5px] font-bold uppercase tracking-wide">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueueRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[13px] text-[#718096]"
                      >
                        Tidak ada satuan kerja yang sesuai dengan filter antrean
                        Monev.
                      </td>
                    </tr>
                  ) : (
                    filteredQueueRows.map((row, idx) => {
                      const isTier3 = row.satker.upgLevel === 'UPG Tingkat 3';
                      return (
                        <tr
                          key={row.satker.uniqueId}
                          className="border-b border-[#e3e8ee] last:border-b-0 hover:bg-[#fafcff]"
                        >
                          <td className="px-3 py-3 align-middle text-[13px] text-[#475569] tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-3 align-middle">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                                  row.satker.upgLevel === 'UPG Tingkat 1'
                                    ? 'border-[#b9d4f2] bg-[#eef5fc] text-[#0F4C81]'
                                    : row.satker.upgLevel === 'UPG Tingkat 2'
                                      ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                                      : 'border-slate-200 bg-slate-100 text-slate-700'
                                }`}
                              >
                                {row.satker.upgLevel}
                              </span>
                              <span className="text-[13px] font-semibold text-[#1d3554]">
                                {row.satker.namaSatker}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-middle">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {row.quarterSummary.quarters.map((q) => {
                                const badgeClass =
                                  q.terkendala > 0
                                    ? 'border-red-200 bg-red-50 text-red-800'
                                    : q.pct >= 80
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                      : q.pct > 0 || q.dalamProses > 0
                                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                                        : 'border-slate-200 bg-slate-50 text-slate-600';
                                return (
                                  <span
                                    key={q.label}
                                    title={`${q.label}: ${q.selesai}/${q.scheduled} Selesai, ${q.dalamProses} Proses, ${q.terkendala} Terkendala`}
                                    className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono-num text-[11px] font-semibold tabular-nums whitespace-nowrap ${badgeClass}`}
                                  >
                                    {q.label.replace(' ', '')}{' '}
                                    {Math.round(q.pct)}%
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right align-middle font-mono-num text-[13px] font-semibold text-[#0F4C81] tabular-nums whitespace-nowrap">
                            {formatPctId(row.mandiriPct)}
                          </td>
                          <td className="px-3 py-3 text-right align-middle font-mono-num text-[13px] font-semibold text-[#137a45] tabular-nums whitespace-nowrap">
                            {formatPctId(row.evaluatorPct)}
                          </td>
                          <td className="px-3 py-3 align-middle whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded border px-2.5 py-0.5 text-[11px] font-semibold ${getMonevStatusBadgeClass(
                                row.record.status
                              )}`}
                            >
                              {row.record.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right align-middle whitespace-nowrap">
                            {isTier3 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openSatkerWorkspace(row.satker.uniqueId)
                                }
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-[#0F4C81] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0F4C81] transition-colors hover:bg-[#eef5fc] whitespace-nowrap"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Pantau</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openSatkerWorkspace(row.satker.uniqueId)
                                }
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-[#0F4C81] bg-[#0F4C81] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#0b3a63] whitespace-nowrap"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Verifikasi</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        /* STAGE 2: SATKER VERIFICATION WORKSPACE */
        <>
          {/* Top Action & Identity Card */}
          <section className="rounded-[6px] border border-[#dce3eb] bg-white p-5 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSatkerId(null);
                      setDraftRecord(null);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#cfd9e4] bg-[#f8fafc] px-2.5 py-1 text-[12px] font-semibold text-[#334155] hover:bg-[#eef3f8] whitespace-nowrap"
                  >
                    <span>← Daftar Antrean</span>
                  </button>

                  <span className="inline-flex items-center rounded border border-[#b9d4f2] bg-[#eef5fc] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#0F4C81] whitespace-nowrap">
                    {activeSatker.upgLevel}
                  </span>

                  <span
                    className={`inline-flex items-center rounded border px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap ${getMonevStatusBadgeClass(
                      draftRecord.status
                    )}`}
                  >
                    {draftRecord.status}
                  </span>

                  {isReadOnlyTier3 && (
                    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-slate-700 whitespace-nowrap">
                      <Lock className="h-3 w-3" />
                      <span>Pantau Read-Only</span>
                    </span>
                  )}
                </div>

                <h2 className="m-0 text-[18px] font-bold text-[#1d3554]">
                  {activeSatker.namaSatker}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Live Separated Score Pill */}
                <div className="inline-flex items-center gap-2 rounded-[6px] border border-[#dce3eb] bg-[#f8fafc] px-3.5 py-2 font-mono-num text-[13px] font-bold tabular-nums whitespace-nowrap">
                  <span className="text-[#0F4C81]">
                    Mandiri: {formatPctId(stage2Totals.mandiriPct)}
                  </span>
                  <span className="text-[#cbd5e1]" aria-hidden="true">
                    |
                  </span>
                  <span className="text-[#137a45]">
                    Evaluator: {formatPctId(stage2Totals.evaluatorPct)}
                  </span>
                </div>

                {!isReadOnlyTier3 && (
                  <>
                    <button
                      type="button"
                      onClick={openRevisionModal}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-[#d99116] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#9a6500] transition-colors hover:bg-[#fff8e8] whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Minta Revisi</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApproveAndSave}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-[#0F4C81] bg-[#0F4C81] px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#0b3a63] whitespace-nowrap shrink-0"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Simpan &amp; Sahkan</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleExportSatkerCsv}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-[#198754] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#137a45] transition-colors hover:bg-[#edf8f2] whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {draftRecord.revisionNote && (
              <div className="mt-3 rounded-[5px] border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-900">
                <strong>Catatan Permintaan Revisi:</strong>{' '}
                {draftRecord.revisionNote}
              </div>
            )}

            {/* Stage 2 Sub-Tabs */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e8ee] pt-3.5">
              <div
                className="flex flex-wrap items-center gap-2"
                role="tablist"
                aria-label="Matriks Verifikasi Satker"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={stage2Tab === 'evaluasi-tahunan'}
                  onClick={() => setStage2Tab('evaluasi-tahunan')}
                  className={`cursor-pointer rounded-[5px] border px-3.5 py-2 text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    stage2Tab === 'evaluasi-tahunan'
                      ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
                      : 'border-[#dce3eb] bg-[#f8fafc] text-[#45566c] hover:bg-[#eef3f8]'
                  }`}
                >
                  1. Matriks Evaluasi Tahunan PPG
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={stage2Tab === 'monitoring-triwulan'}
                  onClick={() => setStage2Tab('monitoring-triwulan')}
                  className={`cursor-pointer rounded-[5px] border px-3.5 py-2 text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    stage2Tab === 'monitoring-triwulan'
                      ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
                      : 'border-[#dce3eb] bg-[#f8fafc] text-[#45566c] hover:bg-[#eef3f8]'
                  }`}
                >
                  2. Matriks Monitoring Triwulanan (TW I–IV)
                </button>
              </div>

              {stage2Tab === 'evaluasi-tahunan' && !isReadOnlyTier3 && (
                <button
                  type="button"
                  onClick={handleAutoMatchFromMandiri}
                  className="cursor-pointer rounded border border-[#cfd9e4] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0F4C81] hover:bg-[#f0f6fd] whitespace-nowrap"
                >
                  Isi Awal Nilai Kosong dari Mandiri
                </button>
              )}
            </div>
          </section>

          {/* SUB-TAB 1: 1. Matriks Evaluasi Tahunan PPG (Compact 6-column table, no horizontal scroll) */}
          {stage2Tab === 'evaluasi-tahunan' && (
            <section className="rounded-[6px] border border-[#dce3eb] bg-white p-5 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
              <div className="overflow-hidden rounded-[6px] border border-[#dce3eb]">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-[#0F4C81] text-white">
                      <th className="w-[34%] px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                        Program / Kegiatan / Subkegiatan
                      </th>
                      <th className="w-[13%] px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                        Bukti Dukung Satker
                      </th>
                      <th className="w-[9%] px-3 py-2.5 text-center text-[11.5px] font-bold uppercase tracking-wide">
                        Mandiri
                      </th>
                      <th className="w-[12%] px-3 py-2.5 text-center text-[11.5px] font-bold uppercase tracking-wide">
                        Nilai Evaluator
                      </th>
                      <th className="w-[10%] px-3 py-2.5 text-right text-[11.5px] font-bold uppercase tracking-wide">
                        Capaian
                      </th>
                      <th className="w-[22%] px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                        Catatan Verifikasi Pusat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MANDATORY_PROGRAM_GROUPS.map((groupName) => {
                      const groupControls = MANDATORY_CONTROLS_CATALOG.filter(
                        (c) => c.programGroup === groupName
                      );
                      const groupTotalWeight = groupControls.reduce((sum, c) => {
                        if (
                          c.courtOnly &&
                          activeSatker.upgLevel === 'UPG Tingkat 1'
                        ) {
                          return sum;
                        }
                        return sum + (MANDATORY_CONTROL_WEIGHTS[c.code] ?? 0);
                      }, 0);

                      const groupEarnedWeight = groupControls.reduce((sum, c) => {
                        if (
                          c.courtOnly &&
                          activeSatker.upgLevel === 'UPG Tingkat 1'
                        ) {
                          return sum;
                        }
                        const weight = MANDATORY_CONTROL_WEIGHTS[c.code] ?? 0;
                        const evalScore =
                          draftRecord.entries[c.code]?.evaluatorScore;
                        if (evalScore === null || evalScore === undefined) {
                          return sum;
                        }
                        return sum + (evalScore / 100) * weight;
                      }, 0);

                      return (
                        <React.Fragment key={groupName}>
                          {/* Pillar Header Row */}
                          <tr className="border-b border-[#d6e2ec] bg-[#eef4fb]">
                            <td
                              colSpan={4}
                              className="px-3 py-2 text-[12.5px] font-bold text-[#0F4C81]"
                            >
                              {PILLAR_DISPLAY_TITLES[groupName]}
                            </td>
                            <td className="px-3 py-2 text-right font-mono-num text-[12px] font-bold text-[#0F4C81] tabular-nums">
                              {groupEarnedWeight.toFixed(1).replace('.', ',')}% /{' '}
                              {groupTotalWeight}%
                            </td>
                            <td className="px-3 py-2 text-[11px] text-[#52647a]">
                              Bobot Pilar: {groupTotalWeight}%
                            </td>
                          </tr>

                          {/* Control Rows */}
                          {groupControls.map((ctrl) => {
                            const isNa = Boolean(
                              ctrl.courtOnly &&
                                activeSatker.upgLevel === 'UPG Tingkat 1'
                            );
                            const weight =
                              MANDATORY_CONTROL_WEIGHTS[ctrl.code] ?? 0;
                            const entry = draftRecord.entries[ctrl.code] ?? {
                              mandiriScore: null,
                              evaluatorScore: null,
                              buktiUrl: '',
                              catatanPusat: '',
                            };
                            const hasUrl =
                              Boolean(entry.buktiUrl) &&
                              isValidHttpsUrl(entry.buktiUrl);
                            const weightedCapaian =
                              !isNa &&
                              entry.evaluatorScore !== null &&
                              entry.evaluatorScore !== undefined
                                ? (entry.evaluatorScore / 100) * weight
                                : null;

                            return (
                              <tr
                                key={ctrl.code}
                                className={`border-b border-[#e3e8ee] last:border-b-0 ${
                                  isNa ? 'bg-[#fafbfc]' : 'hover:bg-[#fafcff]'
                                }`}
                              >
                                {/* Col 1: Program / Kegiatan / Subkegiatan */}
                                <td className="px-3 py-2.5 align-top">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex rounded bg-[#e7f0fc] px-1.5 py-0.5 font-mono-num text-[11px] font-bold text-[#0F4C81] tabular-nums">
                                      {ctrl.code}
                                    </span>
                                    <span className="text-[11px] font-semibold text-[#64748b] tabular-nums">
                                      Bobot Indikator:{' '}
                                      {isNa ? 'N/A' : `${weight}%`}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[12.5px] font-medium leading-snug text-[#1d3554]">
                                    {ctrl.name}
                                  </div>
                                </td>

                                {/* Col 2: Bukti Dukung Satker */}
                                <td className="px-3 py-2.5 align-top">
                                  {isNa ? (
                                    <span className="text-[11.5px] text-[#64748b]">
                                      Khusus Pengadilan
                                    </span>
                                  ) : hasUrl ? (
                                    <a
                                      href={entry.buktiUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded border border-[#b9d4f2] bg-[#f4f8fe] px-2 py-1 text-[11.5px] font-semibold text-[#0F4C81] hover:bg-[#e5effc] whitespace-nowrap"
                                    >
                                      <span>Buka Bukti ↗</span>
                                    </a>
                                  ) : (
                                    <span className="text-[11.5px] text-[#94a3b8]">
                                      Belum ada
                                    </span>
                                  )}
                                </td>

                                {/* Col 3: Mandiri (Locked Read-Only Score Badge) */}
                                <td className="px-3 py-2.5 text-center align-top">
                                  {isNa ? (
                                    <span className="inline-flex rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono-num text-[11.5px] font-semibold text-slate-500">
                                      N/A
                                    </span>
                                  ) : entry.mandiriScore !== null &&
                                    entry.mandiriScore !== undefined ? (
                                    <span className="inline-flex rounded border border-[#dce3eb] bg-[#f8fafc] px-2 py-0.5 font-mono-num text-[12px] font-bold text-[#334155] tabular-nums">
                                      {entry.mandiriScore}
                                    </span>
                                  ) : (
                                    <span className="font-mono-num text-[12px] text-[#94a3b8]">
                                      —
                                    </span>
                                  )}
                                </td>

                                {/* Col 4: Nilai Evaluator (Interactive 0, 25, 50, 75, 100) */}
                                <td className="px-3 py-2.5 text-center align-top">
                                  {isNa ? (
                                    <span className="text-[11.5px] text-[#64748b]">
                                      N/A
                                    </span>
                                  ) : isReadOnlyTier3 ? (
                                    <span className="inline-flex rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono-num text-[12px] font-bold text-emerald-800 tabular-nums">
                                      {entry.evaluatorScore ?? '—'}
                                    </span>
                                  ) : (
                                    <select
                                      aria-label={`Nilai Evaluator ${ctrl.code}`}
                                      value={
                                        entry.evaluatorScore === null ||
                                        entry.evaluatorScore === undefined
                                          ? ''
                                          : String(entry.evaluatorScore)
                                      }
                                      onChange={(e) =>
                                        handleEvaluatorScoreChange(
                                          ctrl.code,
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded border border-[#9cc2e5] bg-white px-2 py-1 font-mono-num text-[12.5px] font-bold text-[#0F4C81]"
                                    >
                                      <option value="">— Pilih —</option>
                                      {EVALUATOR_STEP_OPTIONS.map((val) => (
                                        <option key={val} value={val}>
                                          {val}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </td>

                                {/* Col 5: Capaian (Auto-calculated weighted score) */}
                                <td className="px-3 py-2.5 text-right align-top font-mono-num text-[12.5px] font-bold text-[#137a45] tabular-nums">
                                  {isNa
                                    ? 'N/A'
                                    : weightedCapaian !== null
                                      ? `${weightedCapaian
                                          .toFixed(2)
                                          .replace('.', ',')}%`
                                      : '—'}
                                </td>

                                {/* Col 6: Catatan Verifikasi Pusat */}
                                <td className="px-3 py-2.5 align-top">
                                  {isNa ? (
                                    <span className="text-[11.5px] text-[#64748b]">
                                      Otomatis N/A
                                    </span>
                                  ) : isReadOnlyTier3 ? (
                                    <span className="text-[12px] text-[#475569]">
                                      {entry.catatanPusat || '—'}
                                    </span>
                                  ) : (
                                    <input
                                      type="text"
                                      value={entry.catatanPusat}
                                      onChange={(e) =>
                                        handleVerificationNoteChange(
                                          ctrl.code,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Catatan verifikasi..."
                                      aria-label={`Catatan Verifikasi Pusat ${ctrl.code}`}
                                      className="w-full rounded border border-[#cfd9e4] bg-white px-2.5 py-1 text-[12px] text-[#243247]"
                                    />
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SUB-TAB 2: 2. Matriks Monitoring Triwulanan (TW I–IV) */}
          {stage2Tab === 'monitoring-triwulan' && stage2QuarterSummary && (
            <section className="space-y-4">
              {/* 5 Progress Summary Cards AT THE TOP */}
              <div className="grid grid-cols-5 gap-3 max-xl:grid-cols-3 max-sm:grid-cols-1">
                {stage2QuarterSummary.quarters.map((q) => (
                  <div
                    key={q.label}
                    className="rounded-[6px] border border-[#dce3eb] bg-white p-3.5 shadow-[0_2px_5px_rgba(38,56,75,0.03)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#0F4C81]">
                        {q.label}
                      </span>
                      <span className="font-mono-num text-[17px] font-bold text-[#1d3554] tabular-nums">
                        {formatPctId(q.pct, 0)}
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e9eef4]">
                      <div
                        className="h-full rounded-full bg-[#0F4C81] transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0, q.pct))}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11.5px] tabular-nums">
                      <span className="font-semibold text-[#137a45]">
                        {q.selesai} / {q.scheduled} Selesai
                      </span>
                      <span
                        className={`font-semibold ${
                          q.terkendala > 0
                            ? 'text-[#b4232c]'
                            : 'text-[#64748b]'
                        }`}
                      >
                        {q.terkendala} Kendala
                      </span>
                    </div>
                  </div>
                ))}

                {/* 5th Card: Capaian Tahunan */}
                <div className="rounded-[6px] border border-[#b9d4f2] bg-[#f4f8fe] p-3.5 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0F4C81]">
                      Capaian Tahunan
                    </span>
                    <span className="font-mono-num text-[17px] font-bold text-[#0F4C81] tabular-nums">
                      {formatPctId(stage2QuarterSummary.overallPct, 1)}
                    </span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#dbe7f6]">
                    <div
                      className="h-full rounded-full bg-[#198754] transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, stage2QuarterSummary.overallPct)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11.5px] tabular-nums">
                    <span className="font-semibold text-[#1d3554]">
                      {stage2QuarterSummary.totalSelesai} /{' '}
                      {stage2QuarterSummary.totalScheduled} Selesai
                    </span>
                    <span
                      className={`font-semibold ${
                        stage2QuarterSummary.totalTerkendala > 0
                          ? 'text-[#b4232c]'
                          : 'text-[#64748b]'
                      }`}
                    >
                      {stage2QuarterSummary.totalTerkendala} Kendala
                    </span>
                  </div>
                </div>
              </div>

              {/* Quarterly Monitoring Matrix Table */}
              <div className="rounded-[6px] border border-[#dce3eb] bg-white p-5 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
                <div className="overflow-x-auto rounded-[6px] border border-[#dce3eb]">
                  <table className="w-full min-w-[820px] border-collapse">
                    <thead>
                      <tr className="bg-[#0F4C81] text-white">
                        <th className="w-[70px] px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                          Kode
                        </th>
                        <th className="px-3 py-2.5 text-left text-[11.5px] font-bold uppercase tracking-wide">
                          Program / Kegiatan / Subkegiatan
                        </th>
                        <th className="w-[140px] px-3 py-2.5 text-center text-[11.5px] font-bold uppercase tracking-wide">
                          TW I
                        </th>
                        <th className="w-[140px] px-3 py-2.5 text-center text-[11.5px] font-bold uppercase tracking-wide">
                          TW II
                        </th>
                        <th className="w-[140px] px-3 py-2.5 text-center text-[11.5px] font-bold uppercase tracking-wide">
                          TW III
                        </th>
                        <th className="w-[140px] px-3 py-2.5 text-center text-[11.5px] font-bold uppercase tracking-wide">
                          TW IV
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MANDATORY_PROGRAM_GROUPS.map((groupName) => {
                        const groupControls = MANDATORY_CONTROLS_CATALOG.filter(
                          (c) => c.programGroup === groupName
                        );
                        return (
                          <React.Fragment key={groupName}>
                            <tr className="border-b border-[#d6e2ec] bg-[#eef4fb]">
                              <td
                                colSpan={6}
                                className="px-3 py-2 text-[12.5px] font-bold text-[#0F4C81]"
                              >
                                {PILLAR_DISPLAY_TITLES[groupName]}
                              </td>
                            </tr>

                            {groupControls.map((ctrl) => {
                              const isNa = Boolean(
                                ctrl.courtOnly &&
                                  activeSatker.upgLevel === 'UPG Tingkat 1'
                              );
                              const tuple = draftRecord.quarters[ctrl.code] ?? [
                                'Belum Dimulai',
                                'Belum Dimulai',
                                'Belum Dimulai',
                                'Belum Dimulai',
                              ];
                              return (
                                <tr
                                  key={ctrl.code}
                                  className="border-b border-[#e3e8ee] last:border-b-0 hover:bg-[#fafcff]"
                                >
                                  <td className="px-3 py-2 align-middle font-mono-num text-[12px] font-bold text-[#0F4C81] tabular-nums">
                                    {ctrl.code}
                                  </td>
                                  <td className="px-3 py-2 align-middle text-[12.5px] text-[#1d3554]">
                                    {ctrl.name}
                                  </td>
                                  {[0, 1, 2, 3].map((qIdx) => {
                                    const st = isNa ? '—' : tuple[qIdx];
                                    return (
                                      <td
                                        key={qIdx}
                                        className={`border-l border-[#e3e8ee] px-2 py-2 text-center text-[12px] ${getQuarterStatusStyle(
                                          st
                                        )}`}
                                      >
                                        {isNa ? (
                                          <span className="text-[#64748b]">
                                            N/A
                                          </span>
                                        ) : isReadOnlyTier3 ? (
                                          <span>{st}</span>
                                        ) : (
                                          <select
                                            aria-label={`${ctrl.code} TW ${qIdx + 1}`}
                                            value={st}
                                            onChange={(e) =>
                                              handleQuarterChange(
                                                ctrl.code,
                                                qIdx,
                                                e.target
                                                  .value as MonevQuarterStatus
                                              )
                                            }
                                            className="w-full rounded border border-[#cfd9e4] bg-white px-1.5 py-1 text-[11.5px] font-medium text-[#243247]"
                                          >
                                            {MONEV_STATUS_OPTIONS.map((opt) => (
                                              <option key={opt} value={opt}>
                                                {opt === '—'
                                                  ? '— (Tdk Dijadwalkan)'
                                                  : opt}
                                              </option>
                                            ))}
                                          </select>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Custom Modal for "Minta Revisi" */}
      <Modal
        open={revisionModalOpen}
        title={
          activeSatker
            ? `Minta Revisi Monev PPG — ${activeSatker.namaSatker}`
            : 'Minta Revisi'
        }
        onClose={() => {
          setRevisionModalOpen(false);
          setRevisionError(null);
        }}
        onSave={handleConfirmRevision}
        saveLabel="Kirim Permintaan Revisi"
      >
        <div className="space-y-3 text-[13px] text-[#243247]">
          <p className="m-0 text-[#52647a]">
            Status satuan kerja akan diperbarui menjadi{' '}
            <strong className="text-[#9a6500]">Perlu Revisi</strong> dan catatan
            di bawah akan ditampilkan sebagai arahan perbaikan dari UPG Pusat.
          </p>

          {revisionError && (
            <div
              role="alert"
              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-800"
            >
              {revisionError}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-[#45566c]">
              Catatan Perbaikan / Klarifikasi yang Diminta
            </span>
            <textarea
              rows={4}
              value={revisionNoteInput}
              onChange={(e) => {
                setRevisionNoteInput(e.target.value);
                setRevisionError(null);
              }}
              placeholder="Contoh: Mohon unggah ulang tautan bukti dukung SK Tim UPG dan daftar hadir sosialisasi TW I..."
              className="w-full rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
            />
          </label>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

/* ============================================================================
 * EXISTING TIER MONEV VIEW (UPG Tingkat 1 & UPG Tingkat 2)
 * ==========================================================================*/
function TierMonevView({
  year,
  onYearChange,
  userRole,
  monevRecords,
  annualRecords,
  onSaveMonev,
  onSaveAnnualRecord,
}: {
  year: string;
  onYearChange: (year: string) => void;
  userRole: UserRole;
  monevRecords: Record<string, MonevSatkerRecord>;
  annualRecords: Record<string, AnnualEvalSatkerRecord>;
  onSaveMonev: (record: MonevSatkerRecord) => void;
  onSaveAnnualRecord: (record: AnnualEvalSatkerRecord) => void;
}) {
  const canEdit =
    userRole === 'UPG Tingkat 1' ||
    userRole === 'UPG Tingkat 2' ||
    userRole === 'UPG Pusat';
  const allowedUpgLevels: UpgLevel[] =
    userRole === 'UPG Tingkat 2'
      ? ['UPG Tingkat 3']
      : userRole === 'UPG Tingkat 1'
        ? ['UPG Tingkat 2', 'UPG Tingkat 3']
        : UPG_LEVELS;
  const isSingleLevelLocked = allowedUpgLevels.length === 1;

  const [activeTab, setActiveTab] = useState<MonevViewTab>('tahunan');
  const [selectedUpg, setSelectedUpg] = useState<UpgLevel>(() =>
    userRole === 'UPG Tingkat 2' ? 'UPG Tingkat 3' : 'UPG Tingkat 2'
  );
  const effectiveUpg: UpgLevel = allowedUpgLevels.includes(selectedUpg)
    ? selectedUpg
    : allowedUpgLevels[0];
  const satkersForLevel = MASTER_SATKER_LIST.filter(
    (s) => s.upgLevel === effectiveUpg
  );
  const [selectedSatkerId, setSelectedSatkerId] = useState<string>(
    satkersForLevel[0]?.uniqueId ?? MASTER_SATKER_LIST[0].uniqueId
  );

  useEffect(() => {
    const scopeLevels: UpgLevel[] =
      userRole === 'UPG Tingkat 2'
        ? ['UPG Tingkat 3']
        : userRole === 'UPG Tingkat 1'
          ? ['UPG Tingkat 2', 'UPG Tingkat 3']
          : UPG_LEVELS;

    if (!scopeLevels.includes(selectedUpg)) {
      const nextUpg = scopeLevels[0];
      setSelectedUpg(nextUpg);
      const list = MASTER_SATKER_LIST.filter((s) => s.upgLevel === nextUpg);
      if (list.length > 0) {
        setSelectedSatkerId(list[0].uniqueId);
      }
      setIsEditing(false);
    }
  }, [userRole, selectedUpg]);

  const selectedSatker =
    satkersForLevel.find((s) => s.uniqueId === selectedSatkerId) ??
    satkersForLevel[0] ??
    MASTER_SATKER_LIST[0];

  const recordKey = `${year}::${selectedSatker.uniqueId}`;

  const savedAnnualRecord =
    annualRecords[recordKey] ??
    createDefaultAnnualEvalRecord(year, selectedSatker);
  const savedTriwulanRecord =
    monevRecords[recordKey] ?? createDefaultMonevRecord(year, selectedSatker);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [annualDraft, setAnnualDraft] =
    useState<AnnualEvalSatkerRecord>(savedAnnualRecord);
  const [triwulanDraft, setTriwulanDraft] =
    useState<MonevSatkerRecord>(savedTriwulanRecord);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const nextAnnual =
      annualRecords[`${year}::${selectedSatker.uniqueId}`] ??
      createDefaultAnnualEvalRecord(year, selectedSatker);
    setAnnualDraft({
      ...nextAnnual,
      entries: Object.fromEntries(
        Object.entries(nextAnnual.entries).map(([k, v]) => [k, { ...v }])
      ),
    });

    const nextTriwulan =
      monevRecords[`${year}::${selectedSatker.uniqueId}`] ??
      createDefaultMonevRecord(year, selectedSatker);
    setTriwulanDraft({
      ...nextTriwulan,
      statuses: Object.fromEntries(
        Object.entries(nextTriwulan.statuses).map(([k, v]) => [k, [...v]])
      ),
    });
    setSavedToast(null);
    setValidationError(null);
  }, [year, selectedSatker, annualRecords, monevRecords]);

  const handleUpgChange = (nextUpg: UpgLevel) => {
    setSelectedUpg(nextUpg);
    const list = MASTER_SATKER_LIST.filter((s) => s.upgLevel === nextUpg);
    if (list.length > 0) {
      setSelectedSatkerId(list[0].uniqueId);
    }
    setIsEditing(false);
  };

  const handleAnnualEntryChange = (
    code: string,
    patch: Partial<AnnualEvalEntry>
  ) => {
    setAnnualDraft((prev) => {
      const current = prev.entries[code] ?? {
        score: '',
        valid: 'Belum diisi' as ApplicabilityStatus,
        evidence: '',
        note: '',
      };
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [code]: { ...current, ...patch },
        },
      };
    });
    setSavedToast(null);
    setValidationError(null);
  };

  const handleTriwulanCellChange = (
    activityCode: string,
    qIndex: number,
    status: MonevQuarterStatus
  ) => {
    setTriwulanDraft((prev) => {
      const currentTuple = prev.statuses[activityCode] ?? [
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
        'Belum Dimulai',
      ];
      const nextTuple = [...currentTuple] as [
        MonevQuarterStatus,
        MonevQuarterStatus,
        MonevQuarterStatus,
        MonevQuarterStatus,
      ];
      nextTuple[qIndex] = status;
      return {
        ...prev,
        statuses: {
          ...prev.statuses,
          [activityCode]: nextTuple,
        },
      };
    });
    setSavedToast(null);
  };

  const handleSave = () => {
    if (!canEdit) return;

    if (activeTab === 'tahunan') {
      for (const act of MONEV_ACTIVITIES) {
        const entry = annualDraft.entries[act.code];
        if (entry && entry.score !== '') {
          const num = Number(entry.score);
          const maxW = act.weight ?? 100;
          if (Number.isNaN(num) || num < 0 || num > maxW) {
            setValidationError(
              `Nilai Perolehan pada kegiatan ${act.code} (${act.name}) harus antara 0 dan ${maxW}.`
            );
            return;
          }
        }
      }

      const toSave: AnnualEvalSatkerRecord = {
        ...annualDraft,
        key: `${year}::${selectedSatker.uniqueId}`,
        year,
        satkerUniqueId: selectedSatker.uniqueId,
        upgLevel: selectedSatker.upgLevel,
        kodeSatker: selectedSatker.kodeSatker,
        namaSatker: selectedSatker.namaSatker,
        updatedAt: new Date().toISOString(),
      };
      onSaveAnnualRecord(toSave);
      setIsEditing(false);
      setValidationError(null);
      setSavedToast(
        `Evaluasi Tahunan Monev PPG Tahun ${year} untuk [${selectedSatker.upgLevel}] ${selectedSatker.namaSatker} berhasil disimpan.`
      );
      return;
    }

    const toSaveTriwulan: MonevSatkerRecord = {
      ...triwulanDraft,
      key: `${year}::${selectedSatker.uniqueId}`,
      year,
      satkerUniqueId: selectedSatker.uniqueId,
      upgLevel: selectedSatker.upgLevel,
      kodeSatker: selectedSatker.kodeSatker,
      namaSatker: selectedSatker.namaSatker,
      updatedAt: new Date().toISOString(),
    };
    onSaveMonev(toSaveTriwulan);
    setIsEditing(false);
    setValidationError(null);
    setSavedToast(
      `Monitoring Triwulanan Monev PPG Tahun ${year} untuk [${selectedSatker.upgLevel}] ${selectedSatker.namaSatker} berhasil disimpan.`
    );
  };

  const activeAnnual = isEditing ? annualDraft : savedAnnualRecord;
  const activeTriwulan = isEditing ? triwulanDraft : savedTriwulanRecord;

  const bobotDasar =
    selectedSatker.upgLevel === 'UPG Tingkat 1'
      ? '100%'
      : selectedSatker.upgLevel === 'UPG Tingkat 2'
        ? '63%'
        : '60,5%';

  const allAnnualComplete = MONEV_ACTIVITIES.every((act) => {
    const e = activeAnnual.entries[act.code];
    return e && e.valid !== 'Belum diisi' && e.score !== '';
  });

  const totalItemWeight = MONEV_ACTIVITIES.reduce(
    (sum, act) => sum + (act.weight ?? 0),
    0
  );
  const totalObtained = MONEV_ACTIVITIES.reduce((sum, act) => {
    const val = activeAnnual.entries[act.code]?.score;
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  const capaianTahunan = allAnnualComplete
    ? `${((totalObtained / totalItemWeight) * 100).toFixed(1)}%`
    : 'Belum lengkap';

  const quarterStats = [0, 1, 2, 3].map((qIdx) => {
    let selesai = 0;
    let dalamProses = 0;
    let belumDimulai = 0;
    let terkendala = 0;
    let tidakDijadwalkan = 0;

    MONEV_ACTIVITIES.forEach((act) => {
      const st = activeTriwulan.statuses[act.code]?.[qIdx] ?? 'Belum Dimulai';
      if (st === 'Selesai') selesai += 1;
      else if (st === 'Dalam Proses') dalamProses += 1;
      else if (st === 'Terkendala') terkendala += 1;
      else if (st === '—') tidakDijadwalkan += 1;
      else belumDimulai += 1;
    });

    const scheduled = MONEV_ACTIVITIES.length - tidakDijadwalkan;
    const pct = scheduled > 0 ? ((selesai / scheduled) * 100).toFixed(0) : '0';

    return {
      label: `TW ${['I', 'II', 'III', 'IV'][qIdx]}`,
      selesai,
      dalamProses,
      belumDimulai,
      terkendala,
      tidakDijadwalkan,
      scheduled,
      pct,
    };
  });

  const totalScheduledCells = quarterStats.reduce(
    (sum, q) => sum + q.scheduled,
    0
  );
  const totalCompletedCells = quarterStats.reduce(
    (sum, q) => sum + q.selesai,
    0
  );
  const overallCompletionPct =
    totalScheduledCells > 0
      ? ((totalCompletedCells / totalScheduledCells) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#dce3eb] bg-white px-4 py-3 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('tahunan');
              setIsEditing(false);
            }}
            className={`cursor-pointer rounded border px-3 py-1.5 text-[12px] font-bold transition-colors ${
              activeTab === 'tahunan'
                ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
                : 'border-[#ccd7e3] bg-[#f8fafc] text-[#45566c] hover:bg-[#edf2f7]'
            }`}
          >
            Matriks Evaluasi Tahunan PPG
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('triwulanan');
              setIsEditing(false);
            }}
            className={`cursor-pointer rounded border px-3 py-1.5 text-[12px] font-bold transition-colors ${
              activeTab === 'triwulanan'
                ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
                : 'border-[#ccd7e3] bg-[#f8fafc] text-[#45566c] hover:bg-[#edf2f7]'
            }`}
          >
            Matriks Monitoring Triwulanan (TW I–IV)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  isEditing
                    ? 'border-[#d99116] bg-[#fff8e8] text-[#9a6500]'
                    : 'border-[#0F4C81] bg-white text-[#0F4C81] hover:bg-[#eef5fc]'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Mode Edit Aktif' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#0F4C81] bg-[#0F4C81] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0b3a63]"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Monev</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#08a9c4] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd]"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / PDF</span>
          </button>

          <button
            type="button"
            onClick={() =>
              activeTab === 'tahunan'
                ? exportAnnualMonevExcel(activeAnnual)
                : exportMonevExcel(activeTriwulan)
            }
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#198754] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#137a45] hover:bg-[#edf8f2]"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="no-print flex items-center gap-2 rounded border border-[#b7e2cb] bg-[#e3f5eb] px-3.5 py-2.5 text-[12px] font-medium text-[#135c35]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {validationError && (
        <div className="no-print rounded border border-[#f5c2c7] bg-[#fde8e8] px-3.5 py-2.5 text-[12px] font-medium text-[#b4232c]">
          {validationError}
        </div>
      )}

      {activeTab === 'tahunan' && (
        <div className="overflow-hidden rounded-[4px] border border-[#dce3eb] bg-white shadow-[0_2px_5px_rgba(38,56,75,0.04)]">
          <div className="bg-[#0F4C81] px-3.5 py-2 text-[14px] font-bold uppercase tracking-wide text-white">
            MATRIKS EVALUASI TAHUNAN PROGRAM PENGENDALIAN GRATIFIKASI
          </div>

          <div className="grid grid-cols-12 gap-x-4 gap-y-1.5 border-b border-[#e3e8ee] px-3.5 py-2.5 text-[12.5px] max-lg:grid-cols-1">
            <div className="col-span-6 space-y-1.5 max-lg:col-span-1">
              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <span className="text-[#243247]">Tahun evaluasi</span>
                <select
                  value={year}
                  onChange={(e) => onYearChange(e.target.value)}
                  className="w-full max-w-[260px] border-0 bg-[#e4f0fa] px-2.5 py-1 text-[12.5px] font-medium text-[#243247] focus:outline-none"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <span className="text-[#243247]">Tingkat UPG</span>
                <select
                  value={effectiveUpg}
                  disabled={isSingleLevelLocked}
                  onChange={(e) => handleUpgChange(e.target.value as UpgLevel)}
                  className="w-full max-w-[260px] border-0 bg-[#e4f0fa] px-2.5 py-1 text-[12.5px] font-medium text-[#243247] focus:outline-none disabled:font-semibold"
                >
                  {allowedUpgLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                <span className="text-[#243247]">Nama Satker</span>
                <select
                  value={selectedSatker.uniqueId}
                  onChange={(e) => {
                    setSelectedSatkerId(e.target.value);
                    setIsEditing(false);
                  }}
                  className="w-full max-w-[380px] border-0 bg-[#e4f0fa] px-2.5 py-1 text-[12.5px] font-medium text-[#243247] focus:outline-none"
                >
                  {satkersForLevel.map((sat) => (
                    <option key={sat.uniqueId} value={sat.uniqueId}>
                      {sat.namaSatker}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-6 space-y-1.5 max-lg:col-span-1">
              <div className="grid grid-cols-[180px_1fr] items-center gap-2">
                <span className="text-[#243247]">Bobot dasar penilaian (%)</span>
                <span className="font-mono-num font-bold text-[#1d3554]">
                  {bobotDasar}
                </span>
              </div>

              <div className="grid grid-cols-[180px_1fr] items-center gap-2">
                <span className="text-[#243247]">Capaian tahunan</span>
                <div className="w-full max-w-[180px] bg-[#e4f0fa] px-2.5 py-1 text-[12.5px] font-bold text-[#111827]">
                  {capaianTahunan}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-[#0F4C81] text-white">
                  <th className="w-[58px] px-3 py-2 text-left text-[12px] font-bold">
                    No.
                  </th>
                  <th className="min-w-[260px] px-3 py-2 text-left text-[12px] font-bold">
                    Program/Kegiatan/Subkegiatan
                  </th>
                  <th className="w-[95px] px-3 py-2 text-right text-[12px] font-bold">
                    Bobot (%)
                  </th>
                  <th className="w-[125px] px-3 py-2 text-right text-[12px] font-bold">
                    Nilai Perolehan
                  </th>
                  <th className="w-[95px] px-3 py-2 text-right text-[12px] font-bold">
                    Capaian
                  </th>
                  <th className="w-[165px] px-3 py-2 text-center text-[12px] font-bold">
                    Keberlakuan UPG
                  </th>
                  <th className="min-w-[160px] px-3 py-2 text-center text-[12px] font-bold">
                    Bukti Dukung
                  </th>
                  <th className="min-w-[180px] px-3 py-2 text-center text-[12px] font-bold">
                    Catatan/Verifikasi
                  </th>
                </tr>
              </thead>
              <tbody>
                {MONEV_PROGRAMS.map((prog) => {
                  const progActivities = prog.items
                    .map((c) => MONEV_ACTIVITIES.find((a) => a.code === c))
                    .filter((x): x is MonevActivityItem => Boolean(x));

                  const progAllFilled = progActivities.every(
                    (a) => activeAnnual.entries[a.code]?.score !== ''
                  );
                  const progSumObtained = progAllFilled
                    ? progActivities.reduce(
                        (acc, a) =>
                          acc +
                          (typeof activeAnnual.entries[a.code]?.score ===
                          'number'
                            ? (activeAnnual.entries[a.code].score as number)
                            : 0),
                        0
                      )
                    : null;
                  const progSumItemWeight = progActivities.reduce(
                    (acc, a) => acc + (a.weight ?? 0),
                    0
                  );
                  const progCapaian =
                    progSumObtained !== null && progSumItemWeight > 0
                      ? `${((progSumObtained / progSumItemWeight) * 100).toFixed(0)}%`
                      : '—';

                  return (
                    <React.Fragment key={prog.code}>
                      <tr className="bg-[#e8f2fa] font-bold text-[#111827]">
                        <td className="border-b border-[#d6e2ec] px-3 py-2 text-[12.5px] tabular-nums">
                          {prog.code}
                        </td>
                        <td className="border-b border-[#d6e2ec] px-3 py-2 text-[12.5px]">
                          {prog.name}
                        </td>
                        <td className="border-b border-[#d6e2ec] px-3 py-2 text-right text-[12.5px] tabular-nums">
                          {prog.weight}
                        </td>
                        <td className="border-b border-[#d6e2ec] px-3 py-2 text-right text-[12.5px] tabular-nums">
                          {progSumObtained === null ? '—' : progSumObtained}
                        </td>
                        <td className="border-b border-[#d6e2ec] px-3 py-2 text-right text-[12.5px] tabular-nums">
                          {progCapaian}
                        </td>
                        <td
                          colSpan={3}
                          className="border-b border-[#d6e2ec] px-3 py-2"
                        />
                      </tr>

                      {prog.subGroup && (
                        <tr className="bg-[#f4f8fc] font-bold text-[#111827]">
                          <td className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px] tabular-nums">
                            {prog.subGroup.code}
                          </td>
                          <td className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px]">
                            {prog.subGroup.name}
                          </td>
                          <td className="border-b border-[#e3e8ee] px-3 py-2 text-right text-[12.5px] tabular-nums">
                            {prog.subGroup.weight}
                          </td>
                          <td className="border-b border-[#e3e8ee] px-3 py-2 text-right text-[12.5px] tabular-nums">
                            {progSumObtained === null ? '—' : progSumObtained}
                          </td>
                          <td className="border-b border-[#e3e8ee] px-3 py-2 text-right text-[12.5px] tabular-nums">
                            {progCapaian}
                          </td>
                          <td
                            colSpan={3}
                            className="border-b border-[#e3e8ee] px-3 py-2"
                          />
                        </tr>
                      )}

                      {progActivities.map((act) => {
                        const entry = activeAnnual.entries[act.code] ?? {
                          score: '',
                          valid: 'Belum diisi' as ApplicabilityStatus,
                          evidence: '',
                          note: '',
                        };
                        const scoreVal = entry.score;
                        const cap =
                          scoreVal === '' || !act.weight
                            ? '—'
                            : `${((Number(scoreVal) / act.weight) * 100).toFixed(0)}%`;

                        return (
                          <tr
                            key={act.code}
                            className="bg-white hover:bg-[#fafcff]"
                          >
                            <td className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px] tabular-nums text-[#243247]">
                              {act.code}
                            </td>
                            <td className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px] text-[#243247]">
                              {act.name}
                            </td>
                            <td className="border-b border-[#e3e8ee] px-3 py-2 text-right text-[12.5px] tabular-nums text-[#243247]">
                              {act.weight}
                            </td>
                            <td className="border-b border-[#e3e8ee] px-3 py-1.5 text-right text-[12.5px] tabular-nums">
                              {isEditing && canEdit ? (
                                <input
                                  type="number"
                                  step="0.1"
                                  min={0}
                                  max={act.weight}
                                  value={scoreVal === '' ? '' : scoreVal}
                                  onChange={(e) =>
                                    handleAnnualEntryChange(act.code, {
                                      score:
                                        e.target.value === ''
                                          ? ''
                                          : Number(e.target.value),
                                    })
                                  }
                                  placeholder="0"
                                  className="w-[78px] rounded border border-[#9cc2e5] bg-white px-2 py-1 text-right text-[12.5px] font-semibold text-[#0b69c7]"
                                />
                              ) : (
                                <span className="font-semibold text-[#0b69c7]">
                                  {scoreVal === '' ? '—' : scoreVal}
                                </span>
                              )}
                            </td>
                            <td className="border-b border-[#e3e8ee] px-3 py-2 text-right text-[12.5px] tabular-nums text-[#243247]">
                              {cap}
                            </td>
                            <td className="border-b border-[#e3e8ee] bg-[#edf6fc] px-2.5 py-1.5 text-center text-[12px]">
                              {isEditing && canEdit ? (
                                <select
                                  value={entry.valid}
                                  onChange={(e) =>
                                    handleAnnualEntryChange(act.code, {
                                      valid: e.target
                                        .value as ApplicabilityStatus,
                                    })
                                  }
                                  className="w-full rounded border border-[#b7d6f1] bg-[#edf6fc] px-2 py-1 text-[12px] text-[#243247]"
                                >
                                  <option value="Belum diisi">
                                    Belum diisi
                                  </option>
                                  <option value="Berlaku">Berlaku</option>
                                  <option value="Tidak Berlaku">
                                    Tidak Berlaku
                                  </option>
                                </select>
                              ) : (
                                <span className="text-[#243247]">
                                  {entry.valid === 'Belum diisi'
                                    ? '—'
                                    : entry.valid}
                                </span>
                              )}
                            </td>
                            <td className="border-b border-[#e3e8ee] px-2.5 py-1.5 text-[12px] text-[#243247]">
                              {isEditing && canEdit ? (
                                <input
                                  type="text"
                                  value={entry.evidence}
                                  onChange={(e) =>
                                    handleAnnualEntryChange(act.code, {
                                      evidence: e.target.value,
                                    })
                                  }
                                  placeholder="Tautan / Dokumen"
                                  className="w-full rounded border border-[#cfd9e4] bg-white px-2 py-1 text-[12px]"
                                />
                              ) : entry.evidence ? (
                                <span className="break-all text-[#087eaa]">
                                  {entry.evidence}
                                </span>
                              ) : (
                                ''
                              )}
                            </td>
                            <td className="border-b border-[#e3e8ee] px-2.5 py-1.5 text-[12px] text-[#243247]">
                              {isEditing && canEdit ? (
                                <input
                                  type="text"
                                  value={entry.note}
                                  onChange={(e) =>
                                    handleAnnualEntryChange(act.code, {
                                      note: e.target.value,
                                    })
                                  }
                                  placeholder="Catatan verifikasi"
                                  className="w-full rounded border border-[#cfd9e4] bg-white px-2 py-1 text-[12px]"
                                />
                              ) : (
                                entry.note || ''
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'triwulanan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 max-lg:grid-cols-1">
            <div className="col-span-8 max-lg:col-span-1 rounded-[7px] border border-[#dce3eb] bg-white p-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
              <h3 className="m-0 mb-3 text-[14px] font-bold text-[#1d3554]">
                Ringkasan Progres Setiap Triwulan
              </h3>
              <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
                {quarterStats.map((q) => (
                  <div
                    key={q.label}
                    className="rounded-[6px] border border-[#dce3eb] bg-[#fbfcfe] p-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#e9eef4] pb-1.5">
                      <span className="text-[13px] font-bold text-[#0F4C81]">
                        {q.label}
                      </span>
                      <span className="font-mono-num text-[14px] font-bold text-[#1d3554]">
                        {q.pct}%
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#1d6434]">Selesai</span>
                        <b className="tabular-nums">{q.selesai}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#855800]">Dalam Proses</span>
                        <b className="tabular-nums">{q.dalamProses}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#475569]">Belum Dimulai</span>
                        <b className="tabular-nums">{q.belumDimulai}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#b4232c]">Terkendala</span>
                        <b className="tabular-nums">{q.terkendala}</b>
                      </div>
                      <div className="flex justify-between border-t border-[#e9eef4] pt-1 text-[#64748b]">
                        <span>Tidak Dijadwalkan (—)</span>
                        <b className="tabular-nums">{q.tidakDijadwalkan}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-4 max-lg:col-span-1 rounded-[7px] border border-[#dce3eb] bg-white p-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
              <h3 className="m-0 mb-2 text-[14px] font-bold text-[#1d3554]">
                Rekapitulasi Penyelesaian Kegiatan
              </h3>
              <div className="mt-3 rounded-[6px] border border-[#c7ddf5] bg-[#f4f9ff] p-4 text-center">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                  Persentase Penyelesaian ({year})
                </div>
                <div className="mt-1 font-mono-num text-[30px] font-extrabold text-[#0F4C81]">
                  {overallCompletionPct}%
                </div>
                <div className="mt-1 text-[12px] text-[#52647a]">
                  {totalCompletedCells} dari {totalScheduledCells} sel triwulan
                  selesai
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[4px] border border-[#dce3eb] bg-white shadow-[0_2px_5px_rgba(38,56,75,0.04)]">
            <div className="bg-[#0F4C81] px-3.5 py-2 text-[14px] font-bold uppercase tracking-wide text-white">
              MATRIKS MONITORING TRIWULANAN PROGRAM PENGENDALIAN GRATIFIKASI
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border-b border-[#dce3eb] bg-[#f8fbff] px-4 py-3 text-[12.5px] max-sm:grid-cols-1">
              <div className="flex items-center gap-3">
                <span className="w-[140px] font-semibold text-[#52647a]">
                  Tahun Pelaksanaan
                </span>
                <select
                  value={year}
                  onChange={(e) => onYearChange(e.target.value)}
                  className="rounded bg-[#e4f0fa] px-2.5 py-1 font-mono-num font-bold text-[#1d3554]"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-[140px] font-semibold text-[#52647a]">
                  Nama UPG
                </span>
                <select
                  value={effectiveUpg}
                  disabled={isSingleLevelLocked}
                  onChange={(e) => handleUpgChange(e.target.value as UpgLevel)}
                  className="rounded bg-[#e4f0fa] px-2.5 py-1 font-bold text-[#0F4C81]"
                >
                  {allowedUpgLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-[140px] font-semibold text-[#52647a]">
                  Nama Satker
                </span>
                <select
                  value={selectedSatker.uniqueId}
                  onChange={(e) => {
                    setSelectedSatkerId(e.target.value);
                    setIsEditing(false);
                  }}
                  className="rounded bg-[#e4f0fa] px-2.5 py-1 font-bold text-[#1d3554]"
                >
                  {satkersForLevel.map((sat) => (
                    <option key={sat.uniqueId} value={sat.uniqueId}>
                      {sat.namaSatker}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="bg-[#0F4C81] text-white">
                    <th className="w-[70px] px-3 py-2 text-left text-[12px] font-bold">
                      No.
                    </th>
                    <th className="px-3 py-2 text-left text-[12px] font-bold">
                      Program/Kegiatan/Subkegiatan
                    </th>
                    <th className="w-[150px] px-3 py-2 text-center text-[12px] font-bold">
                      TW I
                    </th>
                    <th className="w-[150px] px-3 py-2 text-center text-[12px] font-bold">
                      TW II
                    </th>
                    <th className="w-[150px] px-3 py-2 text-center text-[12px] font-bold">
                      TW III
                    </th>
                    <th className="w-[150px] px-3 py-2 text-center text-[12px] font-bold">
                      TW IV
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MONEV_PROGRAMS.map((prog) => {
                    const progActivities = prog.items
                      .map((c) => MONEV_ACTIVITIES.find((a) => a.code === c))
                      .filter((x): x is MonevActivityItem => Boolean(x));

                    return (
                      <React.Fragment key={prog.code}>
                        <tr className="bg-[#e8f2fa] font-bold text-[#1d3554]">
                          <td className="border-b border-[#dce3eb] px-3 py-2 text-[12.5px] tabular-nums">
                            {prog.code}
                          </td>
                          <td
                            colSpan={5}
                            className="border-b border-[#dce3eb] px-3 py-2 text-[12.5px]"
                          >
                            {prog.name}
                          </td>
                        </tr>
                        {prog.subGroup && (
                          <tr className="bg-[#f4f8fc] font-bold text-[#243247]">
                            <td className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px] tabular-nums">
                              {prog.subGroup.code}
                            </td>
                            <td
                              colSpan={5}
                              className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px]"
                            >
                              {prog.subGroup.name}
                            </td>
                          </tr>
                        )}
                        {progActivities.map((act) => {
                          const quarters = activeTriwulan.statuses[act.code] ?? [
                            'Belum Dimulai',
                            'Belum Dimulai',
                            'Belum Dimulai',
                            'Belum Dimulai',
                          ];

                          return (
                            <tr key={act.code} className="hover:bg-[#fafcff]">
                              <td className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px] tabular-nums">
                                {act.code}
                              </td>
                              <td className="border-b border-[#e3e8ee] px-3 py-2 text-[12.5px]">
                                {act.name}
                              </td>
                              {[0, 1, 2, 3].map((qIdx) => {
                                const status = quarters[qIdx];
                                return (
                                  <td
                                    key={qIdx}
                                    className={`border-b border-l border-[#e3e8ee] px-2 py-2 text-center text-[12px] ${getQuarterStatusStyle(
                                      status
                                    )}`}
                                  >
                                    {isEditing && canEdit ? (
                                      <select
                                        value={status}
                                        onChange={(e) =>
                                          handleTriwulanCellChange(
                                            act.code,
                                            qIdx,
                                            e.target.value as MonevQuarterStatus
                                          )
                                        }
                                        className="w-full rounded border border-[#cfd9e4] bg-white px-1.5 py-1 text-[12px] font-medium text-[#243247]"
                                      >
                                        {MONEV_STATUS_OPTIONS.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt === '—'
                                              ? '— (Tidak Dijadwalkan)'
                                              : opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span>{status}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * EXPORTED PAGE COMPONENT
 * ==========================================================================*/
export function MonevPPGPage({
  year,
  onYearChange,
  userRole,
  monevRecords,
  annualRecords,
  monevPusatRecords,
  mandatoryEvidences,
  satkerScores,
  onSaveMonev,
  onSaveAnnualRecord,
  onSaveMonevPusatRecord,
}: MonevPPGPageProps) {
  const canAccess =
    userRole === 'UPG Tingkat 1' ||
    userRole === 'UPG Tingkat 2' ||
    userRole === 'UPG Pusat';

  if (!canAccess) {
    return (
      <div className="rounded-[7px] border border-[#f5c2c7] bg-[#fde8e8] p-6 text-center text-[#9b1c24]">
        <h2 className="m-0 text-[16px] font-bold">Akses Dibatasi</h2>
        <p className="mt-1.5 mb-0 text-[13px]">
          Halaman <b>Monev PPG</b> hanya dapat dilihat oleh <b>UPG Tingkat 1</b>,{' '}
          <b>UPG Tingkat 2</b>, atau <b>UPG Pusat</b>. Satker tidak memiliki
          akses ke halaman ini.
        </p>
      </div>
    );
  }

  if (userRole === 'UPG Pusat') {
    return (
      <UpgPusatMonevWorkspace
        year={year}
        onYearChange={onYearChange}
        monevPusatRecords={monevPusatRecords}
        mandatoryEvidences={mandatoryEvidences}
        satkerScores={satkerScores}
        onSaveMonevPusatRecord={onSaveMonevPusatRecord}
      />
    );
  }

  return (
    <TierMonevView
      year={year}
      onYearChange={onYearChange}
      userRole={userRole}
      monevRecords={monevRecords}
      annualRecords={annualRecords}
      onSaveMonev={onSaveMonev}
      onSaveAnnualRecord={onSaveAnnualRecord}
    />
  );
}
