import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost',
                changeOrigin: true,
                rewrite: (path) => `/github_copilot_assignment/backend${path}`,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        include: ['src/test/**/*.{test,spec}.{js,jsx}'],
        css: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary'],
            include: ['src/**/*.{js,jsx}'],
            exclude: ['src/main.jsx', 'src/test/**'],
        },
    },
})
