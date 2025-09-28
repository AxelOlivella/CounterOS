import React from 'react';
import { useOfflineStatus } from '@/lib/offline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Loader2, Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({ className, showDetails = false }: OfflineIndicatorProps) {
  const status = useOfflineStatus();

  if (status.isOnline && status.pendingOperations === 0) {
    return null; // Don't show anything when everything is fine
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Connection Status */}
      <Badge 
        variant={status.isOnline ? 'default' : 'destructive'}
        className="flex items-center gap-1"
      >
        {status.isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {status.isOnline ? 'En línea' : 'Sin conexión'}
      </Badge>

      {/* Pending Operations */}
      {status.pendingOperations > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1 bg-warning/10 text-warning border-warning/20">
          {status.syncInProgress ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CloudOff className="h-3 w-3" />
          )}
          {status.pendingOperations} pendiente{status.pendingOperations !== 1 ? 's' : ''}
        </Badge>
      )}

      {/* Sync Status */}
      {status.syncInProgress && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sincronizando...
        </Badge>
      )}

      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {status.isOnline 
            ? 'Datos sincronizados automáticamente'
            : 'Los datos se guardarán cuando vuelva la conexión'
          }
        </div>
      )}
    </div>
  );
}

export function OfflineStatusCard() {
  const status = useOfflineStatus();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Estado de conexión</h3>
        <div className="flex items-center gap-2">
          {status.isOnline ? (
            <Cloud className="h-4 w-4 text-success" />
          ) : (
            <CloudOff className="h-4 w-4 text-warning" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Conexión:</span>
          <span className={status.isOnline ? 'text-success' : 'text-warning'}>
            {status.isOnline ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Operaciones pendientes:</span>
          <span className={status.pendingOperations > 0 ? 'text-warning' : 'text-muted-foreground'}>
            {status.pendingOperations}
          </span>
        </div>

        {status.syncInProgress && (
          <div className="flex justify-between text-sm">
            <span>Estado:</span>
            <span className="text-info flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Sincronizando...
            </span>
          </div>
        )}

        {status.lastSync && (
          <div className="flex justify-between text-sm">
            <span>Última sincronización:</span>
            <span className="text-muted-foreground">
              {status.lastSync.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {!status.isOnline && (
        <div className="mt-3 p-2 bg-warning/10 rounded text-xs text-warning">
          Sin conexión a internet. Los datos se guardarán localmente y se sincronizarán automáticamente cuando vuelva la conexión.
        </div>
      )}
    </div>
  );
}