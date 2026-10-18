# Architecture

XR SkillLab is a static site. The visitor's browser is the whole system in this version.

```text
Visitor's browser
┌──────────────────────────────────────────────────────┐
│ React UI                                             │
│   Home, How It Works, Project Story, About           │
│   Simulation                                         │
│     2D illustrated warehouse   (live)                │
│     A-Frame scene              (not built)           │
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

A future AI Worker would sit beside the coach, not inside the score:

```text
Assessment result
    ├─ Scenario Coach (live, local, cannot invent a score)
    └─ AI Worker (future, not connected)
           would rephrase the same result only
```

## Trust boundary

`scoreAttempt` in `src/domain/scoring.ts` is the only thing that assigns points.

- 15 points when a real hazard has one submitted response
- 10 more points when that response is the preferred choice
- 0 when the hazard was not assessed
- Decoy checks, the timer, and `mode: '2d' | '3d'` do not affect the number
- A second submission for the same hazard is ignored

The coach in `src/domain/coach.ts` reads that result. It has no `fetch`. It may mention a hazard as correct only when the result already says `identified` and `correct`.

## Shared contract for 3D

The 2D inspector must not be a separate quiz. These are the pieces a later A-Frame scene should reuse without editing:

| Piece | File | 3D note |
|---|---|---|
| Hazard text, choices, correct id, source note | `src/domain/hazards.ts` | `hotspot` is `{x, y, z}` reserved for the future scene. Those numbers have not been placed in a 3D room yet. |
| Decoys | `src/domain/decoys.ts` | Same "No issue found here" rule |
| Record one answer | `src/domain/session.ts` | Call `submitHazardAnswer`. Do not add points in the scene. |
| Score | `src/domain/scoring.ts` | Call `scoreAttempt` |
| Coach | `src/domain/coach.ts` | Call `buildScenarioCoach` |
| 2D picture positions | `src/simulation/sceneObjects.ts` | Percent positions for the SVG only |

`Attempt.mode` may be `'3d'` later. Scoring tests already check that the same answers in both modes produce the same result.

## Routing and hosting

`HashRouter` keeps routes in the URL hash (`/#/simulate`, `/#/results`). GitHub Pages project sites do not rewrite unknown paths to `index.html`, and the hash never needs that rewrite.

Vite `base` is `/Xr-skilllab/` because the repository name is `Xr-skilllab`. Asset URLs in the production build must start with that prefix.

## Session data

`sessionStorage` key `xr-skilllab.session.v1` keeps the current attempt in the same tab. The stored value is the attempt and the finished result. It does not include a name, email, or employer. If storage throws or the JSON is unusable, the app continues in memory and can show: "We couldn't restore your previous attempt. Start a new one below."

## What is intentionally absent

- No API key and no Worker
- No analytics
- No 3D engine dependency yet, so the bundle is not paying for a scene that is not on screen
- No fake metrics, testimonials, or company marks
