# Deepgram Expansion Radar

*Proof piece · Deepgram. Joel Martinez, pushtomain.xyz*

> A small Python pipeline that finds teams building voice agents from public signals, scores each one for fit, and routes it to self-serve nurture, an AE, or the APAC team. Every step is labelled deterministic, AI, or human review.

**Stack:** Python · pytest · GitHub Actions
**Code:** https://github.com/joelrmartinez/deepgram-expansion-radar

## Key numbers

- **3**. Public sources: GitHub repo search, Hacker News launches, and Ashby, Greenhouse, and Lever job boards
- **46**. Accounts kept from one real run: 4 to an AE, 1 to APAC, 5 to human review, 36 to nurture
- **0**. Network calls in the test suite. A socket guard fails any test that tries

## The idea

Deepgram sells two ways at once: a developer console where anyone can start on credits, and an enterprise team that closes contact centers, drive-thrus, and voice agent platforms. The hard GTM engineering question sits between them: which teams should a human talk to, and which should the product keep nurturing? The radar answers it from the outside in.

## What I built

Collectors for GitHub, Hacker News, and public job boards; a merge and regex tagging step; a plain 100 point formula (intent + displacement + traction + corroboration + vertical) with every part exported; and an ordered routing rule list. Competitors and partners never auto-route, APAC goes to the Singapore team, and unverified AE-level accounts go to a human first. The only AI step is an optional "why now" line that cannot move a score or route.

## The receipt

- First real run: Bland, Assort Health, Decagon, and Parloa routed to an AE; LiveKit, Pipecat, and Stream flagged for partnerships.
- Sample output with score parts and source links is committed next to the code.
- Inside Deepgram it would join Salesforce, console usage, and Ordway or Metronome billing.

---
HTML version: https://pushtomain.xyz/work/deepgram-radar/
Contact: joel@pushtomain.xyz · https://www.linkedin.com/in/joelrmartinez/
