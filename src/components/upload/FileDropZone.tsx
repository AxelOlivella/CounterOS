import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateFileSize, validateFileType } from '@/utils/fileProcessors';

interface FileDropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

export const FileDropZone = ({ onFilesAccepted, maxFiles = 5, className }: FileDropZoneProps) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const allErrors: string[] = [];
    
    // Validate accepted files
    acceptedFiles.forEach(file => {
      const sizeErrors = validateFileSize(file);
      const typeErrors = validateFileType(file);
      allErrors.push(...sizeErrors, ...typeErrors);
    });
    
    // Handle rejected files
    rejectedFiles.forEach(rejection => {
      allErrors.push(`${rejection.file.name}: ${rejection.errors.map((e: any) => e.message).join(', ')}`);
    });
    
    setValidationErrors(allErrors);
    
    if (allErrors.length === 0 && acceptedFiles.length > 0) {
      onFilesAccepted(acceptedFiles);
    }
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    accept: {
      'text/csv': ['.csv'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div className={className}>
      <Card 
        {...getRootProps()} 
        className={cn(
          'border-2 border-dashed cursor-pointer transition-colors duration-200',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <input {...getInputProps()} />
          
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4',
            isDragActive && !isDragReject && 'bg-primary/10 text-primary',
            isDragReject && 'bg-destructive/10 text-destructive',
            !isDragActive && 'bg-muted text-muted-foreground'
          )}>
            {isDragReject ? (
              <AlertCircle className="h-8 w-8" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {isDragActive 
              ? (isDragReject ? 'Archivos no válidos' : 'Suelta los archivos aquí')
              : 'Arrastra archivos o haz clic para seleccionar'
            }
          </h3>
          
          <p className="text-muted-foreground mb-4">
            Formatos permitidos: CSV, XML • Máximo {maxFiles} archivos • Hasta 10MB cada uno
          </p>

          <div className="flex flex-wrap gap-2 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Ventas CSV</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Gastos CSV</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Inventarios CSV</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>CFDI XML</span>
            </div>
          </div>
          
          {!isDragActive && (
            <Button variant="outline" className="mt-4">
              Seleccionar Archivos
            </Button>
          )}
        </CardContent>
      </Card>

      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-destructive font-medium mb-2">
            <AlertCircle className="h-4 w-4" />
            <span>Errores de validación:</span>
          </div>
          <ul className="text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-destructive">• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};