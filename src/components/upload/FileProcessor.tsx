import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, X, Loader2, FileText, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getFileKindFromName } from '@/utils/fileProcessors';

interface FileProcessorProps {
  files: File[];
  onProcessingComplete: () => void;
  onRemoveFile: (index: number) => void;
}

interface FileProcessingState {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  recordsProcessed?: number;
  errors?: string[];
}

export const FileProcessor = ({ files, onProcessingComplete, onRemoveFile }: FileProcessorProps) => {
  const { toast } = useToast();
  const [processingStates, setProcessingStates] = useState<Record<number, FileProcessingState>>(
    Object.fromEntries(files.map((_, index) => [index, { status: 'pending', progress: 0 }]))
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const updateFileState = (index: number, state: Partial<FileProcessingState>) => {
    setProcessingStates(prev => ({
      ...prev,
      [index]: { ...prev[index], ...state }
    }));
  };

  const processFile = async (file: File, index: number): Promise<void> => {
    updateFileState(index, { status: 'processing', progress: 10 });

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateFileState(index, { progress: 50 });

      const content = await file.text();
      const fileKind = getFileKindFromName(file.name);
      
      let recordsProcessed = 0;
      const errors: string[] = [];

      // Process based on file type
      if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = content.split('\n').filter(line => line.trim());
        recordsProcessed = Math.max(0, lines.length - 1); // Subtract header

        if (recordsProcessed === 0) {
          errors.push('Archivo CSV vacío o sin datos válidos');
        }
      } else if (file.name.toLowerCase().endsWith('.xml')) {
        // XML processing simulation
        recordsProcessed = 1;
        if (!content.includes('<?xml')) {
          errors.push('Archivo XML inválido');
        }
      } else {
        // Generic file
        recordsProcessed = 1;
      }

      updateFileState(index, { progress: 90 });

      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 500));

      updateFileState(index, {
        status: errors.length === 0 ? 'completed' : 'error',
        progress: 100,
        recordsProcessed,
        errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      updateFileState(index, {
        status: 'error',
        progress: 100,
        errors: [errorMessage]
      });
    }
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i], i);
      }
      
      const successCount = Object.values(processingStates).filter(s => s.status === 'completed').length;
      const errorCount = Object.values(processingStates).filter(s => s.status === 'error').length;

      if (errorCount === 0) {
        toast({
          title: 'Procesamiento completo',
          description: `${successCount} archivo(s) procesado(s) exitosamente`,
        });
      } else {
        toast({
          title: 'Procesamiento terminado con errores',
          description: `${successCount} exitosos, ${errorCount} con errores`,
          variant: 'destructive',
        });
      }
      
      onProcessingComplete();
    } catch (error) {
      toast({
        title: 'Error durante el procesamiento',
        description: 'Ocurrió un error al procesar los archivos.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: FileProcessingState['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-[var(--accent)]" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-[var(--danger)]" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: FileProcessingState['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-[var(--accent)]/10 text-[var(--accent)]">Completado</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'processing':
        return <Badge variant="secondary">Procesando...</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Archivos a procesar ({files.length})
        </h3>
        <Button 
          onClick={handleProcessAll}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Procesar Todos
        </Button>
      </div>

      <div className="space-y-3">
        {files.map((file, index) => {
          const state = processingStates[index];
          
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(state.status)}
                    <div>
                      <CardTitle className="text-sm">{file.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB • {getFileKindFromName(file.name)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(state.status)}
                    {state.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {state.status !== 'pending' && (
                <CardContent className="pt-0">
                  <Progress value={state.progress} className="mb-2" />
                  
                  {state.status === 'completed' && (
                    <p className="text-sm text-[var(--accent)]">
                      ✓ {state.recordsProcessed || 0} registros procesados exitosamente
                    </p>
                  )}
                  
                  {state.status === 'error' && state.errors && (
                    <div>
                      <p className="text-sm font-medium text-[var(--danger)] mb-1">Errores:</p>
                      <ul className="text-xs text-[var(--danger)] space-y-1">
                        {state.errors.slice(0, 3).map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                        {state.errors.length > 3 && (
                          <li>• ... y {state.errors.length - 3} errores más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};