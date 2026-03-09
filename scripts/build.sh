#!/bin/bash

# Build script for TREND platform
# Usage: ./scripts/build.sh [dev|prod]

set -e

ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "❌ Invalid environment. Use 'dev' or 'prod'"
    echo "Usage: ./scripts/build.sh [dev|prod]"
    exit 1
fi

echo "🔨 Building TREND $ENV environment..."

if [ "$ENV" = "dev" ]; then
    docker compose -f docker-compose.dev.yml build
else
    docker compose -f docker-compose.prod.yml build
fi

echo "✅ Build complete for $ENV environment!"
echo "Run './scripts/run.sh $ENV' to start the services"
