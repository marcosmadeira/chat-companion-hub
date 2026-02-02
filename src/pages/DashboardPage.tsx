import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { DashboardStats, Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  FileText,
  FileCode,
  FolderOpen,
  Plus,
  Play,
  Pause,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { conversations } = useChat();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Load projects from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`projects_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProjects(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        })));
      }
    }
  }, [user]);

  // Save projects to localStorage
  useEffect(() => {
    if (user && projects.length > 0) {
      localStorage.setItem(`projects_${user.id}`, JSON.stringify(projects));
    }
  }, [projects, user]);

  const stats: DashboardStats = {
    totalConversations: conversations.length,
    filesProcessed: conversations.reduce((acc, c) =>
      acc + c.messages.filter(m => m.files?.length).reduce((a, m) => a + (m.files?.length || 0), 0), 0
    ),
    xmlGenerated: conversations.reduce((acc, c) =>
      acc + c.messages.filter(m => m.xmlResults?.length).reduce((a, m) => a + (m.xmlResults?.length || 0), 0), 0
    ),
    activeProjects: projects.filter(p => p.status === 'active').length,
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: newProjectName,
      description: newProjectDesc,
      status: 'active',
      filesProcessed: 0,
      xmlGenerated: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects(prev => [newProject, ...prev]);
    setNewProjectName('');
    setNewProjectDesc('');
    setIsDialogOpen(false);
  };

  const toggleProjectStatus = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'paused' : p.status === 'paused' ? 'active' : p.status;
        return { ...p, status: nextStatus, updatedAt: new Date() };
      }
      return p;
    }));
  };

  const statCards = [
    { label: 'Conversas', value: stats.totalConversations, icon: MessageSquare, color: 'text-primary' },
    { label: 'PDFs Processados', value: stats.filesProcessed, icon: FileText, color: 'text-info' },
    { label: 'XMLs Gerados', value: stats.xmlGenerated, icon: FileCode, color: 'text-success' },
    { label: 'Projetos Ativos', value: stats.activeProjects, icon: FolderOpen, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
          >
            Dashboard
          </motion.h1>
          <p className="text-muted-foreground">
            Olá, {user?.name}! Aqui está um resumo das suas atividades.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Projects Section */}
        {/* <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Meus Projetos
              </CardTitle>
              <CardDescription>
                Gerencie seus projetos de processamento
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect">
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Nome do Projeto</Label>
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Ex: Análise de Contratos Q1"
                      className="input-chat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Textarea
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Descreva o objetivo do projeto..."
                      className="input-chat resize-none"
                      rows={3}
                    />
                  </div>
                  <Button onClick={createProject} className="w-full">
                    Criar Projeto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{project.filesProcessed} PDFs</span>
                          <span>•</span>
                          <span>{project.xmlGenerated} XMLs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          project.status === 'active' ? 'default' :
                          project.status === 'completed' ? 'secondary' : 'outline'
                        }
                        className={
                          project.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                          project.status === 'completed' ? 'bg-info/20 text-info border-info/30' :
                          'bg-warning/20 text-warning border-warning/30'
                        }
                      >
                        {project.status === 'active' ? 'Ativo' :
                         project.status === 'completed' ? 'Concluído' : 'Pausado'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleProjectStatus(project.id)}
                      >
                        {project.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : project.status === 'paused' ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum projeto ainda</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie seu primeiro projeto para organizar seus processamentos
                </p>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
