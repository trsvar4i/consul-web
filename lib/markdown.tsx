import { Fragment } from "react";

// Небольшой безопасный рендер Markdown для гайдов (## / ### / списки / таблицы / **жирный**).
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[*«»"?,.:—–]/g, "").trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "");

function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
  );
}

export function headings(md: string) {
  return md.split("\n").filter((l) => l.startsWith("## ")).map((l) => ({ text: l.slice(3), id: slugify(l.slice(3)) }));
}

export function MarkdownBody({ md }: { md: string }) {
  const blocks = md.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (b.startsWith("## ")) return <h2 key={i} id={slugify(b.slice(3))}>{b.slice(3)}</h2>;
        if (b.startsWith("### ")) return <h3 key={i}>{b.slice(4)}</h3>;
        if (lines.every((l) => l.trim().startsWith("|"))) {
          const rows = lines.filter((l) => !/^\|\s*-/.test(l)).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
          const [head, ...body] = rows;
          return (
            <div key={i} className="overflow-x-auto">
              <table>
                <thead><tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
                <tbody>{body.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k} className={k > 0 ? "text-right" : ""}>{inline(c)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }
        if (lines.every((l) => /^\s*-\s+/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*-\s+/, ""))}</li>)}</ul>;
        if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>)}</ol>;
        return <p key={i}>{inline(b)}</p>;
      })}
    </>
  );
}
