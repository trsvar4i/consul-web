# Consul — финансовый директор малого бизнеса

Фронтенд Consul для хакатона Umummilliy AI (Ташкент, 2026). Next.js 16 (App Router), TypeScript, Tailwind CSS v4, next-intl (uz / ru), recharts.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000 → /uz
npx vitest run     # тесты расчётов (кредит, налоги, наценка)
npm run build
```

## Как устроено

- `app/[locale]/(site)` — публичные страницы: главная, калькуляторы, гайды.
- `app/[locale]/app` — приложение после входа: панель, операции, импорт, кредит, сверка, паспорт бизнеса, бизнес-план, настройки.
- `app/[locale]/chat` — полный чат ассистента; виджет — на всех страницах.
- `lib/api.ts` — **все** данные. Сейчас моки (`mocks/*.json`), бэкенд подключается через `NEXT_PUBLIC_USE_MOCKS=false` и `NEXT_PUBLIC_API_URL`.
- `lib/calc/` — формулы (деньги считает код, не ИИ); ставки в `lib/calc/rules.ts`.
- `messages/uz.json`, `messages/ru.json` — все тексты интерфейса.

## Эндпоинты бэкенда, которые ждёт фронтенд

| Функция | Запрос |
|---|---|
| `extractTransactions(file)` | `POST /api/transactions/extract` (multipart `file`: PDF, Word, Excel, фото) |
| `estimateGrowth(input)` | `POST /api/assistant/estimate-growth` → `{ amount, rationale, confidence }` |
| `sendAssistantMessage(...)` | `POST /api/assistant/message` |
| остальные | см. таблицу в `lib/api.ts` |

Демо: «Войти в демо-режиме» на `/login`. Для проверки состояний экранов добавьте `?mock=error` или `?mock=empty`.
