#!/bin/bash

# Morphe Labs CMS - Quick Start Script
# This script helps you get the development environment up and running

set -e

echo "🚀 Morphe Labs CMS - Quick Start"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo "📋 Checking prerequisites..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 15+ and try again"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20 LTS and try again"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Navigate to backend directory
cd backend

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Check if database exists
echo "🗄️  Checking database..."
DB_NAME="morphe_cms_dev"

if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb -U postgres $DB_NAME
        createdb -U postgres $DB_NAME
        echo -e "${GREEN}✅ Database recreated${NC}"
    fi
else
    echo "Creating database '$DB_NAME'..."
    createdb -U postgres $DB_NAME
    echo -e "${GREEN}✅ Database created${NC}"
fi
echo ""

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate
echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

# Run seeders
echo "🌱 Seeding initial data..."
npm run db:seed
echo -e "${GREEN}✅ Seeders completed${NC}"
echo ""

# Success message
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@morphelabs.com"
echo "  Password: Admin@123456"
echo ""
echo "To start the development server:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "The API will be available at: http://localhost:5000"
echo ""
echo -e "${YELLOW}⚠️  Remember to change the admin password in production!${NC}"
