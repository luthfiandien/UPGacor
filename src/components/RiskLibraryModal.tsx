import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { getNextRiskCode, RISK_CONTROL_LIBRARY } from '../data/ppgData';
import { RiskLibraryItem } from '../types/upg';
import { MasterRiskEditorModal } from './MasterRiskEditorModal';
import { SecurityPinModal } from './SecurityPinModal';
import { ToastVariant } from './ToastContainer';

interface RiskLibraryModalProps {
  open: boolean;
  riskCatalog?: RiskLibraryItem[];
  selectedRiskCodes?: string[];
  maxQuota?: number;
  canManageCatalog?: boolean;
  onClose: () => void;
  onUseRisk?: (risk: RiskLibraryItem) => void;
  onSaveCatalogRisk?: (item: RiskLibraryItem, isNew: boolean) => void;
  onNotify?: (variant: ToastVariant, message: string) => void;
  // Backwards-compatible prop for legacy roles
  initialRiskCode?: string;
  onSelectRisk?: (kodeRisiko: string) => void;
}

const ITEMS_PER_PAGE = 30;

export function RiskLibraryModal({
  open,
  riskCatalog = RISK_CONTROL_LIBRARY,
  selectedRiskCodes = [],
  maxQuota = 10,
  canManageCatalog = false,
  onClose,
  onUseRisk,
  onSaveCatalogRisk,
  onNotify,
  onSelectRisk,
}: RiskLibraryModalProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPustakaUnlocked, setIsPustakaUnlocked] = useState(false);

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAfterUnlock, setPendingAfterUnlock] = useState<
    { type: 'edit'; item: RiskLibraryItem } | null
  >(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<RiskLibraryItem | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setCurrentPage(1);
    setIsPustakaUnlocked(false);
    setPinModalOpen(false);
    setPendingAfterUnlock(null);
    setEditorOpen(false);
    setEditingItem(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pinModalOpen && !editorOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, pinModalOpen, editorOpen, onClose]);

  const filteredRisks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return riskCatalog;
    return riskCatalog.filter(
      (item) =>
        item.kodeRisiko.toLowerCase().includes(q) ||
        item.prosesSubproses.toLowerCase().includes(q) ||
        item.pernyataanRisiko.toLowerCase().includes(q) ||
        item.klasifikasiRisiko.toLowerCase().includes(q) ||
        item.penyebabRisiko.some((p) => p.toLowerCase().includes(q)) ||
        item.dampakRisiko.some((d) => d.toLowerCase().includes(q)) ||
        item.mandatoryControls.some((c) => c.toLowerCase().includes(q)) ||
        item.nonMandatoryControls.some((c) => c.toLowerCase().includes(q))
    );
  }, [search, riskCatalog]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRisks.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);

  const pagedRisks = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredRisks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRisks, safePage]);

  if (!open) return null;

  const isQuotaReached = selectedRiskCodes.length >= maxQuota;
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredRisks.length);
  const nextGeneratedCode = getNextRiskCode(riskCatalog);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleOpenUnlockModal = () => {
    setPendingAfterUnlock(null);
    setPinModalOpen(true);
  };

  const handleRowEditClick = (item: RiskLibraryItem) => {
    if (!isPustakaUnlocked) {
      setPendingAfterUnlock({ type: 'edit', item });
      setPinModalOpen(true);
      return;
    }
    setEditorMode('edit');
    setEditingItem(item);
    setEditorOpen(true);
  };

  const handleOpenAddMasterModal = () => {
    setEditorMode('add');
    setEditingItem(null);
    setEditorOpen(true);
  };

  const handlePinVerified = () => {
    setIsPustakaUnlocked(true);
    setPinModalOpen(false);
    onNotify?.(
      'success',
      'Akses kelola Master Pustaka Risiko berhasil dibuka untuk sesi ini.'
    );
    if (pendingAfterUnlock?.type === 'edit') {
      setEditorMode('edit');
      setEditingItem(pendingAfterUnlock.item);
      setEditorOpen(true);
      setPendingAfterUnlock(null);
    }
  };

  const handleManualLock = () => {
    setIsPustakaUnlocked(false);
    onNotify?.('info', 'Akses kelola Master Pustaka Risiko dikunci kembali.');
  };

  const handleSaveMasterItem = (item: RiskLibraryItem, isNew: boolean) => {
    onSaveCatalogRisk?.(item, isNew);
    setEditorOpen(false);
    setEditingItem(null);
    if (isNew) {
      setSearch('');
      const newTotalPages = Math.ceil(
        (riskCatalog.length + 1) / ITEMS_PER_PAGE
      );
      setCurrentPage(newTotalPages);
      onNotify?.(
        'success',
        `Risiko baru ${item.kodeRisiko} berhasil ditambahkan ke Master Pustaka Risiko.`
      );
    } else {
      onNotify?.(
        'success',
        `Master risiko ${item.kodeRisiko} berhasil diperbarui dan disinkronkan.`
      );
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1f36]/60 p-3 sm:p-5 backdrop-blur-[1px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pustaka-risiko-title"
        onClick={(e) => {
          if (e.target === e.currentTarget && !pinModalOpen && !editorOpen) {
            onClose();
          }
        }}
      >
        <div className="flex h-[92vh] w-full max-w-[1440px] flex-col overflow-hidden rounded-xl border border-[#cfd9e4] bg-white shadow-2xl">
          {/* Top Modal Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0c4476] bg-[#0F4C81] px-5 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="pustaka-risiko-title"
                  className="m-0 text-[16px] font-bold tracking-tight"
                >
                  Pustaka Risiko — Katalog Risiko Gratifikasi &amp; Kontrol
                </h2>
                <p className="m-0 text-[12px] text-[#d5e8fb]">
                  Bank data {riskCatalog.length} risiko gratifikasi Mahkamah
                  Agung &amp; Badan Pengawasan · Pilih maksimal {maxQuota}{' '}
                  risiko ke daftar penilaian
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
                Terpilih: {selectedRiskCodes.length} / {maxQuota}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Pustaka Risiko"
                className="cursor-pointer rounded-md p-1.5 text-white/85 hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search, Master Management & Pagination Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3eb] bg-[#f8fafc] px-5 py-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari kode (PPG.RK.01), proses bisnis, peristiwa, penyebab, dampak, kontrol..."
                  className="w-full rounded-md border border-[#cfd9e4] bg-white py-2 pl-9 pr-3 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15"
                />
              </div>

              {/* Master Catalog Management Controls (Protected by PIN) */}
              {canManageCatalog && (
                <div className="flex flex-wrap items-center gap-2">
                  {!isPustakaUnlocked ? (
                    <button
                      type="button"
                      onClick={handleOpenUnlockModal}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3.5 py-2 text-[12.5px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors whitespace-nowrap"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Buka Akses Kelola (Kode Pengaman)</span>
                    </button>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700 whitespace-nowrap">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Akses Kelola Aktif</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleManualLock}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#52647a] hover:bg-slate-100 whitespace-nowrap"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Kunci</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenAddMasterModal}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#0F4C81] px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-[#0b3b66] transition-colors whitespace-nowrap"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Tambah Risiko Pustaka</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-[#52647a] mr-1">
                {filteredRisks.length === 0
                  ? '0 hasil'
                  : `Menampilkan ${startIndex + 1}–${endIndex} dari ${filteredRisks.length} risiko`}
              </span>

              <div className="inline-flex items-center overflow-hidden rounded-md border border-[#cfd9e4] bg-white">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex cursor-pointer items-center gap-1 border-r border-[#dce3eb] px-2.5 py-1.5 text-[12px] font-semibold text-[#45566c] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, idx) => {
                  const pageNum = idx + 1;
                  const pStart = idx * ITEMS_PER_PAGE + 1;
                  const pEnd = Math.min(
                    (idx + 1) * ITEMS_PER_PAGE,
                    filteredRisks.length
                  );
                  const label =
                    !search.trim() && totalPages === 2
                      ? pageNum === 1
                        ? 'Halaman 1 (1–30)'
                        : 'Halaman 2 (31–60)'
                      : `Halaman ${pageNum} (${pStart}–${pEnd})`;
                  const isActive = safePage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`cursor-pointer border-r border-[#dce3eb] last:border-r-0 px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#0F4C81] text-white'
                          : 'bg-white text-[#45566c] hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="inline-flex cursor-pointer items-center gap-1 border-l border-[#dce3eb] px-2.5 py-1.5 text-[12px] font-semibold text-[#45566c] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 7-Column Table Body */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#f1f5f9] shadow-[0_1px_0_#dce3eb]">
                <tr>
                  <th className="w-[104px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                    Kode
                  </th>
                  <th className="w-[165px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                    Proses Bisnis
                  </th>
                  <th className="w-[225px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                    Peristiwa Risiko
                  </th>
                  <th className="w-[205px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                    Penyebab
                  </th>
                  <th className="w-[195px] px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                    Dampak
                  </th>
                  <th className="px-3.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                    Kontrol yang Dilakukan
                  </th>
                  <th className="w-[185px] px-3.5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#45566c]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf2] bg-white text-[12.5px] text-[#243247]">
                {pagedRisks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-[13px] text-[#718096]"
                    >
                      Tidak ada data risiko yang sesuai dengan kata kunci{' '}
                      <b>&ldquo;{search}&rdquo;</b>.
                    </td>
                  </tr>
                ) : (
                  pagedRisks.map((item) => {
                    const isSelected = selectedRiskCodes.includes(
                      item.kodeRisiko
                    );
                    return (
                      <tr
                        key={item.kodeRisiko}
                        className={`align-top transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/40'
                            : 'hover:bg-[#f8fbff]'
                        }`}
                      >
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="font-mono-num inline-block rounded-md border border-[#c7daf0] bg-[#eef5fc] px-2 py-0.5 text-[11.5px] font-bold text-[#0F4C81]">
                            {item.kodeRisiko}
                          </span>
                        </td>

                        <td className="px-3.5 py-3 font-semibold text-[#1d3554] leading-snug">
                          {item.prosesSubproses}
                        </td>

                        <td className="px-3.5 py-3 leading-relaxed text-[#243247]">
                          {item.pernyataanRisiko}
                        </td>

                        <td className="px-3.5 py-3">
                          <ul className="m-0 list-disc space-y-1 pl-4 text-[12px] leading-snug text-[#45566c]">
                            {item.penyebabRisiko.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </td>

                        <td className="px-3.5 py-3">
                          <ul className="m-0 list-disc space-y-1 pl-4 text-[12px] leading-snug text-[#45566c]">
                            {item.dampakRisiko.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </td>

                        <td className="px-3.5 py-3">
                          <div className="space-y-2">
                            <div>
                              <div className="mb-1 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                                Mandatory (Wajib)
                              </div>
                              <ul className="m-0 list-disc space-y-0.5 pl-4 text-[12px] font-medium leading-snug text-[#1d3554]">
                                {item.mandatoryControls.map((ctrl, i) => (
                                  <li key={i}>{ctrl}</li>
                                ))}
                              </ul>
                            </div>

                            {item.nonMandatoryControls.length > 0 && (
                              <div>
                                <div className="mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                  Non-Mandatory (Opsional)
                                </div>
                                <ul className="m-0 list-disc space-y-0.5 pl-4 text-[12px] leading-snug text-[#64748b]">
                                  {item.nonMandatoryControls.map((ctrl, i) => (
                                    <li key={i}>{ctrl}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-3.5 py-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {onUseRisk ? (
                              isSelected ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[12px] font-bold text-emerald-700">
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Terpilih</span>
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
                                  onClick={() => onUseRisk(item)}
                                  className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#0F4C81] px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0b3b66] transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Gunakan</span>
                                </button>
                              )
                            ) : onSelectRisk ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectRisk(item.kodeRisiko);
                                  onClose();
                                }}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#0F4C81] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0b3b66]"
                              >
                                <span>Pilih</span>
                              </button>
                            ) : null}

                            {canManageCatalog && (
                              <button
                                type="button"
                                onClick={() => handleRowEditClick(item)}
                                title={
                                  isPustakaUnlocked
                                    ? `Edit master ${item.kodeRisiko}`
                                    : 'Klik untuk verifikasi Kode Pengaman & Edit'
                                }
                                className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                                  isPustakaUnlocked
                                    ? 'border-[#0F4C81] bg-white text-[#0F4C81] hover:bg-[#eef5fc]'
                                    : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                }`}
                              >
                                {isPustakaUnlocked ? (
                                  <Edit3 className="h-3.5 w-3.5" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5" />
                                )}
                                <span>Edit</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dce3eb] bg-[#f8fafc] px-5 py-3">
            <div className="text-[12px] text-[#52647a]">
              Total risiko dipilih untuk <b>Badan Pengawasan</b>:{' '}
              <b className="text-[#0F4C81]">
                {selectedRiskCodes.length} / {maxQuota}
              </b>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#243247] hover:bg-slate-100"
            >
              Tutup Pustaka Risiko
            </button>
          </div>
        </div>
      </div>

      {/* Security PIN Modal */}
      <SecurityPinModal
        open={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPendingAfterUnlock(null);
        }}
        onVerified={handlePinVerified}
      />

      {/* Master Risk Add/Edit Modal */}
      <MasterRiskEditorModal
        open={editorOpen}
        mode={editorMode}
        initialItem={editingItem}
        generatedCode={nextGeneratedCode}
        onClose={() => {
          setEditorOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveMasterItem}
      />
    </>
  );
}
