# XR SkillLab

Independent educational prototype. A visitor inspects an illustrated warehouse, chooses a response for four safety hazards, and gets a transparent score plus offline Scenario Coach feedback.

This is not a Next XR Group product, not an accredited safety course, and not a certified assessment.

**Developer:** Tracy Nguyen · [github.com/tracynguyen01](https://github.com/tracynguyen01)

The intended GitHub Pages address, after the site is published, is:

https://tracynguyen01.github.io/Xr-skilllab/

The repository name is case-sensitive. Do not deploy this as `/xr-skilllab/`.

## What works in this version

- Homepage, simulation, results, How It Works, Project Story, About, and a 404 page
- Keyboard-accessible 2D Warehouse Safety Challenge
- Deterministic score: 15 points for assessing a hazard, plus 10 for the preferred action, once per hazard
- Offline Scenario Coach. No AI service and no network call
- Same-tab session storage, with an in-memory fallback

3D mode is not built. The simulation says so. The hazard list and scoring functions are ready for a later A-Frame scene to call.

## Setup

Requires Node.js 22.

```bash
npm ci
npm run dev
```

Open http://localhost:5173/Xr-skilllab/

The `/Xr-skilllab/` prefix is the Vite `base` used for the project site. It applies in local dev as well.

## Scripts

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
npm run preview
```

`npm run lint` uses oxlint. `npm run test` uses Vitest. `npm run test:e2e` builds the site and runs a Playwright check that the page does not scroll sideways at common widths.

## Architecture

See [docs/architecture.md](docs/architecture.md). Short version:

- React UI and hash routing (`/#/simulate` survives a refresh on GitHub Pages)
- Scenario content in `src/domain/hazards.ts` and `src/domain/decoys.ts`
- Pure scoring in `src/domain/scoring.ts`
- Attempt rules in `src/domain/session.ts`
- Offline coach in `src/domain/coach.ts`
- 2D illustration and buttons share positions in `src/simulation/sceneObjects.ts`

The score is rules, not a model. A future AI Worker must not change it.

## Deploy

Workflows:

- `.github/workflows/ci.yml` runs install, typecheck, lint, unit tests, the overflow check, and build on pull requests and on pushes to `main`
- `.github/workflows/deploy.yml` publishes `dist/` with the official GitHub Pages actions when `main` is pushed

One-time repository setting, if it is not already set:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Until that is set, and until this branch is merged to `main`, the Pages URL is not live. A green build is not the same thing as a checked deployment.

The production build writes asset URLs under `/Xr-skilllab/`. Confirm `dist/index.html` references `/Xr-skilllab/assets/...` if you change the repository name.

## Limitations

- Illustrative training only. It does not replace induction, emergency procedures, or professional safety advice.
- Source notes on each hazard are for later expert review. They are not citations of a law or standard.
- No 3D scene, no headset mode, no accounts, no analytics, and no contact form.
- No live AI coach. The Scenario Coach is local rules.
- No measured claim that the exercise improves workplace performance.
- A licence file has not been added. Inter and Manrope are bundled with Fontsource under the SIL Open Font License.

## Product requirements

The build specification is in [docs/XR_SkillLab_Grokbot_Master_PRD_v1.md](docs/XR_SkillLab_Grokbot_Master_PRD_v1.md). Current scope is tracked in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
