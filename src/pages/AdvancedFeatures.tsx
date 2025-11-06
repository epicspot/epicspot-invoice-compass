import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedExport } from '@/components/AdvancedExport';
import { ActiveUsers } from '@/components/ActiveUsers';
import { Sparkles, Download, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdvancedFeatures() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          Fonctionnalités Avancées
        </h1>
        <p className="text-muted-foreground">
          Outils avancés pour optimiser votre gestion d'entreprise
        </p>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Avancé
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automatisation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <div className="grid gap-6">
            <AdvancedExport />
          </div>
        </TabsContent>

        <TabsContent value="collaboration">
          <div className="grid gap-6">
            <ActiveUsers />
            
            <Card>
              <CardHeader>
                <CardTitle>Collaboration en Temps Réel</CardTitle>
                <CardDescription>
                  Visualisez l'activité de votre équipe en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div className="space-y-1">
                      <h3 className="font-medium">Présence en Temps Réel</h3>
                      <p className="text-sm text-muted-foreground">
                        Voyez qui est connecté et sur quelle page ils travaillent. Mise à jour automatique toutes les 30 secondes.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Fonctionnalités:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Indicateurs de présence en temps réel</li>
                      <li>Localisation par page</li>
                      <li>Historique des connexions</li>
                      <li>Notifications de présence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automatisation des Tâches
              </CardTitle>
              <CardDescription>
                Automatisez vos processus métier récurrents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-1" />
                  <div className="space-y-1">
                    <h3 className="font-medium">Workflows Automatisés</h3>
                    <p className="text-sm text-muted-foreground">
                      Créez des automatisations pour déclencher des actions basées sur des événements.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Exemples d'automatisation:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Envoi automatique de rappels de paiement</li>
                    <li>Alerte de stock bas</li>
                    <li>Génération automatique de rapports mensuels</li>
                    <li>Synchronisation avec systèmes externes</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Ces fonctionnalités utilisent les Edge Functions Supabase et les intégrations configurées dans la Phase 4.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
