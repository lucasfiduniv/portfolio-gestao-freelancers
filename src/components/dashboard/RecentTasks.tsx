import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import { formatDate } from '@/lib/utils';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { BarChart, Circle, Clock, CheckCircle } from 'lucide-react';

interface RecentTasksProps {
  tasks: Task[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  const getProject = useProjectStore(state => state.getProject);
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pendente':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'concluida':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'pendente':
        return 'Pendente';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      default:
        return status;
    }
  };

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Tarefas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.slice(0, 5).map((task) => {
              const project = getProject(task.projectId);
              
              return (
                <div key={task.id} className="flex items-start justify-between">
                  <div>
                    <Link href={`/projetos/${task.projectId}`}>
                      <h3 className="text-base font-medium hover:underline cursor-pointer">
                        {task.name}
                      </h3>
                    </Link>
                    <div className="flex mt-1 text-xs">
                      <div className="pr-2 mr-2 border-r text-muted-foreground">
                        {project?.name || "Projeto desconhecido"}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{getStatusText(task.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
              <Link href="/projetos">
                <Button variant="outline" size="sm" className="mt-2">
                  Criar minha primeira tarefa
                </Button>
              </Link>
            </div>
          )}
          
          {tasks.length > 0 && (
            <div className="pt-2 mt-2 border-t">
              <Link href="/relatorios">
                <Button variant="link" className="p-0 flex items-center">
                  <span>Ver relatório completo</span>
                  <BarChart className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}