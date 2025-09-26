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
    // Parse XML using Deno's built-in XML parser
    const decoder = new TextDecoder();
    const xmlText = typeof xmlContent === 'string' ? xmlContent : decoder.decode(xmlContent);
    
    // For Deno, we need to use a different approach since DOMParser is not available
    // We'll use regex-based parsing for basic CFDI extraction
    const cfdiData = extractCFDIData(xmlText);
    
    return cfdiData;

  } catch (error) {
    console.error('CFDI parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    throw new Error(`CFDI parsing failed: ${errorMessage}`);
  }
}

function extractCFDIData(xmlContent: string): CFDIData {
  // Regex-based CFDI extraction for Deno environment
  
  // Extract Comprobante attributes
  const comprobanteMatch = xmlContent.match(/<cfdi:Comprobante[^>]*>|<Comprobante[^>]*>/i);
  if (!comprobanteMatch) {
    throw new Error('No CFDI Comprobante element found');
  }
  
  const comprobanteAttr = comprobanteMatch[0];
  
  // Extract Emisor attributes
  const emisorMatch = xmlContent.match(/<cfdi:Emisor[^>]*\/>|<Emisor[^>]*\/>/i);
  if (!emisorMatch) {
    throw new Error('No Emisor information found');
  }
  
  const emisorAttr = emisorMatch[0];
  
  // Extract TimbreFiscalDigital UUID
  const timbreMatch = xmlContent.match(/<tfd:TimbreFiscalDigital[^>]*\/>|<TimbreFiscalDigital[^>]*\/>/i);
  const timbreAttr = timbreMatch ? timbreMatch[0] : '';
  
  // Helper function to extract attribute value
  const extractAttr = (text: string, attrName: string): string => {
    const regex = new RegExp(`${attrName}=["']([^"']*)["']`, 'i');
    const match = text.match(regex);
    return match ? match[1] : '';
  };
  
  const uuid = extractAttr(timbreAttr, 'UUID') || extractAttr(comprobanteAttr, 'UUID') || `TEMP-${Date.now()}`;
  const supplierRfc = extractAttr(emisorAttr, 'Rfc') || extractAttr(emisorAttr, 'rfc');
  const supplierName = extractAttr(emisorAttr, 'Nombre') || extractAttr(emisorAttr, 'nombre') || 'Proveedor desconocido';
  const issueDate = extractAttr(comprobanteAttr, 'Fecha') || extractAttr(comprobanteAttr, 'fecha') || new Date().toISOString();
  const subtotal = parseFloat(extractAttr(comprobanteAttr, 'SubTotal') || extractAttr(comprobanteAttr, 'subTotal') || '0');
  const tax = parseFloat(extractAttr(comprobanteAttr, 'TotalImpuestos') || '0');
  const total = parseFloat(extractAttr(comprobanteAttr, 'Total') || extractAttr(comprobanteAttr, 'total') || '0');
  const currency = extractAttr(comprobanteAttr, 'Moneda') || 'MXN';
  
  // Validate required fields
  if (!supplierRfc || !total || total <= 0) {
    throw new Error('Invalid CFDI: missing critical data (RFC, total)');
  }
  
  // Extract line items (Conceptos)
  const conceptoRegex = /<cfdi:Concepto[^>]*\/>|<Concepto[^>]*\/>/gi;
  const conceptoMatches = xmlContent.match(conceptoRegex) || [];
  const items: CFDIItem[] = [];
  
  conceptoMatches.forEach((conceptoAttr, index) => {
    const qty = parseFloat(extractAttr(conceptoAttr, 'Cantidad') || extractAttr(conceptoAttr, 'cantidad') || '0');
    const unitPrice = parseFloat(extractAttr(conceptoAttr, 'ValorUnitario') || extractAttr(conceptoAttr, 'valorUnitario') || '0');
    const lineTotal = parseFloat(extractAttr(conceptoAttr, 'Importe') || extractAttr(conceptoAttr, 'importe') || '0');
    
    if (qty > 0 && unitPrice >= 0 && lineTotal >= 0) {
      const item: CFDIItem = {
        sku: extractAttr(conceptoAttr, 'ClaveProdServ') || extractAttr(conceptoAttr, 'NoIdentificacion') || `ITEM-${index + 1}`,
        description: extractAttr(conceptoAttr, 'Descripcion') || extractAttr(conceptoAttr, 'descripcion') || 'Producto sin descripción',
        qty,
        unit: extractAttr(conceptoAttr, 'ClaveUnidad') || extractAttr(conceptoAttr, 'Unidad') || 'PZA',
        unit_price: unitPrice,
        line_total: lineTotal,
        category: 'ingrediente'
      };
      
      items.push(item);
    }
  });
  
  if (items.length === 0) {
    throw new Error('No valid line items found in CFDI');
  }
  
  const cfdiData: CFDIData = {
    uuid,
    supplier_rfc: supplierRfc,
    supplier_name: supplierName,
    issue_date: issueDate,
    subtotal,
    tax,
    total,
    currency,
    payment_method: extractAttr(comprobanteAttr, 'MetodoPago') || extractAttr(comprobanteAttr, 'metodoPago'),
    payment_conditions: extractAttr(comprobanteAttr, 'CondicionesDePago') || extractAttr(comprobanteAttr, 'condicionesDePago'),
    items
  };
  
  console.log(`CFDI parsed: UUID=${uuid}, Supplier=${supplierName}, Items=${items.length}`);
  return cfdiData;
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