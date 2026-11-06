FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/frontend/package.json apps/frontend/
RUN pnpm install --frozen-lockfile --filter frontend...
COPY packages/shared packages/shared
COPY apps/frontend apps/frontend
RUN pnpm --filter frontend build
WORKDIR /app/apps/frontend
EXPOSE 5173
CMD ["pnpm", "preview"]
