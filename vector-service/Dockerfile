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
RUN addgroup -g 1001 trend-vector && \
    adduser -S -u 1001 -G trend-vector trend-vector
RUN chown -R trend-vector:trend-vector /app
USER trend-vector

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
