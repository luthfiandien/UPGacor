import { useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, X } from 'lucide-react';

export const PUSTAKA_SECURITY_PIN = 'BAWAS2026';

interface SecurityPinModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function SecurityPinModal({
  open,
  onClose,
  onVerified,
}: SecurityPinModalProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPin('');
      setShowPin(false);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pin.trim();
    if (!trimmed) {
      setError('Kode pengaman wajib diisi.');
      return;
    }
    if (trimmed !== PUSTAKA_SECURITY_PIN) {
      setError('Kode pengaman tidak sesuai. Silakan periksa kembali.');
      return;
    }
    setError('');
    onVerified();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d1f36]/60 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#cfd9e4] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e9eef4] bg-[#0F4C81] px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-[#cce5ff]" />
            <h2 id="pin-modal-title" className="m-0 text-[15px] font-bold">
              Verifikasi Kode Pengaman
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup verifikasi kode pengaman"
            className="cursor-pointer rounded p-1 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-[13px]">
          <p className="m-0 leading-relaxed text-[#52647a]">
            Pengelolaan data master <b className="text-[#1d3554]">Pustaka Risiko</b>{' '}
            memengaruhi referensi nasional UPG Kelas I, II, dan III. Masukkan
            Kode Pengaman PIC untuk membuka akses tambah dan edit.
          </p>

          <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <KeyRound className="h-3.5 w-3.5 text-amber-700" />
              <span>Kode Pengaman PIC Terkonfigurasi:</span>
            </span>
            <span className="font-mono-num rounded border border-amber-300 bg-white px-2 py-0.5 text-[11.5px] font-bold text-amber-900">
              {PUSTAKA_SECURITY_PIN}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pustaka-security-pin-input"
              className="text-[12px] font-bold text-[#45566c]"
            >
              Kode Pengaman PIC <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="pustaka-security-pin-input"
                type={showPin ? 'text' : 'password'}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masukkan kode pengaman..."
                className={`w-full rounded-md border py-2 pl-3 pr-10 text-[13px] text-[#243247] focus:outline-none ${
                  error
                    ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                    : 'border-[#cfd9e4] bg-white focus:border-[#0F4C81]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                aria-label={showPin ? 'Sembunyikan kode' : 'Tampilkan kode'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-slate-400 hover:text-slate-700"
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-[#e9eef4] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-4 py-2 text-[13px] font-semibold text-[#536477] hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-[#0F4C81] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0b3b66]"
            >
              Verifikasi &amp; Buka Akses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
