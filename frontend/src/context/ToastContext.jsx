/**
 * Toast notification context provider.
 * Provides showToast(message, type) to the entire app.
 * Types: 'success', 'error', 'info'
 * @module ToastContext
 */
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/** Duration in ms before toast auto-dismisses */
const TOAST_DURATION = 3000;

/**
 * Toast provider component wrapping the app.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    /**
     * Show a toast notification.
     * @param {string} message - Toast message text
     * @param {'success'|'error'|'info'} [type='info'] - Toast type
     */
    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_DURATION);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
                        <span>{toast.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close notification"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

/**
 * Hook to access the toast context.
 * @returns {{ showToast: (message: string, type?: string) => void }}
 */
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
