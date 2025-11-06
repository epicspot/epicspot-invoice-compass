export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string | null
          description: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cash_registers: {
        Row: {
          created_at: string | null
          current_amount: number
          id: string
          initial_amount: number
          last_reconciled: string | null
          name: string
          site_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number
          id?: string
          initial_amount?: number
          last_reconciled?: string | null
          name: string
          site_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number
          id?: string
          initial_amount?: number
          last_reconciled?: string | null
          name?: string
          site_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_transactions: {
        Row: {
          amount: number
          cash_register_id: string | null
          created_at: string | null
          description: string | null
          id: string
          reference: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          cash_register_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cash_register_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_transactions_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          code: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string
          site_id: string | null
          tax_center: string | null
          tax_info: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          site_id?: string | null
          tax_center?: string | null
          tax_info?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          site_id?: string | null
          tax_center?: string | null
          tax_info?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          amount: number
          collected_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string
          reference: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          collected_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          reference?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          collected_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          reference?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signatures: {
        Row: {
          document_id: string
          document_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          signature_data: string
          signed_at: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          document_id: string
          document_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          signature_data: string
          signed_at?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          document_id?: string
          document_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          signature_data?: string
          signed_at?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string | null
          product_id: string | null
          quantity: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          quantity: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cash_register_id: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          date: string
          discount: number | null
          id: string
          notes: string | null
          number: string
          site_id: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
        }
        Insert: {
          cash_register_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          discount?: number | null
          id?: string
          notes?: string | null
          number: string
          site_id?: string | null
          status?: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string | null
        }
        Update: {
          cash_register_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          discount?: number | null
          id?: string
          notes?: string | null
          number?: string
          site_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          source: string | null
          status: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          source?: string | null
          status?: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          source?: string | null
          status?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_stock: {
        Row: {
          id: string
          product_id: string | null
          quantity: number
          site_id: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          quantity?: number
          site_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          quantity?: number
          site_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stock_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string
          id: string
          min_stock: number | null
          price: number
          reference: string
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          min_stock?: number | null
          price: number
          reference: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          min_stock?: number | null
          price?: number
          reference?: string
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          product_id: string | null
          purchase_order_id: string | null
          quantity: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          notes: string | null
          number: string
          site_id: string | null
          status: string
          subtotal: number
          supplier_id: string | null
          tax: number
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          notes?: string | null
          number: string
          site_id?: string | null
          status?: string
          subtotal: number
          supplier_id?: string | null
          tax?: number
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          number?: string
          site_id?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string | null
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          quote_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          quote_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          date: string
          discount: number | null
          id: string
          notes: string | null
          number: string
          site_id: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
          valid_until: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          discount?: number | null
          id?: string
          notes?: string | null
          number: string
          site_id?: string | null
          status?: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string | null
          valid_until: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          discount?: number | null
          id?: string
          notes?: string | null
          number?: string
          site_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          priority: string
          related_id: string | null
          status: string
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          related_id?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          related_id?: string | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sites: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          from_site_id: string | null
          id: string
          notes: string | null
          product_id: string | null
          quantity: number
          reference: string | null
          site_id: string | null
          to_site_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          from_site_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity: number
          reference?: string | null
          site_id?: string | null
          to_site_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          from_site_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reference?: string | null
          site_id?: string | null
          to_site_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_from_site_id_fkey"
            columns: ["from_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_to_site_id_fkey"
            columns: ["to_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          tax_info: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tax_info?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tax_info?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_data: Json
          backup_type: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
        }
        Insert: {
          backup_data: Json
          backup_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
        }
        Update: {
          backup_data?: Json
          backup_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          current_page: string | null
          last_seen: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_page?: string | null
          last_seen?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_page?: string | null
          last_seen?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          active: boolean | null
          address: string | null
          code: string | null
          commission_rate: number | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          paid_amount: number | null
          phone: string
          remaining_balance: number | null
          site_id: string | null
          total_debt: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          code?: string | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          paid_amount?: number | null
          phone: string
          remaining_balance?: number | null
          site_id?: string | null
          total_debt?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          code?: string | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          paid_amount?: number | null
          phone?: string
          remaining_balance?: number | null
          site_id?: string | null
          total_debt?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_action: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_action"]
          p_description?: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user" | "viewer"
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "LOGIN"
        | "LOGOUT"
        | "EXPORT"
        | "PRINT"
        | "SIGN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "user", "viewer"],
      audit_action: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
        "PRINT",
        "SIGN",
      ],
    },
  },
} as const
