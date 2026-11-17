import { useEffect, useState } from 'react';
import {
  createDefaultRiskMatrix,
  IMPACT_OPTIONS,
  PROBABILITY_OPTIONS,
} from '../data/ppgData';
import { RiskLevelCategory, RiskMatrixConfig } from '../types/upg';
import { Modal } from './Modal';

interface RiskMatrixConfigModalProps {
  open: boolean;
  config: RiskMatrixConfig;
  canEdit: boolean;
  onClose: () => void;
  onSave: (next: RiskMatrixConfig) => void;
}

const CATEGORIES: RiskLevelCategory[] = [
  'Rendah',
  'Sedang',
  'Tinggi',
  'Sangat Tinggi',
];

export function getCategoryBadgeClass(category: RiskLevelCategory | null): string {
  switch (category) {
    case 'Rendah':
      return 'bg-[#e3f5eb] text-[#137a45] border-[#b7e2cb]';
    case 'Sedang':
      return 'bg-[#fff2d8] text-[#9a6500] border-[#f0d79d]';
    case 'Tinggi':
      return 'bg-[#ffe4d6] text-[#b4440e] border-[#f5bca0]';
    case 'Sangat Tinggi':
      return 'bg-[#fde8e8] text-[#b4232c] border-[#f5c2c7]';
    default:
      return 'bg-[#edf1f5] text-[#64748b] border-[#dce3eb]';
  }
}

export function RiskMatrixConfigModal({
  open,
  config,
  canEdit,
  onClose,
  onSave,
}: RiskMatrixConfigModalProps) {
  const [draft, setDraft] = useState<RiskMatrixConfig>(config);

  useEffect(() => {
    if (open) {
      setDraft({
        ...config,
        grid: { ...config.grid },
      });
    }
  }, [open, config]);

  const handleCellChange = (
    prob: number,
    impact: number,
    category: RiskLevelCategory
  ) => {
    setDraft((prev) => ({
      ...prev,
      grid: {
        ...prev.grid,
        [`${prob}-${impact}`]: category,
      },
    }));
  };

  const handleReset = () => {
    setDraft(createDefaultRiskMatrix());
  };

  const handleSave = () => {
    onSave({
      ...draft,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Konfigurasi Matriks Risiko (Administrator)"
      onClose={onClose}
      onSave={canEdit ? handleSave : undefined}
      saveLabel="Simpan Konfigurasi Matriks"
    >
      <div className="space-y-3 text-[13px] text-[#243247]">
        <div className="rounded border border-[#f0d79d] bg-[#fff8e8] px-3 py-2 text-[12px] text-[#785716]">
          Matriks kategori tingkat risiko di bawah dapat dikonfigurasi administrator
          sesuai ketentuan/SK yang berlaku (5 Level Probabilitas × 4 Level Dampak).
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-[#536477]">
            Dasar Ketentuan / Catatan Konfigurasi
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            className="rounded border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[13px] text-[#243247] disabled:bg-[#f4f7fa]"
          />
        </div>

        <div className="overflow-x-auto rounded border border-[#dce3eb]">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#f4f7fa]">
                <th className="border-b border-r border-[#dce3eb] px-2.5 py-2 text-left font-bold text-[#45566c]">
                  Probabilitas \ Dampak
                </th>
                {IMPACT_OPTIONS.map((imp) => (
                  <th
                    key={imp.value}
                    className="border-b border-[#dce3eb] px-2.5 py-2 text-center font-bold text-[#45566c]"
                  >
                    {imp.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...PROBABILITY_OPTIONS].reverse().map((prob) => (
                <tr key={prob.value}>
                  <td className="border-b border-r border-[#e3e8ee] bg-[#f8fafc] px-2.5 py-2 font-semibold text-[#243247] whitespace-nowrap">
                    {prob.label}
                  </td>
                  {IMPACT_OPTIONS.map((imp) => {
                    const key = `${prob.value}-${imp.value}`;
                    const currentCat = draft.grid[key] ?? 'Sedang';
                    return (
                      <td
                        key={key}
                        className="border-b border-[#e3e8ee] px-2 py-1.5 text-center"
                      >
                        <select
                          disabled={!canEdit}
                          value={currentCat}
                          onChange={(e) =>
                            handleCellChange(
                              prob.value,
                              imp.value,
                              e.target.value as RiskLevelCategory
                            )
                          }
                          className={`w-full rounded border px-1.5 py-1 text-[11px] font-bold ${getCategoryBadgeClass(
                            currentCat
                          )}`}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canEdit && (
          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer rounded border border-[#ccd7e3] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#536477] hover:bg-[#f8fafc]"
            >
              Reset ke Default
            </button>
            <span className="text-[11px] text-[#718096]">
              Perubahan langsung diterapkan pada hasil Inherent &amp; Residual.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
