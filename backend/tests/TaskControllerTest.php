<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../models/Task.php';
require_once __DIR__ . '/../controllers/TaskController.php';

/**
 * Unit tests for TaskController.
 * Tests input validation, HTTP status codes, CRUD operations, and edge cases.
 * Uses Response::$testMode to catch exit calls as exceptions.
 */
class TaskControllerTest extends TestCase
{
    /** @var PDO Test database connection */
    private static PDO $db;

    /** @var Task Task model instance */
    private Task $taskModel;

    /** @var TaskController Controller under test */
    private TaskController $controller;

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
     * Begin a transaction before each test and set up controller.
     */
    protected function setUp(): void
    {
        self::$db->beginTransaction();
        $this->taskModel = new Task(self::$db);
        $this->controller = new TaskController($this->taskModel);
        Response::$testMode = true;
    }

    /**
     * Roll back the transaction after each test.
     */
    protected function tearDown(): void
    {
        Response::$testMode = false;
        if (self::$db->inTransaction()) {
            self::$db->rollBack();
        }
    }

    /**
     * Call a controller method and capture the ResponseException.
     *
     * @param callable $fn The controller method call
     * @return array{statusCode: int, success: bool, data: mixed}
     */
    private function callController(callable $fn): array
    {
        ob_start();
        try {
            $fn();
            ob_end_clean();
            $this->fail('Expected ResponseException was not thrown');
        } catch (ResponseException $e) {
            ob_end_clean();
            $body = json_decode($e->body, true);
            return [
                'statusCode' => $e->statusCode,
                'success' => $body['success'] ?? false,
                'data' => $body['data'] ?? null,
            ];
        }
    }

    // ─── Store (POST /api/tasks) ──────────────────────────

    /**
     * @test
     */
    public function store_returns201_withValidData(): void
    {
        $res = $this->callController(fn() => $this->controller->store([
            'title' => 'New Task',
            'priority' => 'high',
        ]));
        $this->assertEquals(201, $res['statusCode']);
        $this->assertTrue($res['success']);
        $this->assertEquals('New Task', $res['data']['title']);
        $this->assertEquals('high', $res['data']['priority']);
        $this->assertEquals('todo', $res['data']['status']);
    }

    /**
     * @test
     */
    public function store_returns400_whenTitleMissing(): void
    {
        $res = $this->callController(fn() => $this->controller->store([]));
        $this->assertEquals(400, $res['statusCode']);
        $this->assertFalse($res['success']);
    }

    /**
     * @test
     */
    public function store_returns400_whenTitleEmpty(): void
    {
        $res = $this->callController(fn() => $this->controller->store(['title' => '']));
        $this->assertEquals(400, $res['statusCode']);
        $this->assertFalse($res['success']);
    }

    /**
     * @test
     */
    public function store_returns422_whenPriorityInvalid(): void
    {
        $res = $this->callController(fn() => $this->controller->store([
            'title' => 'Test',
            'priority' => 'critical',
        ]));
        $this->assertEquals(422, $res['statusCode']);
        $this->assertFalse($res['success']);
    }

    /**
     * @test
     */
    public function store_defaultsToMediumPriority(): void
    {
        $res = $this->callController(fn() => $this->controller->store([
            'title' => 'Default Priority',
        ]));
        $this->assertEquals(201, $res['statusCode']);
        $this->assertEquals('medium', $res['data']['priority']);
    }

    // ─── Show (GET /api/tasks/:id) ──────────────────────────

    /**
     * @test
     */
    public function show_returns200_forExistingTask(): void
    {
        $task = $this->taskModel->create(['title' => 'Show Me']);
        $res = $this->callController(fn() => $this->controller->show($task['id']));
        $this->assertEquals(200, $res['statusCode']);
        $this->assertTrue($res['success']);
        $this->assertEquals('Show Me', $res['data']['title']);
    }

    /**
     * @test
     */
    public function show_returns404_forNonExistent(): void
    {
        $res = $this->callController(fn() => $this->controller->show('550e8400-e29b-41d4-a716-446655440000'));
        $this->assertEquals(404, $res['statusCode']);
        $this->assertFalse($res['success']);
    }

    /**
     * @test
     */
    public function show_returns422_forInvalidUuid(): void
    {
        $res = $this->callController(fn() => $this->controller->show('not-a-uuid'));
        $this->assertEquals(422, $res['statusCode']);
    }

    // ─── Update (PUT /api/tasks/:id) ──────────────────────────

    /**
     * @test
     */
    public function update_returns200_withValidData(): void
    {
        $task = $this->taskModel->create(['title' => 'Original']);
        $res = $this->callController(fn() => $this->controller->update($task['id'], [
            'title' => 'Updated',
        ]));
        $this->assertEquals(200, $res['statusCode']);
        $this->assertEquals('Updated', $res['data']['title']);
    }

