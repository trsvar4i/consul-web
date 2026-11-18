import { notFound } from "next/navigation";

// Любой неизвестный адрес внутри /uz или /ru → локализованная 404.
export default function CatchAll() {
  notFound();
}
