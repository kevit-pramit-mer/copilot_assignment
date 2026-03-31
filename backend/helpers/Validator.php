<?php

declare(strict_types=1);

/**
 * Input validation helper for the Task Management System.
 * Validates title, status, priority fields and enforces status transition rules.
 * Centralizes all validation logic to keep controllers DRY.
 */
class Validator
{
    /** @var array<string> Valid task statuses */
    public const VALID_STATUSES = ['todo', 'in-progress', 'done'];

    /** @var array<string> Valid task priorities */
    public const VALID_PRIORITIES = ['low', 'medium', 'high'];

    /**
     * Map of allowed status transitions.
     * Key = current status, Value = array of valid next statuses.
     *
     * @var array<string, array<string>>
     */
    public const ALLOWED_TRANSITIONS = [
        'todo' => ['in-progress'],
        'in-progress' => ['done'],
        'done' => [],
    ];

    /**
     * Validate that a title is present and within length constraints.
     *
     * @param mixed $title The title value to validate
     * @return string|null Error message if invalid, null if valid
     */
    public static function validateTitle(mixed $title): ?string
    {
        if ($title === null || $title === '') {
            return 'Title is required';
        }

        if (!is_string($title)) {
            return 'Title must be a string';
        }

        $title = trim($title);

        if ($title === '') {
            return 'Title is required';
        }

        if (strlen($title) > 200) {
            return 'Title must be between 1 and 200 characters';
        }

        return null;
    }

    /**
     * Validate that a status value is one of the allowed statuses.
     *
     * @param mixed $status The status value to validate
     * @return string|null Error message if invalid, null if valid
     */
    public static function validateStatus(mixed $status): ?string
    {
        if ($status === null || $status === '') {
            return null; // Status is optional on update
        }

        if (!in_array($status, self::VALID_STATUSES, true)) {
            return 'Status must be one of: todo, in-progress, done';
        }

        return null;
    }

    /**
     * Validate that a priority value is one of the allowed priorities.
     *
     * @param mixed $priority The priority value to validate
     * @return string|null Error message if invalid, null if valid
     */
    public static function validatePriority(mixed $priority): ?string
    {
        if ($priority === null || $priority === '') {
            return null; // Priority is optional on update
        }

        if (!in_array($priority, self::VALID_PRIORITIES, true)) {
            return 'Priority must be one of: low, medium, high';
        }

        return null;
    }

    /**
     * Validate status transition follows the workflow: todo → in-progress → done.
     * Only allowed transitions: todo→in-progress, in-progress→done.
     * Returns true if transition is valid, false otherwise.
     *
     * @param string $currentStatus The current status of the task
     * @param string $newStatus The desired new status
     * @return string|null Error message if invalid transition, null if valid
     */
    public static function validateStatusTransition(string $currentStatus, string $newStatus): ?string
    {
        if ($currentStatus === $newStatus) {
            return null; // No transition, no error
        }

        $allowed = self::ALLOWED_TRANSITIONS[$currentStatus] ?? [];

        if (!in_array($newStatus, $allowed, true)) {
            return sprintf(
                'Invalid status transition: %s → %s. Allowed: %s',
                $currentStatus,
                $newStatus,
                $allowed ? implode(', ', $allowed) : 'none (task is completed)'
            );
        }

        return null;
    }

    /**
     * Validate that a string is a valid UUID v4 format.
     *
     * @param mixed $uuid The value to validate as UUID
     * @return string|null Error message if invalid, null if valid
     */
    public static function validateUuid(mixed $uuid): ?string
    {
        if (!is_string($uuid)) {
            return 'Invalid ID format';
        }

        $pattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';

        if (!preg_match($pattern, $uuid)) {
            return 'Invalid UUID format';
        }

        return null;
    }
}
