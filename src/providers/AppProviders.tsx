import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { AuthProvider } from '@/auth/AuthProvider';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Global staleTime: 5 minutes. Per-query configs in cacheConfig override this.
            // Prevents the 20+ dashboard components from each independently refetching
            // on every mount cycle when data is still fresh.
            refetchOnWindowFocus: true, // Enabled so switching browser tabs fetches fresh data
            retry: 1,
            retryDelay: 1_000,
            staleTime: 30_000,            // 30s prevents thundering herd in production
            gcTime: 10 * 60 * 1_000,      // 10 minutes GC
        },
        mutations: {
            retry: 0,
        },
    },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <PrimeReactProvider value={{ ripple: true }}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ToastProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </PrimeReactProvider>
    );
}
