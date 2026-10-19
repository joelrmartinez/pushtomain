# Web app sketch: Merlin and Lamplighter

A sketch of what a real web app version of each tool would be. The pages on `merlin.pushtomain.xyz` and `lamplighter.pushtomain.xyz` are static walkthroughs. This document does not specify a build, and nothing in it is implemented here.

Sources for what the tools actually do:

- The Merlin case study at `/work/merlin/`
- The Lamplighter case study at `/work/lamplighter/`
- A listing of public repositories under `github.com/joelrmartinez` on 19 Oct 2026

No public Merlin or Lamplighter repository was found. Day counts below assume the behavior in the case studies is built from that description. If private source already exists, phases 1 and 2 get shorter by whatever that source already does. This sketch does not guess that it does.

The SEC Form D Pipeline case study is a related but separate artifact: a Python batch over filings (14,749 qualifying companies from about 99,000 filings, full backfill in about 24 seconds). It is not the Merlin Worker. Do not treat its code, runtime, or counts as Merlin's.

## What a visitor can do today

Open the walkthrough. Read the inputs, the steps, and the output shape. There is no form, no score, and no fingerprint on these hostnames.

## Merlin

### Users

- Joel, running the engine and showing it.
- A reader of the public dashboard: a hiring manager, a buyer, or Joel himself, looking at companies ranked by fit.
- An operator who swaps the ICP and starts a run.

The case study does not describe accounts, teams, or a CRM handoff. Those show up only in the optional last phase.

### Inputs

- A weekly cron trigger, or Run now on the dashboard.
- Public SEC EDGAR Form D filings.
- An ICP definition. The first one is developer platforms and edge infrastructure. It is meant to be swapped and re-scored.

### Outputs

- Ranked companies.
- A 0 to 100 fit score for each.
- The reasoning Workers AI wrote for that score.
- A public dashboard served by the same Worker that ran the pipeline.
- Rows stored in D1.

"Enrich" is named in the case study and not specified. No enrichment vendor is named, and the case study says the engine needs zero external API keys. A faithful version enriches from the filing and other public pages. Adding a paid data vendor would drop the "zero external API keys" claim, so it is out of this sketch until Joel chooses it.

### Screens

1. **Ranked dashboard.** Companies, signal, score, one line of reasoning. Highest fit first. Empty state when a run has not finished. Error state when the latest run failed.
2. **Company row.** The filing signal, the score, the full reasoning, and which ICP produced it.
3. **Run control.** Run now. Last run time. Whether the Workflow is still going. A failed step, with the retry the Workflow already attempted.
4. **ICP.** The current definition in plain text. Save replaces the definition. A re-score action runs the model again against the rows already stored.

### Stack

The case study's stack, and nothing beside it for the core loop:

- Cron Trigger for the weekly start
- Cloudflare Workflows for durable steps and retries
- Workers fanning out the per-company work
- Workers AI as the propensity model
- D1 for the rows
- The same Worker serving the dashboard HTML

No model name is given in the sources. Pick one small Workers AI model, pin it, and record the choice in the repo. Do not leave the model implicit.

### Data and API costs

Prices below are Cloudflare's published rates as of 19 Oct 2026. Links: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Workflows pricing](https://developers.cloudflare.com/workflows/reference/pricing/).

SEC EDGAR has no fee in these sources. A fetcher still has to identify itself and stay inside SEC fair-access expectations. That constraint is not in the case study.

| Piece | Published rate | What a personal weekly run likely does |
| --- | --- | --- |
| Workers Paid | $5 a month minimum, then 10 million requests included and $0.30 per extra million. CPU: 30 million ms included, then $0.02 per extra million ms. | One cron plus a dashboard that a handful of people open. Request cost stays inside the included grant. |
| Workflows | Requests and CPU use Workers rates. Steps: 500,000 a month included on Paid, then $0.80 per extra 100,000. Storage: 1 GB-month included, then $0.20 per extra GB-month. Step and storage billing applies (it started 10 Aug 2026). | A few steps per company. A few hundred companies a week stays far under 500,000 steps. |
| Workers AI | 10,000 neurons a day free, then $0.011 per 1,000 neurons on Paid. | Unknown per company, because no model is named. Measure one batch before turning the cron on. |
| D1 | Paid includes 25 billion rows read, 50 million rows written, and 5 GB. Then $0.001 per million rows read, $1.00 per million rows written, $0.75 per extra GB-month. | One short row per company per run. Storage and writes for a demo sit inside the included grant. |

Order of magnitude for a weekly single-operator demo: the Workers Paid subscription the account already pays, if it pays one, plus Workers AI only after a batch crosses the daily neuron grant. Do not publish a dollar figure for scoring until a model is pinned and one batch is measured.

Workers Free caps Workflow steps at 3,000 a day and D1 writes at 100,000 a day. A wide Form D week can blow the free step cap. Plan on Workers Paid.

### Effort

Engineering days, one person, from the case study rather than from unseen source.

| Phase | What lands | Days |
| --- | --- | --- |
| 1. Read path | D1 tables for company, filing id, score, reasoning, ICP id, run id. A one-off ingest of a small Form D slice. Server-rendered ranked dashboard. | 3 to 4 |
| 2. The run | Weekly cron and Run now. A Workflow with retries. Fan-out enrich. Workers AI score against one fixed ICP. Run status on the dashboard. | 4 to 5 |
| 3. Swap the ICP | Store the ICP text. Show which definition produced each score. Re-score the stored rows. | 2 |

