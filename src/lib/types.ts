
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
  signatory?: string;
  signatoryTitle?: string;
}

export type Role = 'admin' | 'manager' | 'accountant' | 'viewer';

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
  type: 'sale' | 'refund' | 'adjustment' | 'withdrawal' | 'deposit';
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

