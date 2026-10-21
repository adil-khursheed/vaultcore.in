# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Privacy-conscious individuals replacing weak or reused passwords and scattered storage with a zero-knowledge vault; families sharing credentials and secure notes through organizations; small teams and organizations sharing credentials with members, roles, and audit visibility. All three need to store, find, and use secrets without exposing plaintext to the server.

## Product Purpose

VaultCore is a password manager and digital vault for credentials, cards, identities, secure notes, and SSH keys. It exists to make strong, unique credentials practical while keeping vault contents encrypted client-side. Success means users adopt it as their everyday vault and share within organizations without sacrificing the zero-knowledge model.

## Positioning

A zero-knowledge vault that combines individual password management with organization-level sharing: per-member vault keys are wrapped with each member's RSA public key, so sharing, revocation, and key rotation happen without the server holding vault plaintext. The web app is the vault and administration surface; a companion Chrome extension provides browser autofill. The open-source position is not binding yet: the repository is currently private and the product is not launched.

## Operating Context

- Users authenticate with Better Auth, unlock with a master password, and select or create an organization.
- Vault items belong to an organization and use the types login, card, identity, note, and ssh_key. Users can search, favorite, trash, and review audit logs.
- Sharing is organization-based. Members receive vault access; administrators can rotate keys and review audit events.
- Browser autofill runs through the Chrome extension and depends on the web app being reachable.
- Billing runs through Polar with Free, Premium, and Family plans; plan limits are stored per plan.
- Development is a pnpm monorepo: Next.js 16 web app on port 3000, PostgreSQL, Redis, tRPC, Drizzle, and Zustand.

## Capabilities and Constraints

- Client-side cryptography uses AES-GCM and PBKDF2. Master passwords are never sent or stored in plaintext, and the backend receives ciphertext for secure fields.
- Per-member vault keys use RSA-OAEP wrapping. The legacy AES-GCM master-key wrapping path is retained only for migration.
- Current plan structure: Free (1 organization, 2 members), Premium ($10/year, 2 organizations, 3 members), Family ($49.99/year, unlimited organizations, 10 members). Verify against the database and Polar before publishing.
- Roles, membership, sharing, audit logging, key rotation, CSV import, and legacy key migration exist in the codebase.
- The repository README describes VaultCore as open-source, but the confirmed status is private and not launched. Do not repeat the open-source claim until licensing and publication are decided.
- No public launch, production customer base, or commercial proof was confirmed.

## Brand Commitments

- Product name: VaultCore. Domain: vaultcore.in. Existing serif wordmark logo in the web app.
- Current product voice is calm, security-focused, and direct, for example "Secure Your Digital Life Without Compromise".
- Plan names Free, Premium, and Family are established.
- The existing metadata and visual identity are incumbent. Init does not decide a redesign.

## Evidence on Hand

- Working web routes for landing, pricing, authentication, vault, favorites, trash, audit, members, settings, and migration under apps/web/app.
- Companion Chrome extension at apps/chrome-extension.
- Animated feature demos and a dashboard demo on the landing page.
- Pricing copy and plan data in apps/web/lib/utils/constants.ts and packages/database/src/schema.ts.
- No testimonials, customer logos, case studies, press, benchmarks, or production metrics exist in the repository. Future work must not fabricate them.

## Product Principles

1. Never weaken the zero-knowledge claim: any feature touching secrets keeps plaintext client-side.
2. Individuals and organizations share one vault model; sharing must not require handing the server the keys.
3. Security claims must be verifiable in the implementation, not only in marketing copy.
4. Earn trust through clarity and restraint, without invented proof or inflated maturity.
5. Keep the everyday vault fast to scan and quick to act on across web and autofill.
