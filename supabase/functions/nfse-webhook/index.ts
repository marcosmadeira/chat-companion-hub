import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { invoice_id, source, event_type, payload, status } = body;

    if (!invoice_id || !event_type) {
      return new Response(
        JSON.stringify({ error: "invoice_id and event_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert event
    const { error: eventError } = await supabase.from("nfse_events").insert({
      invoice_id,
      source: source || "django",
      event_type,
      payload: payload || {},
    });

    if (eventError) {
      console.error("Error inserting event:", eventError);
      return new Response(
        JSON.stringify({ error: "Failed to insert event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update invoice status if provided
    if (status) {
      const updateData: Record<string, string> = { status };
      if (payload?.numero_nfse) updateData.numero_nfse = payload.numero_nfse;
      if (payload?.codigo_verificacao) updateData.codigo_verificacao = payload.codigo_verificacao;
      if (payload?.xml_retorno_url) updateData.xml_retorno_url = payload.xml_retorno_url;

      const { error: updateError } = await supabase
        .from("nfse_invoices")
        .update(updateData)
        .eq("id", invoice_id);

      if (updateError) {
        console.error("Error updating invoice:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
