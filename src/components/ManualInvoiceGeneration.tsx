import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PlayCircle, Loader2 } from 'lucide-react';

const ManualInvoiceGeneration = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-subscription-invoices');

      if (error) throw error;

      const result = data as {
        success: boolean;
        successCount?: number;
        errorCount?: number;
        message?: string;
      };

      if (result.success) {
        toast({
          title: "Factures générées",
          description: `${result.successCount || 0} facture(s) créée(s) avec succès`,
        });
      } else {
        toast({
          title: "Génération partielle",
          description: `${result.successCount || 0} succès, ${result.errorCount || 0} erreur(s)`,
          variant: "destructive",
        });
      }

      // Recharger la page pour afficher les nouvelles factures
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Error generating invoices:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les factures",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Génération manuelle
        </CardTitle>
        <CardDescription>
          Générez manuellement les factures pour tous les abonnements actifs qui arrivent à échéance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleGenerateInvoices} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Générer les factures maintenant
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManualInvoiceGeneration;
