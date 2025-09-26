import { SalesRecord, ExpenseRecord, InventoryRecord, CFDIData, ProcessingResult } from '@/types/upload';

export const parseCSVSales = (csvContent: string): { records: SalesRecord[], errors: string[] } => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  const records: SalesRecord[] = [];
  const errors: string[] = [];
  
  // Validate headers
  const requiredHeaders = ['date', 'store_code', 'gross_sales', 'discounts', 'transactions'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    return { records, errors };
  }
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      errors.push(`Line ${i + 1}: Column count mismatch`);
      continue;
    }
    
    try {
      const record: SalesRecord = {
        date: values[headers.indexOf('date')],
        store_code: values[headers.indexOf('store_code')],
        gross_sales: parseFloat(values[headers.indexOf('gross_sales')]) || 0,
        discounts: parseFloat(values[headers.indexOf('discounts')]) || 0,
        transactions: parseInt(values[headers.indexOf('transactions')]) || 0,
      };
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        errors.push(`Line ${i + 1}: Invalid date format. Use YYYY-MM-DD`);
        continue;
      }
      
      // Validate positive numbers
      if (record.gross_sales < 0 || record.discounts < 0 || record.transactions < 0) {
        errors.push(`Line ${i + 1}: Values cannot be negative`);
        continue;
      }
      
      records.push(record);
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }
  
  return { records, errors };
};

export const parseCSVExpenses = (csvContent: string): { records: ExpenseRecord[], errors: string[] } => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  const records: ExpenseRecord[] = [];
  const errors: string[] = [];
  
  const requiredHeaders = ['date', 'store_code', 'category', 'amount'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    return { records, errors };
  }
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    try {
      const record: ExpenseRecord = {
        date: values[headers.indexOf('date')],
        store_code: values[headers.indexOf('store_code')],
        category: values[headers.indexOf('category')],
        amount: parseFloat(values[headers.indexOf('amount')]) || 0,
        note: headers.includes('note') ? values[headers.indexOf('note')] : undefined,
      };
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        errors.push(`Line ${i + 1}: Invalid date format. Use YYYY-MM-DD`);
        continue;
      }
      
      if (record.amount < 0) {
        errors.push(`Line ${i + 1}: Amount cannot be negative`);
        continue;
      }
      
      records.push(record);
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }
  
  return { records, errors };
};

export const parseCSVInventory = (csvContent: string): { records: InventoryRecord[], errors: string[] } => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  const records: InventoryRecord[] = [];
  const errors: string[] = [];
  
  const requiredHeaders = ['date', 'store_code', 'opening_value', 'closing_value', 'waste_value'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    return { records, errors };
  }
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    try {
      const record: InventoryRecord = {
        date: values[headers.indexOf('date')],
        store_code: values[headers.indexOf('store_code')],
        opening_value: parseFloat(values[headers.indexOf('opening_value')]) || 0,
        closing_value: parseFloat(values[headers.indexOf('closing_value')]) || 0,
        waste_value: parseFloat(values[headers.indexOf('waste_value')]) || 0,
      };
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        errors.push(`Line ${i + 1}: Invalid date format. Use YYYY-MM-DD`);
        continue;
      }
      
      records.push(record);
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }
  
  return { records, errors };
};

export const parseXMLCFDI = (xmlContent: string): { data: CFDIData | null, errors: string[] } => {
  const errors: string[] = [];
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for parse errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      errors.push('Invalid XML format');
      return { data: null, errors };
    }
    
    // Extract basic CFDI data (simplified for MVP)
    const comprobante = xmlDoc.querySelector('cfdi\\:Comprobante, Comprobante');
    if (!comprobante) {
      errors.push('No CFDI Comprobante element found');
      return { data: null, errors };
    }
    
    const emisor = xmlDoc.querySelector('cfdi\\:Emisor, Emisor');
    const conceptos = xmlDoc.querySelectorAll('cfdi\\:Concepto, Concepto');
    
    if (!emisor) {
      errors.push('No Emisor (issuer) information found');
      return { data: null, errors };
    }
    
    const data: CFDIData = {
      uuid: comprobante.getAttribute('UUID') || `TEMP-${Date.now()}`,
      supplier_rfc: emisor.getAttribute('Rfc') || emisor.getAttribute('rfc') || '',
      supplier_name: emisor.getAttribute('Nombre') || emisor.getAttribute('nombre') || '',
      issue_date: comprobante.getAttribute('Fecha') || comprobante.getAttribute('fecha') || '',
      subtotal: parseFloat(comprobante.getAttribute('SubTotal') || comprobante.getAttribute('subTotal') || '0'),
      tax: parseFloat(comprobante.getAttribute('TotalImpuestos') || '0'),
      total: parseFloat(comprobante.getAttribute('Total') || comprobante.getAttribute('total') || '0'),
      items: []
    };
    
    // Extract line items
    conceptos.forEach((concepto, index) => {
      const item = {
        sku: concepto.getAttribute('ClaveProdServ') || `ITEM-${index + 1}`,
        description: concepto.getAttribute('Descripcion') || concepto.getAttribute('descripcion') || '',
        qty: parseFloat(concepto.getAttribute('Cantidad') || concepto.getAttribute('cantidad') || '0'),
        unit: concepto.getAttribute('ClaveUnidad') || concepto.getAttribute('unidad') || 'PZA',
        unit_price: parseFloat(concepto.getAttribute('ValorUnitario') || concepto.getAttribute('valorUnitario') || '0'),
        line_total: parseFloat(concepto.getAttribute('Importe') || concepto.getAttribute('importe') || '0'),
        category: 'ingrediente' // Default category
      };
      
      data.items.push(item);
    });
    
    return { data, errors };
  } catch (error) {
    errors.push(`XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { data: null, errors };
  }
};

export const getFileKindFromName = (filename: string): string => {
  const name = filename.toLowerCase();
  
  if (name.includes('sales') || name.includes('ventas')) return 'csv_sales';
  if (name.includes('expenses') || name.includes('gastos')) return 'csv_expenses';
  if (name.includes('inventory') || name.includes('inventario')) return 'csv_inventory';
  if (name.endsWith('.xml')) return 'xml_cfdi';
  
  return 'csv_sales'; // Default
};

export const validateFileSize = (file: File): string[] => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  return errors;
};

export const validateFileType = (file: File): string[] => {
  const errors: string[] = [];
  const allowedTypes = ['.csv', '.xml'];
  const fileName = file.name.toLowerCase();
  
  const isValidType = allowedTypes.some(type => fileName.endsWith(type));
  
  if (!isValidType) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  return errors;
};