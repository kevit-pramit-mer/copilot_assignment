import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsBar from '../components/StatsBar';

describe('StatsBar', () => {
    it('returns null when stats is null', () => {
        const { container } = render(<StatsBar stats={null} />);
        expect(container.innerHTML).toBe('');
    });

    it('displays total count', () => {
        const stats = {
            byStatus: { todo: 3, 'in-progress': 2, done: 1 },
            byPriority: { high: 1, medium: 2, low: 3 },
        };
        render(<StatsBar stats={stats} />);
        expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('displays status counts', () => {
        const stats = {
            byStatus: { todo: 5, 'in-progress': 3, done: 7 },
            byPriority: {},
        };
        render(<StatsBar stats={stats} />);
        expect(screen.getByText('Todo: 5')).toBeInTheDocument();
        expect(screen.getByText('In Progress: 3')).toBeInTheDocument();
        expect(screen.getByText('Done: 7')).toBeInTheDocument();
    });

    it('displays priority counts', () => {
        const stats = {
            byStatus: {},
            byPriority: { high: 2, medium: 4, low: 6 },
        };
        render(<StatsBar stats={stats} />);
        expect(screen.getByText('High: 2')).toBeInTheDocument();
        expect(screen.getByText('Medium: 4')).toBeInTheDocument();
        expect(screen.getByText('Low: 6')).toBeInTheDocument();
    });

    it('defaults missing counts to 0', () => {
        const stats = { byStatus: {}, byPriority: {} };
        render(<StatsBar stats={stats} />);
        expect(screen.getByText('0')).toBeInTheDocument(); // total
        expect(screen.getByText('Todo: 0')).toBeInTheDocument();
        expect(screen.getByText('Done: 0')).toBeInTheDocument();
    });

    it('handles missing byStatus and byPriority gracefully', () => {
        render(<StatsBar stats={{}} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });
});
