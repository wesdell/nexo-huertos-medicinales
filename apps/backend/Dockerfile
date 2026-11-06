FROM node:22-alpine
RUN apk add --no-cache openssl && corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile --filter backend...
COPY packages/shared packages/shared
COPY apps/backend apps/backend
RUN pnpm --filter @nexo/shared build \
 && pnpm --filter backend exec prisma generate \
 && pnpm --filter backend build
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec prisma db seed && node dist/main.js"]
