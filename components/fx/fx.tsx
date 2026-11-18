"use client";
// Микро-анимации Consul. Техники вдохновлены библиотекой aliakseych/components
// (decrypted text, magnetic button, bento spotlight, scroll reveal) — переписаны под наш стек.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../ui/primitives";

const LETTERS = "ABCDEHKMNPRSTUXZ";
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** Текст «расшифровывается»: символы перебираются и встают на место слева направо. */
export function Scramble({ text, className, chars = "0123456789", duration = 900 }: { text: string; className?: string; chars?: string; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!inView || reduced()) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const fixed = Math.floor(p * text.length);
      setOut(
        text
          .split("")
          .map((ch, i) => (i < fixed || !/[\p{L}\p{N}]/u.test(ch) ? ch : /\d/.test(ch) ? chars[Math.floor(Math.random() * chars.length)] : LETTERS[Math.floor(Math.random() * LETTERS.length)]))
          .join(""),
      );
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, text, chars, duration]);
  return (
    <span ref={ref} className={cn("num", className)} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/** Появление блока при прокрутке: подъём + снятие размытия. delay — для «лесенки». */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.12);
  return (
    <Tag
      ref={ref as never}
      className={cn("transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(.2,.7,.1,1)] motion-reduce:transition-none", inView ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-[6px]", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Обёртка, которая мягко тянется за курсором (только мышь). */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className={cn("inline-flex transition-[translate] duration-200 ease-out", className)}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse" || reduced()) return;
        const b = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - b.left - b.width / 2) * strength}px ${(e.clientY - b.top - b.height / 2) * strength}px`;
      }}
      onPointerLeave={() => ref.current && (ref.current.style.translate = "")}
    >
      {children}
    </span>
  );
}

/** Карточка с подсветкой, которая следует за курсором. */
export function Spotlight({ children, className, color = "rgba(163,33,58,0.10)" }: { children: ReactNode; className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        el.style.setProperty("--sx", `${e.clientX - b.left}px`);
        el.style.setProperty("--sy", `${e.clientY - b.top}px`);
      }}
      className={cn("group/spot relative isolate overflow-hidden", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), ${color}, transparent 60%)` }}
      />
      {children}
    </div>
  );
}

/** Бегущая строка (CSS), пауза при наведении. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={cn("group/mq relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]", className)}>
      <div className="flex w-max gap-10 [animation:mq_38s_linear_infinite] group-hover/mq:[animation-play-state:paused] motion-reduce:[animation:none]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {t}
            <span aria-hidden className="size-1.5 rounded-[2px] bg-brand-400" />
          </span>
        ))}
      </div>
      <style>{`@keyframes mq{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/** Номер раздела в редакционном стиле: «01 — Боль» + тонкая линейка. */
export function SectionMark({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em]", dark ? "text-ondark" : "text-gray-700")}>
      <span className={cn("num", dark ? "text-brand-400" : "text-brand-500")}>{n}</span>
      <span>{label}</span>
      <span className={cn("h-px flex-1", dark ? "bg-white/15" : "bg-gray-200")} />
    </div>
  );
}
