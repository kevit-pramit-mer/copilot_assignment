<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/Task.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

/**
 * TaskController — handles all HTTP request logic for task endpoints.
 * Maps HTTP methods and routes to CRUD operations on the Task model.
 * Validates input, enforces business rules, and returns proper HTTP status codes.
 */
class TaskController
{
    /** @var Task The Task model instance */
    private Task $task;

    /**
     * Initialize the controller with a Task model instance.
     *
     * @param Task|null $task Optional Task model (uses default if not provided)
     */
    public function __construct(?Task $task = null)
    {
        $this->task = $task ?? new Task();
    }

    /**
     * GET /api/tasks — List all tasks with optional status and priority filters.
     *
     * @return void Sends JSON response with array of tasks
     */
    public function index(): void
    {
        try {
            $status = $_GET['status'] ?? null;
            $priority = $_GET['priority'] ?? null;

            // Validate filter values if provided
            if ($status !== null && $status !== '') {
                $error = Validator::validateStatus($status);
                if ($error !== null) {
                    Response::error($error, 422);
                }
            }

            if ($priority !== null && $priority !== '') {
                $error = Validator::validatePriority($priority);
                if ($error !== null) {
                    Response::error($error, 422);
                }
            }

            $tasks = $this->task->getAll($status, $priority);
            Response::success($tasks);
        } catch (ResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log('TaskController::index error: ' . $e->getMessage());
            Response::error('An unexpected error occurred', 500);
        }
    }

    /**
     * POST /api/tasks — Create a new task.
     * Validates required title field and optional priority.
     *
     * @param array<string, mixed> $data Request body data
     * @return void Sends JSON response with created task (201)
     */
    public function store(array $data): void
    {
        try {
            // Validate title (required)
            $titleError = Validator::validateTitle($data['title'] ?? null);
            if ($titleError !== null) {
                Response::error($titleError, 400);
            }

            // Validate priority (optional, defaults to 'medium')
            if (isset($data['priority']) && $data['priority'] !== '') {
                $priorityError = Validator::validatePriority($data['priority']);
                if ($priorityError !== null) {
                    Response::error($priorityError, 422);
                }
            }

            $task = $this->task->create($data);
            Response::success($task, 201);
        } catch (ResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log('TaskController::store error: ' . $e->getMessage());
            Response::error('An unexpected error occurred', 500);
        }
    }

    /**
     * GET /api/tasks/stats — Return task counts grouped by status and priority.
     *
     * @return void Sends JSON response with statistics
     */
    public function stats(): void
    {
        try {
            $stats = $this->task->getStats();
            Response::success($stats);
        } catch (ResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log('TaskController::stats error: ' . $e->getMessage());
            Response::error('An unexpected error occurred', 500);
        }
    }

    /**
     * GET /api/tasks/:id — Get a single task by UUID.
     *
     * @param string $id The task UUID
     * @return void Sends JSON response with task data or 404
     */
    public function show(string $id): void
    {
        try {
            // Validate UUID format
            $uuidError = Validator::validateUuid($id);
            if ($uuidError !== null) {
                Response::error($uuidError, 422);
            }

            $task = $this->task->getById($id);
            if ($task === null) {
                Response::error('Task not found', 404);
            }

            Response::success($task);
        } catch (ResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log('TaskController::show error: ' . $e->getMessage());
            Response::error('An unexpected error occurred', 500);
        }
    }

    /**
     * PUT /api/tasks/:id — Update an existing task.
     * Validates all provided fields and enforces status transition rules.
     *
     * @param string $id The task UUID
     * @param array<string, mixed> $data Request body data with fields to update
     * @return void Sends JSON response with updated task or error
     */
    public function update(string $id, array $data): void
    {
        try {
            // Validate UUID format
            $uuidError = Validator::validateUuid($id);
            if ($uuidError !== null) {
                Response::error($uuidError, 422);
            }

            // Check task exists
            $existingTask = $this->task->getById($id);
            if ($existingTask === null) {
                Response::error('Task not found', 404);
            }

            // Validate title if provided
            if (isset($data['title'])) {
                $titleError = Validator::validateTitle($data['title']);
                if ($titleError !== null) {
                    Response::error($titleError, 400);
                }
            }

            // Validate status if provided
            if (isset($data['status']) && $data['status'] !== '') {
                $statusError = Validator::validateStatus($data['status']);
                if ($statusError !== null) {
                    Response::error($statusError, 422);
                }

                // Validate status transition
                $transitionError = Validator::validateStatusTransition(
                    $existingTask['status'],
                    $data['status']
                );
                if ($transitionError !== null) {
                    Response::error($transitionError, 422);
                }
            }

            // Validate priority if provided
            if (isset($data['priority']) && $data['priority'] !== '') {
                $priorityError = Validator::validatePriority($data['priority']);
                if ($priorityError !== null) {
                    Response::error($priorityError, 422);
                }
            }

            $task = $this->task->update($id, $data);
            Response::success($task);
        } catch (ResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log('TaskController::update error: ' . $e->getMessage());
            Response::error('An unexpected error occurred', 500);
        }
    }

    /**
     * DELETE /api/tasks/:id — Delete a task by UUID.
     *
     * @param string $id The task UUID
     * @return void Sends JSON response confirming deletion or 404
     */
    public function destroy(string $id): void
    {
        try {
            // Validate UUID format
            $uuidError = Validator::validateUuid($id);
            if ($uuidError !== null) {
                Response::error($uuidError, 422);
            }

            $deleted = $this->task->delete($id);
            if (!$deleted) {
                Response::error('Task not found', 404);
            }

            Response::success(['message' => 'Task deleted successfully']);
        } catch (ResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log('TaskController::destroy error: ' . $e->getMessage());
            Response::error('An unexpected error occurred', 500);
        }
    }

    /**
     * POST /api/tasks/:id/complete — Advance a task's status one step forward.
     * todo → in-progress, in-progress → done.
     *
     * @param string $id The task UUID
     * @return void Sends JSON response with updated task or error
     * @throws \Exception If database operation fails
     */
    public function complete(string $id): void
    {
        try {
            // Validate UUID format
            $uuidError = Validator::validateUuid($id);
            if ($uuidError !== null) {
                Response::error($uuidError, 422);
            }

            $result = $this->task->complete($id);

            if ($result === null) {
                Response::error('Task not found', 404);
            }

            if ($result === false) {
                Response::error('Task is already completed', 422);
            }

            Response::success($result);
        } catch (ResponseException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log('TaskController::complete error: ' . $e->getMessage());
            Response::error('An unexpected error occurred', 500);
        }
    }
}
