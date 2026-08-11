import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { prefersReducedMotion } from '../../animations/gsap/motion';
import { startLenis, stopLenis } from '../../animations/lenis/lenis';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const [visible, setVisible] = useState(open);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  // Animasi masuk / keluar
  useLayoutEffect(() => {
    if (!visible) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (open) {
      if (!prefersReducedMotion()) {
        gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' });
        gsap.fromTo(
          panel,
          { autoAlpha: 0, scale: 0.95, y: 12 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.25, ease: 'power2.out' },
        );
      }
    } else {
      if (prefersReducedMotion()) {
        setVisible(false);
        return;
      }
      gsap.to(overlay, { autoAlpha: 0, duration: 0.18, ease: 'power1.in' });
      gsap.to(panel, {
        autoAlpha: 0,
        scale: 0.95,
        y: 12,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setVisible(false),
      });
    }

    return () => {
      gsap.killTweensOf([overlay, panel]);
    };
  }, [open, visible]);

  // Keyboard: Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Scroll lock + Lenis
  useEffect(() => {
    if (!visible) return;
    stopLenis();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      startLenis();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-lenis-prevent
        className="w-full max-w-lg rounded-2xl border border-line bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}