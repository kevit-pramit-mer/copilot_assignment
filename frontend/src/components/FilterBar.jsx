/**
 * Filter bar with dropdowns for status and priority filtering.
 * @param {object} props
 * @param {object} props.filters - Current filter values { status, priority }
 * @param {(filters: object) => void} props.onChange - Callback when filters change
 * @returns {JSX.Element}
 */

/** Valid status options for filtering */
const STATUS_OPTIONS = ['', 'todo', 'in-progress', 'done'];

/** Valid priority options for filtering */
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high'];

export default function FilterBar({ filters, onChange }) {
    return (
        <div className="filter-bar">
            <label className="filter-label">
                Status:
                <select
                    value={filters.status || ''}
                    onChange={(e) => onChange({ ...filters, status: e.target.value })}
                    className="filter-select"
                    aria-label="Filter by status"
                >
                    <option value="">All</option>
                    {STATUS_OPTIONS.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </label>
            <label className="filter-label">
                Priority:
                <select
                    value={filters.priority || ''}
                    onChange={(e) => onChange({ ...filters, priority: e.target.value })}
                    className="filter-select"
                    aria-label="Filter by priority"
                >
                    <option value="">All</option>
                    {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </label>
        </div>
    );
}
