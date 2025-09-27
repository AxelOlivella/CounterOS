-- Enable RLS on tenants to activate the policy
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
-- Optional: keep inserts restricted to service/admin only (no insert policy for authenticated)
