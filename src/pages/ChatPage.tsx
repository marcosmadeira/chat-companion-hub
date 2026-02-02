import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const { currentConversation, isProcessing, sendMessage, createConversation } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!currentConversation) {
      createConversation();
    }
    await sendMessage(content, files);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        {currentConversation && currentConversation.messages.length > 0 ? (
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className="max-w-3xl mx-auto">
              {currentConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Processing Indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 px-4 py-6 bg-secondary/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Processando...
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquarePlus className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">
                Bem-vindo ao Alivee ChatBot
              </h2>
              <p className="text-muted-foreground mb-6">
                Envie para processamento suas NFSe em PDF. Nossa IA irá analisar e converter
                seus documentos em formato XML de forma inteligente pronta para importar no seu sistema fiscal.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  'Upload de múltiplos PDFs',
                  'Conversão para XML',
                  'Download dos resultados',
                  'Histórico de conversas',
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
}
