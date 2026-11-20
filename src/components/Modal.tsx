import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  showFooter?: boolean;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function Modal({
  open,
  title,
  onClose,
  onSave,
  saveLabel = 'Simpan',
  showFooter = true,
  maxWidthClass = 'max-w-[680px]',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243c]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] overflow-auto rounded-lg bg-white shadow-[0_20px_60px_rgba(16,36,60,0.33)]`}
      >
        <div className="flex items-center justify-between border-b border-[#dce3eb] px-5 py-4">
          <h2 id="modal-title" className="text-[15px] font-bold text-[#243247] m-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="rounded p-1 text-[#64748b] hover:bg-[#f3f6fa] hover:text-[#243247] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">{children}</div>

        {showFooter && (
          <div className="flex justify-end gap-2 border-t border-[#dce3eb] px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[#ccd7e3] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#536477] hover:bg-[#f8fafc] transition-colors cursor-pointer whitespace-nowrap"
            >
              Batal
            </button>
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="rounded border border-[#1762b5] bg-[#1762b5] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0d559f] transition-colors cursor-pointer whitespace-nowrap"
              >
                {saveLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
