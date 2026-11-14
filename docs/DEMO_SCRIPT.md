# Demo script (2–3 minutes)

## Before recording

For the hosted demo, apply both Supabase migrations, configure Vercel environment variables and Auth redirects, and create a test account. Use fictional issue details only. If Supabase is not configured, use the local FastAPI/SQLite prototype and explicitly say that the account and hosted features are not part of that local demo.

## 0:00–0:20 — Problem and trust

“Citizens often know what public-service problem they face but are unsure how to organise it or find the right official starting point. Samadhan Setu is an independent civic-assistance platform, not a government website. It does not submit complaints or claim official status.”

## 0:20–0:45 — Account and language

Show sign-in/profile navigation. Switch English to Hindi and back. Mention that the interface is partially bilingual and the user's language preference can be saved. Do not present this as a complete translation of every screen.

## 0:45–1:20 — Create a grievance

Use fictional details:
- Description: “Garbage has not been collected from our street for seven days. Waste is piling up and causing a foul smell.”
- Location: “Ward 4, Patna, Bihar”

Submit and show the preliminary category/subcategory. Explain that the hosted path uses a server-side deterministic taxonomy, not a trained LLM or official classification. Show the jurisdiction hint and explain that it must be checked against the official source.

## 1:20–1:50 — Citizen control

Correct the broad category if appropriate. Review the editable complaint draft and general next steps. Explain that the citizen verifies the recipient and submits the draft through the relevant official portal.

## 1:50–2:15 — Official resources and assistant

Open the resources page and point out that directory entries are unverified navigation starting points. Open the scheme page and myScheme link. If the assistant is configured, ask a general question and show its disclaimer. It has no live scheme retrieval, no eligibility determination and no government-status access.

## 2:15–2:40 — Follow-up and personal insights

Add a citizen-recorded follow-up note. Open Insights and explain that the counts are only the signed-in user's own records, not public or government statistics. Show the profile JSON export if time allows.

## Closing

“Samadhan Setu helps citizens turn an issue into a clearer, more organised next step—without pretending to be a government authority or taking control away from the citizen.”
