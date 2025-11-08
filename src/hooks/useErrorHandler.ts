import { useToast } from "@/hooks/use-toast";
import { PostgrestError } from "@supabase/supabase-js";
import { createElement } from "react";
import { ToastAction } from "@/components/ui/toast";
import { useLogger } from "./useLogger";

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface ErrorHandlerOptions {
  severity?: ErrorSeverity;
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  logToConsole?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const logger = useLogger();

  const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      severity = 'error',
      title,
      action,
      logToConsole = true,
    } = options;

    // Log to console in development
    if (logToConsole && import.meta.env.DEV) {
      console.error('Error handled:', error);
    }

    // Extract error message
    let message = 'Une erreur inattendue s\'est produite';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (isPostgrestError(error)) {
      message = getPostgrestErrorMessage(error);
      errorCode = error.code;
    }

    // Log error to logger system
    const logLevel = severity === 'error' || severity === 'critical' ? 'error' : 
                     severity === 'warning' ? 'warn' : 'info';
    
    logger.log(logLevel, 'system', `Error handled: ${title || getDefaultTitle(severity)}`, {
      message,
      errorCode,
      severity,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });

    // Critical errors should be re-thrown to ErrorBoundary
    if (severity === 'critical') {
      throw error;
    }

    // Show toast notification for non-critical errors
    const toastTitle = title || getDefaultTitle(severity);
    const variant = severity === 'error' ? 'destructive' : 'default';

    toast({
      title: toastTitle,
      description: message,
      variant,
    });

    // Log to backend monitoring in production
    if (import.meta.env.PROD && severity === 'error') {
      logErrorToService(error, errorCode);
    }

    return { message, errorCode };
  };

  return { handleError };
};

// Helper functions
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

function getPostgrestErrorMessage(error: PostgrestError): string {
  const errorMessages: Record<string, string> = {
    'PGRST116': 'Aucune donnée trouvée',
    '23505': 'Cette entrée existe déjà',
    '23503': 'Impossible de supprimer : des données liées existent',
    '42501': 'Vous n\'avez pas les permissions nécessaires',
    '42P01': 'Table ou vue non trouvée',
  };

  return errorMessages[error.code] || error.message || 'Erreur de base de données';
}

function getDefaultTitle(severity: ErrorSeverity): string {
  const titles: Record<ErrorSeverity, string> = {
    info: 'Information',
    warning: 'Attention',
    error: 'Erreur',
    critical: 'Erreur critique',
  };

  return titles[severity];
}

function logErrorToService(error: unknown, errorCode?: string) {
  // In production, send to monitoring service (Sentry, LogRocket, etc.)
  console.log('Production error logged:', {
    error: error instanceof Error ? error.toString() : String(error),
    code: errorCode,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
}
