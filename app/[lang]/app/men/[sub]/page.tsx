import { notFound } from "next/navigation";
import Men from "@/components/cabinet/screens/Men";

const SUBS = ["biznes", "xotira", "sozlama", "maxfiy", "yordam"];
export function generateStaticParams() {
  return SUBS.map(sub => ({ sub }));
}

export default async function Page({ params }: { params: Promise<{ sub: string }> }) {
  const { sub } = await params;
  if (!SUBS.includes(sub)) notFound();
  return <Men sub={sub} />;
}
