# Turn on the AI coach

The published pages do not call this Worker. The site is a static portfolio of concept demos. The Worker remains in `worker/` for the earlier warehouse coach, and it is not part of the current pages.

The Worker is deployed. Its URL is:

```text
https://xr-skilllab-coach.tracynguyen01.workers.dev/coach
```

The workers.dev subdomain is `tracynguyen01`. The model in use is `gpt-4o-mini`. The website shows **AI coaching (beta)** when the GitHub Actions variable `VITE_COACH_API_URL` is that URL at build time. A deploy that does not include the variable still shows only the offline Scenario Coach.

The browser never holds an API key. The Worker checks a small JSON result, then calls the model with a key that stays in Cloudflare.

You need:

- a Cloudflare account (the free plan is enough to deploy the Worker)
- an account with an OpenAI-compatible chat API, and a spending limit set there
- about fifteen minutes

You do **not** commit the key, and you do not put it in GitHub.

## What the Worker accepts

`POST /coach` accepts only this shape:

```json
{
  "scenarioId": "warehouse-safety-v1",
  "score": 25,
  "outcomes": [
    { "hazardId": "blocked-exit", "choiceId": "report" },
    { "hazardId": "floor-spill", "choiceId": null },
    { "hazardId": "unstable-load", "choiceId": null },
    { "hazardId": "forklift-crossing", "choiceId": null }
  ]
}
```

`choiceId` is `null` when that hazard was not assessed, or one of the ids already in `src/domain/hazards.ts`. There is no free-text field. The Worker scores those ids with the same `scoreAttempt` function as the site. If `score` does not match, the request is rejected. The model is not allowed to return a score. The page keeps the number from the browser.

The reply is three short lines: what went well, what to practise, and one next step.

## 1. Create a Cloudflare account

