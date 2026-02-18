import { supabase } from "@/integrations/supabase/client";

export interface NfseInvoiceData {
  prestador_cnpj: string;
  prestador_razao_social: string;
  prestador_inscricao_municipal?: string;
  prestador_email?: string;
  prestador_endereco?: string;
  prestador_municipio?: string;
  prestador_uf?: string;
  prestador_cep?: string;
  tomador_cpf_cnpj: string;
  tomador_razao_social: string;
  tomador_email?: string;
  tomador_endereco?: string;
  tomador_municipio?: string;
  tomador_uf?: string;
  tomador_cep?: string;
  codigo_servico: string;
  discriminacao: string;
  valor_servicos: number;
  valor_deducoes?: number;
  aliquota_iss?: number;
  iss_retido?: boolean;
  codigo_municipio?: string;
}

export interface NfseInvoice extends NfseInvoiceData {
  id: string;
  user_id: string;
  external_id?: string;
  numero_nfse?: string;
  codigo_verificacao?: string;
  status: string;
  valor_iss?: number;
  xml_envio_url?: string;
  xml_retorno_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NfseEvent {
  id: string;
  invoice_id: string;
  source: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

export async function fetchInvoices(): Promise<NfseInvoice[]> {
  const { data, error } = await supabase
    .from("nfse_invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as NfseInvoice[];
}

export async function fetchInvoiceEvents(invoiceId: string): Promise<NfseEvent[]> {
  const { data, error } = await supabase
    .from("nfse_events")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as NfseEvent[];
}

export async function createInvoice(invoiceData: NfseInvoiceData): Promise<NfseInvoice> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // 1. Save to local DB
  const { data, error } = await supabase
    .from("nfse_invoices")
    .insert({ ...invoiceData, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  const invoice = data as unknown as NfseInvoice;

  // 2. Send to Django backend for processing
  try {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/nfse/emitir/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...invoiceData, lovable_invoice_id: invoice.id }),
    });

    if (response.ok) {
      const result = await response.json();
      // Update with external ID
      if (result.external_id) {
        await supabase
          .from("nfse_invoices")
          .update({ external_id: result.external_id, status: "processando" })
          .eq("id", invoice.id);
      }
    }
  } catch (err) {
    console.warn("Erro ao enviar para backend Django:", err);
    // Invoice is saved locally, Django will process later
  }

  return invoice;
}

export async function cancelInvoice(invoiceId: string): Promise<void> {
  const { error } = await supabase
    .from("nfse_invoices")
    .update({ status: "cancelada" })
    .eq("id", invoiceId);

  if (error) throw error;
}
