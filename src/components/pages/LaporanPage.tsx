import { useState } from 'react';
import { ACTIVITIES, SATKER_LIST } from '../../data/upgData';
import { SatkerStateMap, SelfScoresMap } from '../../types/upg';
import { Modal } from '../Modal';

interface LaporanPageProps {
  year: string;
  selfScores: SelfScoresMap;
  satState: SatkerStateMap;
}

type ReportType = 'semester1' | 'tahunan' | null;

export function LaporanPage({ year, selfScores, satState }: LaporanPageProps) {
  const [previewType, setPreviewType] = useState<ReportType>(null);

  const filledSelfCount = Object.keys(selfScores).length;
  const evaluatedSatkerCount = Object.values(satState).filter(
    (s) => s.status === 'Selesai'
  ).length;

  return (
    <div>
      <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
        <h3 className="m-0 mb-2 text-[16px] font-bold text-[#243247]">
          Laporan Pelaksanaan PPG
        </h3>
        <p className="m-0 mb-3 text-[14px] text-[#718096]">
          Area rancangan untuk menghimpun laporan Semester I dan Laporan Tahunan,
          termasuk rekapitulasi satker Tingkat III di wilayah hukum Tingkat II.
        </p>

        <div className="flex items-center justify-between gap-4 border-b border-[#edf0f4] py-3">
          <div>
            <b className="text-[13px] text-[#243247]">Laporan Semester I</b>
            <div className="text-[11px] text-[#718096]">
              Periode pelaporan Januari–Juni
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreviewType('semester1')}
            className="shrink-0 rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
          >
            Lihat format
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3">
          <div>
            <b className="text-[13px] text-[#243247]">Laporan Tahunan</b>
            <div className="text-[11px] text-[#718096]">
              Rekap pelaksanaan satu siklus penilaian
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreviewType('tahunan')}
            className="shrink-0 rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
          >
            Lihat format
          </button>
        </div>
      </div>

      <Modal
        open={previewType !== null}
        title={
          previewType === 'semester1'
            ? `Format Laporan Semester I (${year})`
            : `Format Laporan Tahunan (${year})`
        }
        onClose={() => setPreviewType(null)}
        showFooter={false}
      >
        <div className="space-y-4 text-[13px] text-[#243247]">
          <div className="rounded-[5px] border border-[#f0d79d] bg-[#fff8e8] px-3.5 py-2.5 text-[12px] text-[#785716]">
            Fitur unduh laporan merupakan rancangan prototipe. Ringkasan di bawah
            menunjukkan struktur isi dan data tersimpan saat ini.
          </div>

          <div className="rounded-[6px] border border-[#dce3eb] bg-[#f7faff] p-4 space-y-2.5">
            <div className="text-[14px] font-bold text-[#15569c]">
              {previewType === 'semester1'
                ? 'SISTEMATIKA LAPORAN SEMESTER I (JANUARI–JUNI)'
                : 'SISTEMATIKA LAPORAN TAHUNAN SIKLUS PENILAIAN PPG'}
            </div>
            <ol className="m-0 list-decimal pl-5 space-y-1.5 text-[13px] text-[#243247]">
              <li>
                <b>Pendahuluan:</b> Gambaran umum pelaksanaan UPG Tingkat II Tahun{' '}
                {year}.
              </li>
              <li>
                <b>Realisasi Program Kerja ({previewType === 'semester1' ? 'TW I–II' : 'TW I–IV'}):</b>{' '}
                Cakupan {ACTIVITIES.length} kegiatan utama pengendalian gratifikasi.
              </li>
              <li>
                <b>Penilaian Mandiri UPG Tingkat II:</b> {filledSelfCount}/
                {ACTIVITIES.length} kegiatan telah dinilai (bobot dasar 63%).
              </li>
              <li>
                <b>Rekapitulasi Evaluasi Satker Tingkat III:</b>{' '}
                {evaluatedSatkerCount}/{SATKER_LIST.length} satker selesai dievaluasi
                (bobot dasar 60,5%).
              </li>
              <li>
                <b>Kendala dan Rencana Tindak Lanjut:</b> Rekomendasi perbaikan untuk
                siklus berikutnya.
              </li>
            </ol>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewType(null)}
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
