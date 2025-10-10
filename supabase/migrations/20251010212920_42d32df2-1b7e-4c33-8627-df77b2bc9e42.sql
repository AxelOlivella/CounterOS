-- Enable extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant permissions to use pg_net
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Unschedule any existing healthcheck job (to avoid duplicates)
SELECT cron.unschedule('counteros-healthcheck') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'counteros-healthcheck'
);

-- Schedule healthcheck to run every 5 minutes to prevent hibernation
-- This keeps the database active and prevents "Restoration in progress" states
SELECT cron.schedule(
  'counteros-healthcheck',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://syusqcaslrxdkwaqsdks.supabase.co/functions/v1/healthcheck',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dXNxY2FzbHJ4ZGt3YXFzZGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTc1MjgsImV4cCI6MjA3NDQ5MzUyOH0.LRh5wNTis6X7bJRMYvzvVEc3ytjjM6wQAM3oYHKd2Us"}'::jsonb,
      body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Verify cron job was created
SELECT jobid, jobname, schedule, command 
FROM cron.job 
WHERE jobname = 'counteros-healthcheck';