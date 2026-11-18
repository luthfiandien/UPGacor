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
  INITIAL_AUDIT_KINERJA,
  INITIAL_PENGAWASAN_REGULER,
  MASTER_SATKER_LIST,
  PAGE_META,
} from './data/ppgData';
import {
  AnnualEvalSatkerRecord,
  AuditKinerjaItem,
  MonevSatkerRecord,
  PageId,
  PengawasanRegulerItem,
  RiskAssessmentRecord,
  RiskMatrixConfig,
  UserRole,
} from './types/upg';

const STORAGE_KEY = 'wastitama_ppg_integrated_state_v2';

interface PersistedState {
  year: string;
  userRole: UserRole;
  activeSatkerId: string;
  assessments: RiskAssessmentRecord[];
  riskMatrix: RiskMatrixConfig;
  monevRecords: Record<string, MonevSatkerRecord>;
  annualRecords: Record<string, AnnualEvalSatkerRecord>;
  pengawasanReguler: PengawasanRegulerItem[];
  auditKinerja: AuditKinerjaItem[];
}

const DEFAULT_SATKER_ID =
  MASTER_SATKER_LIST.find((s) => s.upgLevel === 'UPG Tingkat 3')?.uniqueId ??
  MASTER_SATKER_LIST[0].uniqueId;

function normalizeUserRole(raw: unknown): UserRole {
  if (
    raw === 'Evaluator (UPG Pusat)' ||
    raw === 'UPG Pusat' ||
    raw === 'PPG Pusat'
  )
    return 'Evaluator (UPG Pusat)';
  if (
    raw === 'Evaluatan (satker)' ||
    raw === 'Satker' ||
    raw === 'Pemantau (Read-Only)'
  )
    return 'Evaluatan (satker)';
  return 'Evaluator (UPG Tingkat 2)';
}

function loadInitialState(): PersistedState {
  const fallback: PersistedState = {
    year: '2026',
    userRole: 'Evaluator (UPG Tingkat 2)',
    activeSatkerId: DEFAULT_SATKER_ID,
    assessments: [],
    riskMatrix: createDefaultRiskMatrix(),
    monevRecords: {},
    annualRecords: {},
    pengawasanReguler: INITIAL_PENGAWASAN_REGULER,
    auditKinerja: INITIAL_AUDIT_KINERJA,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const validSatkerId = MASTER_SATKER_LIST.some(
      (s) => s.uniqueId === parsed.activeSatkerId
    )
      ? (parsed.activeSatkerId as string)
      : fallback.activeSatkerId;
    return {
      year: parsed.year || '2026',
      userRole: normalizeUserRole(parsed.userRole),
      activeSatkerId: validSatkerId,
      assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [],
      riskMatrix: parsed.riskMatrix?.grid
        ? parsed.riskMatrix
        : fallback.riskMatrix,
      monevRecords: parsed.monevRecords ?? {},
      annualRecords: parsed.annualRecords ?? {},
      pengawasanReguler: Array.isArray(parsed.pengawasanReguler)
        ? parsed.pengawasanReguler
        : fallback.pengawasanReguler,
      auditKinerja: Array.isArray(parsed.auditKinerja)
        ? parsed.auditKinerja
        : fallback.auditKinerja,
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());
  const [userRole, setUserRole] = useState<UserRole>(initial.userRole);
  const [activeSatkerId, setActiveSatkerId] = useState<string>(
    initial.activeSatkerId
  );
  const [activePage, setActivePage] = useState<PageId>('ppg-dashboard');
  const [year, setYear] = useState<string>(initial.year);
  const [assessments, setAssessments] = useState<RiskAssessmentRecord[]>(
    initial.assessments
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
        activeSatkerId,
        assessments,
        riskMatrix,
        monevRecords,
        annualRecords,
        pengawasanReguler,
        auditKinerja,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    year,
    userRole,
    activeSatkerId,
    assessments,
    riskMatrix,
    monevRecords,
    annualRecords,
    pengawasanReguler,
    auditKinerja,
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

  const canViewEvaluatorPages =
    userRole === 'Evaluator (UPG Tingkat 2)' ||
    userRole === 'Evaluator (UPG Pusat)';

  const handleRoleChange = (nextRole: UserRole) => {
    setUserRole(nextRole);
    if (nextRole === 'Evaluatan (satker)' && activePage === 'ppg-monev') {
      setActivePage('ppg-dashboard');
    }
  };

  const handleNavigate = (page: PageId) => {
    if (!canViewEvaluatorPages && page === 'ppg-monev') {
      setActivePage('ppg-dashboard');
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
    setRiskEditTarget(
      userRole === 'Evaluatan (satker)'
        ? { satkerUniqueId: activeSatkerId }
        : null
    );
    setActivePage('ppg-risiko');
  };

  const effectivePage: PageId =
    !canViewEvaluatorPages && activePage === 'ppg-monev'
      ? 'ppg-dashboard'
      : activePage;

  const meta = PAGE_META[effectivePage];
  const isPpgPage =
    effectivePage === 'ppg-risiko' ||
    effectivePage === 'ppg-dashboard' ||
    effectivePage === 'ppg-monev';

  const activeSatkerObj =
    MASTER_SATKER_LIST.find((s) => s.uniqueId === activeSatkerId) ??
    MASTER_SATKER_LIST[0];

  const roleBadgeInitial =
    userRole === 'Evaluator (UPG Tingkat 2)'
      ? 'T2'
      : userRole === 'Evaluator (UPG Pusat)'
        ? 'U'
        : 'S';
  const roleSubtitle =
    userRole === 'Evaluator (UPG Tingkat 2)'
      ? 'Evaluator UPG Tingkat 3'
      : userRole === 'Evaluator (UPG Pusat)'
        ? 'Monitoring & Monev UPG Pusat'
        : activeSatkerObj.namaSatker;

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
                <option value="Evaluator (UPG Tingkat 2)">
                  Evaluator (UPG Tingkat 2)
                </option>
                <option value="Evaluator (UPG Pusat)">
                  Evaluator (UPG Pusat)
                </option>
                <option value="Evaluatan (satker)">Evaluatan (satker)</option>
              </select>
            </label>

            {userRole === 'Evaluatan (satker)' && (
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#52647a]">
                Satker Login:
                <select
                  value={activeSatkerId}
                  onChange={(e) => {
                    setActiveSatkerId(e.target.value);
                    setRiskEditTarget(null);
                  }}
                  aria-label="Pilih akun satker aktif"
                  className="max-w-[230px] rounded border border-[#cfd9e4] bg-[#f8fafc] px-2.5 py-1 text-[12px] font-semibold text-[#243247]"
                >
                  {MASTER_SATKER_LIST.map((sat) => (
                    <option key={sat.uniqueId} value={sat.uniqueId}>
                      [{sat.upgLevel}] {sat.namaSatker}
                    </option>
                  ))}
                </select>
              </label>
            )}

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
                  {meta.subtitle}
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
              activeSatkerId={activeSatkerId}
              assessments={assessments}
              riskMatrix={riskMatrix}
              initialSatkerUniqueId={riskEditTarget?.satkerUniqueId}
              initialRiskCode={riskEditTarget?.riskCode}
              onSaveAssessment={handleSaveAssessment}
              onSaveRiskMatrix={setRiskMatrix}
              onNavigateDashboard={() => handleNavigate('ppg-dashboard')}
            />
          )}

          {effectivePage === 'ppg-dashboard' && (
            <DashboardPPGPage
              userRole={userRole}
              activeSatkerId={activeSatkerId}
              assessments={assessments}
              riskMatrix={riskMatrix}
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
