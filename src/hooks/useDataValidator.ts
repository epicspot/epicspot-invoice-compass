import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLogger } from './useLogger';
import { useToast } from '@/hooks/use-toast';
import {
  clientSchema,
  productSchema,
  invoiceSchema,
  invoiceItemSchema,
  quoteSchema,
  quoteItemSchema,
  collectionSchema,
  validateData,
} from '@/lib/validation/schemas';

export interface ValidationReport {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  repairedItems: number;
  criticalIssues: string[];
  warnings: string[];
  timestamp: string;
}

export function useDataValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const logger = useLogger();
  const { toast } = useToast();

  const validateClients = useCallback(async () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    let repaired = 0;

    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*');

      if (error) throw error;

      for (const client of clients || []) {
        const validation = validateData(clientSchema, client);
        
        if (!validation.valid) {
          issues.push(`Client ${client.id}: ${validation.errors.join(', ')}`);
          
          // Tentative de réparation
          const repairs: any = {};
          if (!client.name || client.name.trim() === '') {
            repairs.name = `Client ${client.code || client.id.substring(0, 8)}`;
            repaired++;
          }
          if (!client.phone || client.phone.trim() === '') {
            repairs.phone = 'N/A';
            repaired++;
          }
          
          if (Object.keys(repairs).length > 0) {
            await supabase
              .from('clients')
              .update(repairs)
              .eq('id', client.id);
            
            logger.info('system', `Client réparé: ${client.id}`, repairs);
          }
        }
      }

      return { issues, warnings, repaired };
    } catch (error) {
      logger.error('system', 'Erreur validation clients', error);
      return { issues: ['Erreur lors de la validation des clients'], warnings: [], repaired: 0 };
    }
  }, [logger]);

  const validateProducts = useCallback(async () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    let repaired = 0;

    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      for (const product of products || []) {
        const validation = validateData(productSchema, product);
        
        if (!validation.valid) {
          issues.push(`Produit ${product.id}: ${validation.errors.join(', ')}`);
          
          const repairs: any = {};
          if (!product.reference || product.reference.trim() === '') {
            repairs.reference = `REF-${product.id.substring(0, 8)}`;
            repaired++;
          }
          if (!product.description || product.description.trim() === '') {
            repairs.description = 'Sans description';
            repaired++;
          }
          if (product.price === null || product.price === undefined || product.price < 0) {
            repairs.price = 0;
            warnings.push(`Produit ${product.id}: prix fixé à 0`);
            repaired++;
          }
          
          if (Object.keys(repairs).length > 0) {
            await supabase
              .from('products')
              .update(repairs)
              .eq('id', product.id);
            
            logger.info('system', `Produit réparé: ${product.id}`, repairs);
          }
        }
      }

      return { issues, warnings, repaired };
    } catch (error) {
      logger.error('system', 'Erreur validation produits', error);
      return { issues: ['Erreur lors de la validation des produits'], warnings: [], repaired: 0 };
    }
  }, [logger]);

  const validateInvoices = useCallback(async () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    let repaired = 0;

    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*');

      if (error) throw error;

      for (const invoice of invoices || []) {
        const validation = validateData(invoiceSchema, invoice);
        
        if (!validation.valid) {
          issues.push(`Facture ${invoice.number}: ${validation.errors.join(', ')}`);
        }

        // Vérifier les totaux
        if (invoice.total < 0) {
          warnings.push(`Facture ${invoice.number}: total négatif (${invoice.total})`);
        }
        if (invoice.paid_amount > invoice.total) {
          warnings.push(`Facture ${invoice.number}: montant payé > total`);
        }
      }

      return { issues, warnings, repaired };
    } catch (error) {
      logger.error('system', 'Erreur validation factures', error);
      return { issues: ['Erreur lors de la validation des factures'], warnings: [], repaired: 0 };
    }
  }, [logger]);

  const validateInvoiceItems = useCallback(async () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    let repaired = 0;

    try {
      const { data: items, error } = await supabase
        .from('invoice_items')
        .select('*');

      if (error) throw error;

      for (const item of items || []) {
        const validation = validateData(invoiceItemSchema, item);
        
        if (!validation.valid) {
          issues.push(`Item facture ${item.id}: ${validation.errors.join(', ')}`);
        }

        // Vérifier que le produit existe
        if (item.product_id) {
          const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', item.product_id)
            .maybeSingle();
          
          if (!product) {
            warnings.push(`Item ${item.id}: produit ${item.product_id} inexistant`);
          }
        } else {
          warnings.push(`Item ${item.id}: aucun produit associé`);
        }
      }

      return { issues, warnings, repaired };
    } catch (error) {
      logger.error('system', 'Erreur validation items facture', error);
      return { issues: ['Erreur lors de la validation des items de facture'], warnings: [], repaired: 0 };
    }
  }, [logger]);

  const validateQuotes = useCallback(async () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    let repaired = 0;

    try {
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*');

      if (error) throw error;

      for (const quote of quotes || []) {
        const validation = validateData(quoteSchema, quote);
        
        if (!validation.valid) {
          issues.push(`Devis ${quote.number}: ${validation.errors.join(', ')}`);
        }

        // Vérifier les dates
        if (new Date(quote.valid_until) < new Date(quote.date)) {
          warnings.push(`Devis ${quote.number}: date d'expiration antérieure à la date de création`);
        }
      }

      return { issues, warnings, repaired };
    } catch (error) {
      logger.error('system', 'Erreur validation devis', error);
      return { issues: ['Erreur lors de la validation des devis'], warnings: [], repaired: 0 };
    }
  }, [logger]);

  const validateCollections = useCallback(async () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    let repaired = 0;

    try {
      const { data: collections, error } = await supabase
        .from('collections')
        .select('*');

      if (error) throw error;

      for (const collection of collections || []) {
        const validation = validateData(collectionSchema, collection);
        
        if (!validation.valid) {
          issues.push(`Encaissement ${collection.id}: ${validation.errors.join(', ')}`);
        }

        // Vérifier que la facture existe
        if (collection.invoice_id) {
          const { data: invoice } = await supabase
            .from('invoices')
            .select('id')
            .eq('id', collection.invoice_id)
            .maybeSingle();
          
          if (!invoice) {
            warnings.push(`Encaissement ${collection.id}: facture ${collection.invoice_id} inexistante`);
          }
        }
      }

      return { issues, warnings, repaired };
    } catch (error) {
      logger.error('system', 'Erreur validation encaissements', error);
      return { issues: ['Erreur lors de la validation des encaissements'], warnings: [], repaired: 0 };
    }
  }, [logger]);

  const validateAll = useCallback(async () => {
    setIsValidating(true);
    logger.info('system', 'Démarrage de la validation globale des données');

    try {
      const [
        clientsResult,
        productsResult,
        invoicesResult,
        invoiceItemsResult,
        quotesResult,
        collectionsResult,
      ] = await Promise.all([
        validateClients(),
        validateProducts(),
        validateInvoices(),
        validateInvoiceItems(),
        validateQuotes(),
        validateCollections(),
      ]);

      const allIssues = [
        ...clientsResult.issues,
        ...productsResult.issues,
        ...invoicesResult.issues,
        ...invoiceItemsResult.issues,
        ...quotesResult.issues,
        ...collectionsResult.issues,
      ];

      const allWarnings = [
        ...clientsResult.warnings,
        ...productsResult.warnings,
        ...invoicesResult.warnings,
        ...invoiceItemsResult.warnings,
        ...quotesResult.warnings,
        ...collectionsResult.warnings,
      ];

      const totalRepaired = 
        clientsResult.repaired +
        productsResult.repaired +
        invoicesResult.repaired +
        invoiceItemsResult.repaired +
        quotesResult.repaired +
        collectionsResult.repaired;

      const validationReport: ValidationReport = {
        totalChecks: 6,
        passedChecks: 6 - allIssues.length,
        failedChecks: allIssues.length,
        repairedItems: totalRepaired,
        criticalIssues: allIssues,
        warnings: allWarnings,
        timestamp: new Date().toISOString(),
      };

      setReport(validationReport);
      
      logger.info('system', 'Validation globale terminée', validationReport);

      // Afficher une notification
      if (allIssues.length === 0 && allWarnings.length === 0) {
        toast({
          title: "✅ Validation réussie",
          description: "Toutes les données sont valides.",
        });
      } else if (totalRepaired > 0) {
        toast({
          title: "🔧 Données réparées",
          description: `${totalRepaired} élément(s) corrigé(s). ${allWarnings.length} avertissement(s).`,
          variant: allIssues.length > 0 ? "destructive" : "default",
        });
      } else if (allIssues.length > 0) {
        toast({
          title: "⚠️ Problèmes détectés",
          description: `${allIssues.length} erreur(s) critique(s), ${allWarnings.length} avertissement(s).`,
          variant: "destructive",
        });
      }

      return validationReport;
    } catch (error) {
      logger.error('system', 'Erreur lors de la validation globale', error);
      toast({
        title: "❌ Erreur de validation",
        description: "Impossible de valider les données.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [
    validateClients,
    validateProducts,
    validateInvoices,
    validateInvoiceItems,
    validateQuotes,
    validateCollections,
    logger,
    toast,
  ]);

  return {
    isValidating,
    report,
    validateAll,
    validateClients,
    validateProducts,
    validateInvoices,
    validateInvoiceItems,
    validateQuotes,
    validateCollections,
  };
}
