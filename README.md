# XR Concept Lab

An independent educational portfolio of browser-based immersive **concept** demos. The home page introduces the idea. Each demo is a self-contained static page.

The site header and footer use the portfolio name, **XR Concept Lab**. **XR SkillLab** is the project / warehouse-folder name. The warehouse lesson is shown as **Warehouse Safety**.

This is **not** a Next XR Group product, **not** an accredited course, **not** safety certification, and **not** a live digital-twin connection to a real property.

**Developer:** Tracy Nguyen · [github.com/tracynguyen01](https://github.com/tracynguyen01)

Published site: https://tracynguyen01.github.io/Xr-skilllab/

The repository name is case-sensitive. Do not deploy this as `/xr-skilllab/`.

## What is on the site

- A **portal landing** (`site/index.html`) with one featured lesson at a time and a Fields menu for every lesson (`site/portfolio-menu.js`, `site/samples.json`)
- Shared training HUD: `site/shared/scene-ui.js` + `scene-ui.css`
- [Warehouse Safety](site/samples/xr-skilllab/index.html) — warehouse safety training concept (3D + 2D fallback, scoring, results). URL stays `/samples/xr-skilllab/`
- [Oil & Gas](site/samples/oil-gas/index.html), [Mining](site/samples/mining/index.html), [Chemical processing](site/samples/chemical-processing/index.html) — same training pattern on **fictional** industry floors
- [TwinInspect](site/samples/twininspect/index.html) — **concept** remote inspection of a **fictional** home model (not a live scan or connected twin)

The four industry lessons score in each sample’s `content.js`: **15** points for assessing a hazard and **10** more for the preferred action, out of **100**. Decoys do not score. Unit coverage: `site/samples/score.test.js`.

Results use a **Scenario Coach** label for **rules-based** guided feedback (location / attempt-derived copy). That is **not** AI coaching. See [docs/ai-coach.md](docs/ai-coach.md) and [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

Each demo is a Fable-style page with its **own** `support.js` and scene script beside it (relative paths). Prefer editing `content.js` / `index.html` / shared CSS — do not casually edit `support.js` or regenerate lessons.

## Build source of truth

| Script | Role |
| --- | --- |
| `scripts/build-site.mjs` | **Used by CI.** Copies `site/` → `dist/`. |
| `scripts/build-lessons.mjs` | **Frozen.** Exits unless `--force-regenerate`. Not the source of truth for the five demos; regenerating would wipe hand-edited industry pages. |

## Parked / retired (not on the page path)

- **`worker/`** — former Cloudflare LLM coach Worker. **Retired / not deployed.** Cloudflare deleted the Worker (old `/coach` URL → 404). The owner **revoked** the OpenAI key. Pages do not call it. Kept for typecheck/tests only. See [worker/RETIRED.md](worker/RETIRED.md).
- **`src/domain/`** — TypeScript types/scoring used only by that parked Worker — **not** imported by any page. Do not delete without owner approval.

Do not describe either folder as a live AI coach.

## Add a demo

Demos are one folder plus one entry in [`site/samples.json`](site/samples.json).

1. Create `site/samples/<slug>/`.
2. Put the page at `index.html` so the URL is `/samples/<slug>/`. Keep `support.js` and other scripts beside it with relative paths such as `./support.js`.
3. Add `thumbnail.webp` and `thumbnail.avif` (16:10 scene renders).
4. If the page is a Fable `.dc.html` export, rename it to `index.html`, add the “Back to all demos” link (`../../`), and `<script type="module" src="../../portfolio-menu.js"></script>`.
5. Add one object to `site/samples.json` (`slug`, `title`, `tagline`, `tags`, `pitch`, `thumbnail`, `href`, `accent`, `group`).

Paths in that file are relative to the site root. `npm run build` copies `site/` to `dist/`.

## Setup

Requires Node.js 22.

```bash
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:4173/

## Scripts

```bash
npm run typecheck   # parked Worker TypeScript only
npm run test        # Worker unit tests + site/samples/score.test.js
npm run test:e2e    # build dist/ + Playwright (e2e/)
npm run build
npm run preview
```

## Deploy

`.github/workflows/deploy.yml` publishes `dist/` with GitHub Pages when `main` is pushed. Pages is set to **GitHub Actions**. A green pull-request build does not publish.

Asset URLs in the demos are relative, so they work under `/Xr-skilllab/` on the project site.

## Limitations

- Illustrative concepts only. They do not replace induction, a real inspection, or professional advice.
- TwinInspect’s house and findings are fictional; there is no live twin feed.
- No accounts, no analytics, and no contact form.
- No live AI coach. Lessons use rules-based Scenario Coach feedback only.
- A licence file has not been added.

## Further reading

- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) — Implemented / Experimental / Not built, with file + test evidence
- [docs/architecture.md](docs/architecture.md) — static layout and parked folders
- [docs/ai-coach.md](docs/ai-coach.md) — retired Worker vs Scenario Coach
