/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { AuditKinerjaPage } from './components/pages/AuditKinerjaPage';
import { DashboardPPGPage } from './components/pages/DashboardPPGPage';
import { MonevPPGPage } from './components/pages/MonevPPGPage';
import { PengawasanRegulerPage } from './components/pages/PengawasanRegulerPage';
import { PenilaianRisikoPage } from './components/pages/PenilaianRisikoPage';
import {
  createDefaultRiskMatrix,
  INITIAL_ALL_ASSESSMENTS,
  INITIAL_AUDIT_KINERJA,
  INITIAL_MANDATORY_EVIDENCES,
  INITIAL_PENGAWASAN_REGULER,
  INITIAL_SATKER_EVAL_SCORES,
  normalizeRiskCategory,
  PAGE_META,
  RISK_CONTROL_LIBRARY,
} from './data/ppgData';
import {
  AnnualEvalSatkerRecord,
  AuditKinerjaItem,
  ControlAssessmentEntry,
  MonevSatkerRecord,
  PageId,
  PengawasanRegulerItem,
  RiskAssessmentRecord,
  RiskLibraryItem,
  RiskMatrixConfig,
  SatkerEvalScore,
  SatkerMandatoryEvidence,
  UserRole,
} from './types/upg';

const STORAGE_KEY = 'wastitama_ppg_integrated_state_v2';

interface PersistedState {
  year: string;
  userRole: UserRole;
  assessments: RiskAssessmentRecord[];
  riskCatalog: RiskLibraryItem[];
  riskMatrix: RiskMatrixConfig;
  monevRecords: Record<string, MonevSatkerRecord>;
  annualRecords: Record<string, AnnualEvalSatkerRecord>;
  pengawasanReguler: PengawasanRegulerItem[];
  auditKinerja: AuditKinerjaItem[];
  mandatoryEvidences: SatkerMandatoryEvidence[];
  satkerScores: Record<string, SatkerEvalScore>;
}

function normalizeUserRole(raw: unknown): UserRole {
  if (raw === 'UPG Tingkat 1' || raw === 'UPG Tingkat I')
    return 'UPG Tingkat 1';
  if (raw === 'UPG Pusat' || raw === 'PPG Pusat') return 'UPG Pusat';
  if (raw === 'Satker' || raw === 'Pemantau (Read-Only)') return 'Satker';
  return 'UPG Tingkat 2';
}

function normalizePersistedAssessment(
  rec: RiskAssessmentRecord
): RiskAssessmentRecord {
  const normalizeCode = (code: string) => {
    if (code === 'PPG.RK.1') return 'PPG.RK.01';
    if (code === 'PPG.RK.2') return 'PPG.RK.02';
    return code;
  };
  const nextCode = normalizeCode(rec.kodeRisiko);
  const nextId = rec.id.includes('::PPG.RK.1')
    ? rec.id.replace('::PPG.RK.1', '::PPG.RK.01')
    : rec.id.includes('::PPG.RK.2')
      ? rec.id.replace('::PPG.RK.2', '::PPG.RK.02')
      : rec.id;

  return {
    ...rec,
    id: nextId,
    kodeRisiko: nextCode,
    controls: (rec.controls ?? []).map((c) => ({
      ...c,
      klaimEfektivitas:
        (c.klaimEfektivitas as string) === 'Sebagian Efektif'
          ? 'Efektif Sebagian'
          : c.klaimEfektivitas,
    })),
    nonMandatoryControls: (rec.nonMandatoryControls ?? []).map((c) => ({
      ...c,
      klaimEfektivitas:
        (c.klaimEfektivitas as string) === 'Sebagian Efektif'
          ? 'Efektif Sebagian'
          : c.klaimEfektivitas,
    })),
  };
}

