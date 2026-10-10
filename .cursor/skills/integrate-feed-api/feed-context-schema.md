# Feed API context JSON schema

Use this format when integrating a feed (paste in chat or save as `docs/feeds/<feed-id>.context.json`).

## Top-level shape

```json
{
  "feed": {
    "id": "string (kebab-case, unique)",
    "name": "string (display name)",
    "baseUrl": "string (HTTPS origin + optional path prefix, no trailing slash)",
    "kind": "streamcenter | trendy48 | <new-adapter-kind>",
    "docsUrl": "string (optional)"
  },
  "spec": {
    "name": "string",
    "version": "string",
    "description": "string",
    "endpoints": { "GET /path": "description", ... },
    "caching": "string (optional)",
    "cors": "string (optional)",
    "rate_limit": "string (optional)",
    "shape": { "match": { "field": "description", ... } }
  }
}
```

**Alternative:** include OpenAPI 3.x instead of `spec`:

```json
{
  "feed": { ... },
  "openapi": { "openapi": "3.1.1", "info": { ... }, "servers": [...], "paths": { ... } }
}
```

Provide **either** `spec` (Trendy48-style) **or** `openapi` (StreamCenter-style), or both if useful.

## Required fields

| Path | Required |
|------|----------|
| `feed.id` | yes |
| `feed.name` | yes |
| `feed.baseUrl` | yes |
| `feed.kind` | yes |
| `spec` or `openapi` | at least one |

## `kind` values

| `kind` | Use when |
|--------|----------|
| `streamcenter` | Sports list + `/api/matches/{selector}` + `/api/stream/{source}/{matchId}` → `embedUrl` |
| `trendy48` | `/matches/live` etc. + per-match `watch_url` iframe |
| *(new)* | Any other contract; skill workflow must add adapter |

## Path resolution rule

Document in `docs/API.md` explicitly:

- If `baseUrl` is `https://host/api`, client paths are usually `/matches/live` (not `/api/matches/live`).
- If `baseUrl` is `https://host`, paths often include `/api/...`.

Confirm with one live `fetch` during integration.

## Minimal example (Trendy48-style)

```json
{
  "feed": {
    "id": "trendy48",
    "name": "Trendy48",
    "baseUrl": "https://trendy48.online/api",
    "kind": "trendy48",
    "docsUrl": "https://trendy48.online"
  },
  "spec": {
    "name": "Trendy48 feed",
    "version": "1.0",
    "description": "Board cache as JSON.",
    "endpoints": {
      "GET /api/matches/live": "Live or starting within 30 minutes"
    },
    "shape": {
      "match": {
        "id": "string",
        "watch_url": "iframe URL"
      }
    }
  }
}
```

## Minimal example (OpenAPI wrapper)

```json
{
  "feed": {
    "id": "streamcenter",
    "name": "StreamCenter",
    "baseUrl": "https://streamcenter.st",
    "kind": "streamcenter",
    "docsUrl": "https://streamcenter.st/docs"
  },
  "openapi": {
    "openapi": "3.1.1",
    "info": { "title": "StreamCenter Public API", "version": "1.0.0" },
    "servers": [{ "url": "https://streamcenter.st" }],
    "paths": {}
  }
}
```

Store full OpenAPI in `openapi.paths` when integrating; truncated example above is illustrative only.
