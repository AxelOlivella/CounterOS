import { z } from 'zod';

export const storeFormSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  location: z.string()
    .min(3, 'La ubicación es requerida')
    .max(200, 'Máximo 200 caracteres')
    .trim(),
  concept: z.enum([
    'fast_casual',
    'qsr',
    'casual_dining',
    'fine_dining',
    'frozen_yogurt',
    'cafeteria',
    'otro'
  ], {
    errorMap: () => ({ message: 'Selecciona un concepto válido' })
  }),
  targetFoodCost: z.number()
    .min(5, 'Mínimo 5%')
    .max(80, 'Máximo 80%')
    .default(28.5)
});

export type StoreFormData = z.infer<typeof storeFormSchema>;

export const CONCEPT_LABELS: Record<StoreFormData['concept'], string> = {
  fast_casual: 'Fast Casual',
  qsr: 'QSR (Quick Service)',
  casual_dining: 'Casual Dining',
  fine_dining: 'Fine Dining',
  frozen_yogurt: 'Frozen Yogurt / Postres',
  cafeteria: 'Cafetería',
  otro: 'Otro'
};
