-- Agregar ON DELETE CASCADE a foreign keys de compras y ventas
-- para que el rollback de stores funcione correctamente

-- Primero, verificar y recrear foreign keys de compras
DO $$ 
BEGIN
  -- Drop existing foreign key si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'compras_store_id_fkey' 
    AND table_name = 'compras'
  ) THEN
    ALTER TABLE public.compras DROP CONSTRAINT compras_store_id_fkey;
  END IF;
  
  -- Crear foreign key con ON DELETE CASCADE
  ALTER TABLE public.compras
    ADD CONSTRAINT compras_store_id_fkey
    FOREIGN KEY (store_id)
    REFERENCES public.stores(store_id)
    ON DELETE CASCADE;
    
  RAISE NOTICE 'compras foreign key recreated with CASCADE';
END $$;

-- Hacer lo mismo para ventas
DO $$ 
BEGIN
  -- Drop existing foreign key si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ventas_store_id_fkey' 
    AND table_name = 'ventas'
  ) THEN
    ALTER TABLE public.ventas DROP CONSTRAINT ventas_store_id_fkey;
  END IF;
  
  -- Crear foreign key con ON DELETE CASCADE
  ALTER TABLE public.ventas
    ADD CONSTRAINT ventas_store_id_fkey
    FOREIGN KEY (store_id)
    REFERENCES public.stores(store_id)
    ON DELETE CASCADE;
    
  RAISE NOTICE 'ventas foreign key recreated with CASCADE';
END $$;

-- Hacer lo mismo para food_cost_daily
DO $$ 
BEGIN
  -- Drop existing foreign key si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'food_cost_daily_store_id_fkey' 
    AND table_name = 'food_cost_daily'
  ) THEN
    ALTER TABLE public.food_cost_daily DROP CONSTRAINT food_cost_daily_store_id_fkey;
  END IF;
  
  -- Crear foreign key con ON DELETE CASCADE
  ALTER TABLE public.food_cost_daily
    ADD CONSTRAINT food_cost_daily_store_id_fkey
    FOREIGN KEY (store_id)
    REFERENCES public.stores(store_id)
    ON DELETE CASCADE;
    
  RAISE NOTICE 'food_cost_daily foreign key recreated with CASCADE';
END $$;