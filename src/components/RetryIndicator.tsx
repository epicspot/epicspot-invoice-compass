import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';

interface RetryIndicatorProps {
  isRetrying: boolean;
  retryCount: number;
  maxAttempts: number;
  onCancel?: () => void;
}

export const RetryIndicator = ({
  isRetrying,
  retryCount,
  maxAttempts,
  onCancel,
}: RetryIndicatorProps) => {
  if (!isRetrying) return null;

  return (
    <Alert className="border-primary/50 bg-primary/5">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="flex-1">
          <AlertTitle className="text-sm font-medium">
            Nouvelle tentative en cours
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Tentative {retryCount} sur {maxAttempts}
          </AlertDescription>
        </div>
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-2"
          >
            Annuler
          </Button>
        )}
      </div>
    </Alert>
  );
};

interface NetworkErrorProps {
  onRetry: () => void;
  message?: string;
}

export const NetworkError = ({
  onRetry,
  message = 'Impossible de se connecter au serveur',
}: NetworkErrorProps) => {
  return (
    <Alert variant="destructive" className="border-destructive/50">
      <WifiOff className="h-5 w-5" />
      <div className="flex-1">
        <AlertTitle>Erreur de connexion</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="gap-2 border-destructive/50 hover:bg-destructive/10"
      >
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </Button>
    </Alert>
  );
};
