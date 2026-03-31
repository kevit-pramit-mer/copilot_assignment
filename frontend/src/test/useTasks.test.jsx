import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ToastProvider } from '../context/ToastContext';
import { useTasks } from '../hooks/useTasks';
import * as api from '../api/taskApi';

vi.mock('../api/taskApi');

const mockTask = {
    id: '1', title: 'Test Task', description: '', status: 'todo',
    priority: 'medium', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z',
};

const mockStats = {
    byStatus: { todo: 1, 'in-progress': 0, done: 0 },
    byPriority: { low: 0, medium: 1, high: 0 },
};

function wrapper({ children }) {
    return <ToastProvider>{children}</ToastProvider>;
}

beforeEach(() => {
    vi.clearAllMocks();
    api.fetchTasks.mockResolvedValue({ success: true, data: [mockTask] });
    api.fetchStats.mockResolvedValue({ success: true, data: mockStats });
});

describe('useTasks', () => {
    it('loads tasks and stats on mount', async () => {
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        expect(result.current.tasks).toEqual([mockTask]);
        expect(result.current.stats).toEqual(mockStats);
    });

    it('passes filters to fetchTasks', async () => {
        const { result } = renderHook(() => useTasks({ status: 'todo', priority: 'high' }), { wrapper });
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        expect(api.fetchTasks).toHaveBeenCalledWith({ status: 'todo', priority: 'high' });
    });

    it('shows error toast on load failure', async () => {
        api.fetchTasks.mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        expect(result.current.tasks).toEqual([]);
    });

    it('addTask creates task and reloads', async () => {
        api.createTask.mockResolvedValue({ success: true, data: mockTask });
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.addTask({ title: 'New' });
        });
        expect(success).toBe(true);
        expect(api.createTask).toHaveBeenCalledWith({ title: 'New' });
        expect(api.fetchTasks).toHaveBeenCalledTimes(2); // initial + reload
    });

    it('addTask returns false on error', async () => {
        api.createTask.mockRejectedValue(new Error('Validation error'));
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.addTask({ title: '' });
        });
        expect(success).toBe(false);
    });

    it('editTask updates task and reloads', async () => {
        api.updateTask.mockResolvedValue({ success: true, data: { ...mockTask, title: 'Updated' } });
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.editTask('1', { title: 'Updated' });
        });
        expect(success).toBe(true);
        expect(api.updateTask).toHaveBeenCalledWith('1', { title: 'Updated' });
    });

    it('editTask returns false on error', async () => {
        api.updateTask.mockRejectedValue(new Error('Invalid status'));
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        await act(async () => {
            success = await result.current.editTask('1', { status: 'invalid' });
        });
        expect(success).toBe(false);
    });

    it('removeTask deletes task and reloads', async () => {
        api.deleteTask.mockResolvedValue({ success: true, data: { message: 'Deleted' } });
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.removeTask('1');
        });
        expect(api.deleteTask).toHaveBeenCalledWith('1');
    });

    it('removeTask handles error', async () => {
        api.deleteTask.mockRejectedValue(new Error('Not found'));
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.removeTask('999');
        });
        // Should not throw, just show toast
        expect(api.deleteTask).toHaveBeenCalledWith('999');
    });

    it('markComplete completes task and reloads', async () => {
        api.completeTask.mockResolvedValue({ success: true, data: { ...mockTask, status: 'in-progress' } });
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.markComplete('1');
        });
        expect(api.completeTask).toHaveBeenCalledWith('1');
    });

    it('markComplete handles error', async () => {
        api.completeTask.mockRejectedValue(new Error('Already done'));
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.markComplete('1');
        });
        expect(api.completeTask).toHaveBeenCalledWith('1');
    });

    it('sets actionLoading during create', async () => {
        let resolveCreate;
        api.createTask.mockReturnValue(new Promise((r) => { resolveCreate = r; }));
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.addTask({ title: 'Test' });
        });
        expect(result.current.actionLoading).toBe('create');

        await act(async () => {
            resolveCreate({ success: true, data: mockTask });
        });
    });

    it('sets actionLoading to task id during edit', async () => {
        let resolveUpdate;
        api.updateTask.mockReturnValue(new Promise((r) => { resolveUpdate = r; }));
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.editTask('1', { title: 'Updated' });
        });
        expect(result.current.actionLoading).toBe('1');

        await act(async () => {
            resolveUpdate({ success: true, data: mockTask });
        });
    });

    it('reload function triggers data fetch', async () => {
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.reload();
        });
        // fetchTasks called twice: initial + reload
        expect(api.fetchTasks).toHaveBeenCalledTimes(2);
    });

    it('handles error with fallback message on load', async () => {
        api.fetchTasks.mockRejectedValue({ noMessage: true });
        const { result } = renderHook(() => useTasks({}), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.tasks).toEqual([]);
    });
});
