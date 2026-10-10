---
name: integrate-feed-api
description: >-
  Integrates a new sports JSON feed into StreamHub: validates feed API context JSON,
  updates docs/API.md, archives context under docs/feeds/, and wires code (FEED_CATALOG,
  adapters, watch flow). Use when the user adds a base URL, attaches feed API context
  JSON, asks to integrate a provider, or invokes integrate-feed-api.
---

# Integrate feed API

## When to use

User provides (or points to) **feed API context JSON** for a new `baseUrl` / provider. Execute this workflow end-to-end; do not only update docs or only update code.

## Inputs (priority order)

1. **File path** — `docs/feeds/<feed-id>.context.json` (preferred; commit the context)
2. **Attachment** — JSON pasted in chat; save to `docs/feeds/<feed-id>.context.json` before finishing
3. **OpenAPI** — if `openapi` field is present, document from it like StreamCenter in `docs/API.md`

Schema and examples: [feed-context-schema.md](feed-context-schema.md)

## Workflow checklist

Copy and track:

```
Integrate feed progress:
- [ ] 1. Parse & validate JSON (script or manual against schema)
- [ ] 2. Probe live API (GET key list endpoint) when network available
- [ ] 3. Classify adapter kind (see decision tree)
- [ ] 4. Update docs/API.md (new section + mapping table row)
- [ ] 5. Update src/feeds/catalog.ts
- [ ] 6. Code integration (adapter / API client / types / watch)
- [ ] 7. Update docs/feeds/README.md index if present
- [ ] 8. npm run build
```

## Step 1 — Validate context

```bash
node .cursor/skills/integrate-feed-api/scripts/validate-feed-context.mjs docs/feeds/<feed-id>.context.json
```

Fix all errors before proceeding.

## Step 2 — Classify adapter kind

```
Does playback use GET /api/stream/{source}/{id} → embedUrl array?
  YES → kind: streamcenter (reuse src/api/streamcenter.ts)

Does each match expose watch_url (iframe) and list paths like /matches/live?
  YES → kind: trendy48 (reuse src/api/trendy48.ts)

Otherwise → NEW kind:
  - Add kind string to new FEED_CATALOG entry (drives FeedKind union)
  - Add src/api/<kind>.ts client
  - Extend src/providers/adapters.ts (fetchSports, fetchMatches, fetchPopular)
  - Extend src/types/catalog.ts playback union + WatchPage branch
  - Extend providerUsesSportSelector() in src/feeds/registry.ts if sport path API exists
```

If the new feed is **byte-compatible** with an existing kind but different `baseUrl`, only **catalog + docs** are required.

## Step 3 — docs/API.md

Always update in this order:

1. **App mapping** table — row: `id`, `kind`, adapter module path
2. **New `## <Feed name>` section** with:
   - Base URL, description, version from `spec` or OpenAPI `info`
   - Endpoints table (method, path, description)
   - CORS / caching / rate limits (if provided)
   - JSON shapes (`shape` or OpenAPI schemas) with **example payloads**
   - **Playback in StreamHub** — numbered steps for this app
3. **Changelog** table at bottom — date + one-line summary

Preserve existing sections; do not remove StreamCenter/Trendy48 unless user asks.

Template for a Trendy48-style spec section: see existing **Trendy48 feed** in `docs/API.md`.

## Step 4 — src/feeds/catalog.ts

Add one object to `FEED_CATALOG` (single source of truth for default base URLs):

```ts
{
  id: '<feed-id>',        // kebab-case, unique
  name: '<Display Name>',
  baseUrl: '<normalized-origin/path>',
  kind: 'streamcenter' | 'trendy48' | '<new-kind>',
  docsUrl: '<optional public docs>',
},
```

Rules:

- `id` must match `feed.id` in context JSON
- `baseUrl` must match `feed.baseUrl` (no trailing slash; registry normalizes)
- Never hardcode the same URL elsewhere — use `FEED_CATALOG` / `FeedProvider.baseUrl`

## Step 5 — Code (by kind)

### Reuse `streamcenter`

- No new API file unless paths differ materially (then extend `createStreamCenterApi` with options)
- Adapters already branch on `provider.kind === 'streamcenter'`

### Reuse `trendy48`

- Confirm path prefix: base `https://host/api` → client paths `/matches/live` not `/api/matches/live`
- Adapters already branch on `trendy48`

### New kind

Minimum touch set:

| File | Action |
|------|--------|
| `src/api/<kind>.ts` | `createApiClient(baseUrl)` + typed endpoints from spec |
| `src/providers/adapters.ts` | Map raw match → `CatalogMatch`; wire list/popular/sports |
| `src/types/catalog.ts` | New `playback` variant |
| `src/pages/WatchPage.tsx` | Branch on `playback.kind` |
| `src/feeds/registry.ts` | `providerUsesSportSelector` if applicable |

## Step 6 — Verify

```bash
npm run build
```

Manually confirm: feed appears in **Feeds** multiselect, matches load, watch page plays.

## Archive context

Every integration must save the source JSON:

`docs/feeds/<feed-id>.context.json`

List feeds in `docs/feeds/README.md`.

## Reference files

- Canonical API doc: `docs/API.md`
- Feed list: `src/feeds/catalog.ts`
- Aggregation: `src/providers/adapters.ts`, `src/providers/aggregate.ts`
- Examples: `docs/feeds/trendy48.context.json`, `docs/feeds/streamcenter.context.json`
