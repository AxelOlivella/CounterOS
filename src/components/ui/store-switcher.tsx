import { useState } from 'react';
import { Check, ChevronsUpDown, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTenant } from '@/contexts/TenantContext';
import { useStoreSelection } from '@/hooks/useStoreSelection';

export function StoreSwitcher() {
  const [open, setOpen] = useState(false);
  const { tenant } = useTenant();
  const { stores, selectedStoreId, setSelectedStoreId, isConsolidatedView } = useStoreSelection();

  const allStores = [
    { store_id: 'all', name: 'Todas las tiendas', code: 'ALL' },
    ...stores
  ];

  const selectedStore = allStores.find(store => store.store_id === selectedStoreId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[240px] justify-between bg-card border-border"
        >
          <div className="flex items-center gap-2">
            <div 
              className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              {tenant?.name?.charAt(0) || 'C'}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {tenant?.name ? `${tenant.name} OS` : 'Crepas OS'}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedStore?.name || 'Seleccionar tienda'}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar tienda..." />
          <CommandList>
            <CommandEmpty>No se encontraron tiendas.</CommandEmpty>
            <CommandGroup>
              {allStores.map((store) => (
                <CommandItem
                  key={store.store_id}
                  value={store.store_id}
                  onSelect={() => {
                    setSelectedStoreId(store.store_id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{store.name}</span>
                      {store.code !== 'ALL' && (
                        <span className="text-xs text-muted-foreground">
                          Código: {store.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selectedStoreId === store.store_id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}