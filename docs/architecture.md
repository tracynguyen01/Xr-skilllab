# Architecture

XR SkillLab is a static site. The visitor's browser is the whole system in this version.

```text
Visitor's browser
┌──────────────────────────────────────────────────────┐
│ React UI                                             │
│   Home, How It Works, Project Story, About           │
│   Simulation                                         │
│     2D illustrated warehouse   (live)                │
│     A-Frame scene              (live, lazy loaded)   │
│   Assessment engine            (pure TypeScript)     │
│   Scenario rubric              (typed local data)    │
│   Scenario Coach               (offline rules)       │
│   Results, retry, sessionStorage                     │
└──────────────────────────────────────────────────────┘
                         │
                         │ static files
                         ▼
                  GitHub Pages
```

An optional AI Worker sits beside the coach, not inside the score. It is implemented and switched off. The published site does not call it until `VITE_COACH_API_URL` is set at build time.

```text
Assessment result
    ├─ Scenario Coach (live, local, cannot invent a score)
    └─ AI Worker (implemented, off)
           POST /coach with scenario id, choice ids, and the rules score
           rephrases that result only
           on any failure the page keeps the Scenario Coach
```

## Trust boundary

`scoreAttempt` in `src/domain/scoring.ts` is the only thing that assigns points.

- 15 points when a real hazard has one submitted response
- 10 more points when that response is the preferred choice
- 0 when the hazard was not assessed
- Decoy checks, the timer, and `mode: '2d' | '3d'` do not affect the number
- A second submission for the same hazard is ignored

The coach in `src/domain/coach.ts` reads that result. It has no `fetch`. It may mention a hazard as correct only when the result already says `identified` and `correct`.

`worker/` can call a model only after the owner configures it. The Worker imports `scoreAttempt` and rejects a body whose score does not match. The results page keeps the score it already calculated. The model reply is three short strings. It is not rendered as HTML. See [ai-coach.md](ai-coach.md).

## Shared contract for 2D and 3D

The 2D inspector and the A-Frame scene are two views of one exercise. Neither one scores a click by itself.

| Piece | File | Note |
|---|---|---|
| Hazard text, choices, correct id, source note, 3D position | `src/domain/hazards.ts` | `hotspot` is `{x, y, z}` in metres |
| Decoys | `src/domain/decoys.ts` | Same "No issue found here" rule, plus a 3D hotspot |
| Record one answer | `src/domain/session.ts` | `submitHazardAnswer` and `setAttemptMode` |
| Score | `src/domain/scoring.ts` | `scoreAttempt`. `mode` does not change points |
| Coach | `src/domain/coach.ts` | `buildScenarioCoach` |
| Optional AI coach | `worker/` and `src/domain/aiCoach.ts` | Off unless `VITE_COACH_API_URL` is an https URL |
| 2D picture positions | `src/simulation/sceneObjects.ts` | Percent positions for the SVG only |
| 3D scene | `src/simulation/WarehouseScene.tsx` | Loaded with `React.lazy` from the simulation page |

A-Frame is imported only by that scene file. Camera movement is handled inside A-Frame, not in React state. The scene adds and removes its own listeners, and it does not use a React wrapper or a physics engine.

## Routing and hosting

`HashRouter` keeps routes in the URL hash (`/#/simulate`, `/#/results`). GitHub Pages project sites do not rewrite unknown paths to `index.html`, and the hash never needs that rewrite.

Vite `base` is `/Xr-skilllab/` because the repository name is `Xr-skilllab`. Asset URLs in the production build must start with that prefix.

## Session data

`sessionStorage` key `xr-skilllab.session.v1` keeps the current attempt in the same tab. The stored value is the attempt and the finished result. It does not include a name, email, or employer. If storage throws or the JSON is unusable, the app continues in memory and can show: "We couldn't restore your previous attempt. Start a new one below."

## What is intentionally absent

- No API key in the repository. The Worker secret is set in Cloudflare, and it is not set yet
- The AI coach is not enabled on the published site
- No analytics
- A-Frame is a separate chunk, loaded when the 3D view opens, not in the main bundle
- No fake metrics, testimonials, or company marks
