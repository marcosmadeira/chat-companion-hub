import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  isProcessing: boolean;
}

export default function ChatInput({ onSend, isProcessing }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    noClick: true,
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    },
  });

  const handleSubmit = () => {
    if ((!message.trim() && files.length === 0) || isProcessing) return;
    onSend(message, files.length > 0 ? files : undefined);
    setMessage('');
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border bg-background/50 backdrop-blur-sm p-4">
      <div
        {...getRootProps()}
        className={cn(
          "max-w-3xl mx-auto relative",
          isDragActive && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center z-10"
            >
              <p className="text-primary font-medium">Solte os arquivos PDF aqui</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Preview */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 hover:bg-destructive/20"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="flex items-end gap-2 bg-input rounded-xl border border-border focus-within:border-primary transition-colors">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mb-2 ml-2 text-muted-foreground hover:text-foreground"
            onClick={open}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Envie uma mensagem ou arraste PDFs aqui..."
            className="flex-1 border-0 bg-transparent resize-none min-h-[44px] max-h-[200px] py-3 focus-visible:ring-0"
            rows={1}
          />

          <Button
            type="button"
            size="icon"
            className={cn(
              "mb-2 mr-2 transition-all",
              (message.trim() || files.length > 0) && !isProcessing
                ? "bg-primary text-primary-foreground glow-effect"
                : "bg-muted text-muted-foreground"
            )}
            disabled={(!message.trim() && files.length === 0) || isProcessing}
            onClick={handleSubmit}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Arraste arquivos PDF ou use o clipe para anexar
        </p>
      </div>
    </div>
  );
}
