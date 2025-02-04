import { AsyncLocalStorage } from 'async_hooks';

// Export a singleton instance of AsyncLocalStorage to be used across the application
export const asyncLocalStorage = new AsyncLocalStorage<Record<string, any>>();
