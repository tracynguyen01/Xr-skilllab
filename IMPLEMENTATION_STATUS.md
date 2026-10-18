# Implementation status

Milestone: P0 training loop, including the 3D warehouse (Epics A, B, C, and the relevant parts of D).  
The AI Worker (Epic E) is not in this version.

## Implemented

- React, TypeScript, and Vite app with hash routing
- Routes: Home, Simulate, Results, How It Works, Project Story, About, 404
- Sticky navigation, skip link, mobile menu, focus styles
- Footer disclaimer text from the product requirements
- Dark visual system using the specified colour tokens
- Illustrated warehouse, drawn in code, with four hazards and two decoys
- Keyboard-accessible 2D inspector, dialog, progress, informational timer, reset, and finish
- A-Frame 1.8 warehouse built from primitives, loaded only on the simulation page
- Same four hazards and two decoys, same assessment panel, and the same pure score in 2D and 3D
- Desktop (1024px and wider, when WebGL works) offers Begin in 3D first. Narrower screens offer 2D first, with Try 3D
- If WebGL is missing or the scene fails, the page says 3D is not available and the 2D exercise continues
- Switching between 2D and 3D does not clear answers
- Drag to look, WASD or arrow keys to move, and an HTML inspection list for keyboard and screen-reader users
- Reduced motion turns off ring pulse and camera controls
- The A-Frame VR button is hidden. A headset is not required
- Pure scoring: 15 + 10 per hazard, once, decoys worth 0
- Results breakdown and offline Scenario Coach
- Try Again clears the attempt, answers, decoy checks, timer, and score
- Same-tab `sessionStorage`, with an in-memory fallback
- Unit tests for scoring, session rules, 2D/3D score parity, coach rules, content, and a route/loop smoke test
- Playwright checks for overflow, 3D load, a finished 3D attempt, the WebGL fallback, and the narrow-screen intro
- GitHub Actions CI and Pages deploy workflows
- Developer name Tracy Nguyen and GitHub profile link on About and Project Story
- Contact email hidden, because none was supplied

## Tested in this workspace

Local commands on 18 October 2026, Node 22:

| Command | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass, 30 tests |
| `npm run test:e2e` | Pass, 9 Playwright tests |
| `npm run build` | Pass. Main chunk about 318 kB (100 kB gzip). Lazy 3D chunk about 1.32 MB (358 kB gzip). A-Frame is only in the lazy chunk |

Browser checks on 18 October 2026, Chromium via Playwright:

- 3D scene loads at 1280px, an attempt can be finished from the inspection list, and the results page shows the shared score
- Missing WebGL shows the fallback sentence and stays in 2D
- A 390px-wide intro offers Use 2D Inspector and Try 3D
- No horizontal overflow on the checked routes at 360, 390, 768, 1024, 1280, and 1440
- Edge, Firefox, Safari, Android, and iOS were not run

The live site updates when this is merged to `main` and the Deploy GitHub Pages workflow succeeds. A green pull-request build does not publish.

## Deferred

- Optional AI Worker (Epic E). The offline coach is the coaching that exists today
- Headset / VR mode. The enter-VR control is hidden
- A scanned warehouse. The 3D room is primitives, and the 2D view is an illustration
- Volunteer usability study
- Browser matrix beyond Chromium
- Lighthouse scores. None are claimed
- A repository licence chosen by the owner

## Blocked on the owner

- Contact email, if one should be shown later
