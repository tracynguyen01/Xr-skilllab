# XR Concept Lab

An independent educational portfolio of browser-based immersive concept demos. The home page introduces the idea. Each demo is a self-contained page.

The site header and footer use the portfolio name, XR Concept Lab. The warehouse demo keeps its own name, XR SkillLab, on its page.

This is not a Next XR Group product, not an accredited course, and not a certified inspection.

**Developer:** Tracy Nguyen · [github.com/tracynguyen01](https://github.com/tracynguyen01)

The published site is:

https://tracynguyen01.github.io/Xr-skilllab/

The repository name is case-sensitive. Do not deploy this as `/xr-skilllab/`.

## What is on the site

- A landing page that lists the demos
- [XR SkillLab](site/samples/xr-skilllab/index.html), a warehouse safety training concept with a live 3D scene, a 2D fallback, scoring, and coaching
- [TwinInspect](site/samples/twininspect/index.html), a remote digital-twin home inspection of a fictional property

The demos are the Fable pages, kept as delivered. Each one loads its own `support.js`, Google Fonts, and Three.js from a CDN.

`worker/` is an optional Cloudflare coach from an earlier version of the warehouse demo. **The current pages do not call it.** There is no `VITE_COACH_API_URL`. See [docs/ai-coach.md](docs/ai-coach.md) only if that Worker is brought back.

## Add a demo

Demos are one folder plus one entry in [`site/samples.json`](site/samples.json).

1. Create `site/samples/<slug>/`.
2. Put the page at `index.html` so the URL is `/samples/<slug>/`. Keep `support.js` and the other scripts beside it, with relative paths such as `./support.js`.
3. Add `thumbnail.webp` and `thumbnail.avif`. Both are a 16:10 render of the scene itself: no browser chrome, no page screenshot, no scrollbar. The card uses the AVIF when the thumbnail path ends in `.webp`, and falls back to the WebP.
4. If the page is a Fable `.dc.html` export, rename it to `index.html` and add the small “Back to all demos” link already used on the other samples. Point it at `../../`.
5. Add one object to `site/samples.json`:

```json
{
  "slug": "example",
  "title": "Example",
  "tagline": "One line on the card",
  "tags": ["Tag"],
  "thumbnail": "samples/example/thumbnail.webp",
  "href": "samples/example/",
  "accent": "#42DDC5"
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
- The AI coach Worker is not used by these pages.
- A licence file has not been added.
