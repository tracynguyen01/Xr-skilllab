# Implementation status

Honest inventory of what the published static site does, what is experimental, and what is parked or not built. Claims below name a file and (where useful) a test.

**Portfolio name:** XR Concept Lab  
**Project / warehouse folder name:** XR SkillLab (`/samples/xr-skilllab/`)  
**Published site:** https://tracynguyen01.github.io/Xr-skilllab/

This is not a Next XR Group product, not an accredited course, not safety certification, and not a live digital-twin connection to a real property.

---

## Real architecture (source of truth)

```text
site/                         # copied wholesale to dist/ by scripts/build-site.mjs
  index.html + main.js        # portal landing (carousel + Fields menu host)
  portfolio-menu.js + menu.css
  samples.json                # catalogue for landing + menu
  shared/scene-ui.js|.css     # shared briefing / status HUD for the four training demos
  samples/<slug>/             # one Fable-style page per demo
    index.html                # lesson UI (hand-edited; do not regenerate lightly)
    support.js                # per-sample Fable/React runtime copy — do not edit unless a prior task already required it
    engine.js | warehouse.js | home.js   # Three.js scene (per-sample copies)
    content.js                # hazards, decoys, equipment, score() for training demos
    scene.js                  # industry scene graph (oil-gas / mining / chemical)
```

- **Build:** `npm run build` → `scripts/build-site.mjs` copies `site/` → `dist/`. Nothing compiles the demos.
- **`scripts/build-lessons.mjs` is frozen.** It exits unless `--force-regenerate` is passed. It is **not** the source of truth for the five demos; regenerating would overwrite hand-edited industry pages. See the banner comment at the top of that file.
- **No page imports `worker/` or `src/domain/`.** Those folders are parked leftovers (see below).

---

## Implemented

| Claim | Evidence |
| --- | --- |
| Portal landing with one featured lesson, Fields menu, reduced-motion-aware carousel | `site/index.html`, `site/main.js`, `site/portfolio-menu.js`; e2e `carousel advances and the fields menu reaches every lesson`, `the carousel stays put when reduced motion is requested` (`e2e/portfolio.spec.ts`) |
| Catalogue driven by `samples.json` | `site/samples.json`; menu fetch in `site/portfolio-menu.js` |
| Shared scene HUD (briefing, status drawer) on the four training demos | `site/shared/scene-ui.js`, `site/shared/scene-ui.css`; e2e `Oil & Gas briefing dialog and status panel mount in play`, `Oil & Gas status drawer collapses after info Close at 390px` (`e2e/oil-gas-scene-ui.spec.ts`) |
| Warehouse Safety training loop (3D + 2D, score, results) | `site/samples/xr-skilllab/`; e2e `Warehouse explainable results, missed list, and confirm reset` (`e2e/warehouse.spec.ts`) |
| Oil & Gas / Mining / Chemical processing — same training pattern, fictional scenes | `site/samples/oil-gas/`, `mining/`, `chemical-processing/`; e2e `Oil & Gas explainable results…`, `Mining explainable results…`, `Chemical explainable results…` |
| Deterministic score: 15 for identifying a hazard + 10 for preferred action, out of 100; decoys do not score | each `content.js` `score()`; unit `site/samples/score.test.js` (`awards 15 for identifying and 10 for the preferred action, out of 100`) |
| **Scenario Coach** on results = **rules-based** guided feedback (fixed copy from the attempt), **not** an LLM | Results eyebrow text in each training `index.html` (`Scenario Coach — rules-based guided feedback`); e2e asserts that string and asserts no `/personalised\|\bAI\b/i` on results (`e2e/warehouse.spec.ts` and siblings) |
| Object inspect shows purpose / location relevance from `content.js` `equipment` | `equipment[].relevance` in each training `content.js`; wired as `inspection.relevance` in each training `index.html` |
| TwinInspect fictional home-inspection concept (2D plan, findings, report) | `site/samples/twininspect/`; e2e `TwinInspect room nav, finding lifecycle, report, and no raw templates`, `TwinInspect 390px: pointer Finish and finding add/edit/delete` |
| TwinInspect report states fictional property / not a real inspection | Copy + e2e expect `Fictional property, not a real inspection` (`e2e/twininspect.spec.ts`) |
| 2D path without WebGL | Playwright project `chromium-no-webgl`; e2e `Begin in 2D without WebGL` / `TwinInspect: Use 2D Floor Plan without WebGL` (`e2e/a11y-responsive.spec.ts`) |
| A11y / responsive sweep (focus rings, icon names, overflow widths, reduced-motion camera) | `e2e/a11y-responsive.spec.ts`; reduced-motion auto-turn guards in each sample’s Orbit/Cam updater |
| Route baseline, overflow, Fields menu, old hash → home | `e2e/routes.spec.ts` |
| Static deploy via GitHub Actions → GitHub Pages | `.github/workflows/deploy.yml` |
| Honest portfolio framing (independent, fictional demos) | `README.md`, landing/footer copy on `site/index.html` and sample pages |

