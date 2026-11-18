"use client";
import { useEffect, useState } from "react";
import { Calculators, type CalcTab } from "@/components/Calculators";

const TABS: CalcTab[] = ["kredit", "soliq", "zarar", "narx"];

export function ToolsClient() {
  const [tab, setTab] = useState<CalcTab>("kredit");
  useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1) as CalcTab; if (TABS.includes(h)) setTab(h); };
    read(); window.addEventListener("hashchange", read); return () => window.removeEventListener("hashchange", read);
  }, []);
  return <Calculators variant="pub" tab={tab} onTab={t => { setTab(t); history.replaceState(null, "", "#" + t); }} />;
}
