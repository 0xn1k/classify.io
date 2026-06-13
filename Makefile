SHELL := /bin/bash

.DEFAULT_GOAL := help

.PHONY: help setup env install prisma-generate prisma-migrate dev dev-api dev-web build build-api build-web typecheck verify clean

help: ## Show available commands.
	@awk 'BEGIN {FS = ":.*##"; printf "SchoolOS commands:\n\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  make %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: env install prisma-generate ## Create local env file, install dependencies, and generate Prisma client.

env: ## Create .env from .env.example if it does not exist.
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env from .env.example"; \
	else \
		echo ".env already exists"; \
	fi

install: ## Install workspace dependencies.
	npm install

prisma-generate: ## Generate Prisma client.
	npm run prisma:generate

prisma-migrate: ## Run Prisma development migrations.
	npm run prisma:migrate

dev: ## Start API and web development servers together.
	$(MAKE) -j2 dev-api dev-web

dev-api: ## Start the Hono API on PORT or 4000.
	npm run dev:api

dev-web: ## Start the Next.js web app on port 3000.
	npm run dev:web

build: build-api build-web ## Build API and web workspaces.

build-api: ## Build the API workspace.
	npm run build:api

build-web: ## Build the web workspace.
	npm run build:web

typecheck: ## Typecheck API and web workspaces.
	npm run typecheck

verify: typecheck build-web ## Run checks that do not require a database.

clean: ## Remove generated local build outputs.
	rm -rf apps/api/dist apps/web/.next
