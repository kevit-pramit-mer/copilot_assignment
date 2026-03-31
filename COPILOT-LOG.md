# Copilot Usage Log

## 1. Inline Suggestions

> Examples of writing a comment block and accepting Copilot's Tab-generated code.

### Example 1 — `backend/config/database.php`
- **Comment typed:**
```php
// Database connection class using PDO singleton pattern
// Connects to MySQL with error handling and UTF-8 charset
// Returns the same PDO instance across the application
```
- **Copilot generated:** Complete `Database` class with `getInstance()` method, private constructor, PDO connection with `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, and UTF-8 charset configuration.

### Example 2 — `backend/models/Task.php`
- **Comment typed:**
```php
// Get all tasks from the database with optional status and priority filters
// Supports query parameters: ?status=todo|in-progress|done and ?priority=low|medium|high
// Returns array of task objects ordered by created_at descending
```
- **Copilot generated:** Complete `getAll()` method with dynamic WHERE clause building, PDO prepared statements with bound parameters, and ORDER BY created_at DESC.

### Example 3 — `backend/helpers/Validator.php`
- **Comment typed:**
```php
// Validate status transition follows the workflow: todo → in-progress → done
// Only allowed transitions: todo→in-progress, in-progress→done
// Returns true if transition is valid, false otherwise
```
- **Copilot generated:** `validateStatusTransition()` method with an allowed transitions map and lookup logic.

---

## 2. Agent Mode Prompts

### Prompt 1
- **Prompt:** "Generate the complete React frontend for a task management system with: TaskTable, TaskRow, TaskModal, FilterBar, SearchBar, StatsPanel, Toast notifications, Loading indicators, color-coded badges"
- **Files changed:** `frontend/src/components/TaskTable.jsx`, `TaskRow.jsx`, `TaskModal.jsx`, `FilterBar.jsx`, `SearchBar.jsx`, `StatsPanel.jsx`, `Toast.jsx`, `Loader.jsx`, `Badge.jsx`
- **Result:** Full component library with props, state management, and styling

### Prompt 2
- **Prompt:** "Create the API client module taskApi.js that calls all 7 backend endpoints with error handling and toast notifications"
- **Files changed:** `frontend/src/api/taskApi.js`
- **Result:** Complete API client with fetch wrappers for all CRUD operations

### Prompt 3
- **Prompt:** "Wire up App.jsx to integrate all components — fetch tasks on mount, handle CRUD, manage filter/search state, loading states, and error toasts"
- **Files changed:** `frontend/src/App.jsx`, `frontend/src/hooks/useTasks.js`, `frontend/src/context/ToastContext.jsx`
- **Result:** Fully integrated app with state management, filtering, search, and user feedback

---

## 3. Sub-Agent Usage

### @backend-agent
- **Prompt:** "Review TaskController.php for input validation, HTTP status codes, and edge cases"
- **Result:** Added UUID validation on :id parameters, added missing 422 response for invalid status transitions in update endpoint, added PHPDoc blocks to all controller methods

### @ui-agent
- **Prompt:** "Add proper loading spinners, error toast animations, and responsive CSS for the task table"
- **Result:** Added CSS animations for toast slide-in/out, added spinner component during API calls, made table responsive with horizontal scroll on mobile

### @testing-agent
- **Prompt:** "Generate PHPUnit tests for Task model covering all CRUD operations, validation errors, and status transition rules"
- **Result:** Created `TaskModelTest.php` with 16 test cases covering create, read, update, delete, complete, stats, and all validation error paths

---

## 4. Review Agent

### Review Command
```
Review backend/controllers/TaskController.php according to .github/copilot-instructions.md and list issues
```

### Issues Found
1. Missing PHPDoc on `complete()` method — no `@throws` tag
2. Missing UUID format validation on `:id` parameter in `show()`, `update()`, `destroy()`
3. `store()` method did not validate title length (max 200 chars)
4. Missing CORS `Access-Control-Max-Age` header for preflight caching
5. Error catch block in `update()` returned generic 500 without logging

### Fixes Applied
1. Added complete PHPDoc blocks to all controller methods
2. Added UUID regex validation helper and applied to all :id routes
3. Added `strlen($title) > 200` check in `store()` and `update()`
4. Added `Access-Control-Max-Age: 86400` header
5. Added `error_log()` call in all catch blocks before returning 500

---

## 5. Skills

- **Skill:** `vercel-labs/agent-skills`
- **Prompt:** "Analyze the frontend codebase for accessibility and performance improvements"
- **Changes applied:**
  1. Added `aria-label` attributes to all interactive buttons (Edit, Delete, Complete)
  2. Added `role="alert"` to toast notification component for screen reader announcements

---

## 6. Playwright MCP

- **Screenshot taken:** yes
- **E2E test generated:** `e2e/tests/tasks.spec.js`
- **Prompt used:** "Take a screenshot of the running task management app at localhost:5173, then generate Playwright E2E tests covering: page load, add task, complete task, delete task, and priority filter"
- **Result:** Generated comprehensive E2E test file with 5 test scenarios based on observed page structure
