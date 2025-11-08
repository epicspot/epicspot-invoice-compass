import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRetryMonitoring } from '@/hooks/useRetryMonitoring';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Activity, AlertCircle, CheckCircle2, Info, Save } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RetrySettings {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const SystemSettings = () => {
  const { toast } = useToast();
  const { isEnabled, toggleMonitoring, stats, getSuccessRate } = useRetryMonitoring();
  
  const [retrySettings, setRetrySettings] = useLocalStorage<RetrySettings>('retry-settings', {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  });

  const [errorNotifications, setErrorNotifications] = useLocalStorage('error-notifications-enabled', true);
  const [criticalOnly, setCriticalOnly] = useLocalStorage('error-notifications-critical-only', false);
  const [retryNotifications, setRetryNotifications] = useLocalStorage('retry-notifications-enabled', false);

  const [localSettings, setLocalSettings] = useState(retrySettings);

  const handleSaveRetrySettings = () => {
    setRetrySettings(localSettings);
    toast({
      title: 'Paramètres enregistrés',
      description: 'Les paramètres de retry ont été mis à jour avec succès',
    });
  };

  const handleResetToDefaults = () => {
    const defaults = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    };
    setLocalSettings(defaults);
    setRetrySettings(defaults);
    toast({
      title: 'Paramètres réinitialisés',
      description: 'Les valeurs par défaut ont été restaurées',
    });
  };

  const successRate = getSuccessRate();

  return (
    <div className="space-y-6">
      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Monitoring des Retries
              </CardTitle>
              <CardDescription>
                Surveillance en temps réel des tentatives de retry
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isEnabled ? 'default' : 'secondary'} className="gap-2">
                {isEnabled ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Activé
                  </>
                ) : (
                  'Désactivé'
                )}
              </Badge>
              <Switch
                checked={isEnabled}
                onCheckedChange={toggleMonitoring}
              />
            </div>
          </div>
        </CardHeader>
        {isEnabled && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taux de Succès</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Tentatives</p>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Opérations Suivies</p>
                <p className="text-2xl font-bold">{Object.keys(stats.errorsByOperation).length}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Retry Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration des Retries</CardTitle>
          <CardDescription>
            Paramètres pour les tentatives automatiques de retry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">
                Nombre Maximum de Tentatives
              </Label>
              <Input
                id="maxAttempts"
                type="number"
                min={1}
                max={10}
                value={localSettings.maxAttempts}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  maxAttempts: parseInt(e.target.value) || 3,
                })}
              />
              <p className="text-xs text-muted-foreground">
                Nombre de fois qu'une opération sera retentée en cas d'échec
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialDelay">
                Délai Initial (ms)
              </Label>
              <Input
                id="initialDelay"
                type="number"
                min={100}
                max={5000}
                step={100}
                value={localSettings.initialDelay}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  initialDelay: parseInt(e.target.value) || 1000,
                })}
              />
              <p className="text-xs text-muted-foreground">
                Temps d'attente avant la première tentative de retry
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDelay">
                Délai Maximum (ms)
              </Label>
              <Input
                id="maxDelay"
                type="number"
                min={1000}
                max={60000}
                step={1000}
                value={localSettings.maxDelay}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  maxDelay: parseInt(e.target.value) || 10000,
                })}
              />
              <p className="text-xs text-muted-foreground">
                Délai maximum entre les tentatives (backoff plafonné)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backoffMultiplier">
                Multiplicateur de Backoff
              </Label>
              <Input
                id="backoffMultiplier"
                type="number"
                min={1}
                max={5}
                step={0.5}
                value={localSettings.backoffMultiplier}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  backoffMultiplier: parseFloat(e.target.value) || 2,
                })}
              />
              <p className="text-xs text-muted-foreground">
                Facteur d'augmentation du délai entre chaque tentative
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Backoff exponentiel :</strong> Le délai entre les tentatives augmente
              exponentiellement (délai × multiplicateur<sup>tentative</sup>). Par exemple, avec
              un délai initial de 1000ms et un multiplicateur de 2 : 1s, 2s, 4s, 8s...
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button onClick={handleSaveRetrySettings} className="gap-2">
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
            <Button variant="outline" onClick={handleResetToDefaults}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications d'Erreurs</CardTitle>
          <CardDescription>
            Configuration des notifications toast pour les erreurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer les Notifications d'Erreurs</Label>
              <p className="text-sm text-muted-foreground">
                Afficher des notifications toast pour les erreurs de l'application
              </p>
            </div>
            <Switch
              checked={errorNotifications}
              onCheckedChange={setErrorNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Erreurs Critiques Uniquement</Label>
              <p className="text-sm text-muted-foreground">
                N'afficher que les erreurs critiques, ignorer les avertissements
              </p>
            </div>
            <Switch
              checked={criticalOnly}
              onCheckedChange={setCriticalOnly}
              disabled={!errorNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications de Retry</Label>
              <p className="text-sm text-muted-foreground">
                Afficher une notification lors des tentatives de retry
              </p>
            </div>
            <Switch
              checked={retryNotifications}
              onCheckedChange={setRetryNotifications}
            />
          </div>

          {retryNotifications && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Les notifications de retry peuvent être fréquentes. Activez cette option uniquement
                pour le débogage.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Avancés</CardTitle>
          <CardDescription>
            Options avancées pour le monitoring et la gestion d'erreurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Les statistiques de monitoring sont stockées localement dans votre navigateur.
              Elles ne sont pas partagées avec le serveur et peuvent être effacées à tout moment
              depuis la page de monitoring.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
