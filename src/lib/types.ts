
// Define types for the application

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  code?: string;
  taxInfo?: string;
  taxCenter?: string;
  siteId?: string; // Reference to which site this client belongs to
}

export interface Product {
  id: string;
  reference: string;
  description: string;
  price: number;
  stock?: Record<string, number>; // Stock by siteId
  minStock?: number; // Seuil d'alerte stock
  category?: string;
  taxRate?: number; // Taux de taxe en %
}

export interface InvoiceItem {
  id: string;
  product: Product;
  quantity: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  siteId: string; // Which site issued this invoice
  cashRegisterId?: string; // If paid at cash register
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  siteId: string; // Which site issued this quote
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  bankAccount?: string;
  bankName?: string;
  bankIBAN?: string;
  bankSwift?: string;
  signatory?: string;
  signatoryTitle?: string;
  slogan?: string;
}

export type Role = 'admin' | 'manager' | 'accountant' | 'cashier' | 'viewer';

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePermissions {
  invoices: Permission;
  quotes: Permission;
  clients: Permission;
  products: Permission;
  users: Permission;
  settings: Permission;
  cashRegister: Permission;
  sites: Permission;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  siteIds?: string[]; // Sites this user has access to
}

// New types for cash register and site management
export interface CashRegister {
  id: string;
  name: string;
  siteId: string;
  initialAmount: number;
  currentAmount: number;
  lastReconciled?: string;
  status: 'open' | 'closed' | 'reconciling';
}

export interface CashTransaction {
  id: string;
  cashRegisterId: string;
  amount: number; // Positive for inflow, negative for outflow
  type: 'sale' | 'refund' | 'adjustment' | 'withdrawal' | 'deposit' | 'bank_deposit';
  reference?: string; // Invoice number or other reference
  date: string;
  notes?: string;
  userId: string; // Who processed this transaction
}

export interface Site {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isMainSite: boolean;
  cashRegisters?: CashRegister[];
}

// Gestion des leads/prospectus
export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone: string;
  address?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  source?: string; // Origine du lead (web, téléphone, etc.)
  notes?: string;
  createdAt: string;
  lastContactDate?: string;
  assignedTo?: string; // User ID
  estimatedValue?: number;
}

// Mouvements de stock
export interface StockMovement {
  id: string;
  productId: string;
  siteId: string;
  quantity: number; // Positif pour entrée, négatif pour sortie
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  reference?: string; // Référence facture/commande
  date: string;
  notes?: string;
  userId: string;
}

// Relances
export interface Reminder {
  id: string;
  type: 'invoice' | 'quote';
  documentId: string;
  documentNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate?: string;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  attempts: number;
  lastReminderDate?: string;
  nextReminderDate?: string;
  notes?: string;
}

// Configuration fiscale
export interface TaxConfig {
  id: string;
  name: string;
  rate: number; // Taux en %
  isDefault: boolean;
  country?: string;
}

// Fournisseurs
export interface Supplier {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  taxInfo?: string;
  bankAccount?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

// Commandes fournisseurs
export interface PurchaseOrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  date: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  expectedDeliveryDate?: string;
  receivedDate?: string;
  notes?: string;
  siteId: string;
}

