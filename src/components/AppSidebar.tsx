import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  LayoutDashboard,
  HeadphonesIcon,
  Plus,
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pencil,
  Check,
  X,
  FileText,
} from 'lucide-react';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { conversations, currentConversation, createConversation, selectConversation, deleteConversation, renameConversation } = useChat();
  const location = useLocation();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const navItems = [
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/nfse', icon: FileText, label: 'NFS-e' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/support', icon: HeadphonesIcon, label: 'Suporte' },
  ];

  const startEditing = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (editTitle.trim()) {
        renameConversation(id, editTitle.trim());
      }
      setEditingId(null);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelEditing();
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ duration: 0.2 }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold gradient-text">Alivee ChatBot</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={createConversation}
          className={cn(
            "w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20",
            isCollapsed && "justify-center px-2"
          )}
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>Novo Chat</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Conversation History */}
      {!isCollapsed && location.pathname === '/chat' && (
        <div className="flex-1 px-3 py-2 overflow-hidden">
          <p className="text-xs text-muted-foreground px-3 mb-2 uppercase tracking-wider">
            Histórico
          </p>
          <ScrollArea className="h-full">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-colors",
                  currentConversation?.id === conv.id
                    ? "bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/50"
                )}
                onClick={() => selectConversation(conv.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />

                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, conv.id)}
                        className="h-7 text-xs px-2 py-1"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:text-primary"
                        onClick={(e) => handleRename(e, conv.id)}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:text-destructive"
                        onClick={(e) => cancelEditing(e)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm truncate flex-1">{conv.title}</span>
                  )}
                </div>

                {!editingId && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 hover:text-primary"
                      onClick={(e) => startEditing(e, conv.id, conv.title)}
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </ScrollArea>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg",
          isCollapsed && "justify-center px-2"
        )}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
