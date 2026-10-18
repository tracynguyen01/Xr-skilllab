# XR SkillLab — Master Product Requirements Document & Grokbot Build Instructions

**Version:** 1.0  
**Prepared:** 18 October 2026  
**Status:** Ready for implementation after repository configuration  
**Project classification:** Independent, educational portfolio prototype (not a Next XR Group product)  
**Primary hosting:** GitHub Pages  
**Intended implementer:** Grokbot, acting as an autonomous full-stack coding assistant  
**Primary builder/owner:** `[DEVELOPER_NAME — TO BE PROVIDED]`  
**Repository:** `[GITHUB_REPO_URL — TO BE PROVIDED]`

> **Important for Grokbot:** This is a build specification, not a loose brainstorm. Read the whole document before editing the repository. Implement the P0 requirements first, actually run the app and tests, and provide proof of a working deployment. The user will supply their GitHub repository details and optional identity/branding details. Do not block progress on optional missing information. Never invent repository URLs, company endorsements, benchmark results, or successful deployments.

---

# 0. EXECUTION DIRECTIVE FOR GROKBOT

## 0.1 Your mission

Design, implement, test, document, and deploy **XR SkillLab**, a premium-looking, interactive browser-based AI + immersive learning product demonstration. It must be a *real working experience* rather than a static landing page or a collection of placeholder screenshots.

The target demo is:

**Open website → launch a simulated warehouse → find safety hazards → choose actions → receive scored results → receive personalised coaching → understand the project's architecture and developer's contribution.**

The project must be achievable by a beginner/university-level AI/ML intern over an approximately 12-week period, with AI-assisted development, and must double as a credible professional portfolio project for future AI/software roles.

It must align conceptually with the public themes of Next XR Group — immersive learning, XR, industrial/workplace training, AI, simulation, and SaaS — **without representing an affiliation, client relationship, access to proprietary intellectual property, company endorsement, or ownership of Next XR technology**.

## 0.2 Instruction priority

1. Safety, legality, privacy, intellectual property, and actual hosting limitations.
2. Instructions explicitly provided by the repository owner in the current conversation.
3. This document's acceptance criteria and P0 scope.
4. Existing repository conventions where compatible and not broken.
5. Design polish and optional enhancements.

If the existing repo already contains useful functioning code, integrate and preserve it. Do not wipe an existing site just because a greenfield app would be simpler. Before destructive or breaking changes, produce a short migration plan and confirm if changes cannot be safely reversed.

## 0.3 Information the owner will provide

Use explicit configuration values supplied later; do not hardcode guessed values:

| Setting | Placeholder | Default/behaviour until supplied |
|---|---|---|
| GitHub username or organisation | `[GITHUB_OWNER]` | Keep as placeholder in docs |
| Repository name | `[REPO_NAME]` | `xr-skilllab` for local scaffolding only |
| Repository URL | `[GITHUB_REPO_URL]` | No fake link |
| GitHub Pages type | `[PROJECT_SITE / USER_SITE / CUSTOM_DOMAIN]` | Infer from real repo after inspecting it |
| Default branch | `[DEFAULT_BRANCH]` | Detect; don't assume `main` |
| Product display name | `[PROJECT_NAME]` | **XR SkillLab** |
| Developer display name | `[DEVELOPER_NAME]` | **Independent developer** |
| Portfolio/GitHub profile link | `[PROFILE_URL]` | Hide button until real value supplied |
| Contact email | `[CONTACT_EMAIL]` | Hide email/contact form until real value supplied |
| Project status | `[PROJECT_STATUS]` | **Independent educational prototype** |
| Company reference approval | `[COMPANY_REFERENCE_PERMISSION]` | No company logos, employee testimonials, or employer endorsement |
| AI API provider, model | `[AI_PROVIDER]`, `[AI_MODEL]` | Offline rules-based coach (working default) |
| Worker URL | `[AI_WORKER_URL]` | No AI network calls; use local coach |
| Custom domain | `[DOMAIN]` | Use GitHub Pages hostname only after deployment verified |

**Never request secrets in chat or commit them to the repository.** If an AI service is activated later, instruct the owner to provision secrets via the provider's secure dashboard/CLI.

## 0.4 Working method

On each implementation phase:

1. Inspect project structure, git state, package manager, default branch and hosting config.
2. Identify the smallest demonstrable increment that satisfies the next set of acceptance criteria.
3. Implement working code, rather than a mockup falsely presented as functional.
4. Run linting, tests and a production build locally or in CI; resolve failures.
5. Verify desktop and mobile behaviour where tooling permits; use real browser/screenshot inspections if available.
6. Commit logically with meaningful messages when permitted.
7. Update `IMPLEMENTATION_STATUS.md` with implemented, tested, deferred and blocked items.
8. Report exactly what works, where it can be opened, and what remains incomplete.

**Do not claim a feature is complete if it is just a nonfunctional button or hardcoded example. Do not claim GitHub Pages is live before checking its deployed URL. Do not claim a user's performance improved unless measurements exist.**

## 0.5 Definition of the first truly useful deliverable

The first public deployment should already allow a visitor to complete a full training loop, with no paid accounts and no backend:

- Loading homepage with a clear value proposition.
- Entering a working scene or documented accessible 2D equivalent.
- Interacting with four defined hazards.
- Choosing what to do about each hazard.
- Ending the exercise and receiving an honestly calculated score.
- Getting useful scenario-specific coaching generated from deterministic rules.
- Restarting the exercise.

The AI API and headset experience can be added *after* this works. This sequencing is mandatory.

---

# 1. EXECUTIVE PRODUCT BRIEF

## 1.1 Product name and positioning

**Working name:** XR SkillLab  
**Tagline:** **Experience. Practise. Learn with AI.**  
**Hero headline:** **Learn by doing, not just watching.**  
**Supporting sentence:** *Explore an interactive workplace, make safety decisions, and receive personalised feedback on your performance.*  
**Primary call to action:** `Start the Simulation`  
**Secondary call to action:** `See How It Works`

XR SkillLab is an **independent browser-based prototype** showing how interactive immersive training, structured assessment and AI-generated coaching can work together. It is not an accredited safety course and is not a commercially delivered enterprise XR platform.

## 1.2 Problems addressed

Traditional training is often passive: reading slides, watching videos and answering generic quizzes. Learners may struggle to practise spotting problems in context or understanding *why* a decision is right or wrong. Full XR installations can also require specialist devices. XR SkillLab demonstrates a more accessible approach: a desktop-first interactive simulation, contextual decisions, transparent scoring and coaching.

Do not make unsubstantiated claims such as “proven to reduce incidents by 80%.” Present benefits as **hypotheses to evaluate**, not facts.

## 1.3 Three purposes of this project

**Purpose A — Working portfolio evidence:** Demonstrate rapid learning, software delivery, applied AI, XR/3D fundamentals, tests and product thinking for a beginner-level AI/ML intern.

**Purpose B — Relevant industrial domain:** Connect meaningfully to publicly described immersive workforce training, simulation and AI priorities in companies such as Next XR Group, while keeping the project independent.

**Purpose C — Future extensibility:** Enable additional simulations later (virtual science lab, customer communication, workplace onboarding), without building a multi-industry SaaS platform now.

## 1.4 Audiences

1. **Technical reviewers and hiring managers**: need a working demo and evidence the developer knows how it is built.
2. **Nontechnical product stakeholders**: need to understand use cases and business value within 60 seconds.
3. **Learners/demo visitors**: need a short, intuitive and enjoyable training experience without registration.
4. **The student developer**: needs code and documentation they can independently explain during an interview.

