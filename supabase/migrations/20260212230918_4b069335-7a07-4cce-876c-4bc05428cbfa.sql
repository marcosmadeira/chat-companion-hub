
-- Tornar a policy de insert em nfse_events mais restritiva
-- Remover a policy permissiva
DROP POLICY "Service role can insert events" ON public.nfse_events;

-- Criar policy que permite insert apenas para authenticated users em seus próprios invoices
-- O webhook usará service role key que bypassa RLS
CREATE POLICY "Authenticated users can insert events on own invoices"
  ON public.nfse_events FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.nfse_invoices
    WHERE nfse_invoices.id = nfse_events.invoice_id
    AND nfse_invoices.user_id = auth.uid()
  ));
