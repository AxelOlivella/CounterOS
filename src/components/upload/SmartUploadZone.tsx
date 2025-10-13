import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UploadStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

interface SmartUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  acceptedFormats?: string[];
  recentUploads?: Array<{
    name: string;
    date: string;
    amount: string;
  }>;
}

export function SmartUploadZone({ 
  onUpload, 
  acceptedFormats = ['.xml', '.pdf', '.jpg', '.png'],
  recentUploads = []
}: SmartUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [steps, setSteps] = useState<UploadStep[]>([
    { id: 'validate', label: 'Validando XML', status: 'pending' },
    { id: 'provider', label: 'Identificando proveedor', status: 'pending' },
    { id: 'items', label: 'Categorizando items', status: 'pending' },
    { id: 'update', label: 'Actualizando food cost', status: 'pending' },
  ]);

  const processUpload = async (file: File) => {
    setUploading(true);
    
    // Simulate step-by-step processing with visual feedback
    for (let i = 0; i < steps.length; i++) {
      setSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'processing' } : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'complete' } : step
      ));
    }

    try {
      await onUpload(file);
    } catch (error) {
      setSteps(prev => prev.map(step => ({ ...step, status: 'error' })));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
    multiple: false,
  });

  const getStepIcon = (status: UploadStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'processing':
        return <div className="h-5 w-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-critical" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  if (uploading) {
    return (
      <Card className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Procesando factura...</h3>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <span className={cn(
                  "text-sm font-medium",
                  step.status === 'complete' && "text-success",
                  step.status === 'processing' && "text-secondary",
                  step.status === 'error' && "text-critical"
                )}>
                  {step.status === 'complete' && '✓ '}
                  {step.status === 'processing' && '⟳ '}
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        {...getRootProps()}
        className={cn(
          'mobile-tap-target cursor-pointer transition-all duration-200',
          'border-2 border-dashed p-12',
          isDragActive ? 'border-secondary bg-secondary/5' : 'border-muted hover:border-secondary/50'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={cn(
            'p-6 rounded-full transition-colors',
            isDragActive ? 'bg-secondary/10' : 'bg-muted/50'
          )}>
            {isDragActive ? (
              <Upload className="h-12 w-12 text-secondary" />
            ) : (
              <FileText className="h-12 w-12 text-muted-foreground" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? '¡Suelta el archivo aquí!' : 'Arrastra factura aquí'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              o toca para seleccionar
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
              <span>✓ XML (mejor)</span>
              <span>✓ PDF</span>
              <span>✓ Foto</span>
            </div>
          </div>
        </div>
      </Card>

      {recentUploads.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Últimas {recentUploads.length} facturas
          </h4>
          
          <div className="space-y-2">
            {recentUploads.map((upload, idx) => (
              <Card key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{upload.name}</p>
                      <p className="text-xs text-muted-foreground">{upload.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{upload.amount}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
