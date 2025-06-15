#!/bin/bash

# Build script for TickIT Frontend Docker images

set -e

echo "🐳 Building TickIT Frontend Docker Images..."

# Build production image
echo "📦 Building production image..."
docker build -t tickit-frontend:latest -t tickit-frontend:prod .

# Build development image
echo "🔧 Building development image..."
docker build -f Dockerfile.dev -t tickit-frontend:dev .

echo "✅ Build completed successfully!"
echo ""
echo "Available images:"
echo "  - tickit-frontend:latest (production)"
echo "  - tickit-frontend:prod (production)"
echo "  - tickit-frontend:dev (development)"
echo ""
echo "To run:"
echo "  Production:  docker-compose up"
echo "  Development: docker-compose -f docker-compose.dev.yml up"
