# Networth OS (local-first)

Personal finance app: portfolio tracking, monthly snapshots, contributions vs market growth, rule-based insights, and goals. **All data stays in your browser** under the localStorage key `wealth-app-data` (see `src/lib/storage/`).

Stack: **Next.js** (App Router), **Tailwind CSS**, **Recharts**, **Zustand**.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first visit, sample investments and history are created automatically. Use the header to **Export**, **Import**, or **Reset** data.

## Architecture

- `src/types/app-data.ts` — serializable domain types (`AppData`, `Investment`, `MonthlySnapshot`, `Goal`, `Contribution`).
- `src/lib/storage/types.ts` — `StorageAdapter` interface (swap for Firebase/API later).
- `src/lib/storage/local-storage-adapter.ts` — default implementation.
- `src/stores/wealth-store.ts` — Zustand store; loads on mount, persists after every change.
- `src/components/providers/wealth-provider.tsx` — client bootstrap (`hydrate()`).

No backend, env vars, or sign-in required.