## 1.5 Core product promise

A first-time visitor should understand the concept in **under 15 seconds**, interact with the product **within 60 seconds**, and complete the main experience in approximately **2–4 minutes**. Time goals are design targets, not externally validated results.

---

# 2. STRATEGIC FIT, CREDIBILITY AND ETHICAL BOUNDARIES

## 2.1 Alignment with publicly stated industry needs

Next XR Group's publicly described areas include AI/ML, digital twins, intelligent AI agents, extended reality, workforce simulation, workplace safety and SaaS. XR SkillLab should demonstrate broadly relevant skills:

- Implementing an interactive simulated environment.
- Translating user events into auditable evaluation data.
- Delivering accurate and intelligible feedback.
- Building reusable, understandable components rather than one-off demos.
- Measuring latency, correctness, usability and accessibility.
- Shipping a hosted end-to-end experience with working CI/CD.

This is **strategic thematic alignment**, not a claim that Next XR Group requested, owns, recommends or uses XR SkillLab.

## 2.2 Employment and IP safeguards

- Prefer developing the prototype in a **personal repository**, with personal devices/accounts, outside employment work unless the internship supervisor approves an official project.
- Ask the intern to review internship/employment agreements, confidentiality obligations and invention/IP assignment terms *before* publishing a side project that overlaps employer work.
- Never copy employer code, scene assets, internal prompts, customer data, project specifications, screenshots or unreleased information.
- Do not show Next XR Group logo/branding or use “Official partner,” “Built for Next XR,” “Trusted by Next XR,” etc. unless expressly and lawfully authorised.
- Do not fabricate a recommendation, work history, client relationships or company endorsement.
- A factual internship mention may appear in the personal About section **only if true and appropriate to disclose**, clearly distinguished from project ownership.
- Include this visible footer: **“XR SkillLab is an independent educational demonstration. It is not affiliated with or endorsed by Next XR Group or any safety regulator.”**
- Include: **“Training scenarios are illustrative and do not replace workplace induction, accredited training, emergency procedures or professional safety advice.”**
- Treat public Github Pages as a portfolio/showcase deployment, not the long-term hosting of a paid SaaS offering.

## 2.3 Hiring value

The developer should be able to articulate:

- Which real problem inspired the product.
- What they learned independently.
- Why they chose A-Frame, React and deterministic scoring.
- Which parts are genuinely AI-powered and which are simple rules.
- How they tested AI outputs rather than blindly trusting them.
- How they delivered and deployed the app.
- What a future enterprise-grade version would need (authentication, audit logs, consent, assessment validation, security, expert review, deployment monitoring).

The story must reflect work *actually done*, not skills or results generated out of thin air.

---

# 3. SCOPE AND PRIORITISATION

## 3.1 P0 — Must ship first (minimum lovable product)

- A premium, responsive homepage and simple consistent navigation.
- A fully usable **Warehouse Safety Challenge** with one simulation scene.
- Four discoverable hazards, each with meaningful action choices.
- At least two non-hazard background objects to make exploration real.
- Scene instructions, progress indicator, timer (informational only) and exit/reset controls.
- Transparent scoring with hazard-by-hazard explanations.
- A working offline/rules-based coaching feature; clearly label it as **Scenario Coach** rather than implying an LLM is live.
- Dedicated results page with strengths, missed hazards and retry.
- Accessible 2D alternative that works without 3D rendering, motion or a VR device.
- A short How It Works page with architecture explanation.
- A Project/Build Story page with honest implementation notes.
- About/contact area (no fake personal data).
- GitHub Pages deployment, working reload-safe routing, README, CI build and tests.
- No login, no payment, no mandatory cookies, no personal data capture.

## 3.2 P1 — Strong differentiators after P0 is robust

- Optional **genuine LLM-generated** coaching via a separate secure Worker; graceful offline fallback.
- Better 3D models, environmental polish, guided highlights and subtle transitions.
- Additional optional training scenario *only if first scenario is fully tested*.
- Export results as a local file (`.json` or printable page), without sending them to a server.
- User study with consenting volunteers and documented results.
- Optional VR mode on tested compatible headset/browser; never required.
- Recorded 60–90 second demo video if creator can record one.
- Better performance instrumentation and evaluation report.

## 3.3 P2 — Future roadmap, not a 12-week commitment

- Real instructor/trainee accounts and role-based access.
- Multi-tenant SaaS and billing.
- LMS/LTI/SCORM integrations.
- Authoring tool for arbitrary training scenes.
- Persistent learner history and team dashboards.
- Speech input, avatars, voice coaching or multimodal AI.
- Enterprise SSO, governance, incident-grade audit trails.
- VR hardware fleet management or Unity application.
- Real safety certification and regulatory compliance assertions.

## 3.4 Explicit non-goals

Do not build a general-purpose ChatGPT clone, blockchain badges, an enormous multi-scene open world, a custom-trained LLM, a complex database, or a full digital twin. Do not spend multiple weeks on animations before the training interaction is functional. Do not implement fake dashboard data that could be mistaken for real student/customer performance.

---

# 4. END-TO-END USER JOURNEY

## 4.1 Sixty-second demonstration flow

1. **0–10 sec: Understand.** Visitor sees headline, a real scene preview, a short explanation and `Start the Simulation`.
2. **10–20 sec: Begin.** A one-screen overlay says: “Inspect the scene. Find four hazards. Click a hazard and choose the safest response.” Buttons: `Start`, `Use accessible 2D mode`.
3. **20–50 sec: Explore.** Visitor navigates a browser 3D environment using drag/arrow keys or clicks accessible scene hotspots, selects a hazard and chooses an action. A progress indicator shows `1 / 4 hazards assessed`.
4. **50–60 sec: Reward.** Visitor can finish early or continue; the exercise remains short. Results and scenario-specific coaching are available without registration.

Do not force the experience into exactly 60 seconds. The goal is **first meaningful evidence of value** within a minute; users can take 2–4 minutes to finish.

## 4.2 Full experience state machine

`landing → instructions → exploring → hazard-selected → answering → feedback → exploring → summary → retry/leave`

- `Start` begins a new session and resets the timer.
- Selecting a hazard displays a clear, dismissible panel with title, context, 3 possible actions.
- Selecting an action records a **final answer for that hazard** and displays accurate concise feedback.
- User returns to scene for remaining hazards.
- `Finish Assessment` shows completed and missed items. Ending early is allowed but scored as incomplete.
- `Try Again` resets answers, session state and timer. No stale marks.
- Repeated clicking cannot increase score beyond the single hazard's weight.
- On navigation away, user may return to the same session in the same browser tab; this persistence is optional but predictable.

## 4.3 Failure/fallback paths

- If WebGL fails: automatically offer **2D hazard inspector**, not a broken blank area.
- If mobile graphics are poor: default to 2D/card view with optional “Try 3D”.
- If the AI Worker is unavailable/rate-limited: provide the complete local Scenario Coach and transparent “AI coach unavailable” status.
- If no answers are given: report 0/100, explain how to retry, never throw an exception.
- If local storage is unavailable: continue in memory without crashing.
- If VR is unavailable: no broken “Enter VR” button; hide or disable with explanation.

---

# 5. FLAGSHIP SIMULATION: WAREHOUSE SAFETY CHALLENGE

## 5.1 Training intent

This is an **illustrative awareness exercise**, not workplace qualification or a formal hazard risk assessment. The visitor explores a stylised warehouse and identifies four common unsafe conditions. Specific recommended actions must be reviewed by a suitably qualified safety professional before any use as authoritative training guidance.

