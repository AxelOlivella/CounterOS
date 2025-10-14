import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Store {
  name: string;
  location: string;
  concept: string;
  targetFoodCost: number;
}

interface FacturaConcepto {
  descripcion: string;
  categoria: string;
  importe: number;
}

interface Factura {
  fecha: string;
  folio?: string;
  uuid: string;
  moneda?: string;
  proveedor: {
    nombre: string;
    rfc?: string;
  };
  conceptos: FacturaConcepto[];
}

interface Venta {
  fecha: string;
  tienda: string;
  montoTotal: number;
  numTransacciones?: number;
}

interface OnboardingRequest {
  tenantId: string;
  stores: Store[];
  facturas: Factura[];
  ventas: Venta[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: OnboardingRequest = await req.json();
    const { tenantId, stores, facturas, ventas } = body;

    console.log('[TRANSACTIONAL] Starting onboarding save', {
      tenantId,
      numStores: stores.length,
      numFacturas: facturas.length,
      numVentas: ventas.length
    });

    // ═══════════════════════════════════════════════════════════════════════
    // EJECUTAR TODO EN UNA TRANSACCIÓN SQL
    // ═══════════════════════════════════════════════════════════════════════
    
    const { data, error } = await supabase.rpc('save_onboarding_transaction', {
      p_tenant_id: tenantId,
      p_stores: stores,
      p_facturas: facturas,
      p_ventas: ventas
    });

    if (error) {
      console.error('[TRANSACTIONAL] Transaction failed', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          details: error
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[TRANSACTIONAL] Transaction completed successfully', data);

    return new Response(
      JSON.stringify({
        success: true,
        stores: data.stores,
        summary: data.summary
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[TRANSACTIONAL] Unexpected error', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
