# Task Management System — Build Plan

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Pure custom PHP 8.x (no framework), MySQL 8.x |
| Frontend | React 18+ (Vite), CSS Modules / Tailwind CSS |
| Testing (Backend) | PHPUnit |
| Testing (Frontend) | Vitest + React Testing Library |
| E2E Testing | Playwright |
| Server | WAMP (Apache + MySQL already available) |

---

## Project Directory Structure

```
github_copilot_assignment/
├── .github/
│   └── copilot-instructions.md          # Review Agent config (Requirement 5)
├── .vscode/
│   └── mcp.json                         # Playwright MCP config (Requirement 6)
├── backend/                             # Pure PHP REST API
│   ├── .htaccess                        # URL rewriting for clean routes
│   ├── index.php                        # Entry point — router
│   ├── config/
│   │   └── database.php                 # MySQL connection (PDO)
│   ├── models/
│   │   └── Task.php                     # Task model — CRUD + validation + business logic
│   ├── controllers/
│   │   └── TaskController.php           # Route handlers for all 7 endpoints
│   ├── helpers/
│   │   └── Response.php                 # JSON response envelope helper { success, data }
│   │   └── Validator.php                # Input validation helper
│   ├── migrations/
│   │   └── create_tasks_table.sql       # MySQL table schema
│   └── tests/
│       ├── phpunit.xml                  # PHPUnit config
│       ├── TaskModelTest.php            # Unit tests for model
│       └── TaskApiTest.php              # Integration tests for API endpoints
├── frontend/                            # React app (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx                     # App entry point
│   │   ├── App.jsx                      # Root component
│   │   ├── api/
│   │   │   └── taskApi.js               # API client — all fetch calls to backend
│   │   ├── components/
│   │   │   ├── TaskTable.jsx            # Task list table with badges
│   │   │   ├── TaskRow.jsx              # Single task row with action buttons
│   │   │   ├── TaskModal.jsx            # Add/Edit task modal form
│   │   │   ├── FilterBar.jsx            # Status + Priority filter dropdowns
│   │   │   ├── SearchBar.jsx            # Live search-as-you-type
│   │   │   ├── StatsPanel.jsx           # Task stats display
│   │   │   ├── Toast.jsx               # Error/success toast notifications
│   │   │   ├── Loader.jsx              # Loading spinner/indicator
│   │   │   └── Badge.jsx               # Color-coded priority/status badge
│   │   ├── hooks/
│   │   │   └── useTasks.js              # Custom hook for task state management
│   │   ├── context/
│   │   │   └── ToastContext.jsx         # Toast notification context provider
│   │   └── styles/
│   │       └── app.css                  # Global styles + badge colors
│   └── tests/
│       ├── components/                  # Component unit tests (Vitest + RTL)
│       │   ├── TaskTable.test.jsx
│       │   ├── TaskModal.test.jsx
│       │   ├── FilterBar.test.jsx
│       │   └── SearchBar.test.jsx
│       └── api/
│           └── taskApi.test.js          # API client tests
├── e2e/                                 # Playwright E2E tests
│   ├── playwright.config.js
│   └── tests/
│       └── tasks.spec.js               # Full E2E: load, add, complete, delete, filter
├── AGENTS.md                            # Project-level agent config (Requirement 4)
├── COPILOT-LOG.md                       # Usage log for all 6 features (Required doc)
├── ui-agent.agent.md                    # Sub-agent: Frontend specialist (Requirement 3)
├── backend-agent.agent.md              # Sub-agent: Backend specialist (Requirement 3)
├── testing-agent.agent.md              # Sub-agent: Testing specialist (Requirement 3)
├── plan.md                              # This file
├── README.md                            # Setup instructions & project overview
└── package.json                         # Root package.json for Playwright + scripts
```

---

## Phase-by-Phase Build Plan

---

### PHASE 0 — Project Scaffolding & Copilot Config Files
> **Goal:** Set up the project structure, Git repo, and ALL Copilot-related config files FIRST so they guide every subsequent step.

