ARG NODE_VERSION=24.12.0
ARG TURBO_VERSION=2.7.2
ARG PNPM_VERSION=10.26.2

FROM node:${NODE_VERSION}-bookworm AS base
ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS prepare
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm dlx turbo@${TURBO_VERSION} prune api --docker

FROM base AS prod-deps
COPY --from=prepare /app/out/json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --prod --frozen-lockfile
COPY --from=prepare /app/out/full .

FROM base AS builder
COPY --from=prepare /app/out/json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full .
RUN pnpm build

FROM node:${NODE_VERSION}-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app .
COPY --from=builder /app/apps/api/dist apps/api/dist
USER node

EXPOSE 3030
EXPOSE 4000-4999/udp
EXPOSE 4000-4999/tcp

CMD ["node", "apps/api/dist/main.js"]
