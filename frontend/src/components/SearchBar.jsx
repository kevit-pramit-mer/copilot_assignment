/**
 * Search bar component for live filtering tasks as the user types.
 * @param {object} props
 * @param {string} props.value - Current search query
 * @param {(query: string) => void} props.onChange - Callback when search changes
 * @returns {JSX.Element}
 */
export default function SearchBar({ value, onChange }) {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search tasks by title..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="search-input"
                aria-label="Search tasks"
            />
            {value && (
                <button
                    className="search-clear"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                >
                    &times;
                </button>
            )}
        </div>
    );
}
