import { z } from 'zod';

// Client Schema
export const clientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  address: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email invalide').max(255).optional().or(z.literal('')),
});

// Product Schema
export const productSchema = z.object({
  description: z.string().min(1, 'La description est requise').max(255),
  unit_price: z.number().positive('Le prix doit être positif'),
  quantity: z.number().int().min(0).optional(),
  category: z.string().max(100).optional(),
});

// Supplier Schema
export const supplierSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  address: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email invalide').max(255).optional().or(z.literal('')),
  vat_number: z.string().max(50).optional(),
});

// Vendor Schema
export const vendorSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  phone: z.string().min(1, 'Le téléphone est requis').max(20),
  email: z.string().email('Email invalide').max(255).optional().or(z.literal('')),
  address: z.string().max(255).optional(),
  siteId: z.string().min(1, 'Le site est requis'),
});

// Collection Schema
export const collectionSchema = z.object({
  vendorId: z.string().min(1, 'Le vendeur est requis'),
  amount: z.number().positive('Le montant doit être positif'),
  collectionDate: z.string().min(1, 'La date est requise'),
  collectorId: z.string().min(1, 'Le collecteur est requis'),
  paymentMethod: z.enum(['cash', 'check', 'mobile_money', 'bank_transfer']),
  notes: z.string().max(500).optional(),
});

// Invoice Schema
export const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Le client est requis'),
  date: z.string().min(1, 'La date est requise'),
  items: z.array(z.any()).min(1, 'Au moins un article est requis'),
  total: z.number().positive('Le total doit être positif'),
  tax: z.number().min(0).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']).optional(),
  paid_amount: z.number().min(0).optional(),
});

// Quote Schema
export const quoteSchema = z.object({
  client_id: z.string().min(1, 'Le client est requis'),
  date: z.string().min(1, 'La date est requise'),
  items: z.array(z.any()).min(1, 'Au moins un article est requis'),
  total: z.number().positive('Le total doit être positif'),
  tax: z.number().min(0).optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
});

// Lead Schema
export const leadSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  company: z.string().max(100).optional(),
  email: z.string().email('Email invalide').max(255).optional().or(z.literal('')),
  phone: z.string().min(1, 'Le téléphone est requis').max(20),
  address: z.string().max(255).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  source: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  estimatedValue: z.number().min(0).optional(),
});

// Reminder Schema
export const reminderSchema = z.object({
  invoice_id: z.string().min(1, 'La facture est requise'),
  client_name: z.string().min(1, 'Le nom du client est requis'),
  amount: z.number().positive('Le montant doit être positif'),
  status: z.enum(['pending', 'sent', 'completed', 'cancelled']).optional(),
  next_reminder_date: z.string().optional(),
});

// Stock Movement Schema
export const stockMovementSchema = z.object({
  product_id: z.string().min(1, 'Le produit est requis'),
  site_id: z.string().min(1, 'Le site est requis'),
  quantity: z.number().int().refine((val) => val !== 0, 'La quantité ne peut pas être 0'),
  type: z.enum(['purchase', 'sale', 'adjustment', 'transfer', 'return']),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// Purchase Order Schema
export const purchaseOrderSchema = z.object({
  number: z.string().min(1, 'Le numéro est requis').max(50),
  supplier_id: z.string().min(1, 'Le fournisseur est requis'),
  order_date: z.string().min(1, 'La date est requise'),
  expected_delivery_date: z.string().optional(),
  items: z.array(z.any()).min(1, 'Au moins un article est requis'),
  total: z.number().positive('Le total doit être positif'),
  status: z.enum(['draft', 'sent', 'received', 'cancelled']).optional(),
});

// Helper function to validate request body
export function validateSchema(schema) {
  return (data) => {
    try {
      return { success: true, data: schema.parse(data) };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
      }
      return { success: false, errors: [{ message: 'Validation error' }] };
    }
  };
}
