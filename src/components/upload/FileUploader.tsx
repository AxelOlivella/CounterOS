import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateData, fileUploadSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  storeId: string;
  tenantId: string;
  onUploadComplete?: (fileId: string) => void;
}

export function FileUploader({ storeId, tenantId, onUploadComplete }: FileUploaderProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file before setting
    const validation = validateData(fileUploadSchema, {
      file,
      storeId,
      tenantId
    });

    if (!validation.success) {
      toast({
        title: 'Archivo inválido',
        description: 'errors' in validation ? validation.errors.join(', ') : 'Error de validación',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      // TODO: Implement actual upload logic
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // formData.append('storeId', storeId);
      // formData.append('tenantId', tenantId);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Archivo cargado',
        description: `${selectedFile.name} se cargó correctamente`,
      });
      
      setSelectedFile(null);
      onUploadComplete?.('file-id-placeholder');
    } catch (error) {
      toast({
        title: 'Error al cargar',
        description: 'No se pudo cargar el archivo. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Cargar Archivo
        </CardTitle>
        <CardDescription>
          Formatos permitidos: CSV, XML (máx. 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".csv,.xml,text/csv,application/vnd.ms-excel,text/xml,application/xml"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? 'Cargando...' : 'Subir Archivo'}
        </Button>

        <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-xs text-foreground">
            <p className="font-medium">Validación automática</p>
            <p>Los archivos se validan antes de subir. Solo formatos CSV y XML son permitidos.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
