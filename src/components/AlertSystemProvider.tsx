import { useAlertSystem } from '@/hooks/useAlertSystem';
import { useEffect } from 'react';

export function AlertSystemProvider({ children }: { children: React.ReactNode }) {
  const alertSystem = useAlertSystem();

  // Le système s'initialise et tourne automatiquement via le hook
  // Pas besoin de logique supplémentaire ici, juste d'instancier le hook

  useEffect(() => {
    console.log('Alert system initialized', alertSystem.config);
  }, []);

  return <>{children}</>;
}
