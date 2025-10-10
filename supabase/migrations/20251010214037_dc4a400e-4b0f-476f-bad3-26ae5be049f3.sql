-- Update the cron job to use SERVICE_ROLE_KEY for proper permissions
SELECT cron.unschedule('counteros-healthcheck');

SELECT cron.schedule(
  'counteros-healthcheck',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://syusqcaslrxdkwaqsdks.supabase.co/functions/v1/healthcheck',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);