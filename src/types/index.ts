export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: UploadedFile[];
  xmlResults?: XmlResult[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
}

export interface XmlResult {
  id: string;
  fileName: string;
  downloadUrl: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  filesProcessed: number;
  xmlGenerated: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalConversations: number;
  filesProcessed: number;
  xmlGenerated: number;
  activeProjects: number;
}
