# AGENTS.md — Task Management System

## Project Architecture

This is a **full-stack Task Management System** with the following architecture:

```
┌─────────────────────┐       ┌──────────────────────────┐       ┌────────────┐
│  React 18 (Vite)    │──────▶│  Pure PHP 8.x REST API   │──────▶│  MySQL 8.x │
│  Port 5173          │ HTTP  │  Apache (WAMP) Port 80   │  PDO  │            │
└─────────────────────┘       └──────────────────────────┘       └────────────┘
```

### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Backend | Pure PHP 8.x (no framework) | Lightweight, full control over routing and logic |
| Database | MySQL 8.x | Relational, supports ENUM types, UUID generation |
| Frontend | React 18 + Vite | Modern, component-based, fast HMR |
| Unit Tests (Backend) | PHPUnit 10+ | Standard PHP testing framework |
| Unit Tests (Frontend) | Vitest + React Testing Library | Fast, Vite-native test runner |
| E2E Tests | Playwright | Cross-browser, supports MCP integration |

---

## Coding Standards

### Backend (PHP)

- **PSR-12** coding style
- All public methods must have **PHPDoc** blocks with `@param`, `@return`, `@throws`
- Use **PDO** with prepared statements for all database queries (prevent SQL injection)
- Never trust user input — validate and sanitize all POST/PUT data
- Use strict type declarations: `declare(strict_types=1);`
- Error handling: catch exceptions, never expose stack traces to clients
- No empty catch blocks — always log or handle errors
- File naming: PascalCase for classes (`Task.php`), camelCase for methods

### Frontend (React/JS)

- Functional components with hooks only (no class components)
- **JSDoc** on all exported functions and components
- Use `async/await` for API calls (no raw `.then()` chains)
- Every API call must have a loading state and error handling
- No `console.log` in production code (use toast notifications for user feedback)
- Component naming: PascalCase (`TaskTable.jsx`), hooks: `use` prefix (`useTasks.js`)
- CSS: descriptive class names, color-coded badges for priority and status

---

## API Response Envelope

**All endpoints** must return responses in this envelope format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "data": {
    "message": "Human-readable error message"
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| `200` | Successful GET, PUT, DELETE, complete |
| `201` | Successful POST (resource created) |
| `400` | Missing required field (e.g., title) |
| `404` | Resource not found |
| `422` | Validation error (invalid status/priority, invalid state transition) |
| `500` | Internal server error |

---

## Sub-Agents

### 1. `@ui-agent` (ui-agent.agent.md)
**Role:** Frontend specialist — React components, CSS styling, loading states, error toasts, accessibility.
**When to use:** For any frontend UI work — building components, styling, adding interactivity, handling user feedback.

### 2. `@backend-agent` (backend-agent.agent.md)
**Role:** Backend specialist — PHP validation, HTTP status codes, business logic, database queries, API documentation.
**When to use:** For any backend work — routes, controllers, models, validation rules, database operations.

### 3. `@testing-agent` (testing-agent.agent.md)
**Role:** Testing specialist — PHPUnit, Vitest, Playwright, test coverage, edge cases.
**When to use:** For writing or improving tests — unit tests, integration tests, E2E tests, achieving >80% coverage.

---

## Patterns to Follow

- **Envelope pattern:** Every API response wrapped in `{ success, data }`
- **Repository pattern:** Task model encapsulates all DB operations
- **Single Responsibility:** Controllers handle HTTP, models handle data, helpers handle utilities
- **Fail fast:** Validate input at the controller level before passing to model
- **Status machine:** Enforce `todo → in-progress → done` transitions strictly
- **Prepared statements:** Always use PDO prepared statements for queries
- **Component composition:** Small, reusable React components
- **Custom hooks:** Extract shared logic into `useTasks` hook
- **Toast notifications:** User feedback for all CRUD operations
- **Loading states:** Show spinner during every async operation

## Patterns to Avoid

- **No raw SQL concatenation** — always use prepared statements
- **No empty catch blocks** — always handle or log errors
- **No `console.log` in production** — use proper error/toast handling
- **No skipping status transitions** — `todo → done` is invalid
- **No global state mutation** — use React state and context
- **No inline styles** — use CSS classes
- **No framework magic** — pure PHP, explicit routing
- **No hardcoded URLs** — use config/environment for API base URL
- **No `any` types** — validate all data shapes
- **No missing error boundaries** — handle all error states in UI
