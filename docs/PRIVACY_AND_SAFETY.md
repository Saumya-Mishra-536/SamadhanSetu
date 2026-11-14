# Privacy and safety

Samadhan Setu is an independent civic-assistance prototype, not a government website or complaint authority. It is not currently certified as compliant with the Digital Personal Data Protection Act, its rules, WCAG 2.1 AA or GIGW.

## Data minimisation

- Do not collect Aadhaar, PAN, bank credentials, passwords, OTPs or unnecessary medical/identity information.
- Ask citizens to share only a concise issue description and locality needed to understand the concern.
- The assistant request is sent to the configured AI model provider. Never include sensitive identifiers in assistant prompts.
- Profile photos are stored in a private Supabase bucket. The grievance evidence bucket is private and prepared, but upload UI is not implemented.

## Hosted security model

The hosted branch uses Supabase Auth and row-level security for profiles, grievances and follow-ups. A PostgreSQL trigger performs deterministic server-side categorisation. The assistant Edge Function requires JWT verification and uses a per-user quota. These controls are only effective after the migration is applied to the correct Supabase project and end-to-end access-isolation tests pass.

Do not accept real citizen data until the operator has:
1. Applied both SQL migrations in order.
2. Configured Auth redirect URLs and email confirmation.
3. Configured a single exact APP_ORIGIN for the assistant function.
4. Verified that account A cannot read, update or delete account B's records or files.
5. Tested account deletion, backup, incident response and retention procedures.

## Retention and deletion

Citizens can delete individual grievance records from the app. A complete account-deletion workflow, automated retention enforcement and formal data-export feature are not yet implemented. The new grievance schema sets a review timestamp 365 days after creation; this is a review marker, not an automatic deletion policy. The operator must establish and publish a lawful retention schedule before public use.

## Legal review

The privacy notice and terms in the frontend are prototype disclosures, not legal advice. Obtain qualified review of the applicable DPDP Act and rules, consent, notices, processor arrangements, retention, grievance redressal contact and breach procedures before a public launch.

## Official resources

Resource links are navigational starting points. They are not automatically verified against an individual case. Entries in the database authority directory default to unverified; a human must record provenance and a check date before marking them verified. Never invent an official contact, phone number, deadline or eligibility rule.

## Reporting a platform issue

The platform's named grievance officer and monitored contact address have not yet been supplied by the project owner. The Contact page explicitly discloses this. Configure real contact details before public launch.
