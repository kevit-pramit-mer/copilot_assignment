/**
 * Badge component for color-coded status and priority labels.
 * @param {object} props
 * @param {'status'|'priority'} props.type - Badge category
 * @param {string} props.value - Badge value (e.g. 'todo', 'high')
 * @returns {JSX.Element}
 */
export default function Badge({ type, value }) {
    return (
        <span className={`badge badge-${type} badge-${type}-${value}`}>
            {value}
        </span>
    );
}