**Scene:** small low-poly warehouse with shelving, pallet racks, a marked pedestrian path, a delivery area, forklift, fire/exit signage and a workbench. Aim for immediate visual clarity, not photorealism.

**Four scored hazards:**

| ID | Hazard | Visible clue | Best illustrative decision | Feedback concept |
|---|---|---|---|---|
| `blocked-exit` | Emergency exit obstructed by boxes | Exit door and boxes in its path | Keep exit route clear; report/arrange safe removal in line with site procedures | Emergency egress routes must remain accessible |
| `floor-spill` | Liquid spill near pedestrian route | Contrasting puddle and warning-worthy location | Isolate/mark the area and follow approved spill-response procedure | Slips and falls can result from unmanaged spills |
| `unstable-load` | Poorly stacked pallets | Tilted boxes/pallet overhang | Restrict access and report/escalate unstable stacking for safe correction | Falling objects/unstable loads are hazards |
| `forklift-crossing` | Pedestrian–forklift route conflict | Forklift near unprotected walkway | Use designated separated crossings and site traffic controls | Pedestrian/vehicle separation reduces collision exposure |

**Non-hazard / decoy items:** a secured fire extinguisher, clear marked aisle or correctly stacked cartons. These are interactive inspection items labelled “No issue found here” and do not award points. Avoid making safety claims about items not reviewed.

## 5.2 Action choices and rubrics

Every scored hazard has exactly three actions for the P0 prototype:

- One **preferred** action from the reviewed illustrative scenario guidance.
- One ineffective action (ignores the issue).
- One potentially unsafe action (increases exposure).

Provide explanatory feedback for *every* option, not just the correct one. The user must see what they selected and why it did or did not match the scenario rubric. Avoid advising untrained people to perform hazardous tasks.

**Example: blocked-exit**

- A. “Move past the boxes; the exit will probably be usable when needed.” → incorrect.
- B. “Flag the obstruction and have the exit route made clear under site procedure.” → correct illustrative answer.
- C. “Lock the exit so no one tries to use it.” → incorrect.

## 5.3 Objective scoring

Use a simple and transparent deterministic scoring model, with exactly 100 available points:

- **4 hazards × 25 points** each.
- **15 points** for correctly identifying/selecting a real hazard.
- **10 points** for choosing the rubric's correct response.
- Unselected hazards: 0 points.
- Selected hazard with incorrect response: 15 points; correct response: 25 points.
- Time spent does **not** affect the score.
- Decoy clicks do not earn or lose points.
- Repeated clicks on the same hazard do not generate additional points.
- Each hazard is scored **once** on the first submitted response; `Try Again` starts a genuinely new attempt.
- Progress measures assessed hazards, not clicked decoys.

**Examples:**

- 4 identified, 4 correct responses → 100/100.
- 4 identified, 2 correct → 80/100.
- 3 identified, 2 correct → 65/100.
- 0 identified → 0/100.

The result should show a simple breakdown, not a magical “AI safety competency grade.” Sample labels (explicitly prototype labels): `Great start`, `Keep practising`, `Review these hazards`. Avoid “Certified” or “Safety qualified”.

## 5.4 Hazard data model

Store scenario content in typed configuration files, not scattered JSX conditionals. Example:

```ts
type Hazard = {
  id: string;
  title: string;
  shortDescription: string;
  educationalExplanation: string;
  hotspot: { x: number; y: number; z: number }; // adjustable after scene assembly
  choices: { id: string; label: string; feedback: string }[];
  correctChoiceId: string;
  rubricVersion: string;
};

// Example only; align wording to actual reviewed scenario content.
const blockedExit: Hazard = {
  id: 'blocked-exit',
  title: 'Blocked Emergency Exit',
  shortDescription: 'Boxes obstruct a marked exit route.',
  educationalExplanation: 'Accessible exit routes matter in an emergency.',
  hotspot: { x: 3, y: 1.3, z: -5 },
  choices: [
    { id: 'ignore', label: 'Keep working and ignore it', feedback: '...' },
    { id: 'report', label: 'Flag it and follow the site procedure to clear the route', feedback: '...' },
    { id: 'lock', label: 'Lock the exit', feedback: '...' },
  ],
  correctChoiceId: 'report',
  rubricVersion: 'demo-v1',
};
```

Do **not** assume placeholder coordinates are correct. Position and visually test actual hotspots.

## 5.5 Event/session data model

```ts
type HazardAnswer = {
  hazardId: string;
  choiceId: string;
  selectedAt: string; // ISO timestamp
};

type Attempt = {
  attemptId: string; // ephemeral random UUID; local only
  scenarioId: 'warehouse-safety-v1';
  scenarioVersion: string;
  startedAt: string;
  endedAt?: string;
  answers: Record<string, HazardAnswer>;
  inspectedDecoyIds: string[];
  mode: '3d' | '2d';
};

type AssessmentResult = {
  score: number; // 0..100
  identifiedHazards: number;
  correctActions: number;
  totalHazards: 4;
  details: Array<{
    hazardId: string;
    identified: boolean;
    selectedChoiceId?: string;
    correct: boolean;
    points: number;
    explanation: string;
  }>;
};
```

Use local state for the attempt; optionally `sessionStorage` for a same-tab reload. Do not store legal names, emails, addresses, geolocation, employer details, or personally identifying notes.

## 5.6 Scene interaction implementation

Use A-Frame or an equivalent modest WebXR-capable library. Preferred P0 implementation:

- Intro scene rendered as a small and performant low-poly warehouse.
- Camera with mouse-drag/look and simple navigation; provide explicit on-screen guidance.
- Four visible, appropriately placed click targets (3D hotspot rings or outlines).
- A semantic HTML assessment panel overlaid outside the 3D canvas; use ordinary accessible buttons/radios.
- Completed hazard indicators change appearance and cannot be scored again.
- At least two decoy inspectables that do not count as hazards.
- `2D Inspector` button present throughout, with equal assessment content and scoring.
- Keyboard controls to move between hazards in 2D mode; visible focus styling.
- Do not require visitors to walk around with WASD if point-and-click/orbit inspection is simpler.
- Avoid collisions, physics engines, complex animated NPCs and heavy downloaded asset bundles for P0.

## 5.7 Content standards

- The content is fictional and illustrative.
- Any references to local regulatory requirements must be reviewed and sourced before publication; avoid claims of Australian WHS compliance.
- Every safety explanation has a source/reference field in the configuration for eventual expert review.
- Do not call an LLM-generated explanation “official guidance.”
- Avoid immersive scenes that cause discomfort: default to stationary/orbit camera, minimal motion, no flashing lights.

---

# 6. COACHING: RULES FIRST, OPTIONAL REAL AI SECOND

## 6.1 P0 Scenario Coach (must always work)

This coach operates completely within the static site and **does not call an LLM**. Based on `AssessmentResult`, it produces:

1. An accurate result summary, e.g. “You identified 3 of 4 hazards and chose the preferred action for 2.”
2. A strength associated with a correctly answered hazard (or an encouraging neutral note if none).
3. Specific missed hazards or incorrect action choices with fixed, reviewed educational explanations.
4. One focused recommendation for the next attempt, e.g. “Look for hazards around emergency routes.”
5. A clear `Try Again` button.

The UI should call this **Scenario Coach** or **Instant Feedback**, never “GPT-powered” when it is not.

## 6.2 P1 AI Coach (only with a genuinely working backend)

Enhance the coach by sending **structured, nonpersonal assessment results** to an external serverless Worker. The Worker securely calls a chosen LLM to rewrite approved findings into concise, friendly, personalised coaching.

