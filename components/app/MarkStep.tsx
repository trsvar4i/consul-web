"use client";
import { useEffect } from "react";
import { markStep, type StepFlag } from "@/lib/api";

/** Отмечает шаг паспорта бизнеса как пройденный при открытии страницы. */
export function MarkStep({ step }: { step: StepFlag }) {
  useEffect(() => markStep(step), [step]);
  return null;
}