    /**
     * @test
     */
    public function update_returns404_forNonExistent(): void
    {
        $res = $this->callController(fn() => $this->controller->update(
            '550e8400-e29b-41d4-a716-446655440000',
            ['title' => 'No such task']
        ));
        $this->assertEquals(404, $res['statusCode']);
    }

    /**
     * @test
     */
    public function update_returns422_forInvalidStatusTransition(): void
    {
        $task = $this->taskModel->create(['title' => 'Transition Test']);
        $res = $this->callController(fn() => $this->controller->update($task['id'], [
            'status' => 'done',
        ]));
        $this->assertEquals(422, $res['statusCode']);
    }

    /**
     * @test
     */
    public function update_returns400_forEmptyTitle(): void
    {
        $task = $this->taskModel->create(['title' => 'Has Title']);
        $res = $this->callController(fn() => $this->controller->update($task['id'], [
            'title' => '',
        ]));
        $this->assertEquals(400, $res['statusCode']);
    }

    /**
     * @test
     */
    public function update_returns422_forInvalidPriority(): void
    {
        $task = $this->taskModel->create(['title' => 'Priority Test']);
        $res = $this->callController(fn() => $this->controller->update($task['id'], [
            'priority' => 'urgent',
        ]));
        $this->assertEquals(422, $res['statusCode']);
    }

    /**
     * @test
     */
    public function update_allowsValidStatusTransition(): void
    {
        $task = $this->taskModel->create(['title' => 'Valid Transition']);
        $res = $this->callController(fn() => $this->controller->update($task['id'], [
            'status' => 'in-progress',
        ]));
        $this->assertEquals(200, $res['statusCode']);
        $this->assertEquals('in-progress', $res['data']['status']);
    }

    // ─── Destroy (DELETE /api/tasks/:id) ──────────────────────────

    /**
     * @test
     */
    public function destroy_returns200_forExistingTask(): void
    {
        $task = $this->taskModel->create(['title' => 'Delete Me']);
        $res = $this->callController(fn() => $this->controller->destroy($task['id']));
        $this->assertEquals(200, $res['statusCode']);
        $this->assertTrue($res['success']);
    }

    /**
     * @test
     */
    public function destroy_returns404_forNonExistent(): void
    {
        $res = $this->callController(fn() => $this->controller->destroy('550e8400-e29b-41d4-a716-446655440000'));
        $this->assertEquals(404, $res['statusCode']);
    }

    /**
     * @test
     */
    public function destroy_returns422_forInvalidUuid(): void
    {
        $res = $this->callController(fn() => $this->controller->destroy('bad-id'));
        $this->assertEquals(422, $res['statusCode']);
    }

    // ─── Complete (POST /api/tasks/:id/complete) ──────────────────────────

    /**
     * @test
     */
    public function complete_advancesTodo_toInProgress(): void
    {
        $task = $this->taskModel->create(['title' => 'Complete Me']);
        $res = $this->callController(fn() => $this->controller->complete($task['id']));
        $this->assertEquals(200, $res['statusCode']);
        $this->assertEquals('in-progress', $res['data']['status']);
    }

    /**
     * @test
     */
    public function complete_advancesInProgress_toDone(): void
    {
        $task = $this->taskModel->create(['title' => 'Almost Done']);
        $this->taskModel->complete($task['id']); // todo → in-progress
        $res = $this->callController(fn() => $this->controller->complete($task['id']));
        $this->assertEquals(200, $res['statusCode']);
        $this->assertEquals('done', $res['data']['status']);
    }

    /**
     * @test
     */
    public function complete_returns422_whenAlreadyDone(): void
    {
        $task = $this->taskModel->create(['title' => 'Already Done']);
        $this->taskModel->complete($task['id']); // todo → in-progress
        $this->taskModel->complete($task['id']); // in-progress → done
        $res = $this->callController(fn() => $this->controller->complete($task['id']));
        $this->assertEquals(422, $res['statusCode']);
    }

    /**
     * @test
     */
    public function complete_returns404_forNonExistent(): void
    {
        $res = $this->callController(fn() => $this->controller->complete('550e8400-e29b-41d4-a716-446655440000'));
        $this->assertEquals(404, $res['statusCode']);
    }

    /**
     * @test
     */
    public function complete_returns422_forInvalidUuid(): void
    {
        $res = $this->callController(fn() => $this->controller->complete('xyz'));
        $this->assertEquals(422, $res['statusCode']);
    }

    // ─── Stats (GET /api/tasks/stats) ──────────────────────────

    /**
     * @test
     */
    public function stats_returns200_withCorrectStructure(): void
    {
        $res = $this->callController(fn() => $this->controller->stats());
        $this->assertEquals(200, $res['statusCode']);
        $this->assertTrue($res['success']);
        $this->assertArrayHasKey('total', $res['data']);
        $this->assertArrayHasKey('byStatus', $res['data']);
        $this->assertArrayHasKey('byPriority', $res['data']);
    }
}
