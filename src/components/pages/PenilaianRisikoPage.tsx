import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Lock,
  Plus,
  Search,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  BADAN_PENGAWASAN_SATKER,
  createEmptyAssessmentForRisk,
  getMatrixRiskCategory,
  getRiskAssessmentStatus,
  IMPACT_OPTIONS,
  isControlEntryComplete,
  isControlEntryTouched,
  isRiskAssessmentComplete,
  isValidHttpsUrl,
  MASTER_SATKER_LIST,
  PROBABILITY_OPTIONS,
  RISK_CONTROL_LIBRARY,
  UPG_LEVELS,
} from '../../data/ppgData';
import {
  ControlAssessmentEntry,
  ControlEffectivenessClaim,
  MasterSatker,
  QuarterPeriod,
  RiskAssessmentRecord,
  RiskAssessmentStatus,
  RiskLibraryItem,
  RiskMatrixConfig,
  UpgLevel,
  UserRole,
} from '../../types/upg';
import { AddRiskPickerModal } from '../AddRiskPickerModal';
import { DeleteConfirmModal } from '../DeleteConfirmModal';
import { RiskAssessmentModal } from '../RiskAssessmentModal';
import { RiskLibraryModal } from '../RiskLibraryModal';
import {
  getCategoryBadgeClass,
  RiskMatrixConfigModal,
} from '../RiskMatrixConfigModal';
import { ToastContainer, ToastItem, ToastVariant } from '../ToastContainer';

interface PenilaianRisikoPageProps {
  year: string;
  userRole: UserRole;
  assessments: RiskAssessmentRecord[];
  riskCatalog?: RiskLibraryItem[];
  riskMatrix: RiskMatrixConfig;
  initialSatkerUniqueId?: string | null;
  initialRiskCode?: string | null;
  onSaveAssessment: (record: RiskAssessmentRecord) => void;
  onDeleteAssessment: (id: string) => void;
  onSaveCatalogRisk?: (item: RiskLibraryItem, isNew: boolean) => void;
  onSaveRiskMatrix: (config: RiskMatrixConfig) => void;
  onNavigateDashboard: () => void;
}

const MAX_RISKS_PER_PERIOD = 10;

const CLAIM_OPTIONS: ControlEffectivenessClaim[] = [
  'Belum Dinilai',
  'Efektif',
  'Efektif Sebagian',
  'Tidak Efektif',
];

const PERIOD_OPTIONS: QuarterPeriod[] = [
  'Triwulan I',
  'Triwulan II',
  'Triwulan III',
  'Triwulan IV',
];

const YEAR_OPTIONS = ['2025', '2026', '2027'];

function buildDefaultControls(
  riskCode: string,
  defaultYear: string,
  catalog: RiskLibraryItem[]
): ControlAssessmentEntry[] {
  const lib = catalog.find((r) => r.kodeRisiko === riskCode);
  if (!lib) return [];
  return lib.mandatoryControls.map((ctrlName) => ({
    controlName: ctrlName,
    klaimEfektivitas: 'Belum Dinilai',
    buktiKlaim: '',
    catatanKlaim: '',
    tahun: YEAR_OPTIONS.includes(defaultYear) ? defaultYear : '2026',
    periode: 'Triwulan I',
  }));
}

