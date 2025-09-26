import { SalesRecord, ExpenseRecord, InventoryRecord, CFDIData, ProcessingResult } from '@/types/upload';

export const parseCSVSales = (csvContent: string): { records: SalesRecord[], errors: string[] } => {
  const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    return { records: [], errors: ['CSV file must have at least a header and one data row'] };
  }
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  
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
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Better CSV parsing to handle quotes and commas within fields
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      errors.push(`Line ${i + 1}: Expected ${headers.length} columns, found ${values.length}`);
      continue;
    }
    
    try {
      const record: SalesRecord = {
        date: values[headers.indexOf('date')].trim(),
        store_code: values[headers.indexOf('store_code')].trim(),
        gross_sales: parseFloat(values[headers.indexOf('gross_sales')].replace(/,/g, '')) || 0,
        discounts: parseFloat(values[headers.indexOf('discounts')].replace(/,/g, '')) || 0,
        transactions: parseInt(values[headers.indexOf('transactions')].replace(/,/g, '')) || 0,
      };
      
      // Enhanced date validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(record.date)) {
        errors.push(`Line ${i + 1}: Invalid date format '${record.date}'. Use YYYY-MM-DD`);
        continue;
      }
      
      // Validate date is not in future
      const recordDate = new Date(record.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (recordDate > today) {
        errors.push(`Line ${i + 1}: Date cannot be in the future`);
        continue;
      }
      
      // Validate positive numbers
      if (record.gross_sales < 0 || record.discounts < 0 || record.transactions < 0) {
        errors.push(`Line ${i + 1}: Values cannot be negative`);
        continue;
      }
      
      // Business logic validation
      if (record.discounts > record.gross_sales) {
        errors.push(`Line ${i + 1}: Discounts cannot exceed gross sales`);
        continue;
      }
      
      if (record.transactions === 0 && record.gross_sales > 0) {
        errors.push(`Line ${i + 1}: Cannot have sales without transactions`);
        continue;
      }
      
      // Validate store code format
      if (!record.store_code || record.store_code.length < 3) {
        errors.push(`Line ${i + 1}: Store code must be at least 3 characters`);
        continue;
      }
      
      records.push(record);
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }
  
  // Validate no duplicate dates per store
  const dateStoreMap = new Map<string, string>();
  records.forEach((record, index) => {
    const key = `${record.date}-${record.store_code}`;
    if (dateStoreMap.has(key)) {
      errors.push(`Duplicate entry found: ${record.store_code} on ${record.date}`);
    } else {
      dateStoreMap.set(key, key);
    }
  });
  
  return { records, errors };
};

// Helper function to parse CSV line handling quotes and escaped commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(v => v.replace(/"/g, ''));
}

export const parseCSVExpenses = (csvContent: string): { records: ExpenseRecord[], errors: string[] } => {
  const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    return { records: [], errors: ['CSV file must have at least a header and one data row'] };
  }
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  
  const records: ExpenseRecord[] = [];
  const errors: string[] = [];
  
  const requiredHeaders = ['date', 'store_code', 'category', 'amount'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    return { records, errors };
  }
  
  // Valid expense categories
  const validCategories = [
    'renta', 'servicios', 'marketing', 'mantenimiento', 'seguros',
    'nomina', 'impuestos', 'combustible', 'telefono', 'internet',
    'limpieza', 'seguridad', 'oficina', 'viajes', 'capacitacion',
    'legal', 'contabilidad', 'otros'
  ];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      errors.push(`Line ${i + 1}: Expected ${headers.length} columns, found ${values.length}`);
      continue;
    }
    
    try {
      const record: ExpenseRecord = {
        date: values[headers.indexOf('date')].trim(),
        store_code: values[headers.indexOf('store_code')].trim(),
        category: values[headers.indexOf('category')].trim().toLowerCase(),
        amount: parseFloat(values[headers.indexOf('amount')].replace(/,/g, '')) || 0,
        note: headers.includes('note') ? values[headers.indexOf('note')].trim() : undefined,
      };
      
      // Enhanced date validation
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        errors.push(`Line ${i + 1}: Invalid date format '${record.date}'. Use YYYY-MM-DD`);
        continue;
      }
      
      // Validate date is not in future
      const recordDate = new Date(record.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (recordDate > today) {
        errors.push(`Line ${i + 1}: Date cannot be in the future`);
        continue;
      }
      
      // Validate amount
      if (record.amount <= 0) {
        errors.push(`Line ${i + 1}: Amount must be greater than 0`);
        continue;
      }
      
      // Reasonable amount validation (max $1M MXN)
      if (record.amount > 1000000) {
        errors.push(`Line ${i + 1}: Amount seems too large (>${record.amount.toLocaleString()}). Please verify.`);
        continue;
      }
      
      // Validate category
      if (!validCategories.includes(record.category)) {
        // Auto-correct common categories
        const categoryMap: Record<string, string> = {
          'rent': 'renta',
          'utilities': 'servicios',
          'advertising': 'marketing',
          'maintenance': 'mantenimiento',
          'insurance': 'seguros',
          'payroll': 'nomina',
          'taxes': 'impuestos',
          'gas': 'combustible',
          'phone': 'telefono',
          'cleaning': 'limpieza',
          'security': 'seguridad',
          'office': 'oficina',
          'travel': 'viajes',
          'training': 'capacitacion',
          'accounting': 'contabilidad'
        };
        
        if (categoryMap[record.category]) {
          record.category = categoryMap[record.category];
        } else {
          record.category = 'otros'; // Default to 'otros' for unknown categories
        }
      }
      
      // Validate store code
      if (!record.store_code || record.store_code.length < 3) {
        errors.push(`Line ${i + 1}: Store code must be at least 3 characters`);
        continue;
      }
      
      // Limit note length
      if (record.note && record.note.length > 500) {
        record.note = record.note.substring(0, 500) + '...';
      }
      
      records.push(record);
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }
  
  return { records, errors };
};

