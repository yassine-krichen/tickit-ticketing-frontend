# Build script for TickIT Frontend Docker images (PowerShell)

Write-Host "🐳 Building TickIT Frontend Docker Images..." -ForegroundColor Blue

try {
    # Build production image
    Write-Host "📦 Building production image..." -ForegroundColor Yellow
    docker build -t tickit-frontend:latest -t tickit-frontend:prod .

    # Build development image
    Write-Host "🔧 Building development image..." -ForegroundColor Yellow
    docker build -f Dockerfile.dev -t tickit-frontend:dev .

    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available images:" -ForegroundColor Cyan
    Write-Host "  - tickit-frontend:latest (production)" -ForegroundColor White
    Write-Host "  - tickit-frontend:prod (production)" -ForegroundColor White
    Write-Host "  - tickit-frontend:dev (development)" -ForegroundColor White
    Write-Host ""
    Write-Host "To run:" -ForegroundColor Cyan
    Write-Host "  Production:  docker-compose up" -ForegroundColor White
    Write-Host "  Development: docker-compose -f docker-compose.dev.yml up" -ForegroundColor White
}
catch {
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
