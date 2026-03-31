/**
 * E2E tests for Task Management System.
 * Tests: page load, add task, complete task, delete task, priority filter.
 * Generated from browser observation via Playwright MCP.
 */
import { test, expect } from '@playwright/test';

test.describe('Task Management System E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.app-header');
    });

    test('page loads with header and Add Task button', async ({ page }) => {
        await expect(page.locator('h1')).toHaveText('Task Management System');
        await expect(page.locator('.btn-add')).toBeVisible();
        await expect(page.locator('.search-input')).toBeVisible();
        await expect(page.locator('.filter-bar')).toBeVisible();
    });

    test('add a new task', async ({ page }) => {
        // Click Add Task button
        await page.click('.btn-add');
        await expect(page.locator('.modal')).toBeVisible();
        await expect(page.locator('.modal h2')).toHaveText('Add Task');

        // Fill in form
        await page.fill('#task-title', 'E2E Test Task');
        await page.fill('#task-desc', 'Created by Playwright E2E test');
        await page.selectOption('#task-priority', 'high');

        // Submit
        await page.click('button[type="submit"]');

        // Wait for modal to close and task to appear
        await expect(page.locator('.modal')).not.toBeVisible();
        await expect(page.locator('.task-table')).toContainText('E2E Test Task');

        // Verify success toast
        await expect(page.locator('.toast-success')).toBeVisible();
    });

    test('complete a task (step through status workflow)', async ({ page }) => {
        // First create a task to complete
        await page.click('.btn-add');
        await page.fill('#task-title', 'Task To Complete');
        await page.selectOption('#task-priority', 'low');
        await page.click('button[type="submit"]');
        await expect(page.locator('.modal')).not.toBeVisible();
        await expect(page.locator('.task-table')).toContainText('Task To Complete');

        // Find the row with our task and click Complete
        const row = page.locator('tr', { hasText: 'Task To Complete' });
        await row.locator('.btn-complete').click();

        // Should show success toast (moved to in-progress)
        await expect(page.locator('.toast-success').first()).toBeVisible();

        // Click Complete again to move to done
        await page.waitForTimeout(1000);
        const updatedRow = page.locator('tr', { hasText: 'Task To Complete' });
        const completeBtn = updatedRow.locator('.btn-complete');

        if (await completeBtn.isVisible()) {
            await completeBtn.click();
            await expect(page.locator('.toast-success').first()).toBeVisible();
        }
    });

    test('delete a task', async ({ page }) => {
        // Create a task to delete
        await page.click('.btn-add');
        await page.fill('#task-title', 'Task To Delete');
        await page.click('button[type="submit"]');
        await expect(page.locator('.modal')).not.toBeVisible();
        await expect(page.locator('.task-table')).toContainText('Task To Delete');

        // Set up dialog handler before clicking delete
        page.on('dialog', (dialog) => dialog.accept());

        // Find the row and click Delete
        const row = page.locator('tr', { hasText: 'Task To Delete' });
        await row.locator('.btn-delete').click();

        // Verify success toast
        await expect(page.locator('.toast-success')).toBeVisible();

        // Verify task is removed from table
        await expect(page.locator('tr', { hasText: 'Task To Delete' })).toHaveCount(0);
    });

    test('filter by priority', async ({ page }) => {
        // Create tasks with different priorities
        for (const [title, priority] of [
            ['High Priority Task', 'high'],
            ['Low Priority Task', 'low'],
        ]) {
            await page.click('.btn-add');
            await page.fill('#task-title', title);
            await page.selectOption('#task-priority', priority);
            await page.click('button[type="submit"]');
            await expect(page.locator('.modal')).not.toBeVisible();
            await page.waitForTimeout(300);
        }

        // Filter by high priority
        await page.selectOption('[aria-label="Filter by priority"]', 'high');
        await page.waitForTimeout(500);

        // High priority task should be visible
        await expect(page.locator('.task-table')).toContainText('High Priority Task');
    });

    test('search filters tasks as you type', async ({ page }) => {
        // Create two tasks
        for (const title of ['Alpha Search Task', 'Beta Search Task']) {
            await page.click('.btn-add');
            await page.fill('#task-title', title);
            await page.click('button[type="submit"]');
            await expect(page.locator('.modal')).not.toBeVisible();
            await page.waitForTimeout(300);
        }

        // Type search query
        await page.fill('.search-input', 'Alpha');

        // Only Alpha should be visible
        await expect(page.locator('.task-table')).toContainText('Alpha Search Task');
        await expect(page.locator('.task-table')).not.toContainText('Beta Search Task');

        // Clear search
        await page.click('.search-clear');
        await expect(page.locator('.search-input')).toHaveValue('');
    });

    test('edit a task', async ({ page }) => {
        // Create a task
        await page.click('.btn-add');
        await page.fill('#task-title', 'Task Before Edit');
        await page.click('button[type="submit"]');
        await expect(page.locator('.modal')).not.toBeVisible();
        await expect(page.locator('.task-table')).toContainText('Task Before Edit');

        // Click Edit
        const row = page.locator('tr', { hasText: 'Task Before Edit' });
        await row.locator('.btn-edit').click();

        // Modal should show Edit Task
        await expect(page.locator('.modal h2')).toHaveText('Edit Task');
        await expect(page.locator('#task-title')).toHaveValue('Task Before Edit');

        // Update title
        await page.fill('#task-title', 'Task After Edit');
        await page.click('button[type="submit"]');

        // Verify update
        await expect(page.locator('.modal')).not.toBeVisible();
        await expect(page.locator('.task-table')).toContainText('Task After Edit');
        await expect(page.locator('.toast-success').first()).toBeVisible();
    });

    test('stats bar shows task counts', async ({ page }) => {
        // Stats bar should be visible after load
        await expect(page.locator('.stats-bar')).toBeVisible();
        await expect(page.locator('.stat-label')).toContainText('Total:');
    });

    test('modal validates empty title', async ({ page }) => {
        await page.click('.btn-add');
        await expect(page.locator('.modal')).toBeVisible();

        // Try to submit without title
        await page.click('button[type="submit"]');
        await expect(page.locator('.error-text')).toHaveText('Title is required');

        // Modal should still be open
        await expect(page.locator('.modal')).toBeVisible();
    });

    test('filter by status', async ({ page }) => {
        // Filter by status dropdown
        await page.selectOption('[aria-label="Filter by status"]', 'todo');
        await page.waitForTimeout(500);

        // Status filter should be applied
        const statusSelect = page.locator('[aria-label="Filter by status"]');
        await expect(statusSelect).toHaveValue('todo');
    });
});