function loadInitialState(): PersistedState {
  const fallback: PersistedState = {
    year: '2026',
    userRole: 'UPG Pusat',
    assessments: INITIAL_ALL_ASSESSMENTS,
    riskCatalog: RISK_CONTROL_LIBRARY,
    riskMatrix: createDefaultRiskMatrix(),
    monevRecords: {},
    annualRecords: {},
    pengawasanReguler: INITIAL_PENGAWASAN_REGULER,
    auditKinerja: INITIAL_AUDIT_KINERJA,
    mandatoryEvidences: INITIAL_MANDATORY_EVIDENCES,
    satkerScores: INITIAL_SATKER_EVAL_SCORES,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const normalizedGrid: Record<string, ReturnType<typeof normalizeRiskCategory>> = {};
    if (parsed.riskMatrix?.grid) {
      Object.entries(parsed.riskMatrix.grid).forEach(([k, val]) => {
        normalizedGrid[k] = normalizeRiskCategory(val);
      });
    }

    let loadedAssessments = Array.isArray(parsed.assessments)
      ? parsed.assessments.map(normalizePersistedAssessment)
      : fallback.assessments;

    // Backfill non-Bawas tier sample assessments if migrating from earlier Bawas-only storage
    const hasNonBawas = loadedAssessments.some(
      (a) => a.satkerUniqueId !== 'UPG Tingkat 1::1'
    );
    if (!hasNonBawas) {
      const existingIds = new Set(loadedAssessments.map((a) => a.id));
      loadedAssessments = [
        ...loadedAssessments,
        ...INITIAL_ALL_ASSESSMENTS.filter(
          (a) => a.satkerUniqueId !== 'UPG Tingkat 1::1' && !existingIds.has(a.id)
        ),
      ];
    }

    return {
      year: parsed.year || '2026',
      userRole: normalizeUserRole(parsed.userRole),
      assessments: loadedAssessments,
      riskCatalog:
        Array.isArray(parsed.riskCatalog) && parsed.riskCatalog.length > 0
          ? parsed.riskCatalog
          : fallback.riskCatalog,
      riskMatrix: parsed.riskMatrix?.grid
        ? { ...parsed.riskMatrix, grid: normalizedGrid }
        : fallback.riskMatrix,
      monevRecords: parsed.monevRecords ?? {},
      annualRecords: parsed.annualRecords ?? {},
      pengawasanReguler: Array.isArray(parsed.pengawasanReguler)
        ? parsed.pengawasanReguler
        : fallback.pengawasanReguler,
      auditKinerja: Array.isArray(parsed.auditKinerja)
        ? parsed.auditKinerja
        : fallback.auditKinerja,
      mandatoryEvidences:
        Array.isArray(parsed.mandatoryEvidences) &&
        parsed.mandatoryEvidences.length > 0
          ? parsed.mandatoryEvidences
          : fallback.mandatoryEvidences,
      satkerScores:
        parsed.satkerScores && Object.keys(parsed.satkerScores).length > 0
          ? parsed.satkerScores
          : fallback.satkerScores,
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());
  const [userRole, setUserRole] = useState<UserRole>(initial.userRole);
  const [activePage, setActivePage] = useState<PageId>(() =>
    initial.userRole === 'Satker' ? 'ppg-risiko' : 'ppg-dashboard'
  );
  const [year, setYear] = useState<string>(initial.year);
  const [assessments, setAssessments] = useState<RiskAssessmentRecord[]>(
    initial.assessments
  );
  const [riskCatalog, setRiskCatalog] = useState<RiskLibraryItem[]>(
    initial.riskCatalog
  );
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrixConfig>(
    initial.riskMatrix
  );
  const [monevRecords, setMonevRecords] = useState<
    Record<string, MonevSatkerRecord>
  >(initial.monevRecords);
  const [annualRecords, setAnnualRecords] = useState<
    Record<string, AnnualEvalSatkerRecord>
  >(initial.annualRecords);
  const [pengawasanReguler, setPengawasanReguler] = useState<
    PengawasanRegulerItem[]
  >(initial.pengawasanReguler);
  const [auditKinerja, setAuditKinerja] = useState<AuditKinerjaItem[]>(
    initial.auditKinerja
  );
  const [mandatoryEvidences, setMandatoryEvidences] = useState<
    SatkerMandatoryEvidence[]
  >(initial.mandatoryEvidences);
  const [satkerScores] = useState<Record<string, SatkerEvalScore>>(
    initial.satkerScores
  );

  // Pre-selected target when clicking Edit from Dashboard PPG
  const [riskEditTarget, setRiskEditTarget] = useState<{
    satkerUniqueId: string;
    riskCode?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        year,
        userRole,
        assessments,
        riskCatalog,
        riskMatrix,
        monevRecords,
        annualRecords,
        pengawasanReguler,
        auditKinerja,
        mandatoryEvidences,
        satkerScores,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    year,
    userRole,
    assessments,
    riskCatalog,
    riskMatrix,
    monevRecords,
    annualRecords,
    pengawasanReguler,
    auditKinerja,
    mandatoryEvidences,
    satkerScores,
  ]);

  const handleSaveAssessment = (record: RiskAssessmentRecord) => {
    setAssessments((prev) => {
      const existsIdx = prev.findIndex((a) => a.id === record.id);
      if (existsIdx >= 0) {
        const next = [...prev];
        next[existsIdx] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  const handleDeleteAssessment = (id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveCatalogRisk = (item: RiskLibraryItem, isNew: boolean) => {
    setRiskCatalog((prev) => {
      const idx = prev.findIndex((r) => r.kodeRisiko === item.kodeRisiko);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return isNew ? [...prev, item] : [...prev, item];
    });

    // Real-time sync to active assessment rows referencing this risk code
    setAssessments((prev) =>
      prev.map((rec) => {
        if (rec.kodeRisiko !== item.kodeRisiko) return rec;
        const recYear = rec.tahun || year;

        const syncedControls: ControlAssessmentEntry[] =
          item.mandatoryControls.map((ctrlName, idx) => {
            const byName = rec.controls.find((c) => c.controlName === ctrlName);
            const byIdx =
              !byName && rec.controls[idx]
                ? { ...rec.controls[idx], controlName: ctrlName }
                : null;
            return (
              byName ??
              byIdx ?? {
                controlName: ctrlName,
                klaimEfektivitas: 'Belum Dinilai',
                buktiKlaim: '',
                catatanKlaim: '',
                tahun: recYear,
                periode: 'Triwulan I',
              }
            );
          });

        const prevNonMandatory = rec.nonMandatoryControls ?? [];
        const syncedNonMandatory: ControlAssessmentEntry[] =
          item.nonMandatoryControls.map((ctrlName, idx) => {
            const byName = prevNonMandatory.find(
              (c) => c.controlName === ctrlName
            );
            const byIdx =
              !byName && prevNonMandatory[idx]
                ? { ...prevNonMandatory[idx], controlName: ctrlName }
                : null;
            return (
              byName ??
              byIdx ?? {
                controlName: ctrlName,
                klaimEfektivitas: 'Belum Dinilai',
                buktiKlaim: '',
                catatanKlaim: '',
                tahun: recYear,
                periode: 'Triwulan I',
              }
            );
          });

        return {
          ...rec,
          prosesSubproses: item.prosesSubproses,
          pernyataanRisiko: item.pernyataanRisiko,
          controls: syncedControls,
          nonMandatoryControls: syncedNonMandatory,
        };
      })
    );
  };

  const handleSaveMonev = (record: MonevSatkerRecord) => {
    setMonevRecords((prev) => ({
      ...prev,
      [record.key]: record,
    }));
  };

  const handleSaveAnnualRecord = (record: AnnualEvalSatkerRecord) => {
    setAnnualRecords((prev) => ({
      ...prev,
      [record.key]: record,
    }));
  };

  const handleUpdatePengawasan = (updated: PengawasanRegulerItem) => {
    setPengawasanReguler((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleUpdateAuditKinerja = (updated: AuditKinerjaItem) => {
    setAuditKinerja((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleSaveMandatoryEvidence = (updated: SatkerMandatoryEvidence) => {
    setMandatoryEvidences((prev) => {
      const idx = prev.findIndex((item) => item.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  };

  const canViewEvaluatorPages =
    userRole === 'UPG Tingkat 1' ||
    userRole === 'UPG Tingkat 2' ||
    userRole === 'UPG Pusat';

  const handleRoleChange = (nextRole: UserRole) => {
    setUserRole(nextRole);
    if (
      nextRole === 'Satker' &&
      (activePage === 'ppg-dashboard' || activePage === 'ppg-monev')
    ) {
      setActivePage('ppg-risiko');
    }
  };

  const handleNavigate = (page: PageId) => {
    if (
      !canViewEvaluatorPages &&
      (page === 'ppg-dashboard' || page === 'ppg-monev')
    ) {
      setActivePage('ppg-risiko');
      return;
    }
    if (page !== 'ppg-risiko') {
      setRiskEditTarget(null);
    }
    setActivePage(page);
  };

  const handleOpenRiskFormForSatker = (
    satkerUniqueId: string,
    riskCode?: string
  ) => {
    setRiskEditTarget({ satkerUniqueId, riskCode });
    setActivePage('ppg-risiko');
  };

  const handleOpenNewRiskForm = () => {
    setRiskEditTarget(null);
    setActivePage('ppg-risiko');
  };

  const effectivePage: PageId =
    !canViewEvaluatorPages &&
    (activePage === 'ppg-dashboard' || activePage === 'ppg-monev')
      ? 'ppg-risiko'
      : activePage;

  const meta = PAGE_META[effectivePage];
  const isPpgPage =
    effectivePage === 'ppg-risiko' ||
    effectivePage === 'ppg-dashboard' ||
    effectivePage === 'ppg-monev';

  const roleBadgeInitial =
    userRole === 'UPG Tingkat 1'
      ? 'T1'
      : userRole === 'UPG Tingkat 2'
        ? 'T2'
        : userRole === 'UPG Pusat'
          ? 'U'
          : 'S';
  const roleSubtitle =
    userRole === 'UPG Tingkat 1'
      ? 'Evaluator UPG Tingkat 2 & 3'
      : userRole === 'UPG Tingkat 2'
        ? 'Evaluator UPG Tingkat 3'
        : userRole === 'UPG Pusat'
          ? 'Monitoring & Monev UPG Pusat'
          : 'Input Penilaian Risiko Satker';

  return (
    <div className="flex min-h-screen max-md:block">
      <Sidebar
        activePage={effectivePage}
        userRole={userRole}
        onNavigate={handleNavigate}
      />

      <main className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="flex min-h-[66px] flex-wrap items-center justify-between gap-3 border-b border-[#dce3eb] bg-white px-7 py-2 max-md:px-3.5">
          <div className="text-[14px] text-[#6c7b8c]">
            Wastitama / <b className="text-[#243247]">{meta.crumb}</b>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Hak Akses Switcher */}
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#52647a]">
              Peran / Akses:
              <select
                value={userRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                aria-label="Pilih peran akses pengguna"
                className="rounded border border-[#cfd9e4] bg-[#f8fafc] px-2.5 py-1 text-[12px] font-semibold text-[#243247]"
              >
                <option value="UPG Tingkat 1">UPG Tingkat 1</option>
                <option value="UPG Tingkat 2">UPG Tingkat 2</option>
                <option value="UPG Pusat">UPG Pusat</option>
                <option value="Satker">Satker</option>
              </select>
            </label>

            <div className="flex items-center gap-2.5 font-bold">
              <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#e7f0fc] text-[14px] font-bold text-[#1762b5]">
                {roleBadgeInitial}
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-bold text-[#243247]">
                  {userRole}
                </div>
                <span className="block text-[11px] font-normal text-[#718096]">
                  {roleSubtitle}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-[1600px] px-7 py-[25px] max-md:p-[15px]">
          {/* Pagehead Banner untuk Modul PPG */}
          {isPpgPage && (
            <div className="no-print mb-5 flex items-center justify-between gap-2.5 rounded-[2px] bg-[#07579f] px-[18px] py-[15px] text-white shadow-[0_7px_16px_rgba(27,53,85,0.11)] max-md:flex-col max-md:items-start">
              <div>
                <h1 className="m-0 text-[20px] font-semibold leading-snug text-white">
                  {meta.title}
                </h1>
                <span className="text-[12px] text-[#dcecff]">
                  {effectivePage === 'ppg-dashboard' && userRole === 'UPG Pusat'
                    ? 'Data PPG MA RI, Kontrol Wajib UPG Pusat & Rekapitulasi Capaian Jenjang'
                    : meta.subtitle}
                </span>
              </div>

              <span className="rounded bg-[#edf2f7] px-[7px] py-1 text-[10px] font-semibold text-[#52647a] whitespace-nowrap">
                TAHUN PELAKSANAAN {year}
              </span>
            </div>
          )}

          {/* Active Page */}
          {effectivePage === 'pengawasan-reguler' && (
            <PengawasanRegulerPage
              items={pengawasanReguler}
              onUpdateItem={handleUpdatePengawasan}
              onNavigate={handleNavigate}
            />
          )}

          {effectivePage === 'audit-kinerja' && (
            <AuditKinerjaPage
              items={auditKinerja}
              onUpdateItem={handleUpdateAuditKinerja}
              onNavigate={handleNavigate}
            />
          )}

          {effectivePage === 'ppg-risiko' && (
            <PenilaianRisikoPage
              year={year}
              userRole={userRole}
              assessments={assessments}
              riskCatalog={riskCatalog}
              riskMatrix={riskMatrix}
              initialSatkerUniqueId={riskEditTarget?.satkerUniqueId}
              initialRiskCode={riskEditTarget?.riskCode}
              onSaveAssessment={handleSaveAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onSaveCatalogRisk={handleSaveCatalogRisk}
              onSaveRiskMatrix={setRiskMatrix}
              onNavigateDashboard={() => handleNavigate('ppg-dashboard')}
            />
          )}

          {effectivePage === 'ppg-dashboard' && (
            <DashboardPPGPage
              year={year}
              userRole={userRole}
              assessments={assessments}
              riskMatrix={riskMatrix}
              mandatoryEvidences={mandatoryEvidences}
              satkerScores={satkerScores}
              onSaveMandatoryEvidence={handleSaveMandatoryEvidence}
              onOpenRiskFormForSatker={handleOpenRiskFormForSatker}
              onOpenNewRiskForm={handleOpenNewRiskForm}
            />
          )}

          {effectivePage === 'ppg-monev' && (
            <MonevPPGPage
              year={year}
              onYearChange={setYear}
              userRole={userRole}
              monevRecords={monevRecords}
              annualRecords={annualRecords}
              onSaveMonev={handleSaveMonev}
              onSaveAnnualRecord={handleSaveAnnualRecord}
            />
          )}
        </div>
      </main>
    </div>
  );
}
