---
name: push-github-vercel
description: >-
  Pushes local git changes to GitHub and confirms or triggers a Vercel production
  redeploy using shell git/gh, the user-github MCP, and the Vercel plugin MCP.
  Use when the user asks to push, deploy, redeploy, ship to production, sync GitHub,
  or update the live Vercel site.
---

# Push to GitHub and redeploy on Vercel

End-to-end release workflow for Git-connected Vercel projects. Prefer **git push → automatic Vercel build** over manual `create_deployment` unless Git integration is missing or broken.

## Tooling map

| Step | Primary | Fallback |
|------|---------|----------|
| Inspect repo | Shell: `git status`, `git diff`, `git log` | — |
| Commit | Shell: `git add`, `git commit` | Only when user explicitly asks |
| Push | Shell: `git push -u origin HEAD` | GitHub MCP `push_files` only for tiny remote-only edits (no full tree) |
| Open PR | Shell: `gh pr create` | GitHub MCP `create_pull_request` |
| Resolve Vercel project | Vercel MCP `get_git_deployment_context` | Vercel MCP `list_projects` + `get_project` |
| Watch deploy | Vercel MCP `list_deployments`, `get_deployment` | `vercel list` / `vercel inspect` |
| Build logs on failure | Vercel MCP `list_deployment_events` | Dashboard deployment logs |
| Force prod URL | Vercel MCP `request_promote` (existing deployment) | `vercel --prod` |
| Deploy without Git | Vercel MCP `create_deployment` | `vercel deploy --prod` |

Always call `GetDynamicTools` for a namespace/tool before `CallDynamicTool` if the schema is unknown.

## Preconditions

1. **User intent** — Commit and push only when the user asked (or a user rule explicitly allows it).
2. **Clean scope** — Do not commit `.env`, credentials, or API keys; warn if requested.
3. **Remote** — `git remote -v` must show GitHub (`github.com` or `github.com:` SSH). If missing, ask for repo URL or use GitHub MCP `create_repository` + `git remote add`.
4. **Build** — Run `npm run build` (or project script) before push when the change is user-facing or the user asked for deploy.
5. **Auth** — Vercel MCP and `gh` must already be authenticated in Cursor. On MCP auth errors, call `mcp_auth` for that namespace and retry once.

Optional project hints: copy [project-overrides.example.json](project-overrides.example.json) to `project-overrides.json` (local only, do not commit secrets) and read `githubRepo`, `productionBranch`, `vercelProjectId`, `vercelProjectName`, `productionUrl`.

## Workflow checklist

```
Ship progress:
- [ ] 1. git status + diff + log (parallel)
- [ ] 2. npm run build (if applicable)
- [ ] 3. Commit (if user requested)
- [ ] 4. Push branch to GitHub
- [ ] 5. Resolve Vercel project + production branch
- [ ] 6. Confirm new deployment for pushed SHA
- [ ] 7. Report URLs + deployment state to user
```

## Step 1 — Understand git state

Run in parallel:

```bash
git status
git diff
git diff --staged
git log -5 --oneline
git branch -vv
```

Note: current branch, upstream, uncommitted files, commit message style.

## Step 2 — Commit (explicit request only)

Follow the user’s git safety rules:

- Never change `git config`, force-push `main`/`master`, or skip hooks unless asked.
- Stage relevant files; draft a 1–2 sentence message focused on **why**.
- Commit with a HEREDOC message on Unix; on PowerShell use a here-string or `-m` with a short message.

```bash
git add <paths>
git commit -m "Short summary of why"
git status
```

## Step 3 — Push to GitHub

```bash
git push -u origin HEAD
```

For PR-based flow (non-production branch):

```bash
git push -u origin HEAD
gh pr create --title "..." --body "$( @'
## Summary
- ...

## Test plan
- [ ] ...
'@ )"
```

GitHub MCP alternatives when `gh` is unavailable: `create_branch`, `create_pull_request`, `get_file_contents` — still prefer **local git + push** for normal code changes.

Record the pushed **commit SHA**: `git rev-parse HEAD`.

## Step 4 — Resolve Vercel context (MCP)

1. `plugin-vercel-vercel` → `get_git_deployment_context`  
   Match the GitHub repo (owner/name) to `projectId`, `projectName`, team `id`/`slug`, and production branch.

2. If ambiguous, `list_projects` and `get_project` with `projectId` or name.

3. Read `project-overrides.json` in this skill folder if present.

## Step 5 — Redeploy behavior

### A. Git integration (default)

Pushing to the **production branch** (usually `main`) triggers a new Vercel deployment automatically. No extra deploy call is required.

Poll until ready:

- `list_deployments` with `projectId`, `teamId` or `slug`, `limit: 5`, optional `branch` / `sha`
- `get_deployment` for `readyState`, `url`, `alias`

Success criteria: latest deployment `state` includes `READY` (or terminal `ERROR` with logs).

### B. Preview branch

Push creates a **preview** deployment. Share the preview `url` from `get_deployment`. Promote only if the user asked for production:

- `request_promote` with `projectId` and deployment `id`  
  (Does **not** rebuild; promotes an existing deployment.)

### C. Git push not an option

Use only when the user explicitly wants a CLI/MCP deploy without push:

- `create_deployment` with `projectId` / `name` and `target: production`  
- Or shell: `vercel deploy --prod` from project root (project must be linked via `.vercel` or flags)

### D. Protected deployments

If the site uses Vercel Deployment Protection, use MCP `get_access_to_vercel_url` or skill `access-protected-vercel-deployment` to verify the deployment in browser.

## Step 6 — Report back

Include:

- GitHub: branch, commit SHA, PR URL (if any)
- Vercel: deployment URL, production alias, `READY` / `ERROR`
- If `ERROR`: short cause from `list_deployment_events` and the fix or next step

## Failure playbook

| Symptom | Action |
|---------|--------|
| Push rejected (non-fast-forward) | `git pull --rebase origin <branch>` then push; never force-push main without explicit ask |
| Vercel build failed | `list_deployment_events`; reproduce with `npm run build` locally |
| No deployment after push | Confirm Vercel Git integration + correct branch in project settings; check `list_deployments` for other branches |
| Wrong project | Re-run `get_git_deployment_context`; verify `origin` URL matches linked repo |
| MCP `needsAuth` | Authenticate Vercel/GitHub MCP, retry |

## Related plugin skills

- Vercel deploy details: `deployments-cicd`, `vercel-cli` (Cursor Vercel plugin)
- Protected previews: `access-protected-vercel-deployment`
- New repo on Cursor Origin: `origin` skill (optional; this workflow targets GitHub + Vercel)

## StreamHub defaults (this repo)

When `project-overrides.json` is absent, assume:

| Field | Value |
|-------|--------|
| GitHub | `ysosrdude/streaming-website` |
| Vercel project | `multisport-streaming-website` |
| Production URL | `https://multisport-streaming-website.vercel.app` |

Re-verify with `get_git_deployment_context` before promoting or debugging production.
