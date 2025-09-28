export interface CsvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  preview: Record<string, any>[];
  headers: string[];
}

export interface CsvValidationOptions {
  requiredHeaders?: string[];
  maxRows?: number;
  previewRows?: number;
  allowEmptyRows?: boolean;
  trimWhitespace?: boolean;
}

/**
 * Validates CSV data structure and content
 * Returns preview of first N rows and validation results
 */
export function validateCsv(
  csvData: any[], 
  options: CsvValidationOptions = {}
): CsvValidationResult {
  const {
    requiredHeaders = [],
    maxRows = 10000,
    previewRows = 5,
    allowEmptyRows = false,
    trimWhitespace = true
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if (!Array.isArray(csvData)) {
    errors.push('Datos CSV inválidos: se esperaba un array');
    return {
      isValid: false,
      errors,
      warnings,
      rowCount: 0,
      preview: [],
      headers: []
    };
  }

  if (csvData.length === 0) {
    errors.push('El archivo CSV está vacío');
    return {
      isValid: false,
      errors,
      warnings,
      rowCount: 0,
      preview: [],
      headers: []
    };
  }

  // Get headers from first row
  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
  
  // Check required headers
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push(`Columnas requeridas faltantes: ${missingHeaders.join(', ')}`);
  }

  // Check row count
  if (csvData.length > maxRows) {
    warnings.push(`El archivo tiene ${csvData.length} filas. Máximo recomendado: ${maxRows}`);
  }

  // Process rows
  let validRowCount = 0;
  const processedData = csvData.map((row, index) => {
    const processedRow: Record<string, any> = {};
    let hasData = false;

    for (const [key, value] of Object.entries(row)) {
      let processedValue = value;
      
      if (trimWhitespace && typeof value === 'string') {
        processedValue = value.trim();
      }
      
      processedRow[key] = processedValue;
      
      if (processedValue !== null && processedValue !== undefined && processedValue !== '') {
        hasData = true;
      }
    }

    if (!hasData && !allowEmptyRows) {
      warnings.push(`Fila ${index + 1} está vacía`);
    } else if (hasData) {
      validRowCount++;
    }

    return processedRow;
  });

  // Create preview
  const preview = processedData.slice(0, previewRows);

  // Additional validations for CounterOS specific data
  if (headers.includes('fecha') || headers.includes('date')) {
    const dateColumn = headers.includes('fecha') ? 'fecha' : 'date';
    let invalidDates = 0;
    
    preview.forEach((row, index) => {
      const dateValue = row[dateColumn];
      if (dateValue && !isValidDate(dateValue)) {
        invalidDates++;
      }
    });
    
    if (invalidDates > 0) {
      warnings.push(`${invalidDates} fechas inválidas detectadas en la muestra`);
    }
  }

  // Check for numeric columns
  const numericColumns = ['monto', 'cantidad', 'precio', 'total', 'amount', 'qty', 'price'];
  numericColumns.forEach(colName => {
    if (headers.includes(colName)) {
      let invalidNumbers = 0;
      
      preview.forEach(row => {
        const value = row[colName];
        if (value && !isValidNumber(value)) {
          invalidNumbers++;
        }
      });
      
      if (invalidNumbers > 0) {
        warnings.push(`${invalidNumbers} valores numéricos inválidos en columna '${colName}'`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rowCount: csvData.length,
    preview,
    headers
  };
}

/**
 * Helper function to validate date strings
 */
function isValidDate(dateString: any): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Helper function to validate numeric values
 */
function isValidNumber(value: any): boolean {
  if (value === null || value === undefined || value === '') return true;
  
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Validates specific CounterOS data types
 */
export function validateCounterOSCsv(csvData: any[], dataType: 'sales' | 'expenses' | 'inventory'): CsvValidationResult {
  const typeConfigs = {
    sales: {
      requiredHeaders: ['fecha', 'tienda', 'producto', 'cantidad', 'precio'],
      maxRows: 50000
    },
    expenses: {
      requiredHeaders: ['fecha', 'tienda', 'categoria', 'monto'],
      maxRows: 10000
    },
    inventory: {
      requiredHeaders: ['tienda', 'producto', 'cantidad'],
      maxRows: 5000
    }
  };

  const config = typeConfigs[dataType];
  return validateCsv(csvData, config);
}