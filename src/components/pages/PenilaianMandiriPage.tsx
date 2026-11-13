import { useState } from 'react';
import { ACTIVITIES, formatWeight } from '../../data/upgData';
import {
  Activity,
  ApplicabilityStatus,
  SelfScoreEntry,
  SelfScoresMap,
} from '../../types/upg';
import { Modal } from '../Modal';

interface PenilaianMandiriPageProps {
  year: string;
  onYearChange: (year: string) => void;
  selfScores: SelfScoresMap;
  onSaveScore: (code: string, entry: SelfScoreEntry) => void;
  onExportCSV: () => void;
}

export function PenilaianMandiriPage({
  year,
  onYearChange,
  selfScores,
  onSaveScore,
  onExportCSV,
}: PenilaianMandiriPageProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [scoreInput, setScoreInput] = useState<string>('');
  const [validInput, setValidInput] = useState<ApplicabilityStatus>('Belum diisi');
  const [evidenceInput, setEvidenceInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  const filledCount = Object.keys(selfScores).length;

  const openModal = (activity: Activity) => {
    const existing = selfScores[activity.code];
    setEditingActivity(activity);
    setScoreInput(
      existing?.score !== undefined && existing.score !== '' ? String(existing.score) : ''
    );
    setValidInput(existing?.valid ?? 'Belum diisi');
    setEvidenceInput(existing?.evidence ?? '');
    setNoteInput(existing?.note ?? '');
    setErrorMsg('');
  };

  const handleSave = () => {
    if (!editingActivity) return;
    if (scoreInput.trim() !== '') {
      const num = Number(scoreInput);
      if (Number.isNaN(num) || num < 0 || num > editingActivity.weight) {
        setErrorMsg(`Nilai harus antara 0 dan ${editingActivity.weight}.`);
        return;
      }
      onSaveScore(editingActivity.code, {
        score: num,
        valid: validInput,
        evidence: evidenceInput,
        note: noteInput,
      });
    } else {
      onSaveScore(editingActivity.code, {
        score: '',
        valid: validInput,
        evidence: evidenceInput,
        note: noteInput,
      });
    }
    setEditingActivity(null);
  };

  return (
    <div>
      <div className="mb-4 rounded-[5px] border border-[#f0d79d] bg-[#fff8e8] px-3.5 py-2.5 text-[12px] text-[#785716]">
        Penilaian mandiri untuk UPG Tingkat II pada satuan kerja sendiri. Bobot dasar
        sesuai draft SK: <b>63%</b>. Nilai akhir hanya dihitung dari kegiatan yang
        berlaku dan telah dinilai lengkap; contoh kegiatan Excel belum mencakup seluruh
        matriks.
      </div>

      <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <div className="my-1 mb-4 flex flex-wrap items-center justify-between gap-2.5">
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

            <span className="rounded bg-[#edf2f7] px-2 py-1 text-[10px] font-semibold text-[#52647a]">
              UPG Tingkat II · Bobot dasar 63%
            </span>
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="rounded border border-[#08a9c4] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
          >
            Unduh CSV
          </button>
        </div>

        {/* 3 Summary Metrics */}
        <div className="mb-[18px] grid grid-cols-3 gap-3.5 max-sm:grid-cols-1">
          <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
            <div className="text-[12px] font-semibold text-[#718096]">Bobot dasar</div>
            <strong className="mt-1.5 block text-[27px] font-bold leading-tight text-[#1d3554] tabular-nums">
              63%
            </strong>
          </div>

          <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
            <div className="text-[12px] font-semibold text-[#718096]">
              Kegiatan terinci di Excel
            </div>
            <strong className="mt-1.5 block text-[27px] font-bold leading-tight text-[#1d3554] tabular-nums">
              {ACTIVITIES.length}
            </strong>
          </div>

          <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
            <div className="text-[12px] font-semibold text-[#718096]">Nilai terisi</div>
            <strong className="mt-1.5 block text-[27px] font-bold leading-tight text-[#1d3554] tabular-nums">
              {filledCount}/{ACTIVITIES.length}
            </strong>
          </div>
        </div>

        <div className="overflow-auto rounded-[6px] border border-[#dce3eb] bg-white">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr>
                {[
                  'Kode',
                  'Program/Kegiatan/Subkegiatan',
                  'Bobot (%)',
                  'Nilai Perolehan',
                  'Capaian',
                  'Keberlakuan UPG',
                  'Bukti Dukung',
                  'Catatan/Verifikasi',
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
              {ACTIVITIES.map((activity) => {
                const entry = selfScores[activity.code];
                const score = entry?.score ?? '';
                const cap =
                  score === ''
                    ? '—'
                    : `${((Number(score) / activity.weight) * 100).toFixed(1)}%`;

                return (
                  <tr
                    key={activity.code}
                    className="last:[&>td]:border-b-0 hover:bg-[#fafcff]"
                  >
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {activity.code}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {activity.name}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {formatWeight(activity.weight)}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {score === '' ? '—' : score}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px] tabular-nums">
                      {cap}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {entry?.valid || 'Belum diisi'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {entry?.evidence ? (
                        <button
                          type="button"
                          onClick={() => setEvidencePreview(entry.evidence)}
                          className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[#087eaa] underline hover:text-[#065e7f]"
                        >
                          Lihat bukti
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      {entry?.note || '—'}
                    </td>
                    <td className="border-b border-[#e3e8ee] px-2.5 py-[11px] text-[13px]">
                      <button
                        type="button"
                        onClick={() => openModal(activity)}
                        className="rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Isi / Verifikasi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-[#8492a3]">
          Nilai perolehan maksimal sebesar bobot kegiatan. Untuk kegiatan yang
          dilaksanakan sebagian, nilai dihitung proporsional sesuai indikator
          keberhasilan. Kegiatan tanpa bukti dukung diberi nilai nol sesuai draft SK.
        </div>
      </div>

      {/* Edit Self Score Modal */}
      <Modal
        open={editingActivity !== null}
        title={
          editingActivity ? `Penilaian Mandiri – ${editingActivity.code}` : 'Penilaian'
        }
        onClose={() => setEditingActivity(null)}
        onSave={handleSave}
      >
        {editingActivity && (
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">Kegiatan</label>
              <input
                type="text"
                value={editingActivity.name}
                disabled
                className="rounded border border-[#cfd9e4] bg-[#f4f7fa] px-2.5 py-2 text-[13px] text-[#536477]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">Bobot (%)</label>
              <input
                type="text"
                value={editingActivity.weight}
                disabled
                className="rounded border border-[#cfd9e4] bg-[#f4f7fa] px-2.5 py-2 text-[13px] text-[#536477] tabular-nums"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                Nilai Perolehan (maks. {editingActivity.weight})
              </label>
              <input
                type="number"
                min={0}
                max={editingActivity.weight}
                step="0.01"
                value={scoreInput}
                onChange={(e) => {
                  setScoreInput(e.target.value);
                  setErrorMsg('');
                }}
                className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247] tabular-nums"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                Keberlakuan UPG
              </label>
              <select
                value={validInput}
                onChange={(e) =>
                  setValidInput(e.target.value as ApplicabilityStatus)
                }
                className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
              >
                <option value="Belum diisi">Belum diisi</option>
                <option value="Berlaku">Berlaku</option>
                <option value="Tidak Berlaku">Tidak Berlaku</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                Tautan Bukti Dukung
              </label>
              <input
                type="text"
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="URL dokumen"
                className="rounded border border-[#cfd9e4] bg-white px-2.5 py-2 text-[13px] text-[#243247]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#536477]">
                Catatan/Verifikasi
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
        )}
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
          <div className="flex justify-end">
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
