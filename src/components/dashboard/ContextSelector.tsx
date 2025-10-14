import { useState, useEffect } from 'react';
import { useAllBrands } from '@/hooks/useEnterpriseHierarchy';
import { useStores } from '@/hooks/useStores';

interface Context {
  level: 'corporate' | 'brand' | 'store';
  brandId?: string;
  storeId?: string;
}

interface ContextSelectorProps {
  onChange: (context: Context) => void;
}

export default function ContextSelector({ onChange }: ContextSelectorProps) {
  const [level, setLevel] = useState<'corporate' | 'brand' | 'store'>('corporate');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedStore, setSelectedStore] = useState<string | undefined>();

  const { data: brands = [] } = useAllBrands();
  const { data: stores = [] } = useStores();

  // Filter stores by selected brand (manually since hook doesn't support filtering yet)
  const filteredStores = selectedBrand
    ? stores.filter(s => {
        // TODO: Esto requiere que stores tenga brand_id, por ahora mostramos todos
        return true;
      })
    : stores;

  // Notify parent of context changes
  useEffect(() => {
    onChange({
      level,
      brandId: selectedBrand,
      storeId: selectedStore
    });
  }, [level, selectedBrand, selectedStore, onChange]);

  const handleLevelChange = (newLevel: 'corporate' | 'brand' | 'store') => {
    setLevel(newLevel);
    if (newLevel === 'corporate') {
      setSelectedBrand(undefined);
      setSelectedStore(undefined);
    } else if (newLevel === 'brand') {
      setSelectedStore(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background/5 rounded-lg border border-border mb-6">
      {/* Level selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleLevelChange('corporate')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            level === 'corporate'
              ? 'bg-accent text-accent-foreground shadow-lg'
              : 'bg-background/5 text-muted-foreground hover:bg-background/10 hover:text-foreground'
          }`}
        >
          📊 Grupo Completo
        </button>

        <button
          onClick={() => handleLevelChange('brand')}
          disabled={!brands || brands.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
            (level === 'brand' || level === 'store')
              ? 'bg-accent text-accent-foreground shadow-lg'
              : 'bg-background/5 text-muted-foreground hover:bg-background/10 hover:text-foreground'
          }`}
        >
          🏷️ Por Marca
        </button>

        {(level === 'brand' || level === 'store') && selectedBrand && (
          <button
            onClick={() => handleLevelChange('store')}
            disabled={!filteredStores || filteredStores.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              level === 'store'
                ? 'bg-accent text-accent-foreground shadow-lg'
                : 'bg-background/5 text-muted-foreground hover:bg-background/10 hover:text-foreground'
            }`}
          >
            🏪 Por Tienda
          </button>
        )}
      </div>

      {/* Brand and Store dropdowns */}
      {(level === 'brand' || level === 'store') && brands && brands.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          {/* Brand selector */}
          <select
            value={selectedBrand || ''}
            onChange={(e) => {
              setSelectedBrand(e.target.value || undefined);
              setSelectedStore(undefined);
            }}
            className="px-4 py-2 rounded-lg bg-background/5 border border-border text-foreground text-sm min-w-[200px]"
          >
            <option value="">Seleccionar marca...</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name} - {brand.concept} ({brand.store_count} tiendas)
              </option>
            ))}
          </select>

          {/* Store selector */}
          {level === 'store' && selectedBrand && filteredStores.length > 0 && (
            <>
              <span className="text-muted-foreground">→</span>
              <select
                value={selectedStore || ''}
                onChange={(e) => setSelectedStore(e.target.value || undefined)}
                className="px-4 py-2 rounded-lg bg-background/5 border border-border text-foreground text-sm min-w-[200px]"
              >
                <option value="">Todas las tiendas</option>
                {filteredStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      {(selectedBrand || selectedStore) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Vista actual:</span>
          <div className="flex items-center gap-2">
            {selectedBrand && (
              <span className="px-2 py-1 bg-background/10 rounded text-foreground">
                {brands?.find(b => b.id === selectedBrand)?.name}
              </span>
            )}
            {selectedStore && (
              <>
                <span>→</span>
                <span className="px-2 py-1 bg-background/10 rounded text-foreground">
                  {stores?.find(s => s.id === selectedStore)?.name}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
