# AIForge Technical Suite

AI-powered log intelligence and observability dashboard built as a data-visualization artifact in the Replit pnpm monorepo.

## Architecture

- **Monorepo**: pnpm workspace with shared `lib/api-spec` (OpenAPI), `lib/api-zod` (Zod schemas), and `lib/api-client-react` (Orval-generated React Query hooks).
- **API server** (`artifacts/api-server`): Express 5 + TypeScript serving 16 endpoints under `/api/*`. All data is deterministic synthetic (mulberry32 PRNG) — no database.
- **Frontend** (`artifacts/aiforge`): React + Vite + Tailwind v4 + shadcn/ui + Recharts + wouter routing. All pages call generated React Query hooks from `@workspace/api-client-react`.

## Routes / Pages

| Path | Page | Backend hooks |
|---|---|---|
| `/` | Operational overview | summary, log-volume, anomaly-trend, mttd-trend, severity-distribution, top-services, ingest-throughput |
| `/anomalies` | Detected anomalies stream | listAnomalies + filters |
| `/patterns` | K-Means/BERT pattern cards | listPatterns |
| `/alerts` | Intelligent alerts + tabbed drawer (Runbook / Root cause / Logs) | listAlerts, getAlert, getAlertRunbook |
| `/predictions` | Prophet failure forecasts | listPredictions |
| `/services` | Service health grid | listServices |
| `/logs` | Interactive log explorer | listLogs (level, service, search, limit) |

## Dashboard Features

- Auto-refresh (15s interval) toggle, manual refresh, Print/PDF export.
- Dark mode toggle (defaults to dark, persisted in localStorage).
- CSV export on every chart and list (react-csv).
- Skeleton loading states while React Query fetches.
- Print stylesheet hides chrome and forces light theme for PDF export.
- All Recharts components have `isAnimationActive={false}` to avoid animation-related render glitches with frequent refreshes.

## Synthetic Data

`artifacts/api-server/src/lib/aiforgeData.ts` implements a deterministic generator:
- 12 services with realistic names (auth-service, checkout-api, payments-gateway, etc.).
- Diurnal log volume patterns over the last 24h.
- Anomalies tagged with algorithm (Isolation Forest, K-Means cluster shift, BERT semantic delta, Prophet residual).
- Alert detail includes root cause hop chain and related logs.
- Incident-response runbook engine: each alert has a `GET /api/alerts/{id}/runbook` endpoint returning a category-aware (latency / errors / capacity / auth) sequence of steps (kind: check / command / decision / fix / verify / communicate), each with description, suggested shell command, expected outcome, and ETA — plus an auto-generated markdown postmortem draft.
- Frontend runbook drawer: checkbox-tracked progress bar, copy-to-clipboard for commands, expandable postmortem markdown with copy button, "Ready to file" badge once all steps are complete.
- Predictions include forecast points with confidence bands (actual + forecast + upper/lower).

## Codegen

After editing `lib/api-spec/openapi.yaml`, run:
```
pnpm --filter @workspace/api-spec run codegen
```
to regenerate Zod schemas (`lib/api-zod`) and React Query hooks (`lib/api-client-react`).
<!-- test -->