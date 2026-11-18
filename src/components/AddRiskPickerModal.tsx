import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Search, ShieldAlert, X } from 'lucide-react';
import { RISK_CONTROL_LIBRARY } from '../data/ppgData';
import { RiskLibraryItem } from '../types/upg';

interface AddRiskPickerModalProps {
  open: boolean;
  riskCatalog?: RiskLibraryItem[];
  selectedRiskCodes: string[];
  maxQuota?: number;
  onClose: () => void;
  onAddRisk: (risk: RiskLibraryItem) => void;
}

export function AddRiskPickerModal({
  open,
  riskCatalog = RISK_CONTROL_LIBRARY,
  selectedRiskCodes,
  maxQuota = 10,
  onClose,
  onAddRisk,
}: AddRiskPickerModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return riskCatalog;
    return riskCatalog.filter(
      (item) =>
        item.kodeRisiko.toLowerCase().includes(q) ||
        item.prosesSubproses.toLowerCase().includes(q) ||
        item.pernyataanRisiko.toLowerCase().includes(q) ||
        item.mandatoryControls.some((c) => c.toLowerCase().includes(q))
    );
  }, [query, riskCatalog]);

  if (!open) return null;

  const isQuotaReached = selectedRiskCodes.length >= maxQuota;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243c]/55 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-risk-picker-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#cfd9e4] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9eef4] bg-[#0F4C81] px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-[#cce5ff]" />
            <div>
              <h2
                id="add-risk-picker-title"
                className="m-0 text-[15px] font-bold"
              >
                Tambah Risiko ke Daftar Penilaian
              </h2>
              <p className="m-0 text-[11.5px] text-[#dcecff]">
                Cari berdasarkan kode risiko, proses bisnis, atau kata kunci
                dari Pustaka Risiko
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[11.5px] font-semibold">
              Kuota: {selectedRiskCodes.length} / {maxQuota}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal tambah risiko"
              className="cursor-pointer rounded p-1 text-white/85 hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="border-b border-[#e9eef4] bg-[#f8fafc] px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik kode (mis. PPG.RK.05), proses bisnis (mis. Audit Kinerja), atau kata kunci..."
              className="w-full rounded-md border border-[#cfd9e4] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15"
            />
          </div>
        </div>

        {/* Picker List */}
        <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-[#edf1f6] px-5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#718096]">
              Tidak ditemukan risiko yang cocok dengan kata kunci{' '}
              <b>&ldquo;{query}&rdquo;</b>.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedRiskCodes.includes(item.kodeRisiko);
              return (
                <div
                  key={item.kodeRisiko}
                  className="flex items-start justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-num rounded border border-[#c7daf0] bg-[#eef5fc] px-2 py-0.5 text-[11px] font-bold text-[#0F4C81]">
                        {item.kodeRisiko}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-[#45566c]">
                        {item.prosesSubproses}
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        {item.mandatoryControls.length} Kontrol Wajib
                        {item.nonMandatoryControls.length > 0
                          ? ` · ${item.nonMandatoryControls.length} Pelengkap`
                          : ''}
                      </span>
                    </div>
                    <p className="m-0 text-[13px] font-medium leading-snug text-[#1d3554]">
                      {item.pernyataanRisiko}
                    </p>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[12px] font-bold text-emerald-700">
                        <Check className="h-3.5 w-3.5" />
                        <span>Sudah Dipilih</span>
                      </span>
                    ) : isQuotaReached ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[12px] font-semibold text-slate-400"
                      >
                        Kuota 10/10
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onAddRisk(item);
                          if (selectedRiskCodes.length + 1 >= maxQuota) {
                            onClose();
                          }
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#0F4C81] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0b3b66] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#e9eef4] bg-[#f8fafc] px-5 py-3">
          <span className="text-[12px] text-[#64748b]">
            Menampilkan {filtered.length} dari {riskCatalog.length} risiko
            katalog
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#536477] hover:bg-slate-100"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
