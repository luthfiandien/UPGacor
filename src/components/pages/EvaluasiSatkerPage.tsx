import { useState } from 'react';
import { SATKER_LIST } from '../../data/upgData';
import {
  EvaluationStatus,
  SatkerEvaluation,
  SatkerStateMap,
} from '../../types/upg';
import { Modal } from '../Modal';
import { StatusBadge } from '../StatusBadge';

interface EvaluasiSatkerPageProps {
  satState: SatkerStateMap;
  onSaveSatker: (satkerName: string, evaluation: SatkerEvaluation) => void;
}

export function EvaluasiSatkerPage({
  satState,
  onSaveSatker,
}: EvaluasiSatkerPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [statusInput, setStatusInput] = useState<EvaluationStatus>('Belum Dievaluasi');
  const [scoreInput, setScoreInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSatkers = SATKER_LIST.map((satker, idx) => ({
    index: idx,
    name: satker.name,
    data: satState[satker.name] ?? {
      status: 'Belum Dievaluasi' as EvaluationStatus,
      score: '' as const,
      note: '',
    },
  })).filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedSearch) &&
      (statusFilter === 'ALL' || item.data.status === statusFilter)
  );

  const openModal = (name: string) => {
    const current = satState[name] ?? {
      status: 'Belum Dievaluasi' as EvaluationStatus,
      score: '' as const,
      note: '',
    };
    setEditingName(name);
    setStatusInput(current.status);
    setScoreInput(current.score === '' ? '' : String(current.score));
    setNoteInput(current.note);
    setErrorMsg('');
  };

  const handleSave = () => {
    if (!editingName) return;
    if (scoreInput.trim() !== '') {
      const num = Number(scoreInput);
      if (Number.isNaN(num) || num < 0 || num > 100) {
        setErrorMsg('Capaian harus 0–100%.');
        return;
      }
      onSaveSatker(editingName, {
        status: statusInput,
        score: num,
        note: noteInput,
      });
    } else {
      onSaveSatker(editingName, {
        status: statusInput,
        score: '',
        note: noteInput,
      });
    }
    setEditingName(null);
  };

  return (
    <div>
      <div className="mb-4 rounded-[5px] border border-[#f0d79d] bg-[#fff8e8] px-3.5 py-2.5 text-[12px] text-[#785716]">
        UPG Tingkat II mengevaluasi UPG Tingkat III di wilayah hukumnya. Data satker di
        bawah merupakan nama simulasi untuk menunjukkan alur, bukan daftar satker
        aktual.
      </div>

      <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="my-1 mb-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#243247]">
              Cari satker
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama satuan kerja..."
                className="min-w-[210px] rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] text-[#243247]"
              />
            </label>

            <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#243247]">
              Status
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] text-[#243247]"
              >
                <option value="ALL">Semua status</option>
                <option value="Belum Dievaluasi">Belum Dievaluasi</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </label>
          </div>

          <span className="rounded bg-[#edf2f7] px-2 py-1 text-[10px] font-semibold text-[#52647a]">
            Evaluasi Tingkat III · Bobot dasar 60,5%
          </span>
        </div>

        <div className="overflow-auto rounded-[6px] border border-[#dce3eb] bg-white">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr>
                {[
                  'No.',
                  'Nama Satuan Kerja',
                  'Penilaian Mandiri',
                  'Bukti Dukung',
                  'Status Evaluasi',
                  'Capaian Evaluasi',
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
              {filteredSatkers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-7 text-center text-[13px] text-[#8290a0]"
                  >
                    Satker tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSatkers.map((item) => (
                  <tr
                    key={item.name}
                    className="last:[&>td]:border-b-0 hover:bg-[#fafcff]"
                  >
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {item.index + 1}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {item.name}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {item.data.status === 'Belum Dievaluasi'
                        ? 'Belum disampaikan'
                        : 'Tersedia'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      —
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      <StatusBadge status={item.data.status} />
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {item.data.score === '' ? '—' : `${item.data.score}%`}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      <button
                        type="button"
                        onClick={() => openModal(item.name)}
                        className="rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Evaluasi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluate Satker Modal */}
      <Modal
        open={editingName !== null}
        title="Evaluasi UPG Tingkat III"
        onClose={() => setEditingName(null)}
        onSave={handleSave}
      >
        {editingName && (
          <div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <div className="col-span-full flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#536477]">
                  Satuan Kerja
                </label>
                <input
                  type="text"
                  value={editingName}
                  disabled
                  className="rounded border border-[#cfd9e4] bg-[#f4f7fa] px-2.5 py-2 text-[13px] text-[#536477]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#536477]">
                  Status Evaluasi
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as EvaluationStatus)}
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
                >
                  <option value="Belum Dievaluasi">Belum Dievaluasi</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#536477]">
                  Capaian Evaluasi (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scoreInput}
                  onChange={(e) => {
                    setScoreInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247] tabular-nums"
                />
              </div>

              <div className="col-span-full flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#536477]">
                  Catatan / Rekomendasi Evaluator
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="min-h-[75px] resize-y rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
                />
              </div>

              {errorMsg && (
                <div className="col-span-full rounded border border-[#f5c2c7] bg-[#fde8e8] px-3 py-2 text-[12px] font-medium text-[#b4232c]">
                  {errorMsg}
                </div>
              )}
            </div>

            <p className="mt-3 mb-0 text-[11px] text-[#718096]">
              Bobot dasar Tingkat III pada draft SK adalah 60,5%. Isian capaian di sini
              merupakan simulasi ringkas; evaluasi rinci perlu dilakukan pada matriks
              kegiatan dan bukti dukung.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
