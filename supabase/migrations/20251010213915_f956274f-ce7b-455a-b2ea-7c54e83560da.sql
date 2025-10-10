-- Update the cron job with the new rotated ANON_KEY
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
        'Authorization', 'Bearer sb_publishable_pB8t7_YT9Ifrd3FQyOUMIA_mYvGVkLl'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);