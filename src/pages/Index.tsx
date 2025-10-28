
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        navigate(isAuthenticated ? '/dashboard' : '/login');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">EPICSPOT Compass</CardTitle>
          <CardDescription className="text-center">
            Gestion de facturation et de caisse
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Bienvenue sur votre application de gestion.</p>
          <p className="mt-2 text-muted-foreground">
            {isAuthenticated 
              ? 'Vous allez être redirigé vers le tableau de bord...'
              : 'Vous allez être redirigé vers la page de connexion...'}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
            Accéder immédiatement
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
