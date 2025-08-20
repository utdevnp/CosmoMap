# Install dependencies only when needed
FROM --platform=$BUILDPLATFORM node:18-alpine AS deps
WORKDIR /app

# Install yarn globally
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 make g++ && \
    npm install -g yarn && \
    apk del .build-deps

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Rebuild the source code only when needed
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder
WORKDIR /app

# Install yarn globally for builder stage
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 make g++ && \
    npm install -g yarn && \
    apk del .build-deps

# Copy package files and install dependencies
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built assets and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"] 