# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The audience this surface must persuade is the VaultCore user already confirmed in apps/web/PRODUCT.md: privacy-conscious individuals replacing weak or reused passwords with a zero-knowledge vault, plus families sharing credentials through organizations. Visitors arrive from search (the copy targets "free password manager" and "zero-knowledge password manager" queries) or directly, and are deciding whether to trust VaultCore with every password they own.

## Product Purpose

This app is the public marketing site for VaultCore, served at vaultcore.in. Its job is to earn attention and convert visitors into signups, primarily free-plan ones. It presents the product (zero-knowledge password manager for logins, cards, identities, notes, and SSH keys), explains the security model, shows pricing, and answers pre-trust questions. Success means visitors reach the product's signup flow.

## Positioning

Carried over from apps/web/PRODUCT.md: a zero-knowledge vault combining individual password management with organization-level sharing, where per-member vault keys are wrapped with RSA-OAEP and the server never holds plaintext. On this surface the same claim is expressed for persuasion: security facts stated verifiably ("What leaves your device": no plaintext on server, AES-256-GCM, RSA-OAEP, master password never sent), with the incumbent tagline "The quiet vault for your passwords."

## Operating Context

- Deployment split (confirmed in deployment.md): marketing at `vaultcore.in` on Vercel is the only indexed origin; the product app at `dash.vaultcore.in` is never indexed. The two deploy independently — product-app changes never trigger a marketing build.
- The conversion funnel is wired end to end: hero and navbar CTAs go to `/pricing/personal`, plan CTAs link to `dash.vaultcore.in/signup/{plan.id}` via `NEXT_PUBLIC_WEB_APP_URL`. A "Log in" link goes to `dash.vaultcore.in/login`.
- Current pages: landing (`/`) with hero, features, why-us/security, pricing, and FAQ sections; pricing (`/pricing/personal` only today). Sitemap, robots, canonical URLs, OpenGraph/Twitter images, and schema.org structured data (Organization, WebSite, SoftwareApplication with offers, FAQPage, BreadcrumbList, Product/AggregateOffer) are implemented in code.
- Pricing copy derives from `lib/constants.ts` (Free / Premium $10/yr / Family $49.99/yr); it must stay consistent with the database and Polar.
- Stack: Next.js 16 App Router, React 19, Tailwind, `@repo/ui` and `@repo/site` shared packages, motion for scroll animations, on port 3001 in dev (`pnpm dev` from `apps/marketing`).

## Capabilities and Constraints

- Static-generated pages (`generateStaticParams` with `dynamicParams = false`); no build-time secrets, only the two public `NEXT_PUBLIC_*` URL variables.
- SEO-first posture is incumbent: keyword targeting in metadata, answer-first FAQ copy written to be quoted verbatim by answer engines, structured data on every page. Preserve this on any new page.
- The FAQ names 1Password and Bitwarden as comparison points; that is established copy, not a claim to expand or remove without cause.
- Product status is not launched (carried from apps/web/PRODUCT.md): no production customer base, no commercial proof.
- Pricing categories currently include only `personal`; family/team category pages are potential future structure but do not exist yet.

## Brand Commitments

- Product name: VaultCore; domain vaultcore.in. Voice: calm, security-focused, direct — "Questions, answered plainly."
- Tagline "The quiet vault for your passwords" is incumbent on this surface (hero, OG/Twitter image alt text).
- Plan names Free, Premium, Family are established.
- The existing metadata and visual identity are incumbent. Init does not decide a redesign.

## Evidence on Hand

- Implemented landing and pricing pages with animated feature illustrations and a dashboard demo under `apps/marketing/components`.
- OG and Twitter card images (`/og-image.png`, `/twitter-image.png`) referenced in `lib/seo.ts`.
- No testimonials, customer logos, case studies, press, benchmarks, or production metrics exist. Future work on this surface must not fabricate them.
- No security-audit or certification badges are confirmed; security claims must stay verifiable in the implementation (see apps/web/PRODUCT.md principles).

## Product Principles

1. Carry over the product principles from apps/web/PRODUCT.md: never weaken the zero-knowledge claim, and keep security claims verifiable rather than merely impressive.
2. Persuade with clarity and restraint: the security model itself is the proof; no invented proof, no inflated maturity.
3. Every page keeps its SEO contract: canonical URL, structured data, answer-first copy that search engines and answer engines can quote.
4. The funnel must stay wired: every conversion path resolves to a real pricing page or signup URL.
5. Match the marketing surface to the product truth at all times — if the app changes (plans, limits, features), this site's copy follows.

## Accessibility & Inclusion

- The incumbent implementation uses semantic landmarks, aria-labelled sections, visible focus structure, and `MotionConfig reducedMotion="user"` for animation. Preserve these standards on new sections.
