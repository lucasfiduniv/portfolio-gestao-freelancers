'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { formatCurrency, formatHours } from '@/lib/utils';
import { Project, Task, TaskStatus } from '@/types';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ReportsPage() {
  const { projects, loadProjects } = useProjectStore();
  const { tasks, loadTasks } = useTaskStore();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    loadProjects();
    loadTasks();
    setIsClient(true);
  }, [loadProjects, loadTasks]);

  // Filtragem de dados baseada nas seleções
  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(task => task.projectId === selectedProject);

  // Cálculos de estatísticas
  const totalTimeSpent = filteredTasks.reduce((acc, task) => acc + task.timeSpent, 0);
  const completedTasks = filteredTasks.filter(task => task.status === 'concluida').length;
  const inProgressTasks = filteredTasks.filter(task => task.status === 'em_andamento').length;
  const pendingTasks = filteredTasks.filter(task => task.status === 'pendente').length;
  
  // Valor total baseado nas tarefas filtradas
  const totalValue = filteredTasks.reduce((acc, task) => {
    const project = projects.find(p => p.id === task.projectId);
    if (!project) return acc;
    return acc + ((task.timeSpent / 60) * project.rate);
  }, 0);

  // Distribuição de status
  const statusDistribution = [
    { status: 'Pendentes', count: pendingTasks, color: '#EAB308' },
    { status: 'Em Andamento', count: inProgressTasks, color: '#3B82F6' },
    { status: 'Concluídas', count: completedTasks, color: '#22C55E' },
  ];

  // Distribuição de tempo por projeto
  const projectTimeDistribution = projects.map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const timeSpent = projectTasks.reduce((acc, task) => acc + task.timeSpent, 0);
    return {
      project: project.name,
      timeSpent,
      color: '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
    };
  }).filter(item => item.timeSpent > 0);

  // Eficiência de tarefas (tempo real vs estimado)
  const taskEfficiency = filteredTasks
    .filter(task => task.status === 'concluida' && task.timeEstimated > 0)
    .map(task => {
      const project = projects.find(p => p.id === task.projectId);
      const efficiency = (task.timeEstimated / task.timeSpent) * 100;
      return {
        task: task.name,
        project: project?.name || 'Desconhecido',
        efficiency: efficiency > 100 ? 100 : efficiency, // Cap at 100%
        estimated: task.timeEstimated,
        spent: task.timeSpent
      };
    });

  return (
    <PageContainer title="Relatórios" description="Analise o desempenho dos seus projetos e tarefas">
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione os filtros para visualizar os relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projeto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                  <SelectItem value="all">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Horas Trabalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} tarefas concluídas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em {totalTimeSpent} minutos trabalhados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eficiência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskEfficiency.length > 0
                ? `${Math.round(taskEfficiency.reduce((acc, task) => acc + task.efficiency, 0) / taskEfficiency.length)}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em {taskEfficiency.length} tarefas concluídas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>Distribuição de tarefas por status</CardDescription>
          </CardHeader>
          <CardContent>
            {isClient && statusDistribution.some(item => item.count > 0) ? (
              <div style={{ height: 300 }}>
                <Chart
                  options={{
                    labels: statusDistribution.map(item => item.status),
                    colors: statusDistribution.map(item => item.color),
                    legend: {
                      position: 'bottom'
                    },
                    responsive: [{
                      breakpoint: 480,
                      options: {
                        chart: {
                          width: 200
                        },
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }]
                  }}
                  series={statusDistribution.map(item => item.count)}
                  type="pie"
                  width="100%"
                  height="100%"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Project Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo por Projeto</CardTitle>
            <CardDescription>Distribuição de horas por projeto</CardDescription>
          </CardHeader>
          <CardContent>
            {isClient && projectTimeDistribution.length > 0 ? (
              <div style={{ height: 300 }}>
                <Chart
                  options={{
                    labels: projectTimeDistribution.map(item => item.project),
                    legend: {
                      position: 'bottom'
                    },
                    tooltip: {
                      y: {
                        formatter: function(value) {
                          const hours = Math.floor(value / 60);
                          const minutes = value % 60;
                          return `${hours}h ${minutes}min`;
                        }
                      }
                    }
                  }}
                  series={projectTimeDistribution.map(item => item.timeSpent)}
                  type="donut"
                  width="100%"
                  height="100%"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Eficiência de Tarefas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Eficiência de Tarefas</CardTitle>
          <CardDescription>Comparação entre tempo estimado e tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          {isClient && taskEfficiency.length > 0 ? (
            <div style={{ height: 300 }}>
              <Chart
                options={{
                  chart: {
                    type: 'bar',
                    stacked: true
                  },
                  plotOptions: {
                    bar: {
                      horizontal: true
                    }
                  },
                  colors: ['#22C55E', '#3B82F6'],
                  dataLabels: {
                    enabled: false
                  },
                  xaxis: {
                    categories: taskEfficiency.map(item => item.task),
                    labels: {
                      formatter: function(value) {
                        const hours = Math.floor(Number(value) / 60);
                        const minutes = Number(value) % 60;
                        return `${hours}h ${minutes}min`;
                      }
                    }
                  },
                  yaxis: {
                    title: {
                      text: 'Tarefas'
                    }
                  },
                  tooltip: {
                    y: {
                      formatter: function(value) {
                        const hours = Math.floor(value / 60);
                        const minutes = value % 60;
                        return `${hours}h ${minutes}min`;
                      }
                    }
                  },
                  legend: {
                    position: 'top'
                  }
                }}
                series={[
                  {
                    name: 'Tempo Estimado',
                    data: taskEfficiency.map(item => item.estimated)
                  },
                  {
                    name: 'Tempo Real',
                    data: taskEfficiency.map(item => item.spent)
                  }
                ]}
                type="bar"
                height="100%"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Sem dados disponíveis. Complete tarefas para ver a eficiência.
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}