function getStatusPillBadgeClass(status: RiskAssessmentStatus): string {
  switch (status) {
    case 'Selesai':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Draft':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

/* ============================================================================
 * REDESIGNED SELF-ASSESSMENT WORKFLOW FOR UPG PUSAT (BADAN PENGAWASAN)
 * ==========================================================================*/
function UpgPusatSelfAssessmentView({
  year,
  assessments,
  riskCatalog,
  riskMatrix,
  initialRiskCode,
  onSaveAssessment,
  onDeleteAssessment,
  onSaveCatalogRisk,
  onSaveRiskMatrix,
}: {
  year: string;
  assessments: RiskAssessmentRecord[];
  riskCatalog: RiskLibraryItem[];
  riskMatrix: RiskMatrixConfig;
  initialRiskCode?: string | null;
  onSaveAssessment: (record: RiskAssessmentRecord) => void;
  onDeleteAssessment: (id: string) => void;
  onSaveCatalogRisk?: (item: RiskLibraryItem, isNew: boolean) => void;
  onSaveRiskMatrix: (config: RiskMatrixConfig) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<
    'Semua' | RiskAssessmentStatus
  >('Semua');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<RiskAssessmentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<RiskAssessmentRecord | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((variant: ToastVariant, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, variant, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Records strictly scoped to Badan Pengawasan and the active period year
  const bawasRecords = useMemo(() => {
    return assessments
      .filter(
        (a) =>
          a.satkerUniqueId === BADAN_PENGAWASAN_SATKER.uniqueId &&
          (a.tahun ?? year) === year
      )
      .slice(0, MAX_RISKS_PER_PERIOD);
  }, [assessments, year]);

  // If navigated from Dashboard PPG with an initialRiskCode, open assessment modal directly
  useEffect(() => {
    if (!initialRiskCode) return;
    const match = bawasRecords.find((r) => r.kodeRisiko === initialRiskCode);
    if (match) {
      setEditingRecord(match);
    }
  }, [initialRiskCode, bawasRecords]);

  const enrichedRows = useMemo(() => {
    return bawasRecords.map((rec) => {
      const lib = riskCatalog.find(
        (item) => item.kodeRisiko === rec.kodeRisiko
      );
      const status = getRiskAssessmentStatus(rec);
      const totalMandatory =
        rec.controls.length || lib?.mandatoryControls.length || 0;
      const completedMandatory = rec.controls.filter(
        isControlEntryComplete
      ).length;
      const filledNonMandatory = (rec.nonMandatoryControls ?? []).filter(
        isControlEntryTouched
      ).length;

      const inherentScore =
        rec.inherentProb !== '' && rec.inherentImpact !== ''
          ? Number(rec.inherentProb) * Number(rec.inherentImpact)
          : null;
      const inherentCategory = getMatrixRiskCategory(
        riskMatrix,
        rec.inherentProb,
        rec.inherentImpact
      );

      const residualScore =
        rec.residualProb !== '' && rec.residualImpact !== ''
          ? Number(rec.residualProb) * Number(rec.residualImpact)
          : null;
      const residualCategory = getMatrixRiskCategory(
        riskMatrix,
        rec.residualProb,
        rec.residualImpact
      );

      return {
        record: rec,
        prosesBisnis:
          lib?.prosesSubproses || rec.prosesSubproses || 'Proses Bisnis PPG',
        peristiwaRisiko: lib?.pernyataanRisiko || rec.pernyataanRisiko,
        status,
        totalMandatory,
        completedMandatory,
        filledNonMandatory,
        inherentScore,
        inherentCategory,
        residualScore,
        residualCategory,
      };
    });
  }, [bawasRecords, riskCatalog, riskMatrix]);

  const counts = useMemo(() => {
    const belumDinilai = enrichedRows.filter(
      (r) => r.status === 'Belum Dinilai'
    ).length;
    const draft = enrichedRows.filter((r) => r.status === 'Draft').length;
    const selesai = enrichedRows.filter((r) => r.status === 'Selesai').length;
    return {
      Semua: enrichedRows.length,
      'Belum Dinilai': belumDinilai,
      Draft: draft,
      Selesai: selesai,
    };
  }, [enrichedRows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'Semua') return enrichedRows;
    return enrichedRows.filter((r) => r.status === statusFilter);
  }, [enrichedRows, statusFilter]);

  const selectedRiskCodes = useMemo(
    () => bawasRecords.map((r) => r.kodeRisiko),
    [bawasRecords]
  );

  const isQuotaFull = bawasRecords.length >= MAX_RISKS_PER_PERIOD;

  const handleAddRiskFromCatalog = (risk: RiskLibraryItem) => {
    if (selectedRiskCodes.includes(risk.kodeRisiko)) {
      pushToast(
        'info',
        `Risiko ${risk.kodeRisiko} sudah ada di daftar penilaian.`
      );
      return;
    }
    if (bawasRecords.length >= MAX_RISKS_PER_PERIOD) {
      pushToast(
        'warning',
        `Kuota maksimal ${MAX_RISKS_PER_PERIOD} risiko telah tercapai.`
      );
      return;
    }
    const newRecord = createEmptyAssessmentForRisk(
      BADAN_PENGAWASAN_SATKER,
      risk,
      year
    );
    onSaveAssessment(newRecord);
    pushToast(
      'success',
      `Risiko ${risk.kodeRisiko} berhasil ditambahkan ke daftar penilaian.`
    );
  };

  const handleSaveModalAssessment = (
    updated: RiskAssessmentRecord,
    computedStatus: RiskAssessmentStatus
  ) => {
    onSaveAssessment(updated);
    if (computedStatus === 'Selesai') {
      pushToast(
        'success',
        `Penilaian ${updated.kodeRisiko} berhasil disimpan dengan status Selesai.`
      );
    } else if (computedStatus === 'Draft') {
      pushToast(
        'info',
        `Progres penilaian ${updated.kodeRisiko} berhasil disimpan sebagai Draft.`
      );
    } else {
      pushToast(
        'info',
        `Penilaian ${updated.kodeRisiko} disimpan dengan status Belum Dinilai.`
      );
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    onDeleteAssessment(deleteTarget.id);
    pushToast(
      'success',
      `Risiko ${deleteTarget.kodeRisiko} dihapus dari daftar penilaian.`
    );
    setDeleteTarget(null);
  };

  const handleSaveMatrix = (next: RiskMatrixConfig) => {
    onSaveRiskMatrix(next);
    pushToast('success', 'Konfigurasi Matriks Risiko 5×4 berhasil disimpan.');
  };

  return (
    <div className="space-y-4">
      {/* 1. LOCKED STATIC IDENTITY & QUOTA BAR */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce3eb] bg-white px-4 py-3 shadow-[0_2px_6px_rgba(27,53,85,0.04)]">
        {/* Left: Locked Static Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-[#c7daf0] bg-[#eef5fc] px-3 py-1.5 text-[13px] font-bold text-[#0F4C81]">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Badan Pengawasan</span>
          </span>
        </div>

        {/* Right: Quota Badge, Completion Badge, Matrix Config Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[12px] font-bold tabular-nums ${
              isQuotaFull
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-[#dce3eb] bg-[#f8fafc] text-[#1d3554]'
            }`}
          >
            Kuota Risiko: {bawasRecords.length} / {MAX_RISKS_PER_PERIOD} (Maks.{' '}
            {MAX_RISKS_PER_PERIOD})
          </span>

          <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700 tabular-nums">
            Selesai Dinilai: {counts.Selesai} / {bawasRecords.length}
          </span>

          <button
            type="button"
            onClick={() => setMatrixModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#cfd9e4] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1d3554] hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#0F4C81]" />
            <span>Konfigurasi Matriks Risiko (Admin)</span>
          </button>
        </div>
      </section>

      {/* 2. CLEAN TOOLBAR ABOVE THE MAIN TABLE */}
      <section className="rounded-lg border border-[#dce3eb] bg-white shadow-[0_2px_6px_rgba(27,53,85,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9eef4] px-4 py-3.5">
          {/* Left: Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              ['Semua', 'Belum Dinilai', 'Draft', 'Selesai'] as const
            ).map((statusKey) => {
              const active = statusFilter === statusKey;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setStatusFilter(statusKey)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    active
                      ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
                      : 'border-[#dce3eb] bg-[#f8fafc] text-[#45566c] hover:bg-slate-100'
                  }`}
                >
                  <span>{statusKey}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums leading-none ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-[#52647a] border border-[#dce3eb]'
                    }`}
                  >
                    {counts[statusKey]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Prominent RED Pustaka Risiko + Primary Navy + Tambah Risiko */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white shadow-xs hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              <Search className="h-4 w-4" />
              <span>Pustaka Risiko</span>
            </button>

            <button
              type="button"
              disabled={isQuotaFull}
              onClick={() => setAddPickerOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                isQuotaFull
                  ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  : 'cursor-pointer bg-[#0F4C81] text-white shadow-xs hover:bg-[#0b3b66]'
              }`}
            >
              {!isQuotaFull && <Plus className="h-4 w-4" />}
              <span>
                {isQuotaFull ? 'Kuota Maksimal (10/10)' : 'Tambah Risiko'}
              </span>
            </button>
          </div>
        </div>

        {/* 3. MAIN ASSESSMENT TABLE (8 COLUMNS, MAX 10 RISKS) */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#dce3eb] bg-[#f4f7fa]">
                <th className="w-[52px] px-3.5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  No.
                </th>
                <th className="w-[115px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  Kode Risiko
                </th>
                <th className="px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  Peristiwa Risiko &amp; Proses Bisnis
                </th>
                <th className="w-[180px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  Kontrol Berjalan
                </th>
                <th className="w-[135px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  Risiko Inherent
                </th>
                <th className="w-[135px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  Risiko Residual
                </th>
                <th className="w-[125px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  Status
                </th>
                <th className="w-[170px] px-3.5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9eef4] text-[13px] text-[#243247]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    {bawasRecords.length === 0 ? (
                      <div className="mx-auto max-w-md space-y-3">
                        <div className="text-[14px] font-bold text-[#1d3554]">
                          Belum ada risiko yang dipilih untuk periode {year}
                        </div>
                        <p className="m-0 text-[12.5px] text-[#64748b]">
                          Silakan pilih hingga {MAX_RISKS_PER_PERIOD} risiko
                          gratifikasi dari Pustaka Risiko atau klik tombol{' '}
                          <b>+ Tambah Risiko</b> untuk memulai penilaian mandiri
                          Badan Pengawasan.
                        </p>
                        <div className="flex justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setLibraryOpen(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-red-700"
                          >
                            <Search className="h-3.5 w-3.5" />
                            <span>Buka Pustaka Risiko</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddPickerOpen(true)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#0F4C81] px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-[#0b3b66]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Tambah Risiko</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[13px] text-[#718096]">
                        Tidak ada risiko dengan status{' '}
                        <b>&ldquo;{statusFilter}&rdquo;</b>.
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const mandatoryAllDone =
                    row.totalMandatory > 0 &&
                    row.completedMandatory === row.totalMandatory;

                  return (
                    <tr
                      key={row.record.id}
                      className="transition-colors hover:bg-[#f8fbff]"
                    >
                      {/* 1. No. */}
                      <td className="px-3.5 py-3.5 text-center font-semibold text-[#52647a] tabular-nums">
                        {index + 1}
                      </td>

                      {/* 2. Kode Risiko */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <span className="font-mono-num inline-block rounded-md border border-[#c7daf0] bg-[#eef5fc] px-2.5 py-1 text-[12px] font-bold text-[#0F4C81]">
                          {row.record.kodeRisiko}
                        </span>
                      </td>

                      {/* 3. Peristiwa Risiko & Proses Bisnis */}
                      <td className="px-3.5 py-3.5">
                        <div className="font-semibold leading-snug text-[#1d3554]">
                          {row.peristiwaRisiko}
                        </div>
                        <div className="mt-1 text-[12px] text-[#64748b]">
                          Proses Bisnis:{' '}
                          <span className="font-medium text-[#45566c]">
                            {row.prosesBisnis}
                          </span>
                        </div>
                      </td>

                      {/* 4. Kontrol Berjalan */}
                      <td className="px-3.5 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold tabular-nums ${
                              mandatoryAllDone
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : row.completedMandatory > 0
                                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                                  : 'border-slate-200 bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.completedMandatory}/{row.totalMandatory} Wajib
                            Terisi
                          </span>

                          {row.filledNonMandatory > 0 && (
                            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                              +{row.filledNonMandatory} Pelengkap
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Risiko Inherent */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        {row.inherentScore !== null && row.inherentCategory ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold tabular-nums ${getCategoryBadgeClass(
                              row.inherentCategory
                            )}`}
                          >
                            {row.inherentCategory} ({row.inherentScore})
                          </span>
                        ) : (
                          <span className="text-[13px] font-medium text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* 6. Risiko Residual */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        {row.residualScore !== null && row.residualCategory ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold tabular-nums ${getCategoryBadgeClass(
                              row.residualCategory
                            )}`}
                          >
                            {row.residualCategory} ({row.residualScore})
                          </span>
                        ) : (
                          <span className="text-[13px] font-medium text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* 7. Status (passive, non-clickable automatic status pill) */}
                      <td className="px-3.5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold ${getStatusPillBadgeClass(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* 8. Aksi */}
                      <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingRecord(row.record)}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                              row.status === 'Belum Dinilai'
                                ? 'bg-[#0F4C81] text-white hover:bg-[#0b3b66]'
                                : 'border border-[#0F4C81] bg-white text-[#0F4C81] hover:bg-[#eef5fc]'
                            }`}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>
                              {row.status === 'Belum Dinilai'
                                ? 'Isi Penilaian'
                                : 'Edit'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row.record)}
                            title={`Hapus ${row.record.kodeRisiko}`}
                            aria-label={`Hapus risiko ${row.record.kodeRisiko}`}
                            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      <RiskLibraryModal
        open={libraryOpen}
        riskCatalog={riskCatalog}
        selectedRiskCodes={selectedRiskCodes}
        maxQuota={MAX_RISKS_PER_PERIOD}
        canManageCatalog={true}
        onClose={() => setLibraryOpen(false)}
        onUseRisk={handleAddRiskFromCatalog}
        onSaveCatalogRisk={onSaveCatalogRisk}
        onNotify={pushToast}
      />

      <AddRiskPickerModal
        open={addPickerOpen}
        riskCatalog={riskCatalog}
        selectedRiskCodes={selectedRiskCodes}
        maxQuota={MAX_RISKS_PER_PERIOD}
        onClose={() => setAddPickerOpen(false)}
        onAddRisk={handleAddRiskFromCatalog}
      />

      <RiskAssessmentModal
        open={editingRecord !== null}
        record={editingRecord}
        riskCatalog={riskCatalog}
        riskMatrix={riskMatrix}
        year={year}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveModalAssessment}
      />

      <DeleteConfirmModal
        open={deleteTarget !== null}
        kodeRisiko={deleteTarget?.kodeRisiko ?? ''}
        pernyataanRisiko={deleteTarget?.pernyataanRisiko ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <RiskMatrixConfigModal
        open={matrixModalOpen}
        config={riskMatrix}
        canEdit={true}
        onClose={() => setMatrixModalOpen(false)}
        onSave={handleSaveMatrix}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

/* ============================================================================
 * MAIN COMPONENT (Routes UPG Pusat to Redesigned View, Preserves Other Roles)
 * ==========================================================================*/
export function PenilaianRisikoPage({
  year,
  userRole,
  assessments,
  riskCatalog = RISK_CONTROL_LIBRARY,
  riskMatrix,
  initialSatkerUniqueId,
  initialRiskCode,
  onSaveAssessment,
  onDeleteAssessment,
  onSaveCatalogRisk,
  onSaveRiskMatrix,
  onNavigateDashboard,
}: PenilaianRisikoPageProps) {
  if (userRole === 'UPG Pusat') {
    return (
      <UpgPusatSelfAssessmentView
        year={year}
        assessments={assessments}
        riskCatalog={riskCatalog}
        riskMatrix={riskMatrix}
        initialRiskCode={initialRiskCode}
        onSaveAssessment={onSaveAssessment}
        onDeleteAssessment={onDeleteAssessment}
        onSaveCatalogRisk={onSaveCatalogRisk}
        onSaveRiskMatrix={onSaveRiskMatrix}
      />
    );
  }

  return (
    <LegacyMultiSatkerView
      year={year}
      userRole={userRole}
      assessments={assessments}
      riskCatalog={riskCatalog}
      riskMatrix={riskMatrix}
      initialSatkerUniqueId={initialSatkerUniqueId}
      initialRiskCode={initialRiskCode}
      onSaveAssessment={onSaveAssessment}
      onSaveRiskMatrix={onSaveRiskMatrix}
      onNavigateDashboard={onNavigateDashboard}
    />
  );
}

/* ============================================================================
 * EXISTING MULTI-SATKER VIEW FOR UPG TINGKAT 1, UPG TINGKAT 2, & SATKER
 * ==========================================================================*/
function LegacyMultiSatkerView({
  year,
  userRole,
  assessments,
  riskCatalog = RISK_CONTROL_LIBRARY,
  riskMatrix,
  initialSatkerUniqueId,
  initialRiskCode,
  onSaveAssessment,
  onSaveRiskMatrix,
  onNavigateDashboard,
}: Omit<PenilaianRisikoPageProps, 'onDeleteAssessment' | 'onSaveCatalogRisk'>) {
  const allowedUpgLevels: UpgLevel[] =
    userRole === 'UPG Tingkat 2'
      ? ['UPG Tingkat 3']
      : userRole === 'UPG Tingkat 1'
        ? ['UPG Tingkat 2', 'UPG Tingkat 3']
        : UPG_LEVELS;
  const isSingleLevelLocked = allowedUpgLevels.length === 1;

  const canEdit = true;
  const canConfigMatrix =
    userRole === 'UPG Tingkat 1' || userRole === 'UPG Tingkat 2';
  const canReturnToDashboard =
    userRole === 'UPG Tingkat 1' || userRole === 'UPG Tingkat 2';

  const initialSatker: MasterSatker | undefined = initialSatkerUniqueId
    ? MASTER_SATKER_LIST.find((s) => s.uniqueId === initialSatkerUniqueId)
    : undefined;

  const [selectedUpg, setSelectedUpg] = useState<UpgLevel | ''>(() => {
    if (isSingleLevelLocked) return allowedUpgLevels[0];
    if (initialSatker && allowedUpgLevels.includes(initialSatker.upgLevel)) {
      return initialSatker.upgLevel;
    }
    return '';
  });
  const [selectedSatkerId, setSelectedSatkerId] = useState<string>(() => {
    if (initialSatker && allowedUpgLevels.includes(initialSatker.upgLevel)) {
      return initialSatker.uniqueId;
    }
    return '';
  });
  const [selectedRiskCode, setSelectedRiskCode] = useState<string>(
    initialRiskCode ?? ''
  );

  const [controls, setControls] = useState<ControlAssessmentEntry[]>([]);
  const [inherentProb, setInherentProb] = useState<number | ''>('');
  const [inherentImpact, setInherentImpact] = useState<number | ''>('');
  const [residualProb, setResidualProb] = useState<number | ''>('');
  const [residualImpact, setResidualImpact] = useState<number | ''>('');

  const [errors, setErrors] = useState<string[]>([]);
  const [saveBanner, setSaveBanner] = useState<{
    type: 'success' | 'warning';
    text: string;
  } | null>(null);

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);

  useEffect(() => {
    if (initialSatkerUniqueId) {
      const sat = MASTER_SATKER_LIST.find(
        (s) => s.uniqueId === initialSatkerUniqueId
      );
      if (sat) {
        setSelectedUpg(sat.upgLevel);
        setSelectedSatkerId(sat.uniqueId);
        const existingForSat = assessments.filter(
          (a) => a.satkerUniqueId === sat.uniqueId
        );
        if (initialRiskCode) {
          setSelectedRiskCode(initialRiskCode);
        } else if (existingForSat.length > 0) {
          setSelectedRiskCode(existingForSat[0].kodeRisiko);
        }
      }
    }
  }, [initialSatkerUniqueId, initialRiskCode, assessments]);

  useEffect(() => {
    const scopeLevels: UpgLevel[] =
      userRole === 'UPG Tingkat 2'
        ? ['UPG Tingkat 3']
        : userRole === 'UPG Tingkat 1'
          ? ['UPG Tingkat 2', 'UPG Tingkat 3']
          : UPG_LEVELS;

    if (scopeLevels.length === 1) {
      const onlyLevel = scopeLevels[0];
      if (selectedUpg !== onlyLevel) {
        setSelectedUpg(onlyLevel);
      }
      if (selectedSatkerId) {
        const sat = MASTER_SATKER_LIST.find(
          (s) => s.uniqueId === selectedSatkerId
        );
        if (sat && sat.upgLevel !== onlyLevel) {
          setSelectedSatkerId('');
        }
      }
    } else {
      if (selectedUpg && !scopeLevels.includes(selectedUpg)) {
        setSelectedUpg('');
        setSelectedSatkerId('');
      } else if (selectedSatkerId) {
        const sat = MASTER_SATKER_LIST.find(
          (s) => s.uniqueId === selectedSatkerId
        );
        if (sat && !scopeLevels.includes(sat.upgLevel)) {
          setSelectedSatkerId('');
        }
      }
    }
  }, [userRole, selectedUpg, selectedSatkerId]);

  const effectiveUpg: UpgLevel | '' = isSingleLevelLocked
    ? allowedUpgLevels[0]
    : selectedUpg && allowedUpgLevels.includes(selectedUpg)
      ? selectedUpg
      : '';

  const satkersForLevel = effectiveUpg
    ? MASTER_SATKER_LIST.filter((s) => s.upgLevel === effectiveUpg)
    : [];

  const activeSatker =
    satkersForLevel.find((s) => s.uniqueId === selectedSatkerId) ?? null;

  const activeRiskLib =
    riskCatalog.find((r) => r.kodeRisiko === selectedRiskCode) ?? null;

  useEffect(() => {
    setErrors([]);
    if (!selectedRiskCode) {
      setControls([]);
      setInherentProb('');
      setInherentImpact('');
      setResidualProb('');
      setResidualImpact('');
      return;
    }

    const existing = selectedSatkerId
      ? assessments.find(
          (a) =>
            a.satkerUniqueId === selectedSatkerId &&
            a.kodeRisiko === selectedRiskCode
        )
      : undefined;

    if (existing) {
      const lib = riskCatalog.find((r) => r.kodeRisiko === selectedRiskCode);
      const mergedControls: ControlAssessmentEntry[] = (
        lib?.mandatoryControls ?? []
      ).map((ctrlName) => {
        const prevCtrl = existing.controls.find(
          (c) => c.controlName === ctrlName
        );
        return (
          prevCtrl ?? {
            controlName: ctrlName,
            klaimEfektivitas: 'Belum Dinilai',
            buktiKlaim: '',
            catatanKlaim: '',
            tahun: YEAR_OPTIONS.includes(year) ? year : '2026',
            periode: 'Triwulan I',
          }
        );
      });
      setControls(mergedControls);
      setInherentProb(existing.inherentProb);
      setInherentImpact(existing.inherentImpact);
      setResidualProb(existing.residualProb);
      setResidualImpact(existing.residualImpact);
    } else {
      setControls(buildDefaultControls(selectedRiskCode, year, riskCatalog));
      setInherentProb('');
      setInherentImpact('');
      setResidualProb('');
      setResidualImpact('');
    }
  }, [selectedSatkerId, selectedRiskCode, assessments, year, riskCatalog]);

  const handleUpgChange = (nextUpg: UpgLevel | '') => {
    setSelectedUpg(nextUpg);
    setSelectedSatkerId('');
    setSaveBanner(null);
    setErrors([]);
  };

  const handleSatkerChange = (nextUniqueId: string) => {
    setSelectedSatkerId(nextUniqueId);
    setSaveBanner(null);
    setErrors([]);
  };

  const handleRiskChange = (nextRiskCode: string) => {
    setSelectedRiskCode(nextRiskCode);
    setSaveBanner(null);
    setErrors([]);
  };

  const updateControl = (
    index: number,
    patch: Partial<ControlAssessmentEntry>
  ) => {
    setControls((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, ...patch } : c))
    );
  };

  const validateAndBuildRecord = (): RiskAssessmentRecord | null => {
    const validationErrors: string[] = [];

    if (!effectiveUpg) {
      validationErrors.push('Bagian A: Tingkat UPG wajib dipilih.');
    }
    if (!activeSatker) {
      validationErrors.push('Bagian A: Nama Satker wajib dipilih.');
    }
    if (!activeRiskLib) {
      validationErrors.push('Bagian B: Risiko Gratifikasi wajib dipilih.');
    }

    controls.forEach((ctrl, i) => {
      const label = `Bagian C (Kontrol #${i + 1}: ${ctrl.controlName})`;
      if (!ctrl.buktiKlaim.trim()) {
        validationErrors.push(`${label}: Bukti Klaim wajib diisi.`);
      } else if (!isValidHttpsUrl(ctrl.buktiKlaim)) {
        validationErrors.push(
          `${label}: Bukti Klaim harus berupa tautan URL dengan format https:// yang valid.`
        );
      }
      if (!ctrl.catatanKlaim.trim()) {
        validationErrors.push(`${label}: Catatan Klaim wajib diisi.`);
      }
      if (!ctrl.tahun) {
        validationErrors.push(`${label}: Tahun Pelaksanaan wajib dipilih.`);
      }
      if (!ctrl.periode) {
        validationErrors.push(`${label}: Periode Pelaksanaan wajib dipilih.`);
      }
    });

    if (inherentProb === '' || inherentImpact === '') {
      validationErrors.push(
        'Bagian D: Probabilitas Inherent dan Dampak Inherent wajib dipilih.'
      );
    }
    if (residualProb === '' || residualImpact === '') {
      validationErrors.push(
        'Bagian E: Probabilitas Residual dan Dampak Residual wajib dipilih.'
      );
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSaveBanner(null);
      return null;
    }

    if (!activeSatker || !activeRiskLib) return null;

    return {
      id: `${activeSatker.uniqueId}::${activeRiskLib.kodeRisiko}`,
      satkerUniqueId: activeSatker.uniqueId,
      upgLevel: activeSatker.upgLevel,
      kodeSatker: activeSatker.kodeSatker,
      namaSatker: activeSatker.namaSatker,
      tahun: year,
      kodeRisiko: activeRiskLib.kodeRisiko,
      prosesSubproses: activeRiskLib.prosesSubproses,
      pernyataanRisiko: activeRiskLib.pernyataanRisiko,
      controls: controls.map((c) => ({ ...c, buktiKlaim: c.buktiKlaim.trim() })),
      inherentProb,
      inherentImpact,
      residualProb,
      residualImpact,
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = (returnToDashboard: boolean) => {
    if (!canEdit) return;
    const record = validateAndBuildRecord();
    if (!record) return;

    onSaveAssessment(record);
    setErrors([]);

    const complete = isRiskAssessmentComplete(record);
    if (returnToDashboard && canReturnToDashboard) {
      onNavigateDashboard();
      return;
    }

    if (returnToDashboard && !canReturnToDashboard) {
      setSelectedRiskCode('');
    }

    setSaveBanner({
      type: complete ? 'success' : 'warning',
      text: complete
        ? `Penilaian risiko ${record.kodeRisiko} untuk [${record.upgLevel}] ${record.namaSatker} berhasil disimpan. Status satker tercatat: SELESAI.`
        : `Data tersimpan, namun masih ada klaim kontrol berstatus "Belum Dinilai". Lengkapi seluruh klaim efektivitas agar status satker menjadi SELESAI.`,
    });
  };

  const handleCancel = () => {
    setErrors([]);
    setSaveBanner(null);
    if (canReturnToDashboard) {
      onNavigateDashboard();
    } else {
      setSelectedRiskCode('');
    }
  };

  const inherentCategory = getMatrixRiskCategory(
    riskMatrix,
    inherentProb,
    inherentImpact
  );
  const residualCategory = getMatrixRiskCategory(
    riskMatrix,
    residualProb,
    residualImpact
  );

  const satkerSavedRisks = activeSatker
    ? assessments.filter((a) => a.satkerUniqueId === activeSatker.uniqueId)
    : [];

  return (
    <div className="space-y-4">
      {saveBanner && (
        <div
          className={`flex items-start gap-2.5 rounded-[6px] border px-4 py-3 text-[13px] ${
            saveBanner.type === 'success'
              ? 'border-[#b7e2cb] bg-[#e3f5eb] text-[#135c35]'
              : 'border-[#f0d79d] bg-[#fff8e8] text-[#785716]'
          }`}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{saveBanner.text}</div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-[6px] border border-[#f5c2c7] bg-[#fde8e8] px-4 py-3 text-[12px] text-[#9b1c24]">
          <div className="mb-1 flex items-center gap-1.5 font-bold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Mohon perbaiki isian berikut sebelum menyimpan:</span>
          </div>
          <ul className="m-0 list-disc pl-5 space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* BAGIAN A: IDENTITAS SATKER */}
      <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#e9eef4] pb-2.5">
          <div>
            <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
              A. Identitas Satuan Kerja &amp; Tingkatan UPG
            </h2>
            <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
              Pilih Tingkat UPG terlebih dahulu, kemudian pilih Nama Satker.
            </p>
          </div>
          {activeSatker && (
            <span className="rounded bg-[#e7f0fc] px-2.5 py-1 text-[11px] font-bold text-[#1762b5]">
              {activeSatker.upgLevel} · {activeSatker.namaSatker}
            </span>
          )}
        </div>

        <div className="grid grid-cols-12 gap-3.5 max-md:grid-cols-1">
          <div className="col-span-4 max-md:col-span-1 flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              1. Tingkat UPG <span className="text-[#dc3545]">*</span>
            </label>
            <select
              disabled={!canEdit || isSingleLevelLocked}
              value={effectiveUpg}
              onChange={(e) => handleUpgChange(e.target.value as UpgLevel | '')}
              className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa] disabled:font-semibold"
            >
              {!isSingleLevelLocked && (
                <option value="">-- Pilih Tingkat UPG --</option>
              )}
              {allowedUpgLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-8 max-md:col-span-1 flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              2. Nama Satker <span className="text-[#dc3545]">*</span>
            </label>
            <select
              disabled={!canEdit || !effectiveUpg}
              value={selectedSatkerId}
              onChange={(e) => handleSatkerChange(e.target.value)}
              className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa] disabled:text-[#8492a3]"
            >
              <option value="">
                {effectiveUpg
                  ? `-- Pilih Satker (${effectiveUpg}) --`
                  : '-- Pilih Tingkat UPG terlebih dahulu --'}
              </option>
              {satkersForLevel.map((sat) => (
                <option key={sat.uniqueId} value={sat.uniqueId}>
                  {sat.namaSatker}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeSatker && satkerSavedRisks.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-[#dce3eb] bg-[#f8fafc] px-3 py-2 text-[12px]">
            <span className="font-semibold text-[#52647a]">
              Risiko tersimpan untuk satker ini:
            </span>
            {satkerSavedRisks.map((rec) => {
              const complete = isRiskAssessmentComplete(rec);
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => handleRiskChange(rec.kodeRisiko)}
                  className={`cursor-pointer rounded border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    selectedRiskCode === rec.kodeRisiko
                      ? 'border-[#1762b5] bg-[#1762b5] text-white'
                      : complete
                        ? 'border-[#b7e2cb] bg-[#e3f5eb] text-[#137a45]'
                        : 'border-[#f0d79d] bg-[#fff2d8] text-[#9a6500]'
                  }`}
                >
                  {rec.kodeRisiko} ({complete ? 'Selesai' : 'Belum Selesai'})
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* BAGIAN B: PEMILIHAN RISIKO */}
      <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
          <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
            B. Pemilihan Risiko Gratifikasi
          </h2>
          <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
            Pilih risiko gratifikasi yang akan dinilai atau buka Pustaka Risiko.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1 flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              Risiko Gratifikasi <span className="text-[#dc3545]">*</span>
            </label>
            <select
              disabled={!canEdit}
              value={selectedRiskCode}
              onChange={(e) => handleRiskChange(e.target.value)}
              className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
            >
              <option value="">-- Pilih Risiko Gratifikasi --</option>
              {riskCatalog.map((risk) => (
                <option key={risk.kodeRisiko} value={risk.kodeRisiko}>
                  {risk.kodeRisiko} — {risk.pernyataanRisiko}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded border border-[#08a9c4] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4" />
            <span>Pustaka Risiko</span>
          </button>
        </div>

        {activeRiskLib && (
          <div className="mt-3.5 rounded-[6px] border border-[#c7ddf5] bg-[#f4f9ff] p-3.5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#1762b5]" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                    Kode Risiko:
                  </span>
                  <span className="font-mono-num rounded bg-[#1762b5] px-2 py-0.5 text-[11px] font-bold text-white">
                    {activeRiskLib.kodeRisiko}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                    Pernyataan Risiko:
                  </div>
                  <div className="mt-0.5 text-[14px] font-semibold text-[#1d3554]">
                    {activeRiskLib.pernyataanRisiko}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* BAGIAN C: KONTROL BERJALAN */}
      <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
          <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
            C. Kontrol Berjalan (Mandatory Control)
          </h2>
        </div>

        {!activeRiskLib ? (
          <div className="rounded border border-dashed border-[#cfd9e4] bg-[#f8fafc] px-4 py-6 text-center text-[13px] text-[#718096]">
            Pilih risiko pada <b>Bagian B</b> terlebih dahulu untuk menampilkan
            Mandatory Control secara otomatis.
          </div>
        ) : (
          <div className="space-y-4">
            {controls.map((ctrl, idx) => {
              const urlInvalid =
                ctrl.buktiKlaim.trim().length > 0 &&
                !isValidHttpsUrl(ctrl.buktiKlaim);
              return (
                <div
                  key={ctrl.controlName}
                  className="rounded-[6px] border border-[#dce3eb] bg-[#fbfcfe] p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#e9eef4] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#1762b5] px-2 py-0.5 text-[11px] font-bold text-white">
                        Mandatory Control #{idx + 1}
                      </span>
                      <span className="text-[14px] font-bold text-[#1d3554]">
                        {ctrl.controlName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-3 max-md:grid-cols-1">
                    <div className="col-span-6 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        1. Klaim Efektivitas Kontrol{' '}
                        <span className="text-[#dc3545]">*</span>
                      </label>
                      <select
                        disabled={!canEdit}
                        value={ctrl.klaimEfektivitas}
                        onChange={(e) =>
                          updateControl(idx, {
                            klaimEfektivitas: e.target
                              .value as ControlEffectivenessClaim,
                          })
                        }
                        className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
                      >
                        {CLAIM_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        2. Periode Pelaksanaan{' '}
                        <span className="text-[#dc3545]">*</span>
                      </label>
                      <select
                        disabled={!canEdit}
                        value={ctrl.periode}
                        onChange={(e) =>
                          updateControl(idx, {
                            periode: e.target.value as QuarterPeriod,
                          })
                        }
                        className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
                      >
                        {PERIOD_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-12 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        3. Bukti Klaim (Tautan URL HTTPS){' '}
                        <span className="text-[#dc3545]">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          disabled={!canEdit}
                          value={ctrl.buktiKlaim}
                          onChange={(e) =>
                            updateControl(idx, { buktiKlaim: e.target.value })
                          }
                          placeholder="https://drive.mahkamahagung.go.id/bukti-kontrol"
                          className={`flex-1 rounded border px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa] ${
                            urlInvalid
                              ? 'border-[#dc3545] bg-[#fff5f5]'
                              : 'border-[#cfd9e4] bg-white'
                          }`}
                        />
                        {isValidHttpsUrl(ctrl.buktiKlaim) && (
                          <a
                            href={ctrl.buktiKlaim.trim()}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-[#08a9c4] bg-white px-2.5 py-2 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Buka</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="col-span-12 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        4. Catatan Klaim{' '}
                        <span className="text-[#dc3545]">*</span>
                      </label>
                      <textarea
                        disabled={!canEdit}
                        value={ctrl.catatanKlaim}
                        onChange={(e) =>
                          updateControl(idx, { catatanKlaim: e.target.value })
                        }
                        placeholder="Jelaskan pelaksanaan kontrol dan dasar klaim efektivitasnya..."
                        className="min-h-[75px] resize-y rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BAGIAN D & E */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-[#dce3eb] bg-[#f8fafc] px-4 py-2.5 text-[12px] text-[#52647a]">
        <span>
          Kategori tingkat risiko menggunakan <b>Matriks Risiko 5×4</b>.
        </span>
        <button
          type="button"
          onClick={() => setMatrixModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#1762b5] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1762b5] hover:bg-[#eef5fc]"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>
            {canConfigMatrix
              ? 'Konfigurasi Matriks Risiko (Admin)'
              : 'Lihat Matriks Risiko'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
            <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
              D. Penilaian Risiko Inherent
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                1. Probabilitas Inherent{' '}
                <span className="text-[#dc3545]">*</span>
              </label>
              <select
                disabled={!canEdit}
                value={inherentProb}
                onChange={(e) =>
                  setInherentProb(e.target.value ? Number(e.target.value) : '')
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
              >
                <option value="">-- Pilih Level Probabilitas Inherent --</option>
                {PROBABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                2. Dampak Inherent <span className="text-[#dc3545]">*</span>
              </label>
              <select
                disabled={!canEdit}
                value={inherentImpact}
                onChange={(e) =>
                  setInherentImpact(
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
              >
                <option value="">-- Pilih Level Dampak Inherent --</option>
                {IMPACT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                Hasil Penilaian Inherent
              </div>
              {inherentProb !== '' && inherentImpact !== '' ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] text-[#243247]">
                    Skor:{' '}
                    <b className="font-mono-num">
                      {Number(inherentProb) * Number(inherentImpact)}
                    </b>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-[12px] font-bold ${getCategoryBadgeClass(
                      inherentCategory
                    )}`}
                  >
                    {inherentCategory}
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-[12px] text-[#8492a3]">
                  Lengkapi Probabilitas dan Dampak Inherent untuk melihat hasil.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
            <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
              E. Penilaian Risiko Residual
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                1. Probabilitas Residual{' '}
                <span className="text-[#dc3545]">*</span>
              </label>
              <select
                disabled={!canEdit}
                value={residualProb}
                onChange={(e) =>
                  setResidualProb(e.target.value ? Number(e.target.value) : '')
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
              >
                <option value="">-- Pilih Level Probabilitas Residual --</option>
                {PROBABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                2. Dampak Residual <span className="text-[#dc3545]">*</span>
              </label>
              <select
                disabled={!canEdit}
                value={residualImpact}
                onChange={(e) =>
                  setResidualImpact(
                    e.target.value ? Number(e.target.value) : ''
                  )
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247]"
              >
                <option value="">-- Pilih Level Dampak Residual --</option>
                {IMPACT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                Hasil Penilaian Residual
              </div>
              {residualProb !== '' && residualImpact !== '' ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] text-[#243247]">
                    Skor:{' '}
                    <b className="font-mono-num">
                      {Number(residualProb) * Number(residualImpact)}
                    </b>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-[12px] font-bold ${getCategoryBadgeClass(
                      residualCategory
                    )}`}
                  >
                    {residualCategory}
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-[12px] text-[#8492a3]">
                  Lengkapi Probabilitas dan Dampak Residual untuk melihat hasil.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 rounded-[7px] border border-[#dce3eb] bg-white px-5 py-4 shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <button
          type="button"
          onClick={handleCancel}
          className="cursor-pointer rounded border border-[#ccd7e3] bg-white px-4 py-2 text-[13px] font-semibold text-[#536477] hover:bg-[#f8fafc]"
        >
          Batal
        </button>

        {canEdit && (
          <>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="cursor-pointer rounded border border-[#08a9c4] bg-white px-4 py-2 text-[13px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd]"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f]"
            >
              Simpan dan Kembali
            </button>
          </>
        )}
      </div>

      <RiskLibraryModal
        open={libraryOpen}
        riskCatalog={riskCatalog}
        initialRiskCode={
          selectedRiskCode || riskCatalog[0]?.kodeRisiko || 'PPG.RK.01'
        }
        onClose={() => setLibraryOpen(false)}
        onSelectRisk={canEdit ? handleRiskChange : undefined}
      />

      <RiskMatrixConfigModal
        open={matrixModalOpen}
        config={riskMatrix}
        canEdit={canConfigMatrix}
        onClose={() => setMatrixModalOpen(false)}
        onSave={onSaveRiskMatrix}
      />
    </div>
  );
}
