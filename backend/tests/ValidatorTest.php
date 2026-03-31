<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../helpers/Validator.php';

/**
 * Unit tests for the Validator helper class.
 * Tests title validation, status validation, priority validation,
 * UUID validation, and status transition rules.
 */
class ValidatorTest extends TestCase
{
    // ─── Title Validation ──────────────────────────────────────────────

    /**
     * @test
     */
    public function validateTitle_returnsError_whenNull(): void
    {
        $this->assertNotNull(Validator::validateTitle(null));
    }

    /**
     * @test
     */
    public function validateTitle_returnsError_whenEmpty(): void
    {
        $this->assertNotNull(Validator::validateTitle(''));
    }

    /**
     * @test
     */
    public function validateTitle_returnsError_whenOnlyWhitespace(): void
    {
        $this->assertNotNull(Validator::validateTitle('   '));
    }

    /**
     * @test
     */
    public function validateTitle_returnsError_whenTooLong(): void
    {
        $longTitle = str_repeat('a', 201);
        $this->assertNotNull(Validator::validateTitle($longTitle));
    }

    /**
     * @test
     */
    public function validateTitle_returnsError_whenNotString(): void
    {
        $this->assertNotNull(Validator::validateTitle(123));
    }

    /**
     * @test
     */
    public function validateTitle_returnsNull_whenValid(): void
    {
        $this->assertNull(Validator::validateTitle('Valid Task Title'));
    }

    /**
     * @test
     */
    public function validateTitle_returnsNull_whenExactly200Chars(): void
    {
        $title = str_repeat('a', 200);
        $this->assertNull(Validator::validateTitle($title));
    }

    /**
     * @test
     */
    public function validateTitle_returnsNull_whenSingleChar(): void
    {
        $this->assertNull(Validator::validateTitle('A'));
    }

    // ─── Status Validation ──────────────────────────────────────────────

    /**
     * @test
     */
    public function validateStatus_returnsNull_forValidStatuses(): void
    {
        $this->assertNull(Validator::validateStatus('todo'));
        $this->assertNull(Validator::validateStatus('in-progress'));
        $this->assertNull(Validator::validateStatus('done'));
    }

    /**
     * @test
     */
    public function validateStatus_returnsError_forInvalidStatus(): void
    {
        $this->assertNotNull(Validator::validateStatus('invalid'));
        $this->assertNotNull(Validator::validateStatus('DONE'));
        $this->assertNotNull(Validator::validateStatus('pending'));
    }

    /**
     * @test
     */
    public function validateStatus_returnsNull_whenNullOrEmpty(): void
    {
        $this->assertNull(Validator::validateStatus(null));
        $this->assertNull(Validator::validateStatus(''));
    }

    // ─── Priority Validation ──────────────────────────────────────────────

    /**
     * @test
     */
    public function validatePriority_returnsNull_forValidPriorities(): void
    {
        $this->assertNull(Validator::validatePriority('low'));
        $this->assertNull(Validator::validatePriority('medium'));
        $this->assertNull(Validator::validatePriority('high'));
    }

    /**
     * @test
     */
    public function validatePriority_returnsError_forInvalidPriority(): void
    {
        $this->assertNotNull(Validator::validatePriority('critical'));
        $this->assertNotNull(Validator::validatePriority('HIGH'));
        $this->assertNotNull(Validator::validatePriority('urgent'));
    }

    /**
     * @test
     */
    public function validatePriority_returnsNull_whenNullOrEmpty(): void
    {
        $this->assertNull(Validator::validatePriority(null));
        $this->assertNull(Validator::validatePriority(''));
    }

    // ─── Status Transition Validation ──────────────────────────────────────

    /**
     * @test
     */
    public function validateStatusTransition_allowsTodoToInProgress(): void
    {
        $this->assertNull(Validator::validateStatusTransition('todo', 'in-progress'));
    }

    /**
     * @test
     */
    public function validateStatusTransition_allowsInProgressToDone(): void
    {
        $this->assertNull(Validator::validateStatusTransition('in-progress', 'done'));
    }

    /**
     * @test
     */
    public function validateStatusTransition_allowsSameStatus(): void
    {
        $this->assertNull(Validator::validateStatusTransition('todo', 'todo'));
        $this->assertNull(Validator::validateStatusTransition('in-progress', 'in-progress'));
        $this->assertNull(Validator::validateStatusTransition('done', 'done'));
    }

    /**
     * @test
     */
    public function validateStatusTransition_rejectsTodoToDone(): void
    {
        $result = Validator::validateStatusTransition('todo', 'done');
        $this->assertNotNull($result);
        $this->assertStringContainsString('Invalid status transition', $result);
    }

    /**
     * @test
     */
    public function validateStatusTransition_rejectsDoneToAnything(): void
    {
        $this->assertNotNull(Validator::validateStatusTransition('done', 'todo'));
        $this->assertNotNull(Validator::validateStatusTransition('done', 'in-progress'));
    }

    /**
     * @test
     */
    public function validateStatusTransition_rejectsInProgressToTodo(): void
    {
        $this->assertNotNull(Validator::validateStatusTransition('in-progress', 'todo'));
    }

    // ─── UUID Validation ──────────────────────────────────────────────

    /**
     * @test
     */
    public function validateUuid_returnsNull_forValidUuid(): void
    {
        $this->assertNull(Validator::validateUuid('550e8400-e29b-41d4-a716-446655440000'));
    }

    /**
     * @test
     */
    public function validateUuid_returnsError_forInvalidFormat(): void
    {
        $this->assertNotNull(Validator::validateUuid('not-a-uuid'));
        $this->assertNotNull(Validator::validateUuid('12345'));
        $this->assertNotNull(Validator::validateUuid(''));
    }

    /**
     * @test
     */
    public function validateUuid_returnsError_forNonString(): void
    {
        $this->assertNotNull(Validator::validateUuid(123));
        $this->assertNotNull(Validator::validateUuid(null));
    }
}
