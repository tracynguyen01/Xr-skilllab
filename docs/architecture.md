# Architecture

XR Concept Lab is a **static** portfolio. GitHub Pages serves files from `dist/`. There is no application server on the request path for the demos.

XR SkillLab is the **project / warehouse folder** name (`/samples/xr-skilllab/`). The warehouse lesson is shown as **Warehouse Safety**.

```text
Visitor browser
┌─────────────────────────────────────────────────────────────┐
│ site/index.html + main.js                                   │
│   portal landing — carousel + Fields menu                   │
│   reads samples.json                                        │
│ portfolio-menu.js / menu.css                                │
│ shared/scene-ui.js|.css     ← training-demo HUD             │
│                                                             │
│ samples/xr-skilllab/        Warehouse Safety                │
│ samples/oil-gas|mining|chemical-processing/                 │
│   index.html + support.js + engine|warehouse.js             │
│   content.js (hazards, decoys, equipment, score)            │
│   scene.js (industry geometry)                              │
│ samples/twininspect/                                        │
│   index.html + support.js + home.js                         │
│ Three.js / fonts from public CDNs                           │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
                  GitHub Pages
                  /Xr-skilllab/
```

## Source of truth for the five demos

| Piece | Role |
| --- | --- |
| `site/samples/<slug>/` | Hand-edited Fable-style pages. **Source of truth.** |
| `site/samples.json` | Catalogue for the landing carousel and Fields menu. |
| `scripts/build-site.mjs` | `rm dist` + copy `site` → `dist`. Only build used by CI deploy. |
| `scripts/build-lessons.mjs` | **Frozen.** Exits unless `--force-regenerate`. Would overwrite oil-gas / mining / chemical from the warehouse template — **not** used for day-to-day builds and **not** the source of truth. |

Each demo ships its **own** `support.js` (Fable/React runtime copy) and scene script. Do not “unify” or edit `support.js` / sample `engine.js` unless a specific task already requires it. Prefer content and CSS changes in `content.js`, `index.html`, or `site/shared/`.

## What the training demos actually do

1. Learner inspects hazards (3D or 2D).
2. Choices are scored by **fixed rules** in that sample’s `content.js` (`score()`).
3. Results show a transparent breakdown and a **Scenario Coach** block that is **rules-based** guided feedback (location / attempt-derived copy). It is **not** an LLM, **not** certification, and **not** live twin telemetry.

Evidence: `site/samples/score.test.js`; e2e `* explainable results, missed list, and confirm reset`.

## Parked leftovers (not on the page request path)

| Path | Status |
| --- | --- |
| `worker/` | Retired Cloudflare Worker for a former optional LLM coach. Not deployed. Pages do not call it. OpenAI key revoked by owner. See `worker/RETIRED.md` and `docs/ai-coach.md`. |
| `src/domain/` | TypeScript domain types/scoring used only by the parked Worker tests — **not** imported by `site/`. |

Leave both in the tree until the owner approves deletion. Do not describe them as a live AI coach.

## Intentionally absent

- Next XR branding or endorsement
- API keys in the repository
- Calls from demo pages to any coach Worker
- Accounts, analytics, or saved personal data
- Claims that a demo certifies competence or connects to a live site scan
