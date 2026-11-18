import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  kodeRisiko: string;
  pernyataanRisiko: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  open,
  kodeRisiko,
  pernyataanRisiko,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243c]/55 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-[#dce3eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e9eef4] px-5 py-3.5">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h2
              id="delete-confirm-title"
              className="m-0 text-[15px] font-bold text-[#1d3554]"
            >
              Hapus Risiko dari Daftar Penilaian
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup konfirmasi"
            className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4 text-[13px] text-[#243247]">
          <p className="m-0 text-[#52647a]">
            Apakah Anda yakin ingin menghapus risiko berikut dari daftar penilaian{' '}
            <b className="text-[#1d3554]">Badan Pengawasan</b>?
          </p>

          <div className="rounded-md border border-red-200 bg-red-50/70 p-3">
            <span className="font-mono-num inline-block rounded bg-red-700 px-2 py-0.5 text-[11px] font-bold text-white">
              {kodeRisiko}
            </span>
            <p className="mt-1.5 mb-0 text-[13px] font-semibold leading-snug text-[#1d3554]">
              {pernyataanRisiko}
            </p>
          </div>

          <p className="m-0 text-[12px] text-slate-500">
            Seluruh isian kontrol dan skor risiko yang sudah tersimpan pada baris
            ini akan ikut terhapus. Anda dapat menambahkannya kembali kapan saja
            dari Pustaka Risiko.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e9eef4] bg-[#f8fafc] px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-4 py-2 text-[13px] font-semibold text-[#536477] hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Ya, Hapus Risiko</span>
          </button>
        </div>
      </div>
    </div>
  );
}
