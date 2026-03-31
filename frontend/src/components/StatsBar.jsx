/**
 * Stats bar showing task counts grouped by status and priority.
 * @param {object} props
 * @param {object|null} props.stats - Stats object from API
 * @returns {JSX.Element}
 */
export default function StatsBar({ stats }) {
    if (!stats) return null;

    const { byStatus = {}, byPriority = {} } = stats;
    const total = (byStatus.todo || 0) + (byStatus['in-progress'] || 0) + (byStatus.done || 0);

    return (
        <div className="stats-bar">
            <div className="stat-group">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{total}</span>
            </div>
            <div className="stat-group">
                <span className="stat-chip stat-todo">Todo: {byStatus.todo || 0}</span>
                <span className="stat-chip stat-in-progress">In Progress: {byStatus['in-progress'] || 0}</span>
                <span className="stat-chip stat-done">Done: {byStatus.done || 0}</span>
            </div>
            <div className="stat-group">
                <span className="stat-chip stat-high">High: {byPriority.high || 0}</span>
                <span className="stat-chip stat-medium">Medium: {byPriority.medium || 0}</span>
                <span className="stat-chip stat-low">Low: {byPriority.low || 0}</span>
            </div>
        </div>
    );
}
