import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  FileSpreadsheet,
  Printer,
  Save,
} from 'lucide-react';
import {
  createDefaultAnnualEvalRecord,
  createDefaultMonevRecord,
  exportAnnualMonevExcel,
  exportMonevExcel,
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
  MonevActivityItem,
  MonevQuarterStatus,
  MonevSatkerRecord,
  UpgLevel,
  UserRole,
} from '../../types/upg';

interface MonevPPGPageProps {
  year: string;
  onYearChange: (year: string) => void;
  userRole: UserRole;
  monevRecords: Record<string, MonevSatkerRecord>;
  annualRecords: Record<string, AnnualEvalSatkerRecord>;
  onSaveMonev: (record: MonevSatkerRecord) => void;
  onSaveAnnualRecord: (record: AnnualEvalSatkerRecord) => void;
}

type MonevViewTab = 'tahunan' | 'triwulanan';

function getStatusCellStyle(status: MonevQuarterStatus): string {
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

export function MonevPPGPage({
  year,
  onYearChange,
  userRole,
  monevRecords,
  annualRecords,
  onSaveMonev,
  onSaveAnnualRecord,
}: MonevPPGPageProps) {
  const canAccess =
    userRole === 'UPG Tingkat 1' ||
    userRole === 'UPG Tingkat 2' ||
    userRole === 'UPG Pusat';
  const canEdit = canAccess;
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
      // Validate score ranges
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

  // Quarterly stats
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

  return (
    <div className="space-y-4">
      {/* Toolbar & View Switcher */}
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
                ? 'border-[#1f4e78] bg-[#1f4e78] text-white'
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
                ? 'border-[#1f4e78] bg-[#1f4e78] text-white'
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
                    : 'border-[#1762b5] bg-white text-[#1762b5] hover:bg-[#eef5fc]'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Mode Edit Aktif' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0d559f]"
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

      {/* VIEW 1: MATRIKS EVALUASI TAHUNAN PPG (SESUAI GAMBAR REFERENSI) */}
      {activeTab === 'tahunan' && (
        <div className="overflow-hidden rounded-[4px] border border-[#dce3eb] bg-white shadow-[0_2px_5px_rgba(38,56,75,0.04)]">
          {/* Dark Navy Title Header */}
          <div className="bg-[#1f4e78] px-3.5 py-2 text-[14px] font-bold uppercase tracking-wide text-white">
            MATRIKS EVALUASI TAHUNAN PROGRAM PENGENDALIAN GRATIFIKASI
          </div>

          {/* Yellow Italic Subbar */}
          <div className="border-b border-[#efe2b8] bg-[#fff4d4] px-3.5 py-1 text-[11.5px] italic text-[#3f3416]">
            Data aktual berdasarkan input satuan kerja (
            {savedAnnualRecord.updatedAt
              ? `terakhir disimpan ${new Date(
                  savedAnnualRecord.updatedAt
                ).toLocaleString('id-ID')}`
              : 'belum ada input tersimpan — klik Edit lalu Simpan Monev'}
            ). Agregat hanya muncul bila seluruh turunan lengkap.
          </div>

          {/* Top Metadata Grid (matching Excel-style header in image) */}
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

            <div className="col-span-full pt-1 text-[12px] font-medium text-[#9e4c00]">
              Lengkapi keberlakuan tiap UPG, nilai perolehan, bukti dukung, dan
              catatan verifikasi sebelum penilaian resmi.
            </div>
          </div>

          {/* Main Matrix Table matching image */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-[#0f6f73] text-white">
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
                      {/* Group Row */}
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

                      {/* Optional SubGroup Row (2.1 Sosialisasi Internal) */}
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

                      {/* Activity Rows */}
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

      {/* VIEW 2: MATRIKS MONITORING TRIWULANAN (TW I-IV) */}
      {activeTab === 'triwulanan' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[4px] border border-[#dce3eb] bg-white shadow-[0_2px_5px_rgba(38,56,75,0.04)]">
            <div className="bg-[#1f4e78] px-3.5 py-2 text-[14px] font-bold uppercase tracking-wide text-white">
              MATRIKS MONITORING TRIWULANAN PROGRAM PENGENDALIAN GRATIFIKASI
            </div>

            <div className="border-b border-[#efe2b8] bg-[#fff4d4] px-3.5 py-1 text-[11.5px] italic text-[#3f3416]">
              Status aktual berdasarkan input satuan kerja (
              {savedTriwulanRecord.updatedAt
                ? `terakhir disimpan ${new Date(
                    savedTriwulanRecord.updatedAt
                  ).toLocaleString('id-ID')}`
                : 'belum ada input tersimpan — klik Edit lalu Simpan Monev'}
              ).
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
                  className="rounded bg-[#e4f0fa] px-2.5 py-1 font-bold text-[#1762b5]"
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
                  <tr className="bg-[#0f6f73] text-white">
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
                                    className={`border-b border-l border-[#e3e8ee] px-2 py-2 text-center text-[12px] ${getStatusCellStyle(
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

            <div className="border-t border-[#dce3eb] bg-[#fbfcfe] px-4 py-2.5 text-[12px] text-[#45566c]">
              <b>Status:</b> Belum Dimulai; Dalam Proses; Selesai; Terkendala.{' '}
              <b>—</b> = tidak dijadwalkan pada triwulan tersebut, bukan tanda
              ketidakpatuhan.
            </div>
          </div>

          {/* Ringkasan Progres Triwulanan */}
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
                      <span className="text-[13px] font-bold text-[#1762b5]">
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
                <div className="mt-1 font-mono-num text-[30px] font-extrabold text-[#1762b5]">
                  {overallCompletionPct}%
                </div>
                <div className="mt-1 text-[12px] text-[#52647a]">
                  {totalCompletedCells} dari {totalScheduledCells} sel triwulan
                  selesai
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
