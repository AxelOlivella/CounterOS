-- Apply missing GRANT so SELECT can work with RLS
ALTER TABLE public.food_cost_daily ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.food_cost_daily TO authenticated;