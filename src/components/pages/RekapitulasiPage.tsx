import { useState } from 'react';
import { getAchievementCategory, SATKER_LIST } from '../../data/upgData';
import { JudicialEnvironment, SatkerStateMap } from '../../types/upg';
import { StatusBadge } from '../StatusBadge';

interface RekapitulasiPageProps {
  year: string;
  onYearChange: (year: string) => void;
  satState: SatkerStateMap;
  onExportCSV: () => void;
}

export function RekapitulasiPage({
  year,
  onYearChange,
  satState,
  onExportCSV,
}: RekapitulasiPageProps) {
  const [lingkungan, setLingkungan] = useState<JudicialEnvironment>('Semua');

  const filteredSatkers = SATKER_LIST.filter(
    (s) => lingkungan === 'Semua' || s.lingkungan === lingkungan
  );

  return (
    <div>
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
              Lingkungan Peradilan
              <select
                value={lingkungan}
                onChange={(e) =>
                  setLingkungan(e.target.value as JudicialEnvironment)
                }
                className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] text-[#243247]"
              >
                <option value="Semua">Semua</option>
                <option value="Umum">Umum</option>
                <option value="Agama">Agama</option>
                <option value="Militer">Militer</option>
                <option value="TUN">TUN</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="rounded border border-[#08a9c4] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
          >
            Unduh Rekap CSV
          </button>
        </div>

        <h3 className="m-0 mb-3 text-[16px] font-bold text-[#243247]">
          Rekapitulasi Evaluasi UPG Tingkat III
        </h3>

        <div className="overflow-auto rounded-[6px] border border-[#dce3eb] bg-white">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr>
                {[
                  'No.',
                  'Satuan Kerja',
                  'Bobot Dasar',
                  'Nilai Perolehan',
                  'Capaian',
                  'Kategori',
                  'Status Evaluasi',
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
              {filteredSatkers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-7 text-center text-[13px] text-[#8290a0]"
                  >
                    Tidak ada satuan kerja pada lingkungan peradilan {lingkungan}.
                  </td>
                </tr>
              ) : (
                filteredSatkers.map((satker, idx) => {
                  const data = satState[satker.name] ?? {
                    status: 'Belum Dievaluasi',
                    score: '' as const,
                    note: '',
                  };
                  const scoreDisplay = data.score === '' ? '—' : `${data.score}%`;
                  return (
                    <tr
                      key={satker.name}
                      className="last:[&>td]:border-b-0 hover:bg-[#fafcff]"
                    >
                      <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                        {satker.name}
                      </td>
                      <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                        60,5%
                      </td>
                      <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                        {scoreDisplay}
                      </td>
                      <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                        {scoreDisplay}
                      </td>
                      <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                        {getAchievementCategory(data.score)}
                      </td>
                      <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                        <StatusBadge status={data.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-[#8492a3]">
          Kategori capaian mengikuti draft SK: ≥90% Sangat Baik; 80%–&lt;90% Baik;
          70%–&lt;80% Cukup; 60%–&lt;70% Kurang; &lt;60% Sangat Kurang.
        </div>
      </div>
    </div>
  );
}
