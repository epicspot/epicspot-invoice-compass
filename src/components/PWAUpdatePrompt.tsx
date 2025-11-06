import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export function PWAUpdatePrompt() {
  const { t } = useTranslation();
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNeedRefresh(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().then(() => {
          window.location.reload();
        });
      });
    }
  };

  if (!needRefresh) return null;

  return (
    <Card className="fixed bottom-4 left-4 w-80 shadow-lg z-50 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{t('pwa.updateAvailable')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('pwa.updateMessage')}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} size="sm" className="flex-1">
                Mettre à jour
              </Button>
              <Button onClick={() => setNeedRefresh(false)} size="sm" variant="ghost">
                Plus tard
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
