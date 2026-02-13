ARG NODE_VERSION=24.12.0
ARG TURBO_VERSION=2.7.2
ARG PNPM_VERSION=10.26.2

FROM node:${NODE_VERSION}-bookworm AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
RUN corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS prepare
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm dlx turbo@${TURBO_VERSION} prune api --docker

FROM base AS builder
COPY --from=prepare /app/out/json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full .
RUN pnpm check-types
RUN pnpm lint
RUN pnpm build

FROM base AS runner-deps
COPY --from=prepare /app/out/json .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --prod --frozen-lockfile
COPY --from=prepare /app/out/full .

FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
COPY --from=runner-deps /app .
COPY --from=builder /app/apps/api/dist apps/api/dist
USER node

ENV PORT=3030
ENV RTC_MIN_PORT=4000
ENV RTC_MAX_PORT=4999
ENV NODE_ENV=production

EXPOSE ${PORT}
EXPOSE ${RTC_MIN_PORT}-${RTC_MAX_PORT}/udp
EXPOSE ${RTC_MIN_PORT}-${RTC_MAX_PORT}/tcp

CMD ["node", "apps/api/dist/main.js"]
