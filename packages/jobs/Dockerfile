# --- Stage 1: Install dependencies ---
FROM node:22-alpine AS base

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy only the packages needed by the worker
COPY packages/jobs/package.json ./packages/jobs/package.json
COPY packages/email/package.json ./packages/email/package.json
COPY packages/database/package.json ./packages/database/package.json

# Copy shared config packages (needed for resolution)
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/prettier-config/package.json ./packages/prettier-config/package.json

# Install dependencies (only for the worker and its deps)
RUN pnpm install --frozen-lockfile

# --- Stage 2: Copy source & run ---
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

# Copy everything from the install stage
COPY --from=base /app ./

# Copy source code for worker and its workspace dependencies
COPY packages/jobs/ ./packages/jobs/
COPY packages/email/ ./packages/email/
COPY packages/database/ ./packages/database/

# Set production environment
ENV NODE_ENV=production

# Run the worker using tsx (already installed as a devDependency)
CMD ["pnpm", "--filter", "@repo/jobs", "worker"]
