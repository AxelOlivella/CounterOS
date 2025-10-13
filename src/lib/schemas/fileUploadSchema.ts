import { z } from 'zod';

const MAX_XML_SIZE = 5_000_000; // 5MB
const MAX_CSV_SIZE = 10_000_000; // 10MB

export const fileUploadSchema = z.object({
  facturas: z.array(
    z.instanceof(File)
      .refine(
        f => f.type === 'text/xml' || f.name.toLowerCase().endsWith('.xml'), 
        'Solo archivos XML'
      )
      .refine(
        f => f.size <= MAX_XML_SIZE, 
        `Archivo debe ser menor a ${MAX_XML_SIZE / 1_000_000}MB`
      )
  ).min(1, 'Debes subir al menos 1 factura'),
  
  ventas: z.instanceof(File)
    .refine(
      f => f.type === 'text/csv' || f.name.toLowerCase().endsWith('.csv'), 
      'Solo archivos CSV'
    )
    .refine(
      f => f.size <= MAX_CSV_SIZE, 
      `Archivo debe ser menor a ${MAX_CSV_SIZE / 1_000_000}MB`
    )
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;

export const validateFile = (file: File, type: 'xml' | 'csv'): { valid: boolean; error?: string } => {
  const maxSize = type === 'xml' ? MAX_XML_SIZE : MAX_CSV_SIZE;
  const expectedExtension = type === 'xml' ? '.xml' : '.csv';
  
  if (!file.name.toLowerCase().endsWith(expectedExtension)) {
    return { 
      valid: false, 
      error: `Solo archivos ${type.toUpperCase()}. Recibiste: ${file.name.split('.').pop()?.toUpperCase() || 'desconocido'}` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Archivo muy grande. Máximo ${maxSize / 1_000_000}MB` 
    };
  }
  
  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
