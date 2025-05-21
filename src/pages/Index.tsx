
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  // Nous gardons la redirection mais nous ajoutons un délai pour que l'utilisateur puisse voir le contenu
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000); // Redirection après 2 secondes
    
    return () => clearTimeout(timer);
  }, [navigate]);

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
          <p className="mt-2 text-muted-foreground">Vous allez être redirigé vers le tableau de bord...</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/dashboard')}>
            Accéder immédiatement
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
