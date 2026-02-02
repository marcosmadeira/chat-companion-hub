import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Conversation, Message, UploadedFile, XmlResult } from '@/types';
import { useAuth } from './AuthContext';
import { streamChat } from '@/lib/chat-stream';
import { toast } from 'sonner';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isProcessing: boolean;
  createConversation: () => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  renameConversation: (id: string, title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load conversations from localStorage for current user
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`conversations_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        })));
      }
    } else {
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [user]);

  // Save conversations to localStorage
  useEffect(() => {
    if (user && conversations.length > 0) {
      localStorage.setItem(`conversations_${user.id}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  const createConversation = (): Conversation => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'Novo Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    return newConversation;
  };

  const selectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversation(conv);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  const renameConversation = (id: string, title: string) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, title, updatedAt: new Date() } : c
    ));
    if (currentConversation?.id === id) {
      setCurrentConversation(prev => prev ? { ...prev, title, updatedAt: new Date() } : null);
    }
  };

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    let activeConversation = currentConversation;

    if (!activeConversation) {
      activeConversation = createConversation();
    }

    setIsProcessing(true);

    // Create uploaded files array for UI
    const uploadedFiles: UploadedFile[] = files?.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
      progress: 0,
    })) || [];

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      files: uploadedFiles,
    };

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
      updatedAt: new Date(),
      title: activeConversation.messages.length === 0 ? content.slice(0, 50) : activeConversation.title,
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev =>
      prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );

    // Helper to update specific file status in the UI
    const updateFileStatus = (status: 'uploading' | 'processing' | 'completed' | 'error') => {
      setCurrentConversation(prev => {
        if (!prev) return null;
        const updatedMessages = prev.messages.map(msg => {
          if (msg.id === userMessage.id && msg.files) {
            return {
              ...msg,
              files: msg.files.map(f => ({ ...f, status }))
            };
          }
          return msg;
        });
        return { ...prev, messages: updatedMessages };
      });
    };


    try {
      let assistantContent = "";
      let xmlResults: XmlResult[] = [];

      // SE TIVER ARQUIVOS: PROCESSA NO BACKEND
      if (files && files.length > 0) {
        import('@/services/api').then(async ({ apiService }) => {
          try {
            const result = await apiService.processFiles(files, (status) => {
              if (status === 'processing') updateFileStatus('processing');
            });

            updateFileStatus('completed');

            if (result.success) {
              assistantContent = result.message;
              if (result.downloadUrl) {
                xmlResults = [{
                  id: crypto.randomUUID(),
                  fileName: 'Processamento Completo (ZIP)',
                  downloadUrl: result.downloadUrl,
                  createdAt: new Date()
                }];
              }
            } else {
              assistantContent = "Ocorreu um problema no processamento mas não foi retornado erro explícito.";
            }
          } catch (error: any) {
            console.error("Backend processing error:", error);
            updateFileStatus('error');
            assistantContent = `Erro ao processar arquivos: ${error.message || 'Erro desconhecido'}`;
          } finally {
            // Add assistant message with results
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date(),
              xmlResults: xmlResults.length > 0 ? xmlResults : undefined,
            };

            setCurrentConversation(prev => {
              if (!prev) return null;
              return {
                ...prev,
                messages: [...prev.messages, assistantMessage],
                updatedAt: new Date()
              };
            });

            setConversations(prev =>
              prev.map(c => {
                if (c.id === updatedConversation.id) {
                  return { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date() };
                }
                return c;
              })
            );

            setIsProcessing(false);
          }
        });

        // SE FOR APENAS TEXTO: CHAT STREAM NORMAL
      } else {
        // Prepare messages for AI
        const messagesForAI = updatedConversation.messages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

        // Stream AI response
        const assistantMessageId = crypto.randomUUID();

        const updateAssistantMessage = (newContent: string) => {
          assistantContent += newContent;

          const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
            xmlResults: undefined,
          };

          setCurrentConversation(prev => {
            if (!prev) return prev;
            const existingAssistantIndex = prev.messages.findIndex(m => m.id === assistantMessageId);

            if (existingAssistantIndex >= 0) {
              const newMessages = [...prev.messages];
              newMessages[existingAssistantIndex] = assistantMessage;
              return { ...prev, messages: newMessages, updatedAt: new Date() };
            } else {
              return {
                ...prev,
                messages: [...prev.messages, assistantMessage],
                updatedAt: new Date(),
              };
            }
          });

          setConversations(prev =>
            prev.map(c => {
              if (c.id === updatedConversation.id) {
                const existingAssistantIndex = c.messages.findIndex(m => m.id === assistantMessageId);
                if (existingAssistantIndex >= 0) {
                  const newMessages = [...c.messages];
                  newMessages[existingAssistantIndex] = assistantMessage;
                  return { ...c, messages: newMessages, updatedAt: new Date() };
                } else {
                  return { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date() };
                }
              }
              return c;
            })
          );
        };

        await streamChat({
          messages: messagesForAI,
          onDelta: (chunk) => updateAssistantMessage(chunk),
          onDone: () => {
            setIsProcessing(false);
          },
          onError: (error) => {
            toast.error(error.message || "Erro ao processar mensagem");
            setIsProcessing(false);
          },
        });
      }

    } catch (error) {
      console.error("General error in sendMessage:", error);
      setIsProcessing(false);
    }

  }, [currentConversation, createConversation]);

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      isProcessing,
      createConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
      sendMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
