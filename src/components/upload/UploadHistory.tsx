import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCounter } from '@/contexts/CounterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Trash2, RefreshCw } from 'lucide-react';
import { UploadFile } from '@/types/upload';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UploadHistoryProps {
  refreshTrigger?: number;
}

export const UploadHistory = ({ refreshTrigger }: UploadHistoryProps) => {
  const { userProfile } = useCounter();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    if (!userProfile?.tenant_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .order('uploaded_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setFiles((data || []) as UploadFile[]);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los archivos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userProfile?.tenant_id, refreshTrigger]);

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: 'Archivo eliminado',
        description: 'El archivo ha sido eliminado del historial',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo',
        variant: 'destructive',
      });
    }
  };

  const getFileKindLabel = (kind: string) => {
    switch (kind) {
      case 'csv_sales': return 'Ventas CSV';
      case 'csv_expenses': return 'Gastos CSV';
      case 'csv_inventory': return 'Inventario CSV';
      case 'xml_cfdi': return 'CFDI XML';
      default: return kind;
    }
  };

  const getStatusBadge = (processed: boolean, error?: string) => {
    if (error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    return processed ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Archivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Archivos
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchFiles}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
                <div className="text-2xl font-bold text-green-600">
                  {files.filter(f => f.processed && !f.error).length}
                </div>
                <div className="text-sm text-muted-foreground">Procesados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {files.filter(f => f.error).length}
                </div>
                <div className="text-sm text-muted-foreground">Con errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFile(file.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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