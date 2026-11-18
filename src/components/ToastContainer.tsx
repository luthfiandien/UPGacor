import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastVariant = 'success' | 'warning' | 'info' | 'error';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { wrap: string; icon: typeof CheckCircle2; iconClass: string }
> = {
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
  },
  info: {
    wrap: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: Info,
    iconClass: 'text-sky-600',
  },
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-900',
    icon: XCircle,
    iconClass: 'text-red-600',
  },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[100] flex max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[13px] font-medium shadow-lg ${style.wrap}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} />
            <div className="flex-1 leading-snug">{toast.message}</div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="cursor-pointer rounded p-0.5 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
