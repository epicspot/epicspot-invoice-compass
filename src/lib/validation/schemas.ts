import { z } from 'zod';

// Schémas de validation pour les entités principales
export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Le nom du client est requis"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  tax_info: z.string().optional().nullable(),
  tax_center: z.string().optional().nullable(),
});

export const productSchema = z.object({
  id: z.string().uuid(),
  reference: z.string().min(1, "La référence est requise"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().nonnegative("Le prix doit être positif"),
  min_stock: z.number().int().nonnegative().optional().nullable(),
  tax_rate: z.number().nonnegative().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
});

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  number: z.string().min(1, "Le numéro est requis"),
  date: z.string().datetime(),
  client_id: z.string().uuid().nullable(),
  vendor_id: z.string().uuid().nullable(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  paid_amount: z.number().nonnegative().optional().nullable(),
  remaining_balance: z.number().optional().nullable(),
});

export const invoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  product_id: z.string().uuid().nullable(),
  quantity: z.number().int().positive("La quantité doit être positive"),
  amount: z.number().nonnegative("Le montant doit être positif"),
});

export const quoteSchema = z.object({
  id: z.string().uuid(),
  number: z.string().min(1),
  date: z.string().datetime(),
  client_id: z.string().uuid().nullable(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']),
  valid_until: z.string().datetime(),
});

export const quoteItemSchema = z.object({
  id: z.string().uuid(),
  quote_id: z.string().uuid(),
  product_id: z.string().uuid().nullable(),
  quantity: z.number().int().positive(),
  amount: z.number().nonnegative(),
});

export const collectionSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid().nullable(),
  client_id: z.string().uuid().nullable(),
  amount: z.number().positive("Le montant doit être positif"),
  payment_method: z.string().min(1),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }
  
  return {
    valid: false,
    errors: result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`),
    warnings: [],
  };
}
