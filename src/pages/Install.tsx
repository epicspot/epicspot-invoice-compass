import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  Share2,
  Chrome,
  Apple,
  Monitor
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/icon-192.png" 
              alt="EPICSPOT Logo" 
              className="h-24 w-24 rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold">EPICSPOT Consulting</h1>
          <p className="text-xl text-muted-foreground">
            Installez l'application sur votre appareil
          </p>
        </div>

        {isStandalone ? (
          <Card className="border-2 border-green-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <CardTitle>Application déjà installée !</CardTitle>
              </div>
              <CardDescription>
                Vous utilisez actuellement l'application installée.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : isInstalled ? (
          <Card className="border-2 border-green-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <CardTitle>Installation réussie !</CardTitle>
              </div>
              <CardDescription>
                L'application a été installée avec succès. Vous la trouverez sur votre écran d'accueil.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {deferredPrompt && !isIOS && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-6 w-6" />
                    Installation en un clic
                  </CardTitle>
                  <CardDescription>
                    Installez l'application directement sur votre appareil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleInstallClick}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Installer l'application
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Apple className="h-6 w-6" />
                    <CardTitle>iPhone / iPad</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Ouvrez cette page dans Safari</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <div className="flex items-center gap-2">
                        <span>Appuyez sur</span>
                        <Share2 className="h-4 w-4" />
                        <span>(Partager)</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Sélectionnez "Sur l'écran d'accueil"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">4.</span>
                      <span>Appuyez sur "Ajouter"</span>
                    </li>
                  </ol>
                  {isIOS && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Vous êtes sur iOS
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Chrome className="h-6 w-6" />
                    <CardTitle>Android / Chrome</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Ouvrez cette page dans Chrome</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>Appuyez sur le menu (⋮) en haut à droite</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Sélectionnez "Installer l'application"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">4.</span>
                      <span>Confirmez l'installation</span>
                    </li>
                  </ol>
                  {isAndroid && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Vous êtes sur Android
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6" />
              Avantages de l'application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Accès rapide</p>
                  <p className="text-sm text-muted-foreground">
                    Lancez l'app depuis votre écran d'accueil
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Fonctionne hors ligne</p>
                  <p className="text-sm text-muted-foreground">
                    Utilisez l'app même sans connexion
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Mises à jour automatiques</p>
                  <p className="text-sm text-muted-foreground">
                    Toujours la dernière version
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Expérience native</p>
                  <p className="text-sm text-muted-foreground">
                    Interface optimisée pour mobile
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-6 w-6" />
              Compatible avec tous les appareils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">iPhone</Badge>
              <Badge variant="secondary">iPad</Badge>
              <Badge variant="secondary">Android</Badge>
              <Badge variant="secondary">Windows</Badge>
              <Badge variant="secondary">Mac</Badge>
              <Badge variant="secondary">Linux</Badge>
              <Badge variant="secondary">Chrome</Badge>
              <Badge variant="secondary">Safari</Badge>
              <Badge variant="secondary">Edge</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
