FROM node:22-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci

FROM dependencies AS builder

WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY frontend frontend
RUN npm --workspace frontend run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN useradd --create-home --shell /usr/sbin/nologin appuser
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY --from=dependencies /app/node_modules node_modules
COPY --from=builder /app/frontend frontend
USER appuser
EXPOSE 3000
CMD ["npm", "--workspace", "frontend", "run", "start"]
