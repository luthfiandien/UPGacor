import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck2,
  Percent,
  PlusCircle,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import {
  getMatrixRiskCategory,
  isRiskAssessmentComplete,
  MASTER_SATKER_LIST,
  RISK_CONTROL_LIBRARY,
  UPG_LEVELS,
} from '../../data/ppgData';
import {
  MasterSatker,
  RiskAssessmentRecord,
  RiskMatrixConfig,
  UserRole,
} from '../../types/upg';
import { Modal } from '../Modal';
import { PieChartCard, PieSlice } from '../PieChartCard';
import { getCategoryBadgeClass } from '../RiskMatrixConfigModal';

interface DashboardPPGPageProps {
  userRole: UserRole;
  activeSatkerUniqueId?: string;
  assessments: RiskAssessmentRecord[];
  riskMatrix: RiskMatrixConfig;
  onOpenRiskFormForSatker: (satkerUniqueId: string, riskCode?: string) => void;
  onOpenNewRiskForm: () => void;
}

export function DashboardPPGPage({
  userRole,
  activeSatkerUniqueId,
  assessments,
  riskMatrix,
  onOpenRiskFormForSatker,
  onOpenNewRiskForm,
}: DashboardPPGPageProps) {
  const isSatkerRole = userRole === 'Satker';
  const canAccess =
    userRole === 'UPG Tingkat 2' ||
    userRole === 'UPG Pusat' ||
    userRole === 'Satker';
  const canEdit = canAccess;

  const [upgFilter, setUpgFilter] = useState<string>('ALL');
  const [satkerSearch, setSatkerSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [detailSatker, setDetailSatker] = useState<MasterSatker | null>(null);
  const [detailRiskCode, setDetailRiskCode] = useState<string | null>(null);

  if (!canAccess) {
    return (
      <div className="rounded-[7px] border border-[#f5c2c7] bg-[#fde8e8] p-6 text-center text-[#9b1c24]">
        <h2 className="m-0 text-[16px] font-bold">Akses Dibatasi</h2>
        <p className="mt-1.5 mb-0 text-[13px]">
          Anda tidak memiliki akses ke halaman Dashboard PPG.
        </p>
      </div>
    );
  }

  // Helper to build pie chart slices for a single satker's assessments
  const buildSatkerCharts = (satkerAssessments: RiskAssessmentRecord[]) => {
    let riskCompleted = 0;
    let riskDraft = 0;
    let riskNotStarted = 0;

    RISK_CONTROL_LIBRARY.forEach((lib) => {
      const rec = satkerAssessments.find((a) => a.kodeRisiko === lib.kodeRisiko);
      if (!rec) {
        riskNotStarted += 1;
      } else if (isRiskAssessmentComplete(rec)) {
        riskCompleted += 1;
      } else {
        riskDraft += 1;
      }
    });

    const totalLibRisks = RISK_CONTROL_LIBRARY.length;
    const riskPct =
      totalLibRisks > 0
        ? `${Math.round((riskCompleted / totalLibRisks) * 100)}%`
        : '0%';

    const riskStatusSlices: PieSlice[] = [
      { label: 'Selesai', value: riskCompleted, color: '#198754' },
      { label: 'Belum Selesai (Draft)', value: riskDraft, color: '#d99116' },
      { label: 'Belum Diisi', value: riskNotStarted, color: '#cbd5e1' },
    ];

    let efektif = 0;
    let sebagian = 0;
    let tidakEfektif = 0;
    let belumDinilai = 0;

    satkerAssessments.forEach((rec) => {
      rec.controls.forEach((ctrl) => {
        if (ctrl.klaimEfektivitas === 'Efektif') efektif += 1;
        else if (ctrl.klaimEfektivitas === 'Sebagian Efektif') sebagian += 1;
        else if (ctrl.klaimEfektivitas === 'Tidak Efektif') tidakEfektif += 1;
        else belumDinilai += 1;
      });
    });

    const totalControls = efektif + sebagian + tidakEfektif + belumDinilai;
    const controlSlices: PieSlice[] = [
      { label: 'Efektif', value: efektif, color: '#198754' },
      { label: 'Sebagian Efektif', value: sebagian, color: '#d99116' },
      { label: 'Tidak Efektif', value: tidakEfektif, color: '#dc3545' },
      { label: 'Belum Dinilai', value: belumDinilai, color: '#94a3b8' },
    ];

    let resRendah = 0;
    let resSedang = 0;
    let resTinggi = 0;
    let resSangatTinggi = 0;
    let resBelum = 0;

    satkerAssessments.forEach((rec) => {
      const cat = getMatrixRiskCategory(
        riskMatrix,
        rec.residualProb,
        rec.residualImpact
      );
      if (cat === 'Rendah') resRendah += 1;
      else if (cat === 'Sedang') resSedang += 1;
      else if (cat === 'Tinggi') resTinggi += 1;
      else if (cat === 'Sangat Tinggi') resSangatTinggi += 1;
      else resBelum += 1;
    });

    const residualSlices: PieSlice[] = [
      { label: 'Rendah', value: resRendah, color: '#198754' },
      { label: 'Sedang', value: resSedang, color: '#d99116' },
      { label: 'Tinggi', value: resTinggi, color: '#ea580c' },
      { label: 'Sangat Tinggi', value: resSangatTinggi, color: '#dc3545' },
      { label: 'Belum Lengkap', value: resBelum, color: '#94a3b8' },
    ];

    return {
      riskCompleted,
      riskDraft,
      riskNotStarted,
      riskPct,
      riskStatusSlices,
      efektif,
      sebagian,
      tidakEfektif,
      belumDinilai,
      totalControls,
      controlSlices,
      residualSlices,
    };
  };

  // =========================================================================
  // ROLE: SATKER — strictly isolated to activeSatker only (no other satkers)
  // =========================================================================
  if (isSatkerRole) {
    const activeSatker =
      MASTER_SATKER_LIST.find((s) => s.uniqueId === activeSatkerUniqueId) ??
      MASTER_SATKER_LIST.find((s) => s.upgLevel === 'UPG Tingkat 3') ??
      MASTER_SATKER_LIST[0];

    // Strict data isolation: ONLY assessments belonging to activeSatker
    const ownAssessments = assessments.filter(
      (a) => a.satkerUniqueId === activeSatker.uniqueId
    );
    const charts = buildSatkerCharts(ownAssessments);
    const totalLibRisks = RISK_CONTROL_LIBRARY.length;
    const allComplete =
      ownAssessments.length > 0 &&
      ownAssessments.every(isRiskAssessmentComplete);
    const satkerStatus: 'SELESAI' | 'BELUM SELESAI' = allComplete
      ? 'SELESAI'
      : 'BELUM SELESAI';
    const assessedControlCount =
      charts.efektif + charts.sebagian + charts.tidakEfektif;

    const modalAssessments = detailRiskCode
      ? ownAssessments.filter((a) => a.kodeRisiko === detailRiskCode)
      : ownAssessments;

    return (
      <div className="space-y-5">
        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#e9eef4] pb-3">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded bg-[#e7f0fc] px-2.5 py-0.5 text-[11px] font-bold text-[#1762b5]">
                <Building2 className="h-3.5 w-3.5" />
                <span>
                  {activeSatker.upgLevel} · {activeSatker.namaSatker}
                </span>
              </div>
              <h2 className="m-0 text-[16px] font-bold text-[#1d3554]">
                Monitoring Pelaksanaan Penilaian Risiko Gratifikasi
              </h2>
              <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
                Menampilkan ringkasan penilaian risiko gratifikasi khusus untuk
                satuan kerja Anda sendiri.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenRiskFormForSatker(activeSatker.uniqueId)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f] whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Isi / Edit Penilaian Risiko</span>
            </button>
          </div>

          {/* Row 1: 4 Summary KPI Cards for this Satker */}
          <div className="mb-4 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
            <div
              className={`rounded-[6px] border p-3.5 ${
                satkerStatus === 'SELESAI'
                  ? 'border-[#b7e2cb] bg-[#f4fbf7]'
                  : 'border-[#f0d79d] bg-[#fffcf2]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wide ${
                      satkerStatus === 'SELESAI'
                        ? 'text-[#137a45]'
                        : 'text-[#9a6500]'
                    }`}
                  >
                    Status Penilaian Satker
                  </div>
                  <div
                    className={`mt-1 text-[20px] font-bold ${
                      satkerStatus === 'SELESAI'
                        ? 'text-[#135c35]'
                        : 'text-[#785716]'
                    }`}
                  >
                    {satkerStatus}
                  </div>
                  <div className="text-[11px] text-[#52647a]">
                    {charts.riskCompleted} dari {totalLibRisks} risiko library selesai
                  </div>
                </div>
                <div
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    satkerStatus === 'SELESAI'
                      ? 'bg-[#e3f5eb] text-[#198754]'
                      : 'bg-[#fff2d8] text-[#d99116]'
                  }`}
                >
                  {satkerStatus === 'SELESAI' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#dce3eb] bg-[#fbfcfe] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                    Risiko Teridentifikasi
                  </div>
                  <div className="mt-1 text-[24px] font-bold text-[#1d3554] tabular-nums">
                    {ownAssessments.length}{' '}
                    <span className="text-[14px] font-semibold text-[#718096]">
                      / {totalLibRisks}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#718096]">
                    Sesuai Risk Library PPG
                  </div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#dce3eb] bg-[#fbfcfe] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                    Kontrol Sudah Dinilai
                  </div>
                  <div className="mt-1 text-[24px] font-bold text-[#1d3554] tabular-nums">
                    {assessedControlCount}{' '}
                    <span className="text-[14px] font-semibold text-[#718096]">
                      / {charts.totalControls}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#718096]">
                    Mandatory Control berjalan
                  </div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
                  <FileCheck2 className="h-4 w-4" />
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
                    {charts.riskPct}
                  </div>
                  <div className="text-[11px] text-[#718096]">
                    Kelengkapan risiko satker
                  </div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 5 Control Breakdown Cards */}
          <div className="mb-5 grid grid-cols-5 gap-3 max-xl:grid-cols-3 max-sm:grid-cols-1">
            <div className="rounded-[6px] border border-[#dce3eb] bg-white p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#52647a]">
                <span>Total Kontrol</span>
                <ShieldAlert className="h-3.5 w-3.5 text-[#1762b5]" />
              </div>
              <div className="mt-1 text-[20px] font-bold text-[#1d3554] tabular-nums">
                {charts.totalControls}
              </div>
            </div>

            <div className="rounded-[6px] border border-[#b7e2cb] bg-white p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#137a45]">
                <span>Klaim Efektif</span>
                <FileCheck2 className="h-3.5 w-3.5 text-[#198754]" />
              </div>
              <div className="mt-1 text-[20px] font-bold text-[#137a45] tabular-nums">
                {charts.efektif}
              </div>
            </div>

            <div className="rounded-[6px] border border-[#f0d79d] bg-white p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#9a6500]">
                <span>Klaim Sebagian Efektif</span>
                <AlertTriangle className="h-3.5 w-3.5 text-[#d99116]" />
              </div>
              <div className="mt-1 text-[20px] font-bold text-[#9a6500] tabular-nums">
                {charts.sebagian}
              </div>
            </div>

            <div className="rounded-[6px] border border-[#f5c2c7] bg-white p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#b4232c]">
                <span>Klaim Tidak Efektif</span>
                <XCircle className="h-3.5 w-3.5 text-[#dc3545]" />
              </div>
              <div className="mt-1 text-[20px] font-bold text-[#b4232c] tabular-nums">
                {charts.tidakEfektif}
              </div>
            </div>

            <div className="rounded-[6px] border border-[#dce3eb] bg-white p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#64748b]">
                <span>Kontrol Belum Dinilai</span>
                <Clock className="h-3.5 w-3.5 text-[#64748b]" />
              </div>
              <div className="mt-1 text-[20px] font-bold text-[#475569] tabular-nums">
                {charts.belumDinilai}
              </div>
            </div>
          </div>

          {/* Diagram Lingkaran (Pie Charts) untuk Satker */}
          <div className="mb-5">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="m-0 text-[14px] font-bold text-[#1d3554]">
                  Diagram Lingkaran Penilaian Risiko — {activeSatker.namaSatker}
                </h3>
                <p className="m-0 text-[11px] text-[#718096]">
                  Visualisasi progres penyelesaian risiko, efektivitas kontrol,
                  dan profil risiko residual satker Anda.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3.5 max-xl:grid-cols-2 max-md:grid-cols-1">
              <PieChartCard
                title="Status Penilaian Risiko"
                subtitle={`Dari ${totalLibRisks} risiko pada Risk Library`}
                slices={charts.riskStatusSlices}
                centerValue={charts.riskPct}
                centerLabel="Selesai"
              />

              <PieChartCard
                title="Efektivitas Kontrol Berjalan"
                subtitle="Distribusi klaim Mandatory Control"
                slices={charts.controlSlices}
                centerValue={`${charts.totalControls}`}
                centerLabel="Total Kontrol"
                emptyText="Belum ada kontrol yang dinilai untuk satker ini."
              />

              <PieChartCard
                title="Profil Risiko Residual"
                subtitle="Berdasarkan Matriks Risiko aktif"
                slices={charts.residualSlices}
                centerValue={`${ownAssessments.length}`}
                centerLabel="Risiko Dinilai"
                emptyText="Belum ada profil risiko residual tersimpan."
              />
            </div>
          </div>

          {/* Tabel Monitoring Risiko Milik Satker Sendiri */}
          <div>
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="m-0 text-[14px] font-bold text-[#1d3554]">
                Daftar Pelaksanaan Penilaian Risiko Gratifikasi Satker
              </h3>
              <span className="text-[11px] font-semibold text-[#718096]">
                Menampilkan {totalLibRisks} risiko wajib milik{' '}
                {activeSatker.namaSatker}
              </span>
            </div>

            <div className="overflow-auto rounded-[6px] border border-[#dce3eb]">
              <table className="w-full min-w-[880px] border-collapse">
                <thead>
                  <tr>
                    {[
                      'Kode Risiko',
                      'Pernyataan Risiko',
                      'Progres Kontrol',
                      'Risiko Inherent',
                      'Risiko Residual',
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
                  {RISK_CONTROL_LIBRARY.map((lib) => {
                    const rec = ownAssessments.find(
                      (a) => a.kodeRisiko === lib.kodeRisiko
                    );
                    const complete = rec ? isRiskAssessmentComplete(rec) : false;
                    const inhCat = rec
                      ? getMatrixRiskCategory(
                          riskMatrix,
                          rec.inherentProb,
                          rec.inherentImpact
                        )
                      : null;
                    const resCat = rec
                      ? getMatrixRiskCategory(
                          riskMatrix,
                          rec.residualProb,
                          rec.residualImpact
                        )
                      : null;

                    const totalCtrl = lib.mandatoryControls.length;
                    const doneCtrl = rec
                      ? rec.controls.filter(
                          (c) => c.klaimEfektivitas !== 'Belum Dinilai'
                        ).length
                      : 0;

                    return (
                      <tr
                        key={lib.kodeRisiko}
                        className="last:[&>td]:border-b-0 hover:bg-[#fafcff]"
                      >
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <span className="font-mono-num rounded bg-[#1762b5] px-2 py-0.5 text-[11px] font-bold text-white">
                            {lib.kodeRisiko}
                          </span>
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[13px] font-medium text-[#243247]">
                          {lib.pernyataanRisiko}
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap tabular-nums text-[#52647a]">
                          <b>{doneCtrl}</b> / {totalCtrl} kontrol
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          {inhCat ? (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getCategoryBadgeClass(
                                inhCat
                              )}`}
                            >
                              {inhCat}
                            </span>
                          ) : (
                            <span className="text-[#8492a3]">—</span>
                          )}
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          {resCat ? (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getCategoryBadgeClass(
                                resCat
                              )}`}
                            >
                              {resCat}
                            </span>
                          ) : (
                            <span className="text-[#8492a3]">—</span>
                          )}
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <span
                            className={`inline-block rounded-[20px] px-2.5 py-0.5 text-[11px] font-bold ${
                              complete
                                ? 'bg-[#e3f5eb] text-[#137a45]'
                                : rec
                                  ? 'bg-[#fff2d8] text-[#9a6500]'
                                  : 'bg-[#f1f5f9] text-[#64748b]'
                            }`}
                          >
                            {complete
                              ? 'SELESAI'
                              : rec
                                ? 'BELUM SELESAI'
                                : 'BELUM DIISI'}
                          </span>
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {rec && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailSatker(activeSatker);
                                  setDetailRiskCode(lib.kodeRisiko);
                                }}
                                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#08a9c4] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Detail</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                onOpenRiskFormForSatker(
                                  activeSatker.uniqueId,
                                  lib.kodeRisiko
                                )
                              }
                              className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#1762b5] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1762b5] hover:bg-[#eef5fc]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>{rec ? 'Edit' : 'Isi'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Detail Penilaian Milik Satker Sendiri */}
        <Modal
          open={detailSatker !== null}
          title={`Detail Penilaian Risiko — [${activeSatker.upgLevel}] ${activeSatker.namaSatker}`}
          onClose={() => {
            setDetailSatker(null);
            setDetailRiskCode(null);
          }}
          showFooter={false}
        >
          <div className="space-y-4 text-[13px] text-[#243247]">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#dce3eb] bg-[#f7faff] p-3">
              <div>
                <div className="text-[11px] font-bold uppercase text-[#52647a]">
                  Identitas Satker
                </div>
                <div className="font-bold text-[#1d3554]">
                  {activeSatker.upgLevel} — {activeSatker.namaSatker}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const riskToEdit = detailRiskCode ?? undefined;
                  setDetailSatker(null);
                  setDetailRiskCode(null);
                  onOpenRiskFormForSatker(activeSatker.uniqueId, riskToEdit);
                }}
                className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0d559f]"
              >
                Edit / Lengkapi Penilaian
              </button>
            </div>

            {modalAssessments.length === 0 ? (
              <div className="rounded border border-dashed border-[#cfd9e4] bg-[#f8fafc] p-5 text-center text-[13px] text-[#718096]">
                Satker ini belum memiliki data penilaian risiko gratifikasi
                tersimpan.
              </div>
            ) : (
              modalAssessments.map((rec) => {
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
                                rel="noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[#087eaa] underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span className="break-all">{c.buktiKlaim}</span>
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
                onClick={() => {
                  setDetailSatker(null);
                  setDetailRiskCode(null);
                }}
                className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-4 py-1.5 text-[13px] font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  const isEvaluator = userRole === 'UPG Tingkat 2';
  const availableLevels = isEvaluator
    ? (['UPG Tingkat 3'] as const)
    : UPG_LEVELS;

  const scopedSatkers = isEvaluator
    ? MASTER_SATKER_LIST.filter((s) => s.upgLevel === 'UPG Tingkat 3')
    : MASTER_SATKER_LIST;

  const scopedAssessments = isEvaluator
    ? assessments.filter((a) => a.upgLevel === 'UPG Tingkat 3')
    : assessments;

  // Derive per-satker actual risk assessment statistics
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

  // 9 Summary Metrics (actual from saved assessments within scope)
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
      else if (ctrl.klaimEfektivitas === 'Sebagian Efektif') claimSebagian += 1;
      else if (ctrl.klaimEfektivitas === 'Tidak Efektif')
        claimTidakEfektif += 1;
      else claimBelumDinilai += 1;
    });
  });

  // Apply table filters
  const effectiveUpgFilter = isEvaluator ? 'UPG Tingkat 3' : upgFilter;
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
    detailSatker && (!isEvaluator || detailSatker.upgLevel === 'UPG Tingkat 3')
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
              {isEvaluator
                ? 'Monitoring Pelaksanaan Penilaian Risiko Gratifikasi Satker (UPG Tingkat 3)'
                : 'Monitoring Pelaksanaan Penilaian Risiko Gratifikasi Seluruh Satker'}
            </h2>
            <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
              {isEvaluator
                ? 'Lingkup UPG Tingkat 2: hanya menampilkan satker UPG Tingkat 3 yang dievaluasi.'
                : 'Ringkasan dan status aktual berdasarkan data yang disimpan dari formulir Penilaian Risiko Gratifikasi.'}
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={onOpenNewRiskForm}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f] whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Isi Penilaian Risiko</span>
            </button>
          )}
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
                  {isEvaluator ? 'Khusus UPG Tingkat 3' : 'UPG Tingkat 1, 2, dan 3'}
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

        {/* Row 2 of KPIs: Risks & 4 Control Claim statuses */}
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
              disabled={isEvaluator}
              onChange={(e) => setUpgFilter(e.target.value)}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] font-normal text-[#243247] disabled:bg-[#eef2f6] disabled:font-semibold"
            >
              {!isEvaluator && <option value="ALL">Semua Tingkat UPG</option>}
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
                        {canEdit && (
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
                        )}
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
                  {visibleDetailSatker.upgLevel} — {visibleDetailSatker.namaSatker}
                </div>
              </div>
              {canEdit && (
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
              )}
            </div>

            {detailSatkerAssessments.length > 0 && (() => {
              const satCharts = buildSatkerCharts(detailSatkerAssessments);
              return (
                <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                  <PieChartCard
                    title="Status Penilaian Risiko"
                    subtitle={`Dari ${RISK_CONTROL_LIBRARY.length} risiko library`}
                    slices={satCharts.riskStatusSlices}
                    centerValue={satCharts.riskPct}
                    centerLabel="Selesai"
                  />
                  <PieChartCard
                    title="Efektivitas Kontrol Berjalan"
                    subtitle="Distribusi klaim kontrol satker"
                    slices={satCharts.controlSlices}
                    centerValue={`${satCharts.totalControls}`}
                    centerLabel="Kontrol"
                  />
                </div>
              );
            })()}

            {detailSatkerAssessments.length === 0 ? (
              <div className="rounded border border-dashed border-[#cfd9e4] bg-[#f8fafc] p-5 text-center text-[13px] text-[#718096]">
                Satker ini belum memiliki data penilaian risiko gratifikasi tersimpan.
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
                                rel="noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[#087eaa] underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span className="break-all">{c.buktiKlaim}</span>
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
