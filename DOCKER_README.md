# Docker Setup for TickIT Frontend

This document provides instructions for running the Angular frontend application using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Quick Start

### Production Build

1. **Build and run the production container:**

   ```bash
   docker-compose up --build
   ```

2. **Or build the image separately:**

   ```bash
   docker build -t tickit-frontend .
   docker run -p 4201:80 -e API_URL=http://localhost:8080 tickit-frontend
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:4201`

### Development Build (with hot reload)

1. **Run the development container:**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:4201`

## Environment Configuration

The application supports runtime environment configuration through environment variables:

| Variable     | Description          | Default Value           |
| ------------ | -------------------- | ----------------------- |
| `API_URL`    | Backend API URL      | `http://localhost:8080` |
| `PRODUCTION` | Production mode flag | `false`                 |

### Setting Environment Variables

**Using Docker Compose:**

```yaml
environment:
  - API_URL=http://your-backend-url:8080
  - PRODUCTION=false
```

**Using Docker Run:**

```bash
docker run -p 4201:80 \
  -e API_URL=http://your-backend-url:8080 \
  -e PRODUCTION=false \
  tickit-frontend
```

## Docker Files Overview

### Dockerfile

- **Multi-stage build** for optimized production images
- Uses Node.js 12.16.3 Alpine for building
- Uses Nginx Alpine for serving
- Includes gzip compression and security headers
- Supports runtime environment configuration

### Dockerfile.dev

- Single-stage build for development
- Includes hot reload capability
- Mounts source code as volume for live updates

### .dockerignore

- Excludes unnecessary files for faster builds
- Reduces image size by excluding dev dependencies, tests, and documentation

### nginx.conf

- Optimized Nginx configuration
- Gzip compression enabled
- Security headers included
- Angular routing support (SPA)
- Cache configuration for static assets

## Performance Optimizations

1. **Multi-stage builds**: Separates build and runtime environments
2. **Alpine Linux**: Smaller base images
3. **Node modules caching**: Uses `npm ci` for faster, reproducible builds
4. **Gzip compression**: Reduces payload size
5. **Static asset caching**: Long-term caching for JS/CSS files
6. **.dockerignore**: Excludes unnecessary files from build context

## Production Deployment

For production deployment, make sure to:

1. Set `PRODUCTION=true` environment variable
2. Update `API_URL` to point to your production backend
3. Use HTTPS in production environments
4. Consider using a reverse proxy (like Traefik or nginx-proxy) for SSL termination

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change the port mapping if 4201 is already in use
2. **API connectivity**: Ensure the backend service is accessible from the container
3. **CORS issues**: Configure your backend to allow requests from the frontend domain

### Useful Commands

```bash
# View container logs
docker-compose logs -f tickit-frontend

# Rebuild without cache
docker-compose build --no-cache

# Stop and remove containers
docker-compose down

# Remove all unused Docker resources
docker system prune -a
```

## Development Workflow

1. **Start development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Make changes to your code** - they will be automatically reflected in the container

3. **Build production image before deployment:**
   ```bash
   docker build -t tickit-frontend:latest .
   ```

## Security Considerations

- The nginx configuration includes security headers
- Runtime environment variables should not contain sensitive information
- Use secrets management for production deployments
- Regularly update base images for security patches
