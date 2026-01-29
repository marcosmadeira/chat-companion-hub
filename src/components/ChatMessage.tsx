import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, Download, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-4 px-4 py-6",
        isUser ? "bg-transparent" : "bg-secondary/30"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isUser ? "bg-primary/20" : "bg-accent/20"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-accent" />
        )}
      </div>

      <div className="flex-1 space-y-3">
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="text-sm mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>,
              pre: ({ children }) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs my-2">{children}</pre>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Uploaded Files */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ))}
          </div>
        )}

        {/* XML Results */}
        {message.xmlResults && message.xmlResults.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">
              Arquivos gerados:
            </p>
            <div className="flex flex-wrap gap-2">
              {message.xmlResults.map((result) => (
                <Button
                  key={result.id}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-success/10 border-success/30 text-success hover:bg-success/20"
                  onClick={() => {
                    // TODO: Integrate with real download API
                    console.log('Download:', result.downloadUrl);
                  }}
                >
                  <Download className="w-4 h-4" />
                  {result.fileName}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  );
}
