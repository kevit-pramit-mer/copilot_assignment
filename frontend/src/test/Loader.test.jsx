import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from '../components/Loader';

describe('Loader', () => {
    it('renders a spinner with loading role', () => {
        render(<Loader />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has an accessible label', () => {
        render(<Loader />);
        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('renders screen-reader text', () => {
        render(<Loader />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
