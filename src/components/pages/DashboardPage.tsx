import { Check, Clock, Columns3, Percent } from 'lucide-react';
import { ACTIVITIES, SATKER_LIST } from '../../data/upgData';
import { PageId, SatkerStateMap } from '../../types/upg';
import { StatusBadge } from '../StatusBadge';

interface DashboardPageProps {
  satState: SatkerStateMap;
  onNavigate: (page: PageId) => void;
}

export function DashboardPage({ satState, onNavigate }: DashboardPageProps) {
  const evaluatedCount = Object.values(satState).filter(
    (x) => x.status === 'Selesai'
  ).length;

  return (
    <div>
      <div className="mb-4 rounded-[5px] border border-[#f0d79d] bg-[#fff8e8] px-3.5 py-2.5 text-[12px] text-[#785716]">
        <b>Catatan prototipe:</b> Data kegiatan di bawah mengikuti cakupan ilustrasi
        pada file Excel. Lengkapi seluruh kegiatan dan kriteria resmi sebelum
        digunakan sebagai sistem penilaian.
      </div>

      {/* 4 Metric Cards */}
      <div className="mb-[18px] grid grid-cols-4 gap-3.5 max-lg:grid-cols-2">
        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[12px] font-semibold text-[#718096]">
                Bobot dasar Tingkat II
              </div>
              <strong className="mt-1.5 block text-[27px] font-bold leading-tight text-[#1d3554] tabular-nums">
                63%
              </strong>
              <div className="mt-1 text-[11px] text-[#718096]">Penilaian mandiri</div>
            </div>
            <div className="grid h-[39px] w-[39px] shrink-0 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
              <Percent className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>

        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[12px] font-semibold text-[#718096]">
                Satker Tingkat III
              </div>
              <strong className="mt-1.5 block text-[27px] font-bold leading-tight text-[#1d3554] tabular-nums">
                {SATKER_LIST.length}
              </strong>
              <div className="mt-1 text-[11px] text-[#718096]">Contoh jumlah satker</div>
            </div>
            <div className="grid h-[39px] w-[39px] shrink-0 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
              <Columns3 className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>

        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[12px] font-semibold text-[#718096]">
                Monitoring triwulan
              </div>
              <strong className="mt-1.5 block text-[27px] font-bold leading-tight text-[#1d3554] tabular-nums">
                {ACTIVITIES.length}
              </strong>
              <div className="mt-1 text-[11px] text-[#718096]">
                Rincian kegiatan pada ilustrasi
              </div>
            </div>
            <div className="grid h-[39px] w-[39px] shrink-0 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
              <Clock className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>

        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[12px] font-semibold text-[#718096]">
                Evaluasi satker
              </div>
              <strong className="mt-1.5 block text-[27px] font-bold leading-tight text-[#1d3554] tabular-nums">
                {evaluatedCount}/{SATKER_LIST.length}
              </strong>
              <div className="mt-1 text-[11px] text-[#718096]">
                {evaluatedCount === 0
                  ? 'Belum ada evaluasi tersimpan'
                  : `${evaluatedCount} satker selesai dievaluasi`}
              </div>
            </div>
            <div className="grid h-[39px] w-[39px] shrink-0 place-items-center rounded-lg bg-[#eaf2fc] text-[#1762b5]">
              <Check className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Split Section */}
      <div className="grid grid-cols-[1.25fr_0.75fr] gap-[15px] max-lg:grid-cols-1">
        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <h3 className="m-0 mb-3 text-[16px] font-bold text-[#243247]">Akses cepat</h3>

          <div className="flex items-center justify-between gap-4 border-b border-[#edf0f4] py-3">
            <div>
              <b className="text-[13px] text-[#243247]">Penilaian Mandiri UPG Tingkat II</b>
              <div className="text-[11px] text-[#718096]">
                Isi matriks evaluasi tahunan untuk satker sendiri.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('mandiri')}
              className="shrink-0 rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
            >
              Buka
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-[#edf0f4] py-3">
            <div>
              <b className="text-[13px] text-[#243247]">Monitoring PPG</b>
              <div className="text-[11px] text-[#718096]">
                Catat target, realisasi, kendala, dan tindak lanjut per triwulan.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('monitoring')}
              className="shrink-0 rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
            >
              Buka
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3">
            <div>
              <b className="text-[13px] text-[#243247]">Evaluasi Tingkat III</b>
              <div className="text-[11px] text-[#718096]">
                Pilih satker di wilayah hukum dan verifikasi hasilnya.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('satker')}
              className="shrink-0 rounded border border-[#08a9c4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd] transition-colors cursor-pointer whitespace-nowrap"
            >
              Buka
            </button>
          </div>
        </div>

        <div className="rounded-[7px] border border-[#dce3eb] bg-white p-[17px] shadow-[0_2px_5px_rgba(38,56,75,0.03)]">
          <h3 className="m-0 mb-3 text-[16px] font-bold text-[#243247]">
            Siklus pelaksanaan
          </h3>

          <div className="flex items-center justify-between gap-4 border-b border-[#edf0f4] py-3">
            <div>
              <b className="text-[13px] text-[#243247]">Monitoring TW I–IV</b>
              <div className="text-[11px] text-[#718096]">
                Akhir bulan ke-3, 6, 9, dan 12
              </div>
            </div>
            <StatusBadge status="Berkala" />
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-[#edf0f4] py-3">
            <div>
              <b className="text-[13px] text-[#243247]">Penilaian mandiri</b>
              <div className="text-[11px] text-[#718096]">
                Bulan ke-1 sampai satu pekan sebelum evaluasi
              </div>
            </div>
            <StatusBadge status="Setiap UPG" />
          </div>

          <div className="flex items-center justify-between gap-4 pt-3">
            <div>
              <b className="text-[13px] text-[#243247]">Evaluasi Tingkat III</b>
              <div className="text-[11px] text-[#718096]">
                Satu bulan sebelum evaluasi UPG Pusat
              </div>
            </div>
            <StatusBadge status="Tingkat II" />
          </div>
        </div>
      </div>
    </div>
  );
}
