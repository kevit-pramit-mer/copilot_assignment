/**
 * Root application component for the Task Management System.
 * Orchestrates filters, search, task list, modal, and stats.
 * @module App
 */
import { useState, useMemo } from 'react';
import { useTasks } from './hooks/useTasks';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import Loader from './components/Loader';
import './App.css';

/**
 * Main App component.
 * @returns {JSX.Element}
 */
function App() {
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const { tasks, stats, loading, actionLoading, addTask, editTask, removeTask, markComplete } =
        useTasks(filters);

    /** Filter tasks by search query (client-side, live as you type) */
    const filteredTasks = useMemo(() => {
        if (!search.trim()) return tasks;
        const q = search.toLowerCase();
        return tasks.filter((t) => t.title.toLowerCase().includes(q));
    }, [tasks, search]);

    /**
     * Open the modal for creating a new task.
     */
    const handleAdd = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    /**
     * Open the modal for editing an existing task.
     * @param {object} task - Task to edit
     */
    const handleEdit = (task) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    /**
     * Handle modal form submission for create/edit.
     * @param {object} data - Form data
     * @returns {Promise<boolean>}
     */
    const handleSubmit = async (data) => {
        if (editingTask) {
            return editTask(editingTask.id, data);
        }
        return addTask(data);
    };

    /**
     * Handle task deletion with confirmation.
     * @param {string} id - Task UUID
     */
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            removeTask(id);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Task Management System</h1>
                <button className="btn btn-primary btn-add" onClick={handleAdd}>
                    + Add Task
                </button>
            </header>

            <StatsBar stats={stats} />

            <div className="toolbar">
                <SearchBar value={search} onChange={setSearch} />
                <FilterBar filters={filters} onChange={setFilters} />
            </div>

            {loading ? (
                <Loader />
            ) : (
                <TaskTable
                    tasks={filteredTasks}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onComplete={markComplete}
                    actionLoading={actionLoading}
                />
            )}

            <TaskModal
                isOpen={modalOpen}
                task={editingTask}
                onSubmit={handleSubmit}
                onClose={() => setModalOpen(false)}
                isLoading={actionLoading === 'create'}
            />
        </div>
    );
}

export default App;
