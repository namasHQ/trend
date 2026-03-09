FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Create non-root user
RUN addgroup -g 1001 trend-indexer && \
    adduser -S -u 1001 -G trend-indexer trend-indexer
RUN chown -R trend-indexer:trend-indexer /app
USER trend-indexer

# Expose port
EXPOSE 3007

# Start the application
CMD ["npm", "start"]
