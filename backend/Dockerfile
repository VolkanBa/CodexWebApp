FROM node:22-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci

FROM dependencies AS builder

WORKDIR /app
COPY backend backend
RUN npm --workspace backend run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN useradd --create-home --shell /usr/sbin/nologin appuser
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY --from=dependencies /app/node_modules node_modules
COPY --from=builder /app/backend/dist backend/dist
RUN mkdir -p backend/data uploads && chown -R appuser:appuser backend/data uploads
USER appuser
EXPOSE 4000
CMD ["npm", "--workspace", "backend", "run", "start"]
