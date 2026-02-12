
-- Tabela de notas fiscais de serviço (referências ao Django)
CREATE TABLE public.nfse_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  external_id TEXT, -- ID no Django backend
  numero_nfse TEXT,
  codigo_verificacao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'autorizada', 'cancelada', 'rejeitada', 'erro')),
  
  -- Prestador
  prestador_cnpj TEXT NOT NULL,
  prestador_razao_social TEXT NOT NULL,
  prestador_inscricao_municipal TEXT,
  
  -- Tomador
  tomador_cpf_cnpj TEXT NOT NULL,
  tomador_razao_social TEXT NOT NULL,
  tomador_email TEXT,
  tomador_endereco TEXT,
  tomador_municipio TEXT,
  tomador_uf TEXT,
  tomador_cep TEXT,
  
  -- Serviço
  codigo_servico TEXT NOT NULL,
  discriminacao TEXT NOT NULL,
  valor_servicos NUMERIC(15,2) NOT NULL,
  valor_deducoes NUMERIC(15,2) DEFAULT 0,
  valor_iss NUMERIC(15,2) DEFAULT 0,
  aliquota_iss NUMERIC(5,4) DEFAULT 0,
  iss_retido BOOLEAN DEFAULT false,
  codigo_municipio TEXT,
  
  -- XMLs (URLs do storage ou referências)
  xml_envio_url TEXT,
  xml_retorno_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de eventos/webhook log
CREATE TABLE public.nfse_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.nfse_invoices(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('prefeitura', 'django', 'sistema')),
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.nfse_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON public.nfse_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON public.nfse_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON public.nfse_invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view events of own invoices"
  ON public.nfse_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.nfse_invoices
    WHERE nfse_invoices.id = nfse_events.invoice_id
    AND nfse_invoices.user_id = auth.uid()
  ));

-- Service role pode inserir eventos via webhook
CREATE POLICY "Service role can insert events"
  ON public.nfse_events FOR INSERT
  WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_nfse_invoices_updated_at
  BEFORE UPDATE ON public.nfse_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX idx_nfse_invoices_user_id ON public.nfse_invoices(user_id);
CREATE INDEX idx_nfse_invoices_status ON public.nfse_invoices(status);
CREATE INDEX idx_nfse_events_invoice_id ON public.nfse_events(invoice_id);
