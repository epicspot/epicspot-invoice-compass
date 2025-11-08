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
          client_id: string | null
          collected_by: string | null
          created_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method: string
          reference: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          collected_by?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method: string
          reference?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          collected_by?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      company_info: {
        Row: {
          address: string
          bank_account: string | null
          bank_iban: string | null
          bank_name: string | null
          bank_swift: string | null
          created_at: string | null
          email: string | null
          id: string
          logo: string | null
          name: string
          phone: string | null
          signatory: string | null
          signatory_title: string | null
          slogan: string | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          bank_account?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name: string
          phone?: string | null
          signatory?: string | null
          signatory_title?: string | null
          slogan?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          bank_account?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo?: string | null
          name?: string
          phone?: string | null
          signatory?: string | null
          signatory_title?: string | null
          slogan?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
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
      document_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          layout: Json
          logo_url: string | null
          name: string
          sections: Json
          styles: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          layout?: Json
          logo_url?: string | null
          name: string
          sections?: Json
          styles?: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          layout?: Json
          logo_url?: string | null
          name?: string
          sections?: Json
          styles?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_reminders_history: {
        Row: {
          amount: number | null
          client_email: string
          client_name: string | null
          created_at: string | null
          error_message: string | null
          id: string
          invoice_id: string | null
          invoice_number: string | null
          reminder_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          client_email: string
          client_name?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          reminder_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          client_email?: string
          client_name?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          reminder_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_reminders_history_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string | null
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          type?: string
          updated_at?: string | null
          variables?: Json | null
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
          paid_amount: number | null
          payment_status: string | null
          remaining_balance: number | null
          site_id: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
          vendor_id: string | null
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
          paid_amount?: number | null
          payment_status?: string | null
          remaining_balance?: number | null
          site_id?: string | null
          status?: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string | null
          vendor_id?: string | null
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
          paid_amount?: number | null
          payment_status?: string | null
          remaining_balance?: number | null
          site_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
          vendor_id?: string | null
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
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      market_documents: {
        Row: {
          document_type: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          market_id: string | null
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_type: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          market_id?: string | null
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          market_id?: string | null
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_documents_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_milestones: {
        Row: {
          amount: number
          completion_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_id: string | null
          market_id: string | null
          percentage: number | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          market_id?: string | null
          percentage?: number | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          market_id?: string | null
          percentage?: number | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_milestones_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_milestones_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          actual_amount: number
          client_id: string | null
          created_at: string | null
          created_by: string | null
          delivery_terms: string | null
          deposit_amount: number | null
          deposit_percentage: number | null
          description: string | null
          documents: Json | null
          end_date: string | null
          estimated_amount: number
          id: string
          payment_terms: string | null
          reference: string
          responsible_user_id: string | null
          site_id: string | null
          specifications: Json | null
          start_date: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          actual_amount?: number
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_terms?: string | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          estimated_amount?: number
          id?: string
          payment_terms?: string | null
          reference: string
          responsible_user_id?: string | null
          site_id?: string | null
          specifications?: Json | null
          start_date?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          actual_amount?: number
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_terms?: string | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          estimated_amount?: number
          id?: string
          payment_terms?: string | null
          reference?: string
          responsible_user_id?: string | null
          site_id?: string | null
          specifications?: Json | null
          start_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "markets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          tax_rate: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          tax_rate?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          tax_rate?: number
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
          attempts: number | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          last_sent_at: string | null
          notification_type: string | null
          priority: string
          recipient_email: string | null
          related_id: string | null
          status: string
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          last_sent_at?: string | null
          notification_type?: string | null
          priority?: string
          recipient_email?: string | null
          related_id?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          last_sent_at?: string | null
          notification_type?: string | null
          priority?: string
          recipient_email?: string | null
          related_id?: string | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at: string | null
          id: string
          resource: Database["public"]["Enums"]["permission_resource"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at?: string | null
          id?: string
          resource: Database["public"]["Enums"]["permission_resource"]
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          created_at?: string | null
          id?: string
          resource?: Database["public"]["Enums"]["permission_resource"]
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      sites: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_iban: string | null
          bank_name: string | null
          bank_swift: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          tax_id: string | null
          updated_at: string | null
          use_headquarters_info: boolean | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
          use_headquarters_info?: boolean | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_swift?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
          use_headquarters_info?: boolean | null
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
      subscriptions: {
        Row: {
          billing_day: number
          client_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          last_billing_date: string | null
          monthly_amount: number
          next_billing_date: string | null
          notes: string | null
          service_name: string
          service_type: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          billing_day?: number
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          last_billing_date?: string | null
          monthly_amount: number
          next_billing_date?: string | null
          notes?: string | null
          service_name: string
          service_type: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          billing_day?: number
          client_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          last_billing_date?: string | null
          monthly_amount?: number
          next_billing_date?: string | null
          notes?: string | null
          service_name?: string
          service_type?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      tax_declarations: {
        Row: {
          created_at: string | null
          created_by: string | null
          details: Json | null
          id: string
          period_end: string
          period_start: string
          status: string
          submitted_at: string | null
          total_purchases: number
          total_sales: number
          updated_at: string | null
          vat_collected: number
          vat_due: number
          vat_paid: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          id?: string
          period_end: string
          period_start: string
          status?: string
          submitted_at?: string | null
          total_purchases?: number
          total_sales?: number
          updated_at?: string | null
          vat_collected?: number
          vat_due?: number
          vat_paid?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          id?: string
          period_end?: string
          period_start?: string
          status?: string
          submitted_at?: string | null
          total_purchases?: number
          total_sales?: number
          updated_at?: string | null
          vat_collected?: number
          vat_due?: number
          vat_paid?: number
        }
        Relationships: []
      }
      template_versions: {
        Row: {
          change_summary: string | null
          created_at: string | null
          created_by: string | null
          id: string
          layout: Json
          logo_url: string | null
          name: string
          sections: Json
          styles: Json
          tags: string[] | null
          template_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          layout: Json
          logo_url?: string | null
          name: string
          sections: Json
          styles: Json
          tags?: string[] | null
          template_id: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          layout?: Json
          logo_url?: string | null
          name?: string
          sections?: Json
          styles?: Json
          tags?: string[] | null
          template_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_next_billing_date: {
        Args: { p_billing_day: number; p_current_date: string }
        Returns: string
      }
      get_site_complete_info: { Args: { p_site_id: string }; Returns: Json }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          action: Database["public"]["Enums"]["permission_action"]
          resource: Database["public"]["Enums"]["permission_resource"]
        }[]
      }
      has_permission: {
        Args: {
          _action: Database["public"]["Enums"]["permission_action"]
          _resource: Database["public"]["Enums"]["permission_resource"]
          _user_id: string
        }
        Returns: boolean
      }
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
      permission_action:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "export"
        | "import"
        | "approve"
        | "manage"
      permission_resource:
        | "invoices"
        | "quotes"
        | "clients"
        | "vendors"
        | "products"
        | "inventory"
        | "purchase_orders"
        | "suppliers"
        | "users"
        | "settings"
        | "cash_registers"
        | "cash_transactions"
        | "collections"
        | "sites"
        | "reports"
        | "analytics"
        | "markets"
        | "subscriptions"
        | "tax_declarations"
        | "audit_logs"
        | "backups"
        | "templates"
        | "reminders"
        | "leads"
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
      permission_action: [
        "create",
        "read",
        "update",
        "delete",
        "export",
        "import",
        "approve",
        "manage",
      ],
      permission_resource: [
        "invoices",
        "quotes",
        "clients",
        "vendors",
        "products",
        "inventory",
        "purchase_orders",
        "suppliers",
        "users",
        "settings",
        "cash_registers",
        "cash_transactions",
        "collections",
        "sites",
        "reports",
        "analytics",
        "markets",
        "subscriptions",
        "tax_declarations",
        "audit_logs",
        "backups",
        "templates",
        "reminders",
        "leads",
      ],
    },
  },
} as const
