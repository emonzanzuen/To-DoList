import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react';
import type { ToastItem, ToastType } from '../../context/ToastContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-info',
};

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!reduced) {
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 16, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' },
      );
    }

    const timer = window.setTimeout(() => {
      if (reduced) {
        onRemove(toast.id);
        return;
      }
      gsap.to(element, {
        autoAlpha: 0,
        y: 8,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => onRemove(toast.id),
      });
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast.id, onRemove, reduced]);

  const Icon = ICONS[toast.type];

  return (
    <div
      ref={ref}
      role="status"
      className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-lg"
    >
      <Icon className={`h-5 w-5 shrink-0 ${COLORS[toast.type]}`} aria-hidden="true" />
      <p className="text-sm text-ink">{toast.message}</p>
    </div>
  );
}

export function ToastViewport({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 right-4 z-[70] flex w-full max-w-sm flex-col gap-2 md:bottom-6"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}