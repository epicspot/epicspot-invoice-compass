import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportData } from '@/components/ImportData';
import { SMSReminderPanel } from '@/components/SMSReminderPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Code, MessageSquare, Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Integrations() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Intégrations & Automatisation</h1>
        <p className="text-muted-foreground">
          Gérez vos imports de données, paiements en ligne, et rappels automatiques
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API REST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <ImportData />
        </TabsContent>

        <TabsContent value="sms">
          <SMSReminderPanel />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Intégration Stripe
              </CardTitle>
              <CardDescription>
                Acceptez les paiements en ligne pour vos factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-1" />
                  <div className="space-y-1">
                    <h3 className="font-medium">Paiements sécurisés avec Stripe</h3>
                    <p className="text-sm text-muted-foreground">
                      Intégrez Stripe pour accepter les cartes bancaires, virements et autres modes de paiement directement depuis vos factures.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Fonctionnalités:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Paiements par carte bancaire sécurisés</li>
                    <li>Virements bancaires SEPA</li>
                    <li>Suivi des paiements en temps réel</li>
                    <li>Gestion automatique des factures payées</li>
                  </ul>
                </div>

                <Button className="w-full">
                  Configurer Stripe
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Note: L'intégration Stripe nécessite un compte Stripe actif. Des frais de transaction s'appliquent selon les tarifs Stripe.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Documentation API REST
              </CardTitle>
              <CardDescription>
                Accédez à vos données via notre API REST documentée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary mt-1" />
                  <div className="space-y-1">
                    <h3 className="font-medium">API REST Complète</h3>
                    <p className="text-sm text-muted-foreground">
                      Notre API vous permet d'intégrer vos données avec d'autres systèmes et applications tierces.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Endpoints disponibles:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="border rounded p-2">
                      <code className="text-xs">GET /api/clients</code> - Liste des clients
                    </div>
                    <div className="border rounded p-2">
                      <code className="text-xs">GET /api/invoices</code> - Liste des factures
                    </div>
                    <div className="border rounded p-2">
                      <code className="text-xs">GET /api/products</code> - Liste des produits
                    </div>
                    <div className="border rounded p-2">
                      <code className="text-xs">POST /api/clients</code> - Créer un client
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Base URL:</h4>
                  <code className="block bg-background p-2 rounded text-xs">
                    http://localhost:3001/api
                  </code>
                </div>

                <Button className="w-full" asChild>
                  <a href="http://localhost:3001/documentation" target="_blank" rel="noopener noreferrer">
                    Ouvrir la documentation Swagger
                  </a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Note: La documentation Swagger interactive sera disponible une fois le serveur backend configuré avec @fastify/swagger.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
