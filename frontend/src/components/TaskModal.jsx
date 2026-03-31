/**
 * Modal form for creating and editing tasks.
 * Validates title (required, 1-200 chars) before submission.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {object|null} props.task - Existing task for editing, null for create
 * @param {(data: object) => Promise<boolean>} props.onSubmit - Submit handler
 * @param {() => void} props.onClose - Close handler
 * @param {boolean} props.isLoading - Whether submission is in progress
 * @returns {JSX.Element|null}
 */
import { useState, useEffect } from 'react';

/** Valid priority values */
const PRIORITIES = ['low', 'medium', 'high'];

/** Valid status values */
const STATUSES = ['todo', 'in-progress', 'done'];

export default function TaskModal({ isOpen, task, onSubmit, onClose, isLoading }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');
    const [errors, setErrors] = useState({});

    const isEditing = !!task;

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'medium');
            setStatus(task.status || 'todo');
        } else {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setStatus('todo');
        }
        setErrors({});
    }, [task, isOpen]);

    /**
     * Validate form fields before submission.
     * @returns {boolean} True if valid
     */
    const validate = () => {
        const newErrors = {};
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.trim().length > 200) {
            newErrors.title = 'Title must be 200 characters or less';
        }
        if (!PRIORITIES.includes(priority)) {
            newErrors.priority = 'Invalid priority';
        }
        if (isEditing && !STATUSES.includes(status)) {
            newErrors.status = 'Invalid status';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission.
     * @param {Event} e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            title: title.trim(),
            description: description.trim(),
            priority,
        };
        if (isEditing) {
            data.status = status;
        }

        const success = await onSubmit(data);
        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Task' : 'Add Task'}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="task-title">Title *</label>
                        <input
                            id="task-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={errors.title ? 'input-error' : ''}
                            maxLength={200}
                            autoFocus
                        />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="task-desc">Description</label>
                        <textarea
                            id="task-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="task-priority">Priority</label>
                            <select
                                id="task-priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                {PRIORITIES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        {isEditing && (
                            <div className="form-group">
                                <label htmlFor="task-status">Status</label>
                                <select
                                    id="task-status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
