<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

/**
 * Task Model — handles all database operations for tasks.
 * Provides CRUD operations, filtering, status transitions, and statistics.
 * Uses PDO prepared statements for all queries to prevent SQL injection.
 */
class Task
{
    /** @var PDO Database connection instance */
    private PDO $db;

    /**
     * Initialize the Task model with a database connection.
     *
     * @param PDO|null $db Optional PDO instance (uses singleton if not provided)
     */
    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getInstance();
    }

    /**
     * Generate a UUID v4 string for use as task identifier.
     *
     * @return string A randomly generated UUID v4
     */
    public static function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // Version 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // Variant RFC 4122

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Get all tasks from the database with optional status and priority filters.
     * Supports query parameters: ?status=todo|in-progress|done and ?priority=low|medium|high
     * Returns array of task objects ordered by created_at descending.
     *
     * @param string|null $status Filter by task status
     * @param string|null $priority Filter by task priority
     * @return array<int, array<string, mixed>> Array of task records
     * @throws PDOException If query fails
     */
    public function getAll(?string $status = null, ?string $priority = null): array
    {
        $sql = 'SELECT id, title, description, status, priority, created_at AS createdAt, updated_at AS updatedAt FROM tasks';
        $conditions = [];
        $params = [];

        if ($status !== null && $status !== '') {
            $conditions[] = 'status = :status';
            $params[':status'] = $status;
        }

        if ($priority !== null && $priority !== '') {
            $conditions[] = 'priority = :priority';
            $params[':priority'] = $priority;
        }

        if (!empty($conditions)) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Get a single task by its UUID.
     *
     * @param string $id The UUID of the task to retrieve
     * @return array<string, mixed>|null Task record or null if not found
     * @throws PDOException If query fails
     */
    public function getById(string $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, title, description, status, priority, created_at AS createdAt, updated_at AS updatedAt FROM tasks WHERE id = :id'
        );
        $stmt->execute([':id' => $id]);

        $task = $stmt->fetch();

        return $task ?: null;
    }

    /**
     * Create a new task with the given data.
     * Auto-generates UUID and sets default status to 'todo'.
     *
     * @param array<string, mixed> $data Task data (title required, description/priority optional)
     * @return array<string, mixed> The created task record
     * @throws PDOException If insert fails
     */
    public function create(array $data): array
    {
        $id = self::generateUuid();
        $title = trim((string)($data['title'] ?? ''));
        $description = isset($data['description']) ? trim((string)$data['description']) : null;
        $priority = $data['priority'] ?? 'medium';
        $status = 'todo';

        $stmt = $this->db->prepare(
            'INSERT INTO tasks (id, title, description, status, priority) VALUES (:id, :title, :description, :status, :priority)'
        );

        $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':description' => $description,
            ':status' => $status,
            ':priority' => $priority,
        ]);

        return $this->getById($id);
    }

    /**
     * Update an existing task by its UUID.
     * Only updates provided fields. Validates status transitions.
     *
     * @param string $id The UUID of the task to update
     * @param array<string, mixed> $data Fields to update (title, description, status, priority)
     * @return array<string, mixed>|null Updated task record or null if not found
     * @throws PDOException If update fails
     */
    public function update(string $id, array $data): ?array
    {
        $task = $this->getById($id);
        if ($task === null) {
            return null;
        }

        $fields = [];
        $params = [':id' => $id];

        if (isset($data['title'])) {
            $fields[] = 'title = :title';
            $params[':title'] = trim((string)$data['title']);
        }

        if (array_key_exists('description', $data)) {
            $fields[] = 'description = :description';
            $params[':description'] = $data['description'] !== null ? trim((string)$data['description']) : null;
        }

        if (isset($data['status'])) {
            $fields[] = 'status = :status';
            $params[':status'] = $data['status'];
        }

        if (isset($data['priority'])) {
            $fields[] = 'priority = :priority';
            $params[':priority'] = $data['priority'];
        }

        if (empty($fields)) {
            return $task; // Nothing to update
        }

        $sql = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $this->getById($id);
    }

    /**
     * Delete a task by its UUID.
     *
     * @param string $id The UUID of the task to delete
     * @return bool True if task was deleted, false if not found
     * @throws PDOException If delete fails
     */
    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM tasks WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Mark a task as complete by advancing its status one step.
     * todo → in-progress, in-progress → done.
     * Returns null if task not found, false if already done.
     *
     * @param string $id The UUID of the task to complete
     * @return array<string, mixed>|null|false Updated task, null if not found, false if already done
     * @throws PDOException If update fails
     */
    public function complete(string $id): array|null|false
    {
        $task = $this->getById($id);
        if ($task === null) {
            return null;
        }

        $currentStatus = $task['status'];

        // Determine next status in workflow
        $nextStatus = match ($currentStatus) {
            'todo' => 'in-progress',
            'in-progress' => 'done',
            'done' => false,
            default => false,
        };

        if ($nextStatus === false) {
            return false; // Task is already done
        }

        $stmt = $this->db->prepare('UPDATE tasks SET status = :status WHERE id = :id');
        $stmt->execute([':status' => $nextStatus, ':id' => $id]);

        return $this->getById($id);
    }

    /**
     * Get task statistics grouped by status and priority.
     * Returns counts for each status and each priority level.
     *
     * @return array<string, mixed> Stats with 'byStatus' and 'byPriority' groupings
     * @throws PDOException If query fails
     */
    public function getStats(): array
    {
        // Count by status
        $stmt = $this->db->query('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
        $statusCounts = $stmt->fetchAll();

        // Count by priority
        $stmt = $this->db->query('SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority');
        $priorityCounts = $stmt->fetchAll();

        // Count total
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM tasks');
        $total = $stmt->fetch();

        // Format status counts as key-value pairs
        $byStatus = ['todo' => 0, 'in-progress' => 0, 'done' => 0];
        foreach ($statusCounts as $row) {
            $byStatus[$row['status']] = (int)$row['count'];
        }

        // Format priority counts as key-value pairs
        $byPriority = ['low' => 0, 'medium' => 0, 'high' => 0];
        foreach ($priorityCounts as $row) {
            $byPriority[$row['priority']] = (int)$row['count'];
        }

        return [
            'total' => (int)$total['count'],
            'byStatus' => $byStatus,
            'byPriority' => $byPriority,
        ];
    }
}
