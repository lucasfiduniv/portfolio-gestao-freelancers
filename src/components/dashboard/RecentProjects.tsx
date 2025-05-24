import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';
import { useTaskStore } from '@/stores/taskStore';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface RecentProjectsProps {
  projects: Project[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const getTasksByProject = useTaskStore(state => state.getTasksByProject);
  
  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Projetos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.slice(0, 5).map((project) => {
              const tasks = getTasksByProject(project.id);
              const completedTasks = tasks.filter(task => task.status === 'concluida').length;
              const totalTasks = tasks.length;
              
              return (
                <div key={project.id} className="flex items-start justify-between">
                  <div>
                    <Link href={`/projetos/${project.id}`}>
                      <h3 className="text-base font-medium hover:underline cursor-pointer">
                        {project.name}
                      </h3>
                    </Link>
                    <div className="flex mt-1 text-xs text-muted-foreground">
                      <div className="pr-2 mr-2 border-r">
                        {formatDate(project.createdAt)}
                      </div>
                      <div>
                        {completedTasks}/{totalTasks} tarefas
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/projetos/${project.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum projeto encontrado</p>
              <Link href="/projetos">
                <Button variant="outline" size="sm" className="mt-2">
                  Criar meu primeiro projeto
                </Button>
              </Link>
            </div>
          )}
          
          {projects.length > 0 && (
            <div className="pt-2 mt-2 border-t">
              <Link href="/projetos">
                <Button variant="link" className="p-0">
                  Ver todos os projetos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}