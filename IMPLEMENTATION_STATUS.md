# Implementation status

The published site is a static portfolio. The previous React training app has been removed. Two Fable concept demos are served as their own pages.

## Implemented

- Landing page at the site root, in the Fable visual language: Manrope, navy and teal tokens, the same button, card, and header rhythm
- Demo list driven by `site/samples.json`
- XR SkillLab warehouse demo at `samples/xr-skilllab/`
- TwinInspect fictional home-inspection demo at `samples/twininspect/`
- “Back to all demos” on each sample, fixed so it does not reflow the page
- Honest footer: Tracy Nguyen, github.com/tracynguyen01, not affiliated with Next XR Group, fictional demo data
- Playwright smoke test for both cards, navigation, console errors, and overflow at 390 and 1280
- GitHub Actions still builds `dist/` and deploys GitHub Pages
- `worker/` remains in the repository and still typechecks. The pages do not call it

## Not part of the current pages

- The React routes, A-Frame warehouse, hash router, and Vite build
- `VITE_COACH_API_URL`
- The optional AI coach on the results page

Old addresses such as `/#/simulate` open the new home page, because the site no longer has a client router.

## Tested

Local commands on 19 October 2026, Node 22. CI repeats the Playwright smoke test.

| Command | What it covers |
|---|---|
| `npm run typecheck` | The unused Worker |
| `npm run test` | Worker schema, limits, and a mocked provider |
| `npm run test:e2e` | Home cards, both sample pages, overflow at 390 and 1280 |

The live site updates when this is merged to `main` and Deploy GitHub Pages succeeds.

## Deferred

- A third demo, added with the steps in the README
- Turning the unused Worker back on for a demo
- A repository licence chosen by the owner
