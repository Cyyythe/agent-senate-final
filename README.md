# Senate Insight Demo (Milestone 3 Skeleton)

Next.js App Router proof-of-concept focused on:

- topic-first research storytelling
- filterable exploration (`single/debate`, `role/no-role`, topic spectrum, agent, role)
- static packaged JSON designed for large local data payloads
- non-invasive in-app feedback collection (local only, exportable JSON)

## Run

```bash
npm install
npm run generate:demo-data
npm run dev
```

## Route map

- `/` main page
- `/topics` topic index
- `/topics/[slug]` topic story detail
- `/explorer` prompt-level filtering and inspection
- `/visualizations` chart placeholders with real wiring
- `/methodology` study/app explanation and feedback field disclosure
- `/about` project overview

## Data packaging strategy

Data is loaded from `public/data` using a manifest:

- `public/data/manifest.json`
- `public/data/questions/<topic>.json`
- `public/data/conversations/<topic>.json`
- `public/data/metrics/overview.json`

The UI uses `src/lib/data-client.ts` and `src/hooks/use-study-data.ts`, so moving to API routes later is isolated to the data layer.

## Demo feedback model

Feedback is collected via a floating dock and stored in `localStorage` for this milestone. Export is built in.

Collected fields:

- `pagePath`
- `topicSlug` (optional)
- `perceptionGap` (Likert 1-5)
- `clarity` (Likert 1-5)
- `chartUsefulness` (Likert 1-5)
- `comment`
- `createdAt`