---

## Experimental

| Claim | Notes | Evidence |
| --- | --- | --- |
| Optional WebGL 3D / “Begin in 3D” | Works when the browser exposes WebGL; otherwise the intro steers to 2D. Not a guarantee on every device. | Intro CTAs in each training `index.html`; no-WebGL e2e forces the 2D path |
| WebXR “Headset” control | Present in the tool chrome; often disabled until a headset session is available. Concept only. | Toolbar in training / TwinInspect pages |
| Hero dollhouse / live 3D preview auto-orbit | Intentionally frozen when `prefers-reduced-motion: reduce` | e2e `*: hero camera stays still under reduced motion` (`e2e/a11y-responsive.spec.ts`) |
| TwinInspect 360° / thermal / moisture layers | Scripted illustrative captures on a fictional model — not a live scan feed | TwinInspect UI + room-switch e2e (no `ERR_INVALID_URL` / raw `{{` templates) |

---

## Not built

| Claim | Status |
| --- | --- |
| Live **AI coaching** (LLM) on results | **Not built for the site.** Pages never call a coach API. |
| Safety **certification** or accredited assessment | **Not built.** Copy must not claim it. |
| **Live digital-twin** connectivity to a real property / scan pipeline | **Not built.** TwinInspect is a pre-built fictional model. |
| Accounts, analytics, contact form, saved learner records | **Not built.** |
| React SPA / A-Frame warehouse / hash router / Vite app shell | **Removed** from the published site. Old `/#/…` URLs open the portfolio home (`e2e/portfolio.spec.ts` `old hash routes stay on the portfolio home`). |

---

## Parked / retired leftovers (do not delete without owner approval)

| Path | What it is | Called by pages? |
| --- | --- | --- |
| `worker/` | Former Cloudflare Worker for an optional LLM coach. **Retired.** Cloudflare Worker deleted; previous `/coach` URL returns 404. OpenAI key for that Worker was **revoked by the owner**. Source kept so `npm run typecheck` / worker unit tests still run. See `worker/RETIRED.md` and `docs/ai-coach.md`. | **No** |
| `src/domain/` | Shared TypeScript scoring / hazard / coach-contract types used **only** by the parked Worker and its tests — not by `site/`. | **No** (only `worker/src/*` and `worker/test/*`) |

Do **not** market these folders as a live AI coach. Do **not** delete them in this task.

---

## Docs map

| Doc | Role |
| --- | --- |
| `README.md` | How to run, add a demo, honest product framing |
| `docs/architecture.md` | Static site shape, frozen generator, parked folders |
| `docs/ai-coach.md` | Retired Worker + revoked key; rules-based Scenario Coach only |
| `docs/XR_SkillLab_Grokbot_Master_PRD_v1.md` | Historical PRD — planning text, not runtime truth |

---

## Tests run locally for this repo

| Command | Covers |
| --- | --- |
| `npm run typecheck` | Parked Worker TypeScript (`worker/tsconfig.json`) |
| `npm test` | Worker unit tests + `site/samples/score.test.js` |
| `npm run test:e2e` | Playwright suite under `e2e/` (builds `dist/` first) |
