#!/bin/bash

# Database initialization script for TREND platform
# This script sets up the PostgreSQL database with the required schema

set -e

echo "🗄️  Initializing TREND platform database..."

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-trend_platform}
DB_USER=${DB_USER:-trend_user}
DB_PASSWORD=${DB_PASSWORD:-}

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD is required"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

# Check if PostgreSQL is running
echo "📡 Checking PostgreSQL connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT; then
    echo "❌ PostgreSQL is not running or not accessible"
    echo "Please start PostgreSQL and ensure it's accessible at $DB_HOST:$DB_PORT"
    exit 1
fi

# Create database if it doesn't exist
echo "🔨 Creating database if it doesn't exist..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists"

# Run the schema
echo "📋 Applying database schema..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/database/schema.sql

echo "✅ Database initialization complete!"
echo ""
echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🔗 Host: $DB_HOST:$DB_PORT"
echo ""
echo "🚀 You can now start the API server with: npm run dev"
