import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Demo users to create
    const demoUsers = [
      { email: 'moyo@demo.com', password: 'demo123', name: 'Admin Moyo' },
      { email: 'nutrisa@demo.com', password: 'demo123', name: 'Admin Nutrisa' },
      { email: 'crepas@demo.com', password: 'demo123', name: 'Admin Crepas' }
    ]

    const results = []

    for (const user of demoUsers) {
      // Try to create user directly (will fail if already exists)
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: user.name
        }
      })

      if (error) {
        if (error.message.includes('already_registered')) {
          results.push({ email: user.email, status: 'already_exists' })
        } else {
          console.error(`Error creating user ${user.email}:`, error)
          results.push({ email: user.email, status: 'error', error: error.message })
        }
      } else {
        results.push({ email: user.email, status: 'created', id: data.user.id })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Error in create-demo-users function:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})