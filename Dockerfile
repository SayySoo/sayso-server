# ---------- Stage 1: deps (install all deps, incl dev) ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Stage 2: development (hot reload) ----------
FROM node:22-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]

# ---------- Stage 3: builder (compile TS) ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Stage 4: prod-deps (only prod deps) ----------
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev


# ---------- Stage 5: production (compiled JS + migrations) ----------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY package*.json ./

EXPOSE 8000
CMD ["node", "dist/index.js"]