Keep the deterministic scoring/rubric as the source of truth. **AI must not change the score, invent learner behaviours, decide what safety action is officially correct, or claim certification.**

### Backend architecture

`GitHub Pages static frontend → Cloudflare Worker (or approved alternative) → LLM API`.

Front-end must NOT contain an API key. Use secrets in the Worker environment. Do not deploy an unauthenticated, uncapped expensive LLM endpoint to a public website. Enforce request-size limits, response-length limits, sensible per-IP and global rate/cost limits, origin checks, upstream timeouts and graceful fallback. CORS alone is not an abuse-control mechanism; IP-based rules may be evaded, so impose a provider-level budget cap as well.

### API contract (suggested, adjust implementation as needed)

`POST /api/coach`

Request:

```json
{
  "scenarioId": "warehouse-safety-v1",
  "rubricVersion": "demo-v1",
  "score": 65,
  "identifiedHazards": 3,
  "correctActions": 2,
  "items": [
    { "hazardId": "blocked-exit", "identified": true, "correct": true },
    { "hazardId": "floor-spill", "identified": true, "correct": false },
    { "hazardId": "unstable-load", "identified": false, "correct": false },
    { "hazardId": "forklift-crossing", "identified": true, "correct": true }
  ],
  "language": "en-AU"
}
```

Response:

```json
{
  "source": "llm",
  "headline": "Good observation skills—now strengthen your response choices.",
  "summary": "You identified three of four scenario hazards...",
  "strengths": ["You recognised the blocked exit."],
  "improvements": ["Review the unstable load near the shelves."],
  "nextStep": "Try again and inspect the pallet area first.",
  "disclaimer": "Illustrative learning feedback, not a formal safety assessment."
}
```

### AI implementation safeguards

- Do not allow unrestricted user chat in V1. Structured result-to-coaching only.
- Validate request and response schemas with Zod or similar.
- Maintain a server-side allowlist of scenario IDs and expected hazard IDs; ignore any client-supplied untrusted training guidelines.
- Ideally recompute or independently validate submitted scoring fields from canonical answer data when applicable; never trust scores submitted as authority for a formal credential.
- LLM system instructions: never invent scenario events; explain only provided scoring evidence; cite hazard IDs internally; do not offer unsanctioned site safety instructions.
- Show an `AI-generated feedback` label only after a real successful model response.
- On error/timeout/invalid JSON, show the local deterministic coach and a subtle “Using offline feedback” message.
- Keep payloads free of identity and personal details. If third-party AI sends data outside Australia, disclose the provider and implications before collecting any personal data.
- Establish basic evaluation before rollout: factual alignment with rubric, hallucination rate and response latency. Do not invent target attainment.

---

# 7. WEBSITE INFORMATION ARCHITECTURE

Prefer React with hash-based routing (`/#/simulate`, etc.) or a route strategy proven to survive direct loading and refresh on a GitHub Pages project subpath. `HashRouter` is recommended for simplicity.

## 7.1 Pages and sections

| Page / route | Goal | Required content |
|---|---|---|
| `/` | Prove value quickly | Hero, working preview/scene image captured from actual demo, clear CTA, three-step explainer, product capabilities, small developer/project teaser, disclaimer |
| `/#/simulate` | Let user experience product | Instructions, 3D and 2D options, four hazards, selection panel, progress, finish/restart |
| `/#/results` | Demonstrate useful outcome | Score breakdown, evidence, local Scenario Coach, retry, optional AI feedback only if real |
| `/#/how-it-works` | Prove technical understanding | Simplified architecture diagram, event flow, trust boundary, why scoring is rules-based, technology stack, limitations |
| `/#/project` | Prove learning and execution | Problem, design choices, screenshots from actual site, milestones, real tests, trade-offs, GitHub link if supplied |
| `/#/about` | Establish authentic identity | Developer bio, skills demonstrated, project ownership, only verified work history, contact link if supplied |

Do not create a page for testimonials, customers, pricing, certifications, partners or enterprise deployments unless real supporting information is supplied.

## 7.2 Navigation

Desktop top bar: XR SkillLab wordmark | `Demo` | `How It Works` | `Project Story` | `About` | primary CTA `Try Demo`.

Mobile: minimal accessible menu, with CTA visible on first screen. Include an accessible skip-to-content link and clear focus styling.

## 7.3 Hero content (recommended exact copy)

Eyebrow: `AI + IMMERSIVE LEARNING`  
Headline: `Learn by doing, not just watching.`  
Subheadline: `Step inside an interactive warehouse, make real-world-style decisions, and receive clear feedback on what you noticed and what to practise next.`  
Primary CTA: `Start the Simulation`  
Secondary CTA: `How It Works`  
Short caption: `Browser-based educational prototype · No headset or account required`.

Do not advertise “AI-powered” in the hero unless a functioning AI endpoint is live; initially say **“AI-ready feedback design”** or “personalised coaching” while identifying the actual local coach on detail pages.

## 7.4 Three-step feature section

1. **Explore** — Inspect a simulated workplace in 3D or accessible 2D.
2. **Decide** — Identify hazards and select the response you'd take.
3. **Improve** — Review objective results and personalised coaching.

## 7.5 Project story content

Required sections:

- **Challenge:** Passive instruction versus practising decisions in context.
- **Design:** One short scenario, transparent scoring and coaching based on evidence.
- **Architecture:** Frontend/A-Frame, scenario schema, assessment engine, optional AI Worker.
- **Engineering choices:** Why static-first? Why 2D accessibility fallback? Why not have AI calculate scores?
- **Evidence:** Tests, browser compatibility, real measured metrics, user study when available.
- **Known limitations:** Not a formal WHS training package, simplified visual environment, no LMS integration, no verified learning-effectiveness claims.
- **Roadmap:** What could be built next; clearly marked “future”.

## 7.6 About copy rules

If biographical information is not supplied, use:

“**Built as an independent learning project** exploring how browser-based immersive interaction and AI-enabled feedback can make training more engaging and measurable.”

When the developer supplies factual details, replace this with a concise first-person description. If mentioning an internship, clearly separate **employment experience** from **this independent product**. No company logo without approval.

---

# 8. DESIGN & USER EXPERIENCE SPECIFICATION

## 8.1 Design intent

A premium, technically sophisticated AI product with the polish of a modern deep-tech SaaS landing page—but without empty visual spectacle. Reference qualities: confident typography, clean dashboard cards, tasteful spatial visuals, restrained motion, high legibility, understandable workflows.

The viewer should think: **“This person built a real product and understands the problem”**, not **“This is an animated template with AI buzzwords.”**

## 8.2 Suggested design tokens

| Token | Value | Purpose |
|---|---|---|
| Background | `#0B1220` | Deep blue/slate canvas |
| Surface | `#111C2E` | Cards / panels |
| Elevated surface | `#17263B` | Modals / assessment drawers |
| Primary text | `#F5F8FC` | Headings / body on dark background |
| Secondary text | `#B6C4D6` | Supporting copy |
| Brand teal | `#42DDC5` | Primary accent / successful states |
| Focus | `#84BFFF` | Keyboard focus ring |
| Warning | `#F2C46D` | Hazard / caution |
| Error | `#F28B88` | Error states |
| Border | `#2B3D55` | Subtle separation |

Font: use **Inter**, **Manrope**, or a high-quality system sans-serif; system fallback required. Body text 16 px minimum for primary interfaces. Use fluid typography, comfortable line height, consistent spacing scale and generous breathing room.

Colors are starting suggestions, not an excuse to sacrifice contrast. Check WCAG 2.2 AA contrast and keyboard support.

## 8.3 Style rules

