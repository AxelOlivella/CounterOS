// CSV Uploader with Dynamic Column Mapping
// Enterprise-grade file processing with preview and validation

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Check, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMXN, validateFinancialInput, calculatePnL } from '@/lib/finance';

interface CSVColumn {
  index: number;
  header: string;
  mappedTo: string | null;
  sample: string;
}

interface CSVRow {
  [key: string]: string | number;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
  value: any;
}

const FIELD_MAPPINGS = [
  { key: 'period', label: 'Período/Mes', required: true },
  { key: 'store', label: 'Tienda', required: true },
  { key: 'sales', label: 'Ventas', required: true },
  { key: 'cogs', label: 'COGS', required: true },
  { key: 'rent', label: 'Renta', required: false },
  { key: 'payroll', label: 'Nómina', required: false },
  { key: 'energy', label: 'Energía', required: false },
  { key: 'other', label: 'Otros gastos', required: false },
];

interface CSVUploaderProps {
  onDataProcessed: (data: any[]) => void;
  className?: string;
}

export default function CSVUploader({ onDataProcessed, className }: CSVUploaderProps) {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [columns, setColumns] = useState<CSVColumn[]>([]);
  const [mappedData, setMappedData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'processing'>('upload');
  const [fileName, setFileName] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => 
        row.split(',').map(cell => cell.trim().replace(/['"]/g, ''))
      );
      
      if (rows.length > 0) {
        const headers = rows[0];
        const dataRows = rows.slice(1).filter(row => row.some(cell => cell.length > 0));
        
        setCsvData([headers, ...dataRows]);
        
        // Create column definitions with samples
        const columnDefs: CSVColumn[] = headers.map((header, index) => ({
          index,
          header,
          mappedTo: null,
          sample: dataRows[0]?.[index] || '',
        }));
        
        setColumns(columnDefs);
        setStep('mapping');
      }
    };
    
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleColumnMapping = (columnIndex: number, mappedField: string | null) => {
    setColumns(prev => prev.map(col => 
      col.index === columnIndex 
        ? { ...col, mappedTo: mappedField }
        : col
    ));
  };

  const processMappedData = () => {
    const headerRow = csvData[0];
    const dataRows = csvData.slice(1);
    
    const processed: CSVRow[] = dataRows.map((row, rowIndex) => {
      const processedRow: CSVRow = { _rowIndex: rowIndex + 1 };
      
      columns.forEach(col => {
        if (col.mappedTo) {
          const rawValue = row[col.index];
          
          // Parse numeric fields
          if (['sales', 'cogs', 'rent', 'payroll', 'energy', 'other'].includes(col.mappedTo)) {
            const numValue = parseFloat(rawValue.replace(/[^0-9.-]/g, ''));
            processedRow[col.mappedTo] = isNaN(numValue) ? 0 : numValue;
          } else {
            processedRow[col.mappedTo] = rawValue;
          }
        }
      });
      
      return processedRow;
    });
    
    setMappedData(processed);
    validateData(processed);
    setStep('preview');
  };

  const validateData = (data: CSVRow[]) => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      // Validate required fields
      FIELD_MAPPINGS.forEach(field => {
        if (field.required && (!row[field.key] || row[field.key] === '')) {
          errors.push({
            row: index + 1,
            column: field.label,
            message: 'Campo requerido',
            value: row[field.key],
          });
        }
        
        // Validate numeric fields
        if (['sales', 'cogs', 'rent', 'payroll', 'energy', 'other'].includes(field.key)) {
          const value = Number(row[field.key]);
          const validation = validateFinancialInput(value, field.label);
          if (validation) {
            errors.push({
              row: index + 1,
              column: field.label,
              message: validation,
              value: row[field.key],
            });
          }
        }
      });
    });
    
    setValidationErrors(errors);
  };

  const processData = () => {
    setStep('processing');
    
    // Convert to P&L data format
    const processedData = mappedData.map(row => {
      const pnlData = calculatePnL({
        sales: Number(row.sales) || 0,
        cogs: Number(row.cogs) || 0,
        rent: Number(row.rent) || 0,
        payroll: Number(row.payroll) || 0,
        energy: Number(row.energy) || 0,
        other: Number(row.other) || 0,
      });
      
      return {
        ...pnlData,
        period: row.period,
        store: row.store,
        _rowIndex: row._rowIndex,
      };
    });
    
    onDataProcessed(processedData);
  };

  const canProceed = () => {
    const requiredMapped = FIELD_MAPPINGS
      .filter(f => f.required)
      .every(f => columns.some(c => c.mappedTo === f.key));
    
    return requiredMapped;
  };

  if (step === 'upload') {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Template Download */}
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <h3 className="text-body font-semibold text-accent-700 mb-2">
            Plantilla sugerida
          </h3>
          <p className="text-caption text-accent-600 mb-3">
            Descarga nuestra plantilla para asegurar compatibilidad:
          </p>
          <div className="text-caption font-mono bg-white p-3 rounded border text-gray-700">
            mes,tienda,ventas,cogs,renta,energia,nomina,otros
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-accent-400 bg-accent-50" 
              : "border-gray-300 hover:border-accent-400 hover:bg-accent-50/30"
          )}
        >
          <input {...getInputProps()} />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-body font-semibold text-gray-700 mb-2">
            {isDragActive ? 'Suelta el archivo aquí' : 'Sube tu archivo CSV'}
          </h3>
          
          <p className="text-caption text-gray-500 mb-4">
            Arrastra y suelta o haz clic para seleccionar
          </p>
          
          <div className="text-xs text-gray-400">
            Máximo 10MB • Solo archivos .csv
          </div>
        </div>
      </div>
    );
  }

  if (step === 'mapping') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl-custom font-semibold text-navy-600">
              Mapeo de columnas
            </h3>
            <p className="text-caption text-gray-600">
              Archivo: {fileName}
            </p>
          </div>
          
          <button
            onClick={() => setStep('upload')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {columns.map((column) => (
            <div key={column.index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-700 mb-1">
                    {column.header}
                  </h4>
                  <p className="text-caption text-gray-500">
                    Ejemplo: {column.sample}
                  </p>
                </div>
                
                <select
                  value={column.mappedTo || ''}
                  onChange={(e) => handleColumnMapping(column.index, e.target.value || null)}
                  className="ml-4 px-3 py-2 border border-gray-300 rounded-md text-caption bg-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                >
                  <option value="">-- No mapear --</option>
                  {FIELD_MAPPINGS.map(field => (
                    <option key={field.key} value={field.key}>
                      {field.label} {field.required && '*'}
                    </option>
                  ))}
                </select>
              </div>
              
              {column.mappedTo && (
                <div className="text-xs text-accent-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Mapeado a: {FIELD_MAPPINGS.find(f => f.key === column.mappedTo)?.label}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-caption text-gray-600">
            {FIELD_MAPPINGS.filter(f => f.required).length} campos requeridos
          </div>
          
          <button
            onClick={processMappedData}
            disabled={!canProceed()}
            className="px-6 py-2 bg-accent-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-600 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl-custom font-semibold text-navy-600">
              Vista previa
            </h3>
            <p className="text-caption text-gray-600">
              {mappedData.length} registros • {validationErrors.length} errores
            </p>
          </div>
          
          <button
            onClick={() => setStep('mapping')}
            className="text-accent-600 hover:text-accent-700 text-caption font-medium"
          >
            ← Ajustar mapeo
          </button>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-warn-50 border border-warn-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-warn-500" />
              <h4 className="font-medium text-warn-700">
                Errores de validación ({validationErrors.length})
              </h4>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {validationErrors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-caption text-warn-600">
                  Fila {error.row}, {error.column}: {error.message}
                </div>
              ))}
              {validationErrors.length > 5 && (
                <div className="text-caption text-warn-500">
                  ... y {validationErrors.length - 5} errores más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Preview */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-caption">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {FIELD_MAPPINGS.filter(f => columns.some(c => c.mappedTo === f.key)).map(field => (
                    <th key={field.key} className="px-3 py-2 text-left font-medium text-gray-700">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mappedData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {FIELD_MAPPINGS.filter(f => columns.some(c => c.mappedTo === f.key)).map(field => (
                      <td key={field.key} className="px-3 py-2 text-gray-700">
                        {['sales', 'cogs', 'rent', 'payroll', 'energy', 'other'].includes(field.key)
                          ? formatMXN(Number(row[field.key]) || 0)
                          : String(row[field.key] || '')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {mappedData.length > 10 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-caption text-gray-500">
              Mostrando 10 de {mappedData.length} registros
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-caption text-gray-600">
            {validationErrors.length === 0 ? '✓ Datos válidos' : `${validationErrors.length} errores encontrados`}
          </div>
          
          <button
            onClick={processData}
            disabled={validationErrors.length > 0}
            className="px-6 py-3 bg-accent-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-600 transition-colors"
          >
            Procesar datos
          </button>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-accent-500 border-t-transparent rounded-full mx-auto mb-4" />
        <h3 className="text-body font-medium text-gray-700 mb-2">
          Procesando datos...
        </h3>
        <p className="text-caption text-gray-500">
          Calculando P&L y validando información
        </p>
      </div>
    );
  }

  return null;
}