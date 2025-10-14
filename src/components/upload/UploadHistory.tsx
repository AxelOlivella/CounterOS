import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UploadHistoryProps {
  refreshTrigger?: number;
}

interface MockUploadFile {
  id: string;
  filename: string;
  kind: string;
  size_bytes: number;
  processed: boolean;
  error?: string;
  uploaded_at: string;
}

export const UploadHistory = ({ refreshTrigger }: UploadHistoryProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Mock data for demonstration
  const [files] = useState<MockUploadFile[]>([
    {
      id: '1',
      filename: 'ventas_enero_2024.csv',
      kind: 'csv_sales',
      size_bytes: 15420,
      processed: true,
      uploaded_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: '2',
      filename: 'gastos_enero_2024.csv',
      kind: 'csv_expenses', 
      size_bytes: 8930,
      processed: true,
      uploaded_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
    {
      id: '3',
      filename: 'cfdi_proveedor_123.xml',
      kind: 'xml_cfdi',
      size_bytes: 25600,
      processed: false,
      error: 'Error en validación de estructura XML',
      uploaded_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    }
  ]);

  const deleteFile = async (fileId: string) => {
    toast({
      title: 'Funcionalidad en desarrollo',
      description: 'La eliminación de archivos estará disponible próximamente',
    });
  };

  const refreshFiles = async () => {
    setLoading(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    
    toast({
      title: 'Historial actualizado',
      description: 'Se ha actualizado la lista de archivos',
    });
  };

  const getFileKindLabel = (kind: string) => {
    switch (kind) {
      case 'csv_sales': return 'Ventas CSV';
      case 'csv_expenses': return 'Gastos CSV';
      case 'csv_inventory': return 'Inventario CSV';
      case 'xml_cfdi': return 'CFDI XML';
      case 'json_cfdi': return 'CFDI JSON';
      default: return kind;
    }
  };

  const getStatusBadge = (processed: boolean, error?: string) => {
    if (error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    return processed ? (
      <Badge variant="default" className="bg-[var(--accent)]/10 text-[var(--accent)]">Completado</Badge>
    ) : (
      <Badge variant="secondary">Pendiente</Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Archivos
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refreshFiles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay archivos subidos aún</p>
            <p className="text-sm">Los archivos que subas aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{files.length}</div>
                <div className="text-sm text-muted-foreground">Total archivos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--accent)]">
                  {files.filter(f => f.processed && !f.error).length}
                </div>
                <div className="text-sm text-muted-foreground">Procesados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--danger)]">
                  {files.filter(f => f.error).length}
                </div>
                <div className="text-sm text-muted-foreground">Con errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {files.filter(f => !f.processed && !f.error).length}
                </div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
            </div>

            {/* Files table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Subido</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]" title={file.filename}>
                            {file.filename}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getFileKindLabel(file.kind)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(file.size_bytes)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(file.processed, file.error)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(file.uploaded_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Error details for failed files */}
            {files.some(f => f.error) && (
              <div className="space-y-2">
                <h4 className="font-medium text-destructive">Archivos con errores:</h4>
                {files
                  .filter(f => f.error)
                  .map(file => (
                    <div key={file.id} className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="font-medium text-sm">{file.filename}</div>
                      <div className="text-sm text-destructive mt-1">{file.error}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};