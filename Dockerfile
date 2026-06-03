# Dockerfile - Cloud Monitor API
# Multi-stage build for optimized production image

# Stage 1: Dependencies layer
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy only package files to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Stage 2: Production build
FROM node:20-alpine AS production

WORKDIR /app

# Metadata labels
LABEL maintainer="Cloud Services <cloud@services.com>"
LABEL description="Cloud Infrastructure Monitoring Service with GitHub Actions CI/CD"
LABEL version="1.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS="--max-old-space-size=256"

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs src/ ./src/
COPY --chown=nodejs:nodejs package*.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "src/server.js"]
