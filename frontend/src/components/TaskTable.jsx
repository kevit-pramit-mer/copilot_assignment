/**
 * Task table displaying all tasks with action buttons.
 * Each row shows title, priority badge, status badge, created date,
 * and Edit/Delete/Complete action buttons.
 * @param {object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {(task: object) => void} props.onEdit - Edit button handler
 * @param {(id: string) => void} props.onDelete - Delete button handler
 * @param {(id: string) => void} props.onComplete - Complete button handler
 * @param {string|null} props.actionLoading - ID of task currently being acted on
 * @returns {JSX.Element}
 */
import Badge from './Badge';

export default function TaskTable({ tasks, onEdit, onDelete, onComplete, actionLoading }) {
    if (tasks.length === 0) {
        return <p className="empty-message">No tasks found. Create one to get started!</p>;
    }

    /**
     * Format ISO timestamp to a human-readable date string.
     * @param {string} iso - ISO timestamp
     * @returns {string} Formatted date
     */
    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="table-wrapper">
            <table className="task-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => {
                        const isActing = actionLoading === task.id;
                        return (
                            <tr key={task.id} className={task.status === 'done' ? 'row-done' : ''}>
                                <td className="cell-title">
                                    <span className="task-title">{task.title}</span>
                                    {task.description && (
                                        <span className="task-desc">{task.description}</span>
                                    )}
                                </td>
                                <td><Badge type="priority" value={task.priority} /></td>
                                <td><Badge type="status" value={task.status} /></td>
                                <td className="cell-date">{formatDate(task.createdAt)}</td>
                                <td className="cell-actions">
                                    <button
                                        className="btn btn-sm btn-edit"
                                        onClick={() => onEdit(task)}
                                        disabled={isActing}
                                        aria-label={`Edit ${task.title}`}
                                    >
                                        Edit
                                    </button>
                                    {task.status !== 'done' && (
                                        <button
                                            className="btn btn-sm btn-complete"
                                            onClick={() => onComplete(task.id)}
                                            disabled={isActing}
                                            aria-label={`Complete ${task.title}`}
                                        >
                                            {isActing ? '...' : 'Complete'}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-sm btn-delete"
                                        onClick={() => onDelete(task.id)}
                                        disabled={isActing}
                                        aria-label={`Delete ${task.title}`}
                                    >
                                        {isActing ? '...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
