/**
 * API client for the Task Management backend.
 * All functions return parsed JSON and throw on HTTP errors.
 * @module taskApi
 */

const BASE_URL = '/api/tasks';

/**
 * Parse API response and throw on failure.
 * @param {Response} response - Fetch response object
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} If response indicates failure
 */
async function handleResponse(response) {
    const json = await response.json();
    if (!response.ok || !json.success) {
        const message = json.data?.message || json.message || `HTTP ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }
    return json;
}

/**
 * Fetch all tasks with optional status and priority filters.
 * @param {object} [filters={}] - Optional filters
 * @param {string} [filters.status] - Filter by status (todo|in-progress|done)
 * @param {string} [filters.priority] - Filter by priority (low|medium|high)
 * @returns {Promise<object>} API response with tasks array in data
 */
export async function fetchTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    const query = params.toString();
    const url = query ? `${BASE_URL}?${query}` : BASE_URL;
    const response = await fetch(url);
    return handleResponse(response);
}

/**
 * Fetch a single task by ID.
 * @param {string} id - Task UUID
 * @returns {Promise<object>} API response with task object in data
 */
export async function fetchTask(id) {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`);
    return handleResponse(response);
}

/**
 * Fetch task statistics grouped by status and priority.
 * @returns {Promise<object>} API response with stats in data
 */
export async function fetchStats() {
    const response = await fetch(`${BASE_URL}/stats`);
    return handleResponse(response);
}

/**
 * Create a new task.
 * @param {object} taskData - Task data
 * @param {string} taskData.title - Task title (required, 1-200 chars)
 * @param {string} [taskData.description] - Task description
 * @param {string} [taskData.priority] - Priority (low|medium|high)
 * @returns {Promise<object>} API response with created task in data
 */
export async function createTask(taskData) {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    return handleResponse(response);
}

/**
 * Update an existing task.
 * @param {string} id - Task UUID
 * @param {object} taskData - Fields to update
 * @returns {Promise<object>} API response with updated task in data
 */
export async function updateTask(id, taskData) {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    return handleResponse(response);
}

/**
 * Delete a task by ID.
 * @param {string} id - Task UUID
 * @returns {Promise<object>} API response confirming deletion
 */
export async function deleteTask(id) {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
}

/**
 * Mark a task as complete (done).
 * @param {string} id - Task UUID
 * @returns {Promise<object>} API response with completed task in data
 */
export async function completeTask(id) {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/complete`, {
        method: 'POST',
    });
    return handleResponse(response);
}
