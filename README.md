# XR SkillLab

Independent educational prototype. A visitor inspects a warehouse in 3D or in an accessible 2D view, chooses a response for four safety hazards, and gets a transparent score plus offline Scenario Coach feedback.

This is not a Next XR Group product, not an accredited safety course, and not a certified assessment.

**Developer:** Tracy Nguyen · [github.com/tracynguyen01](https://github.com/tracynguyen01)

The published site is:

https://tracynguyen01.github.io/Xr-skilllab/

The repository name is case-sensitive. Do not deploy this as `/xr-skilllab/`.

## What works in this version

- Homepage, simulation, results, How It Works, Project Story, About, and a 404 page
- Keyboard-accessible 2D Warehouse Safety Challenge
- A-Frame warehouse on the same hazards and the same score, loaded only when 3D opens
- Drag to look, WASD or arrow keys to move, and an inspection list that does not need a mouse
- Deterministic score: 15 points for assessing a hazard, plus 10 for the preferred action, once per hazard
- Offline Scenario Coach. The optional AI coach Worker is deployed. The site shows it when `VITE_COACH_API_URL` is set
- Same-tab session storage, with an in-memory fallback

On a wide screen with WebGL, the intro offers **Begin in 3D** first. On a narrow screen it offers the 2D inspector first, with **Try 3D**. If WebGL is missing, the page says 3D is not available and the 2D exercise is the whole task. Switching views does not clear answers.

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

`npm run lint` uses oxlint. `npm run test` uses Vitest. `npm run test:e2e` builds the site and runs Playwright checks: no sideways scroll, the 3D scene loading, a finished 3D attempt, and the WebGL fallback.

## Architecture

See [docs/architecture.md](docs/architecture.md). Short version:

- React UI and hash routing (`/#/simulate` survives a refresh on GitHub Pages)
- Scenario content in `src/domain/hazards.ts` and `src/domain/decoys.ts`
- Pure scoring in `src/domain/scoring.ts`
- Attempt rules in `src/domain/session.ts`
- Offline coach in `src/domain/coach.ts`
- Optional AI coach in `worker/`. Deployed. The site enables it when `VITE_COACH_API_URL` is set. See [docs/ai-coach.md](docs/ai-coach.md)
- 2D illustration and buttons share positions in `src/simulation/sceneObjects.ts`
- 3D rings use `hotspot` on each hazard and decoy. `src/simulation/WarehouseScene.tsx` is loaded only for the 3D view

The score is rules, not a model. The optional Worker can rephrase a finished result. It cannot change the score. The published site calls it only when `VITE_COACH_API_URL` is set at build time.

## Deploy

Workflows:

- `.github/workflows/ci.yml` runs install, typecheck, lint, unit tests, the overflow check, and build on pull requests and on pushes to `main`
- `.github/workflows/deploy.yml` publishes `dist/` with the official GitHub Pages actions when `main` is pushed

One-time repository setting, if it is not already set:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Pushes to `main` publish the site. A green build on another branch is not the same thing as a checked deployment.

The deploy build reads the repository variable `VITE_COACH_API_URL` (Settings → Secrets and variables → Actions → Variables). It is a public URL, not a secret. While that variable is empty, the results page stays on the offline Scenario Coach. Turning the coach on later does not need a code change. The steps are in [docs/ai-coach.md](docs/ai-coach.md).

The production build writes asset URLs under `/Xr-skilllab/`. Confirm `dist/index.html` references `/Xr-skilllab/assets/...` if you change the repository name.

## Limitations

- Illustrative training only. It does not replace induction, emergency procedures, or professional safety advice.
- Source notes on each hazard are for later expert review. They are not citations of a law or standard.
- 3D is a browser scene made of simple shapes. It does not require a headset, and the headset button is hidden.
- No accounts, no analytics, and no contact form.
- The AI coach Worker is deployed. The results page requests it when `VITE_COACH_API_URL` is set, and otherwise stays on the offline Scenario Coach. The model cannot change the score. See [docs/ai-coach.md](docs/ai-coach.md).
- No measured claim that the exercise improves workplace performance.
- A licence file has not been added. Inter and Manrope are bundled with Fontsource under the SIL Open Font License.

## Product requirements

The build specification is in [docs/XR_SkillLab_Grokbot_Master_PRD_v1.md](docs/XR_SkillLab_Grokbot_Master_PRD_v1.md). Current scope is tracked in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).
