# VaultCore

VaultCore is a secure, open-source password manager and digital vault system. This repository is structured as a modern full-stack Turborepo containing both the core Next.js Web application and the companion Chrome Extension.

## 📦 What's inside?

This monorepo utilizes [Turborepo](https://turborepo.org) to manage multiple applications and shared packages efficiently.

### Applications

- **`apps/web`**: The main VaultCore web application. Built with Next.js, featuring the primary user dashboard for managing credentials, notes, and vault settings.
- **`apps/chrome-extension`**: The companion browser extension built with React and Vite. Interfaces securely with the web app to autofill passwords directly into the browser.

### Shared Packages (`/packages/*`)

The core business logic and configurations are decoupled into shared internal packages:

- **`@repo/api`**: tRPC router definitions and backend API logic.
- **`@repo/auth`**: Authentication logic integrating Better Auth.
- **`@repo/database`**: Prisma schema, migrations, and database client instances.
- **`@repo/store`**: Shared Zustand state management (e.g., managing the active vault lock state and derived keys).
- **`@repo/ui`**: Shared React components based on Shadcn UI and Tailwind CSS v4.
- **`@repo/email`**: Transactional email templates and Resend configurations.
- **`@repo/jobs`**: Background jobs and queue logic processing.
- Build/Config packages: **`@repo/eslint-config`**, **`@repo/prettier-config`**, **`@repo/typescript-config`**.

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [pnpm](https://pnpm.io/) (Package manager)
- [PostgreSQL](https://www.postgresql.org/) database
- [Redis](https://redis.io/) instance

### 2. Environment Variables

Create `.env` files based on `.env.example` in the root directory.

#### Core Settings
- `DATABASE_URL`: Your PostgreSQL connection string.
- `REDIS_URL` / `REDIS_PUBLIC_URL`: Your Redis connection string (used for ratelimiting/caching).
- `JWT_SECRET`: A secure random string for JWT signing.
- `BETTER_AUTH_SECRET`: A secure random string for Better Auth sessions.
- `WEB_APP_URL` / `NEXT_PUBLIC_WEB_APP_URL`: The URL where your Next.js app will be hosted (e.g., `http://localhost:3000`).

#### External Integrations
- `RESEND_API_KEY`: API key for transaction emails via [Resend](https://resend.com).
- `EMAIL_FROM`: The verified sender address (e.g., `VaultCore <onboarding@resend.dev>`).
- Polar.sh (Payments & Subscriptions)
  - `POLAR_ACCESS_TOKEN`
  - `POLAR_WEBHOOK_SECRET`
  - `POLAR_FREE_PRODUCT_ID`
  - `POLAR_PREMIUM_PRODUCT_ID`
  - `POLAR_FAMILY_PRODUCT_ID`

### 3. Installation

Install all dependencies across the monorepo:

```bash
pnpm install
```

### 4. Database Setup

Push the Prisma database schema to your configured Postgres database:

```bash
pnpm --filter database db:push
```

### 5. Running the Development Server

To start all applications and packages in development mode simultaneously:

```bash
pnpm dev
```

- Web App runs on: `http://localhost:3000`
- The Chrome Extension will be built in watch mode in `apps/chrome-extension/dist`. See "Loading the Extension" to test it natively in Chrome.

## 🧩 Loading the Chrome Extension locally

1. Run `pnpm dev` or build the extension uniquely via `pnpm --filter chrome-extension build`.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the `apps/chrome-extension/dist` folder in your repository.
6. The extension is now loaded. Ensure your local `apps/web` server is running so the extension can fetch credentials.

## 🛠 Commands

We use `turbo` to map commands across the entire workspace safely.

- `pnpm build`: Build all apps and packages for production.
- `pnpm dev`: Start development mode for all apps.
- `pnpm lint`: Run ESLint across the repository.
- `pnpm format`: Format codebase using Prettier.

## 🛡 Security Notes

VaultCore is built heavily on zero-knowledge architecture principles. Master Passwords are never sent or stored in plaintext on the server. Derived keys (using AES-GCM and PBKDF2) are generated completely client-side. The backend only ever receives heavily encrypted ciphertext for secure fields (Usernames, Passwords, URLs, Secure Notes).
