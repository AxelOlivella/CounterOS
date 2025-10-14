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
      cfdi_ingredient_mapping: {
        Row: {
          cfdi_description: string | null
          cfdi_sku: string
          confidence_score: number | null
          created_at: string | null
          ingredient_id: string
          mapping_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cfdi_description?: string | null
          cfdi_sku: string
          confidence_score?: number | null
          created_at?: string | null
          ingredient_id: string
          mapping_id?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cfdi_description?: string | null
          cfdi_sku?: string
          confidence_score?: number | null
          created_at?: string | null
          ingredient_id?: string
          mapping_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cfdi_ingredient_mapping_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["ingredient_id"]
          },
          {
            foreignKeyName: "cfdi_ingredient_mapping_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      compras: {
        Row: {
          categoria: string
          compra_id: string
          concepto: string
          created_at: string | null
          fecha: string
          folio: string | null
          moneda: string | null
          monto: number
          proveedor: string
          rfc_proveedor: string | null
          store_id: string
          tenant_id: string
          uuid_fiscal: string
        }
        Insert: {
          categoria: string
          compra_id?: string
          concepto: string
          created_at?: string | null
          fecha: string
          folio?: string | null
          moneda?: string | null
          monto?: number
          proveedor: string
          rfc_proveedor?: string | null
          store_id: string
          tenant_id: string
          uuid_fiscal: string
        }
        Update: {
          categoria?: string
          compra_id?: string
          concepto?: string
          created_at?: string | null
          fecha?: string
          folio?: string | null
          moneda?: string | null
          monto?: number
          proveedor?: string
          rfc_proveedor?: string | null
          store_id?: string
          tenant_id?: string
          uuid_fiscal?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          created_at: string | null
          energy: number | null
          expense_id: string
          marketing_pct: number | null
          other: number | null
          payroll: number | null
          period: string
          rent: number | null
          royalty_pct: number | null
          store_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          energy?: number | null
          expense_id?: string
          marketing_pct?: number | null
          other?: number | null
          payroll?: number | null
          period: string
          rent?: number | null
          royalty_pct?: number | null
          store_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          energy?: number | null
          expense_id?: string
          marketing_pct?: number | null
          other?: number | null
          payroll?: number | null
          period?: string
          rent?: number | null
          royalty_pct?: number | null
          store_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "expenses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      finance_portal_centro_history: {
        Row: {
          amount_mxn: number
          inserted_at: string | null
          metric_code: string
          metric_name: string
          month: number
          pct_of_sales: number | null
          period_month: string
          site_id: string
          site_name: string
          source_doc: string
          tenant_id: string | null
          year: number
        }
        Insert: {
          amount_mxn: number
          inserted_at?: string | null
          metric_code: string
          metric_name: string
          month: number
          pct_of_sales?: number | null
          period_month: string
          site_id: string
          site_name: string
          source_doc: string
          tenant_id?: string | null
          year: number
        }
        Update: {
          amount_mxn?: number
          inserted_at?: string | null
          metric_code?: string
          metric_name?: string
          month?: number
          pct_of_sales?: number | null
          period_month?: string
          site_id?: string
          site_name?: string
          source_doc?: string
          tenant_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_finance_history_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      finance_portal_centro_opx_detail: {
        Row: {
          amount_mxn: number
          inserted_at: string | null
          month: number
          opx_code: string
          opx_name: string
          pct_of_sales: number | null
          period_month: string
          site_id: string
          site_name: string
          source_doc: string
          tenant_id: string | null
          year: number
        }
        Insert: {
          amount_mxn: number
          inserted_at?: string | null
          month: number
          opx_code: string
          opx_name: string
          pct_of_sales?: number | null
          period_month: string
          site_id: string
          site_name: string
          source_doc: string
          tenant_id?: string | null
          year: number
        }
        Update: {
          amount_mxn?: number
          inserted_at?: string | null
          month?: number
          opx_code?: string
          opx_name?: string
          pct_of_sales?: number | null
          period_month?: string
          site_id?: string
          site_name?: string
          source_doc?: string
          tenant_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_finance_opx_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      food_cost_daily: {
        Row: {
          created_at: string | null
          fecha: string
          food_cost_pct: number | null
          id: string
          store_id: string
          tenant_id: string
          total_compras: number
          total_ventas: number
        }
        Insert: {
          created_at?: string | null
          fecha: string
          food_cost_pct?: number | null
          id?: string
          store_id: string
          tenant_id: string
          total_compras?: number
          total_ventas?: number
        }
        Update: {
          created_at?: string | null
          fecha?: string
          food_cost_pct?: number | null
          id?: string
          store_id?: string
          tenant_id?: string
          total_compras?: number
          total_ventas?: number
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          code: string
          cost_per_unit: number
          created_at: string | null
          ingredient_id: string
          name: string
          tenant_id: string
          unit: string
        }
        Insert: {
          code: string
          cost_per_unit?: number
          created_at?: string | null
          ingredient_id?: string
          name: string
          tenant_id: string
          unit: string
        }
        Update: {
          code?: string
          cost_per_unit?: number
          created_at?: string | null
          ingredient_id?: string
          name?: string
          tenant_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      inventory_counts: {
        Row: {
          count_date: string
          count_id: string
          counted_by: string | null
          created_at: string
          ingredient_id: string
          notes: string | null
          physical_qty: number
          store_id: string
          tenant_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          count_date: string
          count_id?: string
          counted_by?: string | null
          created_at?: string
          ingredient_id: string
          notes?: string | null
          physical_qty: number
          store_id: string
          tenant_id: string
          unit: string
          updated_at?: string
        }
        Update: {
          count_date?: string
          count_id?: string
          counted_by?: string | null
          created_at?: string
          ingredient_id?: string
          notes?: string | null
          physical_qty?: number
          store_id?: string
          tenant_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          created_at: string | null
          name: string
          product_id: string
          sku: string
          tenant_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          name: string
          product_id?: string
          sku: string
          tenant_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          name?: string
          product_id?: string
          sku?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          amount: number
          cfdi_description: string | null
          cfdi_sku: string
          created_at: string | null
          ingredient_id: string | null
          item_id: string
          purchase_id: string
          qty: number
          tenant_id: string
          unit: string | null
          unit_price: number
        }
        Insert: {
          amount: number
          cfdi_description?: string | null
          cfdi_sku: string
          created_at?: string | null
          ingredient_id?: string | null
          item_id?: string
          purchase_id: string
          qty: number
          tenant_id: string
          unit?: string | null
          unit_price: number
        }
        Update: {
          amount?: number
          cfdi_description?: string | null
          cfdi_sku?: string
          created_at?: string | null
          ingredient_id?: string | null
          item_id?: string
          purchase_id?: string
          qty?: number
          tenant_id?: string
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["ingredient_id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "purchase_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      purchases: {
        Row: {
          cfdi_uuid: string
          created_at: string | null
          issue_date: string
          purchase_id: string
          store_id: string | null
          supplier_name: string | null
          tenant_id: string
          total_amount: number
        }
        Insert: {
          cfdi_uuid: string
          created_at?: string | null
          issue_date: string
          purchase_id?: string
          store_id?: string | null
          supplier_name?: string | null
          tenant_id: string
          total_amount?: number
        }
        Update: {
          cfdi_uuid?: string
          created_at?: string | null
          issue_date?: string
          purchase_id?: string
          store_id?: string | null
          supplier_name?: string | null
          tenant_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "purchases_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "purchases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      recipe_components: {
        Row: {
          ingredient_id: string
          product_id: string
          qty: number
          recipe_component_id: string
          tenant_id: string
        }
        Insert: {
          ingredient_id: string
          product_id: string
          qty: number
          recipe_component_id?: string
          tenant_id: string
        }
        Update: {
          ingredient_id?: string
          product_id?: string
          qty?: number
          recipe_component_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_components_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["ingredient_id"]
          },
          {
            foreignKeyName: "recipe_components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipe_components_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_sales_daily"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipe_components_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          qty: number
          sale_id: string
          sku: string
          sold_at: string
          store_id: string
          tenant_id: string
          ticket_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          qty: number
          sale_id?: string
          sku: string
          sold_at: string
          store_id: string
          tenant_id: string
          ticket_id: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          qty?: number
          sale_id?: string
          sku?: string
          sold_at?: string
          store_id?: string
          tenant_id?: string
          ticket_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      store_categories: {
        Row: {
          actual_pct: number
          category_id: string
          category_name: string
          created_at: string | null
          period: string
          store_id: string
          target_pct: number
          tenant_id: string
        }
        Insert: {
          actual_pct: number
          category_id?: string
          category_name: string
          created_at?: string | null
          period: string
          store_id: string
          target_pct: number
          tenant_id: string
        }
        Update: {
          actual_pct?: number
          category_id?: string
          category_name?: string
          created_at?: string | null
          period?: string
          store_id?: string
          target_pct?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "store_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "store_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      stores: {
        Row: {
          active: boolean | null
          city: string | null
          code: string
          concept: string | null
          created_at: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          manager_name: string | null
          manager_tenure_months: number | null
          name: string
          slug: string | null
          store_id: string
          target_food_cost_pct: number | null
          tenant_id: string
        }
        Insert: {
          active?: boolean | null
          city?: string | null
          code: string
          concept?: string | null
          created_at?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          manager_name?: string | null
          manager_tenure_months?: number | null
          name: string
          slug?: string | null
          store_id?: string
          target_food_cost_pct?: number | null
          tenant_id: string
        }
        Update: {
          active?: boolean | null
          city?: string | null
          code?: string
          concept?: string | null
          created_at?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          manager_name?: string | null
          manager_tenure_months?: number | null
          name?: string
          slug?: string | null
          store_id?: string
          target_food_cost_pct?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          name: string
          tenant_id: string
          theme: Json | null
        }
        Insert: {
          created_at?: string | null
          name: string
          tenant_id?: string
          theme?: Json | null
        }
        Update: {
          created_at?: string | null
          name?: string
          tenant_id?: string
          theme?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string
          id: string
          name: string | null
          role: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email: string
          id?: string
          name?: string | null
          role?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ventas: {
        Row: {
          created_at: string | null
          fecha: string
          monto_total: number
          num_transacciones: number | null
          store_id: string
          tenant_id: string
          venta_id: string
        }
        Insert: {
          created_at?: string | null
          fecha: string
          monto_total?: number
          num_transacciones?: number | null
          store_id: string
          tenant_id: string
          venta_id?: string
        }
        Update: {
          created_at?: string | null
          fecha?: string
          monto_total?: number
          num_transacciones?: number | null
          store_id?: string
          tenant_id?: string
          venta_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_food_cost_view: {
        Row: {
          cogs: number | null
          day: string | null
          food_cost_pct: number | null
          revenue: number | null
          store_id: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      pnl_monthly_view: {
        Row: {
          cogs: number | null
          ebitda: number | null
          energy: number | null
          marketing: number | null
          other: number | null
          payroll: number | null
          period: string | null
          rent: number | null
          revenue: number | null
          royalties: number | null
          store_id: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      store_performance_view: {
        Row: {
          city: string | null
          code: string | null
          current_food_cost_pct: number | null
          food_cost_variance: number | null
          latitude: number | null
          longitude: number | null
          manager_name: string | null
          manager_tenure_months: number | null
          name: string | null
          revenue_30d: number | null
          status: string | null
          store_id: string | null
          target_food_cost_pct: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      v_real_variance_analysis: {
        Row: {
          actual_qty: number | null
          cost_impact_mxn: number | null
          cost_per_unit: number | null
          counted_by: string | null
          day: string | null
          ingredient_code: string | null
          ingredient_id: string | null
          ingredient_name: string | null
          notes: string | null
          store_id: string | null
          tenant_id: string | null
          theoretical_qty: number | null
          unit: string | null
          variance_pct: number | null
          variance_qty: number | null
        }
        Relationships: []
      }
      v_sales_daily: {
        Row: {
          day: string | null
          product_id: string | null
          qty_sold: number | null
          revenue: number | null
          sku: string | null
          store_id: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      v_theoretical_consumption_daily: {
        Row: {
          day: string | null
          ingredient_id: string | null
          qty_needed: number | null
          store_id: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_components_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["ingredient_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      v_variance_analysis: {
        Row: {
          actual_qty: number | null
          cost_impact_mxn: number | null
          cost_per_unit: number | null
          day: string | null
          ingredient_code: string | null
          ingredient_id: string | null
          ingredient_name: string | null
          store_id: string | null
          tenant_id: string | null
          theoretical_qty: number | null
          unit: string | null
          variance_pct: number | null
          variance_qty: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_components_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["ingredient_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      vw_portal_centro_pyg_mensual: {
        Row: {
          cogs: number | null
          ebitda_operativo: number | null
          opex_total: number | null
          period_month: string | null
          site_name: string | null
          utilidad_bruta: number | null
          ventas: number | null
        }
        Relationships: []
      }
      waste_analysis: {
        Row: {
          consumo_con_merma_5pct: number | null
          consumo_esperado: number | null
          costo_teorico: number | null
          ingrediente: string | null
          merma_estimada_dinero: number | null
        }
        Relationships: []
      }
      weekly_food_cost_view: {
        Row: {
          avg_food_cost_pct: number | null
          store_id: string | null
          tenant_id: string | null
          total_cogs: number | null
          total_revenue: number | null
          week_number: number | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_view"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
    }
    Functions: {
      get_daily_food_cost_data: {
        Args: { user_tenant_id?: string }
        Returns: {
          cogs: number
          day: string
          food_cost_pct: number
          revenue: number
          store_id: string
          tenant_id: string
        }[]
      }
      get_daily_sales_data: {
        Args: { user_tenant_id?: string }
        Returns: {
          day: string
          product_id: string
          qty_sold: number
          revenue: number
          sku: string
          store_id: string
          tenant_id: string
        }[]
      }
      get_pnl_monthly_data: {
        Args: { user_tenant_id?: string }
        Returns: {
          cogs: number
          ebitda: number
          energy: number
          marketing: number
          other: number
          payroll: number
          period: string
          rent: number
          revenue: number
          royalties: number
          store_id: string
          tenant_id: string
        }[]
      }
      get_real_variance_data: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_start_date?: string
          p_store_id?: string
        }
        Returns: {
          actual_qty: number
          cost_impact_mxn: number
          cost_per_unit: number
          counted_by: string
          day: string
          ingredient_code: string
          ingredient_id: string
          ingredient_name: string
          notes: string
          store_id: string
          theoretical_qty: number
          unit: string
          variance_pct: number
          variance_qty: number
        }[]
      }
      get_store_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          city: string
          code: string
          current_food_cost_pct: number
          food_cost_variance: number
          latitude: number
          longitude: number
          manager_name: string
          manager_tenure_months: number
          name: string
          revenue_30d: number
          status: string
          store_id: string
          target_food_cost_pct: number
          tenant_id: string
        }[]
      }
      get_stores_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          city: string
          code: string
          created_at: string
          name: string
          store_id: string
          tenant_id: string
        }[]
      }
      get_top_variance_ingredients: {
        Args: { p_days?: number; p_limit?: number; p_store_id?: string }
        Returns: {
          avg_variance_pct: number
          days_with_variance: number
          ingredient_id: string
          ingredient_name: string
          total_cost_impact: number
        }[]
      }
      get_variance_data: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_start_date?: string
          p_store_id?: string
        }
        Returns: {
          actual_qty: number
          cost_impact_mxn: number
          cost_per_unit: number
          day: string
          ingredient_code: string
          ingredient_id: string
          ingredient_name: string
          store_id: string
          theoretical_qty: number
          unit: string
          variance_pct: number
          variance_qty: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recalculate_food_cost_daily: {
        Args: {
          p_fecha_fin: string
          p_fecha_inicio: string
          p_store_id: string
          p_tenant_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "operator"
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
      app_role: ["admin", "supervisor", "operator"],
    },
  },
} as const
