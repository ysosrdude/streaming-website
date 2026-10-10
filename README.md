# StreamHub

A React + Vite frontend for multiple sports JSON feeds. Built-in providers:

- [StreamCenter](https://streamcenter.st/docs) (`streamcenter`)
- [Trendy48](https://trendy48.online/api) (`trendy48`)

Use the **Feeds** multiselect on the home page to combine catalogs from any enabled provider.

## API reference

Provider request/response shapes and endpoints are documented in **[docs/API.md](./docs/API.md)**. Update that file when feed contracts change.

### Add a new feed (agent skill)

1. Save API context as `docs/feeds/<feed-id>.context.json` (see [schema](.cursor/skills/integrate-feed-api/feed-context-schema.md)).
2. In Cursor, invoke skill **`integrate-feed-api`** (or ask to integrate the attached feed JSON).
3. The agent updates `docs/API.md`, `src/feeds/catalog.ts`, and adapter code, then runs `npm run build`.

Validate context JSON:

```bash
node .cursor/skills/integrate-feed-api/scripts/validate-feed-context.mjs docs/feeds/<feed-id>.context.json
```

## Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- Anonymous API access (CORS-enabled)

## Local development

```bash
npm install
npm run dev
```

Optional `.env` settings (see `.env.example`):

- `VITE_API_BASE_URL` — override StreamCenter host only
- `VITE_FEED_PROVIDERS` — JSON array to override the built-in list in `src/feeds/catalog.ts` (`id`, `name`, `baseUrl`, `kind`: `streamcenter` | `trendy48`)

## Deploy on Vercel

1. Import this repository in Vercel.
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_FEED_PROVIDERS` / `VITE_API_BASE_URL` if you are not using the defaults

`vercel.json` includes a SPA rewrite so client routes (`/watch/...`, `/sport/...`) work on refresh.

## Project structure

```
src/
  api/           HTTP clients per feed type
  feeds/         FEED_CATALOG (source of truth) + env resolution
  providers/     Adapters and aggregation
  context/       Feed multiselect (persisted in localStorage)
  components/    UI, layout, browse, watch
  config/        Environment
  hooks/         Shared async data hook
  pages/         Route screens
  routes/        Router + URL helpers
  types/         API models
  utils/         Dates, image URLs
```

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Dev server         |
| `npm run build`| Production build   |
| `npm run preview` | Preview production build |
