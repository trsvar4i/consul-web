# Consul — web (Next.js)

Pocket accountant and advisor for small traders in Uzbekistan. Built for the Umummilliy AI Hackathon
(Tashkent, Chamber of Commerce problems 20 and 21; problem 19 comes next).

One responsive app with two layouts: phone (< 860 px: title bar, bottom tabs, agent dock) and desktop
(top navigation, two-column screens). Uzbek Latin UI; Russian is planned (switch is marked "soon").

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit tests for money, parsing, tax, credit, answers
npm run typecheck && npm run lint
npm run build        # production build (output: standalone)
node .next/standalone/server.js   # or use the Dockerfile
```

`API_URL` (default `http://localhost:8080`) is proxied as `/api/v1/*` for the Go backend (arcanum-api).

## Routes

| Path | What |
|---|---|
| `/` | Landing with GSAP + Lenis motion (`components/site/landingAnim.ts`) |
| `/kirish` | Login and registration (`?register=1`), demo SMS code `481903` |
| `/kalkulyatorlar` | Public calculators: credit, tax, break-even, price (`#kredit`, `#soliq`…) |
| `/palata` | Anonymous report for the Chamber of Commerce (problem 21) |
| `/maxfiylik` | Privacy, terms, anonymous statistics, deletion |
| `/app` … | Cabinet: Bugun, Consul (chat), Pul, Operatsiyalar, Vositalar and tools, Men (profile) |

## Languages (uz, ru)

- Every page lives under `/uz/...` or `/ru/...`. `proxy.ts` redirects bare paths using the `lang` cookie, then `Accept-Language`, then `uz`.
- Gettext style: the Uzbek string is the key. `useT()` in client components, `translator(lang)` on the server, `t("Text {x}", { x })` for parameters.
- Russian strings: `lib/i18n/ru.ts`. A missing key falls back to Uzbek.
- Module-level strings are marked with `tk("...")` (returns the source) and translated where rendered with `t()`.
- `Link` and `useRouter` from `@/components/I18n` add the language prefix. `LangSwitch` saves the cookie.
- The template answer engine (`lib/answer.ts`) takes `t` in its context; the parser (`lib/parse.ts`) understands Russian input too.
- `lib/__tests__/i18n.test.ts` fails if a source string has no Russian translation or a `{placeholder}` is lost.
- Adding a string: wrap it in `t()`, add the Russian line to `ru.ts`, run `npm test`.
- Backend: send `lang` with every AI and voice request so answers come back in the user's language.

## Structure

```
app/                 routes (App Router). Cabinet layout wraps StoreProvider + Shell
components/
  cabinet/Store.tsx  demo state: ledger, chat, sheets, toasts, undo; handle(text) = agent entry point
  cabinet/Shell.tsx  header, mobile title, agent dock (text, voice, receipt), bottom tabs, sheet
  cabinet/screens/   one file per screen
  cabinet/Sheets.tsx bank report, plan wizard, voice and receipt demos, choosers
  Calculators.tsx    shared by /kalkulyatorlar and /app/hisob
lib/                 pure TypeScript, no React: covered by vitest
  ledger.ts  money state and operations      parse.ts   phrase -> intent
  answer.ts  chat answers (templates + math)  finance.ts credit, break-even, price
  tax.ts     2026 tax rules and limits        plan.ts    business plan payback
  demo.ts    demo persona data                format.ts  number formatting
styles/              CSS from the approved prototypes, scoped by a root class (.cab .land .tl .pal .auth .legal)
```

## What is demo and what the backend replaces

All numbers come from `lib/` math, never from a model. These parts are demo stand-ins:

| Demo now | Replace with |
|---|---|
| `lib/demo.ts` data, `StoreProvider` state | `GET /api/v1/me/ledger` and friends; keep `view()` math client-side or move it server-side |
| `lib/parse.ts` + `lib/answer.ts` | LLM endpoint that returns the same `Intent` / `Reply` shapes; keep the deterministic math |
| Voice sheet (typed sample phrase) | VoiceLab STT/TTS through a backend proxy (API key stays on the server) |
| Receipt sheet (sample receipt) | OCR endpoint returning line items |
| SMS code `481903` | Real OTP |
| `/palata` sample aggregates | Backend aggregates with k-anonymity ≥ 5 |

Tax rules in `lib/tax.ts` are for 2026 (turnover tax 1% up to 1 bln, 4% above; general regime above
12 000 BHM ≈ 4.944 bln from 1 June 2026; simplified VAT 6% option). Re-check every year.
