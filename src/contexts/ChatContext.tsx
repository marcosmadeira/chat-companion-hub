import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, UploadedFile, XmlResult } from '@/types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isProcessing: boolean;
  createConversation: () => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
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
      title: 'Nova conversa',
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

  const sendMessage = async (content: string, files?: File[]) => {
    if (!currentConversation) return;

    setIsProcessing(true);

    // Create uploaded files array
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
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date(),
      title: currentConversation.messages.length === 0 ? content.slice(0, 50) : currentConversation.title,
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev => 
      prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );

    // Simulate API processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create mock XML results if files were uploaded
    const xmlResults: XmlResult[] = files?.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name.replace('.pdf', '.xml'),
      downloadUrl: `#download-${crypto.randomUUID()}`,
      createdAt: new Date(),
    })) || [];

    // Add assistant response
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: files && files.length > 0
        ? `✅ Processamento concluído! ${files.length} arquivo(s) PDF foram processados com sucesso. Os arquivos XML estão disponíveis para download abaixo.`
        : 'Olá! Como posso ajudá-lo hoje? Você pode enviar arquivos PDF para processamento ou fazer perguntas.',
      timestamp: new Date(),
      xmlResults: xmlResults.length > 0 ? xmlResults : undefined,
    };

    const finalConversation = {
      ...updatedConversation,
      messages: [...updatedConversation.messages, assistantMessage],
      updatedAt: new Date(),
    };

    setCurrentConversation(finalConversation);
    setConversations(prev => 
      prev.map(c => c.id === finalConversation.id ? finalConversation : c)
    );

    setIsProcessing(false);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      isProcessing,
      createConversation,
      selectConversation,
      deleteConversation,
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
