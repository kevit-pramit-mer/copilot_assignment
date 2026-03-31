<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../models/Task.php';

/**
 * Unit tests for the Task model.
 * Uses a test database with transactions for isolation — each test
 * rolls back so no data persists between tests.
 */
class TaskModelTest extends TestCase
{
    /** @var PDO Test database connection */
    private static PDO $db;

    /** @var Task Task model instance */
    private Task $task;

    /**
     * Set up test database connection once for all tests.
     */
    public static function setUpBeforeClass(): void
    {
        self::$db = new PDO(
            'mysql:host=localhost;dbname=task_manager;charset=utf8mb4',
            'root',
            '',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    }

    /**
     * Begin a transaction before each test for isolation.
     */
    protected function setUp(): void
    {
        self::$db->beginTransaction();
        $this->task = new Task(self::$db);
    }

    /**
     * Roll back the transaction after each test.
     */
    protected function tearDown(): void
    {
        if (self::$db->inTransaction()) {
            self::$db->rollBack();
        }
    }

    // ─── UUID Generation ──────────────────────────────────────────────

    /**
     * @test
     */
    public function generateUuid_returnsValidUuidV4Format(): void
    {
        $uuid = Task::generateUuid();
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $uuid
        );
    }

    /**
     * @test
     */
    public function generateUuid_returnsUniqueValues(): void
    {
        $uuid1 = Task::generateUuid();
        $uuid2 = Task::generateUuid();
        $this->assertNotEquals($uuid1, $uuid2);
    }

    // ─── Create ──────────────────────────────────────────────

    /**
     * @test
     */
    public function create_createsTaskWithDefaults(): void
    {
        $result = $this->task->create(['title' => 'Test Task']);

        $this->assertIsArray($result);
        $this->assertEquals('Test Task', $result['title']);
        $this->assertEquals('todo', $result['status']);
        $this->assertEquals('medium', $result['priority']);
        $this->assertNull($result['description']);
        $this->assertNotEmpty($result['id']);
    }

    /**
     * @test
     */
    public function create_createsTaskWithAllFields(): void
    {
        $result = $this->task->create([
            'title' => 'Full Task',
            'description' => 'A detailed description',
            'priority' => 'high',
        ]);

        $this->assertEquals('Full Task', $result['title']);
        $this->assertEquals('A detailed description', $result['description']);
        $this->assertEquals('high', $result['priority']);
        $this->assertEquals('todo', $result['status']); // Always starts as todo
    }

    /**
     * @test
     */
    public function create_trimsWhitespace(): void
    {
        $result = $this->task->create(['title' => '  Trimmed Title  ']);
        $this->assertEquals('Trimmed Title', $result['title']);
    }

    // ─── Read ──────────────────────────────────────────────

    /**
     * @test
     */
    public function getById_returnsTask(): void
    {
        $created = $this->task->create(['title' => 'Find Me']);
        $found = $this->task->getById($created['id']);

        $this->assertNotNull($found);
        $this->assertEquals($created['id'], $found['id']);
        $this->assertEquals('Find Me', $found['title']);
    }

    /**
     * @test
     */
    public function getById_returnsNull_whenNotFound(): void
    {
        $found = $this->task->getById('550e8400-e29b-41d4-a716-446655440000');
        $this->assertNull($found);
    }

    /**
     * @test
     */
    public function getAll_returnsAllTasks(): void
    {
        $this->task->create(['title' => 'Task 1']);
        $this->task->create(['title' => 'Task 2']);

        $all = $this->task->getAll();
        $this->assertGreaterThanOrEqual(2, count($all));
    }

    /**
     * @test
     */
    public function getAll_filtersByStatus(): void
    {
        $this->task->create(['title' => 'Todo Task']);

        $filtered = $this->task->getAll('todo', null);
        $this->assertNotEmpty($filtered);
        foreach ($filtered as $t) {
            $this->assertEquals('todo', $t['status']);
        }
    }

    /**
     * @test
     */
    public function getAll_filtersByPriority(): void
    {
        $this->task->create(['title' => 'High Task', 'priority' => 'high']);

        $filtered = $this->task->getAll(null, 'high');
        $this->assertNotEmpty($filtered);
        foreach ($filtered as $t) {
            $this->assertEquals('high', $t['priority']);
        }
    }

    /**
     * @test
     */
    public function getAll_filtersByStatusAndPriority(): void
    {
        $this->task->create(['title' => 'Combo', 'priority' => 'low']);

        $filtered = $this->task->getAll('todo', 'low');
        $this->assertNotEmpty($filtered);
        foreach ($filtered as $t) {
            $this->assertEquals('todo', $t['status']);
            $this->assertEquals('low', $t['priority']);
        }
    }

    // ─── Update ──────────────────────────────────────────────

