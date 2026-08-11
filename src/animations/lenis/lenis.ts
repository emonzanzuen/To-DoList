import Lenis from 'lenis';
import { prefersReducedMotion } from '../gsap/motion';

let lenis: Lenis | null = null;
let frameId = 0;

export function initLenis(): () => void {
  if (prefersReducedMotion()) return () => undefined;

  lenis = new Lenis({ duration: 1.1 });

  const raf = (time: number) => {
    lenis?.raf(time);
    frameId = requestAnimationFrame(raf);
  };
  frameId = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(frameId);
    lenis?.destroy();
    lenis = null;
  };
}

export function stopLenis(): void {
  lenis?.stop();
}

export function startLenis(): void {
  lenis?.start();
}