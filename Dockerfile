# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Install yarn globally
RUN apk add --no-cache yarn

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies using yarn with network resilience
RUN yarn config set network-timeout 300000 && \
    yarn config set registry https://registry.npmjs.org/ && \
    yarn install --frozen-lockfile --network-timeout 300000

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Install yarn globally
RUN apk add --no-cache yarn

# Copy package files and install dependencies
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application using yarn
RUN yarn build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built assets and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["yarn", "start"] 