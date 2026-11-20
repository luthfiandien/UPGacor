import { useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck2,
  FolderCheck,
  Percent,
  PlusCircle,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import {
  BADAN_PENGAWASAN_SATKER,
  getMatrixRiskCategory,
  getRiskAssessmentStatus,
  isRiskAssessmentComplete,
  isValidHttpsUrl,
  MANDATORY_CONTROLS_CATALOG,
  MANDATORY_PROGRAM_GROUPS,
  MASTER_SATKER_LIST,
  UPG_LEVELS,
} from '../../data/ppgData';
import {
  ControlEffectivenessClaim,
  MandatoryControlDefinition,
  MandatoryProgramGroup,
  MasterSatker,
  QuarterPeriod,
  RiskAssessmentRecord,
  RiskMatrixConfig,
  SatkerEvalScore,
  SatkerMandatoryEvidence,
  UpgLevel,
  UserRole,
} from '../../types/upg';
import { Modal } from '../Modal';
import { getCategoryBadgeClass } from '../RiskMatrixConfigModal';
import { ToastContainer, ToastItem, ToastVariant } from '../ToastContainer';

interface DashboardPPGPageProps {
  year: string;
  userRole: UserRole;
  assessments: RiskAssessmentRecord[];
  riskMatrix: RiskMatrixConfig;
  mandatoryEvidences: SatkerMandatoryEvidence[];
  satkerScores: Record<string, SatkerEvalScore>;
  onSaveMandatoryEvidence: (record: SatkerMandatoryEvidence) => void;
  onOpenRiskFormForSatker: (satkerUniqueId: string, riskCode?: string) => void;
  onOpenNewRiskForm: () => void;
}

type PusatSubTab = 'bawas-controls' | 'data-ppg' | 'rekap-satker';
type SatkerTierStatus = 'Selesai' | 'Draft' | 'Belum Dinilai';

const TIER_META: Record<
  UpgLevel,
  { title: string; subtitle: string }
> = {
  'UPG Tingkat 1': {
    title: 'UPG Tingkat 1',
    subtitle: 'Unit Eselon I Mahkamah Agung RI',
  },
  'UPG Tingkat 2': {
    title: 'UPG Tingkat 2',
    subtitle: 'Pengadilan Tingkat Banding',
  },
  'UPG Tingkat 3': {
    title: 'UPG Tingkat 3',
    subtitle: 'Pengadilan Tingkat Pertama',
  },
};

const QUARTER_OPTIONS: QuarterPeriod[] = [
  'Triwulan I',
  'Triwulan II',
  'Triwulan III',
  'Triwulan IV',
];

const EFFECTIVENESS_OPTIONS: ControlEffectivenessClaim[] = [
  'Efektif',
  'Efektif Sebagian',
  'Tidak Efektif',
  'Belum Dinilai',
];

function formatScoreId(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return value.toFixed(digits).replace('.', ',');
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

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function deriveSatkerOverallStatus(
  satkerAssessments: RiskAssessmentRecord[]
): SatkerTierStatus {
  if (satkerAssessments.length === 0) return 'Belum Dinilai';
  const statuses = satkerAssessments.map(getRiskAssessmentStatus);
  if (statuses.every((s) => s === 'Selesai')) return 'Selesai';
  if (statuses.every((s) => s === 'Belum Dinilai')) return 'Belum Dinilai';
  return 'Draft';
}

function getClaimBadgeClass(
  claim: ControlEffectivenessClaim | 'N/A'
): string {
  switch (claim) {
    case 'Efektif':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'Efektif Sebagian':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'Tidak Efektif':
      return 'border-red-200 bg-red-50 text-red-800';
    case 'N/A':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function getSatkerStatusBadgeClass(status: SatkerTierStatus): string {
  switch (status) {
    case 'Selesai':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'Draft':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

/* ============================================================================
 * REDESIGNED UPG PUSAT HUB VIEW
 * ==========================================================================*/
function UpgPusatDashboardHub({
  year,
  assessments,
  riskMatrix,
  mandatoryEvidences,
  satkerScores,
  onSaveMandatoryEvidence,
  onOpenRiskFormForSatker,
}: {
  year: string;
  assessments: RiskAssessmentRecord[];
  riskMatrix: RiskMatrixConfig;
  mandatoryEvidences: SatkerMandatoryEvidence[];
  satkerScores: Record<string, SatkerEvalScore>;
  onSaveMandatoryEvidence: (record: SatkerMandatoryEvidence) => void;
  onOpenRiskFormForSatker: (satkerUniqueId: string, riskCode?: string) => void;
}) {
  const [activeSubTab, setActiveSubTab] =
    useState<PusatSubTab>('bawas-controls');
  const [tierFilter, setTierFilter] = useState<'ALL' | UpgLevel>('ALL');

  // Sub-tab 1 filters
  const [bawasProgramFilter, setBawasProgramFilter] = useState<
    'ALL' | MandatoryProgramGroup
  >('ALL');
  const [bawasStatusFilter, setBawasStatusFilter] = useState<
    'ALL' | 'Sudah Diisi Bawas' | 'Belum Diisi Bawas' | 'Khusus Pengadilan'
  >('ALL');
  const [bawasSearch, setBawasSearch] = useState('');

  // Sub-tab 2 filters
  const [dataProgramFilter, setDataProgramFilter] = useState<
    'ALL' | MandatoryProgramGroup
  >('ALL');
  const [dataSearch, setDataSearch] = useState('');

  // Sub-tab 3 filters
  const [satkerStatusFilter, setSatkerStatusFilter] = useState<
    'ALL' | SatkerTierStatus
  >('ALL');
  const [satkerSearch, setSatkerSearch] = useState('');

  // Modals & Toasts
  const [editingBawasControl, setEditingBawasControl] =
    useState<MandatoryControlDefinition | null>(null);
  const [bawasDraftClaim, setBawasDraftClaim] =
    useState<ControlEffectivenessClaim>('Efektif');
  const [bawasDraftUrl, setBawasDraftUrl] = useState('');
  const [bawasDraftPeriode, setBawasDraftPeriode] =
    useState<QuarterPeriod>('Triwulan I');
  const [bawasDraftCatatan, setBawasDraftCatatan] = useState('');
  const [bawasFormError, setBawasFormError] = useState<string | null>(null);

  const [evidencePickerControl, setEvidencePickerControl] =
    useState<MandatoryControlDefinition | null>(null);
  const [evidenceModalTierFilter, setEvidenceModalTierFilter] = useState<
    'ALL' | UpgLevel
  >('ALL');

  const [detailSatker, setDetailSatker] = useState<MasterSatker | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopy = async (text: string, label: string, keyId: string) => {
    const ok = await copyTextSafe(text);
    if (ok) {
      setCopiedId(keyId);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === keyId ? null : prev));
      }, 1800);
      pushToast('success', `${label} berhasil disalin ke papan klip.`);
    } else {
      pushToast(
        'error',
        'Gagal menyalin ke papan klip. Silakan salin tautan secara manual.'
      );
    }
  };

  // Lookup maps
  const evidenceByKey = useMemo(() => {
    const map = new Map<string, SatkerMandatoryEvidence>();
    mandatoryEvidences.forEach((ev) => {
      map.set(`${ev.satkerUniqueId}::${ev.controlCode}`, ev);
    });
    return map;
  }, [mandatoryEvidences]);

  // Badan Pengawasan Internal Summary (Strip)
  const bawasAssessments = useMemo(
    () =>
      assessments.filter(
        (a) =>
          a.satkerUniqueId === BADAN_PENGAWASAN_SATKER.uniqueId &&
          (a.tahun ?? year) === year
      ),
    [assessments, year]
  );

  const bawasRiskCompletedCount = useMemo(
    () =>
      bawasAssessments.filter((r) => getRiskAssessmentStatus(r) === 'Selesai')
        .length,
    [bawasAssessments]
  );

  const bawasScore = satkerScores[BADAN_PENGAWASAN_SATKER.uniqueId] ?? {
    satkerUniqueId: BADAN_PENGAWASAN_SATKER.uniqueId,
    mandiriScore: 88.5,
    evaluatorScore: 87.0,
  };

  // Bawas Mandatory Controls (24 controls, 3.2.1 = Khusus Pengadilan / N/A)
  const bawasControlRows = useMemo(() => {
    return MANDATORY_CONTROLS_CATALOG.map((ctrl) => {
      const existing = evidenceByKey.get(
        `${BADAN_PENGAWASAN_SATKER.uniqueId}::${ctrl.code}`
      );
      if (ctrl.courtOnly) {
        return {
          control: ctrl,
          statusLabel: 'Khusus Pengadilan' as const,
          displayStatus: 'Khusus Pengadilan / N/A',
          claim: 'N/A' as const,
          url: '',
          periode: 'Triwulan I' as QuarterPeriod,
          catatan:
            existing?.catatan ||
            'Khusus bagi satuan kerja pengadilan (N/A untuk Badan Pengawasan).',
          updatedAt: existing?.updatedAt || '',
        };
      }
      const isFilled =
        existing?.status === 'Sudah Diisi' &&
        isValidHttpsUrl(existing.buktiUrl);
      return {
        control: ctrl,
        statusLabel: isFilled
          ? ('Sudah Diisi Bawas' as const)
          : ('Belum Diisi Bawas' as const),
        displayStatus: isFilled ? 'Sudah Diisi Bawas' : 'Belum Diisi Bawas',
        claim: existing?.klaimEfektivitas ?? ('Belum Dinilai' as const),
        url: existing?.buktiUrl ?? '',
        periode: existing?.periode ?? ('Triwulan I' as QuarterPeriod),
        catatan: existing?.catatan ?? '',
        updatedAt: existing?.updatedAt ?? '',
      };
    });
  }, [evidenceByKey]);

  const bawasApplicableCount = useMemo(
    () => bawasControlRows.filter((r) => !r.control.courtOnly).length,
    [bawasControlRows]
  );
  const bawasFilledCount = useMemo(
    () =>
      bawasControlRows.filter((r) => r.statusLabel === 'Sudah Diisi Bawas')
        .length,
    [bawasControlRows]
  );

  // Per-Satker Derived Rows (for Tier Cards & Sub-tab 3)
  const allSatkerRows = useMemo(() => {
    return MASTER_SATKER_LIST.map((satker) => {
      const satkerAssessments = assessments.filter(
        (a) => a.satkerUniqueId === satker.uniqueId && (a.tahun ?? year) === year
      );
      const status = deriveSatkerOverallStatus(satkerAssessments);
      const selesaiCount = satkerAssessments.filter(
        (a) => getRiskAssessmentStatus(a) === 'Selesai'
      ).length;
      const draftCount = satkerAssessments.filter(
        (a) => getRiskAssessmentStatus(a) === 'Draft'
      ).length;

      const scoreEntry = satkerScores[satker.uniqueId];
      const satkerEvidences = MANDATORY_CONTROLS_CATALOG.map((ctrl) =>
        evidenceByKey.get(`${satker.uniqueId}::${ctrl.code}`)
      );
      const applicableControls = MANDATORY_CONTROLS_CATALOG.filter(
        (ctrl) => !(ctrl.courtOnly && satker.upgLevel === 'UPG Tingkat 1')
      );
      const uploadedControlCount = satkerEvidences.filter(
        (ev) => ev && ev.status === 'Sudah Diisi' && isValidHttpsUrl(ev.buktiUrl)
      ).length;

      return {
        satker,
        assessments: satkerAssessments,
        riskCount: satkerAssessments.length,
        selesaiCount,
        draftCount,
        status,
        mandiriScore: scoreEntry?.mandiriScore ?? null,
        evaluatorScore: scoreEntry?.evaluatorScore ?? null,
        uploadedControlCount,
        applicableControlCount: applicableControls.length,
      };
    });
  }, [assessments, year, satkerScores, evidenceByKey]);

  // Tier Summary Cards Data
  const tierSummaries = useMemo(() => {
    return UPG_LEVELS.map((level) => {
      const rows = allSatkerRows.filter((r) => r.satker.upgLevel === level);
      const total = rows.length;
      const selesai = rows.filter((r) => r.status === 'Selesai').length;
      const draft = rows.filter((r) => r.status === 'Draft').length;
      const belum = rows.filter((r) => r.status === 'Belum Dinilai').length;
      const pct = total > 0 ? (selesai / total) * 100 : 0;

      const mandiriVals = rows
        .map((r) => r.mandiriScore)
        .filter((v): v is number => v !== null);
      const evalVals = rows
        .map((r) => r.evaluatorScore)
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
        level,
        meta: TIER_META[level],
        total,
        selesai,
        draft,
        belum,
        pct,
        avgMandiri,
        avgEval,
      };
    });
  }, [allSatkerRows]);

  const handleTierCardClick = (level: UpgLevel) => {
    setTierFilter((prev) => (prev === level ? 'ALL' : level));
    if (activeSubTab === 'bawas-controls') {
      setActiveSubTab('rekap-satker');
    }
  };

  // Filtered Sub-tab 1 rows
  const filteredBawasRows = useMemo(() => {
    const q = bawasSearch.trim().toLowerCase();
    return bawasControlRows.filter((row) => {
      if (
        bawasProgramFilter !== 'ALL' &&
        row.control.programGroup !== bawasProgramFilter
      ) {
        return false;
      }
      if (
        bawasStatusFilter !== 'ALL' &&
        row.statusLabel !== bawasStatusFilter
      ) {
        return false;
      }
      if (
        q &&
        !row.control.code.toLowerCase().includes(q) &&
        !row.control.name.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [bawasControlRows, bawasProgramFilter, bawasStatusFilter, bawasSearch]);

  // Sub-tab 2: National Data PPG MA RI aggregation per Mandatory Control
  const nationalControlRows = useMemo(() => {
    const scopedSatkers =
      tierFilter === 'ALL'
        ? MASTER_SATKER_LIST
        : MASTER_SATKER_LIST.filter((s) => s.upgLevel === tierFilter);

    return MANDATORY_CONTROLS_CATALOG.map((ctrl) => {
      const applicableSatkers = scopedSatkers.filter(
        (s) => !(ctrl.courtOnly && s.upgLevel === 'UPG Tingkat 1')
      );
      const uploadedItems: {
        satker: MasterSatker;
        evidence: SatkerMandatoryEvidence;
      }[] = [];

      let efektifCount = 0;
      let sebagianCount = 0;
      let tidakEfektifCount = 0;

      applicableSatkers.forEach((satker) => {
        const ev = evidenceByKey.get(`${satker.uniqueId}::${ctrl.code}`);
        if (ev && ev.status === 'Sudah Diisi' && isValidHttpsUrl(ev.buktiUrl)) {
          uploadedItems.push({ satker, evidence: ev });
          if (ev.klaimEfektivitas === 'Efektif') efektifCount += 1;
          else if (ev.klaimEfektivitas === 'Efektif Sebagian')
            sebagianCount += 1;
          else if (ev.klaimEfektivitas === 'Tidak Efektif')
            tidakEfektifCount += 1;
        }
      });

      const totalApplicable = applicableSatkers.length;
      const pct =
        totalApplicable > 0
          ? (uploadedItems.length / totalApplicable) * 100
          : 0;

      return {
        control: ctrl,
        uploadedItems,
        uploadedCount: uploadedItems.length,
        totalApplicable,
        pct,
        efektifCount,
        sebagianCount,
        tidakEfektifCount,
      };
    });
  }, [tierFilter, evidenceByKey]);

  const filteredNationalControlRows = useMemo(() => {
    const q = dataSearch.trim().toLowerCase();
    return nationalControlRows.filter((row) => {
      if (
        dataProgramFilter !== 'ALL' &&
        row.control.programGroup !== dataProgramFilter
      ) {
        return false;
      }
      if (
        q &&
        !row.control.code.toLowerCase().includes(q) &&
        !row.control.name.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [nationalControlRows, dataProgramFilter, dataSearch]);

  // Sub-tab 3: Filtered Satker Rows
  const filteredSatkerRows = useMemo(() => {
    const q = satkerSearch.trim().toLowerCase();
    return allSatkerRows.filter((row) => {
      if (tierFilter !== 'ALL' && row.satker.upgLevel !== tierFilter) {
        return false;
      }
      if (satkerStatusFilter !== 'ALL' && row.status !== satkerStatusFilter) {
        return false;
      }
      if (q && !row.satker.namaSatker.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [allSatkerRows, tierFilter, satkerStatusFilter, satkerSearch]);

  // Modal helpers for Sub-tab 1 (Edit Bawas control evidence)
  const openBawasControlModal = (ctrl: MandatoryControlDefinition) => {
    if (ctrl.courtOnly) return;
    const existing = evidenceByKey.get(
      `${BADAN_PENGAWASAN_SATKER.uniqueId}::${ctrl.code}`
    );
    setEditingBawasControl(ctrl);
    setBawasDraftClaim(
      existing?.klaimEfektivitas && existing.klaimEfektivitas !== 'N/A'
        ? existing.klaimEfektivitas
        : 'Efektif'
    );
    setBawasDraftUrl(existing?.buktiUrl ?? '');
    setBawasDraftPeriode(existing?.periode ?? 'Triwulan I');
    setBawasDraftCatatan(existing?.catatan ?? '');
    setBawasFormError(null);
  };

  const handleSaveBawasControlModal = () => {
    if (!editingBawasControl) return;
    const trimmedUrl = bawasDraftUrl.trim();
    if (!trimmedUrl) {
      setBawasFormError(
        'Tautan bukti dukung HTTPS wajib diisi sebelum menyimpan.'
      );
      return;
    }
    if (!isValidHttpsUrl(trimmedUrl)) {
      setBawasFormError(
        'Format tautan tidak valid. Gunakan tautan lengkap yang diawali https://'
      );
      return;
    }
    if (bawasDraftClaim === 'Belum Dinilai') {
      setBawasFormError(
        'Pilih klaim efektivitas pengendalian (Efektif, Efektif Sebagian, atau Tidak Efektif).'
      );
      return;
    }

    const updated: SatkerMandatoryEvidence = {
      id: `${BADAN_PENGAWASAN_SATKER.uniqueId}::${editingBawasControl.code}`,
      satkerUniqueId: BADAN_PENGAWASAN_SATKER.uniqueId,
      controlCode: editingBawasControl.code,
      status: 'Sudah Diisi',
      klaimEfektivitas: bawasDraftClaim,
      buktiUrl: trimmedUrl,
      periode: bawasDraftPeriode,
      catatan: bawasDraftCatatan.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSaveMandatoryEvidence(updated);
    setEditingBawasControl(null);
    pushToast(
      'success',
      `Bukti kontrol ${editingBawasControl.code} Badan Pengawasan berhasil disimpan.`
    );
  };

  // Modal helpers for Sub-tab 2 ("Ambil Bukti (X)")
  const openEvidencePicker = (ctrl: MandatoryControlDefinition) => {
    setEvidencePickerControl(ctrl);
    setEvidenceModalTierFilter(tierFilter);
  };

  const pickerEvidenceItems = useMemo(() => {
    if (!evidencePickerControl) return [];
    return MASTER_SATKER_LIST.filter((s) => {
      if (
        evidencePickerControl.courtOnly &&
        s.upgLevel === 'UPG Tingkat 1'
      ) {
        return false;
      }
      if (
        evidenceModalTierFilter !== 'ALL' &&
        s.upgLevel !== evidenceModalTierFilter
      ) {
        return false;
      }
      return true;
    })
      .map((satker) => {
        const ev = evidenceByKey.get(
          `${satker.uniqueId}::${evidencePickerControl.code}`
        );
        if (
          !ev ||
          ev.status !== 'Sudah Diisi' ||
          !isValidHttpsUrl(ev.buktiUrl)
        ) {
          return null;
        }
        return { satker, evidence: ev };
      })
      .filter(
        (
          x
        ): x is { satker: MasterSatker; evidence: SatkerMandatoryEvidence } =>
          x !== null
      );
  }, [evidencePickerControl, evidenceModalTierFilter, evidenceByKey]);

  const handleBulkCopyGolKpkLinks = async () => {
    if (!evidencePickerControl || pickerEvidenceItems.length === 0) {
      pushToast('warning', 'Tidak ada tautan bukti untuk disalin.');
      return;
    }
    const lines = pickerEvidenceItems.map(
      ({ satker, evidence }) =>
        `[${satker.upgLevel}] ${satker.namaSatker} (${evidence.klaimEfektivitas}): ${evidence.buktiUrl}`
    );
    await handleCopy(
      lines.join('\n'),
      `${pickerEvidenceItems.length} tautan bukti GOL KPK (${evidencePickerControl.code})`,
      `bulk-${evidencePickerControl.code}`
    );
  };

  const handleDownloadControlEvidenceCsv = () => {
    if (!evidencePickerControl) return;
    const header = [
      'Kode Kontrol',
      'Nama Kontrol Mandatory',
      'Kelompok Program',
      'Tingkat UPG',
      'Nama Satker',
      'Klaim Efektivitas',
      'Periode',
      'Tautan Bukti (HTTPS)',
      'Catatan',
    ];
    const rows = pickerEvidenceItems.map(({ satker, evidence }) => [
      evidencePickerControl.code,
      evidencePickerControl.name,
      evidencePickerControl.programGroup,
      satker.upgLevel,
      satker.namaSatker,
      evidence.klaimEfektivitas,
      evidence.periode,
      evidence.buktiUrl,
      evidence.catatan,
    ]);
    downloadCsvFile(
      `Bukti_PPG_${evidencePickerControl.code.replace(/\./g, '_')}_${year}.csv`,
      [header, ...rows]
    );
    pushToast(
      'success',
      `CSV bukti dukung kontrol ${evidencePickerControl.code} berhasil diunduh.`
    );
  };

  // Top-right CSV Export ("Unduh Rekap Data PPG MA RI (CSV)")
  const handleExportNationalRekapCsv = () => {
    const header = [
      'Kode Kontrol',
      'Kelompok Program',
      'Program / Kegiatan / Subkegiatan (Mandatory Control)',
      'Cakupan Tingkat UPG',
      'Satker Mengisi Bukti',
      'Total Satker Wajib',
      'Ketersediaan Bukti (%)',
      'Klaim Efektif',
      'Klaim Efektif Sebagian',
      'Klaim Tidak Efektif',
      'Status Bawas',
      'Tautan Bukti Bawas (HTTPS)',
    ];

    const rows = nationalControlRows.map((row) => {
      const bawasRow = bawasControlRows.find(
        (b) => b.control.code === row.control.code
      );
      return [
        row.control.code,
        row.control.programGroup,
        row.control.name,
        tierFilter === 'ALL' ? 'Semua Tingkat (1, 2, 3)' : tierFilter,
        row.uploadedCount,
        row.totalApplicable,
        `${row.pct.toFixed(1).replace('.', ',')}%`,
        row.efektifCount,
        row.sebagianCount,
        row.tidakEfektifCount,
        bawasRow?.displayStatus ?? '—',
        bawasRow?.url || '—',
      ];
    });

    const scopeSuffix =
      tierFilter === 'ALL' ? 'Nasional' : tierFilter.replace(/\s+/g, '_');
    downloadCsvFile(
      `Rekap_Data_PPG_MA_RI_${scopeSuffix}_${year}.csv`,
      [header, ...rows]
    );
    pushToast(
      'success',
      `Rekap Data PPG MA RI (${tierFilter === 'ALL' ? 'Nasional' : tierFilter}) berhasil diunduh.`
    );
  };

  // Satker Detail Modal Computed Data
  const detailSatkerRow = detailSatker
    ? allSatkerRows.find((r) => r.satker.uniqueId === detailSatker.uniqueId) ??
      null
    : null;

  const detailSatkerEvidences = useMemo(() => {
    if (!detailSatker) return [];
    return MANDATORY_CONTROLS_CATALOG.map((ctrl) => {
      const ev = evidenceByKey.get(`${detailSatker.uniqueId}::${ctrl.code}`);
      return {
        control: ctrl,
        evidence: ev,
      };
    });
  }, [detailSatker, evidenceByKey]);

  return (
    <div className="space-y-5">
      {/* 2. INTERNAL ACTIVITY SUMMARY STRIP ("UPG Pusat — Badan Pengawasan") */}
      <section
        aria-label="Kegiatan Internal UPG Pusat"
        className="flex flex-wrap items-center justify-between gap-4 rounded-[6px] border border-[#dce3eb] bg-white px-5 py-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]"
      >
        <div className="min-w-[260px] flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
              Kegiatan Internal UPG Pusat — Badan Pengawasan
            </h2>
            <span className="inline-flex items-center rounded border border-[#c9dcf5] bg-[#eef5fc] px-2 py-0.5 text-[11px] font-semibold text-[#1762b5] whitespace-nowrap">
              Unit Pengisi &amp; Bank Data
            </span>
          </div>
          <p className="m-0 mt-1 text-[12px] text-[#64748b]">
            Ringkasan pengisian mandiri Badan Pengawasan serta pusat kompilasi
            bukti pengendalian gratifikasi nasional untuk pelaporan GOL KPK.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* KPI Pill 1: Penilaian Risiko Bawas */}
          <div className="rounded-[6px] border border-[#dce3eb] bg-[#f8fafc] px-3.5 py-2">
            <div className="text-[11px] font-semibold text-[#52647a]">
              Penilaian Risiko Bawas
            </div>
            <div className="mt-0.5 text-[14px] font-bold text-[#1d3554] tabular-nums">
              {bawasAssessments.length} / 10 Risiko{' '}
              <span className="font-semibold text-[#137a45]">
                ({bawasRiskCompletedCount} Selesai)
              </span>
            </div>
          </div>

          {/* KPI Pill 2: Klaim Mandiri vs Evaluator */}
          <div className="rounded-[6px] border border-[#dce3eb] bg-[#f8fafc] px-3.5 py-2">
            <div className="text-[11px] font-semibold text-[#52647a]">
              Klaim Mandiri vs Evaluator
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5 font-mono-num text-[14px] font-bold tabular-nums">
              <span className="text-[#1762b5]">
                {formatScoreId(bawasScore.mandiriScore)}
              </span>
              <span className="text-[#94a3b8]">/</span>
              <span className="text-[#137a45]">
                {formatScoreId(bawasScore.evaluatorScore)}
              </span>
              <span className="ml-1 font-sans text-[11px] font-medium text-[#64748b]">
                (Mandiri / Eval)
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() =>
              onOpenRiskFormForSatker(BADAN_PENGAWASAN_SATKER.uniqueId)
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-[5px] border border-[#07579f] bg-[#07579f] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0d559f] whitespace-nowrap shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Isi Penilaian Risiko</span>
          </button>
        </div>
      </section>

      {/* 3. THREE INTERACTIVE TIER SUMMARY CARDS */}
      <section aria-label="Rekapitulasi Capaian Jenjang UPG">
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
          {tierSummaries.map((tier) => {
            const isSelected = tierFilter === tier.level;
            return (
              <button
                key={tier.level}
                type="button"
                onClick={() => handleTierCardClick(tier.level)}
                aria-pressed={isSelected}
                className={`group cursor-pointer rounded-[6px] border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#1762b5] bg-[#f4f8fe] ring-2 ring-[#1762b5]/20'
                    : 'border-[#dce3eb] bg-white hover:border-[#9ec0e6] hover:bg-[#fafcff]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[14px] font-bold text-[#1d3554]">
                      {tier.meta.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#64748b]">
                      {tier.meta.subtitle}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-num text-[22px] font-bold leading-none text-[#1762b5] tabular-nums">
                      {formatScoreId(tier.pct, 1)}%
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-[#64748b] tabular-nums">
                      {tier.selesai} / {tier.total} Satker Selesai
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#e9eef4]">
                  <div
                    className="h-full rounded-full bg-[#1762b5] transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.max(0, tier.pct))}%` }}
                  />
                </div>

                {/* Counts & Scores Row */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eef2f6] pt-2.5 text-[12px]">
                  <div className="flex items-center gap-2 font-medium tabular-nums">
                    <span className="text-[#137a45]">
                      {tier.selesai} Selesai
                    </span>
                    <span className="text-[#cbd5e1]" aria-hidden="true">
                      /
                    </span>
                    <span className="text-[#9a6500]">{tier.draft} Draft</span>
                    <span className="text-[#cbd5e1]" aria-hidden="true">
                      /
                    </span>
                    <span className="text-[#64748b]">{tier.belum} Belum</span>
                  </div>

                  <div className="font-mono-num text-[12px] font-semibold text-[#334155] tabular-nums">
                    <span className="font-sans text-[11px] font-normal text-[#64748b]">
                      Mandiri / Eval:{' '}
                    </span>
                    {formatScoreId(tier.avgMandiri)} /{' '}
                    {formatScoreId(tier.avgEval)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. MAIN WORKSPACE CARD WITH 3 CLEAN SUB-TABS & CSV EXPORT */}
      <section className="rounded-[6px] border border-[#dce3eb] bg-white shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        {/* Workspace Header: 3 Sub-tabs + Export CSV */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3eb] px-5 py-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Navigasi data Dashboard PPG"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSubTab === 'bawas-controls'}
              onClick={() => setActiveSubTab('bawas-controls')}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-[5px] border px-3.5 py-2 text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'bawas-controls'
                  ? 'border-[#1762b5] bg-[#1762b5] text-white'
                  : 'border-[#dce3eb] bg-[#f8fafc] text-[#45566c] hover:bg-[#eef3f8]'
              }`}
            >
              <span>Kontrol &amp; Bukti UPG Pusat</span>
              <span
                className={`rounded px-1.5 py-0.5 font-mono-num text-[11px] font-bold tabular-nums ${
                  activeSubTab === 'bawas-controls'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#e7f0fc] text-[#1762b5]'
                }`}
              >
                {bawasFilledCount}/{bawasApplicableCount} Terisi
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeSubTab === 'data-ppg'}
              onClick={() => setActiveSubTab('data-ppg')}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-[5px] border px-3.5 py-2 text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'data-ppg'
                  ? 'border-[#1762b5] bg-[#1762b5] text-white'
                  : 'border-[#dce3eb] bg-[#f8fafc] text-[#45566c] hover:bg-[#eef3f8]'
              }`}
            >
              <span>Data PPG MA RI</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                  activeSubTab === 'data-ppg'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Siap GOL KPK
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeSubTab === 'rekap-satker'}
              onClick={() => setActiveSubTab('rekap-satker')}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-[5px] border px-3.5 py-2 text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'rekap-satker'
                  ? 'border-[#1762b5] bg-[#1762b5] text-white'
                  : 'border-[#dce3eb] bg-[#f8fafc] text-[#45566c] hover:bg-[#eef3f8]'
              }`}
            >
              <span>Rekapitulasi per Satker</span>
              <span
                className={`rounded px-1.5 py-0.5 font-mono-num text-[11px] font-bold tabular-nums ${
                  activeSubTab === 'rekap-satker'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#e9eef4] text-[#45566c]'
                }`}
              >
                {filteredSatkerRows.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportNationalRekapCsv}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-[#198754] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#137a45] transition-colors hover:bg-[#edf8f2] whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Unduh Rekap Data PPG MA RI (CSV)</span>
          </button>
        </div>

        {/* Active Tier Filter Banner (shown when a tier card filter is active on Sub-tab 2 or 3) */}
        {tierFilter !== 'ALL' && activeSubTab !== 'bawas-controls' && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dce3eb] bg-[#f0f6fd] px-5 py-2 text-[12px] text-[#1d3554]">
            <span>
              Menampilkan data terfilter untuk jenjang:{' '}
              <strong className="text-[#1762b5]">{tierFilter}</strong> (
              {TIER_META[tierFilter].subtitle})
            </span>
            <button
              type="button"
              onClick={() => setTierFilter('ALL')}
              className="cursor-pointer font-semibold text-[#1762b5] underline hover:text-[#0d559f]"
            >
              Tampilkan Semua Jenjang
            </button>
          </div>
        )}

        {/* ================================================================
         * SUB-TAB 1: Kontrol & Bukti UPG Pusat (24 Mandatory Controls)
         * ============================================================== */}
        {activeSubTab === 'bawas-controls' && (
          <div className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-[15px] font-bold text-[#1d3554]">
                  Kontrol Wajib Internal Badan Pengawasan (24 Indikator)
                </h3>
                <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">
                  Kelola pemenuhan bukti dukung internal Badan Pengawasan.
                  Indikator 3.2.1 otomatis berstatus Khusus Pengadilan / N/A
                  sehingga target berlaku adalah {bawasApplicableCount} indikator.
                </p>
              </div>
              <div className="text-[12px] font-semibold text-[#52647a] tabular-nums">
                Terisi:{' '}
                <span className="text-[#137a45]">
                  {bawasFilledCount} / {bawasApplicableCount}
                </span>{' '}
                · Khusus Pengadilan:{' '}
                <span className="text-[#64748b]">1 (N/A)</span>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[6px] border border-[#e3e8ee] bg-[#f8fafc] p-3">
              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#45566c]">
                Kelompok Program
                <select
                  value={bawasProgramFilter}
                  onChange={(e) =>
                    setBawasProgramFilter(
                      e.target.value as 'ALL' | MandatoryProgramGroup
                    )
                  }
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
                >
                  <option value="ALL">Semua Program</option>
                  {MANDATORY_PROGRAM_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#45566c]">
                Status Bawas
                <select
                  value={bawasStatusFilter}
                  onChange={(e) =>
                    setBawasStatusFilter(
                      e.target.value as
                        | 'ALL'
                        | 'Sudah Diisi Bawas'
                        | 'Belum Diisi Bawas'
                        | 'Khusus Pengadilan'
                    )
                  }
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Sudah Diisi Bawas">Sudah Diisi Bawas</option>
                  <option value="Belum Diisi Bawas">Belum Diisi Bawas</option>
                  <option value="Khusus Pengadilan">Khusus Pengadilan</option>
                </select>
              </label>

              <label className="relative flex flex-1 min-w-[220px] items-center">
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#64748b]" />
                <input
                  type="search"
                  value={bawasSearch}
                  onChange={(e) => setBawasSearch(e.target.value)}
                  placeholder="Cari kode atau nama kontrol wajib..."
                  aria-label="Cari kontrol wajib Badan Pengawasan"
                  className="w-full rounded border border-[#cfd9e4] bg-white py-1.5 pl-8 pr-3 text-[13px] text-[#243247]"
                />
              </label>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-[6px] border border-[#dce3eb]">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="bg-[#f4f7fa]">
                    <th className="w-[74px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Kode
                    </th>
                    <th className="border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Indikator Kontrol Wajib (Mandatory Control)
                    </th>
                    <th className="w-[165px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Status Bawas
                    </th>
                    <th className="w-[145px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Klaim Efektivitas
                    </th>
                    <th className="w-[280px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Bukti Dukung (HTTPS)
                    </th>
                    <th className="w-[125px] border-b border-[#e3e8ee] px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBawasRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-[13px] text-[#718096]"
                      >
                        Tidak ada indikator kontrol wajib yang sesuai dengan
                        filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBawasRows.map((row) => {
                      const isNa = row.statusLabel === 'Khusus Pengadilan';
                      const isFilled = row.statusLabel === 'Sudah Diisi Bawas';
                      const copyKey = `bawas-${row.control.code}`;

                      return (
                        <tr
                          key={row.control.code}
                          className={`border-b border-[#e3e8ee] last:border-b-0 ${
                            isNa ? 'bg-[#fafbfc]' : 'hover:bg-[#fafcff]'
                          }`}
                        >
                          <td className="px-3 py-2.5 align-top font-mono-num text-[12.5px] font-bold text-[#1762b5] tabular-nums whitespace-nowrap">
                            {row.control.code}
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <div className="text-[13px] font-medium text-[#1d3554]">
                              {row.control.name}
                            </div>
                            <div className="mt-0.5 text-[11.5px] text-[#64748b]">
                              {row.control.programGroup}
                              {row.catatan && !isNa && (
                                <>
                                  <span aria-hidden="true"> · </span>
                                  <span className="text-[#475569]">
                                    {row.catatan}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${
                                isFilled
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : isNa
                                    ? 'border-slate-200 bg-slate-100 text-slate-600'
                                    : 'border-amber-200 bg-amber-50 text-amber-800'
                              }`}
                            >
                              {row.displayStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${getClaimBadgeClass(
                                row.claim
                              )}`}
                            >
                              {row.claim}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            {isNa ? (
                              <span className="text-[12px] text-[#64748b]">
                                Khusus Pengadilan (N/A untuk Bawas)
                              </span>
                            ) : isFilled && row.url ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={row.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={row.url}
                                  className="inline-flex min-w-0 max-w-[190px] items-center gap-1 text-[12px] text-[#087eaa] underline hover:text-[#065f82]"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{row.url}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      row.url,
                                      `Tautan bukti ${row.control.code}`,
                                      copyKey
                                    )
                                  }
                                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#cfd9e4] bg-white px-2 py-1 text-[11px] font-semibold text-[#334155] hover:bg-[#f1f5f9] whitespace-nowrap shrink-0"
                                >
                                  {copiedId === copyKey ? (
                                    <>
                                      <Check className="h-3 w-3 text-[#198754]" />
                                      <span>Disalin</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Salin</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[12px] text-[#94a3b8]">
                                Belum ada tautan bukti
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right align-top whitespace-nowrap">
                            {isNa ? (
                              <span className="text-[11.5px] font-medium text-[#64748b]">
                                Otomatis N/A
                              </span>
                            ) : isFilled ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openBawasControlModal(row.control)
                                }
                                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#1762b5] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1762b5] hover:bg-[#eef5fc] whitespace-nowrap"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openBawasControlModal(row.control)
                                }
                                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#07579f] bg-[#07579f] px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-[#0d559f] whitespace-nowrap"
                              >
                                <span>+ Isi Bukti</span>
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
          </div>
        )}

        {/* ================================================================
         * SUB-TAB 2: Data PPG MA RI (National Evidence Retrieval for GOL KPK)
         * ============================================================== */}
        {activeSubTab === 'data-ppg' && (
          <div className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-[15px] font-bold text-[#1d3554]">
                  Bank Data PPG Mahkamah Agung RI — Siap Pelaporan GOL KPK
                </h3>
                <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">
                  Agregasi ketersediaan bukti dukung HTTPS dari seluruh satker
                  UPG Tingkat 1, 2, dan 3 untuk tiap indikator kontrol wajib.
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[6px] border border-[#e3e8ee] bg-[#f8fafc] p-3">
              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#45566c]">
                Tingkat UPG
                <select
                  value={tierFilter}
                  onChange={(e) =>
                    setTierFilter(e.target.value as 'ALL' | UpgLevel)
                  }
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
                >
                  <option value="ALL">Semua Tingkat (1, 2, 3)</option>
                  {UPG_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#45566c]">
                Kelompok Program
                <select
                  value={dataProgramFilter}
                  onChange={(e) =>
                    setDataProgramFilter(
                      e.target.value as 'ALL' | MandatoryProgramGroup
                    )
                  }
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
                >
                  <option value="ALL">Semua Program</option>
                  {MANDATORY_PROGRAM_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative flex flex-1 min-w-[220px] items-center">
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#64748b]" />
                <input
                  type="search"
                  value={dataSearch}
                  onChange={(e) => setDataSearch(e.target.value)}
                  placeholder="Cari kode atau indikator..."
                  aria-label="Cari indikator Data PPG MA RI"
                  className="w-full rounded border border-[#cfd9e4] bg-white py-1.5 pl-8 pr-3 text-[13px] text-[#243247]"
                />
              </label>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-[6px] border border-[#dce3eb]">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="bg-[#f4f7fa]">
                    <th className="w-[74px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      No.
                    </th>
                    <th className="border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Program / Kegiatan / Subkegiatan (Mandatory Control)
                    </th>
                    <th className="w-[185px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Kelompok Program
                    </th>
                    <th className="w-[215px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Ketersediaan Bukti Nasional
                    </th>
                    <th className="w-[190px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Klaim Efektivitas
                    </th>
                    <th className="w-[155px] border-b border-[#e3e8ee] px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Bukti Dukung
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNationalControlRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-[13px] text-[#718096]"
                      >
                        Tidak ada indikator yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredNationalControlRows.map((row) => (
                      <tr
                        key={row.control.code}
                        className="border-b border-[#e3e8ee] last:border-b-0 hover:bg-[#fafcff]"
                      >
                        <td className="px-3 py-2.5 align-top font-mono-num text-[12.5px] font-bold text-[#1762b5] tabular-nums whitespace-nowrap">
                          {row.control.code}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="text-[13px] font-medium text-[#1d3554]">
                            {row.control.name}
                          </div>
                          {row.control.courtOnly && (
                            <div className="mt-0.5 text-[11px] text-[#64748b]">
                              Khusus satuan kerja pengadilan (Tingkat 2 &amp; 3)
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 align-top text-[12px] text-[#52647a]">
                          {row.control.programGroup}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          {row.totalApplicable === 0 ? (
                            <span className="text-[12px] text-[#64748b]">
                              Tidak berlaku (Khusus Pengadilan)
                            </span>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between text-[12px] font-semibold text-[#1d3554] tabular-nums">
                                <span>
                                  {row.uploadedCount} / {row.totalApplicable}{' '}
                                  Satker
                                </span>
                                <span className="text-[#1762b5]">
                                  {formatScoreId(row.pct, 0)}%
                                </span>
                              </div>
                              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e9eef4]">
                                <div
                                  className="h-full rounded-full bg-[#198754]"
                                  style={{
                                    width: `${Math.min(100, row.pct)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 tabular-nums whitespace-nowrap">
                              {row.efektifCount} Efektif
                            </span>
                            <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 tabular-nums whitespace-nowrap">
                              {row.sebagianCount} Sebagian
                            </span>
                            {row.tidakEfektifCount > 0 && (
                              <span className="inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-800 tabular-nums whitespace-nowrap">
                                {row.tidakEfektifCount} Tidak Efektif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right align-top whitespace-nowrap">
                          <button
                            type="button"
                            disabled={row.uploadedCount === 0}
                            onClick={() => openEvidencePicker(row.control)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] border border-[#07579f] bg-[#07579f] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#0d559f] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#e2e8f0] disabled:text-[#64748b] whitespace-nowrap"
                          >
                            <FolderCheck className="h-3.5 w-3.5" />
                            <span>Ambil Bukti ({row.uploadedCount})</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================
         * SUB-TAB 3: Rekapitulasi per Satker (Read-Only Monitoring)
         * ============================================================== */}
        {activeSubTab === 'rekap-satker' && (
          <div className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-[15px] font-bold text-[#1d3554]">
                  Rekapitulasi Pelaksanaan PPG per Satuan Kerja
                </h3>
                <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">
                  Pemantauan read-only seluruh satker UPG Tingkat 1, 2, dan 3.
                  Klik Detail untuk melihat rincian risiko, skor, dan tautan
                  bukti wajib satker.
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[6px] border border-[#e3e8ee] bg-[#f8fafc] p-3">
              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#45566c]">
                Tingkat UPG
                <select
                  value={tierFilter}
                  onChange={(e) =>
                    setTierFilter(e.target.value as 'ALL' | UpgLevel)
                  }
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
                >
                  <option value="ALL">Semua Tingkat UPG</option>
                  {UPG_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#45566c]">
                Status
                <select
                  value={satkerStatusFilter}
                  onChange={(e) =>
                    setSatkerStatusFilter(
                      e.target.value as 'ALL' | SatkerTierStatus
                    )
                  }
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Draft">Draft</option>
                  <option value="Belum Dinilai">Belum Dinilai</option>
                </select>
              </label>

              <label className="relative flex flex-1 min-w-[220px] items-center">
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#64748b]" />
                <input
                  type="search"
                  value={satkerSearch}
                  onChange={(e) => setSatkerSearch(e.target.value)}
                  placeholder="Cari nama satker..."
                  aria-label="Cari nama satker"
                  className="w-full rounded border border-[#cfd9e4] bg-white py-1.5 pl-8 pr-3 text-[13px] text-[#243247]"
                />
              </label>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-[6px] border border-[#dce3eb]">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-[#f4f7fa]">
                    <th className="w-[54px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      No.
                    </th>
                    <th className="w-[140px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Tingkat UPG
                    </th>
                    <th className="border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Nama Satker
                    </th>
                    <th className="w-[145px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Risiko Dipilih
                    </th>
                    <th className="w-[165px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Mandiri / Evaluator
                    </th>
                    <th className="w-[140px] border-b border-[#e3e8ee] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Status
                    </th>
                    <th className="w-[110px] border-b border-[#e3e8ee] px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSatkerRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[13px] text-[#718096]"
                      >
                        Tidak ada satuan kerja yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSatkerRows.map((row, idx) => (
                      <tr
                        key={row.satker.uniqueId}
                        className="border-b border-[#e3e8ee] last:border-b-0 hover:bg-[#fafcff]"
                      >
                        <td className="px-3 py-2.5 text-[13px] text-[#475569] tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#1762b5] whitespace-nowrap">
                          {row.satker.upgLevel}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-[13px] font-semibold text-[#1d3554]">
                            {row.satker.namaSatker}
                          </div>
                          <div className="mt-0.5 text-[11.5px] text-[#64748b] tabular-nums">
                            Kontrol Wajib: {row.uploadedControlCount} /{' '}
                            {row.applicableControlCount} terisi
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-[13px] tabular-nums">
                          <div className="font-semibold text-[#1d3554]">
                            {row.riskCount} / 10 Risiko
                          </div>
                          {row.riskCount > 0 && (
                            <div className="text-[11px] text-[#64748b]">
                              {row.selesaiCount} Selesai · {row.draftCount} Draft
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono-num text-[13px] font-semibold text-[#1d3554] tabular-nums whitespace-nowrap">
                          <span className="text-[#1762b5]">
                            {formatScoreId(row.mandiriScore)}
                          </span>{' '}
                          <span className="text-[#94a3b8]">/</span>{' '}
                          <span className="text-[#137a45]">
                            {formatScoreId(row.evaluatorScore)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded border px-2.5 py-0.5 text-[11px] font-semibold ${getSatkerStatusBadgeClass(
                              row.status
                            )}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDetailSatker(row.satker)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#08a9c4] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] whitespace-nowrap"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ====================================================================
       * MODAL 1: Update Bukti Kontrol Wajib Badan Pengawasan (Sub-tab 1)
       * ================================================================== */}
      <Modal
        open={editingBawasControl !== null}
        title={
          editingBawasControl
            ? `Isi / Ubah Bukti Kontrol [${editingBawasControl.code}]`
            : ''
        }
        onClose={() => {
          setEditingBawasControl(null);
          setBawasFormError(null);
        }}
        onSave={handleSaveBawasControlModal}
        saveLabel="Simpan Bukti Kontrol"
      >
        {editingBawasControl && (
          <div className="space-y-4 text-[13px] text-[#243247]">
            <div className="rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-3.5">
              <div className="text-[11px] font-semibold text-[#52647a]">
                {editingBawasControl.programGroup}
              </div>
              <div className="mt-0.5 text-[14px] font-bold text-[#1d3554]">
                {editingBawasControl.code} — {editingBawasControl.name}
              </div>
            </div>

            {bawasFormError && (
              <div
                role="alert"
                className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-800"
              >
                {bawasFormError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-[#45566c]">
                  Klaim Efektivitas
                </span>
                <select
                  value={bawasDraftClaim}
                  onChange={(e) => {
                    setBawasDraftClaim(
                      e.target.value as ControlEffectivenessClaim
                    );
                    setBawasFormError(null);
                  }}
                  className="w-full rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
                >
                  {EFFECTIVENESS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-[#45566c]">
                  Periode Pelaksanaan
                </span>
                <select
                  value={bawasDraftPeriode}
                  onChange={(e) =>
                    setBawasDraftPeriode(e.target.value as QuarterPeriod)
                  }
                  className="w-full rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
                >
                  {QUARTER_OPTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-[#45566c]">
                Tautan Bukti Dukung (HTTPS)
              </span>
              <input
                type="url"
                value={bawasDraftUrl}
                onChange={(e) => {
                  setBawasDraftUrl(e.target.value);
                  setBawasFormError(null);
                }}
                placeholder="https://wastitama.mahkamahagung.go.id/dokumen/bawas/..."
                className="w-full rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
              />
              <span className="mt-1 block text-[11px] text-[#64748b]">
                Wajib menggunakan protokol https:// agar dapat disalin untuk
                pelaporan GOL KPK.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-[#45566c]">
                Catatan Pelaksanaan
              </span>
              <textarea
                rows={3}
                value={bawasDraftCatatan}
                onChange={(e) => setBawasDraftCatatan(e.target.value)}
                placeholder="Ringkasan implementasi atau keterangan dokumen bukti..."
                className="w-full rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
              />
            </label>
          </div>
        )}
      </Modal>

      {/* ====================================================================
       * MODAL 2: Ambil Bukti Nasional (GOL KPK) (Sub-tab 2)
       * ================================================================== */}
      <Modal
        open={evidencePickerControl !== null}
        title={
          evidencePickerControl
            ? `Ambil Bukti Dukung Nasional — [${evidencePickerControl.code}]`
            : ''
        }
        onClose={() => setEvidencePickerControl(null)}
        showFooter={false}
        maxWidthClass="max-w-[880px]"
      >
        {evidencePickerControl && (
          <div className="space-y-4 text-[13px] text-[#243247]">
            <div className="rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-3.5">
              <div className="text-[11px] font-semibold text-[#52647a]">
                {evidencePickerControl.programGroup}
              </div>
              <div className="mt-0.5 text-[14px] font-bold text-[#1d3554]">
                {evidencePickerControl.code} — {evidencePickerControl.name}
              </div>
            </div>

            {/* Filter by UPG Tier + Bulk Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 rounded-[6px] border border-[#dce3eb] bg-[#f8fafc] p-1">
                {(['ALL', ...UPG_LEVELS] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEvidenceModalTierFilter(lvl)}
                    className={`cursor-pointer rounded px-2.5 py-1 text-[12px] font-semibold transition-colors whitespace-nowrap ${
                      evidenceModalTierFilter === lvl
                        ? 'bg-[#1762b5] text-white'
                        : 'text-[#45566c] hover:bg-white'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Semua Jenjang' : lvl}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkCopyGolKpkLinks}
                  disabled={pickerEvidenceItems.length === 0}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#07579f] bg-[#07579f] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0d559f] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  <span>Salin Semua Tautan (GOL KPK)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadControlEvidenceCsv}
                  disabled={pickerEvidenceItems.length === 0}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#198754] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#137a45] hover:bg-[#edf8f2] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh CSV</span>
                </button>
              </div>
            </div>

            <div className="text-[12px] text-[#64748b] tabular-nums">
              Menampilkan{' '}
              <strong className="text-[#1d3554]">
                {pickerEvidenceItems.length}
              </strong>{' '}
              satuan kerja dengan tautan bukti HTTPS terverifikasi.
            </div>

            {pickerEvidenceItems.length === 0 ? (
              <div className="rounded border border-dashed border-[#cfd9e4] bg-[#f8fafc] p-6 text-center text-[13px] text-[#718096]">
                Belum ada satuan kerja pada jenjang terpilih yang mengunggah
                bukti dukung untuk indikator ini.
              </div>
            ) : (
              <div className="max-h-[420px] overflow-auto rounded-[6px] border border-[#dce3eb]">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead className="sticky top-0 bg-[#f4f7fa]">
                    <tr>
                      <th className="border-b border-[#e3e8ee] px-3 py-2 text-left text-[11px] font-bold uppercase text-[#45566c]">
                        Satker &amp; Jenjang
                      </th>
                      <th className="border-b border-[#e3e8ee] px-3 py-2 text-left text-[11px] font-bold uppercase text-[#45566c]">
                        Klaim &amp; Periode
                      </th>
                      <th className="border-b border-[#e3e8ee] px-3 py-2 text-left text-[11px] font-bold uppercase text-[#45566c]">
                        Tautan Bukti (HTTPS)
                      </th>
                      <th className="w-[90px] border-b border-[#e3e8ee] px-3 py-2 text-right text-[11px] font-bold uppercase text-[#45566c]">
                        Salin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickerEvidenceItems.map(({ satker, evidence }) => {
                      const keyId = `picker-${satker.uniqueId}-${evidence.controlCode}`;
                      return (
                        <tr
                          key={satker.uniqueId}
                          className="border-b border-[#e3e8ee] last:border-b-0 hover:bg-[#fafcff]"
                        >
                          <td className="px-3 py-2.5 align-top">
                            <div className="text-[12.5px] font-semibold text-[#1d3554]">
                              {satker.namaSatker}
                            </div>
                            <div className="text-[11px] font-medium text-[#1762b5]">
                              {satker.upgLevel}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
                            <span
                              className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold ${getClaimBadgeClass(
                                evidence.klaimEfektivitas
                              )}`}
                            >
                              {evidence.klaimEfektivitas}
                            </span>
                            <div className="mt-1 text-[11px] text-[#64748b]">
                              {evidence.periode}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <a
                              href={evidence.buktiUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex max-w-[270px] items-center gap-1 text-[12px] text-[#087eaa] underline hover:text-[#065f82]"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">
                                {evidence.buktiUrl}
                              </span>
                            </a>
                            {evidence.catatan && (
                              <div className="mt-0.5 text-[11px] text-[#64748b]">
                                {evidence.catatan}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right align-top whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  evidence.buktiUrl,
                                  `Tautan ${satker.namaSatker}`,
                                  keyId
                                )
                              }
                              className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#cfd9e4] bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[#334155] hover:bg-[#f1f5f9] whitespace-nowrap"
                            >
                              {copiedId === keyId ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-[#198754]" />
                                  <span>Disalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setEvidencePickerControl(null)}
                className="cursor-pointer rounded border border-[#cfd9e4] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#45566c] hover:bg-[#f8fafc]"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ====================================================================
       * MODAL 3: Read-Only Detail Satker (Sub-tab 3)
       * ================================================================== */}
      <Modal
        open={detailSatker !== null}
        title={
          detailSatker
            ? `Detail Satker (Read-Only) — ${detailSatker.namaSatker}`
            : ''
        }
        onClose={() => setDetailSatker(null)}
        showFooter={false}
        maxWidthClass="max-w-[880px]"
      >
        {detailSatker && detailSatkerRow && (
          <div className="space-y-5 text-[13px] text-[#243247]">
            {/* Identity & KPI Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-4">
              <div>
                <div className="text-[11px] font-semibold text-[#52647a]">
                  {detailSatker.upgLevel} · Tahun Pelaksanaan {year}
                </div>
                <div className="mt-0.5 text-[15px] font-bold text-[#1d3554]">
                  {detailSatker.namaSatker}
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded border px-2.5 py-1 text-[11.5px] font-semibold ${getSatkerStatusBadgeClass(
                  detailSatkerRow.status
                )}`}
              >
                {detailSatkerRow.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              <div className="rounded-[6px] border border-[#dce3eb] bg-white p-3">
                <div className="text-[11px] font-semibold text-[#52647a]">
                  Risiko Dipilih
                </div>
                <div className="mt-1 text-[18px] font-bold text-[#1d3554] tabular-nums">
                  {detailSatkerRow.riskCount} / 10 Risiko
                </div>
                <div className="text-[11.5px] text-[#64748b] tabular-nums">
                  {detailSatkerRow.selesaiCount} Selesai ·{' '}
                  {detailSatkerRow.draftCount} Draft
                </div>
              </div>

              <div className="rounded-[6px] border border-[#dce3eb] bg-white p-3">
                <div className="text-[11px] font-semibold text-[#52647a]">
                  Skor Mandiri vs Evaluator
                </div>
                <div className="mt-1 font-mono-num text-[18px] font-bold tabular-nums">
                  <span className="text-[#1762b5]">
                    {formatScoreId(detailSatkerRow.mandiriScore)}
                  </span>{' '}
                  <span className="text-[#94a3b8]">/</span>{' '}
                  <span className="text-[#137a45]">
                    {formatScoreId(detailSatkerRow.evaluatorScore)}
                  </span>
                </div>
                <div className="text-[11.5px] text-[#64748b]">
                  Mandiri / Penilaian Evaluator
                </div>
              </div>

              <div className="rounded-[6px] border border-[#dce3eb] bg-white p-3">
                <div className="text-[11px] font-semibold text-[#52647a]">
                  Kontrol Wajib Terisi
                </div>
                <div className="mt-1 text-[18px] font-bold text-[#1d3554] tabular-nums">
                  {detailSatkerRow.uploadedControlCount} /{' '}
                  {detailSatkerRow.applicableControlCount}
                </div>
                <div className="text-[11.5px] text-[#64748b]">
                  Tautan HTTPS siap verifikasi
                </div>
              </div>
            </div>

            {/* Selected Risk Assessments (Read-Only) */}
            <div>
              <h4 className="m-0 mb-2 text-[13px] font-bold text-[#1d3554]">
                Daftar Risiko Gratifikasi Dipilih ({detailSatkerRow.riskCount})
              </h4>
              {detailSatkerRow.assessments.length === 0 ? (
                <div className="rounded border border-dashed border-[#cfd9e4] bg-[#f8fafc] p-4 text-center text-[12.5px] text-[#718096]">
                  Satker ini belum memilih atau mengisi penilaian risiko
                  gratifikasi pada tahun {year}.
                </div>
              ) : (
                <div className="space-y-2">
                  {detailSatkerRow.assessments.map((rec) => {
                    const st = getRiskAssessmentStatus(rec);
                    const inhCat = getMatrixRiskCategory(
                      riskMatrix,
                      rec.inherentProb,
                      rec.inherentImpact
                    );
                    const resCat = getMatrixRiskCategory(
                      riskMatrix,
                      rec.residualProb,
                      rec.residualImpact
                    );
                    return (
                      <div
                        key={rec.id}
                        className="rounded-[6px] border border-[#dce3eb] bg-white p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="font-mono-num rounded bg-[#1762b5] px-2 py-0.5 text-[11px] font-bold text-white">
                              {rec.kodeRisiko}
                            </span>
                            <div className="mt-1 font-semibold text-[#1d3554]">
                              {rec.pernyataanRisiko}
                            </div>
                          </div>
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${getSatkerStatusBadgeClass(
                              st
                            )}`}
                          >
                            {st}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-[#52647a]">
                          <span>
                            Inherent:{' '}
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${getCategoryBadgeClass(
                                inhCat
                              )}`}
                            >
                              {inhCat ?? '—'}
                            </span>
                          </span>
                          <span>
                            Residual:{' '}
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${getCategoryBadgeClass(
                                resCat
                              )}`}
                            >
                              {resCat ?? '—'}
                            </span>
                          </span>
                          <span className="tabular-nums">
                            Kontrol Risiko: {rec.controls.length} indikator
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mandatory Control Evidence Links (Read-Only) */}
            <div>
              <h4 className="m-0 mb-2 text-[13px] font-bold text-[#1d3554]">
                Tautan Bukti Kontrol Wajib ({detailSatkerRow.uploadedControlCount}{' '}
                Terunggah)
              </h4>
              <div className="max-h-[280px] overflow-auto rounded-[6px] border border-[#dce3eb]">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead className="sticky top-0 bg-[#f4f7fa]">
                    <tr>
                      <th className="w-[64px] border-b border-[#e3e8ee] px-3 py-2 text-left text-[11px] font-bold uppercase text-[#45566c]">
                        Kode
                      </th>
                      <th className="border-b border-[#e3e8ee] px-3 py-2 text-left text-[11px] font-bold uppercase text-[#45566c]">
                        Kontrol Wajib
                      </th>
                      <th className="w-[130px] border-b border-[#e3e8ee] px-3 py-2 text-left text-[11px] font-bold uppercase text-[#45566c]">
                        Klaim
                      </th>
                      <th className="w-[240px] border-b border-[#e3e8ee] px-3 py-2 text-left text-[11px] font-bold uppercase text-[#45566c]">
                        Bukti Dukung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailSatkerEvidences.map(({ control, evidence }) => {
                      const isNa =
                        control.courtOnly &&
                        detailSatker.upgLevel === 'UPG Tingkat 1';
                      const hasUrl =
                        evidence?.status === 'Sudah Diisi' &&
                        isValidHttpsUrl(evidence.buktiUrl);
                      const copyKey = `detail-${detailSatker.uniqueId}-${control.code}`;

                      return (
                        <tr
                          key={control.code}
                          className="border-b border-[#e3e8ee] last:border-b-0"
                        >
                          <td className="px-3 py-2 align-top font-mono-num text-[12px] font-bold text-[#1762b5] tabular-nums">
                            {control.code}
                          </td>
                          <td className="px-3 py-2 align-top text-[12px] text-[#1d3554]">
                            {control.name}
                          </td>
                          <td className="px-3 py-2 align-top whitespace-nowrap">
                            {isNa ? (
                              <span className="inline-flex rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                N/A
                              </span>
                            ) : (
                              <span
                                className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold ${getClaimBadgeClass(
                                  evidence?.klaimEfektivitas ?? 'Belum Dinilai'
                                )}`}
                              >
                                {evidence?.klaimEfektivitas ?? 'Belum Dinilai'}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-top">
                            {isNa ? (
                              <span className="text-[11.5px] text-[#64748b]">
                                Khusus Pengadilan
                              </span>
                            ) : hasUrl && evidence ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={evidence.buktiUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex max-w-[165px] items-center gap-1 text-[11.5px] text-[#087eaa] underline"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {evidence.buktiUrl}
                                  </span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      evidence.buktiUrl,
                                      `Bukti ${control.code}`,
                                      copyKey
                                    )
                                  }
                                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#cfd9e4] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#334155] hover:bg-[#f1f5f9] whitespace-nowrap shrink-0"
                                >
                                  {copiedId === copyKey ? (
                                    <Check className="h-3 w-3 text-[#198754]" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                  <span>Salin</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11.5px] text-[#94a3b8]">
                                Belum diunggah
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDetailSatker(null)}
                className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#0d559f]"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

/* ============================================================================
 * EXISTING TIER EVALUATOR VIEW (UPG Tingkat 1 & UPG Tingkat 2)
 * ==========================================================================*/
function TierEvaluatorDashboardView({
  userRole,
  assessments,
  riskMatrix,
  onOpenRiskFormForSatker,
  onOpenNewRiskForm,
}: {
  userRole: UserRole;
  assessments: RiskAssessmentRecord[];
  riskMatrix: RiskMatrixConfig;
  onOpenRiskFormForSatker: (satkerUniqueId: string, riskCode?: string) => void;
  onOpenNewRiskForm: () => void;
}) {
  const [upgFilter, setUpgFilter] = useState<string>('ALL');
  const [satkerSearch, setSatkerSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [detailSatker, setDetailSatker] = useState<MasterSatker | null>(null);

  const availableLevels: readonly UpgLevel[] =
    userRole === 'UPG Tingkat 2'
      ? ['UPG Tingkat 3']
      : userRole === 'UPG Tingkat 1'
        ? ['UPG Tingkat 2', 'UPG Tingkat 3']
        : UPG_LEVELS;
  const isSingleLevelLocked = availableLevels.length === 1;

  const scopedSatkers = MASTER_SATKER_LIST.filter((s) =>
    availableLevels.includes(s.upgLevel)
  );

  const scopedAssessments = assessments.filter((a) =>
    availableLevels.includes(a.upgLevel)
  );

  const satkerRows = scopedSatkers.map((satker) => {
    const satkerAssessments = scopedAssessments.filter(
      (a) => a.satkerUniqueId === satker.uniqueId
    );
    const hasAssessment = satkerAssessments.length > 0;
    const allComplete =
      hasAssessment && satkerAssessments.every(isRiskAssessmentComplete);
    const statusPenilaian: 'SELESAI' | 'BELUM SELESAI' = allComplete
      ? 'SELESAI'
      : 'BELUM SELESAI';

    return {
      satker,
      assessments: satkerAssessments,
      jumlahRisiko: satkerAssessments.length,
      statusPenilaian,
    };
  });

  const totalSatker = scopedSatkers.length;
  const completedSatkerCount = satkerRows.filter(
    (r) => r.statusPenilaian === 'SELESAI'
  ).length;
  const incompleteSatkerCount = totalSatker - completedSatkerCount;
  const completionPct =
    totalSatker > 0
      ? ((completedSatkerCount / totalSatker) * 100).toFixed(1)
      : '0.0';

  const totalIdentifiedRisks = scopedAssessments.length;

  let claimEfektif = 0;
  let claimSebagian = 0;
  let claimTidakEfektif = 0;
  let claimBelumDinilai = 0;

  scopedAssessments.forEach((rec) => {
    rec.controls.forEach((ctrl) => {
      if (ctrl.klaimEfektivitas === 'Efektif') claimEfektif += 1;
      else if (
        ctrl.klaimEfektivitas === 'Efektif Sebagian' ||
        (ctrl.klaimEfektivitas as string) === 'Sebagian Efektif'
      )
        claimSebagian += 1;
      else if (ctrl.klaimEfektivitas === 'Tidak Efektif')
        claimTidakEfektif += 1;
      else claimBelumDinilai += 1;
    });
  });

  const effectiveUpgFilter = isSingleLevelLocked
    ? availableLevels[0]
    : upgFilter !== 'ALL' && !availableLevels.includes(upgFilter as UpgLevel)
      ? 'ALL'
      : upgFilter;
  const q = satkerSearch.trim().toLowerCase();
  const filteredRows = satkerRows.filter((row) => {
    if (
      effectiveUpgFilter !== 'ALL' &&
      row.satker.upgLevel !== effectiveUpgFilter
    ) {
      return false;
    }
    if (statusFilter !== 'ALL' && row.statusPenilaian !== statusFilter)
      return false;
    if (q && !row.satker.namaSatker.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  const visibleDetailSatker =
    detailSatker && availableLevels.includes(detailSatker.upgLevel)
      ? detailSatker
      : null;

  const detailSatkerAssessments = visibleDetailSatker
    ? assessments.filter(
        (a) => a.satkerUniqueId === visibleDetailSatker.uniqueId
      )
    : [];

  return (
    <div className="space-y-5">
      <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#e9eef4] pb-3">
          <div>
            <h2 className="m-0 text-[16px] font-bold text-[#1d3554]">
              {userRole === 'UPG Tingkat 1'
                ? 'Monitoring Pelaksanaan Penilaian Risiko Gratifikasi Satker (UPG Tingkat 2 & 3)'
                : 'Monitoring Pelaksanaan Penilaian Risiko Gratifikasi Satker (UPG Tingkat 3)'}
            </h2>
            <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
              {userRole === 'UPG Tingkat 1'
                ? 'Lingkup UPG Tingkat 1: menampilkan satker UPG Tingkat 2 dan UPG Tingkat 3 yang dievaluasi.'
                : 'Lingkup UPG Tingkat 2: hanya menampilkan satker UPG Tingkat 3 yang dievaluasi.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewRiskForm}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f] whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Isi Penilaian Risiko</span>
          </button>
        </div>

        {/* Row 1: 4 Summary Cards */}
        <div className="mb-4 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
          <div className="rounded-[6px] border border-[#dce3eb] bg-[#fbfcfe] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                  Jumlah Seluruh Satker
                </div>
                <div className="mt-1 text-[24px] font-bold text-[#1d3554] tabular-nums">
                  {totalSatker}
                </div>
                <div className="text-[11px] text-[#718096]">
                  {userRole === 'UPG Tingkat 1'
                    ? 'UPG Tingkat 2 dan 3'
                    : 'Khusus UPG Tingkat 3'}
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-[#b7e2cb] bg-[#f4fbf7] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#137a45]">
                  Satker Sudah Menilai
                </div>
                <div className="mt-1 text-[24px] font-bold text-[#135c35] tabular-nums">
                  {completedSatkerCount}
                </div>
                <div className="text-[11px] text-[#198754]">Status SELESAI</div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f5eb] text-[#198754]">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-[#f0d79d] bg-[#fffcf2] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#9a6500]">
                  Satker Belum Menilai
                </div>
                <div className="mt-1 text-[24px] font-bold text-[#785716] tabular-nums">
                  {incompleteSatkerCount}
                </div>
                <div className="text-[11px] text-[#9a6500]">
                  Status BELUM SELESAI
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff2d8] text-[#d99116]">
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border border-[#dce3eb] bg-[#fbfcfe] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                  Persentase Penyelesaian
                </div>
                <div className="mt-1 text-[24px] font-bold text-[#1762b5] tabular-nums">
                  {completionPct}%
                </div>
                <div className="text-[11px] text-[#718096]">
                  {completedSatkerCount} dari {totalSatker} satker
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
                <Percent className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 of KPIs */}
        <div className="mb-5 grid grid-cols-5 gap-3 max-xl:grid-cols-3 max-sm:grid-cols-1">
          <div className="rounded-[6px] border border-[#dce3eb] bg-white p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#52647a]">
              <span>Risiko Teridentifikasi</span>
              <ShieldAlert className="h-3.5 w-3.5 text-[#1762b5]" />
            </div>
            <div className="mt-1 text-[20px] font-bold text-[#1d3554] tabular-nums">
              {totalIdentifiedRisks}
            </div>
          </div>

          <div className="rounded-[6px] border border-[#b7e2cb] bg-white p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#137a45]">
              <span>Klaim Efektif</span>
              <FileCheck2 className="h-3.5 w-3.5 text-[#198754]" />
            </div>
            <div className="mt-1 text-[20px] font-bold text-[#137a45] tabular-nums">
              {claimEfektif}
            </div>
          </div>

          <div className="rounded-[6px] border border-[#f0d79d] bg-white p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#9a6500]">
              <span>Klaim Sebagian Efektif</span>
              <AlertTriangle className="h-3.5 w-3.5 text-[#d99116]" />
            </div>
            <div className="mt-1 text-[20px] font-bold text-[#9a6500] tabular-nums">
              {claimSebagian}
            </div>
          </div>

          <div className="rounded-[6px] border border-[#f5c2c7] bg-white p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#b4232c]">
              <span>Klaim Tidak Efektif</span>
              <XCircle className="h-3.5 w-3.5 text-[#dc3545]" />
            </div>
            <div className="mt-1 text-[20px] font-bold text-[#b4232c] tabular-nums">
              {claimTidakEfektif}
            </div>
          </div>

          <div className="rounded-[6px] border border-[#dce3eb] bg-white p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748b]">
              <span>Kontrol Belum Dinilai</span>
              <Clock className="h-3.5 w-3.5 text-[#64748b]" />
            </div>
            <div className="mt-1 text-[20px] font-bold text-[#475569] tabular-nums">
              {claimBelumDinilai}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[6px] border border-[#e3e8ee] bg-[#f8fafc] p-3">
          <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#45566c]">
            Tingkat UPG
            <select
              value={effectiveUpgFilter}
              disabled={isSingleLevelLocked}
              onChange={(e) => setUpgFilter(e.target.value)}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247] disabled:bg-[#eef2f6] disabled:font-semibold"
            >
              {!isSingleLevelLocked && (
                <option value="ALL">Semua Tingkat UPG</option>
              )}
              {availableLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#45566c]">
            Nama Satker
            <input
              type="search"
              value={satkerSearch}
              onChange={(e) => setSatkerSearch(e.target.value)}
              placeholder="Cari nama satker..."
              className="min-w-[210px] rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
            />
          </label>

          <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#45566c]">
            Status Penilaian
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247]"
            >
              <option value="ALL">Semua Status</option>
              <option value="SELESAI">SELESAI</option>
              <option value="BELUM SELESAI">BELUM SELESAI</option>
            </select>
          </label>
        </div>

        {/* Satker Monitoring Table */}
        <div className="overflow-auto rounded-[6px] border border-[#dce3eb]">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr>
                {[
                  'No.',
                  'Tingkat UPG',
                  'Nama Satker',
                  'Jumlah Risiko',
                  'Status Penilaian',
                  'Aksi',
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[13px] text-[#718096]"
                  >
                    Tidak ada satker yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={row.satker.uniqueId}
                    className="last:[&>td]:border-b-0 hover:bg-[#fafcff]"
                  >
                    <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[13px] tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[13px] whitespace-nowrap font-semibold text-[#1762b5]">
                      {row.satker.upgLevel}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[13px] font-medium text-[#243247]">
                      {row.satker.namaSatker}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[13px] tabular-nums">
                      {row.jumlahRisiko}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px]">
                      <span
                        className={`inline-block rounded-[20px] px-2.5 py-0.5 text-[11px] font-bold ${
                          row.statusPenilaian === 'SELESAI'
                            ? 'bg-[#e3f5eb] text-[#137a45]'
                            : 'bg-[#fff2d8] text-[#9a6500]'
                        }`}
                      >
                        {row.statusPenilaian}
                      </span>
                    </td>
                    <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailSatker(row.satker)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#08a9c4] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenRiskFormForSatker(row.satker.uniqueId)
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#1762b5] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1762b5] hover:bg-[#eef5fc]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Penilaian Satker */}
      <Modal
        open={visibleDetailSatker !== null}
        title={
          visibleDetailSatker
            ? `Detail Penilaian Risiko — [${visibleDetailSatker.upgLevel}] ${visibleDetailSatker.namaSatker}`
            : ''
        }
        onClose={() => setDetailSatker(null)}
        showFooter={false}
      >
        {visibleDetailSatker && (
          <div className="space-y-4 text-[13px] text-[#243247]">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#dce3eb] bg-[#f7faff] p-3">
              <div>
                <div className="text-[11px] font-bold uppercase text-[#52647a]">
                  Identitas Satker
                </div>
                <div className="font-bold text-[#1d3554]">
                  {visibleDetailSatker.upgLevel} —{' '}
                  {visibleDetailSatker.namaSatker}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const id = visibleDetailSatker.uniqueId;
                  setDetailSatker(null);
                  onOpenRiskFormForSatker(id);
                }}
                className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0d559f]"
              >
                Edit / Tambah Penilaian
              </button>
            </div>

            {detailSatkerAssessments.length === 0 ? (
              <div className="rounded border border-dashed border-[#cfd9e4] bg-[#f8fafc] p-5 text-center text-[13px] text-[#718096]">
                Satker ini belum memiliki data penilaian risiko gratifikasi
                tersimpan.
              </div>
            ) : (
              detailSatkerAssessments.map((rec) => {
                const inhCat = getMatrixRiskCategory(
                  riskMatrix,
                  rec.inherentProb,
                  rec.inherentImpact
                );
                const resCat = getMatrixRiskCategory(
                  riskMatrix,
                  rec.residualProb,
                  rec.residualImpact
                );
                const complete = isRiskAssessmentComplete(rec);

                return (
                  <div
                    key={rec.id}
                    className="space-y-3 rounded-[6px] border border-[#dce3eb] bg-white p-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#e9eef4] pb-2">
                      <div>
                        <span className="font-mono-num rounded bg-[#1762b5] px-2 py-0.5 text-[11px] font-bold text-white">
                          {rec.kodeRisiko}
                        </span>
                        <div className="mt-1 font-semibold text-[#1d3554]">
                          {rec.pernyataanRisiko}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          complete
                            ? 'bg-[#e3f5eb] text-[#137a45]'
                            : 'bg-[#fff2d8] text-[#9a6500]'
                        }`}
                      >
                        {complete ? 'SELESAI' : 'BELUM SELESAI'}
                      </span>
                    </div>

                    <div>
                      <div className="mb-1.5 text-[11px] font-bold uppercase text-[#52647a]">
                        Kontrol Berjalan (Mandatory Control)
                      </div>
                      <div className="space-y-2">
                        {rec.controls.map((c, i) => (
                          <div
                            key={i}
                            className="rounded border border-[#e3e8ee] bg-[#f8fafc] p-2.5 text-[12px]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-[#243247]">
                                {c.controlName}
                              </span>
                              <span className="rounded bg-[#e7f0fc] px-2 py-0.5 text-[11px] font-bold text-[#1762b5]">
                                {c.klaimEfektivitas} · {c.tahun} ({c.periode})
                              </span>
                            </div>
                            <div className="mt-1 text-[#52647a]">
                              Catatan: {c.catatanKlaim || '—'}
                            </div>
                            {c.buktiKlaim && (
                              <a
                                href={c.buktiKlaim}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[#087eaa] underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span className="break-all">
                                  {c.buktiKlaim}
                                </span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
                      <div className="rounded border border-[#dce3eb] bg-[#f7faff] p-2.5 text-[12px]">
                        <div className="font-bold text-[#52647a]">
                          Risiko Inherent
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span>
                            P: Level {rec.inherentProb || '—'} · D: Level{' '}
                            {rec.inherentImpact || '—'}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getCategoryBadgeClass(
                              inhCat
                            )}`}
                          >
                            {inhCat ?? '—'}
                          </span>
                        </div>
                      </div>

                      <div className="rounded border border-[#dce3eb] bg-[#f7faff] p-2.5 text-[12px]">
                        <div className="font-bold text-[#52647a]">
                          Risiko Residual
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span>
                            P: Level {rec.residualProb || '—'} · D: Level{' '}
                            {rec.residualImpact || '—'}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getCategoryBadgeClass(
                              resCat
                            )}`}
                          >
                            {resCat ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDetailSatker(null)}
                className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-4 py-1.5 text-[13px] font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================================
 * EXPORTED PAGE COMPONENT
 * ==========================================================================*/
export function DashboardPPGPage({
  year,
  userRole,
  assessments,
  riskMatrix,
  mandatoryEvidences,
  satkerScores,
  onSaveMandatoryEvidence,
  onOpenRiskFormForSatker,
  onOpenNewRiskForm,
}: DashboardPPGPageProps) {
  const canAccess =
    userRole === 'UPG Tingkat 1' ||
    userRole === 'UPG Tingkat 2' ||
    userRole === 'UPG Pusat';

  if (!canAccess) {
    return (
      <div className="rounded-[7px] border border-[#f5c2c7] bg-[#fde8e8] p-6 text-center text-[#9b1c24]">
        <h2 className="m-0 text-[16px] font-bold">Akses Dibatasi</h2>
        <p className="mt-1.5 mb-0 text-[13px]">
          Halaman <b>Dashboard PPG</b> hanya dapat dilihat oleh{' '}
          <b>UPG Tingkat 1</b>, <b>UPG Tingkat 2</b>, atau <b>UPG Pusat</b>.
          Satker tidak memiliki akses ke halaman ini.
        </p>
      </div>
    );
  }

  if (userRole === 'UPG Pusat') {
    return (
      <UpgPusatDashboardHub
        year={year}
        assessments={assessments}
        riskMatrix={riskMatrix}
        mandatoryEvidences={mandatoryEvidences}
        satkerScores={satkerScores}
        onSaveMandatoryEvidence={onSaveMandatoryEvidence}
        onOpenRiskFormForSatker={onOpenRiskFormForSatker}
      />
    );
  }

  return (
    <TierEvaluatorDashboardView
      userRole={userRole}
      assessments={assessments}
      riskMatrix={riskMatrix}
      onOpenRiskFormForSatker={onOpenRiskFormForSatker}
      onOpenNewRiskForm={onOpenNewRiskForm}
    />
  );
}
