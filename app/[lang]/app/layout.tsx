import { StoreProvider } from "@/components/cabinet/Store";
import { Shell } from "@/components/cabinet/Shell";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return <StoreProvider><Shell>{children}</Shell></StoreProvider>;
}
