import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CFDIProcessRequest {
  xmlContent: string;
  tenantId: string;
  storeId?: string;
}

interface CFDIData {
  uuid: string;
  supplier_rfc: string;
  supplier_name: string;
  issue_date: string;
  subtotal: number;
  tax: number;
  total: number;
  items: CFDIItem[];
  currency: string;
  payment_method?: string;
  payment_conditions?: string;
}

interface CFDIItem {
  sku: string;
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
  line_total: number;
  category: string;
  tax_amount?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing CFDI with external API validation');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { xmlContent, tenantId, storeId }: CFDIProcessRequest = await req.json();
    
    if (!xmlContent || !tenantId) {
      throw new Error('Missing required fields: xmlContent, tenantId');
    }

    // Step 1: Parse and validate CFDI XML with external API
    const cfdiData = await parseAndValidateCFDI(xmlContent);
    console.log('CFDI parsed successfully:', cfdiData.uuid);

    // Step 2: Get or create default store if not provided
    let targetStoreId = storeId;
    if (!targetStoreId) {
      const { data: stores } = await supabaseClient
        .from('stores')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .limit(1);
      
      if (!stores || stores.length === 0) {
        throw new Error('No active stores found for this tenant');
      }
      targetStoreId = stores[0].id;
    }

    // Step 3: Check for duplicate UUID
    const { data: existingPurchase } = await supabaseClient
      .from('purchases')
      .select('id')
      .eq('invoice_uuid', cfdiData.uuid)
      .eq('tenant_id', tenantId)
      .single();

    if (existingPurchase) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'CFDI already exists in database',
          duplicate: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Insert purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('purchases')
      .insert({
        tenant_id: tenantId,
        store_id: targetStoreId,
        invoice_uuid: cfdiData.uuid,
        supplier_rfc: cfdiData.supplier_rfc,
        supplier_name: cfdiData.supplier_name,
        issue_date: cfdiData.issue_date.split('T')[0], // Extract date part
        subtotal: cfdiData.subtotal,
        tax: cfdiData.tax,
        total: cfdiData.total,
        xml_metadata: {
          currency: cfdiData.currency,
          payment_method: cfdiData.payment_method,
          payment_conditions: cfdiData.payment_conditions,
          items_count: cfdiData.items.length,
          processed_via_api: true,
          processed_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error inserting purchase:', purchaseError);
      throw new Error(`Failed to save purchase: ${purchaseError.message}`);
    }

    // Step 5: Insert purchase items
    const purchaseItems = cfdiData.items.map(item => ({
      tenant_id: tenantId,
      purchase_id: purchase.id,
      sku: item.sku,
      description: item.description.substring(0, 500), // Limit description length
      qty: item.qty,
      unit: item.unit,
      unit_price: item.unit_price,
      line_total: item.line_total,
      category: categorizeCFDIItem(item.description, item.sku)
    }));

    const { error: itemsError } = await supabaseClient
      .from('purchase_items')
      .insert(purchaseItems);

    if (itemsError) {
      console.error('Error inserting purchase items:', itemsError);
      // Don't fail the whole operation for items error, just log it
    }

    console.log(`CFDI processed successfully: ${cfdiData.items.length} items saved`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          purchaseId: purchase.id,
          uuid: cfdiData.uuid,
          supplier: cfdiData.supplier_name,
          total: cfdiData.total,
          itemsCount: cfdiData.items.length,
          processedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing CFDI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process CFDI';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function parseAndValidateCFDI(xmlContent: string): Promise<CFDIData> {
  try {
    const apiKey = Deno.env.get('CFDI_API_KEY');
    if (!apiKey) {
      throw new Error('CFDI_API_KEY not configured');
    }

    console.log('Calling external CFDI API for validation and parsing');
    
    // Call external CFDI API (assuming Facturapi or similar service)
    const response = await fetch('https://api.facturapi.io/v2/cfdi/parse', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/xml',
      },
      body: xmlContent
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CFDI API error:', response.status, errorText);
      throw new Error(`CFDI API failed: ${response.status} - ${errorText}`);
    }

    const apiResult = await response.json();
    console.log('CFDI API response received:', apiResult.uuid || 'no UUID');
    
    // Transform API response to our CFDIData format
    const cfdiData = transformApiResponseToCFDI(apiResult);
    
    return cfdiData;

  } catch (error) {
    console.error('CFDI parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    throw new Error(`CFDI parsing failed: ${errorMessage}`);
  }
}

function transformApiResponseToCFDI(apiResult: any): CFDIData {
  // Transform the API response format to our CFDIData interface
  const items: CFDIItem[] = apiResult.items?.map((item: any, index: number) => ({
    sku: item.product?.product_key || `ITEM-${index + 1}`,
    description: item.product?.description || 'Producto sin descripción',
    qty: item.quantity || 0,
    unit: item.product?.unit_key || 'PZA',
    unit_price: item.product?.price || 0,
    line_total: (item.quantity || 0) * (item.product?.price || 0),
    category: categorizeCFDIItem(item.product?.description || '', item.product?.product_key || '')
  })) || [];

  // Calculate totals if not provided
  let subtotal = 0;
  let tax = 0;
  let total = apiResult.total || 0;

  if (items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    // Calculate tax based on items if available
    if (apiResult.items?.[0]?.product?.taxes) {
      const taxRate = apiResult.items[0].product.taxes[0]?.rate || 0.16;
      tax = subtotal * taxRate;
    }
  }

  return {
    uuid: apiResult.uuid || `TEMP-${Date.now()}`,
    supplier_rfc: apiResult.issuer_info?.tax_id || 'RFC000000000',
    supplier_name: apiResult.issuer_info?.legal_name || 'Proveedor desconocido',
    issue_date: apiResult.stamp?.date || new Date().toISOString(),
    subtotal,
    tax,
    total,
    currency: apiResult.currency || 'MXN',
    payment_method: apiResult.payment_method,
    payment_conditions: apiResult.payment_form,
    items
  };
}

function categorizeCFDIItem(description: string, sku: string): string {
  const desc = description.toLowerCase();
  const skuLower = sku.toLowerCase();
  
  // Food ingredients
  if (desc.includes('harina') || desc.includes('azucar') || desc.includes('leche') || 
      desc.includes('huevo') || desc.includes('mantequilla') || desc.includes('aceite') ||
      desc.includes('sal') || desc.includes('polvo') || desc.includes('vainilla') ||
      desc.includes('chocolate') || desc.includes('fruta') || desc.includes('carne') ||
      desc.includes('pollo') || desc.includes('verdura') || desc.includes('vegetal')) {
    return 'ingrediente';
  }
  
  // Packaging
  if (desc.includes('bolsa') || desc.includes('envase') || desc.includes('tapa') || 
      desc.includes('vaso') || desc.includes('servilleta') || desc.includes('empaque') ||
      desc.includes('caja') || desc.includes('papel')) {
    return 'empaque';
  }
  
  // Cleaning supplies
  if (desc.includes('detergente') || desc.includes('jabon') || desc.includes('limpiador') ||
      desc.includes('desinfectante') || desc.includes('cloro') || desc.includes('toalla')) {
    return 'limpieza';
  }
  
  // Equipment/maintenance
  if (desc.includes('equipo') || desc.includes('maquina') || desc.includes('herramienta') ||
      desc.includes('repuesto') || desc.includes('mantenimiento') || desc.includes('reparacion')) {
    return 'equipo';
  }
  
  // Default to ingredients for food businesses
  return 'ingrediente';
}