import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { SupportTicket } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Ticket,
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bot,
  User,
  Plus,
  Paperclip,
  X,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface HelpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Help chat state
  const [helpMessages, setHelpMessages] = useState<HelpMessage[]>([]);
  const [helpInput, setHelpInput] = useState('');
  const [isHelpLoading, setIsHelpLoading] = useState(false);

  // Load tickets from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`tickets_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTickets(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        })));
      }

      const storedHelp = localStorage.getItem(`help_messages_${user.id}`);
      if (storedHelp) {
        const parsed = JSON.parse(storedHelp);
        setHelpMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      }
    }
  }, [user]);

  // Save tickets to localStorage
  useEffect(() => {
    if (user && tickets.length > 0) {
      localStorage.setItem(`tickets_${user.id}`, JSON.stringify(tickets));
    }
  }, [tickets, user]);

  // Save help messages
  useEffect(() => {
    if (user && helpMessages.length > 0) {
      localStorage.setItem(`help_messages_${user.id}`, JSON.stringify(helpMessages));
    }
  }, [helpMessages, user]);

  const createTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketDesc.trim()) return;

    setIsSubmitting(true);

    try {
      const ticketData = {
        subject: newTicketSubject,
        description: newTicketDesc,
        priority: newTicketPriority,
      };

      const result = await apiService.createTicket(ticketData);

      const newTicket: SupportTicket = {
        id: result.id || crypto.randomUUID(),
        subject: newTicketSubject,
        description: newTicketDesc,
        status: 'open',
        priority: newTicketPriority,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTickets(prev => [newTicket, ...prev]);
      setNewTicketSubject('');
      setNewTicketDesc('');
      setNewTicketPriority('medium');
      setFiles([]);
      toast.success("Ticket criado com sucesso! Um e-mail de confirmação foi enviado.");

    } catch (error: any) {
      console.error("Erro ao criar ticket:", error);
      toast.error(error.message || "Erro ao criar ticket. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendHelpMessage = async () => {
    if (!helpInput.trim() || isHelpLoading) return;

    const userMessage: HelpMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: helpInput,
      timestamp: new Date(),
    };

    setHelpMessages(prev => [...prev, userMessage]);
    setHelpInput('');
    setIsHelpLoading(true);

    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const assistantMessage: HelpMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: getHelpResponse(userMessage.content),
      timestamp: new Date(),
    };

    setHelpMessages(prev => [...prev, assistantMessage]);
    setIsHelpLoading(false);
  };

  const getHelpResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('upload') || q.includes('pdf')) {
      return 'Para fazer upload de PDFs, vá até o Chat e arraste os arquivos para a área de entrada ou clique no ícone de clipe. Você pode enviar múltiplos arquivos de uma vez!';
    }
    if (q.includes('xml') || q.includes('download')) {
      return 'Após o processamento, os arquivos XML aparecerão na resposta do chat com botões de download. Clique neles para baixar os resultados.';
    }
    if (q.includes('projeto')) {
      return 'Você pode criar projetos no Dashboard para organizar seus processamentos. Cada projeto pode ter múltiplos PDFs e XMLs associados.';
    }
    if (q.includes('status') || q.includes('processamento')) {
      return 'O status do processamento é exibido em tempo real no chat. Você verá indicadores visuais enquanto seus arquivos são processados.';
    }
    return 'Obrigado pela sua pergunta! Nossa equipe irá analisar e responder em breve. Enquanto isso, você pode consultar nossa documentação ou abrir um ticket de suporte para casos mais complexos.';
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-warning/20 text-warning border-warning/30';
      case 'in_progress': return 'bg-info/20 text-info border-info/30';
      case 'resolved': return 'bg-success/20 text-success border-success/30';
      case 'closed': return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'low': return 'bg-muted text-muted-foreground';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Suporte</h1>
          <p className="text-muted-foreground">
            Tire suas dúvidas ou abra um chamado para nossa equipe
          </p>
        </motion.div>

        <Tabs defaultValue="help" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="help" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat de Ajuda
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <Ticket className="w-4 h-4" />
              Meus Tickets
            </TabsTrigger>
          </TabsList>

          {/* Help Chat Tab */}
          <TabsContent value="help">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Chat de Ajuda</CardTitle>
                <CardDescription>
                  Pergunte sobre o produto, funcionalidades ou status de processamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    {helpMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Como posso ajudar?</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Pergunte sobre upload de PDFs, download de XMLs, projetos ou qualquer funcionalidade
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {helpMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                          >
                            {msg.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-accent" />
                              </div>
                            )}
                            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            {msg.role === 'user' && (
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {isHelpLoading && (
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-accent animate-pulse" />
                            </div>
                            <div className="chat-bubble chat-bubble-assistant">
                              <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-primary"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="flex gap-2 mt-4">
                    <Input
                      value={helpInput}
                      onChange={(e) => setHelpInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendHelpMessage()}
                      placeholder="Digite sua pergunta..."
                      className="input-chat"
                    />
                    <Button onClick={sendHelpMessage} disabled={!helpInput.trim() || isHelpLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {/* New Ticket Form */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Abrir Novo Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assunto</Label>
                    <Input
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="Resumo do problema"
                      className="input-chat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={newTicketPriority}
                      onValueChange={(v: 'low' | 'medium' | 'high') => setNewTicketPriority(v)}
                    >
                      <SelectTrigger className="input-chat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newTicketDesc}
                    onChange={(e) => setNewTicketDesc(e.target.value)}
                    placeholder="Descreva seu problema em detalhes..."
                    className="input-chat resize-none"
                    rows={4}
                  />
                </div>

                {/* File Upload UI */}
                <div className="space-y-2">
                  <Label>Anexos</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded text-sm group">
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="ticket-files"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="ticket-files"
                        className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline"
                      >
                        <Paperclip className="w-4 h-4" />
                        Anexar arquivos
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={createTicket}
                  disabled={(!newTicketSubject.trim() || !newTicketDesc.trim()) && files.length === 0 || isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Ticket
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Histórico de Tickets</CardTitle>
                <CardDescription>
                  Acompanhe o status dos seus chamados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tickets.length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {ticket.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Aberto em {ticket.createdAt.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1.5">
                                {ticket.status === 'open' ? 'Aberto' :
                                  ticket.status === 'in_progress' ? 'Em andamento' :
                                    ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                              </span>
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                              {ticket.priority === 'low' ? 'Baixa' :
                                ticket.priority === 'medium' ? 'Média' : 'Alta'}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Nenhum ticket aberto</h3>
                    <p className="text-sm text-muted-foreground">
                      Seus chamados de suporte aparecerão aqui
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
