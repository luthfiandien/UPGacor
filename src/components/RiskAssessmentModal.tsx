import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Lock,
  Minus,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  getMatrixRiskCategory,
  getRiskAssessmentStatus,
  IMPACT_OPTIONS,
  isControlEntryComplete,
  isControlEntryTouched,
  isValidHttpsUrl,
  PROBABILITY_OPTIONS,
  RISK_CONTROL_LIBRARY,
} from '../data/ppgData';
import {
  ControlAssessmentEntry,
  ControlEffectivenessClaim,
  QuarterPeriod,
  RiskAssessmentRecord,
  RiskAssessmentStatus,
  RiskLibraryItem,
  RiskMatrixConfig,
} from '../types/upg';
import { getCategoryBadgeClass } from './RiskMatrixConfigModal';

interface RiskAssessmentModalProps {
  open: boolean;
  record: RiskAssessmentRecord | null;
  riskCatalog?: RiskLibraryItem[];
  riskMatrix: RiskMatrixConfig;
  year: string;
  onClose: () => void;
  onSave: (
    updated: RiskAssessmentRecord,
    computedStatus: RiskAssessmentStatus
  ) => void;
}

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

function normalizeClaim(raw: string): ControlEffectivenessClaim {
  if (raw === 'Sebagian Efektif') return 'Efektif Sebagian';
  if (
    raw === 'Efektif' ||
    raw === 'Efektif Sebagian' ||
    raw === 'Tidak Efektif'
  ) {
    return raw;
  }
  return 'Belum Dinilai';
}

function getStatusPillClass(status: RiskAssessmentStatus): string {
  switch (status) {
    case 'Selesai':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Draft':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600';
  }
}

