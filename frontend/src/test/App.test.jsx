import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../context/ToastContext';
import App from '../App';
import * as api from '../api/taskApi';

vi.mock('../api/taskApi');

const mockTasks = [
    {
        id: '1', title: 'Task Alpha', description: 'Alpha desc',
        status: 'todo', priority: 'high',
        createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
    },
    {
        id: '2', title: 'Task Beta', description: '',
        status: 'in-progress', priority: 'medium',
        createdAt: '2026-03-02T00:00:00Z', updatedAt: '2026-03-02T00:00:00Z',
    },
];

const mockStats = {
    byStatus: { todo: 1, 'in-progress': 1, done: 0 },
    byPriority: { high: 1, medium: 1, low: 0 },
};

function renderApp() {
    return render(
        <ToastProvider>
            <App />
        </ToastProvider>,
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    api.fetchTasks.mockResolvedValue({ success: true, data: mockTasks });
    api.fetchStats.mockResolvedValue({ success: true, data: mockStats });
    // Reset window.confirm mock
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('App', () => {
    it('renders header and Add Task button', async () => {
        renderApp();
        expect(screen.getByText('Task Management System')).toBeInTheDocument();
        expect(screen.getByText('+ Add Task')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
    });

    it('shows loading state initially', () => {
        renderApp();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders task table after loading', async () => {
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
            expect(screen.getByText('Task Beta')).toBeInTheDocument();
        });
    });

    it('renders stats bar', async () => {
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Todo: 1')).toBeInTheDocument();
            expect(screen.getByText('In Progress: 1')).toBeInTheDocument();
        });
    });

    it('filters tasks by search query', async () => {
        const user = userEvent.setup();
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.type(screen.getByLabelText('Search tasks'), 'Beta');
        expect(screen.queryByText('Task Alpha')).not.toBeInTheDocument();
        expect(screen.getByText('Task Beta')).toBeInTheDocument();
    });

    it('opens Add Task modal', async () => {
        const user = userEvent.setup();
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.click(screen.getByText('+ Add Task'));
        expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    it('opens Edit Task modal', async () => {
        const user = userEvent.setup();
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.click(screen.getByLabelText('Edit Task Alpha'));
        expect(screen.getByText('Edit Task')).toBeInTheDocument();
        expect(screen.getByLabelText('Title *')).toHaveValue('Task Alpha');
    });

    it('creates a new task via modal', async () => {
        const user = userEvent.setup();
        api.createTask.mockResolvedValue({ success: true, data: { ...mockTasks[0], title: 'New Task' } });
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.click(screen.getByText('+ Add Task'));
        await user.type(screen.getByLabelText('Title *'), 'New Task');
        await user.click(screen.getByText('Create Task'));
        await waitFor(() => {
            expect(api.createTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Task' }));
        });
    });

    it('deletes a task with confirmation', async () => {
        const user = userEvent.setup();
        api.deleteTask.mockResolvedValue({ success: true, data: { message: 'Deleted' } });
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.click(screen.getByLabelText('Delete Task Alpha'));
        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(api.deleteTask).toHaveBeenCalledWith('1');
        });
    });

    it('does not delete when confirmation is declined', async () => {
        const user = userEvent.setup();
        window.confirm.mockReturnValue(false);
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.click(screen.getByLabelText('Delete Task Alpha'));
        expect(api.deleteTask).not.toHaveBeenCalled();
    });

    it('completes a task', async () => {
        const user = userEvent.setup();
        api.completeTask.mockResolvedValue({ success: true, data: { ...mockTasks[0], status: 'in-progress' } });
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.click(screen.getByLabelText('Complete Task Alpha'));
        await waitFor(() => {
            expect(api.completeTask).toHaveBeenCalledWith('1');
        });
    });

    it('search shows all tasks when cleared', async () => {
        const user = userEvent.setup();
        renderApp();
        await waitFor(() => {
            expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        });
        await user.type(screen.getByLabelText('Search tasks'), 'Beta');
        expect(screen.queryByText('Task Alpha')).not.toBeInTheDocument();
        await user.click(screen.getByLabelText('Clear search'));
        expect(screen.getByText('Task Alpha')).toBeInTheDocument();
        expect(screen.getByText('Task Beta')).toBeInTheDocument();
    });

    it('shows search bar and filter bar', async () => {
        renderApp();
        await waitFor(() => {
            expect(screen.getByLabelText('Search tasks')).toBeInTheDocument();
        });
        expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument();
    });
});