Merlin, through a real single-operator app: **9 to 11 days**.

### Risks

- EDGAR's filing format changes, and discovery breaks until the parser is updated.
- Enrichment is unspecified. Inventing vendor fields would over-claim the case study.
- The public dashboard publishes the scores and, if the ICP screen is public, the targeting strategy. Decide what stays public before phase 3.
- Workers AI quality and neuron cost move together. A model that is cheap and vague makes the ranking look arbitrary.
- Workflow retries can score the same company twice if the write is not idempotent on filing id plus ICP id.
- This sketch's day count is wrong if a private repo already contains the pipeline. It could not be checked.

## Lamplighter

### Users

- Someone with a company URL: Joel on a call, or a reader of the public page.
- The same person reading the field read and deciding whether the account is worth a conversation.

The case study does not describe saved accounts, shared workspaces, or a history. A cache is an implementation detail in phase 5, not a user-facing archive.

### Inputs

- A company URL.
- The public HTML (or whatever the public surface returns) at that URL.

### Outputs

- The detected tools: CRM, outbound tooling, analytics, and any other go-to-market technology the fingerprint knows.
- A short field read from Workers AI: how the stack suggests they operate, and where an opening might be.

The case study does not publish the signature list. Phase 4 has to write one, and the page should say the read only covers signatures that list contains.

### Screens

1. **Lookup.** One URL field. Submit. A working state while the fetch and the read run.
2. **Result.** The URL, the detected names, the field read. A clear empty detection ("nothing in the signature list matched") rather than a made-up stack.
3. **Failure.** The site blocked the fetch, timed out, or was not HTML. Say so. Do not invent tools.

### Stack

- One Worker for the form, the fetch, the fingerprint, and the HTML response.
- Workers AI for the field read, given only the detected names, not the raw page.
- Cache API or a small D1 table for repeated URLs. The case study does not require storage. Add it so the same URL does not call the model twice.

### Data and API costs

No third-party API in the case study. The cost of one lookup is:

- One Worker request to serve the form, one to run the lookup.
- One outbound fetch of a public page. Bandwidth on Workers is not billed.
- One Workers AI call. Same neuron pricing as Merlin. Same caveat: measure it, because no model is named.

An unbounded public form is the cost risk. A script can burn the daily neuron grant in minutes. Phase 5's rate limit is what keeps the bill at "a few lookups a day," which on the published rates is inside the free neuron grant until the page is actually busy.

### Effort

| Phase | What lands | Days |
| --- | --- | --- |
| 4. Lookup | URL form. Fetch with a size cap and a timeout. Fingerprint against an explicit signature list. Field read from the detected names only. Result and failure screens. | 3 to 4 |
| 5. Guardrails | Per-IP rate limit. Refuse private and link-local hosts, and refuse non-http(s). Cache repeats. Logs for failed fetches. | 2 to 3 |

Lamplighter, through a guarded public lookup: **5 to 7 days**, after Merlin or beside it. The phases are independent.

### Risks

- HTML fingerprints miss tools that load after JavaScript, and they false-positive on shared scripts and tag managers. The field read can sound confident about a bad list. Show the detected names next to the prose so a reader can see the evidence.
- An open URL fetch is an SSRF hole if it will request `127.0.0.1`, link-local addresses, or the cloud metadata IP. Block those before the feature is public.
- Some sites will refuse the Worker. The failure screen has to be the result, not a blank.
- "For free" on the case study is the product claim. A rate limit protects the neuron bill and still leaves a human lookup free.

## Optional product layer

Not required for either tool to match its case study. Only build it if someone other than Joel should have a private workspace.

| Phase | What lands | Days |
| --- | --- | --- |
| 6. Accounts | Login, saved ICPs per person, a short history of Lamplighter lookups, a CSV export of a Merlin run. | 5 to 8 |

## Phased plan

Do these in order. Each phase is usable on its own. Stop at the end of any phase and the previous one still stands.

1. **Phase 1 (3 to 4 days).** Merlin shows real rows from a small, manual Form D ingest. Dashboard only. No cron.
2. **Phase 2 (4 to 5 days).** The weekly run and Run now work, with retries and a visible run status.
3. **Phase 3 (2 days).** The ICP can be swapped, and the dashboard says which definition scored the row.
4. **Phase 4 (3 to 4 days).** Lamplighter accepts a URL and returns detections plus a field read.
5. **Phase 5 (2 to 3 days).** Lamplighter grows a rate limit, an SSRF refusal, and a cache. Merlin's cron stays off until one measured batch confirms the neuron cost.
6. **Phase 6 (5 to 8 days, optional).** Accounts and exports, if the tools need to be private or multi-user.

**Through phase 5: 14 to 18 engineering days.** With phase 6: 19 to 26. Calendar time is whatever else is in the week. The numbers are build size, not a schedule.

When a real app replaces a walkthrough, point that hostname at the app and keep the walkthrough on `/work/`, or label the hostname so a reader can tell the two apart.

## What this sketch refuses to add

- A paid enrichment vendor, while the Merlin case study still says zero external API keys.
- A published sample company, sample score, or sample tool list. None is in the sources.
- A model name. None is in the sources.
- Login, billing, or a CRM push as part of the core loop. The case studies do not describe them.