export function RiskAssessmentModal({
  open,
  record,
  riskCatalog = RISK_CONTROL_LIBRARY,
  riskMatrix,
  year,
  onClose,
  onSave,
}: RiskAssessmentModalProps) {
  const [activeTab, setActiveTab] = useState<'controls' | 'scoring'>(
    'controls'
  );
  const [showCauseImpact, setShowCauseImpact] = useState(false);
  const [expandedMandatoryIdx, setExpandedMandatoryIdx] = useState<
    Record<number, boolean>
  >({ 0: true });
  const [showNonMandatory, setShowNonMandatory] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [controls, setControls] = useState<ControlAssessmentEntry[]>([]);
  const [nonMandatoryControls, setNonMandatoryControls] = useState<
    ControlAssessmentEntry[]
  >([]);
  const [inherentProb, setInherentProb] = useState<number | ''>('');
  const [inherentImpact, setInherentImpact] = useState<number | ''>('');
  const [residualProb, setResidualProb] = useState<number | ''>('');
  const [residualImpact, setResidualImpact] = useState<number | ''>('');

  const bodyRef = useRef<HTMLDivElement>(null);

  const libraryItem = useMemo(() => {
    if (!record) return null;
    return (
      riskCatalog.find((r) => r.kodeRisiko === record.kodeRisiko) ?? null
    );
  }, [record, riskCatalog]);

  useEffect(() => {
    if (!open || !record) return;
    setActiveTab('controls');
    setShowCauseImpact(false);
    setShowNonMandatory(false);
    setValidationErrors([]);

    const mandatoryNames = libraryItem?.mandatoryControls ?? [];
    const hydratedMandatory: ControlAssessmentEntry[] = (
      mandatoryNames.length > 0
        ? mandatoryNames
        : record.controls.map((c) => c.controlName)
    ).map((name) => {
      const existing = record.controls.find((c) => c.controlName === name);
      return existing
        ? {
            ...existing,
            klaimEfektivitas: normalizeClaim(existing.klaimEfektivitas),
            tahun: existing.tahun || year,
            periode: existing.periode || 'Triwulan I',
          }
        : {
            controlName: name,
            klaimEfektivitas: 'Belum Dinilai',
            buktiKlaim: '',
            catatanKlaim: '',
            tahun: year,
            periode: 'Triwulan I',
          };
    });

    const nonMandatoryNames = libraryItem?.nonMandatoryControls ?? [];
    const existingNonMandatory = record.nonMandatoryControls ?? [];
    const hydratedNonMandatory: ControlAssessmentEntry[] = (
      nonMandatoryNames.length > 0
        ? nonMandatoryNames
        : existingNonMandatory.map((c) => c.controlName)
    ).map((name) => {
      const existing = existingNonMandatory.find(
        (c) => c.controlName === name
      );
      return existing
        ? {
            ...existing,
            klaimEfektivitas: normalizeClaim(existing.klaimEfektivitas),
            tahun: existing.tahun || year,
            periode: existing.periode || 'Triwulan I',
          }
        : {
            controlName: name,
            klaimEfektivitas: 'Belum Dinilai',
            buktiKlaim: '',
            catatanKlaim: '',
            tahun: year,
            periode: 'Triwulan I',
          };
    });

    setControls(hydratedMandatory);
    setNonMandatoryControls(hydratedNonMandatory);
    setInherentProb(record.inherentProb);
    setInherentImpact(record.inherentImpact);
    setResidualProb(record.residualProb);
    setResidualImpact(record.residualImpact);

    const firstIncomplete = hydratedMandatory.findIndex(
      (c) => !isControlEntryComplete(c)
    );
    const defaultOpenIdx = firstIncomplete >= 0 ? firstIncomplete : 0;
    setExpandedMandatoryIdx({ [defaultOpenIdx]: true });
  }, [open, record, libraryItem, year]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !record) return null;

  const updateMandatoryControl = (
    idx: number,
    patch: Partial<ControlAssessmentEntry>
  ) => {
    setControls((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    );
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const updateNonMandatoryControl = (
    idx: number,
    patch: Partial<ControlAssessmentEntry>
  ) => {
    setNonMandatoryControls((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    );
  };

  const clearNonMandatoryControl = (idx: number) => {
    setNonMandatoryControls((prev) =>
      prev.map((c, i) =>
        i === idx
          ? {
              ...c,
              klaimEfektivitas: 'Belum Dinilai',
              buktiKlaim: '',
              catatanKlaim: '',
              periode: 'Triwulan I',
            }
          : c
      )
    );
  };

  const buildRecord = (savedAsDraft: boolean): RiskAssessmentRecord => ({
    ...record,
    tahun: record.tahun || year,
    prosesSubproses:
      libraryItem?.prosesSubproses ?? record.prosesSubproses ?? '',
    pernyataanRisiko:
      libraryItem?.pernyataanRisiko ?? record.pernyataanRisiko,
    controls: controls.map((c) => ({ ...c, buktiKlaim: c.buktiKlaim.trim() })),
    nonMandatoryControls: nonMandatoryControls.map((c) => ({
      ...c,
      buktiKlaim: c.buktiKlaim.trim(),
    })),
    inherentProb,
    inherentImpact,
    residualProb,
    residualImpact,
    savedAsDraft,
    updatedAt: new Date().toISOString(),
  });

  const completedMandatoryCount = controls.filter(isControlEntryComplete).length;
  const filledNonMandatoryCount =
    nonMandatoryControls.filter(isControlEntryTouched).length;

  const inherentScore =
    inherentProb !== '' && inherentImpact !== ''
      ? Number(inherentProb) * Number(inherentImpact)
      : null;
  const residualScore =
    residualProb !== '' && residualImpact !== ''
      ? Number(residualProb) * Number(residualImpact)
      : null;

  const isAllRequiredReady =
    controls.length > 0 &&
    controls.every(isControlEntryComplete) &&
    inherentScore !== null &&
    residualScore !== null;

  const previewStatus: RiskAssessmentStatus = isAllRequiredReady
    ? 'Selesai'
    : getRiskAssessmentStatus(buildRecord(false));

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

  const scoreDiff =
    inherentScore !== null && residualScore !== null
      ? inherentScore - residualScore
      : null;

  const handleSaveDraft = () => {
    setValidationErrors([]);
    const draftRecord = buildRecord(true);
    onSave(draftRecord, 'Draft');
    onClose();
  };

  const handleSaveFinal = () => {
    const missing: string[] = [];

    controls.forEach((ctrl, idx) => {
      const prefix = `Kontrol Wajib #${idx + 1} (${ctrl.controlName})`;
      if (ctrl.klaimEfektivitas === 'Belum Dinilai') {
        missing.push(`${prefix}: Klaim Efektivitas Kontrol wajib dipilih.`);
      }
      if (!ctrl.periode) {
        missing.push(`${prefix}: Periode Pelaksanaan wajib dipilih.`);
      }
      if (!ctrl.buktiKlaim.trim()) {
        missing.push(`${prefix}: Bukti Klaim (Tautan URL HTTPS) wajib diisi.`);
      } else if (!isValidHttpsUrl(ctrl.buktiKlaim)) {
        missing.push(
          `${prefix}: Bukti Klaim harus berupa tautan URL https:// yang valid.`
        );
      }
      if (!ctrl.catatanKlaim.trim()) {
        missing.push(`${prefix}: Catatan Klaim wajib diisi.`);
      }
    });

    if (inherentProb === '' || inherentImpact === '') {
      missing.push(
        'Tab 2 — Risiko Inherent: Probabilitas (1–5) dan Dampak (1–4) wajib dipilih.'
      );
    }
    if (residualProb === '' || residualImpact === '') {
      missing.push(
        'Tab 2 — Risiko Residual: Probabilitas (1–5) dan Dampak (1–4) wajib dipilih.'
      );
    }

    if (missing.length > 0) {
      setValidationErrors(missing);
      bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    const finalRecord = buildRecord(false);
    onSave(finalRecord, 'Selesai');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1f36]/60 p-3 sm:p-5 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assessment-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#cfd9e4] bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="border-b border-[#dce3eb] bg-[#f8fafc] px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-num rounded-md bg-[#0F4C81] px-2.5 py-0.5 text-[12px] font-bold text-white">
                  {record.kodeRisiko}
                </span>
                <span className="rounded-md border border-[#cfd9e4] bg-white px-2.5 py-0.5 text-[11.5px] font-semibold text-[#45566c]">
                  {libraryItem?.prosesSubproses ||
                    record.prosesSubproses ||
                    'Proses Bisnis PPG'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#c7daf0] bg-[#eef5fc] px-2.5 py-0.5 text-[11.5px] font-bold text-[#0F4C81]">
                  <Lock className="h-3 w-3" />
                  <span>Badan Pengawasan</span>
                </span>
              </div>

              <h2
                id="assessment-modal-title"
                className="m-0 text-[15.5px] font-bold leading-snug text-[#1d3554]"
              >
                {libraryItem?.pernyataanRisiko ?? record.pernyataanRisiko}
              </h2>

              {libraryItem && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCauseImpact((prev) => !prev)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-[#0F4C81] hover:underline"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Lihat Detail Penyebab &amp; Dampak</span>
                    {showCauseImpact ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {showCauseImpact && (
                    <div className="mt-2.5 grid grid-cols-1 gap-3 rounded-lg border border-[#dce3eb] bg-white p-3.5 md:grid-cols-2">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                          Penyebab Risiko
                        </div>
                        <ul className="mt-1 mb-0 list-disc space-y-1 pl-4 text-[12px] text-[#243247]">
                          {libraryItem.penyebabRisiko.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                          Dampak Risiko
                        </div>
                        <ul className="mt-1 mb-0 list-disc space-y-1 pl-4 text-[12px] text-[#243247]">
                          {libraryItem.dampakRisiko.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal penilaian"
              className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2 Step Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dce3eb] bg-white px-6">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('controls')}
              className={`cursor-pointer border-b-2 px-4 py-3 text-[13px] font-bold transition-colors ${
                activeTab === 'controls'
                  ? 'border-[#0F4C81] text-[#0F4C81]'
                  : 'border-transparent text-[#64748b] hover:text-[#243247]'
              }`}
            >
              1. Kontrol Berjalan{' '}
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-[#45566c]">
                {completedMandatoryCount}/{controls.length} Wajib
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scoring')}
              className={`cursor-pointer border-b-2 px-4 py-3 text-[13px] font-bold transition-colors ${
                activeTab === 'scoring'
                  ? 'border-[#0F4C81] text-[#0F4C81]'
                  : 'border-transparent text-[#64748b] hover:text-[#243247]'
              }`}
            >
              2. Risiko Inherent &amp; Residual{' '}
              {inherentScore !== null && residualScore !== null && (
                <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  Lengkap
                </span>
              )}
            </button>
          </div>

          <div className="py-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusPillClass(
                previewStatus
              )}`}
            >
              Kesiapan Status: {previewStatus}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div
          ref={bodyRef}
          className="min-h-0 flex-1 overflow-y-auto bg-[#fbfcfe] p-6"
        >
          {validationErrors.length > 0 && (
            <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-[12.5px] text-red-900">
              <div className="mb-1.5 flex items-center gap-2 font-bold text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Penilaian belum dapat diselesaikan menjadi Selesai. Lengkapi
                  isian berikut atau klik &ldquo;Simpan Draft&rdquo;:
                </span>
              </div>
              <ul className="m-0 list-disc space-y-1 pl-5 text-[12px]">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'controls' ? (
            <div className="space-y-6">
              {/* BAGIAN A — MANDATORY CONTROL */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="m-0 text-[14px] font-bold text-[#1d3554]">
                      Bagian A — Mandatory Control (Wajib Diisi)
                    </h3>
                    <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">
                      Lengkapi seluruh kontrol wajib di bawah ini untuk mencapai
                      status Selesai.
                    </p>
                  </div>
                  <span className="rounded-full border border-[#c7daf0] bg-[#eef5fc] px-2.5 py-0.5 text-[11.5px] font-bold text-[#0F4C81]">
                    {completedMandatoryCount} / {controls.length} Terisi Lengkap
                  </span>
                </div>

                <div className="space-y-3">
                  {controls.map((ctrl, idx) => {
                    const isOpen = !!expandedMandatoryIdx[idx];
                    const isComplete = isControlEntryComplete(ctrl);
                    const urlInvalid =
                      ctrl.buktiKlaim.trim().length > 0 &&
                      !isValidHttpsUrl(ctrl.buktiKlaim);

                    return (
                      <div
                        key={`${ctrl.controlName}-${idx}`}
                        className="overflow-hidden rounded-lg border border-[#dce3eb] bg-white shadow-xs"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMandatoryIdx((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-[#f8fafc] px-4 py-3 text-left hover:bg-[#f1f5f9] transition-colors"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="rounded bg-[#0F4C81] px-2 py-0.5 text-[11px] font-bold text-white whitespace-nowrap">
                              Wajib #{idx + 1}
                            </span>
                            <span className="truncate text-[13.5px] font-bold text-[#1d3554]">
                              {ctrl.controlName}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {isComplete ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Lengkap</span>
                              </span>
                            ) : (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                Belum Lengkap
                              </span>
                            )}
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="border-t border-[#e9eef4] p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* 1. Klaim Efektivitas Kontrol */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-bold text-[#45566c]">
                                  1. Klaim Efektivitas Kontrol{' '}
                                  <span className="text-red-600">*</span>
                                </label>
                                <select
                                  value={ctrl.klaimEfektivitas}
                                  onChange={(e) =>
                                    updateMandatoryControl(idx, {
                                      klaimEfektivitas: e.target
                                        .value as ControlEffectivenessClaim,
                                    })
                                  }
                                  className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                                >
                                  {CLAIM_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 2. Periode Pelaksanaan */}
                              <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-bold text-[#45566c]">
                                  2. Periode Pelaksanaan{' '}
                                  <span className="text-red-600">*</span>
                                </label>
                                <select
                                  value={ctrl.periode}
                                  onChange={(e) =>
                                    updateMandatoryControl(idx, {
                                      periode: e.target.value as QuarterPeriod,
                                    })
                                  }
                                  className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                                >
                                  {PERIOD_OPTIONS.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 3. Bukti Klaim (Tautan URL HTTPS) */}
                              <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="text-[12px] font-bold text-[#45566c]">
                                  3. Bukti Klaim (Tautan URL HTTPS){' '}
                                  <span className="text-red-600">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    value={ctrl.buktiKlaim}
                                    onChange={(e) =>
                                      updateMandatoryControl(idx, {
                                        buktiKlaim: e.target.value,
                                      })
                                    }
                                    placeholder="https://wastitama.mahkamahagung.go.id/dokumen/bukti-kontrol"
                                    className={`flex-1 rounded-md border px-3 py-2 text-[13px] text-[#243247] focus:outline-none ${
                                      urlInvalid
                                        ? 'border-red-400 bg-red-50/50 focus:border-red-500'
                                        : 'border-[#cfd9e4] bg-white focus:border-[#0F4C81]'
                                    }`}
                                  />
                                  {isValidHttpsUrl(ctrl.buktiKlaim) && (
                                    <a
                                      href={ctrl.buktiKlaim.trim()}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 rounded-md border border-[#0F4C81] bg-white px-3 py-2 text-[12px] font-semibold text-[#0F4C81] hover:bg-[#eef5fc]"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      <span>Buka</span>
                                    </a>
                                  )}
                                </div>
                                {urlInvalid && (
                                  <span className="text-[11.5px] font-medium text-red-600">
                                    URL harus menggunakan protokol https:// yang
                                    valid agar dihitung lengkap.
                                  </span>
                                )}
                              </div>

                              {/* 4. Catatan Klaim */}
                              <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="text-[12px] font-bold text-[#45566c]">
                                  4. Catatan Klaim{' '}
                                  <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  value={ctrl.catatanKlaim}
                                  onChange={(e) =>
                                    updateMandatoryControl(idx, {
                                      catatanKlaim: e.target.value,
                                    })
                                  }
                                  placeholder="Jelaskan bukti pelaksanaan kontrol dan dasar penetapan efektivitas..."
                                  className="min-h-[76px] resize-y rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BAGIAN B — NON-MANDATORY CONTROL (COLLAPSED BY DEFAULT) */}
              {nonMandatoryControls.length > 0 && (
                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-[14px] font-bold text-[#1d3554]">
                          Bagian B — Non-Mandatory Control
                        </h3>
                        <span className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                          Opsional — Tidak Wajib Diisi
                        </span>
                        {filledNonMandatoryCount > 0 && (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                            +{filledNonMandatoryCount} Pelengkap Terisi
                          </span>
                        )}
                      </div>
                      <p className="m-0 text-[12px] text-[#64748b]">
                        Kontrol pelengkap bersifat opsional. Status penilaian
                        tetap dapat menjadi Selesai meskipun bagian ini
                        dikosongkan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNonMandatory((prev) => !prev)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#cfd9e4] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0F4C81] hover:bg-slate-100"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        {showNonMandatory
                          ? 'Sembunyikan Kontrol Pelengkap'
                          : 'Tampilkan / Isi Kontrol Pelengkap'}
                      </span>
                      {showNonMandatory ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {showNonMandatory && (
                    <div className="mt-4 space-y-3 border-t border-dashed border-slate-300 pt-4">
                      {nonMandatoryControls.map((ctrl, idx) => {
                        const touched = isControlEntryTouched(ctrl);
                        const urlInvalid =
                          ctrl.buktiKlaim.trim().length > 0 &&
                          !isValidHttpsUrl(ctrl.buktiKlaim);

                        return (
                          <div
                            key={`${ctrl.controlName}-${idx}`}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-slate-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                  Pelengkap #{idx + 1}
                                </span>
                                <span className="text-[13.5px] font-bold text-[#1d3554]">
                                  {ctrl.controlName}
                                </span>
                              </div>
                              {touched && (
                                <button
                                  type="button"
                                  onClick={() => clearNonMandatoryControl(idx)}
                                  className="inline-flex cursor-pointer items-center gap-1 text-[11.5px] font-semibold text-slate-500 hover:text-red-600"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Kosongkan</span>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-bold text-[#52647a]">
                                  1. Klaim Efektivitas Kontrol (Opsional)
                                </label>
                                <select
                                  value={ctrl.klaimEfektivitas}
                                  onChange={(e) =>
                                    updateNonMandatoryControl(idx, {
                                      klaimEfektivitas: e.target
                                        .value as ControlEffectivenessClaim,
                                    })
                                  }
                                  className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                                >
                                  {CLAIM_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[12px] font-bold text-[#52647a]">
                                  2. Periode Pelaksanaan (Opsional)
                                </label>
                                <select
                                  value={ctrl.periode}
                                  onChange={(e) =>
                                    updateNonMandatoryControl(idx, {
                                      periode: e.target.value as QuarterPeriod,
                                    })
                                  }
                                  className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                                >
                                  {PERIOD_OPTIONS.map((p) => (
                                    <option key={p} value={p}>
                                      {p}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="text-[12px] font-bold text-[#52647a]">
                                  3. Bukti Klaim (Tautan URL HTTPS — Opsional)
                                </label>
                                <input
                                  type="url"
                                  value={ctrl.buktiKlaim}
                                  onChange={(e) =>
                                    updateNonMandatoryControl(idx, {
                                      buktiKlaim: e.target.value,
                                    })
                                  }
                                  placeholder="https://wastitama.mahkamahagung.go.id/dokumen/kontrol-pelengkap"
                                  className={`rounded-md border px-3 py-2 text-[13px] text-[#243247] focus:outline-none ${
                                    urlInvalid
                                      ? 'border-amber-400 bg-amber-50/40'
                                      : 'border-[#cfd9e4] bg-white focus:border-[#0F4C81]'
                                  }`}
                                />
                                {urlInvalid && (
                                  <span className="text-[11px] text-amber-700">
                                    Disarankan menggunakan format tautan https://
                                    yang valid.
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="text-[12px] font-bold text-[#52647a]">
                                  4. Catatan Klaim (Opsional)
                                </label>
                                <textarea
                                  value={ctrl.catatanKlaim}
                                  onChange={(e) =>
                                    updateNonMandatoryControl(idx, {
                                      catatanKlaim: e.target.value,
                                    })
                                  }
                                  placeholder="Catatan tambahan pelaksanaan kontrol pelengkap..."
                                  className="min-h-[64px] resize-y rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Balanced 2-Column Side-by-Side Layout */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Left: Penilaian Risiko Inherent */}
                <section className="flex flex-col justify-between rounded-lg border border-[#dce3eb] bg-white p-5 shadow-xs">
                  <div className="space-y-4">
                    <div className="border-b border-[#e9eef4] pb-3">
                      <h3 className="m-0 text-[15px] font-bold text-[#1d3554]">
                        Penilaian Risiko Inherent
                      </h3>
                      <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">
                        Tingkat risiko <b>sebelum</b> memperhitungkan kontrol
                        pengendalian yang berjalan.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-[#45566c]">
                        1. Probabilitas (1–5){' '}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={inherentProb}
                        onChange={(e) => {
                          setInherentProb(
                            e.target.value ? Number(e.target.value) : ''
                          );
                          if (validationErrors.length > 0)
                            setValidationErrors([]);
                        }}
                        className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                      >
                        <option value="">
                          -- Pilih Probabilitas (1–5) --
                        </option>
                        {PROBABILITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-[#45566c]">
                        2. Dampak (1–4) <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={inherentImpact}
                        onChange={(e) => {
                          setInherentImpact(
                            e.target.value ? Number(e.target.value) : ''
                          );
                          if (validationErrors.length > 0)
                            setValidationErrors([]);
                        }}
                        className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                      >
                        <option value="">-- Pilih Dampak (1–4) --</option>
                        {IMPACT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg border border-[#dce3eb] bg-[#f8fafc] p-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                      Hasil Risiko Inherent (Matriks 5×4)
                    </div>
                    {inherentScore !== null && inherentCategory ? (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="text-[13px] text-[#243247]">
                          Skor:{' '}
                          <b className="font-mono-num text-[16px] text-[#1d3554]">
                            {inherentScore}
                          </b>{' '}
                          <span className="text-[11.5px] text-[#64748b]">
                            ({inherentProb} × {inherentImpact})
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-0.5 text-[12px] font-bold ${getCategoryBadgeClass(
                            inherentCategory
                          )}`}
                        >
                          {inherentCategory} ({inherentScore})
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1.5 text-[12px] text-slate-400">
                        Pilih Probabilitas &amp; Dampak untuk menghitung skor.
                      </div>
                    )}
                  </div>
                </section>

                {/* Right: Penilaian Risiko Residual */}
                <section className="flex flex-col justify-between rounded-lg border border-[#dce3eb] bg-white p-5 shadow-xs">
                  <div className="space-y-4">
                    <div className="border-b border-[#e9eef4] pb-3">
                      <h3 className="m-0 text-[15px] font-bold text-[#1d3554]">
                        Penilaian Risiko Residual
                      </h3>
                      <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">
                        Tingkat risiko <b>setelah</b> memperhitungkan
                        efektivitas kontrol yang berjalan.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-[#45566c]">
                        1. Probabilitas (1–5){' '}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={residualProb}
                        onChange={(e) => {
                          setResidualProb(
                            e.target.value ? Number(e.target.value) : ''
                          );
                          if (validationErrors.length > 0)
                            setValidationErrors([]);
                        }}
                        className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                      >
                        <option value="">
                          -- Pilih Probabilitas (1–5) --
                        </option>
                        {PROBABILITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-[#45566c]">
                        2. Dampak (1–4) <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={residualImpact}
                        onChange={(e) => {
                          setResidualImpact(
                            e.target.value ? Number(e.target.value) : ''
                          );
                          if (validationErrors.length > 0)
                            setValidationErrors([]);
                        }}
                        className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                      >
                        <option value="">-- Pilih Dampak (1–4) --</option>
                        {IMPACT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg border border-[#dce3eb] bg-[#f8fafc] p-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                      Hasil Risiko Residual (Matriks 5×4)
                    </div>
                    {residualScore !== null && residualCategory ? (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="text-[13px] text-[#243247]">
                          Skor:{' '}
                          <b className="font-mono-num text-[16px] text-[#1d3554]">
                            {residualScore}
                          </b>{' '}
                          <span className="text-[11.5px] text-[#64748b]">
                            ({residualProb} × {residualImpact})
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-0.5 text-[12px] font-bold ${getCategoryBadgeClass(
                            residualCategory
                          )}`}
                        >
                          {residualCategory} ({residualScore})
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1.5 text-[12px] text-slate-400">
                        Pilih Probabilitas &amp; Dampak untuk menghitung skor.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Reduction Strip + Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce3eb] bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#52647a]">
                  <span className="font-bold text-[#1d3554]">
                    Perbandingan Inherent vs Residual:
                  </span>
                  {scoreDiff !== null &&
                  inherentScore !== null &&
                  residualScore !== null ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-num font-semibold text-[#1d3554]">
                        {inherentScore}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono-num font-semibold text-[#1d3554]">
                        {residualScore}
                      </span>
                      {scoreDiff > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[12px] font-bold text-emerald-700">
                          <ArrowDownRight className="h-3.5 w-3.5" />
                          <span>Turun {scoreDiff} poin</span>
                        </span>
                      ) : scoreDiff === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[12px] font-bold text-slate-600">
                          <Minus className="h-3.5 w-3.5" />
                          <span>Tetap (0 poin)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[12px] font-bold text-red-700">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Naik {Math.abs(scoreDiff)} poin</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      Lengkapi kedua penilaian di atas untuk melihat penurunan
                      poin risiko.
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                    1–4 Rendah
                  </span>
                  <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                    5–9 Sedang
                  </span>
                  <span className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 font-semibold text-orange-700">
                    10–12 Tinggi
                  </span>
                  <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                    15–20 Ekstrem
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dce3eb] bg-white px-6 py-3.5">
          {/* Left: Live Readiness Status Indicator */}
          <div className="text-[12px]">
            {isAllRequiredReady ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Semua Kontrol Wajib &amp; Skor Risiko telah terisi lengkap.
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Isian wajib belum lengkap — gunakan Simpan Draft jika belum
                  selesai.
                </span>
              </span>
            )}
          </div>

          {/* Right: 4 Buttons in Exact Order */}
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'controls' ? (
              <button
                type="button"
                onClick={() => setActiveTab('scoring')}
                className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0F4C81] hover:bg-[#f1f6fc]"
              >
                Lanjut ke Risiko Inherent &amp; Residual →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('controls')}
                className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#536477] hover:bg-slate-50"
              >
                ← Kembali ke Kontrol Berjalan
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#536477] hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="cursor-pointer rounded-md border border-amber-400 bg-amber-50 px-3.5 py-2 text-[12.5px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Simpan Draft
            </button>

            <button
              type="button"
              onClick={handleSaveFinal}
              className="cursor-pointer rounded-md bg-[#0F4C81] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#0b3b66] transition-colors"
            >
              Simpan Penilaian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
