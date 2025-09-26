import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  parseCSVSales, 
  parseCSVExpenses, 
  parseCSVInventory, 
  parseJSONCFDI, 
  getFileKindFromName 
} from '@/utils/fileProcessors';
import { FileKind, ProcessingResult } from '@/types/upload';
import { cn } from '@/lib/utils';

interface FileProcessorProps {
  files: File[];
  onProcessingComplete: () => void;
  onRemoveFile: (index: number) => void;
}

interface FileProcessingState {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: ProcessingResult;
  error?: string;
}

export const FileProcessor = ({ files, onProcessingComplete, onRemoveFile }: FileProcessorProps) => {
  const { userProfile, tenant } = useTenant();
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
    if (!userProfile?.tenant_id) {
      throw new Error('No tenant ID found');
    }

    updateFileState(index, { status: 'processing', progress: 10 });

    try {
      const content = await file.text();
      const fileKind = getFileKindFromName(file.name) as FileKind;

      updateFileState(index, { progress: 30 });

      // Record file in database
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert({
          tenant_id: userProfile.tenant_id,
          filename: file.name,
          kind: fileKind,
          size_bytes: file.size,
          processed: false
        })
        .select()
        .single();

      if (fileError) throw fileError;

      updateFileState(index, { progress: 50 });

      let recordsProcessed = 0;
      const errors: string[] = [];

      // Process based on file kind
      if (fileKind === 'csv_sales') {
        const { records, errors: parseErrors } = parseCSVSales(content);
        errors.push(...parseErrors);

        if (records.length > 0 && errors.length === 0) {
          // Get store mappings
          const { data: stores } = await supabase
            .from('stores')
            .select('id, code')
            .eq('tenant_id', userProfile.tenant_id);

          const storeMap = new Map(stores?.map(s => [s.code, s.id]) || []);

          // Insert sales records
          for (const record of records) {
            const storeId = storeMap.get(record.store_code);
            if (!storeId) {
              errors.push(`Unknown store code: ${record.store_code}`);
              continue;
            }

            const { error: insertError } = await supabase
              .from('daily_sales')
              .upsert({
                tenant_id: userProfile.tenant_id,
                store_id: storeId,
                date: record.date,
                gross_sales: record.gross_sales,
                discounts: record.discounts,
                transactions: record.transactions
              }, { 
                onConflict: 'tenant_id,store_id,date'
              });

            if (insertError) {
              errors.push(`Error inserting record for ${record.store_code}: ${insertError.message}`);
            } else {
              recordsProcessed++;
            }
          }
        }
      } else if (fileKind === 'csv_expenses') {
        const { records, errors: parseErrors } = parseCSVExpenses(content);
        errors.push(...parseErrors);

        if (records.length > 0 && errors.length === 0) {
          const { data: stores } = await supabase
            .from('stores')
            .select('id, code')
            .eq('tenant_id', userProfile.tenant_id);

          const storeMap = new Map(stores?.map(s => [s.code, s.id]) || []);

          for (const record of records) {
            const storeId = storeMap.get(record.store_code);
            if (!storeId) {
              errors.push(`Unknown store code: ${record.store_code}`);
              continue;
            }

            const { error: insertError } = await supabase
              .from('expenses')
              .insert({
                tenant_id: userProfile.tenant_id,
                store_id: storeId,
                date: record.date,
                category: record.category,
                amount: record.amount,
                note: record.note
              });

            if (insertError) {
              errors.push(`Error inserting expense: ${insertError.message}`);
            } else {
              recordsProcessed++;
            }
          }
        }
      } else if (fileKind === 'csv_inventory') {
        const { records, errors: parseErrors } = parseCSVInventory(content);
        errors.push(...parseErrors);

        if (records.length > 0 && errors.length === 0) {
          const { data: stores } = await supabase
            .from('stores')
            .select('id, code')
            .eq('tenant_id', userProfile.tenant_id);

          const storeMap = new Map(stores?.map(s => [s.code, s.id]) || []);

          for (const record of records) {
            const storeId = storeMap.get(record.store_code);
            if (!storeId) {
              errors.push(`Unknown store code: ${record.store_code}`);
              continue;
            }

            const { error: insertError } = await supabase
              .from('stock_daily')
              .upsert({
                tenant_id: userProfile.tenant_id,
                store_id: storeId,
                date: record.date,
                opening_value: record.opening_value,
                closing_value: record.closing_value,
                waste_value: record.waste_value
              }, {
                onConflict: 'tenant_id,store_id,date'
              });

            if (insertError) {
              errors.push(`Error inserting inventory: ${insertError.message}`);
            } else {
              recordsProcessed++;
            }
          }
        }
      } else if (fileKind === 'xml_cfdi') {
        // XML files - Real CFDI invoices from suppliers (use Facturapi API)
        try {
          const response = await supabase.functions.invoke('process-cfdi', {
            body: {
              xmlContent: content,
              tenantId: userProfile.tenant_id
            }
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          const result = response.data;
          
          if (!result.success) {
            if (result.duplicate) {
              errors.push('Este CFDI ya existe en la base de datos');
            } else {
              errors.push(result.error || 'Error processing CFDI');
            }
          } else {
            recordsProcessed = 1;
            console.log(`CFDI processed successfully: ${result.data.itemsCount} items`);
          }
        } catch (error) {
          console.error('CFDI processing error:', error);
          errors.push(`Error processing CFDI: ${error.message}`);
        }
      } else if (fileKind === 'json_cfdi') {
        // JSON files - For testing and development (process directly)
        const { data: cfdiData, errors: parseErrors } = parseJSONCFDI(content);
        errors.push(...parseErrors);
        
        if (cfdiData && parseErrors.length === 0) {
          // Check for duplicate UUID
          const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('invoice_uuid', cfdiData.uuid)
            .eq('tenant_id', userProfile.tenant_id)
            .single();

          if (existingPurchase) {
            errors.push('Este CFDI ya existe en la base de datos');
          } else {
            // Get default store
            const { data: stores } = await supabase
              .from('stores')
              .select('id')
              .eq('tenant_id', userProfile.tenant_id)
              .eq('is_active', true)
              .limit(1);

            if (!stores || stores.length === 0) {
              errors.push('No active stores found');
            } else {
              // Insert purchase record
              const { data: purchase, error: purchaseError } = await supabase
                .from('purchases')
                .insert({
                  tenant_id: userProfile.tenant_id,
                  store_id: stores[0].id,
                  invoice_uuid: cfdiData.uuid,
                  supplier_rfc: cfdiData.supplier_rfc,
                  supplier_name: cfdiData.supplier_name,
                  issue_date: cfdiData.issue_date.split('T')[0],
                  subtotal: cfdiData.subtotal,
                  tax: cfdiData.tax,
                  total: cfdiData.total,
                  xml_metadata: {
                    processed_via_json: true,
                    processed_at: new Date().toISOString(),
                    items_count: cfdiData.items.length
                  }
                })
                .select()
                .single();

              if (purchaseError) {
                errors.push(`Failed to save purchase: ${purchaseError.message}`);
              } else {
                // Insert purchase items
                const purchaseItems = cfdiData.items.map(item => ({
                  tenant_id: userProfile.tenant_id,
                  purchase_id: purchase.id,
                  sku: item.sku,
                  description: item.description.substring(0, 500),
                  qty: item.qty,
                  unit: item.unit,
                  unit_price: item.unit_price,
                  line_total: item.line_total,
                  category: item.category
                }));

                const { error: itemsError } = await supabase
                  .from('purchase_items')
                  .insert(purchaseItems);

                if (itemsError) {
                  console.error('Error inserting purchase items:', itemsError);
                  errors.push(`Error inserting items: ${itemsError.message}`);
                } else {
                  recordsProcessed = cfdiData.items.length;
                  console.log(`JSON CFDI processed: ${cfdiData.items.length} items`);
                }
              }
            }
          }
        }
      }

      updateFileState(index, { progress: 90 });

      // Update file status
      const { error: updateError } = await supabase
        .from('files')
        .update({
          processed: errors.length === 0,
          error: errors.length > 0 ? errors.join('; ') : null
        })
        .eq('id', fileRecord.id);

      if (updateError) throw updateError;

      const result: ProcessingResult = {
        success: errors.length === 0,
        recordsProcessed,
        errors
      };

      updateFileState(index, {
        status: errors.length === 0 ? 'completed' : 'error',
        progress: 100,
        result
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateFileState(index, {
        status: 'error',
        progress: 100,
        error: errorMessage
      });
    }
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    
    try {
      // Process files sequentially to avoid overwhelming the database
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i], i);
      }
      
      toast({
        title: 'Procesamiento completado',
        description: 'Los archivos han sido procesados.',
      });
      
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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: FileProcessingState['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>;
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
          ) : null}
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
              
              {(state.status === 'processing' || state.status === 'completed' || state.status === 'error') && (
                <CardContent className="pt-0">
                  <Progress value={state.progress} className="mb-2" />
                  
                  {state.result && (
                    <div className="space-y-2">
                      {state.result.success && (
                        <p className="text-sm text-green-600">
                          ✓ {state.result.recordsProcessed} registros procesados exitosamente
                        </p>
                      )}
                      
                      {state.result.errors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-1">Errores:</p>
                          <ul className="text-xs text-red-600 space-y-1">
                            {state.result.errors.slice(0, 5).map((error, i) => (
                              <li key={i}>• {error}</li>
                            ))}
                            {state.result.errors.length > 5 && (
                              <li>• ... y {state.result.errors.length - 5} errores más</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {state.error && (
                    <p className="text-sm text-red-600">
                      Error: {state.error}
                    </p>
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