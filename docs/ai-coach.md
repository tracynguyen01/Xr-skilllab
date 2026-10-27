# AI coach (retired) and Scenario Coach (rules-based)

## Live AI coach — not part of the site

There is **no live AI coach** on the published pages.

| Fact | Detail |
| --- | --- |
| Cloudflare Worker | Deleted. Former URL `https://xr-skilllab-coach.tracynguyen01.workers.dev/coach` returns **404**. |
| OpenAI key | **Revoked by the owner.** Docs must not imply a working provider credential. |
| Deploy | No GitHub Actions workflow publishes a Worker. `npm run build` only copies `site/` → `dist/`. |
| Pages | Demo HTML/JS does **not** call `/coach` or any LLM endpoint. |
| Env | No `VITE_COACH_API_URL` (or similar) is set for the static site. |

## What learners actually see: Scenario Coach

On the four industry training demos, the results screen labels feedback as:

**“Scenario Coach — rules-based guided feedback”**

That block is assembled from the attempt (which hazards were found, which preferred options were chosen) using fixed strings in the page. It explains the **deterministic score**. It does **not**:

- call a model
- change the score
- certify the learner
- claim personalised AI coaching

Evidence: results copy in each training `index.html`; e2e `Warehouse|Oil & Gas|Mining|Chemical explainable results, missed list, and confirm reset` (asserts the Scenario Coach label and asserts no `/personalised|\bAI\b/i` on results).

Object-inspect “relevance” lines come from `content.js` `equipment[].relevance` (location context for the fictional scene), not from an AI service.

## Parked source (do not delete without owner approval)

| Path | Why it remains |
| --- | --- |
| `worker/` | Historical Worker implementation; still typechecked (`npm run typecheck`) and unit-tested under `worker/test/`. See `worker/RETIRED.md`. **Do not deploy.** |
| `src/domain/` | Shared types/scoring used only by that Worker — **not** by `site/`. |

Treat both as **parked / retired leftovers**, not as a product feature.
