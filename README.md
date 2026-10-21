# XR Concept Lab

An independent educational portfolio of browser-based immersive concept demos. The home page introduces the idea. Each demo is a self-contained page.

The site header and footer use the portfolio name, XR Concept Lab. XR SkillLab is the name of the project. The warehouse lesson is shown as Warehouse Safety.

This is not a Next XR Group product, not an accredited course, and not a certified inspection.

**Developer:** Tracy Nguyen · [github.com/tracynguyen01](https://github.com/tracynguyen01)

The published site is:

https://tracynguyen01.github.io/Xr-skilllab/

The repository name is case-sensitive. Do not deploy this as `/xr-skilllab/`.

## What is on the site

- A landing page with one featured lesson at a time, and a Fields menu for every lesson
- [Warehouse Safety](site/samples/xr-skilllab/index.html), a warehouse safety training concept with a 3D scene, a 2D fallback, scoring, and rule-based coaching. Its URL stays `/samples/xr-skilllab/`
- [Oil & Gas](site/samples/oil-gas/index.html), [Mining](site/samples/mining/index.html) and [Chemical processing](site/samples/chemical-processing/index.html), the same training pattern on fictional industry floors
- [TwinInspect](site/samples/twininspect/index.html), a remote digital-twin home inspection of a fictional property

The three industry lessons score in `content.js`: 15 points for assessing a hazard and 10 more for the preferred action, out of 100. Decoys do not score. The wording is an illustrative scenario, not a site procedure.

The demos are the Fable pages, kept as delivered. Each one loads its own `support.js`, Google Fonts, and Three.js from a CDN.

The AI coach is retired and not deployed. Cloudflare has deleted that Worker, and `https://xr-skilllab-coach.tracynguyen01.workers.dev/coach` returns 404. No workflow publishes it, and the pages do not call it. Coaching in the lessons is rule-based. The old source is still in `worker/` for reference. See [worker/RETIRED.md](worker/RETIRED.md) and [docs/ai-coach.md](docs/ai-coach.md).

## Add a demo

Demos are one folder plus one entry in [`site/samples.json`](site/samples.json).

1. Create `site/samples/<slug>/`.
2. Put the page at `index.html` so the URL is `/samples/<slug>/`. Keep `support.js` and the other scripts beside it, with relative paths such as `./support.js`.
3. Add `thumbnail.webp` and `thumbnail.avif`. Both are a 16:10 render of the scene itself: no browser chrome, no page screenshot, no scrollbar. The landing showcase uses the AVIF when the thumbnail path ends in `.webp`, and falls back to the WebP.
4. If the page is a Fable `.dc.html` export, rename it to `index.html` and add the small “Back to all demos” link already used on the other samples. Point it at `../../`. Add `<script type="module" src="../../portfolio-menu.js"></script>` beside that link so the Fields menu can switch lessons.
5. Add one object to `site/samples.json`:

```json
{
  "slug": "example",
  "title": "Example",
  "tagline": "One line on the card",
  "tags": ["Tag"],
  "pitch": "One or two sentences on the card.",
  "thumbnail": "samples/example/thumbnail.webp",
  "href": "samples/example/",
  "accent": "#42DDC5",
  "group": "training"
}
```

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
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run preview
```

`npm run typecheck` checks the unused Worker. `npm run test` runs its unit tests with a mocked model. `npm run test:e2e` builds the site and runs the Playwright smoke test.

## Deploy

`.github/workflows/deploy.yml` publishes `dist/` with GitHub Pages when `main` is pushed. Pages is set to **GitHub Actions**. A green pull-request build does not publish.

Asset URLs in the demos are relative, so they work under `/Xr-skilllab/` on the project site.

## Limitations

- Illustrative concepts only. They do not replace induction, a real inspection, or professional advice.
- The TwinInspect house and its findings are fictional.
- No accounts, no analytics, and no contact form.
- The AI coach is retired and not deployed. The lessons use rule-based coaching.
- A licence file has not been added.
