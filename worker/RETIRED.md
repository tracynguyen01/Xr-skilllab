# Retired

This Cloudflare Worker is retired. It is not deployed.

No GitHub Actions workflow publishes it. The site build copies the static pages and deploys those to GitHub Pages. Do not run `wrangler deploy` from this directory.

The Cloudflare deployment was deleted (former `/coach` URL returns 404). The OpenAI key that once backed this Worker was **revoked by the owner**. Do not treat this folder as a live AI coach.

The lessons do not call this Worker. Coaching inside a lesson comes from that lesson’s own fixed rules (**Scenario Coach** — rules-based). Related TypeScript under `src/domain/` is only used by this parked Worker and its tests — not by `site/`.

Leave this directory (and `src/domain/`) in the repository until the owner approves removal.
