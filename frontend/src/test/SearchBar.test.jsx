import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
    it('renders search input', () => {
        render(<SearchBar value="" onChange={() => { }} />);
        expect(screen.getByLabelText('Search tasks')).toBeInTheDocument();
    });

    it('displays current search value', () => {
        render(<SearchBar value="hello" onChange={() => { }} />);
        expect(screen.getByLabelText('Search tasks')).toHaveValue('hello');
    });

    it('calls onChange when user types', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<SearchBar value="" onChange={onChange} />);
        await user.type(screen.getByLabelText('Search tasks'), 'a');
        expect(onChange).toHaveBeenCalledWith('a');
    });

    it('shows clear button when value is non-empty', () => {
        render(<SearchBar value="test" onChange={() => { }} />);
        expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('hides clear button when value is empty', () => {
        render(<SearchBar value="" onChange={() => { }} />);
        expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('clears search when clear button clicked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<SearchBar value="test" onChange={onChange} />);
        await user.click(screen.getByLabelText('Clear search'));
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('has correct placeholder', () => {
        render(<SearchBar value="" onChange={() => { }} />);
        expect(screen.getByPlaceholderText('Search tasks by title...')).toBeInTheDocument();
    });
});
