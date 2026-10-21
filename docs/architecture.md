# Architecture

XR Concept Lab is a static portfolio. The warehouse sample is still branded XR SkillLab on its own page. GitHub Pages serves the files. There is no application server in the request path.

```text
Visitor's browser
┌──────────────────────────────────────────────┐
│ site/index.html                              │
│   reads site/samples.json                    │
│   one featured lesson, plus a Fields menu    │
│ samples/xr-skilllab/                         │
│   index.html + support.js + warehouse.js     │
│ samples/oil-gas/  mining/  chemical-processing/ │
│   index.html + support.js + scene.js         │
│   content.js holds hazards and the score     │
│ samples/twininspect/                         │
│   index.html + support.js + home.js          │
│ Three.js from jsDelivr, fonts from Google    │
└──────────────────────────────────────────────┘
                    │
                    ▼
             GitHub Pages
             /Xr-skilllab/
```

Each demo is a Fable page. `support.js` is its runtime and loads React from unpkg. Scripts beside the page use relative URLs (`./support.js`, `./warehouse.js`, `./home.js`), so a folder can move without rewriting paths. The CDN URLs are absolute and public.

`worker/` is a Cloudflare Worker for an earlier coach. It is not imported by the pages, and the deploy workflow does not publish it. The score and the report inside each demo stay inside that page.

## Adding a demo

Add `site/samples/<slug>/` and one object in `site/samples.json`. The landing carousel and the Fields menu both render whatever that list contains. See the README.

## What is intentionally absent

- No Next XR branding
- No API key in the repository
- No call from these pages to the coach Worker
- No accounts, analytics, or saved personal data
- No measured claim that a demo improves real work
