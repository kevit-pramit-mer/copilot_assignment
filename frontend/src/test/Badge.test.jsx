import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../components/Badge';

describe('Badge', () => {
    it('renders with correct text', () => {
        render(<Badge type="status" value="todo" />);
        expect(screen.getByText('todo')).toBeInTheDocument();
    });

    it('applies status CSS class', () => {
        render(<Badge type="status" value="done" />);
        const el = screen.getByText('done');
        expect(el).toHaveClass('badge', 'badge-status', 'badge-status-done');
    });

    it('applies priority CSS class', () => {
        render(<Badge type="priority" value="high" />);
        const el = screen.getByText('high');
        expect(el).toHaveClass('badge', 'badge-priority', 'badge-priority-high');
    });

    it('renders in-progress status badge', () => {
        render(<Badge type="status" value="in-progress" />);
        const el = screen.getByText('in-progress');
        expect(el).toHaveClass('badge-status-in-progress');
    });

    it('renders low priority badge', () => {
        render(<Badge type="priority" value="low" />);
        expect(screen.getByText('low')).toHaveClass('badge-priority-low');
    });

    it('renders medium priority badge', () => {
        render(<Badge type="priority" value="medium" />);
        expect(screen.getByText('medium')).toHaveClass('badge-priority-medium');
    });
});
