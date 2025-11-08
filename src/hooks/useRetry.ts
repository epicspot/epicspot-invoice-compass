import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['PGRST116', '23505', 'NETWORK_ERROR', 'TIMEOUT'],
  onRetry: () => {},
};

export const useRetry = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { handleError } = useErrorHandler();

  const shouldRetry = (error: unknown, attempt: number, options: RetryOptions): boolean => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (attempt >= opts.maxAttempts) {
      return false;
    }

    // Check if error is retryable
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const errorCode = (error as any).code;
      return opts.retryableErrors.includes(errorCode);
    }

    // Retry network errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('network') || 
             message.includes('timeout') || 
             message.includes('connection');
    }

    return false;
  };

  const calculateDelay = (attempt: number, options: RetryOptions): number => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const delay = opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt);
    return Math.min(delay, opts.maxDelay);
  };

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: unknown;
    let attempt = 0;

    while (attempt < opts.maxAttempts) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);

        const result = await operation();
        
        // Success - reset state
        setIsRetrying(false);
        setRetryCount(0);
        
        return result;
      } catch (error) {
        lastError = error;
        attempt++;

        if (!shouldRetry(error, attempt, opts)) {
          // Error is not retryable or max attempts reached
          setIsRetrying(false);
          setRetryCount(0);
          throw error;
        }

        // Calculate delay with jitter to avoid thundering herd
        const baseDelay = calculateDelay(attempt - 1, opts);
        const jitter = Math.random() * 0.3 * baseDelay; // ±30% jitter
        const delay = baseDelay + jitter;

        // Notify about retry
        opts.onRetry(attempt, error);
        
        handleError(error, {
          severity: 'info',
          title: `Nouvelle tentative (${attempt}/${opts.maxAttempts})`,
          logToConsole: true,
        });

        // Wait before retry
        await sleep(delay);
      }
    }

    // All retries failed
    setIsRetrying(false);
    setRetryCount(0);
    throw lastError;
  };

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    reset,
  };
};

// Utility function for wrapping async functions with retry logic
export const withRetry = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: unknown;
    let attempt = 0;

    while (attempt < opts.maxAttempts) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        attempt++;

        const shouldRetryError = (error: unknown, attempt: number): boolean => {
          if (attempt >= opts.maxAttempts) return false;
          
          if (typeof error === 'object' && error !== null && 'code' in error) {
            const errorCode = (error as any).code;
            return opts.retryableErrors.includes(errorCode);
          }

          if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return message.includes('network') || 
                   message.includes('timeout') || 
                   message.includes('connection');
          }

          return false;
        };

        if (!shouldRetryError(error, attempt)) {
          throw error;
        }

        const baseDelay = opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1);
        const delay = Math.min(baseDelay, opts.maxDelay);
        const jitter = Math.random() * 0.3 * delay;

        opts.onRetry(attempt, error);
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }

    throw lastError;
  }) as T;
};
