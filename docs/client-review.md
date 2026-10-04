# Public website review

Changes are on `review/our-operations`, in draft PR #1. Client approval is required before merging to `main` or deploying to production.

## Pages and navigation

- `/operations`: interactive behind-the-scenes walkthrough.
- `/work-with-us`: separate five-step partnership inquiry, using the existing Formspree endpoint `mqpkkkdb`. It submits all answers together after the last step and retains answers on errors.
- `/contact`: direct contact details and an opt-in OpenStreetMap centered on Nairobi. No street address, international offices, or WhatsApp capability is claimed.
- Home, Services, Our Operations, Contact, and an emphasized Let’s Work Together button appear in the shared public header. About has been removed from both navigation menus; the homepage About content remains. Services links to the existing homepage section. Careers remains accessible from the footer.
- The homepage Process section remains. The old inquiry form is replaced by an invitation to the dedicated partnership page.

## Before production approval

1. Confirm the existing public email and both phone numbers, including which number (if any) should have a WhatsApp link. No new sales mailbox is assumed active.
2. Confirm the Formspree form owner, destination inbox, plan limits, spam controls, and notifications. Run one authorized end-to-end inquiry on the preview and confirm receipt; automated tests mock the network and do not send customer messages.
3. Supply an approved scheduling URL if direct booking is desired. Set `VITE_CALL_BOOKING_URL` to its HTTPS URL in the preview/production build environment. Without it, the site honestly offers “Arrange a Call” by email. This value is public; do not put credentials in it.
4. Review operational descriptions against what CallCare currently provides, and inspect the pages on desktop and mobile.

No payment or escrow behavior is introduced in these pages.

## Final release review — 4 October 2026

- Removed development-only scripts from production and split secondary routes into lazy-loaded bundles.
- Added route-specific page titles, descriptions, canonical URLs, Open Graph metadata and a generated sitemap. Preview and recruitment pages are marked noindex.
- Added branded missing-page handling with a real HTTP 404 and retained direct entrypoints for known routes.
- Removed broken analytics placeholder requests; analytics loads only when valid settings exist.
- Improved keyboard focus, mobile menu Escape behaviour, browser zoom, image loading and application form responsiveness.
- A stalled recruitment availability check now offers the email fallback rather than waiting indefinitely.
- Route, anchor, local image, form validation/retry and recruitment access/schema checks are covered by automated tests. Production data is not changed by these tests.