    /**
     * @test
     */
    public function update_updatesTitle(): void
    {
        $created = $this->task->create(['title' => 'Original']);
        $updated = $this->task->update($created['id'], ['title' => 'Updated Title']);

        $this->assertNotNull($updated);
        $this->assertEquals('Updated Title', $updated['title']);
    }

    /**
     * @test
     */
    public function update_updatesMultipleFields(): void
    {
        $created = $this->task->create(['title' => 'Multi Update']);
        $updated = $this->task->update($created['id'], [
            'title' => 'New Title',
            'description' => 'New Desc',
            'priority' => 'high',
        ]);

        $this->assertEquals('New Title', $updated['title']);
        $this->assertEquals('New Desc', $updated['description']);
        $this->assertEquals('high', $updated['priority']);
    }

    /**
     * @test
     */
    public function update_returnsNull_whenNotFound(): void
    {
        $result = $this->task->update('550e8400-e29b-41d4-a716-446655440000', ['title' => 'X']);
        $this->assertNull($result);
    }

    /**
     * @test
     */
    public function update_returnsUnchanged_whenNoFields(): void
    {
        $created = $this->task->create(['title' => 'No Change']);
        $updated = $this->task->update($created['id'], []);

        $this->assertEquals($created['title'], $updated['title']);
    }

    /**
     * @test
     */
    public function update_canSetDescriptionToNull(): void
    {
        $created = $this->task->create([
            'title' => 'Has Desc',
            'description' => 'Some desc',
        ]);

        $updated = $this->task->update($created['id'], ['description' => null]);
        $this->assertNull($updated['description']);
    }

    // ─── Delete ──────────────────────────────────────────────

    /**
     * @test
     */
    public function delete_removesTask(): void
    {
        $created = $this->task->create(['title' => 'Delete Me']);
        $this->assertTrue($this->task->delete($created['id']));
        $this->assertNull($this->task->getById($created['id']));
    }

    /**
     * @test
     */
    public function delete_returnsFalse_whenNotFound(): void
    {
        $this->assertFalse($this->task->delete('550e8400-e29b-41d4-a716-446655440000'));
    }

    // ─── Complete ──────────────────────────────────────────────

    /**
     * @test
     */
    public function complete_advancesTodotoInProgress(): void
    {
        $created = $this->task->create(['title' => 'Advance Me']);
        $this->assertEquals('todo', $created['status']);

        $completed = $this->task->complete($created['id']);
        $this->assertIsArray($completed);
        $this->assertEquals('in-progress', $completed['status']);
    }

    /**
     * @test
     */
    public function complete_advancesInProgressToDone(): void
    {
        $created = $this->task->create(['title' => 'Almost Done']);
        $this->task->complete($created['id']); // todo → in-progress

        $completed = $this->task->complete($created['id']);
        $this->assertIsArray($completed);
        $this->assertEquals('done', $completed['status']);
    }

    /**
     * @test
     */
    public function complete_returnsFalse_whenAlreadyDone(): void
    {
        $created = $this->task->create(['title' => 'Already Done']);
        $this->task->complete($created['id']); // todo → in-progress
        $this->task->complete($created['id']); // in-progress → done

        $result = $this->task->complete($created['id']);
        $this->assertFalse($result);
    }

    /**
     * @test
     */
    public function complete_returnsNull_whenNotFound(): void
    {
        $result = $this->task->complete('550e8400-e29b-41d4-a716-446655440000');
        $this->assertNull($result);
    }

    // ─── Stats ──────────────────────────────────────────────

    /**
     * @test
     */
    public function getStats_returnsCorrectStructure(): void
    {
        $this->task->create(['title' => 'Stat Task', 'priority' => 'high']);

        $stats = $this->task->getStats();

        $this->assertArrayHasKey('total', $stats);
        $this->assertArrayHasKey('byStatus', $stats);
        $this->assertArrayHasKey('byPriority', $stats);
        $this->assertArrayHasKey('todo', $stats['byStatus']);
        $this->assertArrayHasKey('in-progress', $stats['byStatus']);
        $this->assertArrayHasKey('done', $stats['byStatus']);
        $this->assertArrayHasKey('low', $stats['byPriority']);
        $this->assertArrayHasKey('medium', $stats['byPriority']);
        $this->assertArrayHasKey('high', $stats['byPriority']);
    }

    /**
     * @test
     */
    public function getStats_countsCorrectly(): void
    {
        // Clear existing data for clean stats
        self::$db->exec('DELETE FROM tasks');

        $this->task->create(['title' => 'T1', 'priority' => 'high']);
        $this->task->create(['title' => 'T2', 'priority' => 'low']);

        $stats = $this->task->getStats();

        $this->assertEquals(2, $stats['total']);
        $this->assertEquals(2, $stats['byStatus']['todo']);
        $this->assertEquals(1, $stats['byPriority']['high']);
        $this->assertEquals(1, $stats['byPriority']['low']);
    }
}
