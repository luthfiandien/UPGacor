import {
  IMPACT_OPTIONS,
  PROBABILITY_OPTIONS,
} from '../data/ppgData';
import { RiskLevelCategory, RiskMatrixConfig } from '../types/upg';
import { Modal } from './Modal';

interface RiskMatrixConfigModalProps {
  open: boolean;
  config?: RiskMatrixConfig;
  canEdit?: boolean;
  onClose: () => void;
  onSave?: (next: RiskMatrixConfig) => void;
}

export function getCategoryBadgeClass(
  category: RiskLevelCategory | string | null
): string {
  switch (category) {
    case 'Rendah':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Sedang':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Tinggi':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Ekstrem':
    case 'Sangat Tinggi':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function getFixedCategoryForScore(score: number): RiskLevelCategory {
  if (score <= 4) return 'Rendah';
  if (score <= 9) return 'Sedang';
  if (score <= 12) return 'Tinggi';
  return 'Ekstrem';
}

export function RiskMatrixConfigModal({
  open,
  onClose,
}: RiskMatrixConfigModalProps) {
  return (
    <Modal
      open={open}
      title="Referensi Matriks Risiko 5×4"
      onClose={onClose}
      showFooter={false}
    >
      <div className="space-y-4 text-[13px] text-[#243247]">
        {/* Top Scale Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-[#dce3eb] bg-[#f8fafc] px-3 py-2.5 text-[12px]">
          <span className="font-bold text-[#45566c] mr-1">
            Skala Skor (P × D):
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            1–4: Rendah
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            5–9: Sedang
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">
            10–12: Tinggi
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
            15–20: Ekstrem
          </span>
        </div>

        {/* Fixed 5x4 Reference Matrix Table */}
        <div className="overflow-x-auto rounded-md border border-[#dce3eb]">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#f4f7fa]">
                <th className="border-b border-r border-[#dce3eb] px-3 py-2.5 text-left font-bold text-[#45566c]">
                  Probabilitas \ Dampak
                </th>
                {IMPACT_OPTIONS.map((imp) => (
                  <th
                    key={imp.value}
                    className="border-b border-[#dce3eb] px-3 py-2.5 text-center font-bold text-[#45566c]"
                  >
                    <div>Dampak {imp.value}</div>
                    <div className="text-[10.5px] font-normal text-[#64748b]">
                      {imp.label.split('–')[1]?.trim()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...PROBABILITY_OPTIONS].reverse().map((prob) => (
                <tr key={prob.value}>
                  <td className="border-b border-r border-[#e3e8ee] bg-[#f8fafc] px-3 py-2.5 font-semibold text-[#243247] whitespace-nowrap">
                    <div>Prob. {prob.value}</div>
                    <div className="text-[10.5px] font-normal text-[#64748b]">
                      {prob.label.split('–')[1]?.trim()}
                    </div>
                  </td>
                  {IMPACT_OPTIONS.map((imp) => {
                    const score = prob.value * imp.value;
                    const category = getFixedCategoryForScore(score);
                    return (
                      <td
                        key={`${prob.value}-${imp.value}`}
                        className="border-b border-[#e3e8ee] px-2.5 py-2 text-center"
                      >
                        <span
                          className={`inline-flex w-full items-center justify-center rounded-md border px-2 py-1.5 text-[11.5px] font-bold tabular-nums ${getCategoryBadgeClass(
                            category
                          )}`}
                        >
                          {score} ({category})
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clean Footer with only Tutup */}
        <div className="flex justify-end border-t border-[#e9eef4] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-[#ccd7e3] bg-white px-4 py-2 text-[13px] font-semibold text-[#243247] hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