- One strong primary CTA per major screen.
- No repeated generic AI robot images, random 3D illustrations, fake metrics, fake “trusted by” logos or irrelevant photo carousels.
- Prefer screenshots/short clips of the *actual working simulation* rather than disconnected stock graphics.
- Use rounded panels (roughly 12–20 px), subtle layered shadows, polished hover/focus states.
- A small ambient gradient or glow is fine; keep contrast high.
- Motion is subtle and optional, respecting `prefers-reduced-motion`.
- Do not animate hazards in a way that makes them impossible to inspect or creates VR discomfort.
- Keep the simulation front and centre; do not bury it under long marketing text.

## 8.4 Key screen layout briefs

### A. Homepage

1. Sticky compact navigation.
2. Large hero with headline and CTAs on left, real interactive preview or faithful scene capture on right.
3. Thin credibility strip: `3D Training`, `Transparent Scoring`, `Personalised Coaching`, `Accessible 2D Mode` (capabilities only after built).
4. Three-step flow.
5. Feature spotlight: screenshot, sample *clearly labelled* training result from built-in demo scenario.
6. “Built with” chips: React, A-Frame, TypeScript, scenario scoring, optional AI Worker.
7. Independent project disclaimer and footer.

### B. Simulation

Desktop: primary 3D viewport (~2/3 width); a right panel showing objective, hazard progress, instructions and action history.  
Mobile: full-width viewport/2D list; pinned progress and expandable selection dialog.  
UI always exposes `2D View`, `Reset`, `Finish Assessment`, and help/instructions.

### C. Action panel

Accessible dialog with hazard title, simple image/icon, short prompt, three radio options or stacked buttons, `Submit Answer`, status feedback. It must handle Escape / close button and restore keyboard focus to the hotspot.

### D. Results

Top: numeric score + truthful breakdown (`3/4 hazards identified · 2/4 preferred actions`).  
Middle: each hazard, marked correct/incorrect/missed with a clear explanation.  
Bottom: coaching, `Try Again`, `See How It Works`.  
If AI is enabled, show a meaningful local-coach fallback and transparent loading/error states.

### E. Project story

Show actual architecture, repository link, concise decisions and testing results; use evidence not self-praise. Include “What I learned” with real project details.

## 8.5 Accessibility

At minimum:

- All training content works in a complete **keyboard-accessible 2D mode**.
- Visible focus indicator, keyboard-accessible controls, meaningful labels, semantic landmarks.
- Correct dialog focus management; Escape where appropriate.
- Not reliant on colours alone for correctness/hazard status.
- Supports zoom and 320px mobile widths without horizontal overflow.
- Motion respects reduced-motion preference.
- Graphic fallback and clear WebGL error state.
- Keyboard instruction available for 3D; if a 3D interaction is mouse-only, the 2D equivalent must be obvious and feature-complete.
- No mandatory audio; captions if video/audio is added.
- Manual test with keyboard and screen reader on key routes.

## 8.6 Responsive behaviour

- Desktop ≥1024px: 3D is primary when supported.
- Tablet 768–1023px: flexible 3D layout and scroll-safe action drawer.
- Mobile <768px: prioritise touch-friendly accessible 2D mode; offer optional 3D after a performance/support check.
- Do not assume WebXR immersive headset mode is available on all phones or browsers.

---

# 9. TECHNICAL ARCHITECTURE

## 9.1 Recommended stack

**P0:**

- React + TypeScript + Vite.
- Tailwind CSS (or small token-based CSS system if existing repo already uses one).
- A-Frame for immersive browser scene (with isolated integration layer).
- React Router `HashRouter` or equivalent GitHub Pages-safe strategy.
- Vitest + React Testing Library for unit/component tests.
- Playwright for smoke/end-to-end checks if feasible; otherwise manual checklist with screenshots and clear instructions.
- GitHub Actions CI/CD.
- GitHub Pages static hosting.

**P1 optional:**

- Cloudflare Worker in TypeScript for secure LLM calls.
- Zod for typed request and response validation.
- Model provider selected by the owner with cost controls; do not assume an API subscription or hardcode a model.

**Avoid** Python/FastAPI for P0. It cannot execute directly on GitHub Pages; adding it would create unnecessary hosting and operational complexity for a beginner. The backend could be Python later if a genuine requirement arises, using separate hosting.

## 9.2 System design (P0)

```text
Visitor's browser
┌──────────────────────────────────────────────────────┐
│ React UI / responsive site                            │
│   ├── Landing, Project Story, About                   │
│   ├── Simulation page                                 │
│   │    ├── 3D scene via A-Frame                       │
│   │    └── equivalent 2D hazard inspector             │
│   ├── Assessment engine (pure deterministic TS)       │
│   ├── Scenario content/rubric (versioned local data)  │
│   ├── Local Scenario Coach (no LLM needed)            │
│   └── Results / retry / optional sessionStorage       │
└──────────────────────────────────────────────────────┘
                       ▲
                       │ static HTML/CSS/JS/assets
               GitHub Pages CDN
```

## 9.3 System design (P1 optional)

```text
Results screen
     │ structured anonymous answers and evidence
     ▼
Cloudflare Worker → validate / rate-limit / cap cost
     │ secret provider key only in Worker environment
     ▼
LLM provider
     │ bounded structured response
     ▼
Worker validation → browser UI
     │ if failure: deterministic local coach
     ▼
User sees honest, grounded coaching
```

## 9.4 Integration advice for React and A-Frame

A-Frame defines custom elements. Avoid assuming that an old unmaintained React binding library is required. Keep the 3D scene in its own component and manage A-Frame events with a clean lifecycle (`addEventListener`/`removeEventListener`). Use stable component keys and refs, guard against duplicate listeners during React Strict Mode dev mounting, and avoid large React re-renders whenever the camera moves. The state and scoring logic should be platform-agnostic TypeScript, shared by 2D and 3D modes.

## 9.5 Suggested repository structure

```text
xr-skilllab/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   ├── og-image.png                  # only after actually created/licensed
│   └── models/                       # licensed compressed assets, if necessary
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── styles.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Button.tsx
│   │   ├── SimulationInstructions.tsx
│   │   ├── HazardQuestion.tsx
│   │   ├── FeedbackPanel.tsx
│   │   └── ResultsSummary.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SimulationPage.tsx
│   │   ├── ResultsPage.tsx
│   │   ├── HowItWorksPage.tsx
│   │   ├── ProjectPage.tsx
│   │   └── AboutPage.tsx
│   ├── simulation/
│   │   ├── WarehouseScene.tsx
│   │   ├── Warehouse2D.tsx
│   │   ├── sceneObjects.ts
│   │   └── interactions.ts
│   ├── domain/
│   │   ├── hazards.ts
│   │   ├── types.ts
│   │   ├── scoring.ts
│   │   ├── session.ts
│   │   └── coach.ts
│   ├── services/
│   │   └── aiCoach.ts                # feature-flagged, optional
│   ├── tests/
│   │   ├── scoring.test.ts
│   │   ├── coach.test.ts
│   │   ├── session.test.ts
│   │   └── app.test.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── worker/                            # P1 only; never bundle secrets with UI
├── docs/
│   ├── architecture.md
│   ├── demo-script.md
│   ├── evaluation.md
│   ├── content-and-safety-review.md
│   └── licenses.md
├── IMPLEMENTATION_STATUS.md
├── README.md
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.ts
└── tsconfig.json
```

Adapt this structure to an existing repository rather than replacing working conventions. All linked pages/buttons must work. Only include assets actually licensed and present.

## 9.6 Dependency discipline

