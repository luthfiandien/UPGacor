/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './components/pages/DashboardPage';
import { EvaluasiSatkerPage } from './components/pages/EvaluasiSatkerPage';
import { LaporanPage } from './components/pages/LaporanPage';
import { MonitoringPage } from './components/pages/MonitoringPage';
import { PenilaianMandiriPage } from './components/pages/PenilaianMandiriPage';
import { RekapitulasiPage } from './components/pages/RekapitulasiPage';
import {
  createInitialMonitoringDetails,
  createInitialSatkerState,
  downloadCSV,
  PAGE_META,
} from './data/upgData';
import {
  MonitoringDetail,
  MonitoringDetailsMap,
  PageId,
  SatkerEvaluation,
  SatkerStateMap,
  SelfScoreEntry,
  SelfScoresMap,
} from './types/upg';

const STORAGE_KEY = 'wastitama_upg_tingkat_ii_state_v1';

interface PersistedState {
  year: string;
  details: MonitoringDetailsMap;
  selfScores: SelfScoresMap;
  satState: SatkerStateMap;
}

function loadInitialState(): PersistedState {
  const fallback: PersistedState = {
    year: '2026',
    details: createInitialMonitoringDetails(),
    selfScores: {},
    satState: createInitialSatkerState(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      year: parsed.year || '2026',
      details: parsed.details
        ? { ...fallback.details, ...parsed.details }
        : fallback.details,
      selfScores: parsed.selfScores ?? {},
      satState: parsed.satState
        ? { ...fallback.satState, ...parsed.satState }
        : fallback.satState,
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [year, setYear] = useState<string>(initial.year);
  const [details, setDetails] = useState<MonitoringDetailsMap>(initial.details);
  const [selfScores, setSelfScores] = useState<SelfScoresMap>(initial.selfScores);
  const [satState, setSatState] = useState<SatkerStateMap>(initial.satState);

  useEffect(() => {
    try {
      const payload: PersistedState = { year, details, selfScores, satState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [year, details, selfScores, satState]);

  const handleUpdateDetail = (key: string, detail: MonitoringDetail) => {
    setDetails((prev) => ({
      ...prev,
      [key]: detail,
    }));
  };

  const handleSaveScore = (code: string, entry: SelfScoreEntry) => {
    setSelfScores((prev) => ({
      ...prev,
      [code]: entry,
    }));
  };

  const handleSaveSatker = (satkerName: string, evaluation: SatkerEvaluation) => {
    setSatState((prev) => ({
      ...prev,
      [satkerName]: evaluation,
    }));
  };

  const meta = PAGE_META[activePage];

  return (
    <div className="flex min-h-screen max-md:block">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="flex h-[66px] items-center justify-between border-b border-[#dce3eb] bg-white px-7 max-md:px-3.5">
          <div className="text-[14px] text-[#6c7b8c]">
            Wastitama / <b className="text-[#243247]">{meta.crumb}</b>
          </div>

          <div className="flex items-center gap-2.5 font-bold">
            <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#e7f0fc] text-[14px] font-bold text-[#1762b5]">
              A
            </div>
            <div className="leading-tight">
              <div className="text-[14px] font-bold text-[#243247]">
                Auditor / Evaluator
              </div>
              <span className="block text-[11px] font-normal text-[#718096]">
                UPG Tingkat II
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-[1600px] px-7 py-[25px] max-md:p-[15px]">
          {/* Pagehead Banner */}
          <div className="mb-5 flex items-center justify-between gap-2.5 rounded-[2px] bg-[#07579f] px-[18px] py-[15px] text-white shadow-[0_7px_16px_rgba(27,53,85,0.11)] max-md:flex-col max-md:items-start">
            <div>
              <h1 className="m-0 text-[20px] font-semibold leading-snug text-white">
                {meta.title}
              </h1>
              <span className="text-[12px] text-[#dcecff]">
                Program Kerja Pengendalian Gratifikasi
              </span>
            </div>

            <span className="rounded bg-[#edf2f7] px-[7px] py-1 text-[10px] font-semibold text-[#52647a] whitespace-nowrap">
              TAHUN PELAKSANAAN {year}
            </span>
          </div>

          {/* Active Page */}
          {activePage === 'dashboard' && (
            <DashboardPage satState={satState} onNavigate={setActivePage} />
          )}

          {activePage === 'monitoring' && (
            <MonitoringPage
              year={year}
              onYearChange={setYear}
              details={details}
              onUpdateDetail={handleUpdateDetail}
              onExportCSV={() =>
                downloadCSV('monitoring', { details, selfScores, satState })
              }
            />
          )}

          {activePage === 'mandiri' && (
            <PenilaianMandiriPage
              year={year}
              onYearChange={setYear}
              selfScores={selfScores}
              onSaveScore={handleSaveScore}
              onExportCSV={() =>
                downloadCSV('evaluation', { details, selfScores, satState })
              }
            />
          )}

          {activePage === 'satker' && (
            <EvaluasiSatkerPage
              satState={satState}
              onSaveSatker={handleSaveSatker}
            />
          )}

          {activePage === 'rekap' && (
            <RekapitulasiPage
              year={year}
              onYearChange={setYear}
              satState={satState}
              onExportCSV={() =>
                downloadCSV('rekap', { details, selfScores, satState })
              }
            />
          )}

          {activePage === 'laporan' && (
            <LaporanPage
              year={year}
              selfScores={selfScores}
              satState={satState}
            />
          )}
        </div>
      </main>
    </div>
  );
}
