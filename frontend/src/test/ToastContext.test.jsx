import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../context/ToastContext';

function TestComponent() {
    const { showToast } = useToast();
    return (
        <div>
            <button onClick={() => showToast('Success!', 'success')}>Show Success</button>
            <button onClick={() => showToast('Error!', 'error')}>Show Error</button>
            <button onClick={() => showToast('Info!')}>Show Info</button>
        </div>
    );
}

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('renders children', () => {
        render(
            <ToastProvider>
                <span>Child</span>
            </ToastProvider>,
        );
        expect(screen.getByText('Child')).toBeInTheDocument();
    });

    it('shows success toast', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>,
        );
        await act(async () => {
            screen.getByText('Show Success').click();
        });
        expect(screen.getByText('Success!')).toBeInTheDocument();
        expect(screen.getByText('Success!').closest('.toast')).toHaveClass('toast-success');
    });

    it('shows error toast', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>,
        );
        await act(async () => {
            screen.getByText('Show Error').click();
        });
        expect(screen.getByText('Error!')).toBeInTheDocument();
        expect(screen.getByText('Error!').closest('.toast')).toHaveClass('toast-error');
    });

    it('defaults to info type', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>,
        );
        await act(async () => {
            screen.getByText('Show Info').click();
        });
        expect(screen.getByText('Info!')).toBeInTheDocument();
        expect(screen.getByText('Info!').closest('.toast')).toHaveClass('toast-info');
    });

    it('auto-dismisses toast after 3 seconds', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>,
        );
        await act(async () => {
            screen.getByText('Show Success').click();
        });
        expect(screen.getByText('Success!')).toBeInTheDocument();
        await act(async () => {
            vi.advanceTimersByTime(3000);
        });
        expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });

    it('removes toast when close button clicked', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>,
        );
        await act(async () => {
            screen.getByText('Show Success').click();
        });
        expect(screen.getByText('Success!')).toBeInTheDocument();
        await act(async () => {
            screen.getByLabelText('Close notification').click();
        });
        expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });

    it('throws if useToast used outside provider', () => {
        function Bad() {
            useToast();
            return null;
        }
        expect(() => render(<Bad />)).toThrow('useToast must be used within ToastProvider');
    });

    it('can show multiple toasts', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>,
        );
        await act(async () => {
            screen.getByText('Show Success').click();
            screen.getByText('Show Error').click();
        });
        expect(screen.getByText('Success!')).toBeInTheDocument();
        expect(screen.getByText('Error!')).toBeInTheDocument();
    });
});