1. Open [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2. Create the account with your own email.
3. Confirm the email. You do not need to buy a domain.

## 2. Log in from this repository

Install Node.js 22 if you do not have it. Wrangler 4, which `npx wrangler` installs, needs Node.js 22. An older Node fails before the Worker deploys. From the repository root:

```bash
npm ci
npx wrangler login
```

A browser window opens. Approve the login. Wrangler stores the token on your machine, not in the repo.

Later commands run from the `worker/` directory, because that is where `wrangler.toml` lives:

```bash
cd worker
```

## 3. Set a spending limit at the model provider

Do this **before** you deploy the key. The Worker has its own daily cap, but a public URL can still be called by someone other than the website. The provider limit is what stops a surprise bill.

- **OpenAI:** [https://platform.openai.com/settings/organization/limits](https://platform.openai.com/settings/organization/limits). Set a monthly budget.
- **OpenRouter:** [https://openrouter.ai/settings/credits](https://openrouter.ai/settings/credits). Add a small credit balance instead of a large one.
- **Groq:** [https://console.groq.com/settings/limits](https://console.groq.com/settings/limits). Keep the org limit low while you try the demo.
- **xAI:** [https://console.x.ai](https://console.x.ai). In billing, set a limit or start with a small prepaid balance.

Create an API key in that dashboard. Leave the key on your clipboard for the next step. Do not paste it into chat, a GitHub issue, or a file.

## 4. Store the key as a Worker secret

From `worker/`:

```bash
npx wrangler secret put AI_API_KEY
```

Paste the key when asked, then press Enter. Wrangler uploads it to Cloudflare. It is not written into `wrangler.toml`.

Check you did not leave the key behind:

```bash
git status
```

That command should not list a new `.env`, `.dev.vars`, or key file. `.dev.vars` is gitignored on purpose. Do not force-add it.

## 5. Choose the model

`AI_BASE_URL` is the root that already ends in `/v1`. The Worker adds `/chat/completions`. `AI_MODEL` is that provider's model id. `AI_DAILY_CAP` is a whole number from 1 to 1000. Start with `20`.

Use `gpt-4o-mini` for OpenAI. The Worker sends `max_tokens` and `temperature`. Current gpt-5 models reject those fields, so a gpt-5 id returns an error and the page falls back to the offline Scenario Coach. Stay on `gpt-4o-mini` unless the Worker code is changed to match a newer request shape.

Set them in the Cloudflare dashboard: **Workers & Pages → xr-skilllab-coach → Settings → Variables**. Add each name as plain text, not as a secret (the URL and model id are not secret; the key is).

Or uncomment the `[vars]` block in `worker/wrangler.toml`, edit it, and deploy. That file is committed, so only put the URL, the model id, and the cap there. Never put `AI_API_KEY` there.

Examples:

| Provider | `AI_BASE_URL` | `AI_MODEL` (check the provider's current list) |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| OpenRouter | `https://openrouter.ai/api/v1` | `openai/gpt-4o-mini` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| xAI | `https://api.x.ai/v1` | `grok-2-latest` |

The URL must be `https`. The Worker refuses `http`.

## 6. Deploy the Worker

From `worker/`:

```bash
npx wrangler deploy
```

This Worker is already deployed. Run `npx wrangler deploy` again after a code change. GitHub Pages does not publish the Worker. The command prints a URL on the account subdomain. For this project that subdomain is `tracynguyen01`, and the site needs the `/coach` path on the end:

```text
https://xr-skilllab-coach.tracynguyen01.workers.dev/coach
```

The Worker only answers browser calls whose `Origin` is `https://tracynguyen01.github.io`.

### If every request returns 502

Two causes show up before the model reply is usable.

**Illegal invocation.** Cloudflare's `fetch` throws `TypeError: Illegal invocation` when it is copied onto another object and called as a method, because `this` is no longer the Workers runtime. The handler must call it as a free function:

```ts
fetch: deps?.fetch ?? ((input, init) => fetch(input, init)),
```

`fetch: deps?.fetch ?? fetch` looks equivalent and is not. That line makes every real request return 502. A unit test installs a fetch that throws when `this` is some other object, then calls the handler without a mock fetch.

**gpt-5 request fields.** The outbound body sets `max_tokens` and `temperature`. gpt-5 chat models reject those. `AI_MODEL` for this deployment is `gpt-4o-mini`.

### Limits

Each IP address gets **5 requests**, then **one more per minute**. That counter is a token bucket.

`AI_DAILY_CAP` counts calls that are about to reach the model, in UTC days.

`worker/wrangler.toml` binds the KV namespace `COACH_LIMITS` (id `61b4d775bf86494ea78da40c6962bd54`). That id is not a secret. The account id is not in the file. Isolates share the per-IP bucket and the daily cap through this namespace. Without the binding, both counters would live in memory inside one isolate and would reset when a new isolate starts.

The provider spending limit still matters, because IP limits can be avoided. To start over on a new account, `npx wrangler kv namespace create COACH_LIMITS` prints a new id. Put that id in `wrangler.toml` and deploy again.

The Worker does not write request or response bodies to logs.

## 7. Point the website at the Worker

The site reads `VITE_COACH_API_URL` when GitHub Actions builds it. That value is a public URL, so it is a repository **variable**, not a secret.

1. Open the GitHub repository `tracynguyen01/Xr-skilllab`.
2. Go to **Settings → Secrets and variables → Actions → Variables**.
3. Add a variable named `VITE_COACH_API_URL`.
4. Set the value to `https://xr-skilllab-coach.tracynguyen01.workers.dev/coach`.

## 8. Publish the site again

You do not need a code change.

1. Open the **Actions** tab.
2. Choose **Deploy GitHub Pages**.
3. Click **Run workflow** on `main`.

Wait until that run is green. The results page then shows **AI coaching (beta)** with a button. The score on the page is still the rules score. The button asks the Worker for a second reading. If the Worker or the model fails, the page keeps the offline Scenario Coach and does not show an error.

Read a few replies yourself before you leave it on. Check that they stay inside the four hazards and do not hand out a certificate.

## 9. Turn it off

Either step is enough to stop new coaching. Do both if you want the button gone and the model unreachable.

1. In GitHub, delete `VITE_COACH_API_URL` (or set it to an empty value) and run **Deploy GitHub Pages** again. The next build has no coach button.
2. In Cloudflare, disable the Worker or delete the `AI_API_KEY` secret (`npx wrangler secret delete AI_API_KEY`). Calls stop even if someone still has an old copy of the page. GitHub Pages may serve the previous JavaScript for about ten minutes.

The offline Scenario Coach does not use the Worker, so the exercise still scores and explains the result.
