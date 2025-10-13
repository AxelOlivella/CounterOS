import { StoreFormData, CONCEPT_LABELS } from "@/lib/schemas/storeSchema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Store } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StoreListProps {
  stores: StoreFormData[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function StoreList({ stores, onEdit, onDelete }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">
          Aún no has agregado tiendas
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Completa el formulario arriba para agregar tu primera tienda
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">
        Tiendas agregadas ({stores.length})
      </h3>
      {stores.map((store, index) => (
        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {index + 1}. {store.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                📍 {store.location}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs">
                  {CONCEPT_LABELS[store.concept]}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                  FC Meta: {store.targetFoodCost}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(index)}
                title="Editar tienda"
              >
                <Pencil className="w-4 h-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Eliminar tienda"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar tienda?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará "{store.name}" de la lista. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(index)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
