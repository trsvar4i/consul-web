import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { Container } from "../ui/primitives";

export function PageHeader({ title, intro, crumbs = [] }: { title: string; intro?: string; crumbs?: { href: string; label: string }[] }) {
  return (
    <div className="border-b border-gray-200 bg-mist">
      <Container className="py-8 lg:py-12">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-700">
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-1">
                  <Link href={c.href} className="hover:text-graphite-900 hover:underline">{c.label}</Link>
                  <ChevronRight size={14} aria-hidden />
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight lg:text-[44px]">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-base text-gray-700 lg:text-lg">{intro}</p>}
      </Container>
    </div>
  );
}
