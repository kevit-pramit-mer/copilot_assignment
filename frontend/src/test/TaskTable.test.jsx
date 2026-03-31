import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskTable from '../components/TaskTable';

const mockTasks = [
    {
        id: '1',
        title: 'Task One',
        description: 'First task',
        status: 'todo',
        priority: 'high',
        createdAt: '2026-03-01T10:00:00Z',
    },
    {
        id: '2',
        title: 'Task Two',
        description: '',
        status: 'in-progress',
        priority: 'medium',
        createdAt: '2026-03-02T12:00:00Z',
    },
    {
        id: '3',
        title: 'Done Task',
        description: null,
        status: 'done',
        priority: 'low',
        createdAt: null,
    },
];

describe('TaskTable', () => {
    const defaultProps = {
        tasks: mockTasks,
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onComplete: vi.fn(),
        actionLoading: null,
    };

    it('renders table headers', () => {
        render(<TaskTable {...defaultProps} />);
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Created')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders all task rows', () => {
        render(<TaskTable {...defaultProps} />);
        expect(screen.getByText('Task One')).toBeInTheDocument();
        expect(screen.getByText('Task Two')).toBeInTheDocument();
        expect(screen.getByText('Done Task')).toBeInTheDocument();
    });

    it('renders task description when present', () => {
        render(<TaskTable {...defaultProps} />);
        expect(screen.getByText('First task')).toBeInTheDocument();
    });

    it('shows empty message when no tasks', () => {
        render(<TaskTable {...defaultProps} tasks={[]} />);
        expect(screen.getByText(/No tasks found/)).toBeInTheDocument();
    });

    it('hides Complete button for done tasks', () => {
        render(<TaskTable {...defaultProps} />);
        // 'Done Task' (id=3) should not have a Complete button
        expect(screen.queryByLabelText('Complete Done Task')).not.toBeInTheDocument();
        // But todo task should
        expect(screen.getByLabelText('Complete Task One')).toBeInTheDocument();
    });

    it('shows Edit button for every task', () => {
        render(<TaskTable {...defaultProps} />);
        expect(screen.getByLabelText('Edit Task One')).toBeInTheDocument();
        expect(screen.getByLabelText('Edit Task Two')).toBeInTheDocument();
        expect(screen.getByLabelText('Edit Done Task')).toBeInTheDocument();
    });

    it('calls onEdit when Edit clicked', async () => {
        const user = userEvent.setup();
        const onEdit = vi.fn();
        render(<TaskTable {...defaultProps} onEdit={onEdit} />);
        await user.click(screen.getByLabelText('Edit Task One'));
        expect(onEdit).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('calls onDelete when Delete clicked', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        render(<TaskTable {...defaultProps} onDelete={onDelete} />);
        await user.click(screen.getByLabelText('Delete Task One'));
        expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('calls onComplete when Complete clicked', async () => {
        const user = userEvent.setup();
        const onComplete = vi.fn();
        render(<TaskTable {...defaultProps} onComplete={onComplete} />);
        await user.click(screen.getByLabelText('Complete Task One'));
        expect(onComplete).toHaveBeenCalledWith('1');
    });

    it('disables buttons when actionLoading matches task id', () => {
        render(<TaskTable {...defaultProps} actionLoading="1" />);
        expect(screen.getByLabelText('Edit Task One')).toBeDisabled();
        expect(screen.getByLabelText('Delete Task One')).toBeDisabled();
        expect(screen.getByLabelText('Complete Task One')).toBeDisabled();
    });

    it('does not disable other task buttons during loading', () => {
        render(<TaskTable {...defaultProps} actionLoading="1" />);
        expect(screen.getByLabelText('Edit Task Two')).not.toBeDisabled();
    });

    it('formats date correctly', () => {
        render(<TaskTable {...defaultProps} />);
        // The date for 'Done Task' with null created_at should show dash
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders priority badges', () => {
        render(<TaskTable {...defaultProps} />);
        expect(screen.getByText('high')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('renders status badges', () => {
        render(<TaskTable {...defaultProps} />);
        expect(screen.getByText('todo')).toBeInTheDocument();
        expect(screen.getByText('in-progress')).toBeInTheDocument();
        expect(screen.getByText('done')).toBeInTheDocument();
    });
});
