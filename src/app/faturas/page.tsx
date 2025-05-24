'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { formatCurrency, formatHours, formatDate } from '@/lib/utils';
import { FileDown, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function InvoicesPage() {
  const { projects, loadProjects } = useProjectStore();
  const { tasks, loadTasks } = useTaskStore();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  useEffect(() => {
    loadProjects();
    loadTasks();
  }, [loadProjects, loadTasks]);
  
  const toggleExpand = (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };
  
  // Calcular valor total por projeto
  const projectsWithValue = projects.map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const totalMinutes = projectTasks.reduce((acc, task) => acc + task.timeSpent, 0);
    const totalValue = (totalMinutes / 60) * project.rate;
    const completedTasks = projectTasks.filter(task => task.status === 'concluida').length;
    
    return {
      ...project,
      totalMinutes,
      totalValue,
      taskCount: projectTasks.length,
      completedTasks
    };
  });
  
  // Ordenar projetos por valor (do maior para o menor)
  const sortedProjects = [...projectsWithValue].sort((a, b) => b.totalValue - a.totalValue);
  
  return (
    <PageContainer 
      title="Faturas" 
      description="Gere e gerencie faturas para seus projetos"
    >
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Projetos para Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedProjects.length > 0 ? (
              sortedProjects.map(project => (
                <div key={project.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 bg-secondary/30 cursor-pointer"
                    onClick={() => toggleExpand(project.id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">Cliente: {project.clientName}</p>
                    </div>
                    
                    <div className="text-right mr-4">
                      <div className="font-semibold">{formatCurrency(project.totalValue)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatHours(project.totalMinutes)}
                      </div>
                    </div>
                    
                    <div>
                      {expandedProject === project.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {expandedProject === project.id && (
                    <div className="p-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Taxa Horária</h4>
                          <div>{formatCurrency(project.rate)}/h</div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Tempo Total</h4>
                          <div>{formatHours(project.totalMinutes)}</div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Tarefas</h4>
                          <div>{project.completedTasks}/{project.taskCount}</div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Criado em</h4>
                          <div>{formatDate(project.createdAt)}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Link href={`/projetos/${project.id}?tab=invoice`}>
                          <Button>
                            <FileDown className="h-4 w-4 mr-2" />
                            Gerar Fatura
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum projeto encontrado para faturamento</p>
                <Link href="/projetos">
                  <Button variant="outline" size="sm" className="mt-2">
                    Criar meu primeiro projeto
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Total Summary */}
          {sortedProjects.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div className="font-medium">Total a Receber</div>
                <div className="text-xl font-bold">
                  {formatCurrency(sortedProjects.reduce((acc, project) => acc + project.totalValue, 0))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatHours(sortedProjects.reduce((acc, project) => acc + project.totalMinutes, 0))} trabalhadas em {sortedProjects.length} projetos
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}