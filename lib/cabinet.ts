/** Cabinet routing metadata: titles, which top tab is active, and quick suggestions per screen. */
export const TITLES: Record<string, string> = {
  bugun: "Umumiy koʻrinish", consul: "Assistent", pul: "Balans", health: "Biznes diagnostikasi", ops: "Operatsiyalar", vositalar: "Vositalar", hisob: "Kalkulyatorlar",
  agar: "Agar…?", kredit: "Kredit", soliq: "Soliq", reja: "Biznes-reja", bozor: "Bozor narxlari", nasiya: "Nasiya", oq: "Oq biznes", learn: "Oʻrganish",
  men: "Profil", "men-biznes": "Biznes", "men-xotira": "Consul xotirasi", "men-sozlama": "Sozlamalar", "men-maxfiy": "Maxfiylik", "men-yordam": "Yordam",
};
export const TABS = [
  { key: "bugun", label: "Umumiy koʻrinish", href: "/app" }, { key: "consul", label: "Assistent", href: "/app/consul" },
  { key: "pul", label: "Balans", href: "/app/pul" }, { key: "ops", label: "Operatsiyalar", href: "/app/ops" },
  { key: "health", label: "Diagnostika", href: "/app/health" },
  { key: "vositalar", label: "Vositalar", href: "/app/vositalar" },
] as const;
export const SUG: Record<string, string[]> = {
  consul: ["biznes-reja tuz", "kredit olsam boʻladimi?"], bugun: ["1,2 mln sotdim", "ijara 3 mln, 5-sanada"], pul: ["qancha foyda qildim?", "naqd 4,3 mln"],
  ops: ["svet 420 ming", "bugun 2 mln sotdim"], vositalar: ["kredit olsam boʻladimi?"], agar: ["15 mln xarid qilsam?", "yordamchi olsam?"],
  kredit: ["20 mln olsam?", "PDF tayyorla"], soliq: ["soliq qachon?", "1 mlrd dan oshsa?"], reja: ["ijara 2,5 mln boʻlsa?"], bozor: ["qoqi qayerda arzon?"],
  nasiya: ["Karimga 500 ming nasiya", "Bekzod toʻladi"], oq: ["roʻyxatdan qanday oʻtaman?"], learn: ["stavka nima?"], hisob: ["20 mln olsam?"],
};
/** Voice demo phrase per screen (until VoiceLab STT is connected). */
export const VOICE: Record<string, string> = {
  bugun: "Bugun 1 200 000 ga sotdim", ops: "Svetga 420 ming toʻladim", pul: "Qancha foyda qildim?", consul: "Kredit olsam boʻladimi?",
  kredit: "20 million olsam boʻladimi?", hisob: "20 million olsam boʻladimi?", soliq: "Soliq qachon?", nasiya: "Karimga 300 ming nasiya",
  agar: "15 million xarid qilsam?", reja: "Ijara 2,5 million boʻlsa?", bozor: "Qoqi qayerda arzon?", learn: "Marja nima?", oq: "Roʻyxatdan qanday oʻtaman?",
};
export const routeKey = (path: string) => {
  const p = path.replace(/^\/(uz|ru)(?=\/|$)/, "").replace(/^\/app\/?/, "").replace(/\/$/, "");
  return p ? p.replace("/", "-") : "bugun";
};
export const isTool = (k: string) => !(k in { bugun: 1, consul: 1, pul: 1, vositalar: 1 }) && k !== "men";
export const backHref = (k: string) => (k === "ops" ? "/app" : k.startsWith("men-") ? "/app/men" : "/app/vositalar");
