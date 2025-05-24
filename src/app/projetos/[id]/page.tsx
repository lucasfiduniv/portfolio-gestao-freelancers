'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, Banknote, CalendarDays } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { formatCurrency, formatDate, formatHours } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceGenerator } from '@/components/invoices/InvoiceGenerator';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  
  const { projects, getProject, loadProjects } = useProjectStore();
  const { tasks, loadTasks } = useTaskStore();
  
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  
  useEffect(() => {
    if (projects.length === 0) {
      loadProjects();
    }
    if (tasks.length === 0) {
      loadTasks();
    }
  }, [projects.length, tasks.length, loadProjects, loadTasks]);
  
  const project = getProject(projectId);
  const projectTasks = tasks.filter(task => task.projectId === projectId);
  
  // Estatísticas para o projeto
  const totalTimeSpent = projectTasks.reduce((acc, task) => acc + task.timeSpent, 0);
  const completedTasks = projectTasks.filter(task => task.status === 'concluida').length;
  const pendingTasks = projectTasks.filter(task => task.status === 'pendente').length;
  const inProgressTasks = projectTasks.filter(task => task.status === 'em_andamento').length;
  
  // Valor estimado do projeto
  const estimatedValue = (totalTimeSpent / 60) * (project?.rate || 0);
  
  if (!project) {
    return (
      <PageContainer title="Projeto não encontrado" actions={
        <Button variant="outline" onClick={() => router.push('/projetos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Projetos
        </Button>
      }>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h2 className="mt-2 text-xl font-semibold">Projeto não encontrado</h2>
            <p className="mt-1 text-muted-foreground">
              O projeto que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => router.push('/projetos')} className="mt-4">
              Ver Todos os Projetos
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title={project.name} 
      description={`Cliente: ${project.clientName}`}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/projetos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button variant="outline" onClick={() => setEditProjectOpen(true)}>
            Editar Projeto
          </Button>
        </div>
      }
    >
      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Horas</p>
                <h3 className="text-2xl font-bold">{formatHours(totalTimeSpent)}</h3>
              </div>
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tarefas</p>
                <h3 className="text-2xl font-bold">{projectTasks.length}</h3>
                <div className="flex text-xs text-muted-foreground mt-1 gap-1">
                  <span className="text-yellow-500">{pendingTasks} pendentes</span>
                  <span>•</span>
                  <span className="text-blue-500">{inProgressTasks} em progresso</span>
                  <span>•</span>
                  <span className="text-green-500">{completedTasks} concluídas</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <h3 className="text-2xl font-bold">{formatCurrency(estimatedValue)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa: {formatCurrency(project.rate)}/h
                </p>
              </div>
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Banknote className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                <h3 className="text-2xl font-bold">{formatDate(project.createdAt)}</h3>
              </div>
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Project Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalhes do Projeto</CardTitle>
          <CardDescription>Descrição e informações do projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Descrição</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <h3 className="text-sm font-medium mb-1">Cliente</h3>
                <p className="text-muted-foreground">{project.clientName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Taxa Horária</h3>
                <p className="text-muted-foreground">{formatCurrency(project.rate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Última Atualização</h3>
                <p className="text-muted-foreground">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="invoice">Fatura</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
          <TaskBoard projectId={projectId} />
        </TabsContent>
        <TabsContent value="invoice" className="mt-6">
          <InvoiceGenerator projectId={projectId} />
        </TabsContent>
      </Tabs>
      
      <ProjectForm 
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        initialData={project}
      />
    </PageContainer>
  );
}