import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Alert className="fixed top-4 right-4 w-96 z-50 border-orange-500 bg-orange-50 dark:bg-orange-950">
      <WifiOff className="h-4 w-4 text-orange-500" />
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        <strong>{t('pwa.offlineMode')}</strong>
        <br />
        {t('pwa.offlineMessage')}
      </AlertDescription>
    </Alert>
  );
}
