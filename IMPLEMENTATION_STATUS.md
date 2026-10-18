# Implementation status

Milestone: P0 2D training loop (Epics A, B, and the relevant parts of D).  
3D scene (Epic C) and the AI Worker (Epic E) are not in this milestone.

## Implemented

- React, TypeScript, and Vite app with hash routing
- Routes: Home, Simulate, Results, How It Works, Project Story, About, 404
- Sticky navigation, skip link, mobile menu, focus styles
- Footer disclaimer text from the product requirements
- Dark visual system using the specified colour tokens
- Illustrated warehouse, drawn in code, with four hazards and two decoys
- Keyboard-accessible 2D inspector, dialog, progress, informational timer, reset, and finish
- Clearly marked "3D mode coming soon" note. There is no dead 3D button
- Pure scoring: 15 + 10 per hazard, once, decoys worth 0
- Results breakdown and offline Scenario Coach
- Try Again clears the attempt, answers, decoy checks, timer, and score
- Same-tab `sessionStorage`, with an in-memory fallback
- Unit tests for the scoring matrix, session rules, coach rules, content, and a route/loop smoke test
- GitHub Actions CI and Pages deploy workflows
- Developer name Tracy Nguyen and GitHub profile link on About and Project Story
- Contact email hidden, because none was supplied

## Tested in this workspace

Local commands on 18 October 2026, Node 22:

| Command | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass, 26 tests |
| `npm run build` | Pass |

`dist/index.html` references `/Xr-skilllab/assets/...` and `/Xr-skilllab/favicon.svg`.

Browser screenshots are a separate check. GitHub Pages is not live until this is merged to `main` and Pages is set to GitHub Actions.

## Deferred

- A-Frame warehouse, hotspot placement, and WebGL fallback (Epic C)
- Optional AI Worker (Epic E). The offline coach is the coaching that exists today
- Volunteer usability study
- Browser matrix beyond the browser used for the screenshots in this milestone
- Lighthouse scores. None are claimed
- A repository licence chosen by the owner

## Blocked on the owner

- Settings → Pages → Source must be **GitHub Actions** or the deploy workflow will not publish
- The Pages URL is live only after this work is merged to `main` and that setting is on
- Contact email, if one should be shown later
