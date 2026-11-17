import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Settings2,
  ShieldAlert,
} from 'lucide-react';
import {
  getMatrixRiskCategory,
  IMPACT_OPTIONS,
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
  RiskMatrixConfig,
  UpgLevel,
  UserRole,
} from '../../types/upg';
import { RiskLibraryModal } from '../RiskLibraryModal';
import {
  getCategoryBadgeClass,
  RiskMatrixConfigModal,
} from '../RiskMatrixConfigModal';

interface PenilaianRisikoPageProps {
  year: string;
  userRole: UserRole;
  assessments: RiskAssessmentRecord[];
  riskMatrix: RiskMatrixConfig;
  lockedSatkerUniqueId?: string;
  initialSatkerUniqueId?: string | null;
  initialRiskCode?: string | null;
  onSaveAssessment: (record: RiskAssessmentRecord) => void;
  onSaveRiskMatrix: (config: RiskMatrixConfig) => void;
  onNavigateDashboard: () => void;
}

const CLAIM_OPTIONS: ControlEffectivenessClaim[] = [
  'Belum Dinilai',
  'Tidak Efektif',
  'Sebagian Efektif',
  'Efektif',
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
  defaultYear: string
): ControlAssessmentEntry[] {
  const lib = RISK_CONTROL_LIBRARY.find((r) => r.kodeRisiko === riskCode);
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

export function PenilaianRisikoPage({
  year,
  userRole,
  assessments,
  riskMatrix,
  lockedSatkerUniqueId,
  initialSatkerUniqueId,
  initialRiskCode,
  onSaveAssessment,
  onSaveRiskMatrix,
  onNavigateDashboard,
}: PenilaianRisikoPageProps) {
  const isSatkerRole = userRole === 'Satker';
  const isEvaluator = userRole === 'UPG Tingkat 2';
  const allowedUpgLevels: UpgLevel[] = isEvaluator
    ? ['UPG Tingkat 3']
    : UPG_LEVELS;

  const canEdit = true;
  const canConfigMatrix =
    userRole === 'UPG Tingkat 2' || userRole === 'UPG Pusat';
  const canReturnToDashboard = true;

  const lockedSatker: MasterSatker | undefined =
    isSatkerRole && lockedSatkerUniqueId
      ? MASTER_SATKER_LIST.find((s) => s.uniqueId === lockedSatkerUniqueId)
      : undefined;

  const initialSatker: MasterSatker | undefined = lockedSatker
    ? lockedSatker
    : initialSatkerUniqueId
      ? MASTER_SATKER_LIST.find((s) => s.uniqueId === initialSatkerUniqueId)
      : undefined;

  const [selectedUpg, setSelectedUpg] = useState<UpgLevel | ''>(() => {
    if (lockedSatker) return lockedSatker.upgLevel;
    if (isEvaluator) return 'UPG Tingkat 3';
    return initialSatker?.upgLevel ?? '';
  });
  const [selectedSatkerId, setSelectedSatkerId] = useState<string>(() => {
    if (lockedSatker) return lockedSatker.uniqueId;
    if (isEvaluator && initialSatker && initialSatker.upgLevel !== 'UPG Tingkat 3') {
      return '';
    }
    return initialSatker?.uniqueId ?? '';
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

  // Sync if launched from Dashboard PPG Edit button or locked Satker changes
  useEffect(() => {
    if (lockedSatker) {
      setSelectedUpg(lockedSatker.upgLevel);
      setSelectedSatkerId(lockedSatker.uniqueId);
      if (initialRiskCode) {
        setSelectedRiskCode(initialRiskCode);
      }
      return;
    }

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
  }, [lockedSatker, initialSatkerUniqueId, initialRiskCode, assessments]);

  // Enforce UPG Tingkat 3 scope whenever active role switches to Evaluator
  useEffect(() => {
    if (lockedSatker) return;
    if (isEvaluator) {
      if (selectedUpg !== 'UPG Tingkat 3') {
        setSelectedUpg('UPG Tingkat 3');
      }
      if (selectedSatkerId) {
        const sat = MASTER_SATKER_LIST.find(
          (s) => s.uniqueId === selectedSatkerId
        );
        if (sat && sat.upgLevel !== 'UPG Tingkat 3') {
          setSelectedSatkerId('');
        }
      }
    }
  }, [lockedSatker, isEvaluator, selectedUpg, selectedSatkerId]);

  const effectiveUpg: UpgLevel | '' = lockedSatker
    ? lockedSatker.upgLevel
    : isEvaluator
      ? 'UPG Tingkat 3'
      : selectedUpg;

  const satkersForLevel = effectiveUpg
    ? MASTER_SATKER_LIST.filter((s) => s.upgLevel === effectiveUpg)
    : [];

  const activeSatker =
    satkersForLevel.find((s) => s.uniqueId === selectedSatkerId) ?? null;

  const activeRiskLib =
    RISK_CONTROL_LIBRARY.find((r) => r.kodeRisiko === selectedRiskCode) ?? null;

  // Populate form from saved assessment when satker + risk changes
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
      // Ensure all Mandatory Controls from Library are present
      const lib = RISK_CONTROL_LIBRARY.find(
        (r) => r.kodeRisiko === selectedRiskCode
      );
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
      setControls(buildDefaultControls(selectedRiskCode, year));
      setInherentProb('');
      setInherentImpact('');
      setResidualProb('');
      setResidualImpact('');
    }
  }, [selectedSatkerId, selectedRiskCode, assessments, year]);

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
      kodeRisiko: activeRiskLib.kodeRisiko,
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

      {/* BAGIAN A: IDENTITAS SATKER BERDASARKAN TINGKATAN UPG */}
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
              disabled={!canEdit || isEvaluator || Boolean(lockedSatker)}
              value={effectiveUpg}
              onChange={(e) => handleUpgChange(e.target.value as UpgLevel | '')}
              className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa] disabled:font-semibold"
            >
              {!isEvaluator && !lockedSatker && (
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
              disabled={!canEdit || !effectiveUpg || Boolean(lockedSatker)}
              value={lockedSatker ? lockedSatker.uniqueId : selectedSatkerId}
              onChange={(e) => handleSatkerChange(e.target.value)}
              className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa] disabled:font-semibold disabled:text-[#243247]"
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

      {/* BAGIAN B: PEMILIHAN RISIKO GRATIFIKASI */}
      <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
          <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
            B. Pemilihan Risiko Gratifikasi
          </h2>
          <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
            Pilih risiko gratifikasi yang akan dinilai. Untuk melihat profil lengkap
            risiko, gunakan tombol Risk and Control Library.
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
              {RISK_CONTROL_LIBRARY.map((risk) => (
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
            <span>Risk and Control Library</span>
          </button>
        </div>

        {/* PENTING: Hanya menampilkan Kode Risiko dan Pernyataan Risiko yang dipilih */}
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

      {/* BAGIAN C: KONTROL BERJALAN (MANDATORY CONTROL) */}
      <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
          <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
            C. Kontrol Berjalan (Mandatory Control)
          </h2>
          <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
            Mandatory Control otomatis dimuat dari Risk and Control Library sesuai
            risiko yang dipilih. Lengkapi klaim efektivitas untuk setiap kontrol.
          </p>
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
                    <span className="text-[11px] font-semibold text-[#137a45]">
                      Dipetakan otomatis dari Library
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-3 max-md:grid-cols-1">
                    {/* 1. Klaim Efektivitas Kontrol */}
                    <div className="col-span-4 max-md:col-span-1 flex flex-col gap-1">
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

                    {/* 4. Tahun Pelaksanaan */}
                    <div className="col-span-4 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        4. Tahun Pelaksanaan{' '}
                        <span className="text-[#dc3545]">*</span>
                      </label>
                      <select
                        disabled={!canEdit}
                        value={ctrl.tahun}
                        onChange={(e) =>
                          updateControl(idx, { tahun: e.target.value })
                        }
                        className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 5. Periode Pelaksanaan */}
                    <div className="col-span-4 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        5. Periode Pelaksanaan{' '}
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

                    {/* 2. Bukti Klaim */}
                    <div className="col-span-12 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        2. Bukti Klaim (Tautan URL HTTPS){' '}
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
                      {urlInvalid && (
                        <span className="text-[11px] font-medium text-[#dc3545]">
                          Format URL tidak valid. Wajib menggunakan tautan HTTPS (contoh:
                          https://...).
                        </span>
                      )}
                    </div>

                    {/* 3. Catatan Klaim */}
                    <div className="col-span-12 max-md:col-span-1 flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-[#536477]">
                        3. Catatan Klaim <span className="text-[#dc3545]">*</span>
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

      {/* BAGIAN D & E: INHERENT & RESIDUAL (TERPISAH) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-[#dce3eb] bg-[#f8fafc] px-4 py-2.5 text-[12px] text-[#52647a]">
        <span>
          Kategori tingkat risiko menggunakan <b>Matriks Risiko Terkonfigurasi Administrator</b>{' '}
          (5 Probabilitas × 4 Dampak).
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
        {/* BAGIAN D: PENILAIAN RISIKO INHERENT */}
        <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
            <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
              D. Penilaian Risiko Inherent
            </h2>
            <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
              Penilaian risiko <b>sebelum</b> memperhitungkan pengendalian yang berjalan.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                1. Probabilitas Inherent <span className="text-[#dc3545]">*</span>
              </label>
              <select
                disabled={!canEdit}
                value={inherentProb}
                onChange={(e) =>
                  setInherentProb(e.target.value ? Number(e.target.value) : '')
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
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
                  setInherentImpact(e.target.value ? Number(e.target.value) : '')
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
              >
                <option value="">-- Pilih Level Dampak Inherent --</option>
                {IMPACT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hasil Penilaian Inherent Terpisah */}
            <div className="mt-2 rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                Hasil Penilaian Inherent
              </div>
              {inherentProb !== '' && inherentImpact !== '' ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] text-[#243247]">
                    Probabilitas: <b>Level {inherentProb}</b> · Dampak:{' '}
                    <b>Level {inherentImpact}</b> · Skor:{' '}
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

        {/* BAGIAN E: PENILAIAN RISIKO RESIDUAL */}
        <section className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="mb-3 border-b border-[#e9eef4] pb-2.5">
            <h2 className="m-0 text-[15px] font-bold text-[#1d3554]">
              E. Penilaian Risiko Residual
            </h2>
            <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
              Penilaian risiko <b>setelah</b> memperhitungkan pengendalian yang
              berjalan.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                1. Probabilitas Residual <span className="text-[#dc3545]">*</span>
              </label>
              <select
                disabled={!canEdit}
                value={residualProb}
                onChange={(e) =>
                  setResidualProb(e.target.value ? Number(e.target.value) : '')
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
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
                  setResidualImpact(e.target.value ? Number(e.target.value) : '')
                }
                className="rounded border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
              >
                <option value="">-- Pilih Level Dampak Residual --</option>
                {IMPACT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hasil Penilaian Residual Terpisah */}
            <div className="mt-2 rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                Hasil Penilaian Residual
              </div>
              {residualProb !== '' && residualImpact !== '' ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[12px] text-[#243247]">
                    Probabilitas: <b>Level {residualProb}</b> · Dampak:{' '}
                    <b>Level {residualImpact}</b> · Skor:{' '}
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

      {/* Tombol Akhir Formulir */}
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

      {/* Modals */}
      <RiskLibraryModal
        open={libraryOpen}
        initialRiskCode={selectedRiskCode || RISK_CONTROL_LIBRARY[0].kodeRisiko}
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
