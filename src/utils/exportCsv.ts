export interface ExportOptions {
  filename?: string;
  delimiter?: string;
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'local' | 'custom';
  customDateFormat?: string;
}

/**
 * Helper function to format dates for CSV export
 */
function formatDateForExport(date: any, format: 'iso' | 'local' | 'custom', customFormat?: string): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return String(date);
  
  switch (format) {
    case 'iso':
      return dateObj.toISOString().split('T')[0];
    case 'local':
      return dateObj.toLocaleDateString('es-MX');
    case 'custom':
      // Simple custom format support (could be enhanced)
      return customFormat ? dateObj.toLocaleDateString('es-MX') : dateObj.toISOString().split('T')[0];
    default:
      return dateObj.toISOString().split('T')[0];
  }
}

/**
 * Helper function to escape CSV values
 */
function escapeCsvValue(value: any, delimiter: string = ','): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If value contains delimiter, newlines, or quotes, wrap in quotes and escape internal quotes
  if (stringValue.includes(delimiter) || stringValue.includes('\n') || stringValue.includes('\r') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts array of objects to CSV string
 */
export function arrayToCsv(
  data: Record<string, any>[], 
  options: ExportOptions = {}
): string {
  const {
    delimiter = ',',
    includeHeaders = true,
    dateFormat = 'iso',
    customDateFormat
  } = options;

  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  const csvRows: string[] = [];
  
  // Add headers if requested
  if (includeHeaders) {
    const headerRow = headers.map(header => escapeCsvValue(header, delimiter)).join(delimiter);
    csvRows.push(headerRow);
  }
  
  // Process data rows
  data.forEach(row => {
    const csvRow = headers.map(header => {
      const value = row[header];
      
      // Handle dates specially
      if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        const formattedDate = formatDateForExport(value, dateFormat, customDateFormat);
        return escapeCsvValue(formattedDate, delimiter);
      }
      
      return escapeCsvValue(value, delimiter);
    }).join(delimiter);
    
    csvRows.push(csvRow);
  });
  
  return csvRows.join('\n');
}

/**
 * Downloads CSV data as a file
 */
export function downloadCsv(
  data: Record<string, any>[], 
  options: ExportOptions = {}
): void {
  const {
    filename = `export_${new Date().toISOString().split('T')[0]}.csv`
  } = options;

  const csvContent = arrayToCsv(data, options);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Utility function to export CounterOS specific data formats
 */
export function exportCounterOSData(
  data: Record<string, any>[],
  dataType: 'pnl' | 'foodcost' | 'sales' | 'expenses',
  storeNames?: Record<string, string>
): void {
  const typeConfigs = {
    pnl: {
      filename: `pnl_report_${new Date().toISOString().split('T')[0]}.csv`,
      dateFormat: 'local' as const
    },
    foodcost: {
      filename: `food_cost_analysis_${new Date().toISOString().split('T')[0]}.csv`,
      dateFormat: 'local' as const
    },
    sales: {
      filename: `sales_data_${new Date().toISOString().split('T')[0]}.csv`,
      dateFormat: 'local' as const
    },
    expenses: {
      filename: `expenses_report_${new Date().toISOString().split('T')[0]}.csv`,
      dateFormat: 'local' as const
    }
  };

  const config = typeConfigs[dataType];
  
  // Enhance data with store names if provided
  const enhancedData = storeNames ? data.map(row => ({
    ...row,
    tienda_nombre: storeNames[row.store_id] || row.store_id
  })) : data;

  downloadCsv(enhancedData, config);
}

/**
 * Helper to format currency values for export
 */
export function formatCurrencyForExport(value: number | string, currency: string = 'MXN'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(numValue);
}

/**
 * Helper to create summary rows for reports
 */
export function addSummaryRows(
  data: Record<string, any>[],
  summaryFields: string[],
  groupBy?: string
): Record<string, any>[] {
  if (!groupBy) {
    // Simple totals
    const totals: Record<string, any> = { [Object.keys(data[0])[0]]: 'TOTAL' };
    
    summaryFields.forEach(field => {
      const sum = data.reduce((acc, row) => {
        const value = parseFloat(row[field]) || 0;
        return acc + value;
      }, 0);
      totals[field] = sum;
    });
    
    return [...data, totals];
  }
  
  // Group by field and add subtotals
  const grouped = data.reduce((acc, row) => {
    const groupValue = row[groupBy];
    if (!acc[groupValue]) acc[groupValue] = [];
    acc[groupValue].push(row);
    return acc;
  }, {} as Record<string, any[]>);
  
  const result: Record<string, any>[] = [];
  
  Object.entries(grouped).forEach(([groupValue, rows]) => {
    result.push(...rows);
    
    // Add subtotal
    const subtotal: Record<string, any> = { [groupBy]: `SUBTOTAL - ${groupValue}` };
    summaryFields.forEach(field => {
      const sum = rows.reduce((acc, row) => {
        const value = parseFloat(row[field]) || 0;
        return acc + value;
      }, 0);
      subtotal[field] = sum;
    });
    result.push(subtotal);
  });
  
  return result;
}