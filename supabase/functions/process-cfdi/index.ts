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
      .select('purchase_id')
      .eq('cfdi_uuid', cfdiData.uuid)
      .eq('tenant_id', tenantId)
      .maybeSingle();

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
        cfdi_uuid: cfdiData.uuid,
        issue_date: cfdiData.issue_date.split('T')[0],
        supplier_name: cfdiData.supplier_name,
        total_amount: cfdiData.total
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error inserting purchase:', purchaseError);
      throw new Error(`Failed to save purchase: ${purchaseError.message}`);
    }

    // Step 5: Get tenant ingredients for matching
    const { data: ingredients } = await supabaseClient
      .from('ingredients')
      .select('ingredient_id, code, name')
      .eq('tenant_id', tenantId);

    // Step 6: Get existing mappings
    const { data: existingMappings } = await supabaseClient
      .from('cfdi_ingredient_mapping')
      .select('cfdi_sku, ingredient_id')
      .eq('tenant_id', tenantId);

    const mappingDict = new Map(
      existingMappings?.map(m => [m.cfdi_sku, m.ingredient_id]) || []
    );

    // Step 7: Insert purchase items with intelligent mapping
    const purchaseItems = await Promise.all(
      cfdiData.items.map(async (item) => {
        // Check if we have an existing mapping
        let ingredientId = mappingDict.get(item.sku);

        // If no mapping, try to find a match
        if (!ingredientId && ingredients) {
          const match = findBestIngredientMatch(item, ingredients);
          if (match) {
            ingredientId = match.ingredient_id;
            
            // Create new mapping for future use
            await supabaseClient
              .from('cfdi_ingredient_mapping')
              .insert({
                tenant_id: tenantId,
                cfdi_sku: item.sku,
                cfdi_description: item.description.substring(0, 500),
                ingredient_id: match.ingredient_id,
                confidence_score: match.confidence
              })
              .select()
              .single();
            
            console.log(`Auto-mapped ${item.sku} to ${match.name} (confidence: ${match.confidence})`);
          }
        }

        return {
          tenant_id: tenantId,
          purchase_id: purchase.purchase_id,
          cfdi_sku: item.sku,
          cfdi_description: item.description.substring(0, 500),
          ingredient_id: ingredientId || null,
          qty: item.qty,
          unit: item.unit,
          unit_price: item.unit_price,
          amount: item.line_total
        };
      })
    );

    const { error: itemsError } = await supabaseClient
      .from('purchase_items')
      .insert(purchaseItems);

    if (itemsError) {
      console.error('Error inserting purchase items:', itemsError);
      throw new Error(`Failed to save purchase items: ${itemsError.message}`);
    }

    const mappedCount = purchaseItems.filter(i => i.ingredient_id !== null).length;
    console.log(`CFDI processed: ${cfdiData.items.length} items, ${mappedCount} auto-mapped`);

    const mappedCount = purchaseItems.filter(i => i.ingredient_id !== null).length;
    const unmappedCount = purchaseItems.length - mappedCount;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          purchaseId: purchase.purchase_id,
          uuid: cfdiData.uuid,
          supplier: cfdiData.supplier_name,
          total: cfdiData.total,
          itemsCount: cfdiData.items.length,
          mappedCount,
          unmappedCount,
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

interface IngredientMatch {
  ingredient_id: string;
  name: string;
  confidence: number;
}

function findBestIngredientMatch(
  cfdiItem: CFDIItem,
  ingredients: Array<{ ingredient_id: string; code: string; name: string }>
): IngredientMatch | null {
  const itemSku = cfdiItem.sku.toLowerCase().trim();
  const itemDesc = cfdiItem.description.toLowerCase().trim();
  
  let bestMatch: IngredientMatch | null = null;
  let highestScore = 0;

  for (const ingredient of ingredients) {
    const ingCode = ingredient.code.toLowerCase().trim();
    const ingName = ingredient.name.toLowerCase().trim();
    
    let score = 0;

    // Exact SKU match (highest confidence)
    if (itemSku === ingCode) {
      score = 1.0;
    }
    // SKU contains ingredient code or vice versa
    else if (itemSku.includes(ingCode) || ingCode.includes(itemSku)) {
      score = 0.9;
    }
    // Exact name match
    else if (itemDesc === ingName) {
      score = 0.85;
    }
    // Description contains ingredient name
    else if (itemDesc.includes(ingName) && ingName.length > 3) {
      score = 0.7;
    }
    // Ingredient name contains part of description
    else if (ingName.includes(itemDesc) && itemDesc.length > 3) {
      score = 0.65;
    }
    // Word overlap (for multi-word ingredients)
    else {
      const itemWords = itemDesc.split(/\s+/).filter(w => w.length > 3);
      const ingWords = ingName.split(/\s+/).filter(w => w.length > 3);
      const overlap = itemWords.filter(w => ingWords.some(iw => iw.includes(w) || w.includes(iw)));
      
      if (overlap.length > 0) {
        score = 0.5 + (overlap.length / Math.max(itemWords.length, ingWords.length)) * 0.3;
      }
    }

    // Only consider matches with confidence >= 0.6
    if (score > highestScore && score >= 0.6) {
      highestScore = score;
      bestMatch = {
        ingredient_id: ingredient.ingredient_id,
        name: ingredient.name,
        confidence: score
      };
    }
  }

  return bestMatch;
}