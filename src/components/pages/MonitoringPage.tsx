import React, { useState } from 'react';
import {
  ACTIVITIES,
  PROGRAMS,
  QUARTER_LABELS,
} from '../../data/upgData';
import {
  MonitoringDetail,
  MonitoringDetailsMap,
  QuarterStatus,
} from '../../types/upg';
import { Modal } from '../Modal';
import { StatusBadge } from '../StatusBadge';

interface MonitoringPageProps {
  year: string;
  onYearChange: (year: string) => void;
  details: MonitoringDetailsMap;
  onUpdateDetail: (key: string, detail: MonitoringDetail) => void;
  onExportCSV: () => void;
}

const STATUS_OPTIONS: QuarterStatus[] = [
  'Belum Dimulai',
  'Dalam Proses',
  'Selesai',
  'Terkendala',
  '—',
];

export function MonitoringPage({
  year,
  onYearChange,
  details,
  onUpdateDetail,
  onExportCSV,
}: MonitoringPageProps) {
  const [quarterFilter, setQuarterFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [formCode, setFormCode] = useState(ACTIVITIES[0].code);
  const [formQuarter, setFormQuarter] = useState<number>(0);
  const [formState, setFormState] = useState<MonitoringDetail>({
    status: 'Belum Dimulai',
    target: '',
    actual: '',
    unit: '',
    note: '',
    issue: '',
    plan: '',
    evidence: '',
    owner: '',
  });

  // Evidence preview modal
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  const openModal = (code?: string, quarterIdx?: number) => {
    const targetCode = code || ACTIVITIES[0].code;
    const targetQuarter = quarterIdx ?? 0;
    const existing = details[`${targetCode}-${targetQuarter}`];

    setIsNewEntry(!code);
    setFormCode(targetCode);
    setFormQuarter(targetQuarter);
    setFormState(
      code && existing
        ? { ...existing }
        : {
            status: 'Belum Dimulai',
            target: '',
            actual: '',
            unit: '',
            note: '',
            issue: '',
            plan: '',
            evidence: '',
            owner: '',
          }
    );
    setModalOpen(true);
  };

  const handleSave = () => {
    onUpdateDetail(`${formCode}-${formQuarter}`, formState);
    setModalOpen(false);
  };

  const handleSelectChangeInModal = (nextCode: string, nextQuarter: number) => {
    setFormCode(nextCode);
    setFormQuarter(nextQuarter);
    const existing = details[`${nextCode}-${nextQuarter}`];
    if (existing) {
      setFormState({ ...existing });
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const detailRows: Array<{
    code: string;
    name: string;
    quarterIndex: number;
    quarterLabel: string;
    detail: MonitoringDetail;
  }> = [];

  ACTIVITIES.forEach((activity) => {
    activity.quarters.forEach((_, idx) => {
      const quarterLabel = QUARTER_LABELS[idx];
      if (quarterFilter !== 'ALL' && quarterFilter !== quarterLabel) return;
      if (
        normalizedSearch &&
        !activity.name.toLowerCase().includes(normalizedSearch) &&
        !activity.code.toLowerCase().includes(normalizedSearch)
      ) {
        return;
      }
      const detail = details[`${activity.code}-${idx}`] ?? {
        status: activity.quarters[idx],
        target: '',
        actual: '',
        unit: '',
        note: '',
        issue: '',
        plan: '',
        evidence: '',
        owner: '',
      };
      detailRows.push({
        code: activity.code,
        name: activity.name,
        quarterIndex: idx,
        quarterLabel,
        detail,
      });
    });
  });

  return (
    <div>
      <div className="mb-4 rounded-[5px] border border-[#f0d79d] bg-[#fff8e8] px-3.5 py-2.5 text-[12px] text-[#785716]">
        Monitoring hanya mencatat status pelaksanaan, target, realisasi, keterangan,
        kendala, rencana perbaikan, bukti dukung, dan penanggung jawab.{' '}
        <b>Tidak ada nilai/bobot capaian pada halaman monitoring.</b>
      </div>

      {/* Card 1: Matriks Monitoring Triwulanan PPG */}
      <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="my-1 mb-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#243247]">
              Tahun
              <select
                value={year}
                onChange={(e) => onYearChange(e.target.value)}
                className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] text-[#243247]"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#243247]">
              Triwulan
              <select
                value={quarterFilter}
                onChange={(e) => setQuarterFilter(e.target.value)}
                className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] text-[#243247]"
              >
                <option value="ALL">Semua TW</option>
                <option value="TW I">TW I</option>
                <option value="TW II">TW II</option>
                <option value="TW III">TW III</option>
                <option value="TW IV">TW IV</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExportCSV}
              className="rounded border border-[#08a9c4] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
            >
              Unduh CSV
            </button>
            <button
              type="button"
              onClick={() => openModal()}
              className="rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f] transition-colors cursor-pointer whitespace-nowrap"
            >
              + Tambah / Ubah Rincian
            </button>
          </div>
        </div>

        <h3 className="m-0 mb-3 text-[16px] font-bold text-[#243247]">
          Matriks Monitoring Triwulanan PPG
        </h3>

        <div className="overflow-auto rounded-[6px] border border-[#dce3eb] bg-white">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr>
                <th className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-2.5 py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                  No.
                </th>
                <th className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-2.5 py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                  Program/Kegiatan/Subkegiatan
                </th>
                <th className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-2.5 py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                  TW I
                </th>
                <th className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-2.5 py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                  TW II
                </th>
                <th className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-2.5 py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                  TW III
                </th>
                <th className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-2.5 py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]">
                  TW IV
                </th>
              </tr>
            </thead>
            <tbody>
              {PROGRAMS.map((program) => (
                <React.Fragment key={program.code}>
                  <tr>
                    <td className="border-b border-[#e3e8ee] bg-[#f7faff] px-2.5 py-[11px] text-[13px] font-bold text-[#26486c] tabular-nums">
                      {program.code}
                    </td>
                    <td
                      colSpan={5}
                      className="border-b border-[#e3e8ee] bg-[#f7faff] px-2.5 py-[11px] text-[13px] font-bold text-[#26486c]"
                    >
                      {program.name}
                    </td>
                  </tr>
                  {program.items.map((itemCode) => {
                    const activity = ACTIVITIES.find((x) => x.code === itemCode);
                    if (!activity) return null;
                    return (
                      <tr key={activity.code} className="hover:bg-[#fafcff]">
                        <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                          {activity.code}
                        </td>
                        <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                          {activity.name}
                        </td>
                        {[0, 1, 2, 3].map((qIndex) => {
                          const cellStatus =
                            details[`${activity.code}-${qIndex}`]?.status ??
                            activity.quarters[qIndex];
                          return (
                            <td
                              key={qIndex}
                              className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]"
                            >
                              <StatusBadge status={cellStatus} />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-[#8492a3]">
          Status contoh mengikuti file Excel: Selesai, Dalam Proses, atau — (tidak
          dijadwalkan). Status dapat diubah melalui rincian monitoring.
        </div>
      </div>

      {/* Card 2: Rincian Monitoring per Kegiatan dan Triwulan */}
      <div className="mt-[15px] rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
          <h3 className="m-0 text-[16px] font-bold text-[#243247]">
            Rincian Monitoring per Kegiatan dan Triwulan
          </h3>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kegiatan..."
            className="min-w-[210px] rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
          />
        </div>

        <div className="overflow-auto rounded-[6px] border border-[#dce3eb] bg-white">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead>
              <tr>
                {[
                  'Kode',
                  'Kegiatan/Subkegiatan',
                  'TW',
                  'Status',
                  'Target',
                  'Realisasi',
                  'Satuan',
                  'Progres/Keterangan',
                  'Kendala',
                  'Rencana Perbaikan',
                  'Bukti Dukung',
                  'Penanggung Jawab',
                  'Aksi',
                ].map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap border-b border-[#e3e8ee] bg-[#f4f7fa] px-2.5 py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.35px] text-[#45566c]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detailRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-7 text-center text-[13px] text-[#8290a0]"
                  >
                    Tidak ada data untuk filter ini.
                  </td>
                </tr>
              ) : (
                detailRows.map((row) => (
                  <tr
                    key={`${row.code}-${row.quarterIndex}`}
                    className="last:[&>td]:border-b-0 hover:bg-[#fafcff]"
                  >
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {row.code}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.quarterLabel}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      <StatusBadge status={row.detail.status} />
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {row.detail.target || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {row.detail.actual || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.detail.unit || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.detail.note || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.detail.issue || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.detail.plan || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.detail.evidence ? (
                        <button
                          type="button"
                          onClick={() => setEvidencePreview(row.detail.evidence)}
                          className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[#087eaa] underline hover:text-[#065e7f]"
                        >
                          Lihat bukti
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {row.detail.owner || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      <button
                        type="button"
                        onClick={() => openModal(row.code, row.quarterIndex)}
                        className="rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Monitoring Modal */}
      <Modal
        open={modalOpen}
        title={isNewEntry ? 'Tambah Rincian Monitoring' : 'Ubah Rincian Monitoring'}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      >
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              Kegiatan/Subkegiatan
            </label>
            <select
              value={formCode}
              onChange={(e) => handleSelectChangeInModal(e.target.value, formQuarter)}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            >
              {ACTIVITIES.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} – {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">Triwulan</label>
            <select
              value={formQuarter}
              onChange={(e) => handleSelectChangeInModal(formCode, Number(e.target.value))}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            >
              {QUARTER_LABELS.map((label, idx) => (
                <option key={label} value={idx}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">Status</label>
            <select
              value={formState.status}
              onChange={(e) =>
                setFormState({ ...formState, status: e.target.value as QuarterStatus })
              }
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">Target</label>
            <input
              type="text"
              value={formState.target}
              onChange={(e) => setFormState({ ...formState, target: e.target.value })}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">Realisasi</label>
            <input
              type="text"
              value={formState.actual}
              onChange={(e) => setFormState({ ...formState, actual: e.target.value })}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">Satuan</label>
            <input
              type="text"
              value={formState.unit}
              onChange={(e) => setFormState({ ...formState, unit: e.target.value })}
              placeholder="Dokumen / Peserta / Kegiatan"
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>

          <div className="col-span-full flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              Progres/Keterangan
            </label>
            <textarea
              value={formState.note}
              onChange={(e) => setFormState({ ...formState, note: e.target.value })}
              className="min-h-[75px] resize-y rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">Kendala</label>
            <textarea
              value={formState.issue}
              onChange={(e) => setFormState({ ...formState, issue: e.target.value })}
              className="min-h-[75px] resize-y rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              Rencana Perbaikan
            </label>
            <textarea
              value={formState.plan}
              onChange={(e) => setFormState({ ...formState, plan: e.target.value })}
              className="min-h-[75px] resize-y rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              Tautan Bukti Dukung
            </label>
            <input
              type="text"
              value={formState.evidence}
              onChange={(e) => setFormState({ ...formState, evidence: e.target.value })}
              placeholder="URL dokumen"
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#536477]">
              Penanggung Jawab
            </label>
            <input
              type="text"
              value={formState.owner}
              onChange={(e) => setFormState({ ...formState, owner: e.target.value })}
              className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
            />
          </div>
        </div>
      </Modal>

      {/* Evidence Preview Modal */}
      <Modal
        open={evidencePreview !== null}
        title="Tautan Bukti Dukung"
        onClose={() => setEvidencePreview(null)}
        showFooter={false}
      >
        <div className="space-y-3 text-[13px] text-[#243247]">
          <div className="rounded border border-[#dce3eb] bg-[#f4f7fa] p-3 font-mono-num text-[12px] break-all">
            {evidencePreview}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEvidencePreview(null)}
              className="rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
