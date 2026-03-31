import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    fetchTasks, fetchTask, fetchStats,
    createTask, updateTask, deleteTask, completeTask,
} from '../api/taskApi';

const mockTask = { id: '123', title: 'Test', status: 'todo', priority: 'medium' };

function mockFetch(data, ok = true, status = 200) {
    return vi.fn().mockResolvedValue({
        ok,
        status,
        json: () => Promise.resolve(data),
    });
}

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('taskApi', () => {
    describe('fetchTasks', () => {
        it('fetches all tasks without filters', async () => {
            global.fetch = mockFetch({ success: true, data: [mockTask] });
            const result = await fetchTasks();
            expect(result.data).toEqual([mockTask]);
            expect(fetch).toHaveBeenCalledWith('/api/tasks');
        });

        it('appends status filter to URL', async () => {
            global.fetch = mockFetch({ success: true, data: [] });
            await fetchTasks({ status: 'todo' });
            expect(fetch).toHaveBeenCalledWith('/api/tasks?status=todo');
        });

        it('appends priority filter to URL', async () => {
            global.fetch = mockFetch({ success: true, data: [] });
            await fetchTasks({ priority: 'high' });
            expect(fetch).toHaveBeenCalledWith('/api/tasks?priority=high');
        });

        it('appends both filters to URL', async () => {
            global.fetch = mockFetch({ success: true, data: [] });
            await fetchTasks({ status: 'done', priority: 'low' });
            expect(fetch).toHaveBeenCalledWith('/api/tasks?status=done&priority=low');
        });

        it('throws on HTTP error', async () => {
            global.fetch = mockFetch({ success: false, data: { message: 'Server error' } }, false, 500);
            await expect(fetchTasks()).rejects.toThrow('Server error');
        });
    });

    describe('fetchTask', () => {
        it('fetches a single task by ID', async () => {
            global.fetch = mockFetch({ success: true, data: mockTask });
            const result = await fetchTask('123');
            expect(result.data).toEqual(mockTask);
            expect(fetch).toHaveBeenCalledWith('/api/tasks/123');
        });

        it('encodes special characters in ID', async () => {
            global.fetch = mockFetch({ success: true, data: mockTask });
            await fetchTask('abc def');
            expect(fetch).toHaveBeenCalledWith('/api/tasks/abc%20def');
        });

        it('throws on 404', async () => {
            global.fetch = mockFetch({ success: false, data: { message: 'Not found' } }, false, 404);
            await expect(fetchTask('999')).rejects.toThrow('Not found');
        });
    });

    describe('fetchStats', () => {
        it('fetches stats', async () => {
            const stats = { byStatus: { todo: 2 }, byPriority: { high: 1 } };
            global.fetch = mockFetch({ success: true, data: stats });
            const result = await fetchStats();
            expect(result.data).toEqual(stats);
            expect(fetch).toHaveBeenCalledWith('/api/tasks/stats');
        });
    });

    describe('createTask', () => {
        it('sends POST with task data', async () => {
            global.fetch = mockFetch({ success: true, data: mockTask });
            const result = await createTask({ title: 'New Task', priority: 'high' });
            expect(result.data).toEqual(mockTask);
            expect(fetch).toHaveBeenCalledWith('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'New Task', priority: 'high' }),
            });
        });

        it('throws on validation error', async () => {
            global.fetch = mockFetch(
                { success: false, data: { message: 'Title is required' } }, false, 400,
            );
            await expect(createTask({})).rejects.toThrow('Title is required');
        });
    });

    describe('updateTask', () => {
        it('sends PUT with task data', async () => {
            global.fetch = mockFetch({ success: true, data: mockTask });
            await updateTask('123', { title: 'Updated' });
            expect(fetch).toHaveBeenCalledWith('/api/tasks/123', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Updated' }),
            });
        });

        it('throws on 422 validation error', async () => {
            global.fetch = mockFetch(
                { success: false, data: { message: 'Invalid status' } }, false, 422,
            );
            await expect(updateTask('123', { status: 'invalid' })).rejects.toThrow('Invalid status');
        });
    });

    describe('deleteTask', () => {
        it('sends DELETE request', async () => {
            global.fetch = mockFetch({ success: true, data: { message: 'Deleted' } });
            await deleteTask('123');
            expect(fetch).toHaveBeenCalledWith('/api/tasks/123', { method: 'DELETE' });
        });
    });

    describe('completeTask', () => {
        it('sends POST to complete endpoint', async () => {
            global.fetch = mockFetch({ success: true, data: { ...mockTask, status: 'done' } });
            const result = await completeTask('123');
            expect(result.data.status).toBe('done');
            expect(fetch).toHaveBeenCalledWith('/api/tasks/123/complete', { method: 'POST' });
        });
    });

    describe('handleResponse edge cases', () => {
        it('uses HTTP status as message when no message in response', async () => {
            global.fetch = mockFetch({ success: false }, false, 500);
            await expect(fetchTasks()).rejects.toThrow('HTTP 500');
        });

        it('uses top-level message if data.message is absent', async () => {
            global.fetch = mockFetch({ success: false, message: 'Top level msg' }, false, 400);
            await expect(fetchTasks()).rejects.toThrow('Top level msg');
        });
    });
});
