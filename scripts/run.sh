#!/bin/bash

# Run script for TREND platform
# Usage: ./scripts/run.sh [dev|prod]

set -e

ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "❌ Invalid environment. Use 'dev' or 'prod'"
    echo "Usage: ./scripts/run.sh [dev|prod]"
    exit 1
fi

echo "🚀 Starting TREND $ENV environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one with your API keys."
    echo "   Copy .env.example to .env and fill in your values."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
if [ "$ENV" = "dev" ]; then
    docker compose -f docker-compose.dev.yml down --remove-orphans
else
    docker compose -f docker-compose.prod.yml down --remove-orphans
fi

# Start services
echo "🔨 Starting $ENV services..."
if [ "$ENV" = "dev" ]; then
    docker compose -f docker-compose.dev.yml up -d
else
    docker compose -f docker-compose.prod.yml up -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
if [ "$ENV" = "dev" ]; then
    docker compose -f docker-compose.dev.yml ps
else
    docker compose -f docker-compose.prod.yml ps
fi

echo "✅ $ENV environment is ready!"

if [ "$ENV" = "dev" ]; then
    echo "🌐 Client: http://localhost:8088"
    echo "🔧 API: http://localhost:8088/api"
    echo "📊 Database: localhost:5432"
    echo "🗄️  Redis: localhost:6379"
else
    echo "🌐 Client: http://localhost:8080"
    echo "🔧 API: http://localhost:8080/api"
    echo "🔒 HTTPS: https://localhost:8443"
fi
