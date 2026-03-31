import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../components/FilterBar';

describe('FilterBar', () => {
    it('renders status and priority dropdowns', () => {
        render(<FilterBar filters={{}} onChange={() => { }} />);
        expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument();
    });

    it('shows current status filter value', () => {
        render(<FilterBar filters={{ status: 'todo', priority: '' }} onChange={() => { }} />);
        expect(screen.getByLabelText('Filter by status')).toHaveValue('todo');
    });

    it('shows current priority filter value', () => {
        render(<FilterBar filters={{ status: '', priority: 'high' }} onChange={() => { }} />);
        expect(screen.getByLabelText('Filter by priority')).toHaveValue('high');
    });

    it('calls onChange when status changes', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<FilterBar filters={{ status: '', priority: '' }} onChange={onChange} />);
        await user.selectOptions(screen.getByLabelText('Filter by status'), 'in-progress');
        expect(onChange).toHaveBeenCalledWith({ status: 'in-progress', priority: '' });
    });

    it('calls onChange when priority changes', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<FilterBar filters={{ status: '', priority: '' }} onChange={onChange} />);
        await user.selectOptions(screen.getByLabelText('Filter by priority'), 'medium');
        expect(onChange).toHaveBeenCalledWith({ status: '', priority: 'medium' });
    });

    it('has All as default option for both selects', () => {
        render(<FilterBar filters={{}} onChange={() => { }} />);
        const statusSelect = screen.getByLabelText('Filter by status');
        const prioritySelect = screen.getByLabelText('Filter by priority');
        expect(statusSelect.querySelector('option[value=""]')).toHaveTextContent('All');
        expect(prioritySelect.querySelector('option[value=""]')).toHaveTextContent('All');
    });
});
