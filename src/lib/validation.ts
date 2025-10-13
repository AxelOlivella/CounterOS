// Centralized validation schemas using Zod
import { z } from 'zod';

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'El archivo debe ser menor a 5MB')
    .refine(
      (f) => ['text/csv', 'application/vnd.ms-excel', 'text/xml', 'application/xml'].includes(f.type),
      'Solo se permiten archivos CSV y XML'
    ),
  storeId: z.string().uuid('ID de tienda inválido'),
  tenantId: z.string().uuid('ID de tenant inválido')
});

// Store creation validation
export const storeSchema = z.object({
  code: z.string().min(2, 'Código debe tener al menos 2 caracteres').max(10),
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  city: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  target_food_cost_pct: z.number().min(0).max(100).default(28.5)
});

// User profile validation
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'operator', 'viewer']).default('operator')
});

// Inventory count validation
export const inventoryCountSchema = z.object({
  ingredientId: z.string().uuid(),
  storeId: z.string().uuid(),
  physicalQty: z.number().min(0, 'Cantidad no puede ser negativa'),
  unit: z.string().min(1),
  countDate: z.string().datetime(),
  notes: z.string().max(500).optional()
});

// Generic data validation helpers
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
};
