.PHONY: help up down build logs logs-backend logs-frontend logs-db test db-reset clean restart

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker-compose up -d
	@echo "Services started. Backend: http://localhost:8080, Frontend: http://localhost:3000"

down: ## Stop all services
	docker-compose down

build: ## Build all services
	docker-compose build

rebuild: ## Rebuild and restart all services
	docker-compose down
	docker-compose build
	docker-compose up -d

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show logs from backend service
	docker-compose logs -f backend

logs-frontend: ## Show logs from frontend service
	docker-compose logs -f frontend

logs-db: ## Show logs from database service
	docker-compose logs -f db

test: ## Run backend tests
	cd backend && mvn test

db-reset: ## Reset database (WARNING: This will delete all data)
	docker-compose down -v
	docker-compose up -d db
	@echo "Waiting for database to be ready..."
	@sleep 5
	docker-compose up -d backend

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all
	@echo "Cleaned up all containers, volumes, and images"

restart: ## Restart all services
	docker-compose restart

status: ## Show status of all services
	docker-compose ps
