import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Store, Building2, TrendingUp } from 'lucide-react';
import { useStoreSelection } from '@/hooks/useStoreSelection';

interface StoreSelectorProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const StoreSelector = ({ className, size = 'default' }: StoreSelectorProps) => {
  const { stores, selectedStoreId, setSelectedStoreId, isConsolidatedView, loading } = useStoreSelection();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando tiendas...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
        <SelectTrigger className={`w-[200px] ${size === 'sm' ? 'h-8 text-sm' : ''}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {isConsolidatedView ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span>Todas las tiendas</span>
                  <Badge variant="secondary" className="ml-1">
                    {stores.length}
                  </Badge>
                </>
              ) : (
                <>
                  <Store className="h-4 w-4" />
                  <span>{stores.find(s => s.store_id === selectedStoreId)?.name}</span>
                </>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Vista Consolidada</span>
              <Badge variant="secondary" className="ml-2">
                {stores.length} tiendas
              </Badge>
            </div>
          </SelectItem>
          
          {stores.length > 0 && (
            <div className="px-2 py-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tiendas individuales
              </div>
            </div>
          )}
          
          {stores.map((store) => (
            <SelectItem key={store.store_id} value={store.store_id}>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                <div>
                  <span className="font-medium">{store.name}</span>
                  {store.city && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {store.city}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};