Prefer mainstream actively maintained packages. Avoid obsolete React/A-Frame wrappers, unnecessary component libraries, physics engines or dozens of animation dependencies. Pin via lockfile; run package security audit, distinguish practical vulnerabilities from false positives, and ensure stable builds. Use supplied asset licenses and attribution as needed.

---

# 10. GITHUB PAGES AND DEPLOYMENT REQUIREMENTS

## 10.1 GitHub Pages suitability

GitHub Pages can serve a static React/Vite build and a JavaScript 3D scene. It cannot execute server-side Python/Node or securely hold client-side AI keys. Use it for this **independent educational project showcase**, not as free hosting for a primarily commercial SaaS operation; GitHub's terms explicitly restrict that use. If the project becomes a commercial product, plan to migrate hosting.

## 10.2 Correct Vite base path

The following are examples; use the *actual* repository/domain configuration:

| Deployment URL | Vite `base` |
|---|---|
| `https://USERNAME.github.io/REPO/` | `'/REPO/'` |
| `https://USERNAME.github.io/` (user/organization site) | `'/'` |
| `https://custom-domain.example/` | `'/'` |

Do not accidentally deploy `/assets/...` references against the domain root for a project subpath. Prefer imported module assets or `import.meta.env.BASE_URL` rather than root-absolute asset URLs. Verify generated paths in the browser's network panel if there are 404s.

## 10.3 Routing

Default to `HashRouter`, so navigation to `/#/simulate` and `/#/results` survives refresh on Pages. Ensure direct entry using an exact deployed URL works. If using browser history routing instead, provide and test a proper Pages fallback and preserve navigability; simpler is better for P0.

## 10.4 CI/CD checklist

- `.github/workflows/ci.yml` runs on pull requests and pushes: install (`npm ci`), typecheck, lint, unit tests, production build.
- `.github/workflows/deploy.yml` publishes `dist/` using GitHub's Pages Actions on pushes to detected default branch.
- Set minimal permissions for CI/deploy; use official supported actions.
- In repo Settings → Pages, select **GitHub Actions** as deployment source.
- Production build must run with the correct `base` for actual Pages URL.
- Verify published `index.html`, JS, CSS and assets resolve under project path.
- Never commit `.env.local`, `.dev.vars`, keys or service tokens.
- Document required setup in README.
- Do not claim deployment successful from a green build alone; open and test the actual URL.

## 10.5 Performance budgets (goals, not made-up accomplishments)

- Desktop homepage usable quickly on typical broadband and a normal laptop.
- Target first scene asset payload <= ~4 MB where feasible; measure actual transferred bytes and document trade-offs.
- Responsive and interactive desktop 3D; degrade gracefully on low-end phones.
- Avoid continuous expensive raycasts or React state updates every animation frame.
- Lazy load the 3D scene only on the simulation page, show a real loading state and 2D fallback.
- Aim for Lighthouse accessibility ≥95 and no critical issues; report actual tested values, not invented scores.
- Treat performance scoring as diagnostic rather than a pass/fail when 3D and remote browser conditions vary.

## 10.6 Security and privacy

- P0 does not require any account, sensitive data, remote database, analytics tracker or contact form.
- No fake account creation or working-looking buttons that secretly do nothing.
- If `sessionStorage` is used, explain it is device-local and permit reset; avoid collecting PII.
- Sanitize/validate any optional future user input and AI output before rendering. Never inject model output as raw HTML.
- Use minimal client-side permissions. Do not request microphone, camera, location or headset permission by default.
- External asset/CDN usage must not unexpectedly send private assessment details.
- P1 Worker must have proper secrets, rate limiting, input validation and budget caps before publicly exposing a paid LLM API.

---

# 11. ACCEPTANCE CRITERIA AND TEST MATRIX

## 11.1 Functional acceptance criteria (P0)

**AC-01:** Landing page visibly describes the product and `Start the Simulation` routes to a working simulation.  
**AC-02:** Simulation has four distinct real hazards; targets correspond visually to described conditions.  
**AC-03:** User can inspect and submit exactly one scored response per hazard per attempt.  
**AC-04:** Score always falls in `[0,100]` and equals the documented 15+10 scoring rule.  
**AC-05:** All four hazards have explicit feedback for each choice.  
**AC-06:** Finishing early gives zero for unanswered hazards and accurately labels them as missed.  
**AC-07:** A completed score and local coach work offline (after static files load), with no LLM API.  
**AC-08:** Retry resets score, answers, inspected items and timer.  
**AC-09:** The 2D mode implements the *same hazard content and scoring*, and is fully keyboard usable.  
**AC-10:** Users can open results, return to homepage, and navigate all site routes without errors.  
**AC-11:** Mobile site is legible and 2D mode is usable; no mandatory VR hardware.  
**AC-12:** No misleading company affiliation, unsafe unreviewed regulatory claim, or invented metrics/testimonials.  
**AC-13:** GitHub Pages production deployment loads correctly from its configured path; refresh and asset loading work.  
**AC-14:** README explains setup, architecture, limitations, test and deploy steps.  
**AC-15:** CI typecheck, lint, tests and build pass (or failures are explicitly recorded and resolved before release).  
**AC-16:** The About/Project pages clearly mark the demonstration as independent and non-certified.

## 11.2 Unit test cases

1. No hazards selected → `0`.
2. One hazard selected, incorrect action → `15`.
3. One hazard selected, correct action → `25`.
4. Four hazards selected, all incorrect actions → `60`.
5. Four hazards selected, two correct actions → `80`.
6. Three hazards selected, two correct actions → `65`.
7. Four selected, four correct → `100`.
8. Duplicate hazard submission does not increase score.
9. Unknown hazard ID and invalid choice ID are rejected/ignored safely.
10. Retry produces a new empty attempt.
11. Results do not change when a user visits them multiple times.
12. Local coach cannot claim an unobserved hazard was answered correctly.
13. No cloud network call is made in offline coach mode.
14. Mobile 2D control submits the same scoring outcomes as desktop 3D.

## 11.3 Browser/device matrix

Test at least:

| Browser/device | Required outcome |
|---|---|
| Chrome desktop | Full 3D experience and results |
| Edge desktop | Full 3D experience and results |
| Firefox desktop | 3D works or a clear 2D fallback |
| Safari desktop if available | 3D works or clear fallback |
| Chrome Android | Touch-friendly 2D; optional supported 3D |
| Safari iOS if available | Touch-friendly 2D; optional supported 3D |
| Keyboard-only | Full completion in 2D mode |
| Unsupported WebGL/WebXR | No crash; accessible fallback |

Do not report tests on a device/browser that Grokbot did not actually run. Record untested items as such.

## 11.4 Usability testing

After a working P0 build, recruit 3–5 consenting volunteers if possible. Give them no instructions beyond the homepage and ask them to complete one attempt. Note:

- Could they explain what the product does within 15 seconds?
- Did they find the Start button quickly?
- Did they discover and inspect all hazards without excessive confusion?
- Did they understand the difference between score and coaching?
- What confused them and what did they want next?
- Completion time, if voluntarily measured.

Use only anonymised summary findings with consent. Don't fabricate pilot statistics. Fix the top two observed friction points.

---

# 12. TWELVE-WEEK DELIVERY PLAN

The student is assumed to be a beginner. Protect the fundamentals: one full polished training loop is better than several incomplete demos. Each week includes a tangible artefact for a supervisor or future interviewer.