export const parseCSVInventory = (csvContent: string): { records: InventoryRecord[], errors: string[] } => {
  const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    return { records: [], errors: ['CSV file must have at least a header and one data row'] };
  }
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  
  const records: InventoryRecord[] = [];
  const errors: string[] = [];
  
  const requiredHeaders = ['date', 'store_code', 'opening_value', 'closing_value', 'waste_value'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    return { records, errors };
  }
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      errors.push(`Line ${i + 1}: Expected ${headers.length} columns, found ${values.length}`);
      continue;
    }
    
    try {
      const record: InventoryRecord = {
        date: values[headers.indexOf('date')].trim(),
        store_code: values[headers.indexOf('store_code')].trim(),
        opening_value: parseFloat(values[headers.indexOf('opening_value')].replace(/,/g, '')) || 0,
        closing_value: parseFloat(values[headers.indexOf('closing_value')].replace(/,/g, '')) || 0,
        waste_value: parseFloat(values[headers.indexOf('waste_value')].replace(/,/g, '')) || 0,
      };
      
      // Enhanced date validation
      if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        errors.push(`Line ${i + 1}: Invalid date format '${record.date}'. Use YYYY-MM-DD`);
        continue;
      }
      
      // Validate date is not in future
      const recordDate = new Date(record.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (recordDate > today) {
        errors.push(`Line ${i + 1}: Date cannot be in the future`);
        continue;
      }
      
      // Validate all values are non-negative
      if (record.opening_value < 0 || record.closing_value < 0 || record.waste_value < 0) {
        errors.push(`Line ${i + 1}: Inventory values cannot be negative`);
        continue;
      }
      
      // Business logic validation
      if (record.waste_value > record.opening_value) {
        errors.push(`Line ${i + 1}: Waste value cannot exceed opening inventory`);
        continue;
      }
      
      // Check reasonable inventory values (max $500K MXN)
      const maxValue = 500000;
      if (record.opening_value > maxValue || record.closing_value > maxValue) {
        errors.push(`Line ${i + 1}: Inventory value seems too large (>${maxValue.toLocaleString()}). Please verify.`);
        continue;
      }
      
      // Check for reasonable waste percentage (max 20% of opening)
      if (record.opening_value > 0 && (record.waste_value / record.opening_value) > 0.2) {
        errors.push(`Line ${i + 1}: Waste percentage seems high (${((record.waste_value / record.opening_value) * 100).toFixed(1)}%). Please verify.`);
        continue;
      }
      
      // Validate store code
      if (!record.store_code || record.store_code.length < 3) {
        errors.push(`Line ${i + 1}: Store code must be at least 3 characters`);
        continue;
      }
      
      records.push(record);
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }
  
  // Check for duplicate date-store combinations
  const dateStoreMap = new Map<string, number>();
  records.forEach((record, index) => {
    const key = `${record.date}-${record.store_code}`;
    if (dateStoreMap.has(key)) {
      errors.push(`Duplicate inventory entry: ${record.store_code} on ${record.date}`);
    } else {
      dateStoreMap.set(key, index);
    }
  });
  
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