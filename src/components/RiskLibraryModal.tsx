import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Search, X } from 'lucide-react';
import { RISK_CONTROL_LIBRARY } from '../data/ppgData';
import { RiskLibraryItem } from '../types/upg';

interface RiskLibraryModalProps {
  open: boolean;
  initialRiskCode?: string;
  onClose: () => void;
  onSelectRisk?: (kodeRisiko: string) => void;
}

export function RiskLibraryModal({
  open,
  initialRiskCode,
  onClose,
  onSelectRisk,
}: RiskLibraryModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>(
    initialRiskCode || RISK_CONTROL_LIBRARY[0].kodeRisiko
  );

  useEffect(() => {
    if (open && initialRiskCode) {
      setSelectedCode(initialRiskCode);
    }
  }, [open, initialRiskCode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const q = search.trim().toLowerCase();
  const filteredRisks = RISK_CONTROL_LIBRARY.filter(
    (item) =>
      !q ||
      item.kodeRisiko.toLowerCase().includes(q) ||
      item.pernyataanRisiko.toLowerCase().includes(q) ||
      item.klasifikasiRisiko.toLowerCase().includes(q) ||
      item.prosesSubproses.toLowerCase().includes(q) ||
      item.mandatoryControls.some((c) => c.toLowerCase().includes(q))
  );

  const activeItem: RiskLibraryItem =
    filteredRisks.find((r) => r.kodeRisiko === selectedCode) ??
    filteredRisks[0] ??
    RISK_CONTROL_LIBRARY[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243c]/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_20px_60px_rgba(16,36,60,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dce3eb] bg-[#07579f] px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-[#cce5ff]" />
            <div>
              <h2 id="library-modal-title" className="m-0 text-[15px] font-bold">
                Risk and Control Library (Referensi Risiko &amp; Mandatory Control)
              </h2>
              <p className="m-0 text-[11px] text-[#dcecff]">
                Sumber data utama profil risiko gratifikasi dan pemetaan kontrol wajib
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Risk and Control Library"
            className="cursor-pointer rounded p-1 text-white/85 hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-[290px_1fr] max-md:grid-cols-1 overflow-auto">
          {/* Left Risk List */}
          <div className="border-r border-[#dce3eb] bg-[#f7faff] p-4 max-md:border-r-0 max-md:border-b">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-[#718096]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode atau pernyataan..."
                className="w-full rounded border border-[#cfd9e4] bg-white py-1.5 pl-8 pr-2.5 text-[13px] text-[#243247]"
              />
            </div>

            <div className="space-y-2">
              {filteredRisks.length === 0 ? (
                <div className="rounded border border-[#dce3eb] bg-white p-3 text-[12px] text-[#718096]">
                  Tidak ada risiko yang cocok.
                </div>
              ) : (
                filteredRisks.map((item) => {
                  const isActive = item.kodeRisiko === activeItem.kodeRisiko;
                  return (
                    <button
                      key={item.kodeRisiko}
                      type="button"
                      onClick={() => setSelectedCode(item.kodeRisiko)}
                      className={`w-full cursor-pointer rounded-[6px] border p-3 text-left transition-colors ${
                        isActive
                          ? 'border-[#1762b5] bg-[#e9f2fc] shadow-sm'
                          : 'border-[#dce3eb] bg-white hover:bg-[#f1f6fc]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-num rounded bg-[#1762b5] px-2 py-0.5 text-[11px] font-bold text-white">
                          {item.kodeRisiko}
                        </span>
                        <span className="text-[11px] font-semibold text-[#52647a]">
                          {item.mandatoryControls.length} Kontrol Wajib
                        </span>
                      </div>
                      <p className="mt-1.5 mb-0 text-[12px] leading-snug text-[#243247] line-clamp-3">
                        {item.pernyataanRisiko}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Detailed Profile */}
          <div className="overflow-y-auto p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#e3e8ee] pb-3">
              <div>
                <span className="font-mono-num inline-block rounded bg-[#07579f] px-2.5 py-0.5 text-[12px] font-bold text-white">
                  {activeItem.kodeRisiko}
                </span>
                <h3 className="mt-2 mb-0 text-[15px] font-bold text-[#1d3554] leading-snug">
                  {activeItem.pernyataanRisiko}
                </h3>
              </div>

              {onSelectRisk && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectRisk(activeItem.kodeRisiko);
                    onClose();
                  }}
                  className="shrink-0 cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0d559f] whitespace-nowrap"
                >
                  Pilih Risiko Ini ke Formulir
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1 mb-4">
              <div className="rounded border border-[#dce3eb] bg-[#f8fafc] p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                  Klasifikasi Risiko
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#243247]">
                  {activeItem.klasifikasiRisiko}
                </div>
              </div>

              <div className="rounded border border-[#dce3eb] bg-[#f8fafc] p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                  Proses / Subproses
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#243247]">
                  {activeItem.prosesSubproses}
                </div>
              </div>

              <div className="col-span-full rounded border border-[#dce3eb] bg-[#f8fafc] p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                  Faktor Penyebab
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#243247]">
                  {activeItem.faktorPenyebab}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded border border-[#dce3eb] bg-white p-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                  Penyebab Risiko
                </div>
                <ul className="mt-1.5 mb-0 list-disc pl-5 space-y-1 text-[13px] text-[#243247]">
                  {activeItem.penyebabRisiko.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-[#dce3eb] bg-white p-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#52647a]">
                  Dampak Risiko
                </div>
                <ul className="mt-1.5 mb-0 list-disc pl-5 space-y-1 text-[13px] text-[#243247]">
                  {activeItem.dampakRisiko.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded border border-[#badbcc] bg-[#edf8f2] p-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#137a45]">
                  Mandatory Control (Otomatis Terpetakan ke Bagian C)
                </div>
                <ul className="mt-2 mb-0 space-y-1.5 pl-0 list-none">
                  {activeItem.mandatoryControls.map((ctrl, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-[13px] font-semibold text-[#135c35]"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#198754]" />
                      <span>{ctrl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#dce3eb] bg-[#f8fafc] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded border border-[#ccd7e3] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#243247] hover:bg-[#f1f5f9]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
