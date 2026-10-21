# AI coach

The AI coach is retired and not deployed.

The Cloudflare Worker that used to answer `https://xr-skilllab-coach.tracynguyen01.workers.dev/coach` has been deleted. That address returns 404. No GitHub Actions workflow publishes a Worker. The site build does not set `VITE_COACH_API_URL`, and the pages do not call a coach API.

Coaching in the lessons is rule-based. A training lesson explains the result from the fixed rules in that lesson. A model is not asked for a score or a comment.

The old Worker source is still in `worker/` so it can be typechecked. It is not part of the published site. See [worker/RETIRED.md](../worker/RETIRED.md). Do not deploy it.