| Week | Learning/build priority | Main deliverable | Definition of done |
|---|---|---|---|
| **1** | Confirm professional boundaries; inspect repo; product research; set up React/Vite | PRD fit-gap summary, running scaffold | Repo builds locally; scope and independence clear |
| **2** | Design system, landing, navigation, CI, Pages setup | Public homepage | Deployed page works and routes correctly |
| **3** | Learn A-Frame basics; compose 3D warehouse | Working 3D scene | User can inspect scene on desktop |
| **4** | Implement hotspots plus 2D equivalent | Four hazards discoverable | Both views access same data |
| **5** | Action choices and deterministic scoring | Complete training loop | All rubric unit tests pass |
| **6** | Results, feedback, reset and persistence | Full P0 playable demo | Any user can finish/retry with correct score |
| **7** | UX polish, accessibility, mobile support | Responsive usable MVP | Keyboard 2D mode passes manual checks |
| **8** | Project story, architecture, docs and performance | Credible portfolio case study | Architecture and implemented features explained |
| **9** | Test with real volunteers; address issues | Usability notes, patches | Top friction issues fixed |
| **10** | **Optional** genuine AI coach after P0 robust | Worker + validated AI feedback OR improved offline coach | No exposed keys, fallback always works |
| **11** | Browser testing, security review, demo assets | Release candidate and video/script | Test matrix and release checklist completed |
| **12** | Final polish, real deployment verification, hiring presentation | Final demonstrable release + 5-minute presentation | Supervisor can use site; developer can defend decisions |

**Hard milestone gates:**

- **End Week 2:** Site deployed and usable as a website.
- **End Week 4:** Visitor can find four hazards (scoring can be pending).
- **End Week 6:** Full start-to-finish training loop works without AI API.
- **End Week 8:** Project is suitable for a basic portfolio review.
- **End Week 12:** Tested polished release with truthful presentation material.

If behind schedule, cut optional AI API, video, elaborate 3D art, VR headset support, additional scenarios and database—not accessibility, core scoring, disclaimer, or working deployment.

---

# 13. BACKLOG: BUILD IN ORDER

Use the following as issue/task epics with concise commits. Dependencies matter.

## Epic A — Foundation [P0]

- A1 inspect original repo and write short findings.
- A2 configure TypeScript/React/Vite and npm scripts; preserve existing content.
- A3 design tokens, typography, global layout, accessible navigation.
- A4 create hash-based routes and fallback 404.
- A5 configure GitHub Actions CI and Pages deployment.
- A6 document getting-started commands and repo setup.

## Epic B — Simulation content and assessment [P0]

- B1 define canonical hazard model and scenario version.
- B2 write all four hazards, choices and three feedback strings per hazard.
- B3 implement pure, independently tested scoring functions.
- B4 create attempt state and reset flow.
- B5 create accessible 2D inspector and quiz interactions.
- B6 implement result breakdown and deterministic Scenario Coach.

**Build this 2D complete training loop before complicated 3D.** This guarantees a functional product early.

## Epic C — 3D world [P0]

- C1 create low-poly warehouse with sufficient visual context.
- C2 map hazards to visible objects/hotspots.
- C3 wire 3D clicks to the shared assessment state.
- C4 handle selected/completed/decoy states.
- C5 tune camera, lighting, loading and performance.
- C6 implement WebGL unsupported fallback.

## Epic D — Product quality [P0]

- D1 polished homepage with real demo CTA.
- D2 responsive simulation/results UI.
- D3 accessibility and screen reader labelling.
- D4 How It Works, Project Story and About.
- D5 truthful disclaimers, licensing and attribution.
- D6 test matrix, link check, build and deployment verification.

## Epic E — Optional differentiators [P1]

- E1 decide whether owner authorises paid AI usage.
- E2 create Worker project separately and secure secrets.
- E3 schema validation, canonical safety rubric, rate limiting, costs.
- E4 AI-generated coaching behind a feature flag.
- E5 evaluate generated outputs against fixed test cases.
- E6 optional VR mode and test on actual target hardware.
- E7 actual-use video and evaluation report.

---

# 14. QUALITY ASSURANCE, RELEASE AND REPORTING

## 14.1 Local development commands

Document the repo's actual commands, ordinarily:

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

Only include scripts that exist. If a script is needed, implement it rather than pasting non-working commands into README.

## 14.2 Required production release checks

- [ ] Homepage opens at verified Pages URL.
- [ ] `Start the Simulation` opens usable content.
- [ ] 3D and 2D views are accessible as designed.
- [ ] Four hazards + decoys exist; appropriate objects clickable.
- [ ] Every answer has correct explanatory feedback.
- [ ] Score math passes all unit cases.
- [ ] Results show truthful count and missed hazards.
- [ ] Reset completely clears attempt state.
- [ ] Offline coach is available with no backend.
- [ ] Mobile responsive view tested.
- [ ] Key navigation works with keyboard.
- [ ] No broken assets, console errors or unresolved import paths.
- [ ] Site works under the exact GitHub Pages base path.
- [ ] No secrets in frontend, repository or build logs.
- [ ] No fabricated company association, endorsements or safety certification.
- [ ] README describes setup, tech stack and honest limitations.
- [ ] CI/build/test status recorded accurately.

## 14.3 How Grokbot should report progress

For every phase, produce a compact report in this format:

```text
Phase: [name]
Completed: [actual working features]
Files changed: [relevant paths]
Tests run: [commands and pass/fail evidence]
Deploy status: [verified URL or not yet deployed]
Known issues: [real blockers/deferred work]
Next: [specific implementation tasks]
```

Update `IMPLEMENTATION_STATUS.md` correspondingly. Do not use a fake progress percentage.

---

# 15. PORTFOLIO STORY AND HIRING PRESENTATION

## 15.1 Credible framing

Suggested title: **“Building an interactive XR-inspired training assessment and coaching prototype.”**

Suggested summary (revise to match actual delivered features):

“I designed and developed an independent browser-based training prototype that combines a 3D workplace scenario, structured decision assessments and personalised coaching. The application uses transparent scoring, an accessible 2D alternative and automated tests, and is deployed as a static web app on GitHub Pages.”

Only mention AI model integration after it has truly been built and evaluated.

## 15.2 Suggested final five-minute demonstration

- **00:00–00:40 — Problem.** Passive safety training can lack context-based practice; this demo explores a low-friction alternative.
- **00:40–02:20 — Product.** Open deployed site; identify two hazards; submit responses; finish; show score/coaching. Explain remaining hazards.
- **02:20–03:10 — Engineering.** Show React, A-Frame, pure scoring engine, 2D accessibility and static hosting architecture.
- **03:10–04:00 — Evidence.** Show test cases, real measured performance or usability findings, and what was challenging.
- **04:00–05:00 — Business relevance.** Explain how modular assessments could help future immersive learning products and what would be necessary to make it enterprise-ready.

Do not overstate the prototype as a deployable enterprise safety solution.

## 15.3 Hiring conversation prompt (for the intern)

> “Over the internship I've worked to develop practical AI and software engineering skills, not just follow tutorials. Alongside the work agreed with my supervisor, I built an independent immersive-training prototype that integrates interaction, structured assessment and personalised feedback. I would value your assessment of where these skills could contribute to the team's product priorities, and what I'd need to demonstrate to be considered for a junior position.”

Only say that if truthful; do not imply the independent project was delivered for Next XR Group.

## 15.4 Business impact, measured honestly

Potential useful metrics:

- Time to first meaningful interaction.
- Share of usability testers completing the scenario unaided.
- Average time to complete one attempt.
- Number of answered hazards and correct actions.
- Automated scoring unit-test coverage.
- Actual site transfer size and load performance.
- If AI is enabled: coaching's agreement with reviewed rubric and user rating after consent.

A benchmark is only a result if measured. The project story must distinguish **targets**, **prototype examples**, and **observed results**.

