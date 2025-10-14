import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { parseCSVVentas, type VentaParsed } from '@/lib/parsers/csvParser';
import { parseXMLFactura, type FacturaParsed } from '@/lib/parsers/xmlParser';

interface UploadedFile {
  file: File;
  type: 'xml_cfdi' | 'csv_sales' | 'csv_inventory';
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  recordsProcessed?: number;
}

export default function BulkImportPanel() {
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [brands, setBrands] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Load brands on mount
  useState(() => {
    loadBrands();
  });

  const loadBrands = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: userAccess } = await supabase
        .from('corporate_users')
        .select('corporate_id')
        .eq('user_id', user.user.id)
        .single();

      if (!userAccess) return;

      const { data: legalEntities } = await supabase
        .from('legal_entities')
        .select('id')
        .eq('corporate_id', userAccess.corporate_id);

      if (!legalEntities) return;

      const legalEntityIds = legalEntities.map(le => le.id);

      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .in('legal_entity_id', legalEntityIds);

      setBrands(brandsData || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadStoresForBrand = async (brandId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('auth_user_id', user.user.id)
        .single();

      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .eq('brand_id', brandId)
        .eq('tenant_id', userData?.tenant_id);

      setStores(storesData || []);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    loadStoresForBrand(brandId);
  };

  const handleFileUpload = (files: FileList | null, type: UploadedFile['type']) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      type,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast({
      title: 'Archivos agregados',
      description: `${files.length} archivo(s) listos para importar`
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkImport = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: 'Sin archivos',
        description: 'Agrega al menos un archivo para importar',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedBrand) {
      toast({
        title: 'Brand requerido',
        description: 'Selecciona un brand antes de importar',
        variant: 'destructive'
      });
      return;
    }

    if (stores.length === 0) {
      toast({
        title: 'Sin tiendas',
        description: 'El brand seleccionado no tiene tiendas asignadas',
        variant: 'destructive'
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setLogs(['🚀 Iniciando importación masiva...']);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('auth_user_id', user.user.id)
        .single();

      const tenantId = userData?.tenant_id;
      if (!tenantId) throw new Error('Tenant ID no encontrado');

      let processedCount = 0;
      const totalFiles = uploadedFiles.length;

      for (let i = 0; i < uploadedFiles.length; i++) {
        const fileData = uploadedFiles[i];
        
        // Update file status
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'processing' } : f
        ));

        setLogs(prev => [...prev, `📄 Procesando: ${fileData.file.name}...`]);

        try {
          if (fileData.type === 'csv_sales') {
            const text = await fileData.file.text();
            const parsed: VentaParsed[] = await parseCSVVentas(text);

            // Insert sales data
            for (const record of parsed) {
              const matchedStore = stores.find(s => 
                s.code === record.tienda || s.name.toLowerCase().includes(record.tienda.toLowerCase())
              );

              if (matchedStore) {
                await supabase.from('ventas').insert({
                  tenant_id: tenantId,
                  store_id: matchedStore.store_id,
                  fecha: record.fecha.toISOString().split('T')[0],
                  monto_total: record.montoTotal,
                  num_transacciones: record.numTransacciones || 0
                });
              }
            }

            setUploadedFiles(prev => prev.map((f, idx) => 
              idx === i ? { ...f, status: 'success', recordsProcessed: parsed.length } : f
            ));
            setLogs(prev => [...prev, `✅ ${parsed.length} registros de ventas importados`]);

          } else if (fileData.type === 'xml_cfdi') {
            const text = await fileData.file.text();
            const parsed: FacturaParsed = await parseXMLFactura(text);

            // Get or create legal entity for this invoice
            const { data: legalEntities } = await supabase
              .from('legal_entities')
              .select('id')
              .eq('rfc', parsed.proveedor.rfc)
              .limit(1);

            let legalEntityId = legalEntities?.[0]?.id;

            if (!legalEntityId) {
              const selectedBrandData = brands.find(b => b.id === selectedBrand);
              if (!selectedBrandData) {
                throw new Error('Brand no encontrado');
              }

              const { data: brandWithLE } = await supabase
                .from('brands')
                .select('legal_entity_id')
                .eq('id', selectedBrandData.id)
                .single();

              const { data: legalEntityData } = await supabase
                .from('legal_entities')
                .select('corporate_id')
                .eq('id', brandWithLE?.legal_entity_id)
                .single();

              const { data: newLE } = await supabase
                .from('legal_entities')
                .insert({
                  corporate_id: legalEntityData?.corporate_id,
                  name: parsed.proveedor.nombre,
                  rfc: parsed.proveedor.rfc
                })
                .select()
                .single();
              legalEntityId = newLE?.id;
            }

            // Insert purchase items
            const matchedStore = stores[0]; // Default to first store for bulk import

            for (const concepto of parsed.conceptos) {
              await supabase.from('compras').insert({
                tenant_id: tenantId,
                store_id: matchedStore.store_id,
                legal_entity_id: legalEntityId,
                fecha: parsed.fecha.toISOString().split('T')[0],
                proveedor: parsed.proveedor.nombre,
                rfc_proveedor: parsed.proveedor.rfc,
                uuid_fiscal: parsed.uuid,
                folio: parsed.folio,
                concepto: concepto.descripcion,
                categoria: concepto.categoria,
                monto: concepto.importe,
                moneda: parsed.moneda
              });
            }

            setUploadedFiles(prev => prev.map((f, idx) => 
              idx === i ? { ...f, status: 'success', recordsProcessed: parsed.conceptos.length } : f
            ));
            setLogs(prev => [...prev, `✅ ${parsed.conceptos.length} conceptos de factura importados`]);
          }

          processedCount++;
          setProgress(Math.round((processedCount / totalFiles) * 100));

        } catch (error: any) {
          setUploadedFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'error', message: error.message } : f
          ));
          setLogs(prev => [...prev, `❌ Error en ${fileData.file.name}: ${error.message}`]);
        }
      }

      setLogs(prev => [...prev, `🎉 Importación completada: ${processedCount}/${totalFiles} archivos procesados`]);
      toast({
        title: 'Importación completa',
        description: `${processedCount} archivos procesados exitosamente`
      });

    } catch (error: any) {
      setLogs(prev => [...prev, `❌ Error general: ${error.message}`]);
      toast({
        title: 'Error en importación',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Importación Masiva</h2>
        <p className="text-muted-foreground">
          Para clientes enterprise con datos históricos listos para importar
        </p>
      </div>

      {/* Brand Selection */}
      <Card>
        <CardHeader>
          <CardTitle>1. Seleccionar Brand</CardTitle>
          <CardDescription>Elige el brand al que pertenecen estos datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={selectedBrand} onValueChange={handleBrandChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un brand..." />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name} ({brand.concept})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBrand && stores.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {stores.length} tienda(s) disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>2. Subir Archivos</CardTitle>
          <CardDescription>Agrega los archivos para importación masiva</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 border-2 border-dashed rounded-lg hover:border-primary transition cursor-pointer">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">Facturas XML</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  CFDI del SAT (múltiples archivos)
                </p>
                <input
                  type="file"
                  accept=".xml"
                  multiple
                  className="hidden"
                  id="xml-upload"
                  onChange={(e) => handleFileUpload(e.target.files, 'xml_cfdi')}
                  disabled={importing}
                />
                <label
                  htmlFor="xml-upload"
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm cursor-pointer inline-block"
                >
                  Seleccionar XML
                </label>
              </div>
            </div>

            <div className="p-6 border-2 border-dashed rounded-lg hover:border-primary transition cursor-pointer">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">Ventas CSV</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Historial de ventas diarias
                </p>
                <input
                  type="file"
                  accept=".csv"
                  multiple
                  className="hidden"
                  id="sales-upload"
                  onChange={(e) => handleFileUpload(e.target.files, 'csv_sales')}
                  disabled={importing}
                />
                <label
                  htmlFor="sales-upload"
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm cursor-pointer inline-block"
                >
                  Seleccionar CSV
                </label>
              </div>
            </div>

            <div className="p-6 border-2 border-dashed rounded-lg hover:border-primary transition cursor-pointer opacity-50">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">Inventario CSV</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Próximamente
                </p>
                <Badge variant="outline">Pronto</Badge>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos cargados ({uploadedFiles.length})</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {file.status === 'pending' && <FileText className="h-4 w-4 text-muted-foreground" />}
                      {file.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {file.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {file.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        {file.recordsProcessed && (
                          <p className="text-xs text-muted-foreground">{file.recordsProcessed} registros</p>
                        )}
                        {file.message && (
                          <p className="text-xs text-destructive">{file.message}</p>
                        )}
                      </div>
                    </div>
                    {file.status === 'pending' && !importing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress & Logs */}
      {importing && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Importación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando archivos</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground">{log}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleBulkImport}
          disabled={importing || uploadedFiles.length === 0 || !selectedBrand}
          className="flex-1"
          size="lg"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importando {uploadedFiles.filter(f => f.status === 'processing').length}/{uploadedFiles.length}...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Iniciar Importación ({uploadedFiles.length} archivos)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
