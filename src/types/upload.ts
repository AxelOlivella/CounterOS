export interface UploadFile {
  id: string;
  filename: string;
  kind: FileKind;
  size_bytes: number;
  processed: boolean;
  error?: string;
  uploaded_at: string;
  tenant_id: string;
  store_id?: string;
}

export type FileKind = 'csv_sales' | 'xml_cfdi' | 'json_cfdi' | 'csv_inventory' | 'csv_expenses';

export interface SalesRecord {
  date: string;
  store_code: string;
  gross_sales: number;
  discounts: number;
  transactions: number;
}

export interface ExpenseRecord {
  date: string;
  store_code: string;
  category: string;
  amount: number;
  note?: string;
}

export interface InventoryRecord {
  date: string;
  store_code: string;
  opening_value: number;
  closing_value: number;
  waste_value: number;
}

export interface CFDIData {
  uuid: string;
  supplier_rfc: string;
  supplier_name: string;
  issue_date: string;
  subtotal: number;
  tax: number;
  total: number;
  items: CFDIItem[];
}

export interface CFDIItem {
  sku: string;
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
  line_total: number;
  category: string;
}

export interface ProcessingResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
}