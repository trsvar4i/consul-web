"use client";
import { useEffect, useRef } from "react";

/**
 * Клетчатая сетка для тёмных блоков: очень медленно плывёт по диагонали
 * и светится брусничным под курсором. Без курсора пятно света само медленно бродит.
 */
export function GlowGrid({ cell = 56, className = "" }: { cell?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0.7, ty = 0.35; // target (0..1)
    let x = tx, y = ty;
    let lastPointer = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      if (e.clientY < b.top || e.clientY > b.bottom) return;
      tx = (e.clientX - b.left) / b.width;
      ty = (e.clientY - b.top) / b.height;
      lastPointer = performance.now();
    };
    const tick = (now: number) => {
      // автономное блуждание, если курсора не было 3 секунды
      if (now - lastPointer > 3000) {
        tx = 0.5 + Math.sin(now / 9000) * 0.32;
        ty = 0.45 + Math.cos(now / 11000) * 0.28;
      }
      x += (tx - x) * 0.04;
      y += (ty - y) * 0.04;
      el.style.setProperty("--gx", `${(x * 100).toFixed(2)}%`);
      el.style.setProperty("--gy", `${(y * 100).toFixed(2)}%`);
      raf = requestAnimationFrame(tick);
    };
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const lines = (color: string) =>
    `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
  const mask = "radial-gradient(380px circle at var(--gx,70%) var(--gy,35%), #000 0%, rgba(0,0,0,.35) 45%, transparent 75%)";

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* базовая сетка */}
      <div className="gg-drift absolute -inset-[56px]" style={{ backgroundImage: lines("rgba(255,255,255,0.055)"), backgroundSize: `${cell}px ${cell}px` }} />
      {/* светящаяся сетка под пятном */}
      <div
        className="gg-drift absolute -inset-[56px]"
        style={{ backgroundImage: lines("rgba(245,154,170,0.55)"), backgroundSize: `${cell}px ${cell}px`, maskImage: mask, WebkitMaskImage: mask }}
      />
      {/* мягкое свечение */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(520px circle at var(--gx,70%) var(--gy,35%), rgba(163,33,58,0.22), transparent 70%)" }} />
      {/* затухание к краям */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#22262C_100%)]" />
      <style>{`@media (prefers-reduced-motion: no-preference){.gg-drift{animation:ggdrift 160s linear infinite}}@keyframes ggdrift{from{transform:translate3d(0,0,0)}to{transform:translate3d(${cell}px,${cell}px,0)}}`}</style>
    </div>
  );
}
