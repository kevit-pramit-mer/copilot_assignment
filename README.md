# Task Management System

## Overview
A full-stack Task Management System with a PHP REST API backend, MySQL database, and React frontend.

## Tech Stack
- **Backend:** Pure PHP 8.x (no framework), MySQL 8.x, Apache (WAMP)
- **Frontend:** React 18 + Vite
- **Testing:** PHPUnit, Vitest + React Testing Library, Playwright

## Prerequisites
- WAMP Server (PHP 8.x + MySQL 8.x + Apache)
- Node.js 18+
- Composer

## Setup

### 1. Database
```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS task_manager;

-- Run the migration
mysql -u root -p task_manager < backend/migrations/create_tasks_table.sql
```

### 2. Backend
```bash
cd backend
composer install
```
Configure Apache virtual host or place in WAMP's `www` directory. The API will be accessible at `http://localhost/github_copilot_assignment/backend/api/tasks`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` with API proxy to backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (supports `?status=` and `?priority=` filters) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/stats` | Task counts grouped by status and priority |
| GET | `/api/tasks/:id` | Get a single task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| POST | `/api/tasks/:id/complete` | Mark a task as done |

## Running Tests

### Backend Tests
```bash
cd backend
./vendor/bin/phpunit --coverage-text
```

### Frontend Tests
```bash
cd frontend
npx vitest run --coverage
```

### E2E Tests
```bash
cd frontend
npx playwright test
```

## Project Structure
```
├── backend/          # PHP REST API
├── frontend/         # React app (Vite)
│   └── e2e/          # Playwright E2E tests
├── AGENTS.md         # Project agent configuration
└── COPILOT-LOG.md    # GitHub Copilot usage log
```

## License
MIT
