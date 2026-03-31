/**
 * Loading spinner component.
 * Displays a centered spinner during async operations.
 * @returns {JSX.Element}
 */
export default function Loader() {
    return (
        <div className="loader-container" role="status" aria-label="Loading">
            <div className="loader-spinner" />
            <span className="sr-only">Loading...</span>
        </div>
    );
}
