import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, FileText, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  type: 'xml' | 'csv';
  data: any;
  className?: string;
}

export function FilePreview({ type, data, className }: FilePreviewProps) {
  if (type === 'xml') {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Facturas XML (CFDI)
              </h3>
              <Badge variant={data.allValid ? "default" : "destructive"}>
                {data.allValid ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {data.allValid ? 'Todas válidas' : 'Errores detectados'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Facturas</p>
                <p className="text-lg font-bold text-foreground">{data.totalFacturas}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monto Total</p>
                <p className="text-lg font-bold text-foreground">
                  ${data.totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Lista de facturas con errores */}
            {!data.allValid && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-medium text-destructive">Facturas con errores:</p>
                <div className="space-y-1">
                  {data.results.filter((r: any) => !r.valid).map((r: any, i: number) => (
                    <div key={i} className="text-xs bg-destructive/5 rounded p-2">
                      <p className="font-medium text-destructive">{r.fileName}</p>
                      <p className="text-muted-foreground">{r.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview de facturas válidas (primeras 3) */}
            {data.allValid && data.results.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-medium text-muted-foreground">Vista previa:</p>
                <div className="space-y-1">
                  {data.results.slice(0, 3).map((r: any, i: number) => (
                    <div key={i} className="text-xs bg-muted/50 rounded p-2 flex justify-between">
                      <div>
                        <p className="font-medium text-foreground">{r.preview.proveedor}</p>
                        <p className="text-muted-foreground">{new Date(r.preview.fecha).toLocaleDateString()}</p>
                      </div>
                      <p className="font-mono font-medium text-foreground">
                        ${r.preview.total.toLocaleString('es-MX')}
                      </p>
                    </div>
                  ))}
                  {data.results.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      ... y {data.results.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // CSV Preview
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Ventas CSV
            </h3>
            <Badge variant={data.valid ? "default" : "destructive"}>
              {data.valid ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {data.valid ? 'Válido' : 'Con errores'}
            </Badge>
          </div>

          {data.valid && data.preview && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Ventas</p>
                  <p className="text-lg font-bold text-foreground">
                    ${data.preview.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registros</p>
                  <p className="text-lg font-bold text-foreground">{data.preview.numRegistros}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-sm font-medium text-foreground">
                    {data.preview.fechaInicio.toLocaleDateString()} - {data.preview.fechaFin.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Promedio Diario</p>
                  <p className="text-sm font-medium text-foreground">
                    ${data.preview.ventaPromedioDiaria.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Tiendas */}
              {data.preview.tiendas.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tiendas:</p>
                  <div className="flex flex-wrap gap-1">
                    {data.preview.tiendas.map((tienda: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tienda}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview de primeras filas */}
              {data.preview.primeras5Filas && data.preview.primeras5Filas.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium text-muted-foreground">Primeras 5 filas:</p>
                  <div className="space-y-1">
                    {data.preview.primeras5Filas.map((fila: any, i: number) => (
                      <div key={i} className="text-xs bg-muted/50 rounded p-2 flex justify-between">
                        <div>
                          <span className="text-muted-foreground">{fila.fecha}</span>
                          {fila.tienda && (
                            <span className="ml-2 text-foreground">• {fila.tienda}</span>
                          )}
                        </div>
                        <span className="font-mono font-medium text-foreground">
                          ${fila.monto.toLocaleString('es-MX')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Errores */}
          {!data.valid && data.errors && data.errors.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium text-destructive">Errores encontrados:</p>
              <div className="space-y-1">
                {data.errors.map((error: string, i: number) => (
                  <div key={i} className="text-xs bg-destructive/5 rounded p-2 text-destructive">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {data.warnings && data.warnings.length > 0 && (
            <div className="space-y-1 mt-2">
              {data.warnings.map((warning: string, i: number) => (
                <div key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
