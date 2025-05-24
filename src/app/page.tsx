// Fazemos os imports necessários
'use client';

import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProductivityChart } from '@/components/dashboard/ProductivityChart';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { RecentTasks } from '@/components/dashboard/RecentTasks';
import { SystemReset } from '@/components/dashboard/SystemReset';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { formatHours } from '@/lib/utils';
import { Clock, CheckCircle, ListChecks } from 'lucide-react';
import { WeeklyData } from '@/types';

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);

  // Obtemos projetos e tarefas dos stores
  const { projects, loadProjects } = useProjectStore();
  const { tasks, loadTasks } = useTaskStore();

  // Ao carregar o componente, carregamos os dados do localStorage
  useEffect(() => {
    loadProjects();
    loadTasks();
    setIsClient(true);
  }, [loadProjects, loadTasks]);

  // Calculamos estatísticas para o dashboard
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'concluida').length;
  const totalTimeSpentMinutes = tasks.reduce((acc, task) => acc + task.timeSpent, 0);

  // Preparamos os dados para o gráfico
  const weeklyData: WeeklyData[] = [];

  if (isClient) {
    const today = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Criar dados dos últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      // Filtrar tarefas deste dia
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.updatedAt);
        return taskDate >= date && taskDate < nextDate;
      });

      // Somar tempo gasto
      const timeSpent = dayTasks.reduce((acc, task) => acc + task.timeSpent, 0);

      weeklyData.push({
        day: dayNames[date.getDay()],
        hours: timeSpent
      });
    }
  }

  return (
    <PageContainer
      title="Dashboard"
      description="Visão geral do seu trabalho"
      actions={<SystemReset />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Tempo Total Trabalhado"
          value={formatHours(totalTimeSpentMinutes)}
          icon={<Clock className="h-5 w-5" />}
          description={`Em ${totalProjects} projetos ativos`}
          trend={{ value: 12, isPositive: true }}
        />

        <StatsCard
          title="Tarefas Concluídas"
          value={completedTasks}
          icon={<CheckCircle className="h-5 w-5" />}
          description={`De um total de ${totalTasks} tarefas`}
          trend={{ value: 5, isPositive: true }}
        />

        <StatsCard
          title="Projetos Ativos"
          value={totalProjects}
          icon={<ListChecks className="h-5 w-5" />}
          description="Projetos em andamento"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <ProductivityChart data={weeklyData} />
        <RecentProjects projects={projects.slice(0, 5)} />
        <RecentTasks tasks={tasks.slice(0, 5)} />
      </div>
    </PageContainer>
  );
}