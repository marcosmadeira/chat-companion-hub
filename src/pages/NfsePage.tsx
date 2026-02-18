import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvoices,
  fetchInvoiceEvents,
  createInvoice,
  type NfseInvoiceData,
  type NfseInvoice,
  type NfseEvent,
} from "@/services/nfse-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  ArrowLeft,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Send,
  Activity,
} from "lucide-react";


const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  processando: { label: "Processando", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Loader2 },
  autorizada: { label: "Autorizada", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", color: "bg-muted text-muted-foreground border-muted", icon: XCircle },
  rejeitada: { label: "Rejeitada", color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
  erro: { label: "Erro", color: "bg-destructive/20 text-destructive border-destructive/30", icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pendente;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// ─── Invoice Form ───────────────────────────────────
function InvoiceForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<NfseInvoiceData>({
    prestador_cnpj: "",
    prestador_razao_social: "",
    prestador_inscricao_municipal: "",
    tomador_cpf_cnpj: "",
    tomador_razao_social: "",
    tomador_email: "",
    tomador_endereco: "",
    tomador_municipio: "",
    tomador_uf: "",
    tomador_cep: "",
    codigo_servico: "",
    discriminacao: "",
    valor_servicos: 0,
    valor_deducoes: 0,
    aliquota_iss: 0,
    iss_retido: false,
    codigo_municipio: "",
  });

  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast.success("NFS-e criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["nfse-invoices"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = (field: keyof NfseInvoiceData, value: string | number | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prestador_cnpj || !form.tomador_cpf_cnpj || !form.valor_servicos) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">Nova NFS-e</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prestador */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base">Prestador</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="CNPJ *" value={form.prestador_cnpj} onChange={(e) => update("prestador_cnpj", e.target.value)} className="input-chat" />
            <Input placeholder="Razão Social *" value={form.prestador_razao_social} onChange={(e) => update("prestador_razao_social", e.target.value)} className="input-chat" />
            <Input placeholder="Inscrição Municipal" value={form.prestador_inscricao_municipal} onChange={(e) => update("prestador_inscricao_municipal", e.target.value)} className="input-chat" />
            <Input placeholder="E-mail" value={form.prestador_email} onChange={(e) => update("prestador_email", e.target.value)} className="input-chat" />
            <Input placeholder="Endereço" value={form.prestador_endereco} onChange={(e) => update("prestador_endereco", e.target.value)} className="input-chat" />
            <Input placeholder="Municipio" value={form.prestador_municipio} onChange={(e) => update("prestador_municipio", e.target.value)} className="input-chat" />
            <Input placeholder="UF" value={form.prestador_uf} onChange={(e) => update("prestador_uf", e.target.value)} className="input-chat" />
            <Input placeholder="CEP" value={form.prestador_cep} onChange={(e) => update("prestador_cep", e.target.value)} className="input-chat" />
          </CardContent>
        </Card>

        {/* Tomador */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base">Tomador</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="CPF/CNPJ *" value={form.tomador_cpf_cnpj} onChange={(e) => update("tomador_cpf_cnpj", e.target.value)} className="input-chat" />
            <Input placeholder="Razão Social *" value={form.tomador_razao_social} onChange={(e) => update("tomador_razao_social", e.target.value)} className="input-chat" />
            <Input placeholder="Email" value={form.tomador_email} onChange={(e) => update("tomador_email", e.target.value)} className="input-chat" />
            <Input placeholder="Endereço" value={form.tomador_endereco} onChange={(e) => update("tomador_endereco", e.target.value)} className="input-chat" />
            <Input placeholder="Município" value={form.tomador_municipio} onChange={(e) => update("tomador_municipio", e.target.value)} className="input-chat" />
            <div className="flex gap-2">
              <Input placeholder="UF" value={form.tomador_uf} onChange={(e) => update("tomador_uf", e.target.value)} className="input-chat w-20" />
              <Input placeholder="CEP" value={form.tomador_cep} onChange={(e) => update("tomador_cep", e.target.value)} className="input-chat flex-1" />
            </div>
          </CardContent>
        </Card>

        {/* Serviço */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base">Serviço</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Código do Serviço *" value={form.codigo_servico} onChange={(e) => update("codigo_servico", e.target.value)} className="input-chat" />
              <Input placeholder="Código Município" value={form.codigo_municipio} onChange={(e) => update("codigo_municipio", e.target.value)} className="input-chat" />
              <Input type="number" placeholder="Valor dos Serviços *" value={form.valor_servicos || ""} onChange={(e) => update("valor_servicos", parseFloat(e.target.value) || 0)} className="input-chat" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input type="number" placeholder="Deduções" value={form.valor_deducoes || ""} onChange={(e) => update("valor_deducoes", parseFloat(e.target.value) || 0)} className="input-chat" />
              <Input type="number" placeholder="Alíquota ISS (%)" value={form.aliquota_iss || ""} onChange={(e) => update("aliquota_iss", parseFloat(e.target.value) || 0)} className="input-chat" step="0.01" />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="iss_retido" checked={form.iss_retido} onChange={(e) => update("iss_retido", e.target.checked)} className="rounded" />
                <label htmlFor="iss_retido" className="text-sm">ISS Retido</label>
              </div>
            </div>
            <Textarea placeholder="Discriminação do Serviço *" value={form.discriminacao} onChange={(e) => update("discriminacao", e.target.value)} className="input-chat min-h-[100px]" />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Emitir NFS-e
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Event Timeline ─────────────────────────────────
function EventTimeline({ invoiceId }: { invoiceId: string }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["nfse-events", invoiceId],
    queryFn: () => fetchInvoiceEvents(invoiceId),
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Carregando eventos...</div>;
  if (events.length === 0) return <div className="text-sm text-muted-foreground p-4">Nenhum evento registrado.</div>;

  return (
    <div className="space-y-3 p-4">
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-3"
        >
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{event.event_type}</span>
              <Badge variant="outline" className="text-xs">{event.source}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(event.created_at).toLocaleString("pt-BR")}
            </p>
            {event.payload && Object.keys(event.payload).length > 0 && (
              <pre className="text-xs bg-muted/30 rounded p-2 mt-1 overflow-x-auto">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Invoice Detail ─────────────────────────────────
function InvoiceDetail({ invoice, onClose }: { invoice: NfseInvoice; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            NFS-e {invoice.numero_nfse || "#" + invoice.id.slice(0, 8)}
          </h2>
          <p className="text-sm text-muted-foreground">{invoice.tomador_razao_social}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="events" className="gap-1">
            <Activity className="w-3 h-3" /> Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">Prestador</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">CNPJ:</span> {invoice.prestador_cnpj}</p>
                <p><span className="text-muted-foreground">Razão Social:</span> {invoice.prestador_razao_social}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">Tomador</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">CPF/CNPJ:</span> {invoice.tomador_cpf_cnpj}</p>
                <p><span className="text-muted-foreground">Razão Social:</span> {invoice.tomador_razao_social}</p>
                {invoice.tomador_email && <p><span className="text-muted-foreground">Email:</span> {invoice.tomador_email}</p>}
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">Serviço</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Código:</span> {invoice.codigo_servico}</p>
                <p><span className="text-muted-foreground">Valor:</span> R$ {Number(invoice.valor_servicos).toFixed(2)}</p>
                <p><span className="text-muted-foreground">ISS:</span> R$ {Number(invoice.valor_iss || 0).toFixed(2)}</p>
                <p className="text-muted-foreground mt-2">{invoice.discriminacao}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">XMLs</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {invoice.xml_envio_url ? (
                  <a href={invoice.xml_envio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Download className="w-4 h-4" /> XML de Envio
                  </a>
                ) : <p className="text-sm text-muted-foreground">Sem XML de envio</p>}
                {invoice.xml_retorno_url ? (
                  <a href={invoice.xml_retorno_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Download className="w-4 h-4" /> XML de Retorno
                  </a>
                ) : <p className="text-sm text-muted-foreground">Sem XML de retorno</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card className="glass-card border-border/50">
            <EventTimeline invoiceId={invoice.id} />
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────
export default function NfsePage() {
  const [view, setView] = useState<"list" | "form" | "detail">("list");
  const [selectedInvoice, setSelectedInvoice] = useState<NfseInvoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["nfse-invoices"],
    queryFn: fetchInvoices,
    refetchInterval: 15000,
  });

  const openDetail = (inv: NfseInvoice) => {
    setSelectedInvoice(inv);
    setView("detail");
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <AnimatePresence mode="wait">
        {view === "form" ? (
          <ScrollArea className="flex-1" key="form">
            <InvoiceForm onClose={() => setView("list")} />
          </ScrollArea>
        ) : view === "detail" && selectedInvoice ? (
          <ScrollArea className="flex-1" key="detail">
            <InvoiceDetail invoice={selectedInvoice} onClose={() => setView("list")} />
          </ScrollArea>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Notas Fiscais de Serviço</h1>
                <p className="text-sm text-muted-foreground">Emissão e acompanhamento de NFS-e</p>
              </div>
              <Button onClick={() => setView("form")} className="gap-2">
                <Plus className="w-4 h-4" /> Nova NFS-e
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhuma NFS-e emitida</p>
                <p className="text-sm">Clique em "Nova NFS-e" para começar</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {invoices.map((inv, i) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className="glass-card border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(inv)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {inv.numero_nfse ? `NFS-e #${inv.numero_nfse}` : `Rascunho #${inv.id.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-muted-foreground">{inv.tomador_razao_social}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">R$ {Number(inv.valor_servicos).toFixed(2)}</span>
                            <StatusBadge status={inv.status} />
                            <span className="text-xs text-muted-foreground">
                              {new Date(inv.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