---

# 16. PRODUCT COPY AND MICROINTERACTIONS

## 16.1 Simulation intro

**Title:** `Warehouse Safety Challenge`  
**Body:** `Explore the warehouse and spot four potential hazards. For each hazard, choose the action you'd take. You'll get a transparent score and feedback at the end.`  
**Note:** `This is an illustrative learning exercise, not formal safety certification.`  
**Buttons:** `Begin in 3D` · `Use 2D Inspector`

## 16.2 HUD and instructions

- Progress: `Hazards assessed: 0 of 4`
- Hint: `Look around the scene and select anything that appears unsafe.`
- Secondary help: `Having trouble? Switch to the 2D Inspector.`
- Buttons: `Instructions` · `Switch to 2D` · `Reset` · `Finish Assessment`

## 16.3 Hazard response

- Panel title: hazard name, e.g., `Blocked Emergency Exit`.
- Question: `What is the best response in this illustrative scenario?`
- Selection confirmation: `Submit answer`
- Correct feedback state: `Matches the scenario guidance`.
- Incorrect feedback state: `Review this response`.
- Never shame user or assign personal fitness/safety judgments.

## 16.4 Results

- `Your Training Snapshot`
- `Score: 65 / 100`
- `Hazards identified: 3 / 4`
- `Preferred actions selected: 2 / 4`
- `What went well`
- `What to practise next`
- `Review each hazard`
- `Try Again`
- `Learn How This Works`

The 65/100 is **sample copy only**; the UI must always show actual computed state.

## 16.5 Empty/error states

- `3D isn't available on this device. You can complete the full exercise in 2D.`
- `The AI coach isn't available right now. Here's your instant scenario feedback instead.`
- `Nothing to assess yet. Explore the scene or choose Finish to see your current progress.`
- `We couldn't restore your previous attempt. Start a new one below.`

---

# 17. FUTURE PRODUCT ROADMAP WITHOUT OVERBUILDING

Once the standalone portfolio prototype is demonstrably useful:

- **Scenario 2 — Virtual Science Lab:** sequence-of-steps reasoning, lab safety and explainable feedback.
- **Scenario 3 — Customer Conversation Practice:** branching role-play with rubric-based evaluation.
- **Instructor tool:** create simple scenarios from structured JSON and approved content without software edits.
- **Evidence layer:** anonymised evaluation (with consent), controlled versions of rubrics and AI prompts.
- **Enterprise requirements:** safety expert review, accuracy evaluation, identity and access controls, persistent storage, LMS integration, audit logging, privacy and operating budget.

Do **not** build a paid multi-tenant SaaS on GitHub Pages. At commercialisation stage, use an appropriate commercial hosting/service architecture and review intellectual property rights.

---

# 18. FINAL BUILD INSTRUCTIONS / DEFINITION OF DONE FOR GROKBOT

**Read this section again before considering the task finished.**

1. Use the owner's actual GitHub repository parameters when given. Safely inspect it first; preserve existing files/content unless instructed otherwise.
2. Build a beautiful and credible product *with a functioning assessment*, not a marketing shell.
3. Make the whole end-to-end **offline Scenario Coach** experience work before optional LLM integration.
4. Ensure **3D and 2D interfaces share the same authoritative scoring and hazard data**.
5. Do not introduce secrets, fake AI responses, fabricated customer metrics, fake deployment claims, invented professional experience, or unapproved employer branding.
6. Keep the work understandable to a beginner developer; include readable code, comments for non-obvious logic and architecture documentation.
7. Use reproducible CI, tests and a functioning GitHub Pages deployment. Test the actual published URL.
8. Prioritise user understanding, polish, performance, accessibility and a coherent 2–4 minute training experience.
9. Make all visible navigation controls functional. If a planned feature is not ready, visibly mark it as a future capability or remove it.
10. At completion, hand the owner: verified URL, GitHub code link, file/feature summary, test results, deployment instructions, limitations, and a five-minute demo script.

## 18.1 The very first Grokbot response should contain

- A brief reading-confirmation summary of the project objective and strict constraints.
- A non-destructive inspection of the real repository (once provided).
- A list of any missing **essential** repo/permission details (ask at most the blocking information; don't repeatedly ask for optional branding info).
- Proposed first implementation increment: **React/Vite app + actual GitHub Pages configuration + real homepage + 2D assessment skeleton**.
- The immediate files to create or modify.
- The actual implementation actions taken and test output, if tool access permits.

**Then begin implementation. Do not stop after providing a plan when repository tools and edit permissions are available.**

---

# 19. REFERENCES AND SOURCES FOR IMPLEMENTATION

These links are supporting technical references, **not permission to copy third-party logos, code or graphics outside their licences**. Check updated documentation before pinning versions.

1. Next XR Group (public description of AI/XR, simulations, workplace safety): https://www.nextxrgroup.com.au/
2. GitHub Pages usage limits and commercial hosting restrictions: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
3. Vite deployment to GitHub Pages (base-path + Actions): https://vite.dev/guide/static-deploy
4. A-Frame documentation: https://aframe.io/docs/
5. A-Frame hardware/browser overview: https://aframe.io/docs/1.7.0/introduction/vr-headsets-and-webxr-browsers.html (verify active version in current docs)
6. Cloudflare Workers secrets: https://developers.cloudflare.com/workers/configuration/secrets/
7. Cloudflare Workers rate limiting concepts: https://developers.cloudflare.com/workers/runtime-apis/bindings/
8. WCAG 2.2: https://www.w3.org/TR/WCAG22/
9. WebXR device API browser support caveats: https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API

---

# APPENDIX A — SINGLE-PAGE OWNER CONFIGURATION CARD

Paste this at the start of a new Grokbot build session, along with this PRD:

```text
PROJECT: XR SkillLab
Use the attached XR SkillLab Master PRD as the authoritative build specification.

GitHub owner: [GITHUB_OWNER]
Repository: [REPO_NAME]
Repository URL: [GITHUB_REPO_URL]
Default branch: [DEFAULT_BRANCH / detect]
Deployment domain: [GITHUB PAGES DEFAULT / CUSTOM DOMAIN]
Product name: [XR SkillLab / alternate]
Developer display name: [DEVELOPER_NAME]
GitHub profile: [PROFILE_URL / omit]
Contact email: [CONTACT_EMAIL / omit]
Company-mention permission: [NO LOGO OR ENDORSEMENT by default]
AI service: [NONE FOR P0 / provider for P1]

Your first task: Inspect the repository without destroying existing work,
implement the foundation and a working 2D training assessment, and deploy
a verifiable site. Build 3D and optional AI in subsequent increments.
Follow the P0/P1 priorities, quality gates and acceptance tests in the PRD.
Explain decisions and report actual progress with tests and links.
```

# APPENDIX B — FINAL RELEASE HANDOFF TEMPLATE

```text
Product: XR SkillLab
Live URL: [ACTUAL VERIFIED URL]
Code URL: [ACTUAL REPO]
Release / commit: [SHA]
Features live: [LIST OF VERIFIED WORKING FEATURES]
P0 acceptance criteria: [PASS/FAIL AND EVIDENCE]
Tests: [RUN / RESULT / KNOWN GAPS]
Browsers/devices tested: [ACTUAL]
AI mode: [OFFLINE SCENARIO COACH / LIVE MODEL THROUGH WORKER]
Data handling: [ACTUAL]
Security/privacy/IP caveats: [ACTUAL]
Limitations: [ACTUAL]
What's next: [TOP 3 SMALL IMPROVEMENTS]
```

---

**End of master PRD.**
