# Privacy and safety notes

This is a hackathon prototype, not a government service or secure public case-management system.

- Do not collect Aadhaar, bank account credentials, passwords, OTPs or unnecessary sensitive personal data.
- The current local build has no authentication or multi-user access control. Anyone with access to the running machine/database file may access stored records.
- Store the SQLite database locally. Back it up only to a trusted, access-controlled location.
- The consent checkbox records acknowledgement that this is a prototype; it is not a legal consent-management system.
- Never describe citizen-entered follow-up notes as government-confirmed updates.
- Never fabricate responsible officers, contact numbers, portal URLs, legal deadlines or resolution outcomes.
- The app does not submit complaints to external portals.
- Before public launch: implement authentication, user-scoped authorisation, rate limits, audit logging, secure deployment secrets, retention/deletion workflows and a privacy notice reviewed for applicable law.
