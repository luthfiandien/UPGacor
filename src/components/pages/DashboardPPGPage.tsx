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
  UpgLevel,
  UserRole,
} from '../../types/upg';
import { Modal } from '../Modal';
import { PieChartCard } from '../PieChartCard';
import { getCategoryBadgeClass } from '../RiskMatrixConfigModal';

interface DashboardPPGPageProps {
  userRole: UserRole;
  activeSatkerId?: string;
  assessments: RiskAssessmentRecord[];
  riskMatrix: RiskMatrixConfig;
  onOpenRiskFormForSatker: (satkerUniqueId: string, riskCode?: string) => void;
  onOpenNewRiskForm: () => void;
}

export function DashboardPPGPage({
  userRole,
  activeSatkerId,
  assessments,
  riskMatrix,
  onOpenRiskFormForSatker,
  onOpenNewRiskForm,
}: DashboardPPGPageProps) {
  const isSatkerRole = userRole === 'Evaluatan (satker)';
  const canEdit = true;

  const [upgFilter, setUpgFilter] = useState<string>('ALL');
  const [satkerSearch, setSatkerSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [detailSatker, setDetailSatker] = useState<MasterSatker | null>(null);

  if (isSatkerRole) {
    const ownSatker =
      MASTER_SATKER_LIST.find((s) => s.uniqueId === activeSatkerId) ??
      MASTER_SATKER_LIST[0];
    const ownAssessments = assessments.filter(
      (a) => a.satkerUniqueId === ownSatker.uniqueId
    );
    const totalRisks = ownAssessments.length;
    const completedRisksCount = ownAssessments.filter(
      isRiskAssessmentComplete
    ).length;
    const incompleteRisksCount = totalRisks - completedRisksCount;
    const isSatkerComplete =
      totalRisks > 0 && completedRisksCount === totalRisks;
    const satkerStatusLabel = isSatkerComplete ? 'SELESAI' : 'BELUM SELESAI';
    const riskCompletionPct =
      totalRisks > 0
        ? ((completedRisksCount / totalRisks) * 100).toFixed(0)
        : '0';

    let ownEfektif = 0;
    let ownSebagian = 0;
    let ownTidakEfektif = 0;
    let ownBelumDinilai = 0;

    let resRendah = 0;
    let resSedang = 0;
    let resTinggi = 0;
    let resSangatTinggi = 0;

    ownAssessments.forEach((rec) => {
      rec.controls.forEach((ctrl) => {
        if (ctrl.klaimEfektivitas === 'Efektif') ownEfektif += 1;
        else if (ctrl.klaimEfektivitas === 'Sebagian Efektif') ownSebagian += 1;
        else if (ctrl.klaimEfektivitas === 'Tidak Efektif')
          ownTidakEfektif += 1;
        else ownBelumDinilai += 1;
      });

      const resCat = getMatrixRiskCategory(
        riskMatrix,
        rec.residualProb,
        rec.residualImpact
      );
      if (resCat === 'Rendah') resRendah += 1;
      else if (resCat === 'Sedang') resSedang += 1;
      else if (resCat === 'Tinggi') resTinggi += 1;
      else if (resCat === 'Sangat Tinggi') resSangatTinggi += 1;
    });

    const totalControls =
      ownEfektif + ownSebagian + ownTidakEfektif + ownBelumDinilai;

    return (
      <div className="space-y-5">
        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[18px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#e9eef4] pb-3">
            <div>
              <h2 className="m-0 text-[16px] font-bold text-[#1d3554]">
                Monitoring Pelaksanaan Penilaian Risiko Gratifikasi
              </h2>
              <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
                Satuan Kerja:{' '}
                <b className="text-[#1762b5]">{ownSatker.upgLevel}</b> —{' '}
                <b className="text-[#243247]">{ownSatker.namaSatker}</b> (hanya
                menampilkan data penilaian satker Anda sendiri).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenRiskFormForSatker(ownSatker.uniqueId)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f] whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Isi / Edit Penilaian Risiko</span>
            </button>
          </div>

          {/* Ringkasan KPI Satker */}
          <div className="mb-5 grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
            <div
              className={`rounded-[6px] border p-3.5 ${
                isSatkerComplete
                  ? 'border-[#b7e2cb] bg-[#f4fbf7]'
                  : 'border-[#f0d79d] bg-[#fffcf2]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wide ${
                      isSatkerComplete ? 'text-[#137a45]' : 'text-[#9a6500]'
                    }`}
                  >
                    Status Penilaian Satker
                  </div>
                  <div
                    className={`mt-1 text-[20px] font-bold ${
                      isSatkerComplete ? 'text-[#135c35]' : 'text-[#785716]'
                    }`}
                  >
                    {satkerStatusLabel}
                  </div>
                  <div className="text-[11px] text-[#718096]">
                    {completedRisksCount} dari {totalRisks} risiko selesai
                  </div>
                </div>
                <div
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    isSatkerComplete
                      ? 'bg-[#e3f5eb] text-[#198754]'
                      : 'bg-[#fff2d8] text-[#d99116]'
                  }`}
                >
                  {isSatkerComplete ? (
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
                    {totalRisks}
                  </div>
                  <div className="text-[11px] text-[#718096]">
                    dari {RISK_CONTROL_LIBRARY.length} risiko pustaka
                  </div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#b7e2cb] bg-[#f4fbf7] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#137a45]">
                    Kontrol Efektif
                  </div>
                  <div className="mt-1 text-[24px] font-bold text-[#135c35] tabular-nums">
                    {ownEfektif}
                  </div>
                  <div className="text-[11px] text-[#198754]">
                    dari {totalControls} kontrol wajib
                  </div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f5eb] text-[#198754]">
                  <FileCheck2 className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="rounded-[6px] border border-[#dce3eb] bg-[#fbfcfe] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#718096]">
                    Persentase Selesai
                  </div>
                  <div className="mt-1 text-[24px] font-bold text-[#1762b5] tabular-nums">
                    {riskCompletionPct}%
                  </div>
                  <div className="text-[11px] text-[#718096]">
                    Progres penilaian risiko
                  </div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Diagram Lingkaran (Pie Charts) khusus Satker ini */}
          <div className="mb-5 grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
            <PieChartCard
              title="Status Penyelesaian Risiko"
              subtitle={`Progres penilaian risiko pada ${ownSatker.namaSatker}`}
              centerValue={`${riskCompletionPct}%`}
              centerLabel="Selesai"
              emptyText="Belum ada risiko gratifikasi yang dinilai."
              slices={[
                {
                  label: 'Selesai Dinilai',
                  value: completedRisksCount,
                  color: '#198754',
                },
                {
                  label: 'Belum Selesai',
                  value: incompleteRisksCount,
                  color: '#d99116',
                },
              ]}
            />

            <PieChartCard
              title="Klaim Efektivitas Kontrol"
              subtitle="Proporsi efektivitas kontrol berjalan (Mandatory Control)"
              centerValue={String(totalControls)}
              centerLabel="Total Kontrol"
              emptyText="Belum ada klaim kontrol tersimpan."
              slices={[
                { label: 'Efektif', value: ownEfektif, color: '#198754' },
                {
                  label: 'Sebagian Efektif',
                  value: ownSebagian,
                  color: '#d99116',
                },
                {
                  label: 'Tidak Efektif',
                  value: ownTidakEfektif,
                  color: '#dc3545',
                },
                {
                  label: 'Belum Dinilai',
                  value: ownBelumDinilai,
                  color: '#94a3b8',
                },
              ]}
            />

            <PieChartCard
              title="Distribusi Risiko Residual"
              subtitle="Kategori tingkat risiko setelah pengendalian"
              centerValue={String(totalRisks)}
              centerLabel="Risiko Dinilai"
              emptyText="Belum ada hasil penilaian risiko residual."
              slices={[
                { label: 'Rendah', value: resRendah, color: '#198754' },
                { label: 'Sedang', value: resSedang, color: '#d99116' },
                { label: 'Tinggi', value: resTinggi, color: '#ea580c' },
                {
                  label: 'Sangat Tinggi',
                  value: resSangatTinggi,
                  color: '#dc3545',
                },
              ]}
            />
          </div>

          {/* Tabel Daftar Penilaian Risiko Satker Sendiri */}
          <div className="mb-2 flex items-center justify-between">
            <h3 className="m-0 text-[14px] font-bold text-[#1d3554]">
              Daftar Penilaian Risiko Gratifikasi — {ownSatker.namaSatker}
            </h3>
            {ownAssessments.length > 0 && (
              <button
                type="button"
                onClick={() => setDetailSatker(ownSatker)}
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#08a9c4] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd]"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Ringkasan Lengkap</span>
              </button>
            )}
          </div>

          <div className="overflow-auto rounded-[6px] border border-[#dce3eb]">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr>
                  {[
                    'No.',
                    'Kode Risiko',
                    'Pernyataan Risiko',
                    'Risiko Inherent',
                    'Risiko Residual',
                    'Status',
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
                {ownAssessments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-[13px] text-[#718096]"
                    >
                      Belum ada penilaian risiko gratifikasi tersimpan untuk{' '}
                      <b>{ownSatker.namaSatker}</b>. Klik tombol{' '}
                      <b>Isi / Edit Penilaian Risiko</b> untuk mulai mengisi.
                    </td>
                  </tr>
                ) : (
                  ownAssessments.map((rec, idx) => {
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
                      <tr
                        key={rec.id}
                        className="last:[&>td]:border-b-0 hover:bg-[#fafcff]"
                      >
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[13px] tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <span className="font-mono-num rounded bg-[#1762b5] px-2 py-0.5 text-[11px] font-bold text-white">
                            {rec.kodeRisiko}
                          </span>
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[13px] text-[#243247]">
                          {rec.pernyataanRisiko}
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getCategoryBadgeClass(
                              inhCat
                            )}`}
                          >
                            {inhCat ?? '—'}
                          </span>
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getCategoryBadgeClass(
                              resCat
                            )}`}
                          >
                            {resCat ?? '—'}
                          </span>
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <span
                            className={`inline-block rounded-[20px] px-2.5 py-0.5 text-[11px] font-bold ${
                              complete
                                ? 'bg-[#e3f5eb] text-[#137a45]'
                                : 'bg-[#fff2d8] text-[#9a6500]'
                            }`}
                          >
                            {complete ? 'SELESAI' : 'BELUM SELESAI'}
                          </span>
                        </td>
                        <td className="border-b border-[#e3e8ee] px-3 py-2.5 text-[12px] whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenRiskFormForSatker(
                                ownSatker.uniqueId,
                                rec.kodeRisiko
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#1762b5] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1762b5] hover:bg-[#eef5fc]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Detail Penilaian Satker Sendiri */}
        <Modal
          open={detailSatker !== null}
          title={`Detail Penilaian Risiko — [${ownSatker.upgLevel}] ${ownSatker.namaSatker}`}
          onClose={() => setDetailSatker(null)}
          showFooter={false}
        >
          <div className="space-y-4 text-[13px] text-[#243247]">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#dce3eb] bg-[#f7faff] p-3">
              <div>
                <div className="text-[11px] font-bold uppercase text-[#52647a]">
                  Identitas Satker
                </div>
                <div className="font-bold text-[#1d3554]">
                  {ownSatker.upgLevel} — {ownSatker.namaSatker}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailSatker(null);
                  onOpenRiskFormForSatker(ownSatker.uniqueId);
                }}
                className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0d559f]"
              >
                Edit / Tambah Penilaian
              </button>
            </div>

            {ownAssessments.map((rec) => {
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
            })}

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
        </Modal>
      </div>
    );
  }

  const availableLevels: readonly UpgLevel[] =
    userRole === 'Evaluator (UPG Tingkat 2)'
      ? ['UPG Tingkat 3']
      : UPG_LEVELS;
  const isSingleLevelLocked = availableLevels.length === 1;

  const scopedSatkers = MASTER_SATKER_LIST.filter((s) =>
    availableLevels.includes(s.upgLevel)
  );

  const scopedAssessments = assessments.filter((a) =>
    availableLevels.includes(a.upgLevel)
  );

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
              {userRole === 'Evaluator (UPG Tingkat 2)'
                ? 'Monitoring Pelaksanaan Penilaian Risiko Gratifikasi Satker (UPG Tingkat 3)'
                : 'Monitoring Pelaksanaan Penilaian Risiko Gratifikasi Seluruh Satker'}
            </h2>
            <p className="m-0 mt-0.5 text-[12px] text-[#718096]">
              {userRole === 'Evaluator (UPG Tingkat 2)'
                ? 'Lingkup Evaluator (UPG Tingkat 2): hanya menampilkan satker UPG Tingkat 3 yang dievaluasi.'
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
                  {userRole === 'Evaluator (UPG Tingkat 2)'
                    ? 'Khusus UPG Tingkat 3'
                    : 'UPG Tingkat 1, 2, dan 3'}
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