| Step | Task | Deliverable | Requirement |
|------|------|-------------|-------------|
| 0.1 | Initialize Git repo | `.gitignore` (node_modules, vendor, .env) | Submission |
| 0.2 | Create `AGENTS.md` | Document architecture (PHP+MySQL backend, React frontend), coding standards, API envelope `{ success, data }`, sub-agent descriptions, patterns to follow/avoid | **Req 4 — AGENTS.md** |
| 0.3 | Create `.github/copilot-instructions.md` | Review rules: docstrings, input validation, HTTP codes, no empty catch, loading states, >80% coverage | **Req 5 — Review Agent** |
| 0.4 | Create `ui-agent.agent.md` | name, description, capabilities (React, CSS, loading states, error toasts), context (frontend/src/**), instructions | **Req 3 — Sub-Agents** |
| 0.5 | Create `backend-agent.agent.md` | name, description, capabilities (PHP, MySQL, validation, HTTP codes, business logic), context (backend/**), instructions | **Req 3 — Sub-Agents** |
| 0.6 | Create `testing-agent.agent.md` | name, description, capabilities (PHPUnit, Vitest, Playwright, >80% coverage), context (tests/**, e2e/**), instructions | **Req 3 — Sub-Agents** |
| 0.7 | Create `.vscode/mcp.json` | Playwright MCP server config | **Req 6 — Playwright MCP** |
| 0.8 | Create `COPILOT-LOG.md` skeleton | Empty template with all 6 sections | Required doc |
| 0.9 | Install Skills: `npx skills add vercel-labs/agent-skills` | Skills installed in project | **Req 6 — Skills** |

---

### PHASE 1 — Backend: Database & Core Model (Inline Comment Suggestions)
> **Goal:** Build the MySQL schema + PHP Task model using **inline comments → Copilot Tab completions**.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 1.1 | Create MySQL migration SQL | — | `backend/migrations/create_tasks_table.sql` — tasks table with UUID (CHAR 36), title (VARCHAR 200 NOT NULL), description (TEXT NULL), status (ENUM 'todo','in-progress','done'), priority (ENUM 'low','medium','high'), created_at, updated_at |
| 1.2 | Run migration on MySQL via WAMP | — | Table created in database |
| 1.3 | Create `backend/config/database.php` | Inline comments | PDO connection singleton — write comment block describing purpose, let Copilot generate |
| 1.4 | Create `backend/helpers/Response.php` | Inline comments | Static methods: `success($data, $code=200)`, `error($message, $code)` — always returns `{ "success": bool, "data": ... }` envelope |
| 1.5 | Create `backend/helpers/Validator.php` | Inline comments | Validation for title (1-200 chars), status enum, priority enum, status transition logic |
| 1.6 | Create `backend/models/Task.php` | **Inline comments → Tab** | Full CRUD: `getAll($filters)`, `getById($id)`, `create($data)`, `update($id, $data)`, `delete($id)`, `complete($id)`, `getStats()` — write descriptive comment blocks, accept Copilot completions |
| 1.7 | **LOG** inline suggestion examples (≥3) | — | Update `COPILOT-LOG.md` Section 1 with comment → generated code pairs from steps 1.3–1.6 |

**Business Logic in Model:**
- `create()`: auto-generate UUID (`Ramsey\Uuid` or `bin2hex(random_bytes(16))` formatted), default status='todo', validate title+priority
- `update()`: validate status transition (todo→in-progress→done only), validate fields
- `complete()`: transition current status to next valid state (todo→in-progress OR in-progress→done)
- `getAll()`: support `?status=` and `?priority=` query param filters
- `getStats()`: SQL `GROUP BY status` + `GROUP BY priority` counts

---

### PHASE 2 — Backend: Router & Controller (Inline + Agent Mode)
> **Goal:** Build the PHP router and controller to expose all 7 API endpoints.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 2.1 | Create `backend/.htaccess` | — | Apache rewrite rules to route all `/api/*` requests to `index.php` |
| 2.2 | Create `backend/index.php` | Inline comments | Request router: parse URI + method, CORS headers, dispatch to TaskController |
| 2.3 | Create `backend/controllers/TaskController.php` | **Inline comments → Tab** | 7 handler methods mapping to the 7 endpoints — write comment describing each method, let Copilot generate |
| 2.4 | Test all endpoints manually (Postman/curl) | — | All 7 endpoints returning correct JSON envelope |
| 2.5 | Use **@backend-agent** to review & harden validation | **Sub-Agent usage** | Run prompt: "Review TaskController.php for input validation, HTTP status codes, and edge cases" |
| 2.6 | **LOG** inline suggestions + sub-agent usage | — | Update `COPILOT-LOG.md` Sections 1 & 3 |

**Endpoint → Controller mapping:**
```
GET    /api/tasks          → TaskController::index()      — list + filter
POST   /api/tasks          → TaskController::store()      — create
GET    /api/tasks/stats    → TaskController::stats()      — grouped counts
GET    /api/tasks/:id      → TaskController::show($id)    — single task
PUT    /api/tasks/:id      → TaskController::update($id)  — update
DELETE /api/tasks/:id      → TaskController::destroy($id) — delete
POST   /api/tasks/:id/complete → TaskController::complete($id) — mark done
```

**HTTP Status Codes:**
- `200` — success (GET, PUT, DELETE, complete)
- `201` — created (POST create)
- `400` — missing title
- `404` — task not found
- `422` — invalid status/priority or invalid status transition
- `500` — server error

---

### PHASE 3 — Frontend: React App (Agent Mode)
> **Goal:** Generate the entire React frontend using **Agent Mode** prompts.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 3.1 | Scaffold React app with Vite | Terminal | `npm create vite@latest frontend -- --template react` |
| 3.2 | Install dependencies | Terminal | `axios` (or use fetch), dev deps |
| 3.3 | **Agent Mode prompt #1:** "Generate the complete React frontend for a task management system with: TaskTable, TaskRow (with Edit/Delete/Complete buttons), TaskModal (add/edit form), FilterBar (status + priority dropdowns), SearchBar (live search), StatsPanel, Toast notifications, Loading indicators, color-coded badges" | **Agent Mode** | All component files created |
| 3.4 | **Agent Mode prompt #2:** "Create the API client module `taskApi.js` that calls all 7 backend endpoints and handles errors with toast notifications" | **Agent Mode** | `frontend/src/api/taskApi.js` |
| 3.5 | **Agent Mode prompt #3:** "Wire up the App.jsx to integrate all components — fetch tasks on mount, handle CRUD operations, manage filter/search state, show loading states and error toasts" | **Agent Mode** | Full working frontend |
| 3.6 | Use **@ui-agent** to polish UI | **Sub-Agent usage** | Run prompt: "Add proper loading spinners, error toast animations, and responsive CSS for the task table" |
| 3.7 | Configure Vite proxy to forward `/api` to PHP backend | — | `vite.config.js` proxy settings |
| 3.8 | **LOG** all Agent Mode prompts (≥3) + sub-agent | — | Update `COPILOT-LOG.md` Sections 2 & 3 |

**Frontend Requirements Checklist:**
- [ ] Task list table: title, priority badge, status badge, created date
- [ ] "Add Task" button → modal form (title required, description optional, priority select)
- [ ] Edit button → prefill modal form
- [ ] Delete button → confirm + delete
- [ ] Complete button → advance status (todo→in-progress→done)
- [ ] Filter dropdowns: status (all/todo/in-progress/done), priority (all/low/medium/high)
- [ ] Live search bar — filters task list as user types (client-side filter on title)
- [ ] Color-coded badges:
  - Priority: high=red, medium=orange, low=green
  - Status: todo=gray, in-progress=blue, done=green
- [ ] Loading spinner during API calls
- [ ] Error toast notifications on failures
- [ ] Success toast on create/update/delete

---

### PHASE 4 — Review Agent (copilot-instructions.md)
> **Goal:** Run Copilot review against the codebase and fix all findings.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 4.1 | Run review: `Review backend/controllers/TaskController.php according to .github/copilot-instructions.md and list issues` | **Review Agent** | List of issues found |
| 4.2 | Run review: `Review backend/models/Task.php according to .github/copilot-instructions.md and list issues` | **Review Agent** | List of issues found |
| 4.3 | Fix ALL issues Copilot finds (missing docstrings, validation gaps, empty catches, etc.) | — | Code updated |
| 4.4 | **LOG** issues found + fixes applied | — | Update `COPILOT-LOG.md` Section 4 |

---

### PHASE 5 — Skills Integration
> **Goal:** Install and use skills from the skills.sh ecosystem.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 5.1 | Install skills: `npx skills add vercel-labs/agent-skills` | — | Skills available |
| 5.2 | Use a skill in Agent Mode prompt to improve code (e.g., accessibility, performance, security audit) | **Skills** | At least 2 suggestions applied |
| 5.3 | **LOG** skill name, prompt used, changes made | — | Update `COPILOT-LOG.md` Section 5 |

---

### PHASE 6 — Backend Unit Tests (Testing Sub-Agent)
> **Goal:** Write PHPUnit tests with >80% coverage for all CRUD + validation + business logic.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 6.1 | Install PHPUnit via Composer | Terminal | `composer require --dev phpunit/phpunit` |
| 6.2 | Create `backend/tests/phpunit.xml` | — | PHPUnit config with coverage settings |
| 6.3 | Use **@testing-agent** to generate `TaskModelTest.php` | **Sub-Agent usage** | Tests for: create, read, update, delete, complete, getStats, validation errors, status transition errors, edge cases (empty title, invalid priority, nonexistent ID) |
| 6.4 | Use **@testing-agent** to generate `TaskApiTest.php` | **Sub-Agent usage** | Integration tests for all 7 endpoints with correct HTTP status codes |
| 6.5 | Run tests + verify >80% coverage | Terminal | `./vendor/bin/phpunit --coverage-text` |
| 6.6 | **LOG** testing-agent prompts | — | Update `COPILOT-LOG.md` Section 3 |

**Test Cases Must Cover:**
- Create task with valid data → 201
- Create task with missing title → 400
- Create task with invalid priority → 422
- Get all tasks → 200 + array
- Get all tasks with status filter → filtered results
- Get all tasks with priority filter → filtered results
- Get single task → 200
- Get nonexistent task → 404
- Update task with valid status transition → 200
- Update task with invalid status transition (todo→done) → 422
- Delete task → 200
- Delete nonexistent task → 404
- Complete task (todo→in-progress) → 200
- Complete task (in-progress→done) → 200
- Complete already done task → 422
- Stats endpoint → grouped counts

---

### PHASE 7 — Frontend Unit Tests
> **Goal:** Vitest + React Testing Library tests with >80% coverage.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 7.1 | Install test deps | Terminal | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `msw` (mock API) |
| 7.2 | Configure Vitest in `vite.config.js` | — | Test environment: jsdom, coverage provider |
| 7.3 | Write component tests | Agent Mode / Testing Agent | Tests for TaskTable, TaskModal, FilterBar, SearchBar, Badge, Toast |
| 7.4 | Write API client tests (with MSW mocking) | — | Tests for all 7 API functions |
| 7.5 | Run tests + verify >80% coverage | Terminal | `npx vitest run --coverage` |

---

### PHASE 8 — Playwright E2E Tests + MCP
> **Goal:** E2E tests using Playwright, with at least 1 test generated via Playwright MCP screenshot.

| Step | Task | Copilot Feature | Deliverable |
|------|------|-----------------|-------------|
| 8.1 | Install Playwright | Terminal | `npm init playwright@latest` in root |
| 8.2 | Configure `e2e/playwright.config.js` | — | Base URL pointing to running app |
| 8.3 | Start both backend (WAMP) + frontend (Vite dev) | — | App running at localhost |
| 8.4 | Use **Playwright MCP** to take a screenshot of running app | **Playwright MCP** | Screenshot captured |
| 8.5 | Use **Playwright MCP** in Agent Mode to generate E2E test from browser observation | **Playwright MCP + Agent Mode** | `e2e/tests/tasks.spec.js` |
| 8.6 | Ensure E2E tests cover: page load, add task, complete task, delete task, priority filter | — | All 5 scenarios passing |
| 8.7 | **LOG** Playwright MCP prompt + screenshot + test file | — | Update `COPILOT-LOG.md` Section 6 |

**E2E Test Scenarios:**
1. **Page Load** — app renders, task table visible
2. **Add Task** — click "Add Task", fill form, submit, verify task appears in table
3. **Complete Task** — click Complete button, verify status changes
4. **Delete Task** — click Delete button, confirm, verify task removed
5. **Priority Filter** — select "high" priority filter, verify only high-priority tasks shown

---

### PHASE 9 — Final Review, Polish & Documentation
> **Goal:** Final pass — ensure ALL requirements are met, all tests pass, docs are complete.

| Step | Task | Deliverable |
|------|------|-------------|
| 9.1 | Run ALL backend tests — confirm >80% coverage | Green test suite |
| 9.2 | Run ALL frontend tests — confirm >80% coverage | Green test suite |
| 9.3 | Run ALL E2E tests — confirm all 5 scenarios pass | Green test suite |
| 9.4 | Review `COPILOT-LOG.md` — ensure all 6 sections filled with real examples | Complete log |
| 9.5 | Review `AGENTS.md` — ensure all required sections present | Complete doc |
| 9.6 | Review `.github/copilot-instructions.md` — ensure all review rules present | Complete doc |
| 9.7 | Review all 3 `.agent.md` files — ensure each has name, description, capabilities, context, instructions | Complete docs |
| 9.8 | Review `.vscode/mcp.json` — Playwright MCP configured | Config file |
| 9.9 | Create `README.md` with setup instructions | Complete doc |
| 9.10 | Final Git commit + push to public GitHub repo | Submitted |

---

## Requirements Traceability Matrix

| # | Requirement | Phase | Verified By |
|---|-------------|-------|-------------|
| R1 | Inline Comment Suggestions (≥3 examples logged) | Phase 1, 2 | COPILOT-LOG.md Section 1 |
| R2 | Agent Mode (≥3 prompts logged) | Phase 3 | COPILOT-LOG.md Section 2 |
| R3 | Custom Sub-Agents (3 files, each used ≥1 time) | Phase 0, 2, 3, 6 | 3 agent.md files + COPILOT-LOG.md Section 3 |
| R4 | AGENTS.md (architecture, standards, envelope, agents, patterns) | Phase 0 | AGENTS.md |
| R5 | Review Agent / copilot-instructions.md | Phase 0, 4 | copilot-instructions.md + COPILOT-LOG.md Section 4 |
| R6a | Skills (install + use + ≥2 suggestions applied) | Phase 5 | COPILOT-LOG.md Section 5 |
| R6b | Playwright MCP (screenshot + ≥1 E2E test generated) | Phase 8 | .vscode/mcp.json + COPILOT-LOG.md Section 6 |
| R7 | Backend REST API (7 endpoints, correct codes, envelope) | Phase 1, 2 | API integration tests |
| R8 | Task schema (UUID, title, description, status, priority, timestamps) | Phase 1 | MySQL migration + model |
| R9 | Business rules (status workflow, validation, error codes) | Phase 1, 2 | Unit tests |
| R10 | Frontend (table, modal, CRUD buttons, filters, search, badges, loading, toasts) | Phase 3 | Component tests + E2E |
| R11 | Unit tests >80% coverage | Phase 6, 7 | PHPUnit + Vitest coverage reports |
| R12 | E2E tests (5 scenarios) | Phase 8 | Playwright test results |
| R13 | COPILOT-LOG.md (all 6 sections) | All phases | Document review |

---

## Key Decisions & Notes

1. **MySQL over tasks.json:** The assignment says "persist to local file (tasks.json or equivalent)". Since we're using PHP+MySQL, MySQL IS the equivalent persistent storage — this is a stronger solution than flat-file JSON.

2. **UUID generation in PHP:** Will use `sprintf('%s-%s-%s-%s-%s', ...)` on `random_bytes()` for UUID v4 generation without external dependencies — OR use MySQL `UUID()` function.

3. **CORS:** Backend must send `Access-Control-Allow-Origin: *` headers (or specific origin) + handle OPTIONS preflight for the React dev server.

4. **API envelope:** EVERY response must follow `{ "success": true/false, "data": ... }` — this is enforced by the Response helper and documented in AGENTS.md.

5. **Status transition enforcement:**
   - `todo` → `in-progress` ✅
   - `in-progress` → `done` ✅
   - `todo` → `done` ❌ (422 error)
   - `done` → anything ❌ (422 error)
   - `in-progress` → `todo` ❌ (422 error)

6. **React frontend runs on Vite dev server (port 5173)** with proxy to PHP backend (port 80 via WAMP). In production, React build is served as static files.

7. **Complete endpoint behavior:** The `/api/tasks/:id/complete` endpoint advances status one step forward:
   - If `todo` → sets to `in-progress`
   - If `in-progress` → sets to `done`
   - If `done` → returns 422 (already completed)

---

## Estimated Phase Effort

| Phase | Description | Effort |
|-------|-------------|--------|
| 0 | Scaffolding + Config Files | Small |
| 1 | Backend Model + DB | Medium |
| 2 | Backend Router + Controller | Medium |
| 3 | Frontend React App | Large |
| 4 | Review Agent | Small |
| 5 | Skills Integration | Small |
| 6 | Backend Unit Tests | Medium |
| 7 | Frontend Unit Tests | Medium |
| 8 | Playwright E2E | Medium |
| 9 | Final Review | Small |
