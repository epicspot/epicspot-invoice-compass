
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
}

export interface Product {
  id: string;
  reference: string;
  description: string;
  price: number;
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
}
