-- Créer les tables pour tous les modules

-- Table des sites
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  code TEXT,
  tax_info TEXT,
  tax_center TEXT,
  site_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des catégories de produits
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des produits
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  min_stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.product_categories(id),
  tax_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des stocks par site
CREATE TABLE public.product_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, site_id)
);

-- Table des fournisseurs
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  tax_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des vendeurs
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des caisses enregistreuses
CREATE TABLE public.cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  initial_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_reconciled TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'closed' CHECK (status IN ('open', 'closed', 'reconciling')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des transactions de caisse
CREATE TABLE public.cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('opening', 'closing', 'sale', 'expense', 'deposit', 'withdrawal')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  reference TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des factures
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  site_id UUID REFERENCES public.sites(id),
  cash_register_id UUID REFERENCES public.cash_registers(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des items de facture
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des devis
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  site_id UUID REFERENCES public.sites(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des items de devis
CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des bons de commande
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
  site_id UUID REFERENCES public.sites(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des items de bon de commande
CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des mouvements de stock
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id),
  site_id UUID REFERENCES public.sites(id),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'transfer')),
  quantity INTEGER NOT NULL,
  reference TEXT,
  notes TEXT,
  from_site_id UUID REFERENCES public.sites(id),
  to_site_id UUID REFERENCES public.sites(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  value NUMERIC(10,2),
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des rappels
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  type TEXT,
  related_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des collectes
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'mobile_money', 'bank_transfer')),
  reference TEXT,
  notes TEXT,
  collected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS sur toutes les tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view categories" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view stock" ON public.product_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view vendors" ON public.vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view cash registers" ON public.cash_registers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view cash transactions" ON public.cash_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view invoice items" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view quotes" ON public.quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view quote items" ON public.quote_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view purchase orders" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view purchase order items" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view reminders" ON public.reminders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view collections" ON public.collections FOR SELECT TO authenticated USING (true);

-- RLS Policies - Écriture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert sites" ON public.sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert categories" ON public.product_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert stock" ON public.product_stock FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert vendors" ON public.vendors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert cash registers" ON public.cash_registers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert cash transactions" ON public.cash_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert invoice items" ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert quotes" ON public.quotes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert quote items" ON public.quote_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert purchase orders" ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert purchase order items" ON public.purchase_order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert stock movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert reminders" ON public.reminders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert collections" ON public.collections FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies - Mise à jour
CREATE POLICY "Authenticated users can update sites" ON public.sites FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update stock" ON public.product_stock FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update vendors" ON public.vendors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update cash registers" ON public.cash_registers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update quotes" ON public.quotes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update purchase orders" ON public.purchase_orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update reminders" ON public.reminders FOR UPDATE TO authenticated USING (true);

-- RLS Policies - Suppression (seulement pour admins)
CREATE POLICY "Admins can delete sites" ON public.sites FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete vendors" ON public.vendors FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete invoices" ON public.invoices FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete quotes" ON public.quotes FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete purchase orders" ON public.purchase_orders FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cash_registers_updated_at BEFORE UPDATE ON public.cash_registers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Créer la table de profils utilisateurs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Fonction pour créer un profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger pour créer un profil à chaque nouveau user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();