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
      alerts: {
        Row: {
          created_at: string
          date: string
          delivered_via: string | null
          id: string
          payload: Json | null
          severity: Database["public"]["Enums"]["alert_severity"]
          store_id: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          created_at?: string
          date?: string
          delivered_via?: string | null
          id?: string
          payload?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          store_id?: string | null
          tenant_id: string
          type: string
        }
        Update: {
          created_at?: string
          date?: string
          delivered_via?: string | null
          id?: string
          payload?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          store_id?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales: {
        Row: {
          avg_ticket: number | null
          created_at: string
          date: string
          discounts: number
          gross_sales: number
          id: string
          net_sales: number | null
          store_id: string
          tenant_id: string
          transactions: number
        }
        Insert: {
          avg_ticket?: number | null
          created_at?: string
          date: string
          discounts?: number
          gross_sales?: number
          id?: string
          net_sales?: number | null
          store_id: string
          tenant_id: string
          transactions?: number
        }
        Update: {
          avg_ticket?: number | null
          created_at?: string
          date?: string
          discounts?: number
          gross_sales?: number
          id?: string
          net_sales?: number | null
          store_id?: string
          tenant_id?: string
          transactions?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          note: string | null
          store_id: string
          tenant_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          date: string
          id?: string
          note?: string | null
          store_id: string
          tenant_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          store_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          error: string | null
          filename: string
          id: string
          kind: string
          processed: boolean | null
          size_bytes: number | null
          store_id: string | null
          tenant_id: string
          uploaded_at: string
        }
        Insert: {
          error?: string | null
          filename: string
          id?: string
          kind: string
          processed?: boolean | null
          size_bytes?: number | null
          store_id?: string | null
          tenant_id: string
          uploaded_at?: string
        }
        Update: {
          error?: string | null
          filename?: string
          id?: string
          kind?: string
          processed?: boolean | null
          size_bytes?: number | null
          store_id?: string | null
          tenant_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_costs: {
        Row: {
          created_at: string
          date: string
          hours: number | null
          id: string
          labor_cost: number
          store_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hours?: number | null
          id?: string
          labor_cost?: number
          store_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hours?: number | null
          id?: string
          labor_cost?: number
          store_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "labor_costs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labor_costs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          category: string
          description: string
          id: string
          line_total: number
          purchase_id: string
          qty: number
          sku: string
          tenant_id: string
          unit: string
          unit_price: number
        }
        Insert: {
          category?: string
          description: string
          id?: string
          line_total?: number
          purchase_id: string
          qty?: number
          sku: string
          tenant_id: string
          unit: string
          unit_price?: number
        }
        Update: {
          category?: string
          description?: string
          id?: string
          line_total?: number
          purchase_id?: string
          qty?: number
          sku?: string
          tenant_id?: string
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          invoice_uuid: string
          issue_date: string
          store_id: string
          subtotal: number
          supplier_name: string
          supplier_rfc: string
          tax: number
          tenant_id: string
          total: number
          xml_metadata: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_uuid: string
          issue_date: string
          store_id: string
          subtotal?: number
          supplier_name: string
          supplier_rfc: string
          tax?: number
          tenant_id: string
          total?: number
          xml_metadata?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_uuid?: string
          issue_date?: string
          store_id?: string
          subtotal?: number
          supplier_name?: string
          supplier_rfc?: string
          tax?: number
          tenant_id?: string
          total?: number
          xml_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_daily: {
        Row: {
          closing_value: number
          created_at: string
          date: string
          id: string
          opening_value: number
          store_id: string
          tenant_id: string
          waste_value: number
        }
        Insert: {
          closing_value?: number
          created_at?: string
          date: string
          id?: string
          opening_value?: number
          store_id: string
          tenant_id: string
          waste_value?: number
        }
        Update: {
          closing_value?: number
          created_at?: string
          date?: string
          id?: string
          opening_value?: number
          store_id?: string
          tenant_id?: string
          waste_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_daily_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_daily_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          open_date: string | null
          tenant_id: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          open_date?: string | null
          tenant_id: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          open_date?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          rfc: string | null
          subdomain: string
          theme: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          rfc?: string | null
          subdomain: string
          theme?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          rfc?: string | null
          subdomain?: string
          theme?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          store_scope: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["app_role"]
          store_scope?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          store_scope?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      alert_severity: "info" | "warn" | "crit"
      app_role: "owner" | "manager" | "analyst" | "staff"
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
      alert_severity: ["info", "warn", "crit"],
      app_role: ["owner", "manager", "analyst", "staff"],
    },
  },
} as const
