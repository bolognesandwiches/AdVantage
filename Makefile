# AdVantage DSP Log Analytics Platform
# Development environment commands

.PHONY: dev dev-build dev-up dev-down

dev: dev-build dev-up

dev-build:
	@echo "Building development containers..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml build

dev-up:
	@echo "Starting development environment..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d
	@echo "Development environment running at http://localhost:3000"

dev-down:
	@echo "Shutting down development environment..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml down

# Restart commands
.PHONY: restart-frontend restart-backend restart-db restart-all

restart-frontend:
	@echo "Restarting frontend container..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml restart frontend

restart-backend:
	@echo "Restarting backend container..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml restart backend

restart-db:
	@echo "Restarting database container..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml restart postgres

restart-all:
	@echo "Restarting all containers..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml restart

# Logs commands
.PHONY: logs logs-backend logs-frontend logs-db

logs:
	@echo "Showing logs for all services..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f

logs-backend:
	@echo "Showing logs for backend service..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f backend

logs-frontend:
	@echo "Showing logs for frontend service..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f frontend

logs-db:
	@echo "Showing logs for database service..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f postgres

# Frontend commands
.PHONY: gen-package-lock fix-babel rebuild-frontend

gen-package-lock:
	@echo "Generating package-lock.json for frontend..."
	./scripts/generate-package-lock.sh

fix-babel:
	@echo "Fixing Babel conflicts in frontend..."
	./scripts/fix-babel-conflict.sh

rebuild-frontend: fix-babel
	@echo "Rebuilding and restarting frontend container..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml build frontend
	docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d --no-deps frontend
	@echo "Frontend rebuilt and restarted"

# Testing commands
.PHONY: test-backend test-frontend test-e2e

test-backend:
	docker-compose -f infrastructure/docker/docker-compose.dev.yml exec backend go test ./...

test-frontend:
	docker-compose -f infrastructure/docker/docker-compose.dev.yml exec frontend npm run test

# Database management
.PHONY: db-migrate db-seed db-reset

db-migrate:
	docker-compose -f infrastructure/docker/docker-compose.dev.yml exec backend go run ./cmd/migrate

db-seed:
	docker-compose -f infrastructure/docker/docker-compose.dev.yml exec backend go run ./cmd/seed

db-reset: db-down db-up
	@echo "Database reset complete"

db-up:
	docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d postgres

db-down:
	docker-compose -f infrastructure/docker/docker-compose.dev.yml stop postgres
	docker-compose -f infrastructure/docker/docker-compose.dev.yml rm -f postgres 