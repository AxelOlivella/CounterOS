import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeFormSchema, type StoreFormData, CONCEPT_LABELS } from "@/lib/schemas/storeSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface StoreFormProps {
  onSubmit: (data: StoreFormData) => void;
  onCancel?: () => void;
  initialData?: StoreFormData;
  submitLabel?: string;
}

export function StoreForm({ onSubmit, onCancel, initialData, submitLabel = "Agregar tienda" }: StoreFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: initialData || {
      name: "",
      location: "",
      concept: "fast_casual",
      targetFoodCost: 28.5,
    },
  });

  const name = watch("name");
  const concept = watch("concept");

  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Store Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre de la tienda <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ej: Portal Centro"
            autoFocus
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          <div className="flex justify-between items-center">
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {name.length}/100
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">
            Ubicación <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            placeholder="Ej: Hermosillo, Sonora"
            {...register("location")}
            className={errors.location ? "border-destructive" : ""}
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>

        {/* Concept */}
        <div className="space-y-2">
          <Label htmlFor="concept">
            Concepto <span className="text-destructive">*</span>
          </Label>
          <Select
            value={concept}
            onValueChange={(value) => setValue("concept", value as StoreFormData['concept'])}
          >
            <SelectTrigger id="concept" className={errors.concept ? "border-destructive" : ""}>
              <SelectValue placeholder="Seleccionar concepto" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {Object.entries(CONCEPT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.concept && (
            <p className="text-sm text-destructive">{errors.concept.message}</p>
          )}
        </div>

        {/* Target Food Cost */}
        <div className="space-y-2">
          <Label htmlFor="targetFoodCost">
            Meta de food cost (%) <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="targetFoodCost"
              type="number"
              step="0.1"
              min="5"
              max="80"
              {...register("targetFoodCost", { valueAsNumber: true })}
              className={errors.targetFoodCost ? "border-destructive" : ""}
            />
            <span className="text-muted-foreground">%</span>
          </div>
          {errors.targetFoodCost && (
            <p className="text-sm text-destructive">{errors.targetFoodCost.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Puedes cambiar esto después
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1"
          >
            {isSubmitting ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
