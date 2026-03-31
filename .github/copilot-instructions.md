# GitHub Copilot Instructions

## Code Review Checklist

When reviewing code in this project, check for the following:

### 1. Documentation
- All public PHP methods must have **PHPDoc** blocks with `@param`, `@return`, and `@throws` tags
- All exported JavaScript/React functions must have **JSDoc** comments
- Complex business logic must have inline comments explaining "why"

### 2. Input Validation
- Every `POST` route must validate all required fields before processing
- Every `PUT` route must validate all provided fields and enforce business rules
- Title must be validated: required, string, 1–200 characters
- Status must be one of: `todo`, `in-progress`, `done`
- Priority must be one of: `low`, `medium`, `high`
- Status transitions must follow: `todo → in-progress → done` (no skipping)
- UUIDs must be validated on `:id` parameters

### 3. HTTP Status Codes
- `200` for successful GET, PUT, DELETE, and complete operations
- `201` for successful POST (resource creation)
- `400` for missing required fields (e.g., missing title)
- `404` when a requested resource is not found
- `422` for validation errors (invalid status, priority, or status transition)
- `500` for unexpected server errors (with generic message, no stack trace)

### 4. Error Handling
- **No empty catch blocks** — every catch must log the error or return a meaningful response
- PHP exceptions must be caught and returned as JSON error responses
- JavaScript `try/catch` blocks around all API calls
- Network errors must show user-friendly toast notifications
- Never expose internal error details or stack traces to the client

### 5. Frontend Quality
- Every API call must have an associated **loading state** (spinner/indicator)
- **Error toast notifications** must appear for failed operations
- **Success toast notifications** for create, update, delete, and complete
- Forms must show validation errors before submitting
- Buttons must be disabled during pending operations (prevent double-submit)
- Search and filter must work without page reload

### 6. Security
- All SQL queries must use **PDO prepared statements** (no string concatenation)
- User input must be sanitized before processing
- CORS headers must be properly configured
- No sensitive data in error responses

### 7. Testing
- Unit test coverage must be **>80%** for both backend and frontend
- All CRUD operations must have tests
- All validation error paths must have tests
- All status transition rules must have tests
- Edge cases: empty strings, null values, nonexistent IDs, already-done tasks

### 8. Code Quality
- No `console.log` in production code
- No hardcoded values — use constants or config
- No unused variables or imports
- Follow PSR-12 for PHP, standard React patterns for frontend
- DRY — no duplicated validation logic
