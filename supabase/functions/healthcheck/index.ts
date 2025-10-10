// Healthcheck edge function to prevent database hibernation
// Runs every 5 minutes via pg_cron

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Perform lightweight query to keep database active
    // Query the tenants table (lightweight and always exists)
    const { data, error } = await supabase
      .from('tenants')
      .select('tenant_id')
      .limit(1);

    if (error) {
      console.error('Healthcheck query error:', error);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: error.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Healthcheck successful:', {
      timestamp: new Date().toISOString(),
      recordsFound: data?.length || 0
    });

    return new Response(
      JSON.stringify({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'active',
        recordsQueried: data?.length || 0
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Healthcheck error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

