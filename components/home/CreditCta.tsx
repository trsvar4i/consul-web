"use client";
import { Calculator } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * «Посчитать кредит»: по рамке постоянно бежит луч (border beam),
 * при наведении кнопка заливается и иконка калькулятора «щёлкает».
 */
export function CreditCta({ label }: { label: string }) {
  return (
    <span className="beam flex w-full rounded-full [--beam-s:3.2s] sm:inline-flex sm:w-auto">
      <Link
        href="/tools/credit"
        className="group relative inline-flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-white/[0.04] px-7 text-base font-medium text-white"
      >
        <span aria-hidden className="absolute inset-0 origin-left scale-x-0 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-x-100" />
        <Calculator size={18} className="relative transition-[transform,color] duration-500 group-hover:rotate-[-12deg] group-hover:text-brand-500" aria-hidden />
        <span className="relative transition-colors duration-500 group-hover:text-graphite-900">{label}</span>
      </Link>
    </span>
  );
}
