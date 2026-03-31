/**
 * Custom hook for task state management.
 * Handles fetching, creating, updating, deleting, and completing tasks.
 * Manages loading state and error handling via toast notifications.
 * @module useTasks
 */
import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/taskApi';
import { useToast } from '../context/ToastContext';

/**
 * Hook that manages the full task lifecycle.
 * @param {object} [filters={}] - Active filters for status/priority
 * @returns {object} Task state and action functions
 */
export function useTasks(filters = {}) {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const { showToast } = useToast();

    /**
     * Load all tasks with current filters.
     */
    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const [tasksRes, statsRes] = await Promise.all([
                api.fetchTasks(filters),
                api.fetchStats(),
            ]);
            setTasks(tasksRes.data);
            setStats(statsRes.data);
        } catch (err) {
            showToast(err.message || 'Failed to load tasks', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters.status, filters.priority, showToast]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    /**
     * Create a new task.
     * @param {object} taskData - New task data
     * @returns {Promise<boolean>} True if successful
     */
    const addTask = useCallback(async (taskData) => {
        setActionLoading('create');
        try {
            await api.createTask(taskData);
            showToast('Task created successfully', 'success');
            await loadTasks();
            return true;
        } catch (err) {
            showToast(err.message || 'Failed to create task', 'error');
            return false;
        } finally {
            setActionLoading(null);
        }
    }, [loadTasks, showToast]);

    /**
     * Update an existing task.
     * @param {string} id - Task UUID
     * @param {object} taskData - Fields to update
     * @returns {Promise<boolean>} True if successful
     */
    const editTask = useCallback(async (id, taskData) => {
        setActionLoading(id);
        try {
            await api.updateTask(id, taskData);
            showToast('Task updated successfully', 'success');
            await loadTasks();
            return true;
        } catch (err) {
            showToast(err.message || 'Failed to update task', 'error');
            return false;
        } finally {
            setActionLoading(null);
        }
    }, [loadTasks, showToast]);

    /**
     * Delete a task.
     * @param {string} id - Task UUID
     */
    const removeTask = useCallback(async (id) => {
        setActionLoading(id);
        try {
            await api.deleteTask(id);
            showToast('Task deleted successfully', 'success');
            await loadTasks();
        } catch (err) {
            showToast(err.message || 'Failed to delete task', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [loadTasks, showToast]);

    /**
     * Mark a task as complete.
     * @param {string} id - Task UUID
     */
    const markComplete = useCallback(async (id) => {
        setActionLoading(id);
        try {
            await api.completeTask(id);
            showToast('Task marked as done', 'success');
            await loadTasks();
        } catch (err) {
            showToast(err.message || 'Failed to complete task', 'error');
        } finally {
            setActionLoading(null);
        }
    }, [loadTasks, showToast]);

    return {
        tasks,
        stats,
        loading,
        actionLoading,
        addTask,
        editTask,
        removeTask,
        markComplete,
        reload: loadTasks,
    };
}
